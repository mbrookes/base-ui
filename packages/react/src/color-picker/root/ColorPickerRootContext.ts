'use client';
import * as React from 'react';
import type { FloatingRootContext } from '../../floating-ui-react';
import type { TransitionStatus } from '../../internals/useTransitionStatus';
import type { Color, ColorFormat } from '../utils/types';

export interface ColorPickerRootContextValue {
  value: Color;
  format: ColorFormat;
  setValueFromInput: (color: Color, event: React.SyntheticEvent | Event) => void;
  setValueFromDrag: (color: Color, event: PointerEvent) => void;
  onValueChangeEnd: (color: Color, event: React.SyntheticEvent | Event) => void;
  dragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  readOnly: boolean;
  // Popover / floating state
  open: boolean;
  setOpen: (open: boolean, event?: Event) => void;
  mounted: boolean;
  transitionStatus: TransitionStatus;
  floatingRootContext: FloatingRootContext | undefined;
  getFloatingProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  popupRef: React.RefObject<HTMLElement | null>;
  setTriggerElement: (el: HTMLElement | null) => void;
  setPositionerElement: (el: HTMLElement | null) => void;
}

export const ColorPickerRootContext = React.createContext<ColorPickerRootContextValue | undefined>(
  undefined,
);

export function useColorPickerRootContext() {
  const context = React.useContext(ColorPickerRootContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: ColorPickerRootContext is missing. ColorPicker parts must be placed within <ColorPicker.Root>.',
    );
  }
  return context;
}
