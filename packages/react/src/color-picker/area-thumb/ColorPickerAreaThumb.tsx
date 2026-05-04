'use client';
import * as React from 'react';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';

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
  const { value, dragging, disabled } = useColorPickerRootContext();
  const xChannel = 'saturation' as const;
  const yChannel = 'brightness' as const;

  const xVal = value.getChannelValue(xChannel);
  const yVal = value.getChannelValue(yChannel);
  const xRange = value.getChannelRange(xChannel);
  const yRange = value.getChannelRange(yChannel);

  const state: ColorPickerAreaThumbState = React.useMemo(
    () => ({ dragging, disabled }),
    [dragging, disabled],
  );

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
    <>
      {element}
      <input
        type="range"
        aria-label={`${xChannel.charAt(0).toUpperCase() + xChannel.slice(1)}, Color`}
        aria-valuemin={xRange.minValue}
        aria-valuemax={xRange.maxValue}
        aria-valuenow={xVal}
        aria-valuetext={`${xChannel.charAt(0).toUpperCase() + xChannel.slice(1)}: ${Math.round(xVal)}%, ${yChannel.charAt(0).toUpperCase() + yChannel.slice(1)}: ${Math.round(yVal)}%`}
        min={xRange.minValue}
        max={xRange.maxValue}
        step={xRange.step}
        value={xVal}
        onChange={() => {}}
        disabled={disabled}
        tabIndex={-1}
        style={hiddenInputStyle}
      />
      <input
        type="range"
        aria-label={`${yChannel.charAt(0).toUpperCase() + yChannel.slice(1)}, Color`}
        aria-valuemin={yRange.minValue}
        aria-valuemax={yRange.maxValue}
        aria-valuenow={yVal}
        aria-valuetext={`${yChannel.charAt(0).toUpperCase() + yChannel.slice(1)}: ${Math.round(yVal)}%, ${xChannel.charAt(0).toUpperCase() + xChannel.slice(1)}: ${Math.round(xVal)}%`}
        min={yRange.minValue}
        max={yRange.maxValue}
        step={yRange.step}
        value={yVal}
        onChange={() => {}}
        disabled={disabled}
        tabIndex={-1}
        style={hiddenInputStyle}
      />
    </>
  );
});

export namespace ColorPickerAreaThumb {
  export interface Props extends BaseUIComponentProps<'span', ColorPickerAreaThumbState> {}
}
