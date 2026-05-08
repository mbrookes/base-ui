import type { Color, ColorChannel, ColorFormat, ColorSpace } from './types';

/**
 * Returns the color format required to read/write the given channel.
 * Falls back to the current color space for `alpha` (works in any space).
 */
export function getRequiredFormatForChannel(
  channel: ColorChannel,
  currentSpace: ColorSpace,
): ColorFormat {
  switch (channel) {
    case 'hue':
    case 'brightness':
      return 'hsb';
    case 'lightness':
      return 'hsl';
    case 'saturation':
      return currentSpace === 'hsl' ? 'hsl' : 'hsb';
    case 'red':
    case 'green':
    case 'blue':
      return 'rgb';
    default:
      return currentSpace;
  }
}

/**
 * Returns the color converted to the space required for the given channel.
 * Returns the original color if no conversion is needed.
 */
export function getColorForChannel(color: Color, channel: ColorChannel): Color {
  const required = getRequiredFormatForChannel(channel, color.getColorSpace());
  return color.getColorSpace() === required ? color : color.toFormat(required);
}
