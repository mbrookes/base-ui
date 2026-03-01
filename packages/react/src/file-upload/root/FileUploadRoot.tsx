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
   * Supports MIME types and file extensions.
   * @default ''
   */
  accept?: string | undefined;
  /**
   * Custom validation function for additional file validation beyond built-in checks.
   * Return an error message string if validation fails, or null if valid.
   *
   * @example
   * ```tsx
   * <FileUpload.Root
   *   validator={(file) => {
   *     if (file.name.includes('confidential')) {
   *       return 'Confidential files not allowed';
   *     }
   *     return null;
   *   }}
   * />
   * ```
   */
  validator?: ((file: File) => string | null) | undefined;
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
  /**
   * Callback when a file retry is initiated.
   */
  onRetry?: ((file: FileUploadRootExtendedFile) => void) | undefined;
  /**
   * Localized messages for error messages and announcements.
   * Provide custom messages to support different languages or customize default messaging.
   *
   * @example
   * ```tsx
   * <FileUpload.Root
   *   messages={{
   *     fileTooLarge: (file, max) => `${file.name} は大きすぎます（最大 ${max}）`,
   *     fileTooSmall: (file, min) => `${file.name} は小さすぎます（最小 ${min}）`,
   *     fileTypeNotAccepted: (file) => `${file.name} はサポートされていないファイル形式です`,
   *     maxFilesReached: (max) => `ファイルの上限 ${max} に達しました`,
   *     duplicateFile: (file) => `${file.name} は既に追加されています`,
   *     filesAdded: (count) => `${count} 個のファイルを追加しました`,
   *     fileRemoved: (file) => `${file.name} を削除しました`,
   *     allFilesRemoved: () => 'すべてのファイルを削除しました',
   *     retryingUpload: (file) => `${file.name} の再試行中`,
   *     uploadCanceled: (file) => `${file.name} のアップロードをキャンセルしました`,
   *   }}
   * />
   * ```
   */
  messages?: FileUploadRootMessages | undefined;
}

export interface FileUploadRootMessages {
  /**
   * Message when file exceeds maximum size.
   * @param file - The rejected file
   * @param maxSize - Maximum size in formatted string (e.g., '5 MB')
   */
  fileTooLarge?: ((file: File, maxSize: string) => string) | undefined;
  /**
   * Message when file is below minimum size.
   * @param file - The rejected file
   * @param minSize - Minimum size in formatted string (e.g., '1 KB')
   */
  fileTooSmall?: ((file: File, minSize: string) => string) | undefined;
  /**
   * Message when file type is not accepted.
   * @param file - The rejected file
   */
  fileTypeNotAccepted?: ((file: File) => string) | undefined;
  /**
   * Message when maximum file count is reached.
   * @param maxFiles - Maximum number of files allowed
   */
  maxFilesReached?: ((maxFiles: number) => string) | undefined;
  /**
   * Message when a duplicate file is detected.
   * @param file - The duplicate file
   */
  duplicateFile?: ((file: File) => string) | undefined;
  /**
   * Message when files are successfully added.
   * @param count - Number of files added
   */
  filesAdded?: ((count: number) => string) | undefined;
  /**
   * Message when files are rejected.
   * @param count - Number of files rejected
   * @param errors - Array of error messages
   */
  filesRejected?: ((count: number, errors: string[]) => string) | undefined;
  /**
   * Message when a file is removed.
   * @param file - The removed file
   */
  fileRemoved?: ((file: FileUploadRootExtendedFile) => string) | undefined;
  /**
   * Message when all files are removed.
   */
  allFilesRemoved?: (() => string) | undefined;
  /**
   * Message when retrying a failed upload.
   * @param file - The file being retried
   */
  retryingUpload?: ((file: FileUploadRootExtendedFile) => string) | undefined;
  /**
   * Message when an upload is canceled.
   * @param file - The file whose upload was canceled
   */
  uploadCanceled?: ((file: FileUploadRootExtendedFile) => string) | undefined;
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
  extends BaseUIComponentProps<'div', FileUploadRootState>, FileUploadRootParameters {
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
 * @param validator - Custom validation function returning error message or null
 * @param multiple - Allow multiple file selection (default: true)
 * @param directory - Allow selecting directories (default: false)
 * @param disabled - Disable file upload (default: false)
 * @param onFilesChange - Callback when files are added/removed
 * @param onFileReject - Callback when a file is rejected
 * @param onCancel - Callback when the file dialog is canceled
 * @param onDuplicateFile - Callback when a duplicate file is selected
 * @param onRetry - Callback when a file retry is initiated
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
  function FileUploadRoot(props, ref) {
    const {
      children,
      maxFiles,
      maxSize,
      minSize,
      accept,
      validator,
      multiple,
      directory,
      disabled,
      onFilesChange,
      onFileReject,
      onCancel,
      onDuplicateFile,
      onRetry,
      messages,
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
      validator,
      multiple,
      directory,
      disabled,
      onFilesChange,
      onFileReject,
      onCancel,
      onDuplicateFile,
      onRetry,
      messages,
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
