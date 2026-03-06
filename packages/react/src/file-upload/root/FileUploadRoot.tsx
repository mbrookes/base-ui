'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { visuallyHidden } from '@base-ui/utils/visuallyHidden';
import { useRenderElement } from '../../utils/useRenderElement';
import type { BaseUIComponentProps, HTMLProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { composeEventHandlers } from '../../utils/composeEventHandlers';
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails';
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import { FileUploadContext } from './FileUploadContext';
import { FileUploadRootDataAttributes } from './FileUploadRootDataAttributes';
import { useFileUploadRoot } from './useFileUploadRoot';

export const FILE_UPLOAD_ROOT_REJECT_REASONS = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TOO_SMALL: 'FILE_TOO_SMALL',
  MIME_TYPE_NOT_ALLOWED: 'MIME_TYPE_NOT_ALLOWED',
  CUSTOM_VALIDATION_FAILED: 'CUSTOM_VALIDATION_FAILED',
} as const;

export type FileUploadRootRejectReason =
  (typeof FILE_UPLOAD_ROOT_REJECT_REASONS)[keyof typeof FILE_UPLOAD_ROOT_REJECT_REASONS];

export type FileUploadRootRejectEventDetails = BaseUIChangeEventDetails<
  FileUploadRootRejectReason,
  { message: string }
>;

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

const fileUploadRootStateAttributesMapping: StateAttributesMapping<FileUploadRootState> = {
  dragging(value): Record<string, string> | null {
    if (!value) {
      return null;
    }

    return {
      [FileUploadRootDataAttributes.dragging]: '',
    };
  },
  disabled(value): Record<string, string> | null {
    if (!value) {
      return null;
    }

    return {
      [FileUploadRootDataAttributes.disabled]: '',
    };
  },
};

export interface FileUploadRootParameters {
  /**
   * Maximum number of files allowed.
   * @default Infinity
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
    * Note: Validation is synchronous. Async validators are not supported.
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
    * Receives a machine-readable reason code and detailed event metadata.
   */
  onFileReject?: (
    (
      file: File,
      reason: FileUploadRootRejectReason,
      eventDetails: FileUploadRootRejectEventDetails,
    ) => void
  ) | undefined;
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
   * Callback when a file upload is paused.
   */
  onFilePause?: ((file: FileUploadRootExtendedFile) => void) | undefined;
  /**
   * Callback when a paused file upload is resumed.
   */
  onFileResume?: ((file: FileUploadRootExtendedFile) => void) | undefined;
  /**
   * The locale used by `Intl.NumberFormat` when formatting values in default messages.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument | undefined;
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
  /**
   * Whether the file upload is currently paused.
   */
  isPaused?: boolean | undefined;
  /**
   * Number of bytes already uploaded (for resumable uploads).
   */
  uploadedBytes?: number | undefined;
}

export interface FileUploadRootFileUpdates {
  status?: FileUploadRootFileStatus | undefined;
  progress?: number | undefined;
  error?: string | undefined;
  isPaused?: boolean | undefined;
  uploadedBytes?: number | undefined;
}

export type FileUploadRootFileStatus = 'idle' | 'uploading' | 'success' | 'error' | 'paused';

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
 * @param maxFiles - Maximum number of files allowed (default: Infinity)
 * @param maxSize - Maximum file size in bytes (default: Infinity)
 * @param minSize - Minimum file size in bytes (default: 0)
 * @param accept - Accepted file types (e.g., "image/*", ".pdf")
 * @param validator - Custom validation function returning error message or null
 * @param multiple - Allow multiple file selection (default: true)
 * @param directory - Allow selecting directories (default: false)
 * @param disabled - Disable file upload (default: false)
 * @param onFilesChange - Callback when files are added/removed
 * @param onFileReject - Callback when a file is rejected (`reason` + `eventDetails`)
 * @param onCancel - Callback when the file dialog is canceled
 * @param onDuplicateFile - Callback when a duplicate file is selected
 * @param onRetry - Callback when a file retry is initiated
 * @param onFilePause - Callback when a file upload is paused
 * @param onFileResume - Callback when a paused file upload is resumed
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
      onFilePause,
      onFileResume,
      locale,
      onPaste,
      onDragEnter,
      onDragLeave,
      onDrop,
      onDragOver,
      style,
      className,
      render: _render,
      nativeButton: _nativeButton,
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
      onFilePause,
      onFileResume,
      locale,
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
        addFiles(Array.from(event.dataTransfer.files), event.nativeEvent);
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
      addFiles(pastedFiles, event.nativeEvent);
    });

    const defaultProps: HTMLProps = {
      className: resolvedClassName,
      onDragEnter: composeEventHandlers(onDragEnter, handleDragEnter),
      onDragLeave: composeEventHandlers(onDragLeave, handleDragLeave),
      onDrop: composeEventHandlers(onDrop, handleDrop),
      onDragOver: composeEventHandlers(onDragOver, handleDragOver),
      onPaste: composeEventHandlers(onPaste, handlePaste),
      style: { position: 'relative', ...style },
      children: (
        <React.Fragment>
          <div style={visuallyHidden} role="status" aria-live="polite">
            {announcement}
          </div>
          {children}
        </React.Fragment>
      ),
    };

    const element = useRenderElement('div', props, {
      state,
      ref,
      props: [defaultProps, other],
      stateAttributesMapping: fileUploadRootStateAttributesMapping,
    });

    return <FileUploadContext.Provider value={contextValue}>{element}</FileUploadContext.Provider>;
  },
);

export namespace FileUploadRoot {
  export type State = FileUploadRootState;
  export type Props = FileUploadRootProps;
  export type Parameters = FileUploadRootParameters;
  export type ExtendedFile = FileUploadRootExtendedFile;
  export type FileUpdates = FileUploadRootFileUpdates;
  export type FileStatus = FileUploadRootFileStatus;
  export type RejectReason = FileUploadRootRejectReason;
  export type RejectEventDetails = FileUploadRootRejectEventDetails;
}
