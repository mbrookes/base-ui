import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';

describe('FileUpload.Input', () => {
  it('renders a hidden file input', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveStyle({ display: 'none' });
  });

  it('applies accept attribute from context', () => {
    render(
      <FileUpload.Root accept="image/*">
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('applies multiple attribute when multiple is true', () => {
    render(
      <FileUpload.Root multiple>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(input).toHaveAttribute('multiple');
  });

  it('applies directory attributes when directory is true', () => {
    render(
      <FileUpload.Root directory>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(input).toHaveAttribute('webkitdirectory');
    expect(input).toHaveAttribute('directory');
    expect(input).toHaveAttribute('multiple');
  });

  it('does not apply multiple attribute when multiple is false', () => {
    render(
      <FileUpload.Root multiple={false}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input?.multiple).toBe(false);
  });

  it('disables input when disabled prop is true', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(input).toBeDisabled();
  });

  it('calls addFiles when files are selected', async () => {
    const onFilesChange = vi.fn();
    render(
      <FileUpload.Root onFilesChange={onFilesChange}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'test.txt',
            type: 'text/plain',
          }),
        ]),
      );
    });
  });

  it('resets input value after file selection', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <FileUpload.Root>
        <FileUpload.Input ref={ref} data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(ref.current).toBe(input);
  });

  it('applies custom props to input element', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="custom-input" className="custom-class" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('data-testid', 'custom-input');
    expect(input).toHaveClass('custom-class');
  });

  it('handles multiple file selection', async () => {
    const onFilesChange = vi.fn();
    render(
      <FileUpload.Root multiple onFilesChange={onFilesChange}>
        <FileUpload.Input data-testid="file-input" />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'test1.txt' }),
          expect.objectContaining({ name: 'test2.txt' }),
        ]),
      );
    });
  });

  it('resolves className callback with disabled state', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Input
          data-testid="file-input"
          className={(state) => (state.disabled ? 'disabled-input' : 'enabled-input')}
        />
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input');
    expect(input).toHaveClass('disabled-input');
  });

  it('resolves className callback when disabled state changes', () => {
    const { rerender } = render(
      <FileUpload.Root disabled={false}>
        <FileUpload.Input
          data-testid="file-input"
          className={(state) => (state.disabled ? 'disabled-input' : 'enabled-input')}
        />
      </FileUpload.Root>,
    );

    let input = screen.getByTestId('file-input');
    expect(input).toHaveClass('enabled-input');

    rerender(
      <FileUpload.Root disabled>
        <FileUpload.Input
          data-testid="file-input"
          className={(state) => (state.disabled ? 'disabled-input' : 'enabled-input')}
        />
      </FileUpload.Root>,
    );

    input = screen.getByTestId('file-input');
    expect(input).toHaveClass('disabled-input');
  });
});
