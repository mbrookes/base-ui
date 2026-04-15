import * as React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { isJSDOM } from '#test-utils';
import { Dropzone } from './Dropzone';

const createDataTransfer = (files: File[]) => {
  if (typeof DataTransfer === 'undefined') {
    return { files } as unknown as DataTransfer;
  }

  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }

  Object.defineProperty(dataTransfer, 'files', {
    value: files,
    configurable: true,
  });

  return dataTransfer;
};

describe('Dropzone', () => {
  it('throws when HiddenInput is used outside Dropzone', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Dropzone.HiddenInput />);
    }).toThrow(
      'Base UI: DropzoneContext is missing. Dropzone parts must be placed within <Dropzone>.',
    );

    consoleSpy.mockRestore();
  });

  it('renders as a button-like div', () => {
    render(<Dropzone>Drop files</Dropzone>);

    const dropzone = screen.getByRole('button', { name: 'Drop files' });
    expect(dropzone).toHaveAttribute('tabindex', '0');
  });

  it('supports an explicit aria-label', () => {
    render(<Dropzone aria-label="Upload proof of address">Upload</Dropzone>);

    expect(screen.getByRole('button', { name: 'Upload proof of address' })).toBeInTheDocument();
  });

  it('supports aria-labelledby', () => {
    render(
      <React.Fragment>
        <span id="dropzone-label">Upload receipts</span>
        <Dropzone aria-labelledby="dropzone-label">
          <svg aria-hidden="true" />
        </Dropzone>
      </React.Fragment>,
    );

    expect(screen.getByRole('button', { name: 'Upload receipts' })).toBeInTheDocument();
  });

  it('opens via click and keyboard', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(<Dropzone onOpen={onOpen}>Drop files</Dropzone>);

    const dropzone = screen.getByRole('button');

    await user.click(dropzone);
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    fireEvent.keyDown(dropzone, { key: ' ' });

    expect(onOpen).toHaveBeenCalledTimes(3);
  });

  it('opens the registered input via click and keyboard', async () => {
    const user = userEvent.setup();
    const inputClick = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(
      <Dropzone>
        <Dropzone.HiddenInput />
        Drop files
      </Dropzone>,
    );

    const dropzone = screen.getByRole('button');

    await user.click(dropzone);
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    fireEvent.keyDown(dropzone, { key: ' ' });

    expect(inputClick).toHaveBeenCalledTimes(3);
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(
      <Dropzone disabled onOpen={onOpen}>
        Drop files
      </Dropzone>,
    );

    const dropzone = screen.getByRole('button');

    await user.click(dropzone);
    fireEvent.keyDown(dropzone, { key: 'Enter' });

    expect(onOpen).not.toHaveBeenCalled();
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
    expect(dropzone).toHaveAttribute('tabindex', '-1');
    expect(dropzone).toHaveAttribute('data-disabled', '');
  });

  it('does not open when nested interactive element is clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(
      <Dropzone onOpen={onOpen}>
        <button type="button">Nested</button>
      </Dropzone>,
    );

    await user.click(screen.getByText('Nested'));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('tracks dragging state and supports render prop', () => {
    render(
      <Dropzone data-testid="dropzone">
        {({ isDragging }) => <span>{isDragging ? 'dragging' : 'idle'}</span>}
      </Dropzone>,
    );

    const dropzone = screen.getByTestId('dropzone');

    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(dropzone).not.toHaveAttribute('data-dragging');

    fireEvent.dragEnter(dropzone);
    expect(screen.getByText('dragging')).toBeInTheDocument();
    expect(dropzone).toHaveAttribute('data-dragging', '');

    fireEvent.dragLeave(dropzone);
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('supports controlled dragging state', () => {
    const onDraggingChange = vi.fn();

    function ControlledDropzone() {
      const [dragging, setDragging] = React.useState(false);

      return (
        <Dropzone
          data-testid="dropzone"
          dragging={dragging}
          onDraggingChange={(nextDragging) => {
            onDraggingChange(nextDragging);
            setDragging(nextDragging);
          }}
        >
          {({ isDragging }) => <span>{isDragging ? 'dragging' : 'idle'}</span>}
        </Dropzone>
      );
    }

    render(<ControlledDropzone />);

    const dropzone = screen.getByTestId('dropzone');

    fireEvent.dragEnter(dropzone);
    expect(onDraggingChange).toHaveBeenCalledWith(true);
    expect(dropzone).toHaveAttribute('data-dragging', '');
    expect(screen.getByText('dragging')).toBeInTheDocument();

    fireEvent.dragLeave(dropzone);
    expect(onDraggingChange).toHaveBeenCalledWith(false);
    expect(dropzone).not.toHaveAttribute('data-dragging');
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('keeps dragging state when drag leaves to a descendant', () => {
    render(
      <Dropzone data-testid="dropzone">
        <span data-testid="child">Drop files</span>
      </Dropzone>,
    );

    const dropzone = screen.getByTestId('dropzone');
    const child = screen.getByTestId('child');

    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveAttribute('data-dragging', '');

    const dragLeaveEvent = createEvent.dragLeave(dropzone);
    Object.defineProperty(dragLeaveEvent, 'relatedTarget', {
      value: child,
      configurable: true,
    });

    fireEvent(dropzone, dragLeaveEvent);
    expect(dropzone).toHaveAttribute('data-dragging', '');
  });

  it.skipIf(!isJSDOM)('sets copy dropEffect on drag over', () => {
    render(<Dropzone data-testid="dropzone">Drop files</Dropzone>);

    const dropzone = screen.getByTestId('dropzone');
    const dataTransfer = createDataTransfer([]);

    fireEvent.dragOver(dropzone, { dataTransfer });

    expect(dataTransfer.dropEffect).toBe('copy');
  });

  it('emits dropped files', () => {
    const onFilesDrop = vi.fn();

    render(
      <Dropzone data-testid="dropzone" onFilesDrop={onFilesDrop}>
        Drop files
      </Dropzone>,
    );

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: createDataTransfer([file]),
    });

    expect(onFilesDrop).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })]),
      expect.anything(),
    );
  });

  it('does not emit dropped files when disabled', () => {
    const onFilesDrop = vi.fn();

    render(
      <Dropzone data-testid="dropzone" disabled onFilesDrop={onFilesDrop}>
        Drop files
      </Dropzone>,
    );

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: createDataTransfer([file]),
    });

    expect(onFilesDrop).not.toHaveBeenCalled();
  });

  it('forwards ref to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Dropzone ref={ref}>Drop files</Dropzone>);

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Drop files' }));
  });

  it('forwards ref to the input part', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <Dropzone>
        <Dropzone.HiddenInput ref={ref} />
        Drop files
      </Dropzone>,
    );

    expect(ref.current).toHaveAttribute('type', 'file');
  });

  it('applies disabled state to the hidden input', () => {
    render(
      <Dropzone disabled>
        <Dropzone.HiddenInput data-testid="input" />
        Drop files
      </Dropzone>,
    );

    expect(screen.getByTestId('input')).toBeDisabled();
  });

  describe('Accessibility', () => {
    it('announces drag state transitions to screen readers', async () => {
      render(<Dropzone data-testid="dropzone">Drop files</Dropzone>);

      const dropzone = screen.getByTestId('dropzone');

      // Initial status region should exist
      let statusRegion = dropzone.querySelector('[role="status"]');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');

      // Drag enter - announces ready state
      fireEvent.dragEnter(dropzone);
      statusRegion = dropzone.querySelector('[role="status"]');
      expect(statusRegion!.textContent).toContain('Ready to drop files');

      // Drag leave - announces drag ended
      const dragLeaveEvent = createEvent.dragLeave(dropzone);
      Object.defineProperty(dragLeaveEvent, 'relatedTarget', {
        value: null,
        configurable: true,
      });
      fireEvent(dropzone, dragLeaveEvent);
      statusRegion = dropzone.querySelector('[role="status"]');
      expect(statusRegion!.textContent).toContain('Drag ended');
    });

    it('announces successfully dropped files', () => {
      render(<Dropzone data-testid="dropzone">Drop files</Dropzone>);

      const dropzone = screen.getByTestId('dropzone');

      const file1 = new File(['content'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content'], 'test2.txt', { type: 'text/plain' });

      fireEvent.drop(dropzone, {
        dataTransfer: createDataTransfer([file1, file2]),
      });

      const statusRegion = dropzone.querySelector('[role="status"]');
      expect(statusRegion!.textContent).toContain('Dropped 2 files');
    });

    it('announces when no files are dropped', () => {
      render(<Dropzone data-testid="dropzone">Drop files</Dropzone>);

      const dropzone = screen.getByTestId('dropzone');

      fireEvent.drop(dropzone, {
        dataTransfer: createDataTransfer([]),
      });

      const statusRegion = dropzone.querySelector('[role="status"]');
      expect(statusRegion!.textContent).toContain('No files dropped');
    });
  });
});
