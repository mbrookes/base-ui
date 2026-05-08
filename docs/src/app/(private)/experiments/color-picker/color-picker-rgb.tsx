'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';
import styles from './color-picker.module.css';

export default function ColorPickerRgbExperiment() {
  const [value, setValue] = React.useState<ColorPicker.Color | string>('rgb(100, 160, 220)');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Color Picker — RGB mode</h1>

      <ColorPicker.Root format="rgb" value={value} onValueChange={(color) => setValue(color)}>
        <div className={styles.layout}>
          <ColorPicker.ChannelSlider channel="red" className={styles.slider}>
            <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          <ColorPicker.ChannelSlider channel="green" className={styles.slider}>
            <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          <ColorPicker.ChannelSlider channel="blue" className={styles.slider}>
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
              R
              <ColorPicker.ChannelInput channel="red" className={styles.input} />
            </label>
            <label>
              G
              <ColorPicker.ChannelInput channel="green" className={styles.input} />
            </label>
            <label>
              B
              <ColorPicker.ChannelInput channel="blue" className={styles.input} />
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
            Value: <code>{typeof value === 'string' ? value : value.toString('rgba')}</code>
          </p>
        </div>
      </ColorPicker.Root>
    </div>
  );
}
