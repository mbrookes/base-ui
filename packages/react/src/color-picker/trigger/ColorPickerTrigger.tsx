'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
import { useClick, useInteractions } from '../../floating-ui-react';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import { ColorPickerTriggerDataAttributes } from './ColorPickerTriggerDataAttributes';
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';

const stateAttributesMapping: StateAttributesMapping<ColorPickerTriggerState> = {
  open(value: boolean) {
    return value ? { [ColorPickerTriggerDataAttributes.open]: '' } : null;
  },
  disabled(value: boolean) {
    return value ? { [ColorPickerTriggerDataAttributes.disabled]: '' } : null;
  },
};

/**
 * A button that opens the color picker popup.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerTrigger = React.forwardRef(function ColorPickerTrigger(
  componentProps: ColorPickerTrigger.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
    render,
    className,
    style,
    disabled = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;

  const { open, floatingRootContext, setTriggerElement } = useColorPickerRootContext();

  const { getButtonProps, buttonRef } = useButton({
    disabled,
    native: nativeButton,
  });

  const click = useClick(floatingRootContext!, { enabled: floatingRootContext != null });
  const { getReferenceProps } = useInteractions([click]);

  const setTriggerRef = useStableCallback((el: HTMLButtonElement | null) => {
    setTriggerElement(el);
  });

  const state: ColorPickerTriggerState = {
    open,
    disabled,
  };

  return useRenderElement('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef, setTriggerRef],
    props: [
      getReferenceProps(),
      {
        'aria-expanded': open,
        'aria-haspopup': 'dialog' as const,
      },
      elementProps,
      getButtonProps,
    ],
    stateAttributesMapping,
  });
});

export interface ColorPickerTriggerState {
  /**
   * Whether the color picker popup is currently open.
   */
  open: boolean;
  /**
   * Whether the trigger is disabled.
   */
  disabled: boolean;
}

export interface ColorPickerTriggerProps
  extends NativeButtonProps, BaseUIComponentProps<'button', ColorPickerTriggerState> {
  /**
   * Whether the trigger is disabled.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Whether the component renders a native `<button>` element when replacing it
   * via the `render` prop.
   * Set to `false` if the rendered element is not a button (e.g. `<div>`).
   * @default true
   */
  nativeButton?: boolean | undefined;
}

export namespace ColorPickerTrigger {
  export type State = ColorPickerTriggerState;
  export type Props = ColorPickerTriggerProps;
}
