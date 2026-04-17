'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
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
 * Button that opens the file selection dialog.
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
  const { render, className, style, nativeButton = true, ...elementProps } = componentProps;
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
