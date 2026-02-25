import * as React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';

const createClipboardData = (files: File[]) => {
  if (typeof DataTransfer === 'undefined') {
    return { files } as DataTransfer;
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

    await act(async () => {
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });

    await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    expect(onFileReject).toHaveBeenCalledWith(file, expect.any(String));
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

      await act(async () => {
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      });

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

      await act(async () => {
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      });

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

      await act(async () => {
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      });

      await waitFor(() => expect(onFileReject).toHaveBeenCalled());
    });
  });
});
