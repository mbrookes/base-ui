'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { visuallyHidden } from '@base-ui/utils/visuallyHidden';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import { FileUploadContext } from './FileUploadContext';
import { useFileUploadRoot } from './useFileUploadRoot';

export interface FileUploadRootState {
  /**
   * Whether files are currently being dragged over the dropzone.
   */
  dragging: boolean;
  /**
   * Whether the file upload is disabled.
   */
  disabled: boolean;
}

export interface FileUploadRootParameters {
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
   * Allow selecting directories (webkitdirectory).
   * @default false
   */
  directory?: boolean | undefined;
  /**
   * Disable file upload.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Callback when files are added.
   */
  onFilesChange?: ((files: FileUploadRootExtendedFile[]) => void) | undefined;
  /**
   * Callback when a file is rejected.
   */
  onFileReject?: ((file: File, reason: string) => void) | undefined;
  /**
   * Callback when the file dialog is canceled.
   */
  onCancel?: (() => void) | undefined;
  /**
   * Callback when a duplicate file is selected.
   */
  onDuplicateFile?: ((file: File) => void) | undefined;
}

export interface FileUploadRootExtendedFile extends File {
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
  status: FileUploadRootFileStatus;
  /**
   * Upload progress (0-100).
   */
  progress: number;
  /**
   * Error message if the file failed to upload.
   */
  error?: string | undefined;
}

export type FileUploadRootFileStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileUploadRootProps
  extends BaseUIComponentProps<'div', FileUploadRootState>,
    FileUploadRootParameters {
  children: React.ReactNode;
}

/**
 * Manages file upload state and provides context for child components.
 *
 * This is the root component that should wrap all other FileUpload components.
 * It handles file validation, drag-and-drop, and state management for the entire
 * file upload workflow.
 *
 * @component
 * @example
 * ```tsx
 * <FileUpload.Root accept="image/*" maxSize={5242880} onFilesChange={handleFilesChange}>
 *   <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
 *   <FileUpload.Input />
 *   <FileUpload.PreviewList>
 *     {files.map(file => <FileUpload.PreviewItem key={file.id} file={file} />)}
 *   </FileUpload.PreviewList>
 * </FileUpload.Root>
 * ```
 *
 * @param maxFiles - Maximum number of files allowed (default: 10)
 * @param maxSize - Maximum file size in bytes (default: Infinity)
 * @param minSize - Minimum file size in bytes (default: 0)
 * @param accept - Accepted file types (e.g., "image/*", ".pdf")
 * @param multiple - Allow multiple file selection (default: true)
 * @param directory - Allow selecting directories (default: false)
 * @param disabled - Disable file upload (default: false)
 * @param onFilesChange - Callback when files are added/removed
 * @param onFileReject - Callback when a file is rejected
 * @param onCancel - Callback when the file dialog is canceled
 * @param onDuplicateFile - Callback when a duplicate file is selected
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
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
      directory,
      disabled,
      onFilesChange,
      onFileReject,
      onCancel,
      onDuplicateFile,
      onPaste,
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
      directory,
      disabled,
      onFilesChange,
      onFileReject,
      onCancel,
      onDuplicateFile,
    });

    const state: FileUploadRootState = React.useMemo(
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

    const handlePaste = useStableCallback((event: React.ClipboardEvent) => {
      if (contextValue.disabled) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA)$/.test(target.tagName))) {
        return;
      }

      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return;
      }

      const pastedFiles = Array.from(clipboardData.files || []);
      if (pastedFiles.length === 0 && clipboardData.items) {
        Array.from(clipboardData.items).forEach((item) => {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              pastedFiles.push(file);
            }
          }
        });
      }

      if (pastedFiles.length === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      addFiles(pastedFiles);
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
          onPaste={composeEventHandlers(onPaste, handlePaste)}
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

export namespace FileUploadRoot {
  export type State = FileUploadRootState;
  export type Props = FileUploadRootProps;
  export type Parameters = FileUploadRootParameters;
  export type ExtendedFile = FileUploadRootExtendedFile;
  export type FileStatus = FileUploadRootFileStatus;
}
