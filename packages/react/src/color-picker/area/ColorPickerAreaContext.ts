import * as React from 'react';
import type { ColorChannel } from '../utils/types';

export interface ColorPickerAreaContextValue {
  xChannel: ColorChannel;
  yChannel: ColorChannel;
}

export const ColorPickerAreaContext = React.createContext<ColorPickerAreaContextValue | undefined>(
  undefined,
);

export function useColorPickerAreaContext() {
  const context = React.useContext(ColorPickerAreaContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: ColorPickerAreaContext is missing. ColorPicker.AreaThumb must be placed within <ColorPicker.Area>.',
    );
  }
  return context;
}
