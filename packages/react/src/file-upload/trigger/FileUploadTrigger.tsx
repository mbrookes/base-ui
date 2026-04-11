'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps, NativeButtonProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { useButton } from '../../use-button/useButton';
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
export const FileUploadTrigger = React.forwardRef(function FileUploadTriggerComponent(
  componentProps: FileUploadTriggerProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const { nativeButton = true, ...elementProps } = componentProps;
  const { openFileDialog, disabled } = useFileUploadContext();

  const { getButtonProps, buttonRef } = useButton({
    disabled,
    native: nativeButton,
  });

  const handleClick = useStableCallback((event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    openFileDialog();
  });

  return useRenderElement('button', componentProps, {
    state: { disabled },
    ref: [ref, buttonRef],
    props: [{ onClick: handleClick }, elementProps, getButtonProps],
    stateAttributesMapping: fileUploadTriggerStateAttributesMapping,
  });
});

export namespace FileUploadTrigger {
  export type State = FileUploadTriggerState;
  export type Props = FileUploadTriggerProps;
}
