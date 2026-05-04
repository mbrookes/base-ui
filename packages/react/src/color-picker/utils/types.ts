export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba';

export type ColorSpace = 'rgb' | 'hsl' | 'hsb';

export type ColorChannel =
  | 'hue'
  | 'saturation'
  | 'brightness'
  | 'lightness'
  | 'red'
  | 'green'
  | 'blue'
  | 'alpha';

export interface ColorChannelRange {
  minValue: number;
  maxValue: number;
  /** Arrow-key step. */
  step: number;
  /** Shift+Arrow / PageUp/PageDown step. */
  pageSize: number;
}

export interface ColorAxes {
  xChannel: ColorChannel;
  yChannel: ColorChannel;
  /** The channel that is constant in the 2D area. */
  zChannel: ColorChannel;
}

export interface Color {
  /** Convert to another color format. */
  toFormat(format: ColorFormat): Color;
  /** Serialize to a CSS-compatible string. */
  toString(format?: ColorFormat | 'css'): string;
  /** Create a copy of this color. */
  clone(): Color;
  /** Check equality with another color (compares all channels). */
  isEqual(color: Color): boolean;

  /** Get the numeric value of a channel. */
  getChannelValue(channel: ColorChannel): number;
  /** Return a new Color with one channel updated. Immutable. */
  withChannelValue(channel: ColorChannel, value: number): Color;
  /** Get the min/max/step/pageSize for a channel. */
  getChannelRange(channel: ColorChannel): ColorChannelRange;
  /**
   * Map a [0, 1] fraction to the channel's actual range.
   * Used to convert pointer position to channel value.
   */
  getChannelPercentValue(channel: ColorChannel, percent: number): number;

  /** Increment a channel by the given step amount, clamped to range. */
  incrementChannel(channel: ColorChannel, step: number): Color;
  /** Decrement a channel by the given step amount, clamped to range. */
  decrementChannel(channel: ColorChannel, step: number): Color;

  /** Return which color space this color is in. */
  getColorSpace(): ColorSpace;
  /**
   * Given an x/y channel pair for a 2D area, resolve the third (z) channel.
   */
  getColorAxes(xy: { xChannel: ColorChannel; yChannel: ColorChannel }): ColorAxes;

  /** Serialize to a plain record for debug/serialization. */
  toJSON(): Record<string, number>;
}
