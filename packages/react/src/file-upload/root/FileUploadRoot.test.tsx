import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';

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
    const user = userEvent.setup();

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

    await user.pointer({ target: dropzone, keys: '[MouseL>]' });
    const dragEvent = new Event('dragenter', {
      bubbles: true,
      cancelable: true,
    });
    dropzone.dispatchEvent(dragEvent);

    expect(dropzone).toHaveAttribute('data-dragging', '');
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

    const event = new Event('change', { bubbles: true });

    input.dispatchEvent(event);

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
});
