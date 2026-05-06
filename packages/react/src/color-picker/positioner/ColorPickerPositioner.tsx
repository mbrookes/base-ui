'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { FloatingNode, useFloatingNodeId } from '../../floating-ui-react';
import { useColorPickerRootContext } from '../root/ColorPickerRootContext';
import { ColorPickerPositionerContext } from './ColorPickerPositionerContext';
import {
  useAnchorPositioning,
  type Side,
  type Align,
  type UseAnchorPositioningSharedParameters,
} from '../../utils/useAnchorPositioning';
import type { BaseUIComponentProps } from '../../internals/types';
import { POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';
import { usePositioner } from '../../utils/usePositioner';

/**
 * Positions the color picker popup against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI ColorPicker](https://base-ui.com/react/components/color-picker)
 */
export const ColorPickerPositioner = React.forwardRef(function ColorPickerPositioner(
  componentProps: ColorPickerPositioner.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    render,
    className,
    anchor,
    positionMethod = 'absolute',
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    collisionAvoidance = POPUP_COLLISION_AVOIDANCE,
    style,
    ...elementProps
  } = componentProps;

  const { open, mounted, transitionStatus, floatingRootContext, setPositionerElement } =
    useColorPickerRootContext();

  const nodeId = useFloatingNodeId();

  const positioning = useAnchorPositioning({
    anchor,
    positionMethod,
    floatingRootContext,
    mounted,
    side,
    sideOffset,
    align,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    keepMounted: false,
    collisionAvoidance,
  });

  const setPositionerRef = useStableCallback((element: HTMLDivElement | null) => {
    setPositionerElement(element);
  });

  const state: ColorPickerPositioner.State = {
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
  };

  const element = usePositioner(componentProps, state, {
    styles: positioning.positionerStyles,
    transitionStatus,
    props: elementProps,
    refs: [forwardedRef, setPositionerRef],
    hidden: !mounted,
    inert: !open,
  });

  return (
    <ColorPickerPositionerContext.Provider value={positioning}>
      <FloatingNode id={nodeId}>{element}</FloatingNode>
    </ColorPickerPositionerContext.Provider>
  );
});

export namespace ColorPickerPositioner {
  export interface State {
    /**
     * Whether the color picker popup is currently open.
     */
    open: boolean;
    /**
     * Which side of the anchor the positioner is placed on.
     */
    side: Side;
    /**
     * How the positioner is aligned relative to its anchor.
     */
    align: Align;
    /**
     * Whether the anchor element is hidden.
     */
    anchorHidden: boolean;
  }

  export interface Props
    extends UseAnchorPositioningSharedParameters, BaseUIComponentProps<'div', State> {
    /**
     * Which side of the anchor element to align the popup against.
     * @default 'bottom'
     */
    side?: Side | undefined;
    /**
     * How to align the popup relative to the specified side.
     * @default 'center'
     */
    align?: Align | undefined;
    /**
     * Distance between the anchor and the popup in pixels.
     * @default 0
     */
    sideOffset?: number | undefined;
    /**
     * Additional offset along the alignment axis in pixels.
     * @default 0
     */
    alignOffset?: number | undefined;
  }
}
