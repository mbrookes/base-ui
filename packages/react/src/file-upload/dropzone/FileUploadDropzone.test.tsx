import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
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

  it('resolves className callback with isDragging state', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Dropzone
          className={(state) => (state.dragging ? 'dragging' : 'idle')}
        >
          Drop files
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveClass('idle');

    fireEvent.dragEnter(dropzone);

    expect(dropzone).toHaveClass('dragging');
  });

  it('composes drag event handlers with custom handlers', async () => {
    const customDragEnter = vi.fn();
    const customDragLeave = vi.fn();

    render(
      <FileUpload.Root>
        <FileUpload.Input data-testid="file-input" />
        <FileUpload.Dropzone onDragEnter={customDragEnter} onDragLeave={customDragLeave}>
          Drop files
        </FileUpload.Dropzone>
      </FileUpload.Root>,
    );

    const dropzone = screen.getByRole('button');

    fireEvent.dragEnter(dropzone);
    expect(customDragEnter).toHaveBeenCalled();

    fireEvent.dragLeave(dropzone);
    expect(customDragLeave).toHaveBeenCalled();
  });

  describe('Render prop with isDragging state', () => {
    it('passes correct isDragging value to render prop', () => {
      render(
        <FileUpload.Root>
          <FileUpload.Dropzone>
            {({ isDragging }) => (
              <div data-testid="dragging-state">{isDragging ? 'dragging' : 'idle'}</div>
            )}
          </FileUpload.Dropzone>
        </FileUpload.Root>,
      );

      const state = screen.getByTestId('dragging-state');
      expect(state).toHaveTextContent('idle');
    });

    it('updates render prop when dragging state changes', () => {
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

      fireEvent.dragEnter(dropzone);
      expect(state).toHaveTextContent('dragging');

      fireEvent.dragLeave(dropzone);
      expect(state).toHaveTextContent('idle');
    });

    it('maintains isDragging state during multiple drag events', () => {
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

      fireEvent.dragEnter(dropzone);
      expect(state).toHaveTextContent('dragging');

      fireEvent.dragOver(dropzone);
      expect(state).toHaveTextContent('dragging');

      fireEvent.dragLeave(dropzone);
      expect(state).toHaveTextContent('idle');
    });

    it('resets isDragging to false after dragLeave', () => {
      render(
        <FileUpload.Root>
          <FileUpload.Input data-testid="file-input" />
          <FileUpload.Dropzone data-testid="dropzone">
            {({ isDragging }) => (
              <div data-testid="dragging-state">{isDragging ? 'dragging' : 'idle'}</div>
            )}
          </FileUpload.Dropzone>
        </FileUpload.Root>,
      );

      const dropzone = screen.getByTestId('dropzone');
      const state = screen.getByTestId('dragging-state');

      fireEvent.dragEnter(dropzone);
      expect(state).toHaveTextContent('dragging');

      fireEvent.dragLeave(dropzone);
      expect(state).toHaveTextContent('idle');
    });
  });
});
