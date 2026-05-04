'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import { useColorPickerAreaContext } from '../area/ColorPickerAreaContext';

export interface ColorPickerAreaThumbState {
  dragging: boolean;
  disabled: boolean;
}

/**
 * The draggable thumb for the 2D color area.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerAreaThumb = React.forwardRef(function ColorPickerAreaThumb(
  componentProps: ColorPickerAreaThumb.Props,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { className, render, style, ...elementProps } = componentProps;
  const { value, dragging, disabled, setValueFromInput } = useColorPickerRootContext();
  const { xChannel, yChannel } = useColorPickerAreaContext();

  const xVal = value.getChannelValue(xChannel);
  const yVal = value.getChannelValue(yChannel);
  const xRange = value.getChannelRange(xChannel);
  const yRange = value.getChannelRange(yChannel);
  const hueVal = value.getChannelValue('hue');

  const state: ColorPickerAreaThumbState = { dragging, disabled };

  const handleKeyDown = useStableCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, shiftKey } = event;
    let newColor = value;
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const step = shiftKey ? xRange.pageSize : xRange.step;
      newColor = value.decrementChannel(xChannel, step);
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      const step = shiftKey ? xRange.pageSize : xRange.step;
      newColor = value.incrementChannel(xChannel, step);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      const step = shiftKey ? yRange.pageSize : yRange.step;
      newColor = value.incrementChannel(yChannel, step);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      const step = shiftKey ? yRange.pageSize : yRange.step;
      newColor = value.decrementChannel(yChannel, step);
    } else {
      return;
    }
    setValueFromInput(newColor, event.nativeEvent);
  });

  const hiddenInputStyle: React.CSSProperties = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: 1,
    whiteSpace: 'nowrap',
  };

  const element = useRenderElement('span', componentProps, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        style: {
          position: 'absolute',
          left: 'var(--color-area-thumb-x)',
          top: 'var(--color-area-thumb-y)',
          transform: 'translate(-50%, -50%)',
          ...(style as React.CSSProperties),
        } as React.CSSProperties,
      },
    ],
  });

  return (
    <React.Fragment>
      {element}
      <input
        type="range"
        aria-label={`${xChannel.charAt(0).toUpperCase() + xChannel.slice(1)}, Color`}
        aria-roledescription="2D slider"
        aria-valuemin={xRange.minValue}
        aria-valuemax={xRange.maxValue}
        aria-valuenow={xVal}
        aria-valuetext={`${xChannel.charAt(0).toUpperCase() + xChannel.slice(1)}: ${Math.round(xVal)}%, ${yChannel.charAt(0).toUpperCase() + yChannel.slice(1)}: ${Math.round(yVal)}%, Hue: ${Math.round(hueVal)}°`}
        min={xRange.minValue}
        max={xRange.maxValue}
        step={xRange.step}
        value={xVal}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={hiddenInputStyle}
      />
      <input
        type="range"
        aria-label={`${yChannel.charAt(0).toUpperCase() + yChannel.slice(1)}, Color`}
        aria-roledescription="2D slider"
        aria-hidden
        aria-valuemin={yRange.minValue}
        aria-valuemax={yRange.maxValue}
        aria-valuenow={yVal}
        aria-valuetext={`${yChannel.charAt(0).toUpperCase() + yChannel.slice(1)}: ${Math.round(yVal)}%, ${xChannel.charAt(0).toUpperCase() + xChannel.slice(1)}: ${Math.round(xVal)}%, Hue: ${Math.round(hueVal)}°`}
        min={yRange.minValue}
        max={yRange.maxValue}
        step={yRange.step}
        value={yVal}
        onChange={() => {}}
        disabled={disabled}
        tabIndex={-1}
        style={hiddenInputStyle}
      />
    </React.Fragment>
  );
});

export namespace ColorPickerAreaThumb {
  export interface Props extends BaseUIComponentProps<'span', ColorPickerAreaThumbState> {}
}
