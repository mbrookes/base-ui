'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import { useFileUploadContext } from '../root/FileUploadContext';

export namespace FileUploadDropzone {
  export interface State {
    /**
     * Whether files are being dragged over the dropzone.
     */
    dragging: boolean;
    /**
     * Whether the dropzone is disabled.
     */
    disabled: boolean;
  }

  export interface Props extends Omit<BaseUIComponentProps<'div', State>, 'children'> {
    children?: React.ReactNode | ((state: { isDragging: boolean }) => React.ReactNode);
  }
}

export type FileUploadDropzoneProps = FileUploadDropzone.Props;

/**
 * Interactive dropzone area for dragging and dropping files or clicking to select.
 *
 * Documentation: [Base UI File Upload](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzoneComponent(props, ref) {
    const { children, onClick, onKeyDown, className, ...other } = props;
    const { isDragging, disabled, openFileDialog } = useFileUploadContext();

    const state: FileUploadDropzone.State = React.useMemo(
      () => ({
        dragging: isDragging,
        disabled,
      }),
      [isDragging, disabled],
    );

    const resolvedClassName = resolveClassName(className, state);

    const handleClick = useStableCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      // Prevent opening dialog if clicking an interactive element inside
      const target = event.target as HTMLElement;
      const currentTarget = event.currentTarget as HTMLElement;
      const interactiveElement = target.closest(
        'button, a, input, textarea, select, [role="button"]',
      );
      // Only prevent if we clicked an interactive element that's not the dropzone itself
      if (interactiveElement && interactiveElement !== currentTarget) {
        return;
      }
      event.preventDefault();
      openFileDialog();
    });

    const handleKeyDown = useStableCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openFileDialog();
      }
    });

    return (
      <div
        ref={ref}
        data-dragging={state.dragging ? '' : undefined}
        data-disabled={state.disabled ? '' : undefined}
        aria-disabled={state.disabled || undefined}
        aria-label={other['aria-label'] || 'Drop files here or click to select'}
        role="button"
        tabIndex={state.disabled ? -1 : 0}
        className={resolvedClassName}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        {...other}
      >
        {typeof children === 'function' ? children({ isDragging }) : children}
      </div>
    );
  },
);
