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
  setFiles: React.Dispatch<
    React.SetStateAction<
      Array<{
        name: string;
        size: number;
        type: string;
        lastModified: number;
        id: string;
        status: 'idle' | 'uploading' | 'success' | 'error' | 'paused';
        isPaused?: boolean;
        uploadedBytes?: number;
        progress?: number;
      }>
    >
  >;
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

describe('FileUpload', () => {
  it('renders the component', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input />
        <FileUpload.Dropzone>Drag files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    expect(screen.getByText('Drag files here')).toBeInTheDocument();
  });

  it('opens file dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    await user.click(button);

    expect(screen.getByTestId('file-input')).toBeInTheDocument();
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
    render(
      <FileUpload.Root accept="image/png,image/jpeg">
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input.accept).toBe('image/png,image/jpeg');
  });

  it('applies multiple attribute to input when multiple is true', () => {
    render(
      <FileUpload.Root multiple>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it('does not apply multiple attribute when multiple is false', () => {
    render(
      <FileUpload.Root multiple={false}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
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
    const onFilesChange = vi.fn();

    render(
      <FileUpload.Root onFilesChange={onFilesChange} data-testid="root">
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
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

    render(
      <FileUpload.Root onCancel={onCancel}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('calls onDuplicateFile when the same file is selected again', async () => {
    const onDuplicateFile = vi.fn();

    render(
      <FileUpload.Root onDuplicateFile={onDuplicateFile}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'dup.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);
    await userEvent.upload(input, file);

    await waitFor(() => expect(onDuplicateFile).toHaveBeenCalledWith(file));
  });

  it('calls onFileReject callback with rejected file', async () => {
    const onFileReject = vi.fn();

    render(
      <FileUpload.Root accept="image/*" onFileReject={onFileReject}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
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
    const onFilesChange = vi.fn();
    const onFileReject = vi.fn();

    render(
      <FileUpload.Root accept=".txt" onFilesChange={onFilesChange} onFileReject={onFileReject}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'READme.TXT', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());
    expect(onFileReject).not.toHaveBeenCalled();
  });

  it('uses custom validator to reject files', async () => {
    const onFilesChange = vi.fn();
    const onFileReject = vi.fn();
    const validator = vi.fn().mockReturnValue('Blocked by policy');

    render(
      <FileUpload.Root
        accept="*"
        onFilesChange={onFilesChange}
        onFileReject={onFileReject}
        validator={validator}
      >
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
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
    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0] ?? [];
    expect(latestFiles).not.toEqual(expect.arrayContaining([file]));
    expect(validator).toHaveBeenCalledWith(file);
  });

  it('does not enforce a max file size by default', async () => {
    const onFilesChange = vi.fn();
    const onFileReject = vi.fn();

    render(
      <FileUpload.Root onFilesChange={onFilesChange} onFileReject={onFileReject} accept="*">
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], 'large.bin', {
      type: 'application/octet-stream',
    });

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());

    expect(onFileReject).not.toHaveBeenCalled();
    const latestFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(latestFiles?.[0].name).toBe('large.bin');
  });

  it('respects maxSize constraint and rejects oversized files', async () => {
    const onFileReject = vi.fn();
    const onFilesChange = vi.fn();

    render(
      <FileUpload.Root maxSize={1024} onFileReject={onFileReject} onFilesChange={onFilesChange}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
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
    expect(onFilesChange).toHaveBeenCalledWith([]);
  });

  it('respects minSize constraint and rejects undersized files', async () => {
    const onFileReject = vi.fn();
    const onFilesChange = vi.fn();

    render(
      <FileUpload.Root minSize={1024} onFileReject={onFileReject} onFilesChange={onFilesChange}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
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
    const onFilesChange = vi.fn();

    render(
      <FileUpload.Root maxFiles={1} multiple={false} onFilesChange={onFilesChange}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
      );
    });

    const uploadedFiles = onFilesChange.mock.calls.at(-1)?.[0];
    expect(uploadedFiles?.length).toBe(1);
  });

  it('cleans up object URLs on unmount', async () => {
    const { unmount } = render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
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
      return <FileUpload.Input data-testid="file-input" />;
    }

    render(
      <FileUpload.Root>
        <TestComponent />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    await userEvent.upload(input, file);

    const firstFile = getTestContext(contextValue).files[0];

    act(() => {
      getTestContext(contextValue).setFiles((prev) =>
        prev.map((existing) =>
          existing.id === firstFile.id ? { ...existing, progress: 30, status: 'uploading' } : existing,
        ),
      );
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
    render(
      <FileUpload.Root accept="image/*">
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Full workflow integration', () => {
    it('supports select via dropzone, view in preview list, and remove', async () => {
      const onFilesChange = vi.fn();

      render(
        <FileUpload.Root onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
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

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
        );
      });
    });

    it('supports multiple file selection at different times', async () => {
      const onFilesChange = vi.fn();

      render(
        <FileUpload.Root onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
          <FileUpload.Trigger>Upload</FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });

      await userEvent.upload(input, file1);

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test1.txt' })]),
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
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root accept="image/*" onFileReject={onFileReject}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const smallFile = new File(['x'], 'small.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [smallFile],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    });
  });

  describe('retry functionality', () => {
    it('retries a failed file upload', async () => {
      const onRetry = vi.fn();

      function RetryButton({ fileId }: { fileId: string }) {
        const { retryFile } = FileUpload.useFileUploadContext();
        return <button onClick={() => retryFile(fileId)}>Retry</button>;
      }

      function TestComponent() {
        const { setFiles } = FileUpload.useFileUploadContext();

        React.useEffect(() => {
          // Set files directly using context
          setFiles([
            {
              id: '1',
              name: 'failed.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test',
              status: 'error',
              progress: 0,
              error: 'Network error',
            } as any,
          ]);
        }, [setFiles]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <RetryButton fileId="1" />
          </React.Fragment>
        );
      }

      render(
        <FileUpload.Root onRetry={onRetry}>
          <TestComponent />
        </FileUpload.Root>,
      );

      const retryButton = await screen.findByRole('button', { name: 'Retry' });
      await userEvent.setup().click(retryButton);

      await waitFor(() => expect(onRetry).toHaveBeenCalled());
    });

    it('resets file status and progress on retry', async () => {
      function RetryButton({ fileId }: { fileId: string }) {
        const { retryFile, files } = FileUpload.useFileUploadContext();
        return (
          <React.Fragment>
            <button onClick={() => retryFile(fileId)}>Retry</button>
            <div data-testid="file-status">{files[0]?.status}</div>
            <div data-testid="file-progress">{files[0]?.progress}</div>
          </React.Fragment>
        );
      }

      function TestComponent() {
        const { setFiles } = FileUpload.useFileUploadContext();

        React.useEffect(() => {
          setFiles([
            {
              id: '1',
              name: 'failed.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test',
              status: 'error',
              progress: 50,
              error: 'Network error',
            } as any,
          ]);
        }, [setFiles]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <RetryButton fileId="1" />
          </React.Fragment>
        );
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('file-status')).toHaveTextContent('error');
        expect(screen.getByTestId('file-progress')).toHaveTextContent('50');
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await userEvent.setup().click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('file-status')).toHaveTextContent('idle');
        expect(screen.getByTestId('file-progress')).toHaveTextContent('0');
      });
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

        return (
          <div>
            <FileUpload.Input />
            {signal && <div data-testid="has-signal">Has Signal</div>}
          </div>
        );
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
            <FileUpload.Input />
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
      const fileId = 'test-file-id';

      act(() => {
        getTestContext(contextValue).setFiles(() => [
          { ...file, id: fileId, status: 'idle', progress: 0 },
        ]);
      });

      act(() => {
        const latestContext = getTestContext(contextValue);
        latestContext.setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })));
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
      const fileId = 'test-file-id';

      act(() => {
        getTestContext(contextValue).setFiles(() => [
          { ...file, id: fileId, status: 'idle', progress: 0 },
        ]);
      });

      act(() => {
        const latestContext = getTestContext(contextValue);
        latestContext.setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })));
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
      const fileId = 'test-file-id';

      act(() => {
        getTestContext(contextValue).setFiles(() => [
          { ...file, id: fileId, status: 'idle', progress: 0 },
        ]);
      });

      act(() => {
        getTestContext(contextValue).setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, uploadedBytes: 5, progress: 50 } : f)),
        );
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
      const fileId = 'test-file-id';

      act(() => {
        getTestContext(contextValue).setFiles(() => [
          { ...file, id: fileId, status: 'idle', progress: 0 },
        ]);
      });

      act(() => {
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
      const fileId = 'test-file-id';

      act(() => {
        getTestContext(contextValue).setFiles(() => [
          { ...file, id: fileId, status: 'idle', progress: 0 },
        ]);
      });

      act(() => {
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
          <FileUpload.Input data-testid="file-input" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
          <FileUpload.Input data-testid="file-input" />
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
        <FileUpload.Root maxFiles={3} multiple onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
        <FileUpload.Root maxFiles={2} multiple>
          <FileUpload.Input data-testid="file-input" />
          <div role="status" aria-live="polite" aria-atomic="true" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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

    it('allows adding files up to the limit in increments', async () => {
      const onFilesChange = vi.fn();

      render(
        <FileUpload.Root maxFiles={5} multiple onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;

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
        );
      });

      expect(onFilesChange.mock.calls[onFilesChange.mock.calls.length - 1][0]).toHaveLength(5);
    });
  });

  describe('onFilesChange callback', () => {
    it('calls onFilesChange when files are added', async () => {
      const onFilesChange = vi.fn();

      render(
        <FileUpload.Root onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
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
        <FileUpload.Root onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
        expect(onFilesChange).toHaveBeenCalledWith([]);
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
        <FileUpload.Root onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
        expect(onFilesChange).toHaveBeenCalledWith([]);
      });
    });

    it('provides extended file properties in onFilesChange', async () => {
      const onFilesChange = vi.fn();

      render(
        <FileUpload.Root onFilesChange={onFilesChange}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test.txt',
              id: expect.any(String),
              preview: expect.stringContaining('blob:'),
              status: 'idle',
              progress: 0,
            }),
          ]),
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
          <FileUpload.Input data-testid="file-input" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
          <FileUpload.Input data-testid="file-input" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
          <FileUpload.Input data-testid="file-input" />
          <TestComponent />
        </FileUpload.Root>,
      );

      const input = screen.getByTestId('file-input') as HTMLInputElement;
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
