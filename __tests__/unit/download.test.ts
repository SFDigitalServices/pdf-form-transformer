import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadJson } from '@/lib/download';

beforeEach(() => {
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('downloadJson', () => {
  it('creates an anchor element with the correct download filename', () => {
    let capturedDownload = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      capturedDownload = this.download;
    });

    downloadJson({ foo: 'bar' }, 'my-form.json');

    expect(capturedDownload).toBe('my-form.json');
  });

  it('revokes the blob URL after the anchor is clicked', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadJson({ test: 1 }, 'out.json');

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('passes a JSON blob to createObjectURL', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadJson({ hello: 'world' }, 'test.json');

    const blobArg = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe('application/json');
  });
});
