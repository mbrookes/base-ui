import { expect } from 'vitest';
import * as React from 'react';
import { screen, fireEvent } from '@mui/internal-test-utils';
import { ColorPicker } from '@base-ui/react/color-picker';
import { createRenderer } from '#test-utils';

describe('<ColorPicker.Trigger />', () => {
  const { render } = createRenderer();

  function Fixture(props: Partial<ColorPicker.Root.Props> = {}) {
    return (
      <ColorPicker.Root defaultValue="hsb(210, 80%, 90%)" {...props}>
        <ColorPicker.Trigger>Pick color</ColorPicker.Trigger>
        <ColorPicker.Positioner>
          <ColorPicker.Popup aria-label="Color picker">
            <ColorPicker.Area>
              <ColorPicker.AreaThumb />
            </ColorPicker.Area>
          </ColorPicker.Popup>
        </ColorPicker.Positioner>
      </ColorPicker.Root>
    );
  }

  it('renders a button element', async () => {
    await render(<Fixture />);
    expect(screen.getByRole('button', { name: 'Pick color' })).toBeInTheDocument();
  });

  it('has aria-expanded=false when closed', async () => {
    await render(<Fixture />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-haspopup="dialog"', async () => {
    await render(<Fixture />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('toggles popup on click', async () => {
    await render(<Fixture />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('data-open');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).not.toHaveAttribute('data-open');
  });

  it('applies data-disabled when disabled', async () => {
    const { rerender } = await render(
      <ColorPicker.Root defaultValue="hsb(0, 0%, 100%)">
        <ColorPicker.Trigger disabled>Pick color</ColorPicker.Trigger>
      </ColorPicker.Root>,
    );
    const button = screen.getByRole('button', { name: 'Pick color' });
    expect(button).toHaveAttribute('data-disabled');
    await rerender(
      <ColorPicker.Root defaultValue="hsb(0, 0%, 100%)">
        <ColorPicker.Trigger>Pick color</ColorPicker.Trigger>
      </ColorPicker.Root>,
    );
    expect(button).not.toHaveAttribute('data-disabled');
  });

  it('disabled trigger does not open popup', async () => {
    await render(
      <ColorPicker.Root defaultValue="hsb(0, 0%, 100%)">
        <ColorPicker.Trigger disabled>Pick color</ColorPicker.Trigger>
        <ColorPicker.Positioner>
          <ColorPicker.Popup aria-label="Color picker">content</ColorPicker.Popup>
        </ColorPicker.Positioner>
      </ColorPicker.Root>,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('forwards ref to the button element', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    await render(
      <ColorPicker.Root defaultValue="hsb(0, 0%, 100%)">
        <ColorPicker.Trigger ref={ref}>Pick color</ColorPicker.Trigger>
      </ColorPicker.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('controlled open state works', async () => {
    const { rerender } = await render(<Fixture open={false} />);
    const button = screen.getByRole('button', { name: 'Pick color' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await rerender(<Fixture open />);
    // Re-query since rerender may swap element
    const trigger = document.querySelector('[aria-haspopup="dialog"]');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
