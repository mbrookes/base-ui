import * as React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Dropzone } from '../../dropzone';
import { FileUpload } from '../index';

type TestFileUploadContext = {
  files: Array<{
    name: string;
    size: number;
    type: string;
    lastModified: number;
    id: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
  }>;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFile: (
    id: string,
    updates: {
      status?: 'idle' | 'uploading' | 'success' | 'error';
      progress?: number;
      error?: string;
    },
  ) => void;
};

function getTestContext(contextValue: TestFileUploadContext | null): TestFileUploadContext {
  if (contextValue === null) {
    throw new Error('Expected FileUpload context to be available');
  }

  return contextValue;
}

const createClipboardData = (files: File[]) => {
  if (typeof DataTransfer === 'undefined') {
    return { files } as unknown as DataTransfer;
  }

  const dataTransfer = new DataTransfer();
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });
  Object.defineProperty(dataTransfer, 'files', {
    value: files,
    configurable: true,
  });
  return dataTransfer;
};

function getFileInput() {
  const input = document.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected hidden file input to be rendered');
  }

  return input;
}

function TestRoot(props: React.ComponentProps<typeof FileUpload.Root>) {
  const { children, ...other } = props;

  return (
    <FileUpload.Root {...other}>
      <FileUpload.HiddenInput />
      {children}
    </FileUpload.Root>
  );
}

function TestDropzone(
  props: Omit<React.ComponentProps<typeof Dropzone>, 'dragging' | 'disabled' | 'onOpen'>,
) {
  const { disabled, openFileDialog, addFiles } = FileUpload.useFileUploadContext();

  return (
    <Dropzone
      disabled={disabled}
      onOpen={openFileDialog}
      onFilesDrop={(files, event) => addFiles(files, event.nativeEvent)}
      {...props}
    />
  );
}

describe('FileUpload', () => {
  it('renders the component', () => {
    render(
      <TestRoot>
        <TestDropzone>Drag files here</TestDropzone>
      </TestRoot>,
    );

    expect(screen.getByText('Drag files here')).toBeInTheDocument();
  });

  it('opens file dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestRoot>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </TestRoot>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    await user.click(button);

    expect(getFileInput()).toBeInTheDocument();
  });

  it('disables components when disabled prop is true', () => {
    render(
      <TestRoot disabled>
        <TestDropzone>Drag files here</TestDropzone>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </TestRoot>,
    );

    const [dropzone, trigger] = screen.getAllByRole('button');
    expect(trigger).toBeDisabled();
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies correct accept attribute to input', () => {
    render(<TestRoot accept="image/png,image/jpeg">{null}</TestRoot>);

    const input = getFileInput();
    expect(input.accept).toBe('image/png,image/jpeg');
  });

  it('applies multiple attribute to input when multiple is true', () => {
    render(<TestRoot multiple>{null}</TestRoot>);

    const input = getFileInput();
    expect(input.multiple).toBe(true);
  });

  it('sets dragging state on drag events', async () => {
    render(
      <TestRoot>
        <TestDropzone data-testid="dropzone">
          {({ isDragging }) => (
            <div data-testid="dragging-state">{isDragging ? 'dragging' : 'idle'}</div>
          )}
        </TestDropzone>
      </TestRoot>,
    );

    const dropzone = screen.getByTestId('dropzone');
    const state = screen.getByTestId('dragging-state');

    expect(state).toHaveTextContent('idle');
    expect(dropzone).not.toHaveAttribute('data-dragging');

    fireEvent.dragEnter(dropzone);

    expect(dropzone).toHaveAttribute('data-dragging', '');
  });

  describe('preventBaseUIHandler', () => {
    it('does not add files when onPaste calls preventBaseUIHandler', () => {
      const onFilesChange = vi.fn();
      const customPaste = vi.fn((event) => event.preventBaseUIHandler());
      render(
        <TestRoot onFilesChange={onFilesChange} onPaste={customPaste} data-testid="root">
          <TestDropzone>Drop files here</TestDropzone>
        </TestRoot>,
      );

      const root = screen.getByTestId('root');
      const file = new File(['content'], 'paste.txt', { type: 'text/plain' });
      const clipboardData = createClipboardData([file]);

      fireEvent.paste(root, { clipboardData });

      expect(customPaste).toHaveBeenCalled();
      expect(onFilesChange).not.toHaveBeenCalled();
    });
  });

  it('adds files when pasting files onto the root', async () => {
    const onFilesChange = vi.fn();

    render(
      <TestRoot onFilesChange={onFilesChange} data-testid="root">
        <TestDropzone>Drop files here</TestDropzone>
      </TestRoot>,
    );

    const root = screen.getByTestId('root');
    const file = new File(['content'], 'paste.txt', { type: 'text/plain' });
    const clipboardData = createClipboardData([file]);

    fireEvent.paste(root, {
      clipboardData,
    });

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());

    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(latestFiles?.[0].name).toBe('paste.txt');
  });

  it('calls onCancel when file dialog is canceled', async () => {
    const onCancel = vi.fn();

    render(<TestRoot onCancel={onCancel}>{null}</TestRoot>);

    const input = getFileInput();

    Object.defineProperty(input, 'files', {
      value: [],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('reports DUPLICATE_FILE reason via onFilesAdd when the same file is selected again', async () => {
    const onFilesAdd = vi.fn();

    render(<TestRoot onFilesAdd={onFilesAdd}>{null}</TestRoot>);

    const input = getFileInput();
    const file = new File(['content'], 'dup.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFilesAdd).toHaveBeenCalledTimes(2);
    });

    const [, fileRejections] = onFilesAdd.mock.calls[1];
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      reason: 'DUPLICATE_FILE',
      file: expect.any(File),
      eventDetails: expect.objectContaining({
        reason: 'DUPLICATE_FILE',
        message: 'duplicate file',
      }),
    });
  });

  it('reports rejected file via onFilesAdd fileRejections', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept="image/*" onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(0);
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file,
      reason: 'MIME_TYPE_NOT_ALLOWED',
      eventDetails: expect.objectContaining({
        message: expect.any(String),
      }),
    });
  });

  it('calls onFilesAdd with accepted and rejected files for a mixed selection', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept="image/*" onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const acceptedFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    const rejectedFile = new File(['content'], 'notes.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [acceptedFile, rejectedFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());

    expect(onFilesAdd).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'photo.jpg' })]),
      expect.arrayContaining([
        expect.objectContaining({
          file: rejectedFile,
          reason: 'MIME_TYPE_NOT_ALLOWED',
          eventDetails: expect.objectContaining({
            reason: 'MIME_TYPE_NOT_ALLOWED',
          }),
        }),
      ]),
      expect.objectContaining({
        reason: 'file-added',
      }),
    );
  });

  it('does not accept non-MIME prefix matches for wildcard accept patterns', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept="image/*" onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const invalidPrefixMime = new File(['bad'], 'bad.bin', { type: 'imagefoo/png' });
    const validImage = new File(['ok'], 'ok.png', { type: 'image/png' });

    Object.defineProperty(input, 'files', {
      value: [invalidPrefixMime, validImage],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());

    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(1);
    expect(acceptedFiles[0].name).toBe('ok.png');
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file: expect.objectContaining({ name: 'bad.bin' }),
      reason: 'MIME_TYPE_NOT_ALLOWED',
    });
  });

  it('matches MIME accept patterns case-insensitively', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept="IMAGE/*,APPLICATION/PDF" onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const imageFile = new File(['image'], 'photo.png', { type: 'image/png' });
    const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', {
      value: [imageFile, pdfFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(2);
    expect(fileRejections).toHaveLength(0);
  });

  it('calls onFilesAdd when all selected files are rejected', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept="image/*" onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const rejectedFile = new File(['content'], 'notes.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [rejectedFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());

    expect(onFilesAdd).toHaveBeenCalledWith(
      [],
      expect.arrayContaining([
        expect.objectContaining({
          file: rejectedFile,
          reason: 'MIME_TYPE_NOT_ALLOWED',
          eventDetails: expect.objectContaining({
            reason: 'MIME_TYPE_NOT_ALLOWED',
          }),
        }),
      ]),
      expect.objectContaining({
        reason: 'file-added',
      }),
    );
  });

  it('accepts files when accept includes file extensions', async () => {
    const onFilesChange = vi.fn();
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept=".txt" onFilesChange={onFilesChange} onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'READme.TXT', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());
    const [, fileRejections] = onFilesAdd.mock.calls[0];
    expect(fileRejections).toHaveLength(0);
  });

  it('ignores empty entries in the accept string', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot accept="image/png,  , .txt" onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(1);
    expect(fileRejections).toHaveLength(0);
  });

  it('uses custom validator to reject files', async () => {
    const onFilesChange = vi.fn();
    const onFilesAdd = vi.fn();
    const validator = vi.fn().mockReturnValue('Blocked by policy');

    render(
      <TestRoot
        accept="*"
        onFilesChange={onFilesChange}
        onFilesAdd={onFilesAdd}
        validator={validator}
      >
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [, fileRejections] = onFilesAdd.mock.calls[0];
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file,
      reason: 'CUSTOM_VALIDATION_FAILED',
      eventDetails: expect.objectContaining({ message: 'Blocked by policy' }),
    });
    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0] ?? [];
    expect(latestFiles).not.toEqual(expect.arrayContaining([file]));
    expect(validator).toHaveBeenCalledWith(file);
  });

  it('treats thrown custom validator errors as rejections', async () => {
    const onFilesAdd = vi.fn();
    const validator = vi.fn(() => {
      throw new Error('Policy check failed');
    });

    render(
      <TestRoot accept="*" onFilesAdd={onFilesAdd} validator={validator}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(0);
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file,
      reason: 'CUSTOM_VALIDATION_FAILED',
      eventDetails: expect.objectContaining({ message: 'Policy check failed' }),
    });
  });

  it('does not enforce a max file size by default', async () => {
    const onFilesChange = vi.fn();
    const onFilesAdd = vi.fn();

    render(
      <TestRoot onFilesChange={onFilesChange} onFilesAdd={onFilesAdd} accept="*">
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], 'large.bin', {
      type: 'application/octet-stream',
    });

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());

    const [, fileRejections] = onFilesAdd.mock.calls[0];
    expect(fileRejections).toHaveLength(0);
    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(latestFiles?.[0].name).toBe('large.bin');
  });

  it('respects maxSize constraint and rejects oversized files', async () => {
    const onFilesAdd = vi.fn();
    const onFilesChange = vi.fn();

    render(
      <TestRoot maxSize={1024} onFilesAdd={onFilesAdd} onFilesChange={onFilesChange}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const largeFile = new File([new Uint8Array(2048)], 'large.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [, fileRejections] = onFilesAdd.mock.calls[0];
    expect(fileRejections[0]).toMatchObject({
      file: largeFile,
      reason: 'FILE_TOO_LARGE',
      eventDetails: expect.objectContaining({ message: expect.stringContaining('too large') }),
    });
    // onFilesChange should not be called when all files are rejected (files state unchanged)
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('respects minSize constraint and rejects undersized files', async () => {
    const onFilesAdd = vi.fn();
    const onFilesChange = vi.fn();

    render(
      <TestRoot minSize={1024} onFilesAdd={onFilesAdd} onFilesChange={onFilesChange}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const tinyFile = new File(['x'], 'tiny.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [tinyFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [, fileRejections] = onFilesAdd.mock.calls[0];
    expect(fileRejections[0]).toMatchObject({
      file: tinyFile,
      reason: 'FILE_TOO_SMALL',
      eventDetails: expect.objectContaining({ message: expect.stringContaining('too small') }),
    });
  });

  it('normalizes invalid numeric constraints to safe bounds', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot maxFiles={-1} minSize={-100} maxSize={Number.NaN} onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(0);
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file,
      reason: 'MAX_FILES_REACHED',
    });
  });

  it('respects maxFiles constraint in single file mode', async () => {
    const onFilesChange = vi.fn();

    render(
      <TestRoot maxFiles={1} multiple={false} onFilesChange={onFilesChange}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
        expect.objectContaining({ reason: expect.any(String) }),
      );
    });

    const uploadedFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(uploadedFiles?.length).toBe(1);
  });

  it('keeps existing file in single-file mode when replacement is rejected', async () => {
    let contextValue: TestFileUploadContext | null = null;
    const onFilesChange = vi.fn();
    const onFilesAdd = vi.fn();

    function TestComponent() {
      contextValue = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
      return null;
    }

    render(
      <TestRoot
        multiple={false}
        accept="image/*"
        onFilesChange={onFilesChange}
        onFilesAdd={onFilesAdd}
      >
        <TestComponent />
      </TestRoot>,
    );

    const validFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['content'], 'notes.txt', { type: 'text/plain' });

    act(() => {
      getTestContext(contextValue).addFiles([validFile]);
    });

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());

    act(() => {
      getTestContext(contextValue).addFiles([invalidFile]);
    });

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalledTimes(2));
    const [, fileRejections] = onFilesAdd.mock.calls[1];
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file: invalidFile,
      reason: 'MIME_TYPE_NOT_ALLOWED',
      eventDetails: expect.objectContaining({ reason: 'MIME_TYPE_NOT_ALLOWED' }),
    });

    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(latestFiles).toHaveLength(1);
    expect(latestFiles?.[0].name).toBe('photo.jpg');
  });

  it('replaces existing file in single-file mode when replacement is accepted', async () => {
    let contextValue: TestFileUploadContext | null = null;
    const onFilesChange = vi.fn();
    const onFilesAdd = vi.fn();

    function TestComponent() {
      contextValue = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
      return null;
    }

    render(
      <TestRoot multiple={false} accept="*" onFilesChange={onFilesChange} onFilesAdd={onFilesAdd}>
        <TestComponent />
      </TestRoot>,
    );

    const firstFile = new File(['content'], 'first.txt', { type: 'text/plain' });
    const replacementFile = new File(['content'], 'replacement.txt', { type: 'text/plain' });

    act(() => {
      getTestContext(contextValue).addFiles([firstFile]);
    });

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());

    act(() => {
      getTestContext(contextValue).addFiles([replacementFile]);
    });

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalledTimes(2));

    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(latestFiles).toHaveLength(1);
    expect(latestFiles?.[0].name).toBe('replacement.txt');
  });

  it('reports MAX_FILES_REACHED for extra files in a single-file selection', async () => {
    const onFilesAdd = vi.fn();

    render(
      <TestRoot maxFiles={1} multiple={false} onFilesAdd={onFilesAdd}>
        {null}
      </TestRoot>,
    );

    const input = getFileInput();
    const firstFile = new File(['content'], 'first.txt', { type: 'text/plain' });
    const secondFile = new File(['content'], 'second.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [firstFile, secondFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());

    const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
    expect(acceptedFiles).toHaveLength(1);
    expect(acceptedFiles[0]).toMatchObject({ name: 'first.txt' });
    expect(fileRejections).toHaveLength(1);
    expect(fileRejections[0]).toMatchObject({
      file: secondFile,
      reason: 'MAX_FILES_REACHED',
      eventDetails: expect.objectContaining({ reason: 'MAX_FILES_REACHED' }),
    });
  });

  it('cleans up object URLs on unmount', async () => {
    const { unmount } = render(<TestRoot>{null}</TestRoot>);

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    await userEvent.upload(input, file);

    unmount();

    await waitFor(() => {
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    revokeObjectURLSpy.mockRestore();
  });

  it('does not revoke preview URL on non-removal file updates', async () => {
    let contextValue: TestFileUploadContext | null = null;

    function TestComponent() {
      contextValue = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
      return null;
    }

    render(
      <TestRoot>
        <TestComponent />
      </TestRoot>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    await userEvent.upload(input, file);

    const firstFile = getTestContext(contextValue).files[0];

    act(() => {
      getTestContext(contextValue).updateFile(firstFile.id, { progress: 30, status: 'uploading' });
    });

    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    revokeObjectURLSpy.mockRestore();
  });

  it('resolves className callback with disabled state', () => {
    render(
      <TestRoot disabled>
        <FileUpload.Trigger
          className={(state) => (state.disabled ? 'disabled-trigger' : 'enabled-trigger')}
        >
          Upload
        </FileUpload.Trigger>
      </TestRoot>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled-trigger');
  });

  it('resolves className callback when disabled state changes', () => {
    const { rerender } = render(
      <TestRoot disabled={false}>
        <FileUpload.Trigger
          className={(state) => (state.disabled ? 'disabled-trigger' : 'enabled-trigger')}
        >
          Upload
        </FileUpload.Trigger>
      </TestRoot>,
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('enabled-trigger');

    rerender(
      <TestRoot disabled>
        <FileUpload.Trigger
          className={(state) => (state.disabled ? 'disabled-trigger' : 'enabled-trigger')}
        >
          Upload
        </FileUpload.Trigger>
      </TestRoot>,
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('disabled-trigger');
  });

  it('announces file rejection to screen readers', async () => {
    render(<TestRoot accept="image/*">{null}</TestRoot>);

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  it('separates success and rejection messages in announcement with a space', async () => {
    render(<TestRoot accept="image/*">{null}</TestRoot>);

    const input = getFileInput();
    const validFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['content'], 'doc.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [validFile, invalidFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => {
      const liveRegion = screen.getByRole('status');
      const text = liveRegion.textContent ?? '';
      // "Added 1 file." followed by a space then "1 rejected: ..."
      // Without the fix this would be "Added 1 file.1 rejected: ..."
      expect(text).toMatch(/^Added 1 file\. 1 rejected:/);
    });
  });

  describe('Full workflow integration', () => {
    it('supports selecting files via dropzone and reporting onFilesChange', async () => {
      const onFilesChange = vi.fn();

      render(
        <TestRoot onFilesChange={onFilesChange}>
          <TestDropzone data-testid="dropzone">Drop files here or click</TestDropzone>
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('supports multiple file selection at different times', async () => {
      const onFilesChange = vi.fn();

      render(
        <TestRoot onFilesChange={onFilesChange}>
          <FileUpload.Trigger>Upload</FileUpload.Trigger>
        </TestRoot>,
      );

      const input = getFileInput();
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });

      await userEvent.upload(input, file1);

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test1.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      await userEvent.upload(input, file2);

      await waitFor(() => {
        expect(onFilesChange.mock.calls.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Error scenarios', () => {
    it('handles file rejection with error message', async () => {
      const onFilesAdd = vi.fn();

      render(
        <TestRoot accept="image/*" onFilesAdd={onFilesAdd}>
          {null}
        </TestRoot>,
      );

      const input = getFileInput();
      const textFile = new File(['data'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [textFile],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
      const [, fileRejections] = onFilesAdd.mock.calls[0];
      expect(fileRejections[0].file).toBe(textFile);
    });

    it('truncates long rejection announcements with an and more suffix', async () => {
      render(<TestRoot accept="image/*">{null}</TestRoot>);

      const input = getFileInput();
      const files = [
        new File(['a'], 'a.txt', { type: 'text/plain' }),
        new File(['b'], 'b.txt', { type: 'text/plain' }),
        new File(['c'], 'c.txt', { type: 'text/plain' }),
        new File(['d'], 'd.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(screen.getByRole('status').textContent).toContain('and more');
      });
    });
  });

  describe('removeFile', () => {
    it('announces to screen readers when a file is removed', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      fireEvent.change(input, { target: { files: [file] } });

      const fileId = getTestContext(contextValue).files[0].id;

      act(() => {
        getTestContext(contextValue).removeFile(fileId);
      });

      await waitFor(() => {
        expect(screen.getByText(/photo\.jpg/)).toBeInTheDocument();
      });
    });
  });

  describe('clearFiles', () => {
    it('removes all files from the list', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file1, file2] } });

      expect(getTestContext(contextValue).files).toHaveLength(2);

      act(() => {
        getTestContext(contextValue).clearFiles();
      });

      expect(getTestContext(contextValue).files).toHaveLength(0);
    });

    it('announces to screen readers when all files are cleared', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      act(() => {
        getTestContext(contextValue).clearFiles();
      });

      await waitFor(() => {
        expect(screen.getByText('All files removed', { exact: false })).toBeInTheDocument();
      });
    });
  });

  describe('maxFiles in multiple mode', () => {
    it('respects maxFiles limit when selecting multiple files', async () => {
      const onFilesChange = vi.fn();

      render(
        <TestRoot maxFiles={3} multiple onFilesChange={onFilesChange}>
          {null}
        </TestRoot>,
      );

      const input = getFileInput();
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
        new File(['content3'], 'test3.txt', { type: 'text/plain' }),
        new File(['content4'], 'test4.txt', { type: 'text/plain' }),
        new File(['content5'], 'test5.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      // Should only add 3 files due to maxFiles limit
      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test1.txt' }),
            expect.objectContaining({ name: 'test2.txt' }),
            expect.objectContaining({ name: 'test3.txt' }),
          ]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      expect(onFilesChange.mock.calls[0][0]).toHaveLength(3);
    });

    it('announces max files reached message', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot maxFiles={2} multiple>
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      expect(getTestContext(contextValue).files).toHaveLength(2);

      // Try to add more files when at limit
      const moreFiles = [new File(['content3'], 'test3.txt', { type: 'text/plain' })];

      fireEvent.change(input, { target: { files: moreFiles } });

      await waitFor(() => {
        expect(
          screen.getByText('Cannot add files. Limit of 2 reached.', { exact: false }),
        ).toBeInTheDocument();
      });

      expect(getTestContext(contextValue).files).toHaveLength(2);
    });

    it('reports MAX_FILES_REACHED via onFilesAdd when selecting more than maxFiles at once', async () => {
      const onFilesAdd = vi.fn();

      render(
        <TestRoot maxFiles={2} multiple onFilesAdd={onFilesAdd}>
          {null}
        </TestRoot>,
      );

      const input = getFileInput();
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
        new File(['content3'], 'test3.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
      const [, fileRejections] = onFilesAdd.mock.calls[0];
      expect(fileRejections).toHaveLength(1);
      expect(fileRejections[0]).toMatchObject({
        file: expect.objectContaining({ name: 'test3.txt' }),
        reason: 'MAX_FILES_REACHED',
        eventDetails: expect.objectContaining({
          reason: 'MAX_FILES_REACHED',
          message: 'Cannot add files. Limit of 2 reached.',
        }),
      });
    });

    it('reports MAX_FILES_REACHED via onFilesAdd when trying to add files after reaching the limit', async () => {
      const onFilesAdd = vi.fn();

      render(
        <TestRoot maxFiles={2} multiple onFilesAdd={onFilesAdd}>
          {null}
        </TestRoot>,
      );

      const input = getFileInput();

      fireEvent.change(input, {
        target: {
          files: [
            new File(['content1'], 'test1.txt', { type: 'text/plain' }),
            new File(['content2'], 'test2.txt', { type: 'text/plain' }),
          ],
        },
      });

      await waitFor(() => expect(onFilesAdd).toHaveBeenCalledTimes(1));
      onFilesAdd.mockClear();

      fireEvent.change(input, {
        target: {
          files: [new File(['content3'], 'test3.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => expect(onFilesAdd).toHaveBeenCalled());
      const [, fileRejections] = onFilesAdd.mock.calls[0];
      expect(fileRejections).toHaveLength(1);
      expect(fileRejections[0]).toMatchObject({
        file: expect.objectContaining({ name: 'test3.txt' }),
        reason: 'MAX_FILES_REACHED',
        eventDetails: expect.objectContaining({
          reason: 'MAX_FILES_REACHED',
          message: 'Cannot add files. Limit of 2 reached.',
        }),
      });
    });

    it('allows adding files up to the limit in increments', async () => {
      const onFilesChange = vi.fn();

      render(
        <TestRoot maxFiles={5} multiple onFilesChange={onFilesChange}>
          {null}
        </TestRoot>,
      );

      const input = getFileInput();

      // Add 2 files
      const firstBatch = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files: firstBatch } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test1.txt' }),
            expect.objectContaining({ name: 'test2.txt' }),
          ]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      // Add 3 more files (should reach limit of 5)
      const secondBatch = [
        new File(['content3'], 'test3.txt', { type: 'text/plain' }),
        new File(['content4'], 'test4.txt', { type: 'text/plain' }),
        new File(['content5'], 'test5.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files: secondBatch } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test1.txt' }),
            expect.objectContaining({ name: 'test2.txt' }),
            expect.objectContaining({ name: 'test3.txt' }),
            expect.objectContaining({ name: 'test4.txt' }),
            expect.objectContaining({ name: 'test5.txt' }),
          ]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      expect(onFilesChange.mock.calls[onFilesChange.mock.calls.length - 1][0]).toHaveLength(5);
    });

    it('fills remaining slots with later valid files when earlier files are rejected', async () => {
      const onFilesChange = vi.fn();
      const onFilesAdd = vi.fn();

      render(
        <TestRoot
          maxFiles={3}
          maxSize={1024}
          multiple
          onFilesChange={onFilesChange}
          onFilesAdd={onFilesAdd}
        >
          {null}
        </TestRoot>,
      );

      const input = getFileInput();

      fireEvent.change(input, {
        target: {
          files: [new File(['ok'], 'existing.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'existing.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      onFilesChange.mockClear();

      const oversized = new File([new Uint8Array(2048)], 'too-large.txt', { type: 'text/plain' });
      const validA = new File(['a'], 'valid-a.txt', { type: 'text/plain' });
      const validB = new File(['b'], 'valid-b.txt', { type: 'text/plain' });

      fireEvent.change(input, {
        target: {
          files: [oversized, validA, validB],
        },
      });

      await waitFor(() => {
        const latestFiles = onFilesChange.mock.calls.at(-1)?.[0] ?? [];
        expect(latestFiles).toHaveLength(3);
      });

      const latestFiles = onFilesChange.mock.calls.at(-1)?.[0] ?? [];
      expect(latestFiles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'existing.txt' }),
          expect.objectContaining({ name: 'valid-a.txt' }),
          expect.objectContaining({ name: 'valid-b.txt' }),
        ]),
      );

      const [, fileRejections] = onFilesAdd.mock.calls.at(-1) ?? [];
      expect(fileRejections).toHaveLength(1);
      expect(fileRejections[0]).toMatchObject({
        file: expect.objectContaining({ name: 'too-large.txt' }),
        reason: 'FILE_TOO_LARGE',
        eventDetails: expect.objectContaining({ reason: 'FILE_TOO_LARGE' }),
      });
    });

    it('treats files in different directory paths as distinct for duplicate checks', async () => {
      const onFilesAdd = vi.fn();

      render(
        <TestRoot multiple directory onFilesAdd={onFilesAdd}>
          {null}
        </TestRoot>,
      );

      const input = getFileInput();

      const lastModified = Date.now();
      const fileA = new File(['x'], 'same-name.txt', { type: 'text/plain', lastModified });
      const fileB = new File(['x'], 'same-name.txt', { type: 'text/plain', lastModified });

      Object.defineProperty(fileA, 'webkitRelativePath', {
        configurable: true,
        value: 'a/same-name.txt',
      });
      Object.defineProperty(fileB, 'webkitRelativePath', {
        configurable: true,
        value: 'b/same-name.txt',
      });

      fireEvent.change(input, {
        target: {
          files: [fileA, fileB],
        },
      });

      await waitFor(() => {
        expect(onFilesAdd).toHaveBeenCalled();
      });

      const [acceptedFiles, fileRejections] = onFilesAdd.mock.calls[0];
      expect(acceptedFiles).toHaveLength(2);
      expect(fileRejections).toHaveLength(0);
    });

    it('does not exceed maxFiles when addFiles is called concurrently before a render', async () => {
      // Both addFiles calls happen in the same act() before React commits, so
      // filesRef.current is stale for the second call. The setFiles updater must
      // re-check latestPrev.length to keep the maxFiles invariant.
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot maxFiles={3} multiple>
          <TestComponent />
        </TestRoot>,
      );

      const fileA = new File(['a'], 'a.txt', { type: 'text/plain' });
      const fileB = new File(['b'], 'b.txt', { type: 'text/plain' });
      const fileC = new File(['c'], 'c.txt', { type: 'text/plain' });
      const fileD = new File(['d'], 'd.txt', { type: 'text/plain' });

      // Call addFiles twice in one act() so both run before React commits state.
      // First call adds [a, b], second call adds [c, d].
      // Without the cap in the updater both would see remainingSlots = 3 and
      // collectively add 4 files, exceeding maxFiles.
      act(() => {
        getTestContext(contextValue).addFiles([fileA, fileB]);
        getTestContext(contextValue).addFiles([fileC, fileD]);
      });

      await waitFor(() => {
        expect(getTestContext(contextValue).files.length).toBeLessThanOrEqual(3);
      });
    });

    it('accepts all files when concurrent addFiles calls together stay within maxFiles', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot maxFiles={4} multiple>
          <TestComponent />
        </TestRoot>,
      );

      const fileA = new File(['a'], 'a.txt', { type: 'text/plain' });
      const fileB = new File(['b'], 'b.txt', { type: 'text/plain' });
      const fileC = new File(['c'], 'c.txt', { type: 'text/plain' });

      // Two concurrent calls that together add 3 files, which is within maxFiles=4.
      act(() => {
        getTestContext(contextValue).addFiles([fileA, fileB]);
        getTestContext(contextValue).addFiles([fileC]);
      });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(3);
      });
    });

    it('reports accepted files correctly for back-to-back addFiles calls at maxFiles cap', async () => {
      const onFilesAdd = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot maxFiles={2} multiple onFilesAdd={onFilesAdd}>
          <TestComponent />
        </TestRoot>,
      );

      const fileA = new File(['a'], 'a.txt', { type: 'text/plain' });
      const fileB = new File(['b'], 'b.txt', { type: 'text/plain' });
      const fileC = new File(['c'], 'c.txt', { type: 'text/plain' });
      const fileD = new File(['d'], 'd.txt', { type: 'text/plain' });

      act(() => {
        getTestContext(contextValue).addFiles([fileA, fileB]);
        getTestContext(contextValue).addFiles([fileC, fileD]);
      });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(2);
      });

      expect(onFilesAdd).toHaveBeenCalledTimes(2);
      expect(onFilesAdd.mock.calls[0]?.[0]).toHaveLength(2);
      expect(onFilesAdd.mock.calls[0]?.[1]).toHaveLength(0);
      expect(onFilesAdd.mock.calls[1]?.[0]).toHaveLength(0);
      expect(onFilesAdd.mock.calls[1]?.[1]).toHaveLength(2);
    });

  });

  describe('onFilesChange callback', () => {
    it('calls onFilesChange with reason file-updated when updateFile is called', async () => {
      const onFilesChange = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot onFilesChange={onFilesChange}>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(1);
      });

      onFilesChange.mockClear();

      const fileId = getTestContext(contextValue).files[0].id;

      act(() => {
        getTestContext(contextValue).updateFile(fileId, { status: 'uploading', progress: 50 });
      });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test.txt', status: 'uploading', progress: 50 }),
          ]),
          expect.objectContaining({ reason: 'file-updated' }),
        );
      });
    });

    it('does not call onFilesChange when updateFile is called with an unknown id', async () => {
      const onFilesChange = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot onFilesChange={onFilesChange}>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(1);
      });

      onFilesChange.mockClear();

      act(() => {
        getTestContext(contextValue).updateFile('missing-id', {
          status: 'uploading',
          progress: 50,
        });
      });

      expect(onFilesChange).not.toHaveBeenCalled();
    });

    it('calls onFilesChange when files are added', async () => {
      const onFilesChange = vi.fn();

      render(<TestRoot onFilesChange={onFilesChange}>{null}</TestRoot>);

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('calls onFilesChange when a file is removed', async () => {
      const onFilesChange = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot onFilesChange={onFilesChange}>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalled();
      });

      onFilesChange.mockClear();

      const fileId = getTestContext(contextValue).files[0].id;

      act(() => {
        getTestContext(contextValue).removeFile(fileId);
      });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          [],
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('calls onFilesChange when all files are cleared', async () => {
      const onFilesChange = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot onFilesChange={onFilesChange}>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalled();
      });

      onFilesChange.mockClear();

      act(() => {
        getTestContext(contextValue).clearFiles();
      });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          [],
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('provides extended file properties in onFilesChange', async () => {
      const onFilesChange = vi.fn();

      render(<TestRoot onFilesChange={onFilesChange}>{null}</TestRoot>);

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalled();
      });

      const [filesArg, detailsArg] = onFilesChange.mock.calls.at(-1)!;
      expect(filesArg).toHaveLength(1);
      expect(filesArg[0].name).toBe('test.txt');
      expect(filesArg[0]).toMatchObject({
        id: expect.any(String),
        preview: expect.stringContaining('blob:'),
        status: 'idle',
        progress: 0,
      });
      expect(detailsArg).toMatchObject({ reason: expect.any(String) });
    });
  });

  describe('File property preservation', () => {
    it('does not mutate the original File object with upload metadata', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const originalFile = new File(['content'], 'original.txt', { type: 'text/plain' });

      expect(originalFile).not.toHaveProperty('id');
      expect(originalFile).not.toHaveProperty('preview');
      expect(originalFile).not.toHaveProperty('status');
      expect(originalFile).not.toHaveProperty('progress');

      fireEvent.change(input, { target: { files: [originalFile] } });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(1);
      });

      expect(originalFile).not.toHaveProperty('id');
      expect(originalFile).not.toHaveProperty('preview');
      expect(originalFile).not.toHaveProperty('status');
      expect(originalFile).not.toHaveProperty('progress');
    });

    it('preserves File size property', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const fileSize = 1024;
      const file = new File(['a'.repeat(fileSize)], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(1);
      });

      const uploadedFile = getTestContext(contextValue).files[0];
      expect(uploadedFile).toHaveProperty('size');
      expect(uploadedFile.size).toBe(fileSize);
    });

    it('preserves File type property', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.json', { type: 'application/json' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(1);
      });

      const uploadedFile = getTestContext(contextValue).files[0];
      expect(uploadedFile).toHaveProperty('type');
      expect(uploadedFile.type).toBe('application/json');
    });

    it('preserves File lastModified property', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const lastModified = Date.now();
      const file = new File(['content'], 'test.txt', { type: 'text/plain', lastModified });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(getTestContext(contextValue).files).toHaveLength(1);
      });

      const uploadedFile = getTestContext(contextValue).files[0];
      expect(uploadedFile).toHaveProperty('lastModified');
      expect(uploadedFile.lastModified).toBe(lastModified);
    });

    it('preserves File prototype (instanceof File) after metadata updates', () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(getTestContext(contextValue).files).toHaveLength(1);
      expect(getTestContext(contextValue).files[0]).toBeInstanceOf(File);

      const fileId = getTestContext(contextValue).files[0].id;

      act(() => {
        getTestContext(contextValue).updateFile(fileId, { status: 'uploading' });
      });
      expect(getTestContext(contextValue).files[0]).toBeInstanceOf(File);

      act(() => {
        getTestContext(contextValue).updateFile(fileId, { status: 'success', progress: 100 });
      });
      expect(getTestContext(contextValue).files[0]).toBeInstanceOf(File);

      act(() => {
        getTestContext(contextValue).updateFile(fileId, {
          status: 'error',
          error: 'Upload failed',
        });
      });
      expect(getTestContext(contextValue).files[0]).toBeInstanceOf(File);
    });

    it('keeps the same file object reference across metadata updates', () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <TestRoot>
          <TestComponent />
        </TestRoot>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      const fileId = getTestContext(contextValue).files[0].id;
      const firstRef = getTestContext(contextValue).files[0];

      act(() => {
        getTestContext(contextValue).updateFile(fileId, { status: 'uploading', progress: 10 });
      });

      expect(getTestContext(contextValue).files[0]).toBe(firstRef);

      act(() => {
        getTestContext(contextValue).updateFile(fileId, {
          status: 'error',
          error: 'Upload failed',
        });
      });

      expect(getTestContext(contextValue).files[0]).toBe(firstRef);
    });
  });
});
