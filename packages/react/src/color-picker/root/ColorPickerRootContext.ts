'use client';
import * as React from 'react';
import type { Color, ColorFormat } from '../utils/types';
import type { ColorPickerRootState } from './ColorPickerRoot';

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
  state: ColorPickerRootState;
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
