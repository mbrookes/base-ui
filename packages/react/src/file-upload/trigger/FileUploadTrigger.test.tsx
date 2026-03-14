import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../index';

function getFileInput() {
  const input = document.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected hidden file input to be rendered');
  }

  return input;
}

describe('FileUpload.Trigger', () => {
  it('renders a button element', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Trigger>Upload Files</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload Files' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('has type="button" by default', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('opens file dialog when clicked', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload.Root>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    const input = getFileInput();
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toBeDisabled();
  });

  it('does not open file dialog when disabled and clicked', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload.Root disabled>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    const input = getFileInput();
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(button);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('forwards ref to button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <FileUpload.Root>
        <FileUpload.Trigger ref={ref}>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Upload' }));
  });

  it('applies custom props to button element', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Trigger data-testid="custom-trigger" className="custom-class">
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toHaveAttribute('data-testid', 'custom-trigger');
    expect(button).toHaveClass('custom-class');
  });

  it('applies data-disabled attribute when disabled', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toHaveAttribute('data-disabled', '');
  });

  it('does not apply data-disabled when enabled', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Trigger>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).not.toHaveAttribute('data-disabled');
  });

  it('composes onClick handler with custom onClick', async () => {
    const user = userEvent.setup();
    const customClick = vi.fn();
    render(
      <FileUpload.Root>
        <FileUpload.Trigger onClick={customClick}>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });

    await user.click(button);

    expect(customClick).toHaveBeenCalled();
  });

  it('calls custom onClick exactly once per click', async () => {
    const user = userEvent.setup();
    const customClick = vi.fn();
    render(
      <FileUpload.Root>
        <FileUpload.Trigger onClick={customClick}>Upload</FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button', { name: 'Upload' });

    await user.click(button);

    expect(customClick).toHaveBeenCalledTimes(1);
  });

  it('renders children correctly', () => {
    render(
      <FileUpload.Root>
        <FileUpload.Trigger>
          <span data-testid="icon">📁</span>
          Upload Files
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('📁Upload Files');
  });

  it('resolves className callback with disabled state', () => {
    render(
      <FileUpload.Root disabled>
        <FileUpload.Trigger className={(state) => (state.disabled ? 'disabled' : 'enabled')}>
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled');
  });

  it('resolves className callback when disabled state changes', () => {
    const { rerender } = render(
      <FileUpload.Root disabled={false}>
        <FileUpload.Trigger className={(state) => (state.disabled ? 'disabled' : 'enabled')}>
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('enabled');

    rerender(
      <FileUpload.Root disabled>
        <FileUpload.Trigger className={(state) => (state.disabled ? 'disabled' : 'enabled')}>
          Upload
        </FileUpload.Trigger>
      </FileUpload.Root>,
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('disabled');
  });

  describe('nativeButton={false}', () => {
    it('renders role="button" without type="button" on a non-button element', () => {
      render(
        <FileUpload.Root>
          <FileUpload.Trigger render={<div />} nativeButton={false}>
            Upload
          </FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const trigger = screen.getByRole('button', { name: 'Upload' });
      expect(trigger.tagName).toBe('DIV');
      expect(trigger).not.toHaveAttribute('type');
    });

    it('uses aria-disabled instead of disabled attribute when disabled', () => {
      render(
        <FileUpload.Root disabled>
          <FileUpload.Trigger render={<div />} nativeButton={false}>
            Upload
          </FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const trigger = screen.getByRole('button', { name: 'Upload' });
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).not.toHaveAttribute('disabled');
    });

    it('opens file dialog when Enter key is pressed', () => {
      render(
        <FileUpload.Root>
          <FileUpload.Trigger render={<div />} nativeButton={false}>
            Upload
          </FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const trigger = screen.getByRole('button', { name: 'Upload' });
      const input = getFileInput();
      const clickSpy = vi.spyOn(input, 'click');

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });

      expect(clickSpy).toHaveBeenCalled();
    });

    it('opens file dialog when Space key is released', () => {
      render(
        <FileUpload.Root>
          <FileUpload.Trigger render={<div />} nativeButton={false}>
            Upload
          </FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const trigger = screen.getByRole('button', { name: 'Upload' });
      const input = getFileInput();
      const clickSpy = vi.spyOn(input, 'click');

      trigger.focus();
      fireEvent.keyUp(trigger, { key: ' ' });

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('preventBaseUIHandler', () => {
    it('does not open file dialog when onClick calls preventBaseUIHandler', async () => {
      const user = userEvent.setup();
      const customClick = vi.fn((event) => event.preventBaseUIHandler());
      render(
        <FileUpload.Root>
          <FileUpload.Trigger onClick={customClick}>Upload</FileUpload.Trigger>
        </FileUpload.Root>,
      );

      const trigger = screen.getByRole('button', { name: 'Upload' });
      const input = getFileInput();
      const clickSpy = vi.spyOn(input, 'click');

      await user.click(trigger);

      expect(customClick).toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});
