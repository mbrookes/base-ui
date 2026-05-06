'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';
import styles from './color-picker.module.css';
import swatchStyles from './color-picker-swatches.module.css';

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
  '#000000',
  '#ffffff',
];

export default function ColorPickerSwatchesExperiment() {
  const [value, setValue] = React.useState<ColorPicker.Color | string>('#3b82f6');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Color Picker — Swatches</h1>

      <ColorPicker.Root value={value} onValueChange={(color) => setValue(color)}>
        <div className={styles.layout}>
          <div className={styles.areaWrapper}>
            <ColorPicker.Area className={styles.area}>
              <ColorPicker.AreaThumb className={styles.areaThumb} />
            </ColorPicker.Area>
          </div>

          <ColorPicker.ChannelSlider channel="hue" className={styles.slider}>
            <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          <ColorPicker.ChannelSlider channel="alpha" className={styles.slider}>
            <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          {/* Preset swatches */}
          <div className={swatchStyles.presets}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={swatchStyles.presetSwatch}
                style={{ background: color }}
                aria-label={color}
                onClick={() => setValue(color)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ColorPicker.Swatch className={styles.swatch} />
            <div className={styles.inputs}>
              <label>
                Hex
                <ColorPicker.ChannelInput channel="hex" className={styles.input} />
              </label>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#666' }}>
            Value:{' '}
            <code>
              {typeof value === 'string' ? value : value.toString('hex')}
            </code>
          </p>
        </div>
      </ColorPicker.Root>
    </div>
  );
}
