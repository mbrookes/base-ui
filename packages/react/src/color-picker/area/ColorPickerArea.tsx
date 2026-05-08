'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { ownerDocument } from '@base-ui/utils/owner';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { clamp } from '../../internals/clamp';
import type { ColorChannel, ColorSpace } from '../utils/types';
import { getColorForChannel } from '../utils/getColorForChannel';
import { getColorAreaBackground } from '../utils/colorAreaGradient';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import { ColorPickerAreaContext } from './ColorPickerAreaContext';

const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2;

export interface ColorPickerAreaState {
  dragging: boolean;
  disabled: boolean;
}

/**
 * The 2D gradient area for picking saturation and brightness.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerArea = React.forwardRef(function ColorPickerArea(
  componentProps: ColorPickerArea.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    className,
    render,
    xChannel = 'saturation',
    yChannel = 'brightness',
    colorSpace,
    style,
    ...elementProps
  } = componentProps;
  const { value, setValueFromDrag, onValueChangeEnd, dragging, setDragging, disabled } =
    useColorPickerRootContext();

  const areaRef = React.useRef<HTMLDivElement | null>(null);
  const dragCountRef = React.useRef(0);
  const activePointerIdRef = React.useRef<number | null>(null);
  const stateRef = React.useRef({ value, xChannel, yChannel, disabled });
  stateRef.current = { value, xChannel, yChannel, disabled };

  // Convert value to the color space required by the requested channels for display/interaction.
  const displayValue = getColorForChannel(value, xChannel);
  const displayValueRef = React.useRef(displayValue);
  displayValueRef.current = displayValue;

  const getColorFromCoords = useStableCallback((clientX: number, clientY: number) => {
    const area = areaRef.current;
    if (!area) {
      return null;
    }
    const rect = area.getBoundingClientRect();
    const xPercent = clamp((clientX - rect.left) / rect.width, 0, 1);
    const yPercent = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
    const { xChannel: xCh, yChannel: yCh } = stateRef.current;
    const color = displayValueRef.current;
    return color
      .withChannelValue(xCh, color.getChannelPercentValue(xCh, xPercent))
      .withChannelValue(yCh, color.getChannelPercentValue(yCh, yPercent));
  });

  const handlePointerMove = useStableCallback((event: PointerEvent) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }
    if (dragCountRef.current >= INTENTIONAL_DRAG_COUNT_THRESHOLD) {
      setDragging(true);
    }
    const newColor = getColorFromCoords(event.clientX, event.clientY);
    if (newColor) {
      setValueFromDrag(newColor, event);
    }
  });

  const handlePointerUp = useStableCallback((event: PointerEvent) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }
    activePointerIdRef.current = null;
    dragCountRef.current = 0;
    setDragging(false);
    const doc = areaRef.current ? ownerDocument(areaRef.current) : document;
    doc.removeEventListener('pointermove', handlePointerMove);
    doc.removeEventListener('pointerup', handlePointerUp);
    const newColor = getColorFromCoords(event.clientX, event.clientY);
    if (newColor) {
      onValueChangeEnd(newColor, event);
    }
  });

  const handlePointerDown = useStableCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current.disabled) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    dragCountRef.current = 0;
    areaRef.current?.setPointerCapture(event.pointerId);
    const newColor = getColorFromCoords(event.clientX, event.clientY);
    if (newColor) {
      setValueFromDrag(newColor, event.nativeEvent);
    }
    const doc = ownerDocument(areaRef.current!);
    doc.addEventListener('pointermove', handlePointerMove);
    doc.addEventListener('pointerup', handlePointerUp);
  });

  const currentColorSpace = displayValue.getColorSpace();
  const hue = currentColorSpace === 'rgb' ? 0 : displayValue.getChannelValue('hue');
  const xVal = displayValue.getChannelValue(xChannel);
  const yVal = displayValue.getChannelValue(yChannel);
  const xRange = displayValue.getChannelRange(xChannel);
  const yRange = displayValue.getChannelRange(yChannel);
  const xPercent = ((xVal - xRange.minValue) / (xRange.maxValue - xRange.minValue)) * 100;
  const yPercent = 100 - ((yVal - yRange.minValue) / (yRange.maxValue - yRange.minValue)) * 100;

  const background = getColorAreaBackground(displayValue, xChannel, yChannel);

  const state: ColorPickerAreaState = { dragging, disabled };

  const element = useRenderElement('div', componentProps, {
    ref: (node: HTMLDivElement | null) => {
      areaRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    state,
    props: [
      elementProps,
      {
        role: 'group' as const,
        onPointerDown: handlePointerDown,
        style: {
          background,
          touchAction: 'none',
          ...style,
          '--hue': String(Math.round(hue)),
          '--color-area-thumb-x': `${xPercent}%`,
          '--color-area-thumb-y': `${yPercent}%`,
        } as React.CSSProperties & Record<string, unknown>,
      },
    ],
  });

  const contextValue = React.useMemo(
    () => ({ xChannel, yChannel, displayValue }),
    [xChannel, yChannel, displayValue],
  );

  return (
    <ColorPickerAreaContext.Provider value={contextValue}>
      {element}
    </ColorPickerAreaContext.Provider>
  );
});

export namespace ColorPickerArea {
  export interface Props extends BaseUIComponentProps<'div', ColorPickerAreaState> {
    /** The x-axis color channel. @default 'saturation' */
    xChannel?: ColorChannel | undefined;
    /** The y-axis color channel. @default 'brightness' */
    yChannel?: ColorChannel | undefined;
    /** The color space for the area. @default 'hsb' */
    colorSpace?: ColorSpace | undefined;
  }
}
