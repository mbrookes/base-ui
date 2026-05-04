import { expect } from 'vitest';
import * as React from 'react';
import { screen } from '@mui/internal-test-utils';
import { ColorPicker } from '@base-ui/react/color-picker';
import { createRenderer } from '#test-utils';

describe('<ColorPicker.ChannelInput />', () => {
  const { render } = createRenderer();

  function Fixture({ channel }: { channel: ColorPicker.ChannelInput.Props['channel'] }) {
    return (
      <ColorPicker.Root defaultValue="hsb(210, 80%, 90%)">
        <ColorPicker.ChannelInput channel={channel} />
      </ColorPicker.Root>
    );
  }

  describe('inputMode', () => {
    it('sets inputMode="text" for the hex channel', async () => {
      await render(<Fixture channel="hex" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'text');
    });

    it('sets inputMode="numeric" for the hue channel', async () => {
      await render(<Fixture channel="hue" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });

    it('sets inputMode="numeric" for the saturation channel', async () => {
      await render(<Fixture channel="saturation" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });

    it('sets inputMode="numeric" for the alpha channel', async () => {
      await render(<Fixture channel="alpha" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });
  });

  describe('aria-label', () => {
    it('uses "Hex color" for the hex channel', async () => {
      await render(<Fixture channel="hex" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Hex color');
    });

    it('uses "Hue" for the hue channel', async () => {
      await render(<Fixture channel="hue" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Hue');
    });
  });
});
