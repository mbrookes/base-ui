'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';
import styles from './color-picker.module.css';

export default function ColorPickerNoAlphaExperiment() {
  const [value, setValue] = React.useState<ColorPicker.Color | string>('hsb(222, 58%, 93%)');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Color Picker — No alpha</h1>

      <ColorPicker.Root value={value} onValueChange={(color) => setValue(color)}>
        <div className={styles.layout}>
          <div className={styles.areaWrapper}>
            <ColorPicker.Area className={styles.area}>
              <ColorPicker.AreaThumb className={styles.areaThumb} />
            </ColorPicker.Area>
          </div>

          {/* Hue only — no alpha slider */}
          <ColorPicker.ChannelSlider channel="hue" className={styles.slider}>
            <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          <ColorPicker.Swatch className={styles.swatch} />

          <div className={styles.inputs}>
            <label>
              H
              <ColorPicker.ChannelInput channel="hue" className={styles.input} />
            </label>
            <label>
              S
              <ColorPicker.ChannelInput channel="saturation" className={styles.input} />
            </label>
            <label>
              B
              <ColorPicker.ChannelInput channel="brightness" className={styles.input} />
            </label>
          </div>

          <div className={styles.inputs}>
            <label>
              Hex
              <ColorPicker.ChannelInput channel="hex" className={styles.input} />
            </label>
          </div>

          <p style={{ fontSize: 12, color: '#666' }}>
            Value: <code>{typeof value === 'string' ? value : value.toString('hex')}</code>
          </p>
        </div>
      </ColorPicker.Root>
    </div>
  );
}
