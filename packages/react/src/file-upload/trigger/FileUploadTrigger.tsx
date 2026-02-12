'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import { useFileUploadContext } from '../root/FileUploadContext';

export namespace FileUploadTrigger {
  export interface State {
    /**
     * Whether the trigger is disabled.
     */
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'button', State> {}
}

export type FileUploadTriggerProps = FileUploadTrigger.Props;

/**
 * Button component for triggering the file selection dialog.
 *
 * Documentation: [Base UI File Upload](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadTrigger = React.forwardRef<HTMLButtonElement, FileUploadTriggerProps>(
  function FileUploadTriggerComponent(props, ref) {
    const { className, ...other } = props;
    const { openFileDialog, disabled } = useFileUploadContext();

    const state: FileUploadTrigger.State = React.useMemo(
      () => ({
        disabled,
      }),
      [disabled],
    );

    const resolvedClassName = resolveClassName(className, state);

    const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      openFileDialog();
    });

    return (
      <button
        type="button"
        ref={ref}
        data-disabled={disabled ? '' : undefined}
        className={resolvedClassName}
        disabled={disabled}
        onClick={composeEventHandlers(other.onClick, handleClick)}
        {...other}
      />
    );
  },
);
