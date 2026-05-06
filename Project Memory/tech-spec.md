# PDF > Digital Form Transformer — Technical Specification

**Version:** 1.0
**Date:** 2026-05-02

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack in one repo; API routes keep secrets server-side; React Server Components for fast initial load; TypeScript-native |
| Language | TypeScript | End-to-end type safety between UI data model and JSON output schema — schema correctness is the core product output |
| Styling | Tailwind CSS | Utility-first, zero runtime, SF design tokens as theme extension |
| UI Components | shadcn/ui (Radix UI primitives) | Fully accessible headless components (WCAG requirement); no version lock-in |
| PDF Parsing | pdf-parse (server-side) | Extracts text without sending raw PDF to the client; no native binary dependency |
| LLM | Anthropic Claude API via `@anthropic-ai/sdk` | Tool use enforces structured JSON output; prompt caching reduces cost on re-extractions (primary cost risk) |
| File validation | file-type | Magic-byte MIME validation server-side; not spoofable via Content-Type header |
| Drag-to-reorder | @dnd-kit/sortable | Accessible drag-and-drop with keyboard fallback (WCAG requirement) |
| State | React `useReducer` (no external library) | Question list is a flat array; typed action creators are sufficient and testable |
| Testing | Vitest + React Testing Library + Playwright | Fast unit/integration; accessible component queries; real-browser E2E |
| Deployment | Vercel (default) or Google Cloud Run | Vercel has built-in env var secrets and Next.js edge network; Cloud Run if SF IT requires GCP |

---

## Architecture

### Overview

Stateless two-stage pipeline:

```
Browser (Client)
  │
  ├── FileUploader ──────────────────────────────────► POST /api/extract
  │   react-dropzone                                        │
  │   client-side validation                            Validate (MIME, size)
  │                                                         │
  │                                                     Parse PDF text
  │                                                     (pdf-parse)
  │                                                         │
  │                                                     Call Claude API
  │                                                     (tool use → Question[])
  │                                                         │
  │                                                     Discard PDF buffer
  │                                                         │
  │◄──────────────────────────────────────────────── { questions, warning? }
  │
  ├── useQuestionList (useReducer)
  │   LOAD / ADD / UPDATE_TEXT / UPDATE_TYPE /
  │   UPDATE_REQUIRED / DELETE / REORDER
  │
  ├── QuestionReviewTable (@dnd-kit/sortable)
  │   └── QuestionRow × N
  │         ├── inline text input
  │         ├── TypeDropdown (Radix Select)
  │         ├── required toggle
  │         └── delete button
  │
  ├── ActionBar
  │   ├── "Add Question"
  │   └── "Generate JSON" ──── getAdapter('sf-internal')
  │                                   .transform(questions, meta)
  │                                         │
  │                               downloadJson(FormExport, filename)
  │                               [client-side only — no server round-trip]
  └──
```

**Key architectural decision:** JSON generation is entirely client-side. After the API response, all state lives in the browser. The adapter's `transform()` function is a pure function — no network call, no secrets needed. This is faster, cheaper, and simpler to test.

---

## Extensibility — Adapter Pattern

The primary target is Fillout. Future platforms (Typeform, Google Forms, etc.) would require only a new file in `lib/adapters/`:

```typescript
// lib/adapters/types.ts
export interface FormMeta {
  sourceFilename: string;
  formTitle: string;
}

export interface FormAdapter {
  name: string;
  schemaVersion: string;
  transform(questions: Question[], meta: FormMeta): unknown;
  fileExtension: string;
  mimeType: string;
}
```

The adapter registry (`lib/adapters/index.ts`) maps platform names to adapter instances. The `ActionBar` can expose a platform selector dropdown that feeds into `getAdapter(platform).transform(...)` — zero changes to extraction or state logic.

---

## Data Models

### Internal question model (browser state)

```typescript
// lib/types.ts

export type QuestionType =
  | 'short_text' | 'long_text' | 'email' | 'phone' | 'address'
  | 'date' | 'number' | 'yes_no' | 'multiple_choice' | 'checkboxes'
  | 'dropdown' | 'file_upload' | 'signature' | 'statement';

export interface Question {
  id: string;           // UUID, client-generated
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];   // multiple_choice, checkboxes, dropdown, yes_no
  helpText?: string;
}

export interface ExtractionResult {
  questions: Question[];
  warning?: string;     // e.g. "Scanned PDF detected"
}
```

### Fillout export types (output schema)

```typescript
// lib/adapters/fillout-types.ts

export interface FilloutExport {
  ___FILLOUT_EXPORT_VERSION___: 2;
  template: FilloutTemplate;
  settings: Record<string, never>;
  theme: unknown;       // SF.gov theme object, hardcoded constant
  workflows: never[];
  type: 'form';
}

export interface FilloutTemplate {
  steps: Record<string, FilloutStep>;
  quizzes: { answers: Record<string, never>; enabled: false; settings: { disableShowingCorrectAnswers: false } };
  settings: Record<string, never>;
  firstStep: string;
  urlParams: never[];
  calculations: Record<string, never>;
  integrations: Record<string, never>;
  themePublicId: string;
}

export type FilloutStep = FilloutFormStep | FilloutEndingStep;

export interface FilloutFormStep {
  id: string;
  name: string;
  type: 'form';
  nextStep: { isFinal: false; branches: never[]; defaultNextStep: string };
  position: { x: number; y: number };
  template: { widgets: Record<string, FilloutWidget> };
}

export interface FilloutEndingStep {
  id: string;
  name: string;
  type: 'ending';
  nextStep: { isFinal: true; branches: never[]; defaultNextStep: '' };
  template: { type: 'thank_you'; widgets: Record<string, FilloutWidget>; confetti: boolean };
}

export interface FilloutWidget {
  id: string;
  name: string;
  type: FilloutWidgetType;
  position: { row: number; column?: number };
  template: Record<string, unknown>;
}

export type FilloutWidgetType =
  | 'ShortAnswer' | 'LongAnswer' | 'EmailInput' | 'PhoneNumber'
  | 'Address' | 'DatePicker' | 'NumberInput' | 'MultipleChoice'
  | 'Checkboxes' | 'Dropdown' | 'FileUpload' | 'Signature'
  | 'Paragraph' | 'Button' | 'ThankYou';

// Fillout's "pickerString" logic wrapper — used for labels, captions, options
export interface FilloutPickerString {
  logic: { value: string; references: Record<string, never> };
  expectedTypes: ['string'];
  ___LOGIC_TYPE___: 'pickerString';
}

// Fillout's boolean logic wrapper — used for required, condition
export interface FilloutBoolLogic {
  logic: boolean | { and: never[] };
  expectedTypes: ['boolean'];
  ___LOGIC_TYPE___: 'logic';
}
```

---

## Fillout Widget Type Mapping

Each `QuestionType` maps to a Fillout widget type. The adapter's job is this translation.

| Our `QuestionType` | Fillout `type` | Notes |
|---|---|---|
| `short_text` | `ShortAnswer` | |
| `long_text` | `LongAnswer` | |
| `email` | `EmailInput` | |
| `phone` | `PhoneNumber` | |
| `address` | `Address` | |
| `date` | `DatePicker` | |
| `number` | `NumberInput` | |
| `yes_no` | `MultipleChoice` | Adapter auto-generates `["Yes", "No"]` options |
| `multiple_choice` | `MultipleChoice` | Uses `options` from `Question` |
| `checkboxes` | `Checkboxes` | Uses `options` from `Question` |
| `dropdown` | `Dropdown` | Uses `options` from `Question` |
| `file_upload` | `FileUpload` | |
| `signature` | `Signature` | |
| `statement` | `Paragraph` | `text` becomes HTML `<p>` in `contents` |

---

## Target JSON Schema

The adapter produces a valid Fillout export JSON. The structure is: one form step (all questions on a single page), a Button widget at the last row, then a standard ending step. Users can split pages manually in Fillout's UI after import.

The SF.gov Fillout theme (from `Fillout JSON form questions.json`) is embedded in the output so imported forms automatically match the SF.gov brand.

Abbreviated example:

```json
{
  "___FILLOUT_EXPORT_VERSION___": 2,
  "template": {
    "firstStep": "page1",
    "themePublicId": "2fb883bc-94c7-4c86-b46b-fab8d7fd649b",
    "steps": {
      "page1": {
        "id": "page1",
        "name": "Page 1",
        "type": "form",
        "nextStep": { "isFinal": false, "branches": [], "defaultNextStep": "ending1" },
        "position": { "x": 0, "y": 0 },
        "template": {
          "widgets": {
            "w0": {
              "id": "w0",
              "name": "Full name field",
              "type": "ShortAnswer",
              "position": { "row": 0, "column": 0 },
              "template": {
                "label": {
                  "logic": { "value": "<p>What is your full name?</p>", "references": {} },
                  "expectedTypes": ["string"],
                  "___LOGIC_TYPE___": "pickerString"
                },
                "required": { "logic": true, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "caption": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "regex": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "inHeader": false, "alwaysHide": false, "showOrHide": "show_when",
                "validationPattern": "none",
                "placeholder": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "defaultValue": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "maxLength": { "logic": { "value": "", "references": {} }, "expectedTypes": ["number"], "___LOGIC_TYPE___": "pickerString" },
                "minLength": { "logic": { "value": "", "references": {} }, "expectedTypes": ["number"], "___LOGIC_TYPE___": "pickerString" },
                "condition": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "showOrHideCondition": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "validationErrorMessage": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" }
              }
            },
            "w1": {
              "id": "w1",
              "name": "Housing type field",
              "type": "MultipleChoice",
              "position": { "row": 1, "column": 0 },
              "template": {
                "label": {
                  "logic": { "value": "<p>What type of housing assistance are you seeking?</p>", "references": {} },
                  "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString"
                },
                "required": { "logic": true, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "options": {
                  "staticOptions": [
                    {
                      "id": "opt0",
                      "label": { "logic": { "value": "Emergency shelter", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                      "value": { "logic": { "value": "Emergency shelter", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" }
                    }
                  ]
                },
                "theme": "standard", "layout": "single_column",
                "caption": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "inHeader": false, "alwaysHide": false, "showOrHide": "show_when",
                "optionsToShow": [], "optionsMappings": false, "randomizeOptionsOrder": false, "validationPattern": "none",
                "regex": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "maxLength": { "logic": { "value": "", "references": {} }, "expectedTypes": ["number"], "___LOGIC_TYPE___": "pickerString" },
                "minLength": { "logic": { "value": "", "references": {} }, "expectedTypes": ["number"], "___LOGIC_TYPE___": "pickerString" },
                "defaultValue": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string", "null"], "___LOGIC_TYPE___": "pickerString" },
                "condition": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "showOrHideCondition": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "validationErrorMessage": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" }
              }
            },
            "btn0": {
              "id": "btn0",
              "name": "Next button",
              "type": "Button",
              "position": { "row": 2, "column": 0 },
              "template": {
                "text": { "logic": { "value": "" , "references": {} }, "___LOGIC_TYPE___": "pickerString" },
                "disabled": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" },
                "inHeader": false, "alignment": "left", "alwaysHide": false, "showOrHide": "show_when", "showBackButton": true,
                "nextStep": { "isFinal": false, "branches": [], "defaultNextStep": "ending1" },
                "showOrHideCondition": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" }
              }
            }
          }
        }
      },
      "ending1": {
        "id": "ending1",
        "name": "Ending",
        "type": "ending",
        "nextStep": { "isFinal": true, "branches": [], "defaultNextStep": "" },
        "template": {
          "type": "thank_you",
          "confetti": true,
          "widgets": {
            "ty0": {
              "id": "ty0", "name": "thankYou1", "type": "ThankYou",
              "position": { "row": 1 },
              "template": {
                "alwaysHide": false, "showOrHide": "show_when", "hideBranding": false,
                "showQuizScore": false, "showCheckoutDetails": false, "showSchedulingDetails": false,
                "richTitleText": { "logic": { "value": "Thank you", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "richSubtitleText": { "logic": { "value": "", "references": {} }, "expectedTypes": ["string"], "___LOGIC_TYPE___": "pickerString" },
                "showOrHideCondition": { "logic": { "and": [] }, "expectedTypes": ["boolean"], "___LOGIC_TYPE___": "logic" }
              }
            }
          }
        }
      }
    },
    "quizzes": { "answers": {}, "enabled": false, "settings": { "disableShowingCorrectAnswers": false } },
    "settings": {}, "urlParams": [], "calculations": {}, "integrations": {}
  },
  "settings": {},
  "theme": { "...SF.gov theme object..." },
  "workflows": [],
  "type": "form"
}
```

**Key constraints the adapter must enforce:**
- Every widget's `label` / `caption` / `placeholder` etc. must be wrapped in the `FilloutPickerString` structure with `logic.value`, `expectedTypes: ["string"]`, `___LOGIC_TYPE___: "pickerString"`
- `required` and `condition` fields use the `FilloutBoolLogic` structure
- Choice fields (`MultipleChoice`, `Checkboxes`, `Dropdown`) must have `options.staticOptions` with each option having its own short `id`, plus `label` and `value` both as `FilloutPickerString`
- `yes_no` generates `staticOptions` with `["Yes", "No"]` automatically
- `statement` maps to `Paragraph` using `contents` (not `label`) as the `FilloutPickerString`
- The SF.gov theme object is imported from a constant in `lib/adapters/sf-theme.ts` (extracted from the example file) and embedded verbatim

---

## API Design

### `POST /api/extract`

| Property | Value |
|---|---|
| Auth | None (IP-based rate limiting applied) |
| Content-Type | `multipart/form-data` |
| Body fields | `file` (PDF binary), `filename` (string) |
| Max file size | 10 MB (configurable via `MAX_FILE_SIZE_MB`) |

**Server-side processing order:**
1. Check rate limit for request IP → 429 if exceeded
2. Validate MIME type via magic bytes (`file-type`) → 400 if not PDF
3. Validate file size → 400 if over limit
4. Extract text with `pdf-parse` → discard buffer
5. If text < 50 chars, set `scanned_pdf` warning
6. Call Claude API with tool use → parse `tool_use` block
7. Return `ExtractionResult`

**Responses:**

| Status | Condition |
|---|---|
| 200 | `{ questions: Question[], warning?: string }` |
| 400 | Invalid file type or size — `{ error: string }` |
| 429 | Rate limit exceeded — `{ error: string, retryAfter: number }` |
| 503 | Kill switch active — `{ error: string }` |
| 500 | Extraction failed — `{ error: string }` |

---

## Claude API Integration

Uses **tool use** to enforce structured JSON output — no free-text parsing needed.

**System prompt** (marked for prompt caching to reduce cost on re-extractions):

```
You are an expert form analyst helping to digitize government PDF forms for the City and County of San Francisco.
Extract all form questions from the provided PDF text.

For each question identify:
1. The question text (cleaned of numbering prefixes)
2. The question type from: short_text, long_text, email, phone, address, date, number,
   yes_no, multiple_choice, checkboxes, dropdown, file_upload, signature, statement
3. Whether it appears required
4. For choice types: the answer options listed in the PDF

Rules:
- Include all form fields, not just sentences ending with "?"
- Exclude page headers, footers, and logos
- Use "statement" type for important instructional text
- Do not invent options not present in the source
- Preserve original question order
```

**Tool definition** (`extract_form_questions`) uses the `Question` schema as its `input_schema`. Claude returns a `tool_use` block; the route handler reads `tool_use.input.questions`.

**Prompt caching:** System prompt block is marked `cache_control: { type: "ephemeral" }`. Identical system prompts across all calls produce cache hits after the first, reducing input token cost ~90% on re-extractions — directly mitigating the cost risk from the PRD.

---

## Security Measures

| Threat | Control |
|---|---|
| API key exposure | `ANTHROPIC_API_KEY` is server-only (no `NEXT_PUBLIC_` prefix); never bundled to client |
| Malicious file uploads | Server-side magic-byte MIME validation (`file-type`); size limit checked before parsing |
| PDF content persistence | Buffer held in memory only for the request; never written to disk, logged, or cached |
| Prompt injection via PDF | PDF text is a user-turn message, not system prompt; tool use schema constrains model output |
| Cost runaway | IP-based rate limiting (default 10 req / 15 min); `EXTRACTION_KILL_SWITCH` env var for emergency disable |
| XSS | React JSX escaping on all rendered strings; no `dangerouslySetInnerHTML` |
| CSRF | Next.js API routes + SameSite cookie defaults; no state-changing GET requests |
| Dependency vulnerabilities | `npm audit` in CI; Renovate/Dependabot for automated updates |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key. Server-only. |
| `RATE_LIMIT_MAX` | No | `10` | Max extraction requests per window per IP |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `MAX_FILE_SIZE_MB` | No | `10` | Maximum PDF upload size in MB |
| `EXTRACTION_KILL_SWITCH` | No | — | Set `true` to disable `/api/extract` without a redeploy |
| `NEXT_PUBLIC_APP_VERSION` | No | — | Displayed in footer for support |

---

## Directory Structure

```
/
├── app/
│   ├── layout.tsx               # Root layout, skip-nav, SF header, ARIA live region
│   ├── page.tsx                 # Single-page app shell
│   ├── globals.css              # Tailwind base + SF design tokens
│   └── api/
│       └── extract/
│           └── route.ts         # POST /api/extract
│
├── components/
│   ├── FileUploader.tsx         # Drag-and-drop upload zone
│   ├── QuestionReviewTable.tsx  # Editable sortable question list
│   ├── QuestionRow.tsx          # Single editable row
│   ├── TypeDropdown.tsx         # Radix Select for question type
│   ├── ActionBar.tsx            # "Add Question" + "Generate JSON"
│   ├── FormTitleInput.tsx       # Editable form title field
│   └── ui/                      # shadcn/ui generated components
│
├── lib/
│   ├── types.ts                 # All shared TypeScript types
│   ├── extractQuestions.ts      # Claude API call logic
│   ├── pdfParser.ts             # pdf-parse wrapper
│   ├── rateLimit.ts             # In-memory IP rate limiter
│   ├── validation.ts            # File MIME + size validation
│   ├── download.ts              # downloadJson utility
│   └── adapters/
│       ├── types.ts             # FormAdapter interface
│       ├── fillout-types.ts     # Fillout JSON TypeScript interfaces
│       ├── sf-theme.ts          # SF.gov Fillout theme constant (from example file)
│       ├── index.ts             # Adapter registry
│       └── sf-internal.ts       # Fillout adapter (primary target)
│
├── hooks/
│   ├── useQuestionList.ts       # useReducer for question CRUD
│   └── useFileUpload.ts         # Upload state machine
│
├── __tests__/
│   ├── unit/
│   │   ├── adapters.test.ts
│   │   ├── validation.test.ts
│   │   ├── rateLimit.test.ts
│   │   ├── pdfParser.test.ts
│   │   ├── extractQuestions.test.ts
│   │   ├── download.test.ts
│   │   └── useQuestionList.test.ts
│   ├── components/
│   │   ├── FileUploader.test.tsx
│   │   ├── QuestionReviewTable.test.tsx
│   │   ├── QuestionRow.test.tsx
│   │   └── ActionBar.test.tsx
│   └── e2e/
│       ├── happyPath.spec.ts
│       └── errorStates.spec.ts
│
├── public/
│   └── sf-seal.svg
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## System Patterns

**Pattern 1: Adapter Registry for Platform Extensibility**
All JSON generation goes through `lib/adapters/index.ts`. The primary adapter (`sf-internal`) produces valid Fillout JSON. Adding a future platform = one new file implementing `FormAdapter`. The verbosity of the Fillout format is isolated inside `sf-internal.ts` — the rest of the codebase only sees `Question[]`.

**Pattern 2: Thin API Route Proxy**
`/api/extract` does only: validate, parse PDF, call Claude. All logic lives in independently-testable `lib/` modules.

**Pattern 3: Server/Client Boundary Discipline**
Secrets and file processing are server-only. After the API response, all computation is client-side. Rule: if it touches a secret or raw file, it lives in `app/api/` or `lib/` and is never imported by a client component.

**Pattern 4: Typed Action Reducer for UI State**
`useQuestionList` wraps `useReducer` with typed action creators (`LOAD_QUESTIONS`, `ADD_QUESTION`, `UPDATE_QUESTION_TEXT`, `UPDATE_QUESTION_TYPE`, `UPDATE_QUESTION_REQUIRED`, `DELETE_QUESTION`, `REORDER_QUESTIONS`). State transitions are pure functions — easy to unit test, easy to extend (e.g., undo/redo).

**Pattern 5: WCAG as a Default, Not an Afterthought**
Radix UI primitives are used for all interactive controls. They provide correct ARIA attributes, keyboard navigation, and focus management by default. Accessibility is not retrofitted — it is the foundation.
