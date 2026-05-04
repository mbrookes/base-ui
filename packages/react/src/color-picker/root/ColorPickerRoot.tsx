'use client';
import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext';
import { parseColor } from '../utils/parseColor';
import type { Color, ColorFormat } from '../utils/types';
import { colorPickerStateAttributesMapping } from './stateAttributesMapping';
import { ColorPickerRootContext } from './ColorPickerRootContext';
import type { ColorPickerRootContextValue } from './ColorPickerRootContext';

export interface ColorPickerRootState {
  value: Color;
  format: ColorFormat;
  dragging: boolean;
  disabled: boolean;
  readOnly: boolean;
  valid: boolean | null;
}

function toColor(value: string | Color): Color {
  if (typeof value === 'string') {
    return parseColor(value);
  }
  return value;
}

/**
 * Groups all parts of the color picker.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerRoot = React.forwardRef(function ColorPickerRoot(
  componentProps: ColorPickerRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    className,
    render,
    style,
    value: valueProp,
    defaultValue = 'hsb(0, 100%, 100%)',
    onValueChange,
    onValueChangeEnd,
    format: formatProp = 'hsb',
    disabled: disabledProp = false,
    readOnly = false,
    ...elementProps
  } = componentProps;

  const { disabled: fieldDisabled, validityData } = useFieldRootContext();
  const disabled = fieldDisabled || disabledProp;

  const [valueRaw, setValueUncontrolled] = useControlled<string | Color>({
    controlled: valueProp,
    default: defaultValue,
    name: 'ColorPickerRoot',
    state: 'value',
  });

  const value = React.useMemo(() => toColor(valueRaw), [valueRaw]);
  const [format] = React.useState<ColorFormat>(formatProp);
  const [dragging, setDragging] = React.useState(false);

  const onValueChangeStable = useStableCallback(onValueChange);
  const onValueChangeEndStable = useStableCallback(onValueChangeEnd);

  const setValueFromDrag = useStableCallback((newColor: Color, event: PointerEvent) => {
    setValueUncontrolled(newColor);
    onValueChangeStable?.(newColor, event);
  });

  const setValueFromInput = useStableCallback(
    (newColor: Color, event: React.SyntheticEvent | Event) => {
      setValueUncontrolled(newColor);
      onValueChangeStable?.(newColor, event);
    },
  );

  const handleValueChangeEnd = useStableCallback(
    (newColor: Color, event: React.SyntheticEvent | Event) => {
      onValueChangeEndStable?.(newColor, event);
    },
  );

  const state: ColorPickerRootState = React.useMemo(
    () => ({
      value,
      format,
      dragging,
      disabled: disabled ?? false,
      readOnly,
      valid: validityData?.state?.valid ?? null,
    }),
    [value, format, dragging, disabled, readOnly, validityData],
  );

  const contextValue: ColorPickerRootContextValue = React.useMemo(
    () => ({
      value,
      format,
      setValueFromInput,
      setValueFromDrag,
      onValueChangeEnd: handleValueChangeEnd,
      dragging,
      setDragging,
      disabled: disabled ?? false,
      readOnly,
      state,
    }),
    [
      value,
      format,
      setValueFromInput,
      setValueFromDrag,
      handleValueChangeEnd,
      dragging,
      disabled,
      readOnly,
      state,
    ],
  );

  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        role: 'group' as const,
        style: style as React.CSSProperties,
      },
    ],
    stateAttributesMapping: colorPickerStateAttributesMapping,
  });

  return (
    <ColorPickerRootContext.Provider value={contextValue}>
      {element}
    </ColorPickerRootContext.Provider>
  );
});

export namespace ColorPickerRoot {
  export interface Props extends BaseUIComponentProps<'div', ColorPickerRootState> {
    /** The current color value (controlled). Accepts a CSS color string or Color object. */
    value?: string | Color;
    /** The default color value (uncontrolled). Accepts a CSS color string or Color object. */
    defaultValue?: string | Color;
    /** Callback fired when the color value changes. */
    onValueChange?: (value: Color, event: React.SyntheticEvent | Event) => void;
    /** Callback fired when the color stops changing (drag end, commit). */
    onValueChangeEnd?: (value: Color, event: React.SyntheticEvent | Event) => void;
    /** The color format to use for output. @default 'hsb' */
    format?: ColorFormat;
    /** Whether the component is disabled. */
    disabled?: boolean;
    /** Whether the component is read-only. */
    readOnly?: boolean;
  }
}
