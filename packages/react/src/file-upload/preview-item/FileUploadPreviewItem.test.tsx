import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';
import { useFileUploadPreviewItem } from './FileUploadPreviewItem';
import { useFileUploadContext } from '../root/FileUploadContext';

function getFileInput() {
  const input = document.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected hidden file input to be rendered');
  }

  return input;
}

describe('FileUpload.PreviewItem', () => {
  const createMockFile = (name: string, type: string) =>
    Object.assign(new File(['content'], name, { type }), {
      id: `id-${name}`,
      preview: `blob:${name}`,
      status: 'idle' as const,
      progress: 0,
    });

  it('renders as li element', async () => {
    const file = createMockFile('test.txt', 'text/plain');
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem file={file}>File content</FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      const listItem = screen.getByText('File content').closest('li');
      expect(listItem).toBeInTheDocument();
    });
  });

  it('provides file context to children', async () => {
    function TestChild() {
      const { file } = useFileUploadPreviewItem();
      return <span data-testid="file-info">{file.name}</span>;
    }

    render(
      <FileUpload.Root>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem
            file={createMockFile('test.txt', 'text/plain')}
            data-testid="preview-item"
          >
            <TestChild />
          </FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      expect(screen.getByTestId('file-info')).toHaveTextContent('test.txt');
    });
  });

  it('provides onRemove callback through context', async () => {
    const onFileChange = vi.fn();

    function TestChild() {
      const { file, onRemove } = useFileUploadPreviewItem();
      return (
        <button type="button" onClick={onRemove}>
          Remove {file.name}
        </button>
      );
    }

    function PreviewListWithFiles() {
      const { files } = useFileUploadContext();
      return (
        <FileUpload.PreviewList>
          {files.map((file) => (
            <FileUpload.PreviewItem key={file.id} file={file}>
              <TestChild />
            </FileUpload.PreviewItem>
          ))}
        </FileUpload.PreviewList>
      );
    }

    render(
      <FileUpload.Root onFileChange={onFileChange}>
        <PreviewListWithFiles />
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Remove test.txt/ })).toBeInTheDocument();
    });

    // onFileChange should have been called once with the uploaded file
    expect(onFileChange).toHaveBeenCalledTimes(1);
    const firstCall = onFileChange.mock.calls[0][0];
    expect(firstCall).toHaveLength(1);
    expect(firstCall[0].name).toBe('test.txt');

    const removeButton = screen.getByRole('button', { name: /Remove test.txt/ });
    await userEvent.click(removeButton);

    await waitFor(() => {
      // After removal, onFileChange should be called with empty array
      expect(onFileChange).toHaveBeenCalledTimes(2);
      const secondCall = onFileChange.mock.calls[1][0];
      expect(secondCall).toHaveLength(0);
    });
  });

  it('forwards ref to li element', async () => {
    const ref = React.createRef<HTMLLIElement>();
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem ref={ref} file={createMockFile('test.txt', 'text/plain')}>
            Content
          </FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLLIElement);
    });
  });

  it('applies custom props to li element', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem
            file={createMockFile('test.txt', 'text/plain')}
            data-testid="custom-item"
            className="custom-class"
          >
            Content
          </FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      const item = screen.getByTestId('custom-item');
      expect(item).toHaveClass('custom-class');
    });
  });

  it('renders multiple preview items', async () => {
    render(
      <FileUpload.Root multiple>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem
            file={createMockFile('file1.txt', 'text/plain')}
            data-testid="item-1"
          >
            File 1
          </FileUpload.PreviewItem>
          <FileUpload.PreviewItem
            file={createMockFile('file2.txt', 'text/plain')}
            data-testid="item-2"
          >
            File 2
          </FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => {
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });
  });

  it('throws error when useFileUploadPreviewItem is used outside context', () => {
    function TestComponent() {
      useFileUploadPreviewItem();
      return null;
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow(
      'Base UI: FileUploadPreviewItemContext is missing. File upload preview parts must be placed within <FileUpload.PreviewItem>.',
    );

    consoleSpy.mockRestore();
  });

  it('provides file with all extended properties', async () => {
    function TestChild() {
      const { file } = useFileUploadPreviewItem();
      return (
        <div data-testid="file-details">
          <span data-testid="name">{file.name}</span>
          <span data-testid="type">{file.type}</span>
          <span data-testid="status">{file.status}</span>
          <span data-testid="progress">{file.progress}</span>
          <span data-testid="preview">{file.preview}</span>
        </div>
      );
    }

    const mockFile = createMockFile('test.txt', 'text/plain');
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem file={mockFile}>
            <TestChild />
          </FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('test.txt');
      expect(screen.getByTestId('type')).toHaveTextContent('text/plain');
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
      expect(screen.getByTestId('progress')).toHaveTextContent('0');
      expect(screen.getByTestId('preview')).toHaveTextContent('blob:test.txt');
    });
  });

  it('resolves className callback', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList>
          <FileUpload.PreviewItem
            file={createMockFile('test.txt', 'text/plain')}
            className={() => 'preview-item-class'}
            data-testid="preview-item"
          >
            Item content
          </FileUpload.PreviewItem>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = getFileInput();
    const uploadFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, uploadFile);

    await waitFor(() => {
      const item = screen.getByTestId('preview-item');
      expect(item?.className).toContain('preview-item-class');
    });
  });
});
