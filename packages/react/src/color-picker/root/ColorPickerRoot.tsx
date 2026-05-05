'use client';
import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useTransitionStatus } from '../../internals/useTransitionStatus';
import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete';
import { useFloatingRootContext, useDismiss, useInteractions } from '../../floating-ui-react';
import { parseColor } from '../utils/parseColor';
import type { Color, ColorFormat } from '../utils/types';
import { colorPickerStateAttributesMapping } from './stateAttributesMapping';
import { ColorPickerRootContext } from './ColorPickerRootContext';
import type { ColorPickerRootContextValue } from './ColorPickerRootContext';

export interface ColorPickerRootState {
  value: Color;
  format: ColorFormat;
  open: boolean;
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
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
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

  // Open state
  const [openState, setOpenUncontrolled] = useControlled<boolean>({
    controlled: openProp,
    default: defaultOpen,
    name: 'ColorPickerRoot',
    state: 'open',
  });

  const onOpenChangeStable = useStableCallback(onOpenChange);
  const onOpenChangeCompleteStable = useStableCallback(onOpenChangeComplete);

  const handleOpenChange = useStableCallback(
    (nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>) => {
      setOpenUncontrolled(nextOpen);
      onOpenChangeStable?.(nextOpen, eventDetails?.event);
    },
  );

  // Floating elements state (for positioning)
  const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);
  const [positionerElement, setPositionerElement] = React.useState<HTMLElement | null>(null);
  const popupRef = React.useRef<HTMLElement | null>(null);

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: handleOpenChange,
    elements: {
      reference: triggerElement,
      floating: positionerElement,
    },
  });

  const dismiss = useDismiss(floatingRootContext);
  const { getFloatingProps } = useInteractions([dismiss]);

  const { transitionStatus, mounted, setMounted } = useTransitionStatus(openState);

  useOpenChangeComplete({
    open: openState,
    ref: popupRef,
    onComplete() {
      if (!openState) {
        setMounted(false);
      } else {
        onOpenChangeCompleteStable?.(true);
      }
    },
  });

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

  const state: ColorPickerRootState = {
    value,
    format,
    open: openState,
    dragging,
    disabled: disabled ?? false,
    readOnly,
    valid: validityData?.state?.valid ?? null,
  };

  const setOpen = useStableCallback((nextOpen: boolean, event?: Event) => {
    setOpenUncontrolled(nextOpen);
    onOpenChangeStable?.(nextOpen, event);
  });

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
      open: openState,
      setOpen,
      mounted,
      transitionStatus,
      floatingRootContext,
      getFloatingProps,
      popupRef,
      setTriggerElement,
      setPositionerElement,
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
      openState,
      setOpen,
      mounted,
      transitionStatus,
      floatingRootContext,
      getFloatingProps,
      popupRef,
      setTriggerElement,
      setPositionerElement,
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
    value?: string | Color | undefined;
    /** The default color value (uncontrolled). Accepts a CSS color string or Color object. */
    defaultValue?: string | Color | undefined;
    /** Callback fired when the color value changes. */
    onValueChange?: ((value: Color, event: React.SyntheticEvent | Event) => void) | undefined;
    /** Callback fired when the color stops changing (drag end, commit). */
    onValueChangeEnd?: ((value: Color, event: React.SyntheticEvent | Event) => void) | undefined;
    /** The color format to use for output. @default 'hsb' */
    format?: ColorFormat | undefined;
    /** Whether the component is disabled. */
    disabled?: boolean | undefined;
    /** Whether the component is read-only. */
    readOnly?: boolean | undefined;
    /** Whether the popup is open (controlled). */
    open?: boolean | undefined;
    /** Whether the popup is open by default (uncontrolled). @default false */
    defaultOpen?: boolean | undefined;
    /** Callback fired when the popup open state changes. */
    onOpenChange?: ((open: boolean, event?: Event) => void) | undefined;
    /** Callback fired when the popup has fully opened or closed (after animations). */
    onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  }
}
