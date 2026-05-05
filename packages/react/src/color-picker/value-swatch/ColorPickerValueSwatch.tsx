'use client';
import * as React from 'react';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';

export interface ColorPickerValueSwatchState {
  /**
   * Whether the color picker popup is currently open.
   */
  open: boolean;
  /**
   * Whether the color picker is disabled.
   */
  disabled: boolean;
}

/**
 * A color preview swatch displayed inside the trigger button.
 * Renders a `<span>` element with `--color` CSS variable set.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerValueSwatch = React.forwardRef(function ColorPickerValueSwatch(
  componentProps: ColorPickerValueSwatch.Props,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { className, render, style, ...elementProps } = componentProps;
  const { value, open, disabled } = useColorPickerRootContext();

  const colorString = value.toString('css');

  const state: ColorPickerValueSwatchState = {
    open,
    disabled,
  };

  return useRenderElement('span', componentProps, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        'aria-hidden': true,
        style: {
          '--color': colorString,
          ...(style as React.CSSProperties),
        } as React.CSSProperties & Record<string, unknown>,
      },
    ],
  });
});

export namespace ColorPickerValueSwatch {
  export interface Props extends BaseUIComponentProps<'span', ColorPickerValueSwatchState> {}
}
