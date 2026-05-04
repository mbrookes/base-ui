'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';
import styles from './index.module.css';

export default function ExampleColorPicker() {
  return (
    <ColorPicker.Root defaultValue="hsb(210, 80%, 90%)" className={styles.Root}>
      <ColorPicker.Area className={styles.Area}>
        <ColorPicker.AreaThumb className={styles.AreaThumb} />
      </ColorPicker.Area>

      <div className={styles.Row}>
        <ColorPicker.Swatch className={styles.Swatch} />

        <div className={styles.Sliders}>
          <ColorPicker.ChannelSlider channel="hue">
            <ColorPicker.ChannelSliderTrack className={styles.HueTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.Thumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          <ColorPicker.ChannelSlider channel="alpha">
            <ColorPicker.ChannelSliderTrack className={styles.AlphaTrack}>
              <ColorPicker.ChannelSliderThumb className={styles.Thumb} />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>
        </div>
      </div>
    </ColorPicker.Root>
  );
}
