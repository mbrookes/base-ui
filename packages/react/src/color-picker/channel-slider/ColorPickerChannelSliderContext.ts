'use client';
import * as React from 'react';
import type { Color, ColorChannel, ColorSpace } from '../utils/types';

export interface ColorPickerChannelSliderContextValue {
  channel: ColorChannel;
  colorSpace: ColorSpace;
  color: Color;
}

export const ColorPickerChannelSliderContext = React.createContext<
  ColorPickerChannelSliderContextValue | undefined
>(undefined);

export function useColorPickerChannelSliderContext() {
  const context = React.useContext(ColorPickerChannelSliderContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: ColorPickerChannelSliderContext is missing. ColorPicker.ChannelSliderTrack and ChannelSliderThumb must be placed within <ColorPicker.ChannelSlider>.',
    );
  }
  return context;
}
