'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { visuallyHidden, visuallyHiddenInput } from '@base-ui/utils/visuallyHidden';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useFileUploadContext } from '../root/FileUploadContext';

export interface FileUploadHiddenInputState {
  /**
   * Whether the input is disabled.
   */
  disabled: boolean;
}

export interface FileUploadHiddenInputProps extends BaseUIComponentProps<
  'input',
  FileUploadHiddenInputState
> {
  /**
   * Optional custom id for the hidden input element.
   * If not provided, a unique id is auto-generated.
   *
   * Use this to associate a visible label with the input for accessibility:
   *
   * @example
   * ```tsx
   * <FileUpload.Root>
   *   <label htmlFor="file-input">Select files:</label>
   *   <FileUpload.HiddenInput id="file-input" />
   *   <FileUpload.Trigger>Browse</FileUpload.Trigger>
   *   <Dropzone>Drop files here</Dropzone>
   * </FileUpload.Root>
   * ```
   */
  id?: string | undefined;
}

/**
 * Hidden file input that powers file selection for File Upload.
 *
 * Place this part inside `FileUpload.Root` to enable file selection.
 *
 * @example
 * Accessible file upload with label:
 * ```tsx
 * <FileUpload.Root onFilesChange={handleFilesChange}>
 *   <label htmlFor="my-file-input">Upload files</label>
 *   <FileUpload.HiddenInput id="my-file-input" />
 *   <FileUpload.Trigger>Select</FileUpload.Trigger>
 *   <Dropzone>Drop here</Dropzone>
 * </FileUpload.Root>
 * ```
 */
export const FileUploadHiddenInput = React.forwardRef(function FileUploadHiddenInput(
  componentProps: FileUploadHiddenInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const { render, className, style, id: idProp, ...elementProps } = componentProps;
  const { inputId, accept, multiple, directory, disabled, setInputElement, onInputChange } =
    useFileUploadContext();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputRef = useStableCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    setInputElement(node);
  });

  useIsoLayoutEffect(() => {
    inputRef.current?.toggleAttribute('webkitdirectory', directory);
    inputRef.current?.toggleAttribute('directory', directory);
  }, [directory]);

  return useRenderElement('input', componentProps, {
    state: { disabled },
    ref: [forwardedRef, handleInputRef],
    props: [
      {
        id: idProp ?? inputId,
        type: 'file',
        accept,
        multiple: directory || multiple,
        disabled,
        suppressHydrationWarning: true,
          style: elementProps.name ? visuallyHiddenInput : visuallyHidden,
        onChange: onInputChange,
      },
      elementProps,
    ],
  });
});

export namespace FileUploadHiddenInput {
  export type State = FileUploadHiddenInputState;
  export type Props = FileUploadHiddenInputProps;
}
