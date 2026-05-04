import { HSBColor, hsbToRgb } from './Color';
import type { Color, ColorChannel } from './types';

/**
 * Generate the CSS background gradient for the 2D color area.
 *
 * The area maps the x-axis to saturation and the y-axis to brightness by default.
 * The top-left is white, the top-right is the fully-saturated hue, the bottom is black.
 *
 * Usage:
 * ```css
 * background:
 *   linear-gradient(to bottom, transparent, #000),
 *   linear-gradient(to right, #fff, hsl(HUED, 100%, 50%));
 * ```
 *
 * Returns a single `background` shorthand value.
 */
export function getColorAreaBackground(
  color: Color,
  xChannel: ColorChannel,
  yChannel: ColorChannel,
): string {
  // Determine which channel is the hue (z-channel, constant across the area)
  const axes = color.getColorAxes({ xChannel, yChannel });
  const hue = getHueForArea(color, axes.zChannel);

  // In the default HSB area (x=saturation, y=brightness):
  //   left = white (S=0), right = full hue (S=100)
  //   top = bright, bottom = black (B=0)
  const hueColor = `hsl(${Math.round(hue)}, 100%, 50%)`;

  return [
    'linear-gradient(to bottom, transparent, #000)',
    `linear-gradient(to right, #fff, ${hueColor})`,
  ].join(', ');
}

/**
 * Generate the CSS background gradient for a 1D channel slider track.
 */
export function getChannelSliderBackground(
  color: Color,
  channel: ColorChannel,
  direction: 'ltr' | 'rtl' = 'ltr',
): string {
  const to = direction === 'rtl' ? 'to left' : 'to right';

  switch (channel) {
    case 'hue':
      return getHueGradient(to);
    case 'alpha':
      return getAlphaGradient(color, to);
    case 'saturation':
      return getSaturationGradient(color, to);
    case 'brightness':
      return getBrightnessGradient(color, to);
    case 'lightness':
      return getLightnessGradient(color, to);
    case 'red':
      return getRgbChannelGradient(color, 'red', to);
    case 'green':
      return getRgbChannelGradient(color, 'green', to);
    case 'blue':
      return getRgbChannelGradient(color, 'blue', to);
    default:
      return 'transparent';
  }
}

// ---------------------------------------------------------------------------
// Individual gradient generators
// ---------------------------------------------------------------------------

function getHueGradient(to: string): string {
  return (
    `linear-gradient(${to}, ` +
    `hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), ` +
    `hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`
  );
}

function getAlphaGradient(color: Color, to: string): string {
  const opaqueColor = getOpaqueColor(color);
  const checkerboard = `repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 16px 16px`;
  return `linear-gradient(${to}, transparent, ${opaqueColor}), ${checkerboard}`;
}

function getSaturationGradient(color: Color, to: string): string {
  // From grey (S=0) to fully saturated hue
  const hue = getHueFromColor(color);
  const fullColor = `hsl(${Math.round(hue)}, 100%, 50%)`;
  const greyColor = `hsl(${Math.round(hue)}, 0%, 50%)`;
  return `linear-gradient(${to}, ${greyColor}, ${fullColor})`;
}

function getBrightnessGradient(color: Color, to: string): string {
  // From black (B=0) to fully bright hue at current saturation
  const hue = getHueFromColor(color);
  const sat = getSaturationFromColor(color);
  const fullColor = `hsl(${Math.round(hue)}, ${Math.round(sat)}%, 50%)`;
  return `linear-gradient(${to}, #000, ${fullColor})`;
}

function getLightnessGradient(color: Color, to: string): string {
  // From black → full hue → white
  const hue = getHueFromColor(color);
  return `linear-gradient(${to}, #000, hsl(${Math.round(hue)}, 100%, 50%), #fff)`;
}

function getRgbChannelGradient(
  color: Color,
  channel: 'red' | 'green' | 'blue',
  to: string,
): string {
  const [r, g, b] = [
    color.getColorSpace() === 'rgb' ? color.getChannelValue('red') : toRgbChannel(color, 'red'),
    color.getColorSpace() === 'rgb' ? color.getChannelValue('green') : toRgbChannel(color, 'green'),
    color.getColorSpace() === 'rgb' ? color.getChannelValue('blue') : toRgbChannel(color, 'blue'),
  ];

  const minColor =
    channel === 'red'
      ? `rgb(0, ${g}, ${b})`
      : channel === 'green'
        ? `rgb(${r}, 0, ${b})`
        : `rgb(${r}, ${g}, 0)`;

  const maxColor =
    channel === 'red'
      ? `rgb(255, ${g}, ${b})`
      : channel === 'green'
        ? `rgb(${r}, 255, ${b})`
        : `rgb(${r}, ${g}, 255)`;

  return `linear-gradient(${to}, ${minColor}, ${maxColor})`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHueForArea(color: Color, zChannel: ColorChannel): number {
  try {
    return color.getChannelValue('hue');
  } catch {
    // Color space without a hue channel (RGB) — convert to HSB to get hue
    const hsb = color.toFormat('hsb') as HSBColor;
    return hsb.h;
  }
}

function getHueFromColor(color: Color): number {
  try {
    return color.getChannelValue('hue');
  } catch {
    const hsb = color.toFormat('hsb') as HSBColor;
    return hsb.h;
  }
}

function getSaturationFromColor(color: Color): number {
  try {
    return color.getChannelValue('saturation');
  } catch {
    const hsb = color.toFormat('hsb') as HSBColor;
    return hsb.s;
  }
}

function getOpaqueColor(color: Color): string {
  const space = color.getColorSpace();
  if (space === 'rgb') {
    const r = color.getChannelValue('red');
    const g = color.getChannelValue('green');
    const b = color.getChannelValue('blue');
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (space === 'hsl') {
    const h = color.getChannelValue('hue');
    const s = color.getChannelValue('saturation');
    const l = color.getChannelValue('lightness');
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }
  // HSB — convert to CSS hsl
  const h = color.getChannelValue('hue');
  const s = color.getChannelValue('saturation');
  const b = color.getChannelValue('brightness');
  const [r, g, bl] = hsbToRgb(h, s, b);
  return `rgb(${r}, ${g}, ${bl})`;
}

function toRgbChannel(color: Color, channel: 'red' | 'green' | 'blue'): number {
  const rgb = color.toFormat('rgb');
  return rgb.getChannelValue(channel);
}
