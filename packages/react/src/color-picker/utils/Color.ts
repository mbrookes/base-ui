import { clamp } from '../../internals/clamp';
import type { Color, ColorAxes, ColorChannel, ColorChannelRange, ColorFormat, ColorSpace } from './types';

// Channel ranges for HSB color space
const HSB_CHANNEL_RANGES: Record<ColorChannel, ColorChannelRange> = {
  hue: { minValue: 0, maxValue: 360, step: 1, pageSize: 15 },
  saturation: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
  brightness: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
  alpha: { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 },
  // Not used in HSB but required by the interface
  lightness: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
  red: { minValue: 0, maxValue: 255, step: 1, pageSize: 17 },
  green: { minValue: 0, maxValue: 255, step: 1, pageSize: 17 },
  blue: { minValue: 0, maxValue: 255, step: 1, pageSize: 17 },
};

/** Convert HSB (0–360, 0–100, 0–100) to RGB (0–255 each). */
export function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const val = b / 100;

  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c;
    g1 = x;
  } else if (hue < 120) {
    r1 = x;
    g1 = c;
  } else if (hue < 180) {
    g1 = c;
    b1 = x;
  } else if (hue < 240) {
    g1 = x;
    b1 = c;
  } else if (hue < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

/** Convert RGB (0–255 each) to HSB (0–360, 0–100, 0–100). */
export function rgbToHsb(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2);
    } else {
      h = 60 * ((rn - gn) / delta + 4);
    }
  }

  h = ((h % 360) + 360) % 360;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return [h, s, v];
}

/** Convert HSB to HSL. Returns [hue 0–360, saturation 0–100, lightness 0–100]. */
export function hsbToHsl(h: number, s: number, b: number): [number, number, number] {
  const [r, g, bl] = hsbToRgb(h, s, b);
  return rgbToHsl(r, g, bl);
}

/** Convert RGB (0–255 each) to HSL (0–360, 0–100, 0–100). */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const delta = max - min;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2);
    } else {
      h = 60 * ((rn - gn) / delta + 4);
    }

    h = ((h % 360) + 360) % 360;
  }

  return [h, s * 100, l * 100];
}

/** Convert HSL (0–360, 0–100, 0–100) to RGB (0–255 each). */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = s / 100;
  const lig = l / 100;
  const hue = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c;
    g1 = x;
  } else if (hue < 120) {
    r1 = x;
    g1 = c;
  } else if (hue < 180) {
    g1 = c;
    b1 = x;
  } else if (hue < 240) {
    g1 = x;
    b1 = c;
  } else if (hue < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

/**
 * Immutable HSB color with alpha channel.
 * This is the canonical internal representation for the ColorPicker.
 *
 * - `h`: hue, 0–360
 * - `s`: saturation, 0–100
 * - `b`: brightness, 0–100
 * - `a`: alpha, 0–1
 */
export class HSBColor implements Color {
  readonly h: number;
  readonly s: number;
  readonly b: number;
  readonly a: number;

  constructor(h: number, s: number, b: number, a: number = 1) {
    this.h = clamp(h, 0, 360);
    this.s = clamp(s, 0, 100);
    this.b = clamp(b, 0, 100);
    this.a = clamp(a, 0, 1);
  }

  getColorSpace(): ColorSpace {
    return 'hsb';
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case 'hue':
        return this.h;
      case 'saturation':
        return this.s;
      case 'brightness':
        return this.b;
      case 'alpha':
        return this.a;
      default:
        throw new Error(`Base UI: HSBColor does not have a channel named "${channel}".`);
    }
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    const range = this.getChannelRange(channel);
    const clamped = clamp(value, range.minValue, range.maxValue);
    switch (channel) {
      case 'hue':
        return new HSBColor(clamped, this.s, this.b, this.a);
      case 'saturation':
        return new HSBColor(this.h, clamped, this.b, this.a);
      case 'brightness':
        return new HSBColor(this.h, this.s, clamped, this.a);
      case 'alpha':
        return new HSBColor(this.h, this.s, this.b, clamped);
      default:
        throw new Error(`Base UI: HSBColor does not have a channel named "${channel}".`);
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    return HSB_CHANNEL_RANGES[channel];
  }

  getChannelPercentValue(channel: ColorChannel, percent: number): number {
    const range = this.getChannelRange(channel);
    return range.minValue + clamp(percent, 0, 1) * (range.maxValue - range.minValue);
  }

  incrementChannel(channel: ColorChannel, step: number): Color {
    const range = this.getChannelRange(channel);
    const current = this.getChannelValue(channel);
    return this.withChannelValue(channel, clamp(current + step, range.minValue, range.maxValue));
  }

  decrementChannel(channel: ColorChannel, step: number): Color {
    const range = this.getChannelRange(channel);
    const current = this.getChannelValue(channel);
    return this.withChannelValue(channel, clamp(current - step, range.minValue, range.maxValue));
  }

  getColorAxes(xy: { xChannel: ColorChannel; yChannel: ColorChannel }): ColorAxes {
    const { xChannel, yChannel } = xy;
    const channels: ColorChannel[] = ['hue', 'saturation', 'brightness'];
    const zChannel = channels.find((c) => c !== xChannel && c !== yChannel);
    if (!zChannel) {
      throw new Error(
        `Base UI: Cannot resolve z-channel from xChannel="${xChannel}" and yChannel="${yChannel}" in HSB color space.`,
      );
    }
    return { xChannel, yChannel, zChannel };
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case 'hsb':
      case 'hsba':
        return this.clone();
      case 'rgb':
      case 'rgba': {
        const [r, g, b] = hsbToRgb(this.h, this.s, this.b);
        return new RGBColor(r, g, b, this.a);
      }
      case 'hsl':
      case 'hsla': {
        const [h, s, l] = hsbToHsl(this.h, this.s, this.b);
        return new HSLColor(h, s, l, this.a);
      }
      case 'hex':
      case 'hexa': {
        const [r, g, b] = hsbToRgb(this.h, this.s, this.b);
        return new RGBColor(r, g, b, this.a);
      }
      default:
        throw new Error(`Base UI: Unsupported color format "${format}".`);
    }
  }

  toString(format: ColorFormat | 'css' = 'hsb'): string {
    switch (format) {
      case 'hsb':
        return `hsb(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.b)}%)`;
      case 'hsba':
        return `hsba(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.b)}%, ${this.a})`;
      case 'css': {
        // CSS doesn't support hsb natively; render as hsl
        const [h, s, l] = hsbToHsl(this.h, this.s, this.b);
        if (this.a < 1) {
          return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${this.a})`;
        }
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
      }
      default:
        return this.toFormat(format).toString(format);
    }
  }

  clone(): Color {
    return new HSBColor(this.h, this.s, this.b, this.a);
  }

  isEqual(color: Color): boolean {
    if (!(color instanceof HSBColor)) {
      // Compare via hex for cross-space equality
      return this.toString('hex') === color.toString('hex') && this.a === color.getChannelValue('alpha');
    }
    return this.h === color.h && this.s === color.s && this.b === color.b && this.a === color.a;
  }

  toJSON(): Record<string, number> {
    return { h: this.h, s: this.s, b: this.b, a: this.a };
  }
}

/**
 * Immutable RGB color with alpha channel.
 *
 * - `r`, `g`, `b`: 0–255
 * - `a`: alpha, 0–1
 */
export class RGBColor implements Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(r: number, g: number, b: number, a: number = 1) {
    this.r = clamp(Math.round(r), 0, 255);
    this.g = clamp(Math.round(g), 0, 255);
    this.b = clamp(Math.round(b), 0, 255);
    this.a = clamp(a, 0, 1);
  }

  getColorSpace(): ColorSpace {
    return 'rgb';
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case 'red':
        return this.r;
      case 'green':
        return this.g;
      case 'blue':
        return this.b;
      case 'alpha':
        return this.a;
      default:
        throw new Error(`Base UI: RGBColor does not have a channel named "${channel}".`);
    }
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    const range = this.getChannelRange(channel);
    const clamped = clamp(Math.round(value), range.minValue, range.maxValue);
    switch (channel) {
      case 'red':
        return new RGBColor(clamped, this.g, this.b, this.a);
      case 'green':
        return new RGBColor(this.r, clamped, this.b, this.a);
      case 'blue':
        return new RGBColor(this.r, this.g, clamped, this.a);
      case 'alpha':
        return new RGBColor(this.r, this.g, this.b, clamp(value, 0, 1));
      default:
        throw new Error(`Base UI: RGBColor does not have a channel named "${channel}".`);
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case 'red':
      case 'green':
      case 'blue':
        return { minValue: 0, maxValue: 255, step: 1, pageSize: 17 };
      case 'alpha':
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 };
      default:
        throw new Error(`Base UI: RGBColor does not have a channel named "${channel}".`);
    }
  }

  getChannelPercentValue(channel: ColorChannel, percent: number): number {
    const range = this.getChannelRange(channel);
    return range.minValue + clamp(percent, 0, 1) * (range.maxValue - range.minValue);
  }

  incrementChannel(channel: ColorChannel, step: number): Color {
    const range = this.getChannelRange(channel);
    const current = this.getChannelValue(channel);
    return this.withChannelValue(channel, clamp(current + step, range.minValue, range.maxValue));
  }

  decrementChannel(channel: ColorChannel, step: number): Color {
    const range = this.getChannelRange(channel);
    const current = this.getChannelValue(channel);
    return this.withChannelValue(channel, clamp(current - step, range.minValue, range.maxValue));
  }

  getColorAxes(xy: { xChannel: ColorChannel; yChannel: ColorChannel }): ColorAxes {
    const { xChannel, yChannel } = xy;
    const channels: ColorChannel[] = ['red', 'green', 'blue'];
    const zChannel = channels.find((c) => c !== xChannel && c !== yChannel);
    if (!zChannel) {
      throw new Error(
        `Base UI: Cannot resolve z-channel from xChannel="${xChannel}" and yChannel="${yChannel}" in RGB color space.`,
      );
    }
    return { xChannel, yChannel, zChannel };
  }

  toHsb(): HSBColor {
    const [h, s, b] = rgbToHsb(this.r, this.g, this.b);
    return new HSBColor(h, s, b, this.a);
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case 'rgb':
      case 'rgba':
        return this.clone();
      case 'hex':
      case 'hexa':
        return this.clone();
      case 'hsb':
      case 'hsba':
        return this.toHsb();
      case 'hsl':
      case 'hsla': {
        const [h, s, l] = rgbToHsl(this.r, this.g, this.b);
        return new HSLColor(h, s, l, this.a);
      }
      default:
        throw new Error(`Base UI: Unsupported color format "${format}".`);
    }
  }

  toString(format: ColorFormat | 'css' = 'rgb'): string {
    switch (format) {
      case 'hex': {
        const hex =
          `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
        return hex;
      }
      case 'hexa':
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}${toHex(Math.round(this.a * 255))}`;
      case 'rgb':
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
      case 'rgba':
      case 'css':
        if (this.a < 1) {
          return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
        }
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  clone(): Color {
    return new RGBColor(this.r, this.g, this.b, this.a);
  }

  isEqual(color: Color): boolean {
    if (!(color instanceof RGBColor)) {
      return this.toString('hex') === color.toString('hex') && this.a === color.getChannelValue('alpha');
    }
    return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a;
  }

  toJSON(): Record<string, number> {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }
}

/**
 * Immutable HSL color with alpha channel.
 *
 * - `h`: hue, 0–360
 * - `s`: saturation, 0–100
 * - `l`: lightness, 0–100
 * - `a`: alpha, 0–1
 */
export class HSLColor implements Color {
  readonly h: number;
  readonly s: number;
  readonly l: number;
  readonly a: number;

  constructor(h: number, s: number, l: number, a: number = 1) {
    this.h = clamp(h, 0, 360);
    this.s = clamp(s, 0, 100);
    this.l = clamp(l, 0, 100);
    this.a = clamp(a, 0, 1);
  }

  getColorSpace(): ColorSpace {
    return 'hsl';
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case 'hue':
        return this.h;
      case 'saturation':
        return this.s;
      case 'lightness':
        return this.l;
      case 'alpha':
        return this.a;
      default:
        throw new Error(`Base UI: HSLColor does not have a channel named "${channel}".`);
    }
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    const range = this.getChannelRange(channel);
    const clamped = clamp(value, range.minValue, range.maxValue);
    switch (channel) {
      case 'hue':
        return new HSLColor(clamped, this.s, this.l, this.a);
      case 'saturation':
        return new HSLColor(this.h, clamped, this.l, this.a);
      case 'lightness':
        return new HSLColor(this.h, this.s, clamped, this.a);
      case 'alpha':
        return new HSLColor(this.h, this.s, this.l, clamped);
      default:
        throw new Error(`Base UI: HSLColor does not have a channel named "${channel}".`);
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case 'hue':
        return { minValue: 0, maxValue: 360, step: 1, pageSize: 15 };
      case 'saturation':
      case 'lightness':
        return { minValue: 0, maxValue: 100, step: 1, pageSize: 10 };
      case 'alpha':
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 };
      default:
        throw new Error(`Base UI: HSLColor does not have a channel named "${channel}".`);
    }
  }

  getChannelPercentValue(channel: ColorChannel, percent: number): number {
    const range = this.getChannelRange(channel);
    return range.minValue + clamp(percent, 0, 1) * (range.maxValue - range.minValue);
  }

  incrementChannel(channel: ColorChannel, step: number): Color {
    const range = this.getChannelRange(channel);
    const current = this.getChannelValue(channel);
    return this.withChannelValue(channel, clamp(current + step, range.minValue, range.maxValue));
  }

  decrementChannel(channel: ColorChannel, step: number): Color {
    const range = this.getChannelRange(channel);
    const current = this.getChannelValue(channel);
    return this.withChannelValue(channel, clamp(current - step, range.minValue, range.maxValue));
  }

  getColorAxes(xy: { xChannel: ColorChannel; yChannel: ColorChannel }): ColorAxes {
    const { xChannel, yChannel } = xy;
    const channels: ColorChannel[] = ['hue', 'saturation', 'lightness'];
    const zChannel = channels.find((c) => c !== xChannel && c !== yChannel);
    if (!zChannel) {
      throw new Error(
        `Base UI: Cannot resolve z-channel from xChannel="${xChannel}" and yChannel="${yChannel}" in HSL color space.`,
      );
    }
    return { xChannel, yChannel, zChannel };
  }

  toHsb(): HSBColor {
    const [r, g, b] = hslToRgb(this.h, this.s, this.l);
    const [hh, ss, bb] = rgbToHsb(r, g, b);
    return new HSBColor(hh, ss, bb, this.a);
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case 'hsl':
      case 'hsla':
        return this.clone();
      case 'hsb':
      case 'hsba':
        return this.toHsb();
      case 'rgb':
      case 'rgba':
      case 'hex':
      case 'hexa': {
        const [r, g, b] = hslToRgb(this.h, this.s, this.l);
        return new RGBColor(r, g, b, this.a).toFormat(format);
      }
      default:
        throw new Error(`Base UI: Unsupported color format "${format}".`);
    }
  }

  toString(format: ColorFormat | 'css' = 'hsl'): string {
    switch (format) {
      case 'hsl':
        return `hsl(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l)}%)`;
      case 'hsla':
        return `hsla(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l)}%, ${this.a})`;
      case 'css':
        if (this.a < 1) {
          return `hsla(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l)}%, ${this.a})`;
        }
        return `hsl(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l)}%)`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  clone(): Color {
    return new HSLColor(this.h, this.s, this.l, this.a);
  }

  isEqual(color: Color): boolean {
    if (!(color instanceof HSLColor)) {
      return this.toString('hex') === color.toString('hex') && this.a === color.getChannelValue('alpha');
    }
    return this.h === color.h && this.s === color.s && this.l === color.l && this.a === color.a;
  }

  toJSON(): Record<string, number> {
    return { h: this.h, s: this.s, l: this.l, a: this.a };
  }
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}
