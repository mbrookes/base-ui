import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { FileUpload } from '../index';

describe('FileUpload.PreviewList', () => {
  it('does not render when there are no files', () => {
    render(
      <FileUpload.Root>
        <FileUpload.PreviewList data-testid="preview-list">
          <li>Item</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    expect(screen.queryByTestId('preview-list')).not.toBeInTheDocument();
  });

  it('renders when files are present', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList data-testid="preview-list">
          <li>Item</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByTestId('preview-list')).toBeInTheDocument();
    });
  });

  it('renders as ul element', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList data-testid="preview-list" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    const list = await screen.findByTestId('preview-list');
    expect(list.tagName).toBe('UL');
  });

  it('forwards ref to ul element', async () => {
    const ref = React.createRef<HTMLUListElement>();
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList ref={ref}>
          <li>Item</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLUListElement);
    });
  });

  it('applies custom props to ul element', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList
          data-testid="custom-list"
          className="custom-class"
          aria-label="File list"
        >
          <li>Item</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    const list = await screen.findByTestId('custom-list');
    expect(list).toHaveClass('custom-class');
    expect(list).toHaveAttribute('aria-label', 'File list');
  });

  it('renders children when files are present', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList>
          <li>Static Item 1</li>
          <li>Static Item 2</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Static Item 1')).toBeInTheDocument();
      expect(screen.getByText('Static Item 2')).toBeInTheDocument();
    });
  });

  it('dynamically shows/hides based on file count', async () => {
    function TestComponent() {
      const [files, setFiles] = React.useState<any[]>([]);

      return (
        <FileUpload.Root onFilesChange={setFiles}>
          <FileUpload.Input data-testid="file-input" />
          <FileUpload.PreviewList data-testid="preview-list">
            {files.map((file) => (
              <FileUpload.PreviewItem key={file.id} file={file}>
                <span>{file.name}</span>
              </FileUpload.PreviewItem>
            ))}
          </FileUpload.PreviewList>
        </FileUpload.Root>
      );
    }

    render(<TestComponent />);

    // Initially no list
    expect(screen.queryByTestId('preview-list')).not.toBeInTheDocument();

    // Upload file
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(input, file);

    // List appears
    await screen.findByTestId('preview-list');
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('works with multiple files', async () => {
    render(
      <FileUpload.Root multiple>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList data-testid="preview-list">
          <li>Items</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => {
      expect(screen.getByTestId('preview-list')).toBeInTheDocument();
    });
  });
});
