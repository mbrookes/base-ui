'use client';
import * as React from 'react';
import * as Slider from '../../slider/index.parts';
import { useColorPickerChannelSliderContext } from '../channel-slider/ColorPickerChannelSliderContext';

function getChannelLabel(channel: string): string {
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

function formatChannelValue(channel: string, value: number): string {
  if (channel === 'alpha') {
    return `${Math.round(value * 100)}%`;
  }
  if (channel === 'hue') {
    return `${Math.round(value)}°`;
  }
  if (channel === 'red' || channel === 'green' || channel === 'blue') {
    return String(Math.round(value));
  }
  return `${Math.round(value)}%`;
}

/**
 * The thumb for a channel slider.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerChannelSliderThumb = React.forwardRef(
  function ColorPickerChannelSliderThumb(
    componentProps: ColorPickerChannelSliderThumb.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { channel, color } = useColorPickerChannelSliderContext();
    const channelValue = color.getChannelValue(channel);

    return (
      <Slider.Thumb
        ref={forwardedRef}
        aria-label={getChannelLabel(channel)}
        aria-valuetext={formatChannelValue(channel, channelValue)}
        data-channel={channel}
        {...componentProps}
      />
    );
  },
);

export namespace ColorPickerChannelSliderThumb {
  export interface Props {
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
    children?: React.ReactNode;
    id?: string | undefined;
    'data-testid'?: string | undefined;
  }
}
