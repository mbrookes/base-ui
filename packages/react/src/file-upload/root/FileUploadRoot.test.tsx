import * as React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';

type TestFileUploadContext = {
  files: Array<{
    name: string;
    size: number;
    type: string;
    lastModified: number;
    id: string;
    status: 'idle' | 'uploading' | 'success' | 'error' | 'paused';
    isPaused?: boolean;
    uploadedBytes?: number;
    progress?: number;
  }>;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFile: (
    id: string,
    updates: {
      status?: 'idle' | 'uploading' | 'success' | 'error' | 'paused';
      progress?: number;
      error?: string;
      isPaused?: boolean;
      uploadedBytes?: number;
    },
  ) => void;
  pauseFile: (id: string) => void;
  resumeFile: (id: string) => void;
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

describe('FileUpload', () => {
  it('renders the component', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>Drag files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    expect(screen.getByText('Drag files here')).toBeInTheDocument();
  });

  it('opens file dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FileUpload.Root>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    await user.click(button);

    expect(getFileInput()).toBeInTheDocument();
  });

  it('disables components when disabled prop is true', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Dropzone>Drag files here</FileUpload.Dropzone>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const [dropzone, trigger] = screen.getAllByRole('button');
    expect(trigger).toBeDisabled();
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not render preview list when there are no files', () => {
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList data-testid="preview-list">
          <div>File list</div>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    expect(screen.queryByTestId('preview-list')).not.toBeInTheDocument();
  });

  it('applies correct accept attribute to input', () => {
    render(<FileUpload.Root accept="image/png,image/jpeg">{null}</FileUpload.Root>);

    const input = getFileInput();
    expect(input.accept).toBe('image/png,image/jpeg');
  });

  it('applies multiple attribute to input when multiple is true', () => {
    render(<FileUpload.Root multiple>{null}</FileUpload.Root>);

    const input = getFileInput();
    expect(input.multiple).toBe(true);
  });

  it('does not apply multiple attribute when multiple is false', () => {
    render(<FileUpload.Root multiple={false}>{null}</FileUpload.Root>);

    const input = getFileInput();
    expect(input.multiple).toBe(false);
  });

  it('sets dragging state on drag events', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone data-testid="dropzone">
          {({ isDragging }) => (
            <div data-testid="dragging-state">{isDragging ? 'dragging' : 'idle'}</div>
          )}
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByTestId('dropzone');
    const state = screen.getByTestId('dragging-state');

    expect(state).toHaveTextContent('idle');
    expect(dropzone).not.toHaveAttribute('data-dragging');

    fireEvent.dragEnter(dropzone);

    expect(dropzone).toHaveAttribute('data-dragging', '');
  });

  it('adds files when pasting files onto the root', async () => {
    const onFileChange = vi.fn();

    render(
      <FileUpload.Root onFileChange={onFileChange} data-testid="root">
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const root = screen.getByTestId('root');
    const file = new File(['content'], 'paste.txt', { type: 'text/plain' });
    const clipboardData = createClipboardData([file]);

    fireEvent.paste(root, {
      clipboardData,
    });

    await waitFor(() => expect(onFileChange).toHaveBeenCalled());

    const latestFiles = onFileChange.mock.calls.at(-1)?.[0];
    expect(latestFiles?.[0].name).toBe('paste.txt');
  });

  it('calls onCancel when file dialog is canceled', async () => {
    const onCancel = vi.fn();

    render(<FileUpload.Root onCancel={onCancel}>{null}</FileUpload.Root>);

    const input = getFileInput();

    Object.defineProperty(input, 'files', {
      value: [],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('calls onFileReject with DUPLICATE_FILE reason when the same file is selected again', async () => {
    const onFileReject = vi.fn();

    render(<FileUpload.Root onFileReject={onFileReject}>{null}</FileUpload.Root>);

    const input = getFileInput();
    const file = new File(['content'], 'dup.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFileReject).toHaveBeenCalledWith(
        expect.any(File),
        'DUPLICATE_FILE',
        expect.objectContaining({
          reason: 'DUPLICATE_FILE',
        }),
      );
    });
  });

  it('calls onFileReject callback with rejected file', async () => {
    const onFileReject = vi.fn();

    render(
      <FileUpload.Root accept="image/*" onFileReject={onFileReject}>
        {null}
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    // Simulate file input change
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    expect(onFileReject).toHaveBeenCalledWith(
      file,
      'MIME_TYPE_NOT_ALLOWED',
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it('accepts files when accept includes file extensions', async () => {
    const onFileChange = vi.fn();
    const onFileReject = vi.fn();

    render(
      <FileUpload.Root accept=".txt" onFileChange={onFileChange} onFileReject={onFileReject}>
        {null}
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'READme.TXT', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFileChange).toHaveBeenCalled());
    expect(onFileReject).not.toHaveBeenCalled();
  });

  it('uses custom validator to reject files', async () => {
    const onFileChange = vi.fn();
    const onFileReject = vi.fn();
    const validator = vi.fn().mockReturnValue('Blocked by policy');

    render(
      <FileUpload.Root
        accept="*"
        onFileChange={onFileChange}
        onFileReject={onFileReject}
        validator={validator}
      >
        {null}
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    expect(onFileReject).toHaveBeenCalledWith(
      file,
      'CUSTOM_VALIDATION_FAILED',
      expect.objectContaining({
        message: 'Blocked by policy',
      }),
    );
    const latestFiles = onFileChange.mock.calls.at(-1)?.[0] ?? [];
    expect(latestFiles).not.toEqual(expect.arrayContaining([file]));
    expect(validator).toHaveBeenCalledWith(file);
  });

  it('does not enforce a max file size by default', async () => {
    const onFileChange = vi.fn();
    const onFileReject = vi.fn();

    render(
      <FileUpload.Root onFileChange={onFileChange} onFileReject={onFileReject} accept="*">
        {null}
      </FileUpload.Root>,
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

    await waitFor(() => expect(onFileChange).toHaveBeenCalled());

    expect(onFileReject).not.toHaveBeenCalled();
    const latestFiles = onFileChange.mock.calls.at(-1)?.[0];
    expect(latestFiles?.[0].name).toBe('large.bin');
  });

  it('respects maxSize constraint and rejects oversized files', async () => {
    const onFileReject = vi.fn();
    const onFileChange = vi.fn();

    render(
      <FileUpload.Root maxSize={1024} onFileReject={onFileReject} onFileChange={onFileChange}>
        {null}
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const largeFile = new File([new Uint8Array(2048)], 'large.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    expect(onFileReject).toHaveBeenCalledWith(
      largeFile,
      'FILE_TOO_LARGE',
      expect.objectContaining({
        message: expect.stringContaining('too large'),
      }),
    );
    expect(onFileChange).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ reason: expect.any(String) }),
    );
  });

  it('respects minSize constraint and rejects undersized files', async () => {
    const onFileReject = vi.fn();
    const onFileChange = vi.fn();

    render(
      <FileUpload.Root minSize={1024} onFileReject={onFileReject} onFileChange={onFileChange}>
        {null}
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const tinyFile = new File(['x'], 'tiny.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [tinyFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    expect(onFileReject).toHaveBeenCalledWith(
      tinyFile,
      'FILE_TOO_SMALL',
      expect.objectContaining({
        message: expect.stringContaining('too small'),
      }),
    );
  });

  it('respects maxFiles constraint in single file mode', async () => {
    const onFileChange = vi.fn();

    render(
      <FileUpload.Root maxFiles={1} multiple={false} onFileChange={onFileChange}>
        {null}
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFileChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
        expect.objectContaining({ reason: expect.any(String) }),
      );
    });

    const uploadedFiles = onFileChange.mock.calls.at(-1)?.[0];
    expect(uploadedFiles?.length).toBe(1);
  });

  it('cleans up object URLs on unmount', async () => {
    const { unmount } = render(<FileUpload.Root>{null}</FileUpload.Root>);

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
      <FileUpload.Root>
        <TestComponent />
      </FileUpload.Root>,
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
      <FileUpload.Root disabled>
        <FileUpload.Trigger
          className={(state) => (state.disabled ? 'disabled-trigger' : 'enabled-trigger')}
        >
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled-trigger');
  });

  it('resolves className callback when disabled state changes', () => {
    const { rerender } = render(
      <FileUpload.Root disabled={false}>
        <FileUpload.Trigger
          className={(state) => (state.disabled ? 'disabled-trigger' : 'enabled-trigger')}
        >
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('enabled-trigger');

    rerender(
      <FileUpload.Root disabled>
        <FileUpload.Trigger
          className={(state) => (state.disabled ? 'disabled-trigger' : 'enabled-trigger')}
        >
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('disabled-trigger');
  });

  it('announces file rejection to screen readers', async () => {
    render(<FileUpload.Root accept="image/*">{null}</FileUpload.Root>);

    const input = getFileInput();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Full workflow integration', () => {
    it('supports select via dropzone, view in preview list, and remove', async () => {
      const onFileChange = vi.fn();

      render(
        <FileUpload.Root onFileChange={onFileChange}>
          <FileUpload.Dropzone data-testid="dropzone">Drop files here or click</FileUpload.Dropzone>
          <FileUpload.PreviewList data-testid="preview-list">
            <FileUpload.PreviewItem
              file={
                {
                  id: 'test-1',
                  name: 'test.txt',
                  type: 'text/plain',
                  size: 100,
                  preview: 'blob:test',
                } as any
              }
            >
              <span data-testid="file-name">test.txt</span>
            </FileUpload.PreviewItem>
          </FileUpload.PreviewList>
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('supports multiple file selection at different times', async () => {
      const onFileChange = vi.fn();

      render(
        <FileUpload.Root onFileChange={onFileChange}>
          <FileUpload.Trigger>Upload</FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });

      await userEvent.upload(input, file1);

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test1.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      await userEvent.upload(input, file2);

      await waitFor(() => {
        expect(onFileChange.mock.calls.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Error scenarios', () => {
    it('handles file rejection with error message', async () => {
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root accept="image/*" onFileReject={onFileReject}>
          {null}
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const textFile = new File(['data'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [textFile],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => expect(onFileReject).toHaveBeenCalled());
      expect(onFileReject.mock.calls[0][0]).toBe(textFile);
    });

    it('respects maxSize constraint', async () => {
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root maxSize={100} onFileReject={onFileReject}>
          {null}
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const largeFile = new File([new Uint8Array(200)], 'large.txt', {
        type: 'text/plain',
      });

      Object.defineProperty(input, 'files', {
        value: [largeFile],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    });

    it('respects minSize constraint', async () => {
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root minSize={100} onFileReject={onFileReject}>
          {null}
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const smallFile = new File(['x'], 'small.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [smallFile],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    });
  });

  describe('abort signal support', () => {
    it('provides abort signal for upload tracking', () => {
      function TestComponent() {
        const { getAbortSignal } = FileUpload.useFileUploadContext();
        const [signal, setSignal] = React.useState<AbortSignal | null>(null);

        React.useEffect(() => {
          if (getAbortSignal) {
            const sig = getAbortSignal('test-id');
            setSignal(sig);
          }
        }, [getAbortSignal]);

        return <div>{signal && <div data-testid="has-signal">Has Signal</div>}</div>;
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      expect(screen.getByTestId('has-signal')).toBeInTheDocument();
    });

    it('aborts upload when abortUpload is called', async () => {
      function TestComponent() {
        const context = FileUpload.useFileUploadContext();
        const [aborted, setAborted] = React.useState(false);

        return (
          <div>
            <button
              onClick={() => {
                const signal = context.getAbortSignal('test-id');
                signal.addEventListener('abort', () => setAborted(true));
                context.abortUpload('test-id');
              }}
            >
              Abort Upload
            </button>
            {aborted && <div data-testid="aborted">Aborted</div>}
          </div>
        );
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      const abortButton = screen.getByRole('button', { name: 'Abort Upload' });
      await userEvent.setup().click(abortButton);

      await waitFor(() => {
        expect(screen.getByTestId('aborted')).toBeInTheDocument();
      });
    });
  });

  describe('Resumable uploads (pause/resume)', () => {
    it('exposes pauseFile and resumeFile methods in context', () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        contextValue = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      expect(contextValue).not.toBeNull();
      const context = getTestContext(contextValue);

      expect(typeof context.pauseFile).toBe('function');
      expect(typeof context.resumeFile).toBe('function');
    });

    it('paused file has isPaused flag set to true', () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const context = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
        contextValue = context;
        return null;
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      expect(contextValue).not.toBeNull();

      act(() => {
        getTestContext(contextValue).addFiles([file]);
      });

      act(() => {
        const fileId = getTestContext(contextValue).files[0].id;
        const latestContext = getTestContext(contextValue);
        latestContext.updateFile(fileId, { status: 'uploading' });
        latestContext.pauseFile(fileId);
      });

      expect(getTestContext(contextValue).files[0].isPaused).toBe(true);
    });

    it('resumed file has isPaused flag set to false', () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const context = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
        contextValue = context;
        return null;
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(contextValue).not.toBeNull();

      act(() => {
        getTestContext(contextValue).addFiles([file]);
      });

      act(() => {
        const fileId = getTestContext(contextValue).files[0].id;
        const latestContext = getTestContext(contextValue);
        latestContext.updateFile(fileId, { status: 'uploading' });
        latestContext.pauseFile(fileId);
        latestContext.resumeFile(fileId);
      });

      expect(getTestContext(contextValue).files[0].isPaused).toBe(false);
    });

    it('supports uploadedBytes property for tracking progress', () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const context = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
        contextValue = context;
        return null;
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      const file = new File(['0123456789'], 'test.txt', { type: 'text/plain' });
      expect(contextValue).not.toBeNull();

      act(() => {
        getTestContext(contextValue).addFiles([file]);
      });

      act(() => {
        const fileId = getTestContext(contextValue).files[0].id;
        getTestContext(contextValue).updateFile(fileId, { uploadedBytes: 5, progress: 50 });
      });

      expect(getTestContext(contextValue).files[0].uploadedBytes).toBe(5);
      expect(getTestContext(contextValue).files[0].progress).toBe(50);
    });

    it('does not pause a file that is not uploading', () => {
      const onFilePause = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const context = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
        contextValue = context;
        return null;
      }

      render(
        <FileUpload.Root onFilePause={onFilePause}>
          <TestComponent />
        </FileUpload.Root>,
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(contextValue).not.toBeNull();

      act(() => {
        getTestContext(contextValue).addFiles([file]);
      });

      act(() => {
        const fileId = getTestContext(contextValue).files[0].id;
        getTestContext(contextValue).pauseFile(fileId);
      });

      expect(onFilePause).not.toHaveBeenCalled();
      expect(getTestContext(contextValue).files[0].status).toBe('idle');
    });

    it('does not resume a file that is not paused', () => {
      const onFileResume = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const context = FileUpload.useFileUploadContext() as unknown as TestFileUploadContext;
        contextValue = context;
        return null;
      }

      render(
        <FileUpload.Root onFileResume={onFileResume}>
          <TestComponent />
        </FileUpload.Root>,
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(contextValue).not.toBeNull();

      act(() => {
        getTestContext(contextValue).addFiles([file]);
      });

      act(() => {
        const fileId = getTestContext(contextValue).files[0].id;
        getTestContext(contextValue).resumeFile(fileId);
      });

      expect(onFileResume).not.toHaveBeenCalled();
      expect(getTestContext(contextValue).files[0].status).toBe('idle');
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
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
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
        <FileUpload.Root>
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </FileUpload.Root>,
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
      const onFileChange = vi.fn();

      render(
        <FileUpload.Root maxFiles={3} multiple onFileChange={onFileChange}>
          {null}
        </FileUpload.Root>,
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
        expect(onFileChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test1.txt' }),
            expect.objectContaining({ name: 'test2.txt' }),
            expect.objectContaining({ name: 'test3.txt' }),
          ]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      expect(onFileChange.mock.calls[0][0]).toHaveLength(3);
    });

    it('announces max files reached message', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <FileUpload.Root maxFiles={2} multiple>
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </FileUpload.Root>,
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

    it('calls onFileReject with MAX_FILES_REACHED when selecting more than maxFiles at once', async () => {
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root maxFiles={2} multiple onFileReject={onFileReject}>
          {null}
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
        new File(['content3'], 'test3.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(onFileReject).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'test3.txt' }),
          'MAX_FILES_REACHED',
          expect.objectContaining({
            reason: 'MAX_FILES_REACHED',
            message: 'Cannot add files. Limit of 2 reached.',
          }),
        );
      });
    });

    it('calls onFileReject with MAX_FILES_REACHED when trying to add files after reaching the limit', async () => {
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root maxFiles={2} multiple onFileReject={onFileReject}>
          {null}
        </FileUpload.Root>,
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

      onFileReject.mockClear();

      fireEvent.change(input, {
        target: {
          files: [new File(['content3'], 'test3.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(onFileReject).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'test3.txt' }),
          'MAX_FILES_REACHED',
          expect.objectContaining({
            reason: 'MAX_FILES_REACHED',
            message: 'Cannot add files. Limit of 2 reached.',
          }),
        );
      });
    });

    it('allows adding files up to the limit in increments', async () => {
      const onFileChange = vi.fn();

      render(
        <FileUpload.Root maxFiles={5} multiple onFileChange={onFileChange}>
          {null}
        </FileUpload.Root>,
      );

      const input = getFileInput();

      // Add 2 files
      const firstBatch = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files: firstBatch } });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
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
        expect(onFileChange).toHaveBeenCalledWith(
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

      expect(onFileChange.mock.calls[onFileChange.mock.calls.length - 1][0]).toHaveLength(5);
    });

    it('fills remaining slots with later valid files when earlier files are rejected', async () => {
      const onFileChange = vi.fn();
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root
          maxFiles={3}
          maxSize={1024}
          multiple
          onFileChange={onFileChange}
          onFileReject={onFileReject}
        >
          {null}
        </FileUpload.Root>,
      );

      const input = getFileInput();

      fireEvent.change(input, {
        target: {
          files: [new File(['ok'], 'existing.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'existing.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });

      onFileChange.mockClear();

      const oversized = new File([new Uint8Array(2048)], 'too-large.txt', { type: 'text/plain' });
      const validA = new File(['a'], 'valid-a.txt', { type: 'text/plain' });
      const validB = new File(['b'], 'valid-b.txt', { type: 'text/plain' });

      fireEvent.change(input, {
        target: {
          files: [oversized, validA, validB],
        },
      });

      await waitFor(() => {
        const latestFiles = onFileChange.mock.calls.at(-1)?.[0] ?? [];
        expect(latestFiles).toHaveLength(3);
        expect(latestFiles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'existing.txt' }),
            expect.objectContaining({ name: 'valid-a.txt' }),
            expect.objectContaining({ name: 'valid-b.txt' }),
          ]),
        );
      });

      expect(onFileReject).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'too-large.txt' }),
        'FILE_TOO_LARGE',
        expect.objectContaining({ reason: 'FILE_TOO_LARGE' }),
      );
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
        <FileUpload.Root maxFiles={3} multiple>
          <TestComponent />
        </FileUpload.Root>,
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
        <FileUpload.Root maxFiles={4} multiple>
          <TestComponent />
        </FileUpload.Root>,
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
  });

  describe('onFileChange callback', () => {
    it('calls onFileChange when files are added', async () => {
      const onFileChange = vi.fn();

      render(<FileUpload.Root onFileChange={onFileChange}>{null}</FileUpload.Root>);

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('calls onFileChange when a file is removed', async () => {
      const onFileChange = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <FileUpload.Root onFileChange={onFileChange}>
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalled();
      });

      onFileChange.mockClear();

      const fileId = getTestContext(contextValue).files[0].id;

      act(() => {
        getTestContext(contextValue).removeFile(fileId);
      });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          [],
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('calls onFileChange when all files are cleared', async () => {
      const onFileChange = vi.fn();
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <FileUpload.Root onFileChange={onFileChange}>
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = getFileInput();
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
      ];

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalled();
      });

      onFileChange.mockClear();

      act(() => {
        getTestContext(contextValue).clearFiles();
      });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          [],
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });

    it('provides extended file properties in onFileChange', async () => {
      const onFileChange = vi.fn();

      render(<FileUpload.Root onFileChange={onFileChange}>{null}</FileUpload.Root>);

      const input = getFileInput();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFileChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test.txt',
              id: expect.any(String),
              preview: expect.stringContaining('blob:'),
              status: 'idle',
              progress: 0,
            }),
          ]),
          expect.objectContaining({ reason: expect.any(String) }),
        );
      });
    });
  });

  describe('File property preservation', () => {
    it('preserves File size property', async () => {
      let contextValue: TestFileUploadContext | null = null;

      function TestComponent() {
        const ctx = FileUpload.useFileUploadContext();
        contextValue = ctx as unknown as TestFileUploadContext;
        return null;
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
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
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
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
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
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
  });
});
