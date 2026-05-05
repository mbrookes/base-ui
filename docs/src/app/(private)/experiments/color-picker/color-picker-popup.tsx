'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';
import styles from './color-picker.module.css';

export default function ColorPickerPopupExperiment() {
  const [value, setValue] = React.useState<ColorPicker.Color | string>('hsb(210, 80%, 90%)');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Color Picker — Popup mode</h1>

      <ColorPicker.Root value={value} onValueChange={(color) => setValue(color)}>
        <ColorPicker.Trigger
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          <ColorPicker.ValueSwatch
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.15)',
              background: 'var(--color)',
            }}
          />
          Pick color
        </ColorPicker.Trigger>

        <ColorPicker.Positioner sideOffset={8}>
          <ColorPicker.Popup
            aria-label="Color picker"
            style={{
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              padding: 16,
            }}
          >
            <div className={styles.layout}>
              {/* 2D Area */}
              <div className={styles.areaWrapper}>
                <ColorPicker.Area className={styles.area}>
                  <ColorPicker.AreaThumb className={styles.areaThumb} />
                </ColorPicker.Area>
              </div>

              {/* Hue Slider */}
              <ColorPicker.ChannelSlider channel="hue" className={styles.slider}>
                <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
                  <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
                </ColorPicker.ChannelSliderTrack>
              </ColorPicker.ChannelSlider>

              {/* Alpha Slider */}
              <ColorPicker.ChannelSlider channel="alpha" className={styles.slider}>
                <ColorPicker.ChannelSliderTrack className={styles.sliderTrack}>
                  <ColorPicker.ChannelSliderThumb className={styles.sliderThumb} />
                </ColorPicker.ChannelSliderTrack>
              </ColorPicker.ChannelSlider>

              {/* Swatch */}
              <ColorPicker.Swatch className={styles.swatch} />

              {/* Channel Inputs */}
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

              <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                Value:{' '}
                <code>{typeof value === 'string' ? value : value.toString('hsba')}</code>
              </p>
            </div>
          </ColorPicker.Popup>
        </ColorPicker.Positioner>
      </ColorPicker.Root>
    </div>
  );
}
