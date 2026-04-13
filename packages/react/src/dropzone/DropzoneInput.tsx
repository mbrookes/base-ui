'use client';

import * as React from 'react';
import { useRenderElement } from '../utils/useRenderElement';
import type { BaseUIComponentProps } from '../utils/types';
import { useDropzoneContext } from './DropzoneContext';

export interface DropzoneHiddenInputState {
  /**
   * Whether the parent dropzone is disabled.
   */
  disabled: boolean;
}

export interface DropzoneHiddenInputProps extends Omit<
  BaseUIComponentProps<'input', DropzoneHiddenInputState>,
  'type'
> {}

/**
 * Hidden file input that powers file selection for Dropzone.
 *
 * Place this part inside `Dropzone` to enable built-in file picker behavior.
 */
export const DropzoneHiddenInput = React.forwardRef(function DropzoneHiddenInput(
  componentProps: DropzoneHiddenInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const { disabled, setInputElement } = useDropzoneContext();
  const { render, className, style, ...elementProps } = componentProps;

  return useRenderElement('input', componentProps, {
    state: { disabled },
    ref: [forwardedRef, setInputElement],
    props: [
      elementProps,
      {
        type: 'file',
        disabled,
        style: { display: 'none' },
      },
    ],
  });
});

export namespace DropzoneHiddenInput {
  export type State = DropzoneHiddenInputState;
  export type Props = DropzoneHiddenInputProps;
}
