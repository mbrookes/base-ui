'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { visuallyHidden } from '@base-ui/utils/visuallyHidden';
import { useRenderElement } from '../../utils/useRenderElement';
import type { BaseUIComponentProps, HTMLProps } from '../../utils/types';
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails';
import { FileUploadContext } from './FileUploadContext';
import { fileUploadRootStateAttributesMapping } from './stateAttributesMapping';
import { useFileUploadRoot } from './useFileUploadRoot';

export const REJECT_REASONS = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TOO_SMALL: 'FILE_TOO_SMALL',
  MIME_TYPE_NOT_ALLOWED: 'MIME_TYPE_NOT_ALLOWED',
  MAX_FILES_REACHED: 'MAX_FILES_REACHED',
  CUSTOM_VALIDATION_FAILED: 'CUSTOM_VALIDATION_FAILED',
  DUPLICATE_FILE: 'DUPLICATE_FILE',
} as const;

export type FileUploadRootRejectReason =
  (typeof REJECT_REASONS)[keyof typeof REJECT_REASONS];

export const CHANGE_REASONS = {
  FILE_ADDED: 'file-added',
  FILE_REMOVED: 'file-removed',
  FILES_CLEARED: 'files-cleared',
  FILE_UPDATED: 'file-updated',
} as const;

export type FileUploadRootChangeReason =
  (typeof CHANGE_REASONS)[keyof typeof CHANGE_REASONS];

export type FileUploadRootChangeEventDetails = BaseUIChangeEventDetails<FileUploadRootChangeReason>;

export type FileUploadRootRejectEventDetails = BaseUIChangeEventDetails<
  FileUploadRootRejectReason,
  { message: string }
>;

export interface FileUploadRootRejection {
  /**
   * The rejected file.
   */
  file: File;
  /**
   * Machine-readable reason code for rejection.
   */
  reason: FileUploadRootRejectReason;
  /**
   * Event metadata containing rejection details such as message.
   */
  eventDetails: FileUploadRootRejectEventDetails;
}

export interface FileUploadRootState {
  /**
   * Whether the file upload is disabled.
   */
  disabled: boolean;
}

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
   * Callback when files are added or removed.
   */
  onFilesChange?:
    | ((
        files: FileUploadRootExtendedFile[],
        eventDetails: FileUploadRootChangeEventDetails,
      ) => void)
    | undefined;
  /**
   * Callback fired once per add/drop/paste/input attempt with accepted and rejected files.
   * This fires even when no files are accepted.
   *
   * `acceptedFiles` reflects the files actually committed to state for that attempt,
   * after max-files and duplicate checks are applied.
   */
  onFilesAdd?:
    | ((
        acceptedFiles: FileUploadRootExtendedFile[],
        fileRejections: FileUploadRootRejection[],
        eventDetails: FileUploadRootChangeEventDetails,
      ) => void)
    | undefined;
  /**
   * Callback when the file dialog is canceled.
   */
  onCancel?: (() => void) | undefined;
  /**
   * The locale used by `Intl.NumberFormat` when formatting values in default messages.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument | undefined;
}

export interface FileUploadRootExtendedFile extends File {
  /**
   * Unique identifier for the file.
   *
   * This should be treated as the stable identity key for consumers.
   */
  id: string;
  /**
   * URL for previewing the file.
   */
  preview: string;
  /**
   * Current status of the file.
   *
   * This value may be updated in-place by `updateFile`.
   */
  status: FileUploadRootFileStatus;
  /**
   * Upload progress (0-100).
   *
   * This value may be updated in-place by `updateFile`.
   */
  progress: number;
  /**
   * Error message if the file failed to upload.
   *
   * This value may be updated in-place by `updateFile`.
   */
  error?: string | undefined;
}

export interface FileUploadRootFileUpdates {
  status?: FileUploadRootFileStatus | undefined;
  progress?: number | undefined;
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
 * It handles file validation, input/paste integration, and shared state for the file upload workflow.
 *
 * @component
 * @example
 * ```tsx
 * import { Dropzone } from '@base-ui/react/dropzone';
 *
 * <FileUpload.Root accept="image/*" maxSize={5242880} onFilesChange={handleFileChange}>
 *   <FileUpload.HiddenInput />
 *   <Dropzone>Drop files here</Dropzone>
 *   <FileUpload.Trigger>Select files</FileUpload.Trigger>
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
 * @param onFilesAdd - Callback fired once per add/drop/paste/input attempt with accepted and rejected files
 * @param onCancel - Callback when the file dialog is canceled
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
      onFilesAdd,
      onCancel,
      locale,
      // Keep these out of `other` so DOM prop typing stays valid in useRenderElement props.
      render,
      style,
      className,
      ...other
    } = props;

    const { contextValue, announcement } = useFileUploadRoot({
      maxFiles,
      maxSize,
      minSize,
      accept,
      validator,
      multiple,
      directory,
      disabled,
      onFilesChange,
      onFilesAdd,
      onCancel,
      locale,
    });

    const state: FileUploadRootState = {
      disabled: contextValue.disabled,
    };

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
      contextValue.addFiles(pastedFiles, event.nativeEvent);
    });

    const defaultProps: HTMLProps = {
      onPaste: handlePaste,
      style: { position: 'relative', ...style },
      children: (
        <React.Fragment>
          <div
            key={announcement.key}
            style={visuallyHidden}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement.text}
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
  export type Rejection = FileUploadRootRejection;
  export type RejectEventDetails = FileUploadRootRejectEventDetails;
  export type ChangeEventDetails = FileUploadRootChangeEventDetails;
  export type ChangeReason = FileUploadRootChangeReason;
}
