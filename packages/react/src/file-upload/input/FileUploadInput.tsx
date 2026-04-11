'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useRenderElement } from '../../utils/useRenderElement';
import type { BaseUIComponentProps } from '../../utils/types';
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
> {}

/**
 * Hidden file input that powers file selection for File Upload.
 *
 * Place this part inside `FileUpload.Root` to enable file selection.
 */
export const FileUploadHiddenInput = React.forwardRef(function FileUploadHiddenInput(
  componentProps: FileUploadHiddenInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const { render, className, ...elementProps } = componentProps;
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
        id: inputId,
        type: 'file',
        accept,
        multiple: directory || multiple,
        disabled,
        style: { display: 'none' },
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
