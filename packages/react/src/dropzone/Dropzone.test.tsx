import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Dropzone } from './Dropzone';

const createDataTransfer = (files: File[]) => {
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

    const dropzone = screen.getByRole('button');
    expect(dropzone.tagName).toBe('DIV');
    expect(dropzone).toHaveAttribute('tabindex', '0');
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

    await user.click(screen.getByRole('button', { name: 'Nested' }));

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

  it('forwards ref to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Dropzone ref={ref}>Drop files</Dropzone>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref to the input part', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <Dropzone>
        <Dropzone.HiddenInput ref={ref} />
        Drop files
      </Dropzone>,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('type', 'file');
  });
});
