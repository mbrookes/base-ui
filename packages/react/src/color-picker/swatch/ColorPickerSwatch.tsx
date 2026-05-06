'use client';
import * as React from 'react';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';

export interface ColorPickerSwatchState {
  disabled: boolean;
}

/**
 * A preview swatch that displays the current color.
 * Renders a `<div>` element with `--color` CSS variable set.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerSwatch = React.forwardRef(function ColorPickerSwatch(
  componentProps: ColorPickerSwatch.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { className, render, style, ...elementProps } = componentProps;
  const { value, disabled } = useColorPickerRootContext();

  const colorString = value.toString('css');

  const state: ColorPickerSwatchState = { disabled };

  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        role: 'img' as const,
        'aria-label': `Selected color: ${value.toString('hex')}`,
        style: {
          '--color': colorString,
          ...(style as React.CSSProperties),
        } as React.CSSProperties & Record<string, unknown>,
      },
    ],
  });

  return element;
});

export namespace ColorPickerSwatch {
  export interface Props extends BaseUIComponentProps<'div', ColorPickerSwatchState> {}
}
