'use client';
import * as React from 'react';
import { FloatingFocusManager } from '../../floating-ui-react';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import { useColorPickerPositionerContext } from '../positioner/ColorPickerPositionerContext';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Align, Side } from '../../utils/useAnchorPositioning';
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { TransitionStatus } from '../../internals/useTransitionStatus';
import { popupStateMapping as baseMapping } from '../../utils/popupStateMapping';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete';
import { useRenderElement } from '../../internals/useRenderElement';
import { getDisabledMountTransitionStyles } from '../../utils/getDisabledMountTransitionStyles';

const stateAttributesMapping: StateAttributesMapping<ColorPickerPopupState> = {
  ...baseMapping,
  ...transitionStatusMapping,
};

/**
 * A container for the color picker popup contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerPopup = React.forwardRef(function ColorPickerPopup(
  componentProps: ColorPickerPopup.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, initialFocus, finalFocus, ...elementProps } = componentProps;

  const { open, mounted, transitionStatus, floatingRootContext, getFloatingProps, popupRef } =
    useColorPickerRootContext();
  const { side, align, context } = useColorPickerPositionerContext();

  const setPopupElement = React.useCallback(
    (element: HTMLElement | null) => {
      (popupRef as React.MutableRefObject<HTMLElement | null>).current = element;
    },
    [popupRef],
  );

  useOpenChangeComplete({
    open,
    ref: popupRef,
    onComplete() {},
  });

  const state: ColorPickerPopupState = {
    open,
    side,
    align,
    transitionStatus,
  };

  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, setPopupElement],
    props: [
      getFloatingProps(),
      getDisabledMountTransitionStyles(transitionStatus),
      {
        role: 'dialog' as const,
        'aria-modal': true,
        style: style as React.CSSProperties,
      },
      elementProps,
    ],
    stateAttributesMapping,
  });

  if (!mounted) {
    return null;
  }

  return (
    <FloatingFocusManager
      context={context ?? floatingRootContext!}
      disabled={!mounted}
      modal
      initialFocus={initialFocus}
      returnFocus={finalFocus}
    >
      {element}
    </FloatingFocusManager>
  );
});

export interface ColorPickerPopupState {
  /**
   * Whether the color picker popup is currently open.
   */
  open: boolean;
  /**
   * The side of the anchor the popup is placed on.
   */
  side: Side;
  /**
   * The alignment of the popup relative to the anchor.
   */
  align: Align;
  /**
   * The transition status of the popup.
   */
  transitionStatus: TransitionStatus;
}

export interface ColorPickerPopupProps extends BaseUIComponentProps<'div', ColorPickerPopupState> {
  /**
   * Determines the element to focus when the popup is opened.
   *
   * - `false`: Do not move focus.
   * - `true`: Move focus based on the default behavior (first tabbable element or popup).
   * - `RefObject`: Move focus to the ref element.
   * @default true
   */
  initialFocus?: React.RefObject<HTMLElement | null> | boolean | undefined;
  /**
   * Determines the element to focus when the popup is closed.
   * @default true
   */
  finalFocus?: React.RefObject<HTMLElement | null> | boolean | undefined;
}

export namespace ColorPickerPopup {
  export type State = ColorPickerPopupState;
  export type Props = ColorPickerPopupProps;
}
