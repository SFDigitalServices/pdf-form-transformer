# PDF > Digital Form Transformer — Product Specification

**Version:** 1.0
**Date:** 2026-05-02
**Organization:** City and County of San Francisco

---

## Background

The City and County of San Francisco is modernizing its service delivery to meet WCAG accessibility standards. A core part of this work is replacing static PDF forms with accessible digital forms. The bottleneck today is the manual labor required to transcribe form questions from a PDF into a form-building platform — an estimated one hour per form. This tool uses AI to reduce that to under ten minutes.

---

## Target Users

### Primary Persona: Program Manager

- **Example:** Maria, Senior Program Manager, SF Department of Homelessness and Supportive Housing
- **Background:** Manages intake processes, coordinates with community partners, builds forms for public-facing services. Not a developer. Comfortable with basic office software (Google Docs, Excel, PDF tools).
- **Pain point:** Spends too much time manually re-entering questions from PDFs into the forms platform. Frequently makes transcription errors. Must do this for dozens of forms per year.
- **Goal:** Spend less time on mechanical transcription to focus on form usability and plain-language improvements.
- **Constraints:** Cannot install local software. Must use city-approved browsers. Sometimes works with scanned (image-based) PDFs.

### Secondary Persona: Accessibility Coordinator

- **Background:** Oversees WCAG compliance citywide. Tracks volume of forms converted. Does not build forms directly.
- **Goal:** Accelerate the pace of PDF-to-digital form conversions across all departments.

---

## Goals & Metrics

| Goal | Metric |
|---|---|
| Reduce time to convert a PDF form | From ~1 hour to under 10 minutes |
| Volume | Transform 100 digital forms in the first quarter after launch |

---

## User Flows

### Flow 1: Happy Path — Clean Digital PDF

1. User opens the web app in a browser.
2. User reads a brief description of the tool.
3. User uploads a PDF via drag-and-drop zone or file picker.
4. App validates the file (PDF type, under size limit) — inline error if invalid.
5. App sends the PDF to the backend; a loading skeleton is shown.
6. Backend uses Claude to extract form questions and infer their types.
7. Extracted questions are displayed in an editable review table.
8. Each row shows: question text (editable inline), question type (dropdown), required toggle, delete button.
9. User reviews, edits text, changes types, deletes irrelevant items (headers, instructions).
10. User clicks "Add Question" to insert any missed questions.
11. User optionally edits the form title.
12. User clicks "Generate JSON."
13. App converts the reviewed list to a JSON file and downloads it automatically.
14. User uploads the JSON to their forms platform.

### Flow 2: Scanned PDF / Poor Extraction

Steps 1–6 same as above.

7. Extracted results are sparse or inaccurate; a warning banner is shown: *"This PDF appears to be a scanned image. Results may be incomplete."*
8. User edits heavily or clears all rows and enters questions manually.
9. Continues from step 10 above.

### Flow 3: Invalid File

1. User attempts to upload a file that exceeds the size limit or is not a PDF.
2. App shows an inline validation error immediately — no server request is made.
3. User selects a valid file and proceeds.

### Flow 4: API Failure

Steps 1–5 same as happy path.

6. Backend call fails (network error, API timeout, or rate limit exceeded).
7. App shows a clear, actionable error (e.g., *"Extraction failed. You can enter your questions manually below, or try again."*).
8. An empty review table is displayed so the user is never blocked.

---

## Acceptance Criteria

### PDF Upload

- **AC-1:** Accepts PDF files up to 10 MB.
- **AC-2:** Rejects non-PDF files with a clear inline error before upload.
- **AC-3:** Rejects PDFs over 10 MB with a clear inline error before upload.
- **AC-4:** Shows a loading skeleton between upload and results display.

### Question Extraction

- **AC-5:** For a clean digital PDF form, extracts at least 80% of discrete form questions correctly.
- **AC-6:** Each extracted question has an inferred type from the supported type list.
- **AC-7:** Extraction result is presented within 30 seconds for a typical form (under 5 pages).

### Question Review & Editing

- **AC-8:** Users can edit any question's text inline.
- **AC-9:** Users can change any question's type using a dropdown.
- **AC-10:** Users can delete any question from the list.
- **AC-11:** Users can add a new blank question row.
- **AC-12:** Users can reorder questions via drag-and-drop or keyboard up/down controls.
- **AC-13:** All edits are reflected in the generated JSON.

### JSON Generation & Download

- **AC-14:** "Generate JSON" produces a downloadable `.json` file.
- **AC-15:** The JSON conforms to the defined schema (see tech-spec.md).
- **AC-16:** The filename is meaningful: `sf-form-export-[timestamp].json`.

### Accessibility

- **AC-17:** App meets WCAG 2.1 AA standards: all form controls labelled, fully keyboard navigable, sufficient color contrast (4.5:1 normal text, 3:1 large text).
- **AC-18:** Loading states and errors are announced to screen readers via ARIA live regions.
- **AC-19:** Skip-navigation link is present for keyboard users.

### Security & Privacy

- **AC-20:** Uploaded PDFs are not stored persistently; discarded after extraction.
- **AC-21:** The Claude API key is never exposed to the client.
- **AC-22:** Rate limiting prevents excessive API calls from a single session.

---

## Supported Question Types

| Type Key | Display Label | Description |
|---|---|---|
| `short_text` | Short Text | Single-line open text |
| `long_text` | Long Text / Paragraph | Multi-line open text |
| `email` | Email Address | Validated email input |
| `phone` | Phone Number | Phone number input |
| `address` | Address | Multi-field address block |
| `date` | Date | Date picker |
| `number` | Number | Numeric input |
| `yes_no` | Yes / No | Boolean toggle |
| `multiple_choice` | Multiple Choice | Select one from options |
| `checkboxes` | Checkboxes | Select multiple from options |
| `dropdown` | Dropdown | Select one from a dropdown |
| `file_upload` | File Upload | File attachment |
| `signature` | Signature | Signature capture |
| `statement` | Statement / Instruction | Non-question content displayed as text |

---

## Out of Scope (Version 1)

- Direct API integration with any forms platform
- User accounts, authentication, or saved sessions
- Support for Word documents, images, or non-PDF files
- Automatic translation or plain-language rewriting
- Analytics dashboard for the Accessibility Coordinator persona
- Collaborative editing by multiple users
