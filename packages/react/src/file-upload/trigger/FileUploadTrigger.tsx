'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps, NativeButtonProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../utils/composeEventHandlers';
import { useFileUploadContext } from '../root/FileUploadContext';
import { fileUploadTriggerStateAttributesMapping } from './stateAttributesMapping';

export interface FileUploadTriggerState {
  /**
   * Whether the trigger is disabled.
   */
  disabled: boolean;
}

export interface FileUploadTriggerProps
  extends NativeButtonProps, BaseUIComponentProps<'button', FileUploadTriggerState> {}

/**
 * Button component for triggering the file selection dialog.
 *
 * The Trigger component renders a button that opens the file selection dialog
 * when clicked. It's typically used as an alternative to the Dropzone for users
 * who prefer clicking a button instead of drag-and-drop.
 *
 * @component
 * @example
 * ```tsx
 * <FileUpload.Trigger>
 *   Upload Files
 * </FileUpload.Trigger>
 * ```
 *
 * @param className - CSS class name or function that receives `{ disabled }`
 * @param children - Button content
 * @param disabled - Whether the trigger is disabled
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadTrigger = React.forwardRef<HTMLButtonElement, FileUploadTriggerProps>(
  function FileUploadTriggerComponent(componentProps, ref) {
    const { className, render, nativeButton, onClick: userOnClick, ...elementProps } = componentProps;
    const { openFileDialog, disabled } = useFileUploadContext();

    const state: FileUploadTriggerState = React.useMemo(
      () => ({
        disabled,
      }),
      [disabled],
    );

    const resolvedClassName = resolveClassName(className, state);

    const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      openFileDialog();
    });

    return useRenderElement('button', componentProps, {
      state,
      ref,
      props: [
        {
          type: 'button',
          className: resolvedClassName,
          disabled,
          onClick: composeEventHandlers(userOnClick, handleClick),
        },
        elementProps,
      ],
      stateAttributesMapping: fileUploadTriggerStateAttributesMapping,
    });
  },
);

export namespace FileUploadTrigger {
  export type State = FileUploadTriggerState;
  export type Props = FileUploadTriggerProps;
}
