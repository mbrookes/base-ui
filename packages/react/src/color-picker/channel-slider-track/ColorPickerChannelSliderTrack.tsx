'use client';
import * as React from 'react';
import * as Slider from '../../slider/index.parts';
import { getChannelSliderBackground } from '../utils/colorAreaGradient';
import { useColorPickerChannelSliderContext } from '../channel-slider/ColorPickerChannelSliderContext';

/**
 * The interactive track for a channel slider, with a color gradient background.
 * Renders a `<span>` element that handles drag interactions.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerChannelSliderTrack = React.forwardRef(
  function ColorPickerChannelSliderTrack(
    componentProps: ColorPickerChannelSliderTrack.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { channel, color } = useColorPickerChannelSliderContext();
    const { style, children, className, ...rest } = componentProps;

    const gradient = getChannelSliderBackground(color, channel, 'ltr');

    return (
      <Slider.Control
        ref={forwardedRef}
        data-channel={channel}
        className={className}
        style={{ background: gradient, ...style }}
        {...rest}
      >
        <Slider.Track style={{ height: '100%' }}>
          {children}
        </Slider.Track>
      </Slider.Control>
    );
  },
);

export namespace ColorPickerChannelSliderTrack {
  export interface Props {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    id?: string;
    'data-testid'?: string;
  }
}
