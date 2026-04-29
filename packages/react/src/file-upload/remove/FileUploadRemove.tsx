'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
import { useFileUploadContext } from '../root/FileUploadContext';
import { fileUploadRemoveStateAttributesMapping } from './stateAttributesMapping';

export interface FileUploadRemoveState {
  /**
   * Whether the remove button is disabled.
   */
  disabled: boolean;
}

export interface FileUploadRemoveProps
  extends NativeButtonProps,
    BaseUIComponentProps<'button', FileUploadRemoveState> {
  /**
   * The id of the file to remove.
   */
  fileId: string;
}

/**
 * Button that removes a specific file from the upload list.
 *
 * @component
 * @example
 * ```tsx
 * const { files } = FileUpload.useFileUploadContext();
 *
 * {files.map((file) => (
 *   <li key={file.id}>
 *     {file.name}
 *     <FileUpload.Remove fileId={file.id} aria-label={`Remove ${file.name}`} />
 *   </li>
 * ))}
 * ```
 *
 * @param fileId - The id of the file to remove
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadRemove = React.forwardRef(function FileUploadRemove(
  componentProps: FileUploadRemoveProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const { render, className, style, nativeButton = true, fileId, ...elementProps } = componentProps;
  const { removeFile, disabled } = useFileUploadContext();

  const { getButtonProps, buttonRef } = useButton({
    disabled,
    native: nativeButton,
  });

  const handleClick = useStableCallback(() => {
    removeFile(fileId);
  });

  return useRenderElement('button', componentProps, {
    state: { disabled },
    ref: [ref, buttonRef],
    props: [{ onClick: handleClick, type: 'button' }, elementProps, getButtonProps],
    stateAttributesMapping: fileUploadRemoveStateAttributesMapping,
  });
});

export namespace FileUploadRemove {
  export type State = FileUploadRemoveState;
  export type Props = FileUploadRemoveProps;
}
