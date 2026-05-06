import type { FormAdapter } from './types';
import { filloutAdapter } from './sf-internal';

const adapters: Record<string, FormAdapter> = {
  'sf-internal': filloutAdapter,
};

export function getAdapter(name: string): FormAdapter {
  const adapter = adapters[name];
  if (!adapter) throw new Error(`Unknown adapter: ${name}`);
  return adapter;
}

export { filloutAdapter };
