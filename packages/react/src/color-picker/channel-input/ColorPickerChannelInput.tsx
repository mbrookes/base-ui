'use client';
import * as React from 'react';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import type { ColorChannel, ColorSpace } from '../utils/types';
import type { Color } from '../utils/types';
import { parseColor } from '../utils/parseColor';

export interface ColorPickerChannelInputState {
  channel: ColorChannel | 'hex';
  disabled: boolean;
  readOnly: boolean;
}

function formatValue(value: Color, channel: ColorChannel | 'hex'): string {
  if (channel === 'hex') {
    return value.toString('hex');
  }
  const v = value.getChannelValue(channel as ColorChannel);
  if (channel === 'alpha') return String(Math.round(v * 100));
  return String(Math.round(v));
}

/**
 * A text input that controls a single color channel or hex value.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerChannelInput = React.forwardRef(function ColorPickerChannelInput(
  componentProps: ColorPickerChannelInput.Props,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const {
    channel,
    colorSpace: _colorSpace = 'hsb',
    className,
    render,
    style,
    ...elementProps
  } = componentProps;

  const { value, setValueFromInput, dragging, disabled, readOnly } =
    useColorPickerRootContext();

  const [localValue, setLocalValue] = React.useState<string>(() =>
    formatValue(value, channel),
  );
  const committedValueRef = React.useRef(localValue);

  React.useEffect(() => {
    if (!dragging) {
      const formatted = formatValue(value, channel);
      setLocalValue(formatted);
      committedValueRef.current = formatted;
    }
  }, [value, channel, dragging]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  }, []);

  const commit = React.useCallback(
    (event: React.FocusEvent | React.KeyboardEvent) => {
      try {
        let newColor: Color;
        if (channel === 'hex') {
          const hexStr = localValue.startsWith('#') ? localValue : `#${localValue}`;
          newColor = parseColor(hexStr);
        } else {
          const numValue = parseFloat(localValue);
          if (Number.isNaN(numValue)) {
            setLocalValue(committedValueRef.current);
            return;
          }
          const adjusted = channel === 'alpha' ? numValue / 100 : numValue;
          newColor = value.withChannelValue(channel as ColorChannel, adjusted);
        }
        committedValueRef.current = localValue;
        setValueFromInput(newColor, event.nativeEvent);
      } catch {
        setLocalValue(committedValueRef.current);
      }
    },
    [channel, localValue, value, setValueFromInput],
  );

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      commit(event);
    },
    [commit],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        commit(event);
      } else if (event.key === 'Escape') {
        setLocalValue(committedValueRef.current);
        (event.target as HTMLInputElement).blur();
      }
    },
    [commit],
  );

  const state: ColorPickerChannelInputState = React.useMemo(
    () => ({ channel, disabled, readOnly }),
    [channel, disabled, readOnly],
  );

  const element = useRenderElement('input', componentProps, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        value: localValue,
        onChange: handleChange,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        disabled,
        readOnly,
        type: 'text' as const,
        inputMode: 'numeric' as const,
        style: style as React.CSSProperties,
        ['data-channel' as string]: channel,
        'aria-label':
          channel === 'hex'
            ? 'Hex color'
            : `${channel.charAt(0).toUpperCase() + channel.slice(1)}`,
      } as React.InputHTMLAttributes<HTMLInputElement>,
    ],
  });

  return element;
});

export namespace ColorPickerChannelInput {
  export interface Props
    extends Omit<BaseUIComponentProps<'input', ColorPickerChannelInputState>, 'children'> {
    /** The channel this input controls. Use 'hex' for hex string input. Required. */
    channel: ColorChannel | 'hex';
    /** The color space for channel resolution. @default 'hsb' */
    colorSpace?: ColorSpace;
  }
}
