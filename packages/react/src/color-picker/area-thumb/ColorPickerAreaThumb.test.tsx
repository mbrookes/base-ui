import { expect } from 'vitest';
import * as React from 'react';
import { fireEvent, screen } from '@mui/internal-test-utils';
import { ColorPicker } from '@base-ui/react/color-picker';
import { createRenderer, isJSDOM } from '#test-utils';

describe('<ColorPicker.AreaThumb />', () => {
  const { render } = createRenderer();

  function Fixture({ defaultValue = 'hsb(210, 80%, 90%)' } = {}) {
    return (
      <ColorPicker.Root defaultValue={defaultValue}>
        <ColorPicker.Area>
          <ColorPicker.AreaThumb />
        </ColorPicker.Area>
      </ColorPicker.Root>
    );
  }

  describe('ARIA attributes', () => {
    it('X input has aria-roledescription="2D slider"', async () => {
      await render(<Fixture />);
      const [xInput] = screen.getAllByRole('slider');
      expect(xInput).toHaveAttribute('aria-roledescription', '2D slider');
    });

    it('Y input has aria-roledescription="2D slider"', async () => {
      await render(<Fixture />);
      const inputs = document.querySelectorAll('input[type="range"]');
      expect(inputs[1]).toHaveAttribute('aria-roledescription', '2D slider');
    });

    it('X input is in tab order (tabIndex is not -1)', async () => {
      await render(<Fixture />);
      const [xInput] = screen.getAllByRole('slider');
      expect(xInput).not.toHaveAttribute('tabindex', '-1');
    });

    it('Y input is hidden from AT (aria-hidden)', async () => {
      await render(<Fixture />);
      const inputs = document.querySelectorAll('input[type="range"]');
      expect(inputs[1]).toHaveAttribute('aria-hidden');
    });

    it('X input aria-valuetext includes hue', async () => {
      await render(<Fixture defaultValue="hsb(270, 75%, 50%)" />);
      const [xInput] = screen.getAllByRole('slider');
      expect(xInput).toHaveAttribute('aria-valuetext', expect.stringContaining('Hue: 270°'));
    });

    it('X input aria-valuetext includes saturation and brightness', async () => {
      await render(<Fixture defaultValue="hsb(270, 75%, 50%)" />);
      const [xInput] = screen.getAllByRole('slider');
      expect(xInput).toHaveAttribute('aria-valuetext', expect.stringContaining('Saturation: 75%'));
      expect(xInput).toHaveAttribute('aria-valuetext', expect.stringContaining('Brightness: 50%'));
    });
  });

  describe.skipIf(isJSDOM)('keyboard navigation', () => {
    it('ArrowRight increments saturation', async () => {
      const { user } = await render(<Fixture defaultValue="hsb(210, 50%, 50%)" />);
      await user.tab();
      const [xInput] = screen.getAllByRole('slider');
      const before = Number(xInput.getAttribute('aria-valuenow'));
      fireEvent.keyDown(xInput, { key: 'ArrowRight' });
      const after = Number(xInput.getAttribute('aria-valuenow'));
      expect(after).toBeGreaterThan(before);
    });

    it('ArrowLeft decrements saturation', async () => {
      const { user } = await render(<Fixture defaultValue="hsb(210, 50%, 50%)" />);
      await user.tab();
      const [xInput] = screen.getAllByRole('slider');
      const before = Number(xInput.getAttribute('aria-valuenow'));
      fireEvent.keyDown(xInput, { key: 'ArrowLeft' });
      const after = Number(xInput.getAttribute('aria-valuenow'));
      expect(after).toBeLessThan(before);
    });

    it('ArrowUp increments brightness (via aria-valuetext)', async () => {
      const { user } = await render(<Fixture defaultValue="hsb(210, 50%, 50%)" />);
      await user.tab();
      const [xInput] = screen.getAllByRole('slider');
      fireEvent.keyDown(xInput, { key: 'ArrowUp' });
      expect(xInput).toHaveAttribute('aria-valuetext', expect.stringContaining('Brightness: 51%'));
    });

    it('ArrowDown decrements brightness (via aria-valuetext)', async () => {
      const { user } = await render(<Fixture defaultValue="hsb(210, 50%, 50%)" />);
      await user.tab();
      const [xInput] = screen.getAllByRole('slider');
      fireEvent.keyDown(xInput, { key: 'ArrowDown' });
      expect(xInput).toHaveAttribute('aria-valuetext', expect.stringContaining('Brightness: 49%'));
    });

    it('Shift+ArrowRight uses page step', async () => {
      const { user } = await render(<Fixture defaultValue="hsb(210, 50%, 50%)" />);
      await user.tab();
      const [xInput] = screen.getAllByRole('slider');
      const before = Number(xInput.getAttribute('aria-valuenow'));
      fireEvent.keyDown(xInput, { key: 'ArrowRight', shiftKey: true });
      const after = Number(xInput.getAttribute('aria-valuenow'));
      // page step is 10 for saturation, regular step is 1
      expect(after - before).toBeGreaterThan(1);
    });
  });
});
