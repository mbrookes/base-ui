'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { visuallyHidden } from '@base-ui/utils/visuallyHidden';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import { FileUploadContext } from './FileUploadContext';
import { useFileUploadRoot } from './useFileUploadRoot';

export namespace FileUploadRoot {
  export interface State {
    /**
     * Whether files are currently being dragged over the dropzone.
     */
    dragging: boolean;
    /**
     * Whether the file upload is disabled.
     */
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State>, FileUploadRoot.Parameters {
    children: React.ReactNode;
  }

  export interface Parameters {
    /**
     * Maximum number of files allowed.
     * @default 10
     */
    maxFiles?: number | undefined;
    /**
     * Maximum file size in bytes.
     * @default Infinity
     */
    maxSize?: number | undefined;
    /**
     * Minimum file size in bytes.
     * @default 0
     */
    minSize?: number | undefined;
    /**
     * Accepted file types (e.g., "image/*", ".pdf", "image/png,image/jpeg").
     * @default ''
     */
    accept?: string | undefined;
    /**
     * Allow multiple file selection.
     * @default true
     */
    multiple?: boolean | undefined;
    /**
     * Disable file upload.
     * @default false
     */
    disabled?: boolean | undefined;
    /**
     * Callback when files are added.
     */
    onFilesChange?: ((files: FileUploadRoot.ExtendedFile[]) => void) | undefined;
    /**
     * Callback when a file is rejected.
     */
    onFileReject?: ((file: File, reason: string) => void) | undefined;
  }

  export interface ExtendedFile extends File {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * URL for previewing the file.
     */
    preview: string;
    /**
     * Current status of the file.
     */
    status: FileStatus;
    /**
     * Upload progress (0-100).
     */
    progress: number;
    /**
     * Error message if the file failed to upload.
     */
    error?: string | undefined;
  }

  export type FileStatus = 'idle' | 'uploading' | 'success' | 'error';
}

export interface FileUploadRootProps extends FileUploadRoot.Props {}

/**
 * Manages the file upload state and provides context for child components.
 * This is the root component that should wrap all other FileUpload components.
 *
 * Documentation: [Base UI File Upload](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  function FileUploadRoot(props, ref) {
    const {
      children,
      maxFiles,
      maxSize,
      minSize,
      accept,
      multiple,
      disabled,
      onFilesChange,
      onFileReject,
      onDragEnter,
      onDragLeave,
      onDrop,
      onDragOver,
      className,
      ...other
    } = props;

    const { contextValue, setIsDragging, addFiles, announcement } = useFileUploadRoot({
      maxFiles,
      maxSize,
      minSize,
      accept,
      multiple,
      disabled,
      onFilesChange,
      onFileReject,
    });

    const state: FileUploadRoot.State = React.useMemo(
      () => ({
        dragging: contextValue.isDragging,
        disabled: contextValue.disabled,
      }),
      [contextValue.isDragging, contextValue.disabled],
    );

    const resolvedClassName = resolveClassName(className, state);

    const handleDragEnter = useStableCallback((event: React.DragEvent) => {
      if (contextValue.disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    });

    const handleDragLeave = useStableCallback((event: React.DragEvent) => {
      if (contextValue.disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget.contains(event.relatedTarget as Node)) {
        return;
      }
      setIsDragging(false);
    });

    const handleDrop = useStableCallback((event: React.DragEvent) => {
      if (contextValue.disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        addFiles(Array.from(event.dataTransfer.files));
      }
    });

    const handleDragOver = useStableCallback((event: React.DragEvent) => {
      if (contextValue.disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      // Set dropEffect to indicate valid drop target
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    });

    return (
      <FileUploadContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-dragging={state.dragging ? '' : undefined}
          data-disabled={state.disabled ? '' : undefined}
          className={resolvedClassName}
          onDragEnter={composeEventHandlers(onDragEnter, handleDragEnter)}
          onDragLeave={composeEventHandlers(onDragLeave, handleDragLeave)}
          onDrop={composeEventHandlers(onDrop, handleDrop)}
          onDragOver={composeEventHandlers(onDragOver, handleDragOver)}
          style={{ position: 'relative', ...other.style }}
          {...other}
        >
          <div style={visuallyHidden} role="status" aria-live="polite">
            {announcement}
          </div>
          {children}
        </div>
      </FileUploadContext.Provider>
    );
  },
);
