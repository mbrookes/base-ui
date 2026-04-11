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
  const { inputId, accept, multiple, directory, disabled, setInputElement, onInputChange } =
    useFileUploadContext();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputRef = useStableCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    setInputElement(node);
  });

  useIsoLayoutEffect(() => {
    const node = inputRef.current;
    if (!node) {
      return;
    }

    if (directory) {
      node.setAttribute('webkitdirectory', '');
      node.setAttribute('directory', '');
    } else {
      node.removeAttribute('webkitdirectory');
      node.removeAttribute('directory');
    }
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
      componentProps,
    ],
  });
});

export namespace FileUploadHiddenInput {
  export type State = FileUploadHiddenInputState;
  export type Props = FileUploadHiddenInputProps;
}
