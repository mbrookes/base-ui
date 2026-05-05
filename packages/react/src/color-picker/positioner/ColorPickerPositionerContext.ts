'use client';
import * as React from 'react';
import type { UseAnchorPositioningReturnValue } from '../../utils/useAnchorPositioning';

export type ColorPickerPositionerContextValue = Pick<
  UseAnchorPositioningReturnValue,
  'side' | 'align' | 'arrowRef' | 'arrowUncentered' | 'arrowStyles' | 'context'
>;

export const ColorPickerPositionerContext = React.createContext<
  ColorPickerPositionerContextValue | undefined
>(undefined);

export function useColorPickerPositionerContext() {
  const context = React.useContext(ColorPickerPositionerContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: ColorPickerPositionerContext is missing. ColorPicker popup parts must be placed within <ColorPicker.Positioner>.',
    );
  }
  return context;
}
