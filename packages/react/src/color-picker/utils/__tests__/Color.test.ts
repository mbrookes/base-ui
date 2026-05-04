import { describe, expect, it } from 'vitest';
import { parseColor } from '../parseColor';
import { HSBColor, HSLColor, RGBColor } from '../Color';

describe('parseColor', () => {
  describe('hex', () => {
    it('parses 6-digit hex', () => {
      const c = parseColor('#ff5500');
      expect(c).toBeInstanceOf(RGBColor);
      expect(c.getChannelValue('red')).toBe(255);
      expect(c.getChannelValue('green')).toBe(85);
      expect(c.getChannelValue('blue')).toBe(0);
      expect(c.getChannelValue('alpha')).toBe(1);
    });

    it('parses 3-digit hex', () => {
      const c = parseColor('#f50');
      expect(c).toBeInstanceOf(RGBColor);
      expect(c.getChannelValue('red')).toBe(255);
      expect(c.getChannelValue('green')).toBe(85);
      expect(c.getChannelValue('blue')).toBe(0);
    });

    it('parses 8-digit hex with alpha', () => {
      const c = parseColor('#ff550080');
      expect(c.getChannelValue('alpha')).toBeCloseTo(128 / 255, 5);
    });

    it('parses 4-digit hex with alpha', () => {
      const c = parseColor('#f508');
      expect(c.getChannelValue('alpha')).toBeCloseTo(136 / 255, 5);
    });

    it('parses uppercase hex', () => {
      const c = parseColor('#FF5500');
      expect(c.getChannelValue('red')).toBe(255);
    });
  });

  describe('rgb/rgba', () => {
    it('parses rgb()', () => {
      const c = parseColor('rgb(255, 85, 0)');
      expect(c).toBeInstanceOf(RGBColor);
      expect(c.getChannelValue('red')).toBe(255);
      expect(c.getChannelValue('green')).toBe(85);
      expect(c.getChannelValue('blue')).toBe(0);
    });

    it('parses rgba()', () => {
      const c = parseColor('rgba(255, 85, 0, 0.5)');
      expect(c.getChannelValue('alpha')).toBe(0.5);
    });
  });

  describe('hsl/hsla', () => {
    it('parses hsl()', () => {
      const c = parseColor('hsl(0, 100%, 50%)');
      expect(c).toBeInstanceOf(HSLColor);
      expect(c.getChannelValue('hue')).toBe(0);
      expect(c.getChannelValue('saturation')).toBe(100);
      expect(c.getChannelValue('lightness')).toBe(50);
    });

    it('parses hsla()', () => {
      const c = parseColor('hsla(120, 60%, 40%, 0.7)');
      expect(c.getChannelValue('alpha')).toBe(0.7);
    });
  });

  describe('hsb/hsba', () => {
    it('parses hsb()', () => {
      const c = parseColor('hsb(200, 80%, 90%)');
      expect(c).toBeInstanceOf(HSBColor);
      expect(c.getChannelValue('hue')).toBe(200);
      expect(c.getChannelValue('saturation')).toBe(80);
      expect(c.getChannelValue('brightness')).toBe(90);
    });

    it('parses hsba()', () => {
      const c = parseColor('hsba(200, 80%, 90%, 0.5)');
      expect(c.getChannelValue('alpha')).toBe(0.5);
    });
  });

  it('throws on unknown format', () => {
    expect(() => parseColor('purple')).toThrow('Base UI: Cannot parse color');
  });

  it('throws on non-string input', () => {
    expect(() => parseColor(null as any)).toThrow('Base UI: parseColor() expects a string');
  });
});

describe('HSBColor', () => {
  describe('getChannelValue', () => {
    it('returns correct channel values', () => {
      const c = new HSBColor(180, 60, 80, 0.5);
      expect(c.getChannelValue('hue')).toBe(180);
      expect(c.getChannelValue('saturation')).toBe(60);
      expect(c.getChannelValue('brightness')).toBe(80);
      expect(c.getChannelValue('alpha')).toBe(0.5);
    });

    it('throws for unknown channel', () => {
      const c = new HSBColor(0, 0, 0);
      expect(() => c.getChannelValue('red')).toThrow('Base UI: HSBColor does not have a channel');
    });
  });

  describe('withChannelValue', () => {
    it('returns a new color with updated channel', () => {
      const c = new HSBColor(180, 60, 80);
      const updated = c.withChannelValue('hue', 90);
      expect(updated.getChannelValue('hue')).toBe(90);
      expect(c.getChannelValue('hue')).toBe(180); // original unchanged
    });

    it('clamps values to channel range', () => {
      const c = new HSBColor(0, 0, 0);
      expect(c.withChannelValue('hue', 400).getChannelValue('hue')).toBe(360);
      expect(c.withChannelValue('saturation', -10).getChannelValue('saturation')).toBe(0);
    });
  });

  describe('toString', () => {
    it('serializes to hsb format', () => {
      const c = new HSBColor(180, 60, 80);
      expect(c.toString('hsb')).toBe('hsb(180, 60%, 80%)');
    });

    it('serializes to hsba format', () => {
      const c = new HSBColor(180, 60, 80, 0.5);
      expect(c.toString('hsba')).toBe('hsba(180, 60%, 80%, 0.5)');
    });

    it('serializes to hex via toFormat', () => {
      const c = new HSBColor(0, 100, 100); // pure red
      expect(c.toString('hex')).toBe('#ff0000');
    });
  });

  describe('toFormat', () => {
    it('converts to RGB', () => {
      const c = new HSBColor(0, 100, 100); // pure red
      const rgb = c.toFormat('rgb') as RGBColor;
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
    });

    it('converts to HSL', () => {
      const c = new HSBColor(0, 100, 100); // pure red → hsl(0, 100%, 50%)
      const hsl = c.toFormat('hsl') as HSLColor;
      expect(hsl.h).toBeCloseTo(0, 0);
      expect(hsl.s).toBeCloseTo(100, 0);
      expect(hsl.l).toBeCloseTo(50, 0);
    });
  });

  describe('isEqual', () => {
    it('returns true for same color', () => {
      const a = new HSBColor(90, 50, 70, 1);
      const b = new HSBColor(90, 50, 70, 1);
      expect(a.isEqual(b)).toBe(true);
    });

    it('returns false for different color', () => {
      const a = new HSBColor(90, 50, 70);
      const b = new HSBColor(90, 50, 80);
      expect(a.isEqual(b)).toBe(false);
    });
  });

  describe('incrementChannel / decrementChannel', () => {
    it('increments hue', () => {
      const c = new HSBColor(10, 50, 50);
      expect(c.incrementChannel('hue', 5).getChannelValue('hue')).toBe(15);
    });

    it('clamps to max on increment', () => {
      const c = new HSBColor(358, 50, 50);
      expect(c.incrementChannel('hue', 5).getChannelValue('hue')).toBe(360);
    });

    it('clamps to min on decrement', () => {
      const c = new HSBColor(2, 50, 50);
      expect(c.decrementChannel('hue', 5).getChannelValue('hue')).toBe(0);
    });
  });

  describe('getChannelPercentValue', () => {
    it('maps 0% to min', () => {
      const c = new HSBColor(0, 0, 0);
      expect(c.getChannelPercentValue('hue', 0)).toBe(0);
      expect(c.getChannelPercentValue('saturation', 0)).toBe(0);
    });

    it('maps 100% to max', () => {
      const c = new HSBColor(0, 0, 0);
      expect(c.getChannelPercentValue('hue', 1)).toBe(360);
      expect(c.getChannelPercentValue('saturation', 1)).toBe(100);
    });

    it('maps 50% to midpoint', () => {
      const c = new HSBColor(0, 0, 0);
      expect(c.getChannelPercentValue('hue', 0.5)).toBe(180);
    });
  });

  describe('getColorAxes', () => {
    it('resolves z-channel', () => {
      const c = new HSBColor(0, 0, 0);
      const axes = c.getColorAxes({ xChannel: 'saturation', yChannel: 'brightness' });
      expect(axes.zChannel).toBe('hue');
    });
  });
});

describe('RGBColor', () => {
  describe('toString', () => {
    it('serializes to hex', () => {
      const c = new RGBColor(255, 0, 0);
      expect(c.toString('hex')).toBe('#ff0000');
    });

    it('serializes to hexa', () => {
      const c = new RGBColor(255, 0, 0, 0.5);
      expect(c.toString('hexa')).toBe('#ff000080');
    });

    it('serializes to rgb', () => {
      const c = new RGBColor(128, 64, 32);
      expect(c.toString('rgb')).toBe('rgb(128, 64, 32)');
    });
  });

  describe('toFormat', () => {
    it('converts to HSB', () => {
      const c = new RGBColor(255, 0, 0);
      const hsb = c.toFormat('hsb') as HSBColor;
      expect(hsb.h).toBeCloseTo(0, 0);
      expect(hsb.s).toBeCloseTo(100, 0);
      expect(hsb.b).toBeCloseTo(100, 0);
    });
  });
});

describe('HSLColor', () => {
  describe('toString', () => {
    it('serializes to hsl', () => {
      const c = new HSLColor(120, 100, 50);
      expect(c.toString('hsl')).toBe('hsl(120, 100%, 50%)');
    });
  });

  describe('toFormat', () => {
    it('converts to RGB', () => {
      const c = new HSLColor(0, 100, 50); // pure red
      const rgb = c.toFormat('rgb') as RGBColor;
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
    });

    it('converts to HSB', () => {
      const c = new HSLColor(0, 100, 50); // pure red
      const hsb = c.toFormat('hsb') as HSBColor;
      expect(hsb.h).toBeCloseTo(0, 0);
      expect(hsb.s).toBeCloseTo(100, 0);
      expect(hsb.b).toBeCloseTo(100, 0);
    });
  });
});
