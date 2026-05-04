'use client';
import * as React from 'react';
import { ColorPicker } from '@base-ui/react/color-picker';

export default function ExampleColorPicker() {
  return (
    <ColorPicker.Root defaultValue="hsb(210, 80%, 90%)" className="flex w-56 flex-col gap-2.5">
      <ColorPicker.Area className="relative h-36 w-full cursor-crosshair touch-none select-none rounded">
        <ColorPicker.AreaThumb className="box-border size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_color-mix(in_srgb,black_30%,transparent)]" />
      </ColorPicker.Area>

      <div className="flex items-center gap-2.5">
        <ColorPicker.Swatch className="size-8 shrink-0 rounded-full bg-[var(--color)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,black_12%,transparent)]" />

        <div className="flex flex-1 flex-col gap-2">
          <ColorPicker.ChannelSlider channel="hue">
            <ColorPicker.ChannelSliderTrack className="h-2.5 w-full touch-none select-none rounded-full">
              <ColorPicker.ChannelSliderThumb className="box-border block size-3.5 rounded-full bg-white shadow-[0_0_0_1px_color-mix(in_srgb,black_30%,transparent)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800" />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>

          <ColorPicker.ChannelSlider channel="alpha">
            <ColorPicker.ChannelSliderTrack className="h-2.5 w-full touch-none select-none rounded-full">
              <ColorPicker.ChannelSliderThumb className="box-border block size-3.5 rounded-full bg-white shadow-[0_0_0_1px_color-mix(in_srgb,black_30%,transparent)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800" />
            </ColorPicker.ChannelSliderTrack>
          </ColorPicker.ChannelSlider>
        </div>
      </div>
    </ColorPicker.Root>
  );
}
