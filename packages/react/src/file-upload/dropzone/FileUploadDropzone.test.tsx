import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { FileUpload } from '../index';

describe('FileUpload.Dropzone', () => {
  it('renders a div with role="button"', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toBeInTheDocument();
    expect(dropzone.tagName).toBe('DIV');
  });

  it('is keyboard accessible with tabindex', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('tabindex', '0');
  });

  it('opens file dialog when clicked', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(dropzone);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog when Enter key is pressed', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    dropzone.focus();
    fireEvent.keyDown(dropzone, { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog when Space key is pressed', async () => {
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    dropzone.focus();
    fireEvent.keyDown(dropzone, { key: ' ' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('sets data-disabled attribute when disabled', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('data-disabled', '');
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
  });

  it('has tabindex -1 when disabled', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('tabindex', '-1');
  });

  it('does not open file dialog when disabled and clicked', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload.Root disabled>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(dropzone);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('sets data-dragging attribute during drag', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');

    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveAttribute('data-dragging', '');

    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveAttribute('data-dragging');
  });

  it('supports render prop with isDragging state', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>
          {({ isDragging }) => (isDragging ? 'Release to upload' : 'Drop files here')}
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveTextContent('Drop files here');

    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveTextContent('Release to upload');

    fireEvent.dragLeave(dropzone);
    expect(dropzone).toHaveTextContent('Drop files here');
  });

  it('does not open file dialog when clicking a button inside', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone>
          <button type="button">Cancel</button>
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await user.click(cancelButton);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('forwards ref to div element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone ref={ref}>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('applies custom props to dropzone element', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone data-testid="custom-dropzone" className="custom-class">
          Drop files here
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('data-testid', 'custom-dropzone');
    expect(dropzone).toHaveClass('custom-class');
  });

  it('composes onClick and onKeyDown handlers', async () => {
    const user = userEvent.setup();
    const customClick = vi.fn();
    const customKeyDown = vi.fn();
    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone onClick={customClick} onKeyDown={customKeyDown}>
          Drop files here
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(dropzone);
    expect(customClick).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    dropzone.focus();
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    expect(customKeyDown).toHaveBeenCalled();
  });

  it('has default aria-label for screen readers', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>Custom visual content</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('aria-label', 'Drop files here or click to select');
  });

  it('respects custom aria-label when provided', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone aria-label="Upload your documents">Custom content</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('aria-label', 'Upload your documents');
  });

  it('does not have aria-disabled when enabled', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).not.toHaveAttribute('aria-disabled');
  });
});
