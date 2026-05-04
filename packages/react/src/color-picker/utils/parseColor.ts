import { HSBColor, HSLColor, RGBColor } from './Color';
import type { Color } from './types';

/**
 * Parse a CSS color string into a `Color` object.
 * Supports: hex (#RGB, #RGBA, #RRGGBB, #RRGGBBAA), rgb/rgba(), hsl/hsla(), hsb/hsba().
 *
 * @throws {Error} If the string cannot be parsed.
 */
export function parseColor(value: string): Color {
  if (typeof value !== 'string') {
    throw new Error(
      'Base UI: parseColor() expects a string. Pass a color string like "#ff0000", "rgb(255, 0, 0)", or "hsl(0, 100%, 50%)".',
    );
  }

  const trimmed = value.trim();

  // Hex formats
  const hex = parseHex(trimmed);
  if (hex) {
    return hex;
  }

  // rgb() / rgba()
  const rgb = parseRgb(trimmed);
  if (rgb) {
    return rgb;
  }

  // hsl() / hsla()
  const hsl = parseHsl(trimmed);
  if (hsl) {
    return hsl;
  }

  // hsb() / hsba()
  const hsb = parseHsb(trimmed);
  if (hsb) {
    return hsb;
  }

  throw new Error(
    `Base UI: Cannot parse color "${value}". Supported formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla(), hsb(), hsba().`,
  );
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseHex(value: string): RGBColor | null {
  const hex = value.startsWith('#') ? value.slice(1) : null;
  if (!hex) {
    return null;
  }

  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return null;
    }
    return new RGBColor(r, g, b, 1);
  }

  if (hex.length === 4) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const a = parseInt(hex[3] + hex[3], 16) / 255;
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) {
      return null;
    }
    return new RGBColor(r, g, b, a);
  }

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return null;
    }
    return new RGBColor(r, g, b, 1);
  }

  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) {
      return null;
    }
    return new RGBColor(r, g, b, a);
  }

  return null;
}

function parseRgb(value: string): RGBColor | null {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (!match) {
    return null;
  }
  const r = parseFloat(match[1]);
  const g = parseFloat(match[2]);
  const b = parseFloat(match[3]);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) {
    return null;
  }
  return new RGBColor(r, g, b, a);
}

function parseHsl(value: string): HSLColor | null {
  const match = value.match(
    /^hsla?\(\s*([\d.]+)(?:deg|rad|grad|turn)?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (!match) {
    return null;
  }
  const h = parseAngle(match[1], value);
  const s = parseFloat(match[2]);
  const l = parseFloat(match[3]);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l) || Number.isNaN(a)) {
    return null;
  }
  return new HSLColor(h, s, l, a);
}

function parseHsb(value: string): HSBColor | null {
  const match = value.match(
    /^hsba?\(\s*([\d.]+)(?:deg|rad|grad|turn)?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (!match) {
    return null;
  }
  const h = parseAngle(match[1], value);
  const s = parseFloat(match[2]);
  const b = parseFloat(match[3]);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(b) || Number.isNaN(a)) {
    return null;
  }
  return new HSBColor(h, s, b, a);
}

/** Handle angle units for hue: deg (default), rad, grad, turn. */
function parseAngle(raw: string, fullValue: string): number {
  const num = parseFloat(raw);
  if (Number.isNaN(num)) {
    return NaN;
  }
  if (fullValue.includes('rad')) {
    return (num * 180) / Math.PI;
  }
  if (fullValue.includes('grad')) {
    return num * 0.9;
  }
  if (fullValue.includes('turn')) {
    return num * 360;
  }
  return num;
}
