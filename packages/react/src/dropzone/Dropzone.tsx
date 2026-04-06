'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../utils/useRenderElement';
import type { BaseUIComponentProps } from '../utils/types';
import { DropzoneContext } from './DropzoneContext';
import { DropzoneHiddenInput } from './DropzoneInput';
import { dropzoneStateAttributesMapping } from './stateAttributesMapping';

export interface DropzoneState {
  /**
   * Whether files are being dragged over the dropzone.
   */
  dragging: boolean;
  /**
   * Whether the dropzone is disabled.
   */
  disabled: boolean;
}

export interface DropzoneProps extends Omit<
  BaseUIComponentProps<'div', DropzoneState>,
  'children'
> {
  /**
   * Whether the dropzone is disabled.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Controlled dragging state.
   */
  dragging?: boolean | undefined;
  /**
   * Called when dragging state changes.
   */
  onDraggingChange?: ((dragging: boolean) => void) | undefined;
  /**
   * Called when the dropzone is activated by click or keyboard.
   */
  onOpen?: (() => void) | undefined;
  /**
   * Called when files are dropped on the dropzone.
   */
  onFilesDrop?: ((files: File[], event: React.DragEvent<HTMLDivElement>) => void) | undefined;
  children?: React.ReactNode | ((state: { isDragging: boolean }) => React.ReactNode) | undefined;
}

/**
 * Interactive drop target and file selection area.
 *
 * Documentation: [Base UI Dropzone](https://base-ui.com/react/components/dropzone)
 */
const DropzoneRoot = React.forwardRef<HTMLDivElement, DropzoneProps>(
  function Dropzone(props, forwardedRef) {
    const {
      className,
      render,
      children,
      disabled = false,
      dragging: draggingProp,
      onDraggingChange,
      onOpen,
      onFilesDrop,
      ...elementProps
    } = props;

    const [draggingUncontrolled, setDraggingUncontrolled] = React.useState(false);
    const inputElementRef = React.useRef<HTMLInputElement | null>(null);
    const dragging = draggingProp ?? draggingUncontrolled;

    const setInputElement = useStableCallback((node: HTMLInputElement | null) => {
      inputElementRef.current = node;
    });

    const setDragging = useStableCallback((nextDragging: boolean) => {
      if (draggingProp == null) {
        setDraggingUncontrolled(nextDragging);
      }
      onDraggingChange?.(nextDragging);
    });

    const handleDragEnter = useStableCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      setDragging(true);
    });

    const handleDragLeave = useStableCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      if (event.currentTarget.contains(event.relatedTarget as Node)) {
        return;
      }
      setDragging(false);
    });

    const handleDragOver = useStableCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    });

    const handleDrop = useStableCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }

      setDragging(false);
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length > 0) {
        onFilesDrop?.(files, event);
      }
    });

    const handleClick = useStableCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      // Do not trigger open when nested interactive controls are used.
      const target = event.target as HTMLElement;
      const currentTarget = event.currentTarget as HTMLElement;
      const interactiveElement = target.closest(
        'button, a, input, textarea, select, [role="button"]',
      );

      if (interactiveElement && interactiveElement !== currentTarget) {
        return;
      }

      event.preventDefault();
      if (inputElementRef.current) {
        inputElementRef.current.click();
        return;
      }

      onOpen?.();
    });

    const handleKeyDown = useStableCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (inputElementRef.current) {
          inputElementRef.current.click();
          return;
        }

        onOpen?.();
      }
    });

    const state: DropzoneState = {
      dragging,
      disabled,
    };

    const contextValue = React.useMemo(
      () => ({
        disabled,
        setInputElement,
      }),
      [disabled, setInputElement],
    );

    return (
      <DropzoneContext.Provider value={contextValue}>
        {useRenderElement('div', props, {
          state,
          ref: forwardedRef,
          props: [
            {
              role: 'button',
              tabIndex: disabled ? -1 : 0,
              'aria-disabled': disabled || undefined,
              onDragEnter: handleDragEnter,
              onDragLeave: handleDragLeave,
              onDragOver: handleDragOver,
              onDrop: handleDrop,
              onClick: handleClick,
              onKeyDown: handleKeyDown,
              children:
                typeof children === 'function' ? children({ isDragging: dragging }) : children,
            },
            elementProps,
          ],
          stateAttributesMapping: dropzoneStateAttributesMapping,
        })}
      </DropzoneContext.Provider>
    );
  },
);

type DropzoneComponent = typeof DropzoneRoot & {
  HiddenInput: typeof DropzoneHiddenInput;
};

export const Dropzone = Object.assign(DropzoneRoot, {
  HiddenInput: DropzoneHiddenInput,
}) as DropzoneComponent;

export namespace Dropzone {
  export type State = DropzoneState;
  export type Props = DropzoneProps;
}
