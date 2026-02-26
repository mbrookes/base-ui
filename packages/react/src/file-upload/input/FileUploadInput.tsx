'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import { useFileUploadContext } from '../root/FileUploadContext';

export interface FileUploadInputState {
  /**
   * Whether the input is disabled.
   */
  disabled: boolean;
}

export interface FileUploadInputProps
  extends Omit<BaseUIComponentProps<'input', FileUploadInputState>, 'type'> {}

/**
 * Hidden file input element for file selection.
 *
 * This component renders a hidden HTML file input element that is triggered by
 * other components (like Dropzone or Trigger). It automatically integrates with
 * the Root component's file validation and state management.
 *
 * @component
 * @example
 * ```tsx
 * <FileUpload.Input data-testid="file-input" />
 * ```
 *
 * @param className - CSS class name or function that receives `{ disabled }`
 * @param disabled - Whether the input is disabled
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadInput = React.forwardRef<HTMLInputElement, FileUploadInputProps>(
  function FileUploadInputComponent(props, ref) {
    const { className, ...other } = props;
    const { accept, multiple, directory, disabled, registerInput, inputId, addFiles, onCancel } =
      useFileUploadContext();

    const state: FileUploadInputState = React.useMemo(
      () => ({
        disabled,
      }),
      [disabled],
    );

    const resolvedClassName = resolveClassName(className, state);

    const internalRef = React.useRef<HTMLInputElement | null>(null);

    const handleRef = useStableCallback((node: HTMLInputElement | null) => {
      internalRef.current = node;
      registerInput(node);

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    });

    useIsoLayoutEffect(() => {
      const node = internalRef.current;
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

    const handleChange = useStableCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        addFiles(Array.from(event.target.files));
      } else {
        onCancel?.();
      }
      // Reset value to allow selecting the same file twice if needed
      if (internalRef.current) {
        internalRef.current.value = '';
      }
    });

    return (
      <input
        {...other}
        ref={handleRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={directory || multiple}
        disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        className={resolvedClassName}
        style={{ display: 'none' }}
        onChange={
          composeEventHandlers(
            other.onChange as React.ChangeEventHandler<HTMLInputElement> | undefined,
            handleChange,
          ) as React.ChangeEventHandler<HTMLInputElement>
        }
      />
    );
  },
);

export namespace FileUploadInput {
  export type State = FileUploadInputState;
  export type Props = FileUploadInputProps;
}
