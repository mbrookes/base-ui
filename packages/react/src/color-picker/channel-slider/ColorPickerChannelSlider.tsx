'use client';
import * as React from 'react';
import * as Slider from '../../slider/index.parts';
import type { ColorChannel, ColorSpace } from '../utils/types';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import {
  ColorPickerChannelSliderContext,
  type ColorPickerChannelSliderContextValue,
} from './ColorPickerChannelSliderContext';

export interface ColorPickerChannelSliderState {
  channel: ColorChannel;
  disabled: boolean;
}

/**
 * A slider that controls a single color channel.
 * Renders a `<div>` element wrapping Slider.Root.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerChannelSlider = React.forwardRef(function ColorPickerChannelSlider(
  componentProps: ColorPickerChannelSlider.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    channel,
    colorSpace = 'hsb',
    orientation = 'horizontal',
    children,
    disabled: disabledProp,
    ...elementProps
  } = componentProps;

  const {
    value: color,
    setValueFromDrag,
    onValueChangeEnd,
    disabled: rootDisabled,
  } = useColorPickerRootContext();

  const disabled = disabledProp ?? rootDisabled;
  const range = color.getChannelRange(channel);
  const channelValue = color.getChannelValue(channel);

  const channelContext: ColorPickerChannelSliderContextValue = React.useMemo(
    () => ({ channel, colorSpace, color }),
    [channel, colorSpace, color],
  );

  return (
    <ColorPickerChannelSliderContext.Provider value={channelContext}>
      <Slider.Root
        ref={forwardedRef}
        value={channelValue}
        min={range.minValue}
        max={range.maxValue}
        step={range.step}
        largeStep={range.pageSize}
        orientation={orientation}
        disabled={disabled}
        onValueChange={(newValue) => {
          const newColor = color.withChannelValue(channel, newValue as number);
          setValueFromDrag(newColor, new PointerEvent('pointermove'));
        }}
        onValueCommitted={(newValue) => {
          const newColor = color.withChannelValue(channel, newValue as number);
          onValueChangeEnd(newColor, new Event('base-ui'));
        }}
        {...elementProps}
      >
        {children}
      </Slider.Root>
    </ColorPickerChannelSliderContext.Provider>
  );
});

export namespace ColorPickerChannelSlider {
  export interface Props {
    /** The color channel this slider controls. Required. */
    channel: ColorChannel;
    /** The color space for channel resolution. @default 'hsb' */
    colorSpace?: ColorSpace;
    /** Slider orientation. @default 'horizontal' */
    orientation?: 'horizontal' | 'vertical';
    /** Whether the slider is disabled. */
    disabled?: boolean;
    className?: string;
    render?:
      | React.ReactElement
      | ((props: React.ComponentPropsWithRef<'div'>) => React.ReactElement);
    children?: React.ReactNode;
    style?: React.CSSProperties;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'data-testid'?: string;
  }
}
