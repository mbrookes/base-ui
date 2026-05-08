'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { matchesFocusVisible } from '../../floating-ui-react/utils/element';
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import { useColorPickerAreaContext } from '../area/ColorPickerAreaContext';
import type { ColorChannel } from '../utils/types';

function formatChannelValueText(channel: ColorChannel, value: number): string {
  if (channel === 'hue') {
    return `${Math.round(value)}°`;
  }
  if (channel === 'alpha') {
    return `${Math.round(value * 100)}%`;
  }
  if (channel === 'red' || channel === 'green' || channel === 'blue') {
    return String(Math.round(value));
  }
  return `${Math.round(value)}%`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface ColorPickerAreaThumbState {
  dragging: boolean;
  disabled: boolean;
  focusVisible: boolean;
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
  const { dragging, disabled, setValueFromInput } = useColorPickerRootContext();
  const { xChannel, yChannel, displayValue } = useColorPickerAreaContext();

  const [focusVisible, setFocusVisible] = React.useState(false);

  const handleInputFocus = useStableCallback((event: React.FocusEvent<HTMLInputElement>) => {
    if (matchesFocusVisible(event.currentTarget)) {
      setFocusVisible(true);
    }
  });

  const handleInputBlur = useStableCallback(() => {
    setFocusVisible(false);
  });

  const xVal = displayValue.getChannelValue(xChannel);
  const yVal = displayValue.getChannelValue(yChannel);
  const xRange = displayValue.getChannelRange(xChannel);
  const yRange = displayValue.getChannelRange(yChannel);
  const hasHue = displayValue.getColorSpace() !== 'rgb';
  const hueVal =
    hasHue && xChannel !== 'hue' && yChannel !== 'hue' ? displayValue.getChannelValue('hue') : null;

  const state: ColorPickerAreaThumbState = { dragging, disabled, focusVisible };

  const handleKeyDown = useStableCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, shiftKey } = event;
    let newColor = displayValue;
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const step = shiftKey ? xRange.pageSize : xRange.step;
      newColor = displayValue.decrementChannel(xChannel, step);
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      const step = shiftKey ? xRange.pageSize : xRange.step;
      newColor = displayValue.incrementChannel(xChannel, step);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      const step = shiftKey ? yRange.pageSize : yRange.step;
      newColor = displayValue.incrementChannel(yChannel, step);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      const step = shiftKey ? yRange.pageSize : yRange.step;
      newColor = displayValue.decrementChannel(yChannel, step);
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

  const stateAttributesMapping: StateAttributesMapping<ColorPickerAreaThumbState> = {
    focusVisible(value: boolean): Record<string, string> | null {
      return value ? { 'data-focus-visible': '' } : null;
    },
  };

  const element = useRenderElement('span', componentProps, {
    ref: forwardedRef,
    state,
    stateAttributesMapping,
    props: [
      elementProps,
      {
        'aria-hidden': true as const,
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

  const xValueText = [
    `${capitalize(xChannel)}: ${formatChannelValueText(xChannel, xVal)}`,
    `${capitalize(yChannel)}: ${formatChannelValueText(yChannel, yVal)}`,
    hueVal != null ? `Hue: ${Math.round(hueVal)}°` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const yValueText = [
    `${capitalize(yChannel)}: ${formatChannelValueText(yChannel, yVal)}`,
    `${capitalize(xChannel)}: ${formatChannelValueText(xChannel, xVal)}`,
    hueVal != null ? `Hue: ${Math.round(hueVal)}°` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <React.Fragment>
      {element}
      <input
        type="range"
        aria-label={`${capitalize(xChannel)}, Color`}
        aria-roledescription="2D slider"
        aria-valuemin={xRange.minValue}
        aria-valuemax={xRange.maxValue}
        aria-valuenow={xVal}
        aria-valuetext={xValueText}
        min={xRange.minValue}
        max={xRange.maxValue}
        step={xRange.step}
        value={xVal}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
        style={hiddenInputStyle}
      />
      <input
        type="range"
        aria-label={`${capitalize(yChannel)}, Color`}
        aria-roledescription="2D slider"
        aria-hidden
        aria-valuemin={yRange.minValue}
        aria-valuemax={yRange.maxValue}
        aria-valuenow={yVal}
        aria-valuetext={yValueText}
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
