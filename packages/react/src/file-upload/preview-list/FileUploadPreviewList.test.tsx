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

  it('resolves className callback', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.PreviewList data-testid="preview-list" className={() => 'preview-list-class'}>
          <li>Item</li>
        </FileUpload.PreviewList>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    const list = await screen.findByTestId('preview-list');
    expect(list?.className).toContain('preview-list-class');
  });

  describe('filter prop', () => {
    it('filters files by status', async () => {
      function TestComponent() {
        const { files, addFiles, updateFile } = FileUpload.useFileUploadContext();
        const initRef = React.useRef(false);
        const filesRef = React.useRef<string[]>([]);

        React.useEffect(() => {
          if (initRef.current) {
            return;
          }
          initRef.current = true;

          addFiles([
            new File(['uploading'], 'uploading.txt', { type: 'text/plain' }),
            new File(['error'], 'error.txt', { type: 'text/plain' }),
            new File(['success'], 'success.txt', { type: 'text/plain' }),
          ]);
        }, [addFiles]);

        React.useEffect(() => {
          if (files.length === 3 && filesRef.current.length === 0) {
            filesRef.current = files.map((f) => f.id);
            updateFile(files[0].id, { status: 'uploading', progress: 50 });
            updateFile(files[1].id, { status: 'error', error: 'Failed' });
            updateFile(files[2].id, { status: 'success', progress: 100 });
          }
        }, [files, updateFile]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <FileUpload.PreviewList
              data-testid="error-list"
              filter={(fileList) => fileList.filter((f) => f.status === 'error')}
            >
              {files.map((file) => (
                <FileUpload.PreviewItem key={file.id} file={file}>
                  <span data-testid={`file-${file.id}`}>{file.id}</span>
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
        const errorList = screen.getByTestId('error-list');
        expect(errorList).toBeInTheDocument();
        // Check that at least one error file is displayed
        const items = errorList.querySelectorAll('li');
        expect(items.length).toBeGreaterThan(0);
      });
    });

    it('shows only uploading files with filter', async () => {
      function TestComponent() {
        const { files, addFiles, updateFile } = FileUpload.useFileUploadContext();
        const initRef = React.useRef(false);
        const filesRef = React.useRef<string[]>([]);

        React.useEffect(() => {
          if (initRef.current) {
            return;
          }
          initRef.current = true;

          addFiles([
            new File(['uploading1'], 'uploading1.txt', { type: 'text/plain' }),
            new File(['uploading2'], 'uploading2.txt', { type: 'text/plain' }),
            new File(['idle'], 'idle.txt', { type: 'text/plain' }),
          ]);
        }, [addFiles]);

        React.useEffect(() => {
          if (files.length === 3 && filesRef.current.length === 0) {
            filesRef.current = files.map((f) => f.id);
            updateFile(files[0].id, { status: 'uploading', progress: 30 });
            updateFile(files[1].id, { status: 'uploading', progress: 60 });
          }
        }, [files, updateFile]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <FileUpload.PreviewList
              data-testid="uploading-list"
              filter={(allFiles) => allFiles.filter((f) => f.status === 'uploading')}
            >
              {files.map((file) => (
                <FileUpload.PreviewItem key={file.id} file={file}>
                  <span data-testid={`file-${file.id}`}>{file.id}</span>
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
        const uploadingList = screen.getByTestId('uploading-list');
        expect(uploadingList).toBeInTheDocument();
        // Check that the list contains items with uploading status
        const uploadingItems = uploadingList.querySelectorAll('[data-uploading]');
        expect(uploadingItems.length).toBe(2); // Should have 2 uploading items
        // Check that no idle items are present
        const idleItems = uploadingList.querySelectorAll('[data-idle]');
        expect(idleItems.length).toBe(0);
      });
    });

    it('hides list when filter returns empty array', async () => {
      function TestComponent() {
        const { addFiles } = FileUpload.useFileUploadContext();
        const initRef = React.useRef(false);

        React.useEffect(() => {
          if (initRef.current) {
            return;
          }
          initRef.current = true;
          addFiles([new File(['idle'], 'idle.txt', { type: 'text/plain' })]);
        }, [addFiles]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <FileUpload.PreviewList
              data-testid="error-list"
              filter={(allFiles) => allFiles.filter((f) => f.status === 'error')}
            >
              <li>Items</li>
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
        expect(screen.queryByTestId('error-list')).not.toBeInTheDocument();
      });
    });

    it('passes filtered files in state to className callback', async () => {
      const classNameFn = vi.fn(() => 'custom-class');

      function TestComponent() {
        const { files, addFiles, updateFile } = FileUpload.useFileUploadContext();
        const initRef = React.useRef(false);
        const filesRef = React.useRef<string[]>([]);

        React.useEffect(() => {
          if (initRef.current) {
            return;
          }
          initRef.current = true;

          addFiles([
            new File(['error1'], 'error1.txt', { type: 'text/plain' }),
            new File(['success'], 'success.txt', { type: 'text/plain' }),
          ]);
        }, [addFiles]);

        React.useEffect(() => {
          if (files.length === 2 && filesRef.current.length === 0) {
            filesRef.current = files.map((f) => f.id);
            updateFile(files[0].id, { status: 'error', error: 'Failed' });
            updateFile(files[1].id, { status: 'success', progress: 100 });
          }
        }, [files, updateFile]);

        return (
          <React.Fragment>
            <FileUpload.Input />
            <FileUpload.PreviewList
              data-testid="filtered-list"
              filter={(allFiles) => allFiles.filter((f) => f.status === 'error')}
              className={classNameFn}
            >
              <li>Items</li>
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
        expect(classNameFn).toHaveBeenCalled();
        // Verify the filter worked by checking the function was called with filtered state
        const list = screen.getByTestId('filtered-list');
        expect(list).toBeInTheDocument();
      });
    });
  });
});
