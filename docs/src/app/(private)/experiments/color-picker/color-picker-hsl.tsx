'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';
import styles from './color-picker.module.css';

export default function ColorPickerHslExperiment() {
  const [value, setValue] = React.useState<ColorPicker.Color | string>('hsl(210, 70%, 60%)');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Color Picker — HSL mode</h1>

      <ColorPicker.Root format="hsl" value={value} onValueChange={(color) => setValue(color)}>
        <div className={styles.layout}>
          <div className={styles.areaWrapper}>
            <ColorPicker.Area xChannel="saturation" yChannel="lightness" className={styles.area}>
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
              L
              <ColorPicker.ChannelInput channel="lightness" className={styles.input} />
            </label>
            <label>
              A
              <ColorPicker.ChannelInput channel="alpha" className={styles.input} />
            </label>
          </div>

          <div className={styles.inputs}>
            <label>
              Hex
              <ColorPicker.ChannelInput channel="hex" className={styles.input} />
            </label>
          </div>

          <p style={{ fontSize: 12, color: '#666' }}>
            Value: <code>{typeof value === 'string' ? value : value.toString('hsla')}</code>
          </p>
        </div>
      </ColorPicker.Root>
    </div>
  );
}
