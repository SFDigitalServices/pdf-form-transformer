import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUploader } from '@/components/FileUploader';

const noop = vi.fn();

describe('FileUploader', () => {
  it('renders an accessible file input', () => {
    render(<FileUploader onUpload={noop} isUploading={false} />);
    expect(screen.getByLabelText(/upload a pdf/i)).toBeInTheDocument();
  });

  it('submit button is disabled when no file is selected', () => {
    render(<FileUploader onUpload={noop} isUploading={false} />);
    expect(screen.getByRole('button', { name: /extract questions/i })).toBeDisabled();
  });

  it('shows Extracting… and disables button while uploading', () => {
    render(<FileUploader onUpload={noop} isUploading={true} />);
    expect(screen.getByRole('button', { name: /extracting/i })).toBeDisabled();
  });

  it('enables button after a valid PDF file is selected', async () => {
    const user = userEvent.setup();
    render(<FileUploader onUpload={noop} isUploading={false} />);

    const input = screen.getByLabelText(/upload a pdf/i);
    const file = new File(['%PDF-1.4 content'], 'form.pdf', { type: 'application/pdf' });
    await user.upload(input, file);

    expect(screen.getByRole('button', { name: /extract questions/i })).not.toBeDisabled();
    expect(screen.getByText(/form\.pdf/)).toBeInTheDocument();
  });

  it('shows a validation error and keeps button disabled for a non-PDF file', async () => {
    render(<FileUploader onUpload={noop} isUploading={false} />);

    const input = screen.getByLabelText(/upload a pdf/i) as HTMLInputElement;
    const file = new File(['content'], 'doc.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    // userEvent.upload() respects the input's accept attribute and silently
    // drops non-PDF files before react-dropzone sees them. Use fireEvent with
    // Object.defineProperty to bypass jsdom's accept filtering so react-dropzone
    // can exercise its own rejection logic.
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(await screen.findByRole('alert')).toHaveTextContent(/only pdf/i);
    expect(screen.getByRole('button', { name: /extract questions/i })).toBeDisabled();
  });

  it('calls onUpload with the selected file when button is clicked', async () => {
    const onUpload = vi.fn();
    const user = userEvent.setup();
    render(<FileUploader onUpload={onUpload} isUploading={false} />);

    const input = screen.getByLabelText(/upload a pdf/i);
    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /extract questions/i }));

    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
