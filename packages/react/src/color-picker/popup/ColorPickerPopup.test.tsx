import { expect } from 'vitest';
import * as React from 'react';
import { screen, fireEvent } from '@mui/internal-test-utils';
import { ColorPicker } from '@base-ui/react/color-picker';
import { createRenderer, isJSDOM } from '#test-utils';

describe('<ColorPicker.Popup />', () => {
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

  it('is not rendered when closed', async () => {
    await render(<Fixture />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open', async () => {
    await render(<Fixture open />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has role="dialog" and aria-modal="true"', async () => {
    await render(<Fixture open />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has data-open when open', async () => {
    await render(<Fixture open />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-open');
  });

  it('opens when trigger is clicked', async () => {
    await render(<Fixture />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const { user } = await render(<Fixture />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const { user } = await render(
      <div>
        <Fixture />
        <div data-testid="outside" />
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Pick color' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('forwards ref to the popup element', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(
      <ColorPicker.Root defaultValue="hsb(0, 0%, 100%)" open>
        <ColorPicker.Positioner>
          <ColorPicker.Popup aria-label="Color picker" ref={ref}>
            content
          </ColorPicker.Popup>
        </ColorPicker.Positioner>
      </ColorPicker.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  describe.skipIf(isJSDOM)('transitions', () => {
    it('applies data-entering during open transition', async () => {
      const { user } = await render(<Fixture />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('dialog')).toHaveAttribute('data-entering');
    });
  });
});
