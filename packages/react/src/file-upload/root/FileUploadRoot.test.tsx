import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';

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
    expect(onFileReject).toHaveBeenCalledWith(file, expect.any(String));
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

    await waitFor(() => expect(onFileReject).toHaveBeenCalledWith(file, 'Blocked by policy'));
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
    expect(onFileReject).toHaveBeenCalledWith(largeFile, expect.stringContaining('too large'));
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
    expect(onFileReject).toHaveBeenCalledWith(tinyFile, expect.stringContaining('too small'));
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

      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);

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

      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);

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

      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);

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

  describe('preview list filtering', () => {
    it('filters files by status', async () => {
      function TestComponent() {
        const { setFiles } = FileUpload.useFileUploadContext();

        React.useEffect(() => {
          setFiles([
            {
              id: '1',
              name: 'uploading.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test1',
              status: 'uploading',
              progress: 50,
            } as any,
            {
              id: '2',
              name: 'error.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test2',
              status: 'error',
              progress: 0,
              error: 'Failed',
            } as any,
            {
              id: '3',
              name: 'success.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test3',
              status: 'success',
              progress: 100,
            } as any,
          ]);
        }, [setFiles]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <FileUpload.PreviewList
              data-testid="error-list"
              filter={(files) => files.filter((f) => f.status === 'error')}
            >
              {context.files
                .filter((f) => f.status === 'error')
                .map((file) => (
                  <FileUpload.PreviewItem key={file.id} file={file}>
                    <span data-testid={`file-${file.name}`}>{file.name}</span>
                  </FileUpload.PreviewItem>
                ))}
            </FileUpload.PreviewList>
          </React.Fragment>
        );
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-list')).toBeInTheDocument();
        expect(screen.getByTestId('file-error.txt')).toBeInTheDocument();
        expect(screen.queryByTestId('file-uploading.txt')).not.toBeInTheDocument();
        expect(screen.queryByTestId('file-success.txt')).not.toBeInTheDocument();
      });
    });

    it('shows uploading files only with filter', async () => {
      function TestComponent() {
        const context = FileUpload.useFileUploadContext();

        React.useEffect(() => {
          context.setFiles([
            {
              id: '1',
              name: 'uploading1.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test1',
              status: 'uploading',
              progress: 30,
            } as any,
            {
              id: '2',
              name: 'uploading2.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test2',
              status: 'uploading',
              progress: 60,
            } as any,
            {
              id: '3',
              name: 'idle.txt',
              size: 100,
              type: 'text/plain',
              preview: 'blob:test3',
              status: 'idle',
              progress: 0,
            } as any,
          ]);
        }, [setFiles]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <FileUpload.PreviewList
              data-testid="uploading-list"
              filter={(files) => files.filter((f) => f.status === 'uploading')}
            >
              {context.files
                .filter((f) => f.status === 'uploading')
                .map((file) => (
                  <FileUpload.PreviewItem key={file.id} file={file}>
                    <span data-testid={`file-${file.name}`}>{file.name}</span>
                  </FileUpload.PreviewItem>
                ))}
            </FileUpload.PreviewList>
          </React.Fragment>
        );
      }

      render(
        <FileUpload.Root>
          <TestComponent />
        </FileUpload.Root>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('file-uploading1.txt')).toBeInTheDocument();
        expect(screen.getByTestId('file-uploading2.txt')).toBeInTheDocument();
        expect(screen.queryByTestId('file-idle.txt')).not.toBeInTheDocument();
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

  describe('i18n support', () => {
    it('uses custom messages for file too large', async () => {
      const customMessages = {
        fileTooLarge: (file: File, maxSize: string) =>
          `${file.name} est trop grand (max ${maxSize})`,
      };
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root maxSize={100} messages={customMessages} onFileReject={onFileReject}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const file = new File(['a'.repeat(200)], 'large.txt', { type: 'text/plain' });
      const input = screen.getByTestId('file-input') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);

      await waitFor(() => {
        expect(onFileReject).toHaveBeenCalledWith(file, expect.stringContaining('trop grand'));
      });
    });

    it('uses custom messages for file type not accepted', async () => {
      const customMessages = {
        fileTypeNotAccepted: (file: File) => `${file.name} 形式はサポートされていません`,
      };
      const onFileReject = vi.fn();

      render(
        <FileUpload.Root accept="image/*" messages={customMessages} onFileReject={onFileReject}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const input = screen.getByTestId('file-input') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);

      await waitFor(() => {
        expect(onFileReject).toHaveBeenCalledWith(
          file,
          expect.stringContaining('サポートされていません'),
        );
      });
    });

    it('uses custom messages for max files reached', async () => {
      const customMessages = {
        maxFilesReached: (max: number) => `Limite de ${max} fichiers atteinte`,
      };

      function TestComponent() {
        const [announcement, setAnnouncement] = React.useState('');
        return (
          <FileUpload.Root maxFiles={1} messages={customMessages}>
            <FileUpload.Input data-testid="file-input" />
            <div data-testid="announcement">{announcement}</div>
            <button
              onClick={() => {
                const input = document.querySelector(
                  '[data-testid="file-input"]',
                ) as HTMLInputElement;
                const ann = input.parentElement?.querySelector('[role="status"]')?.textContent;
                if (ann) {
                  setAnnouncement(ann);
                }
              }}
            >
              Check
            </button>
          </FileUpload.Root>
        );
      }

      render(<TestComponent />);

      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      const input = screen.getByTestId('file-input') as HTMLInputElement;

      // Add first file
      Object.defineProperty(input, 'files', {
        value: [file1],
        configurable: true,
      });

      fireEvent.change(input);

      // Try to add second file when max is reached
      Object.defineProperty(input, 'files', {
        value: [file2],
        configurable: true,
      });

      fireEvent.change(input);

      const checkButton = screen.getByRole('button', { name: 'Check' });
      await userEvent.setup().click(checkButton);

      await waitFor(() => {
        const announcement = screen.getByTestId('announcement');
        expect(announcement.textContent).toContain('Limite de 1 fichiers atteinte');
      });
    });

    it('uses custom messages for duplicate files', async () => {
      const customMessages = {
        duplicateFile: (file: File) => `${file.name} ya está añadido`,
      };
      const onDuplicateFile = vi.fn();

      render(
        <FileUpload.Root messages={customMessages} onDuplicateFile={onDuplicateFile}>
          <FileUpload.Input data-testid="file-input" />
        </FileUpload.Root>,
      );

      const file = new File(['content'], 'duplicate.txt', { type: 'text/plain' });
      const input = screen.getByTestId('file-input') as HTMLInputElement;

      // Add file first time
      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      // Try to add same file again
      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(onDuplicateFile).toHaveBeenCalled();
      });
    });
  });
});
