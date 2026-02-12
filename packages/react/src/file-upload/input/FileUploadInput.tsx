'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import { useFileUploadContext } from '../root/FileUploadContext';

export namespace FileUploadInput {
  export interface State {
    /**
     * Whether the input is disabled.
     */
    disabled: boolean;
  }

  export interface Props extends Omit<BaseUIComponentProps<'input', State>, 'type'> {}
}

export type FileUploadInputProps = FileUploadInput.Props;

/**
 * Hidden file input element for triggering file selection.
 *
 * Documentation: [Base UI File Upload](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadInput = React.forwardRef<HTMLInputElement, FileUploadInputProps>(
  function FileUploadInputComponent(props, ref) {
    const { className, ...other } = props;
    const { accept, multiple, disabled, registerInput, inputId, addFiles } = useFileUploadContext();

    const state: FileUploadInput.State = React.useMemo(
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

    const handleChange = useStableCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        addFiles(Array.from(event.target.files));
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
        multiple={multiple}
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
