'use client';

import * as React from 'react';
import { useId as useBaseUIId } from '@base-ui/utils/useId';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { generateId } from '@base-ui/utils/generateId';
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails';
import { FILE_UPLOAD_ROOT_REJECT_REASONS, FILE_UPLOAD_ROOT_CHANGE_REASONS } from './FileUploadRoot';
import type {
  FileUploadRootRejectReason,
  FileUploadRootChangeReason,
  FileUploadRootExtendedFile,
  FileUploadRootFileUpdates,
  FileUploadRootParameters,
  FileUploadRootFileStatus,
  FileUploadRootRejection,
} from './FileUploadRoot';
import type { FileUploadContextValue } from './FileUploadContext';

type UseFileUploadRootParameters = FileUploadRootParameters;

type RejectReasonCode =
  (typeof FILE_UPLOAD_ROOT_REJECT_REASONS)[keyof typeof FILE_UPLOAD_ROOT_REJECT_REASONS];

type ValidationResult = {
  reason: RejectReasonCode;
  message: string;
} | null;

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'then' in value && typeof (value as PromiseLike<unknown>).then === 'function';
};

// Generate a unique key for file deduplication based on name, size, and timestamp
const getFileKey = (file: { name: string; size: number; lastModified: number }) =>
  `${file.name}:${file.size}:${file.lastModified}`;

const formatBytes = (bytes: number, locale?: Intl.LocalesArgument) => {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

  const value = bytes / Math.pow(k, i);
  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${sizes[i]}`;
};

// Screen reader announcement and error messages (pure functions — no hook dependencies)
const messages = {
  fileTooLarge: (maxSizeFormatted: string) => `File too large (max ${maxSizeFormatted})`,
  fileTooSmall: (minSizeFormatted: string) => `File too small (min ${minSizeFormatted})`,
  fileTypeNotAccepted: () => 'File type not accepted',
  asyncValidatorNotSupported: () =>
    'Async validators are not supported. Return a string or null synchronously.',
  maxFilesReached: (count: number) => `Cannot add files. Limit of ${count} reached.`,
  duplicateFile: (fileName: string) => `${fileName}: duplicate file`,
  filesAdded: (count: number) => `Added ${count} file${count !== 1 ? 's' : ''}.`,
  filesRejected: (count: number, errors: string[]) => `${count} rejected: ${errors.join(', ')}`,
  fileRemoved: (fileName: string) => `Removed file ${fileName}`,
  allFilesRemoved: () => 'All files removed',
  retryingUpload: (fileName: string) => `Retrying upload for ${fileName}`,
  uploadCanceled: (fileName: string) => `Upload canceled for ${fileName}`,
};

// Check if a file type matches the accept string
const isFileTypeAccepted = (file: File, accept: string): boolean => {
  if (!accept || accept === '*') {
    return true;
  }

  const acceptTypes = accept.split(',').map((t) => t.trim());
  return acceptTypes.some((acceptType) => {
    if (acceptType === '*') {
      return true;
    }
    // File extension like .png, .pdf
    if (acceptType.startsWith('.')) {
      return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
    }
    // MIME type wildcard like image/*
    if (acceptType.endsWith('/*')) {
      const prefix = acceptType.slice(0, -2);
      return file.type.startsWith(prefix);
    }
    // Exact MIME type like image/png
    return file.type === acceptType;
  });
};

export const useFileUploadRoot = (params: UseFileUploadRootParameters) => {
  const {
    maxFiles = Number.POSITIVE_INFINITY,
    maxSize = Number.POSITIVE_INFINITY,
    minSize = 0,
    accept = '',
    validator,
    multiple = true,
    directory = false,
    disabled = false,
    onFileChange,
    onFileDrop,
    onCancel,
    onRetry,
    onFilePause,
    onFileResume,
    locale,
  } = params;

  const [files, setFiles] = React.useState<FileUploadRootExtendedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  // Mirror of `files` in a ref so addFiles can read the latest value synchronously.
  const filesRef = React.useRef<FileUploadRootExtendedFile[]>([]);
  filesRef.current = files;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const abortControllersRef = React.useRef<Map<string, AbortController>>(new Map());
  const previewUrlsRef = React.useRef<Map<string, string>>(new Map());
  const inputId = useBaseUIId();
  const isInitialRender = React.useRef(true);
  const lastChangeReasonRef = React.useRef<FileUploadRootChangeReason>('file-added');
  const lastChangeEventRef = React.useRef<Event | undefined>(undefined);

  // Cleanup object URLs and abort controllers to prevent memory leaks
  React.useEffect(() => {
    const controllers = abortControllersRef.current;
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      previewUrls.clear();
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  // Notify parent of changes
  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const eventDetails = createChangeEventDetails<FileUploadRootChangeReason>(
      lastChangeReasonRef.current,
      lastChangeEventRef.current,
    );
    onFileChange?.(files, eventDetails);
  }, [files, onFileChange]);

  const validateFile = useStableCallback((file: File): ValidationResult => {
    const hasMaxSizeLimit = Number.isFinite(maxSize);

    if (hasMaxSizeLimit && file.size > maxSize) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.FILE_TOO_LARGE,
        message: messages.fileTooLarge(formatBytes(maxSize, locale)),
      };
    }

    if (file.size < minSize) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.FILE_TOO_SMALL,
        message: messages.fileTooSmall(formatBytes(minSize, locale)),
      };
    }

    if (!isFileTypeAccepted(file, accept)) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.MIME_TYPE_NOT_ALLOWED,
        message: messages.fileTypeNotAccepted(),
      };
    }

    // Custom validation
    if (validator) {
      const customError = validator(file);
      if (isPromiseLike(customError)) {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: messages.asyncValidatorNotSupported(),
        };
      }

      if (customError) {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: customError,
        };
      }
    }

    return null;
  });

  const addFiles = useStableCallback((newFiles: File[], event?: Event) => {
    if (disabled) {
      return;
    }

    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_ADDED;
    lastChangeEventRef.current = event;

    // Use the ref so rapid successive calls always see the up-to-date list.
    const prev = filesRef.current;
    const remainingSlots = maxFiles - prev.length;

    // Helper to build reject event details with a message payload.
    const rejectDetails = (reason: FileUploadRootRejectReason, msg: string) =>
      createChangeEventDetails<FileUploadRootRejectReason, { message: string }>(
        reason,
        event,
        undefined,
        { message: msg },
      );

    const maxFilesReachedMessage = messages.maxFilesReached(maxFiles);

    if (remainingSlots <= 0) {
      const fileRejections: FileUploadRootRejection[] = [];

      newFiles.forEach((file) => {
        const eventDetails = rejectDetails('MAX_FILES_REACHED', maxFilesReachedMessage);
        fileRejections.push({
          file,
          reason: 'MAX_FILES_REACHED',
          eventDetails,
        });
      });

      setAnnouncement(maxFilesReachedMessage);

      onFileDrop?.(
        [],
        fileRejections,
        createChangeEventDetails<FileUploadRootChangeReason>(
          FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_ADDED,
          event,
        ),
      );

      return;
    }

    const candidates = multiple ? newFiles : [newFiles[0]];
    const validFiles: FileUploadRootExtendedFile[] = [];
    const fileRejections: FileUploadRootRejection[] = [];
    const errors: string[] = [];

    const existingKeys = new Set(prev.map(getFileKey));
    let acceptedCount = 0;

    candidates.forEach((file) => {
      if (!file) {
        return;
      }

      if (acceptedCount >= remainingSlots) {
        const eventDetails = rejectDetails('MAX_FILES_REACHED', maxFilesReachedMessage);
        fileRejections.push({
          file,
          reason: 'MAX_FILES_REACHED',
          eventDetails,
        });
        errors.push(`${file.name}: ${maxFilesReachedMessage}`);
        return;
      }

      const fileKey = getFileKey(file);
      if (existingKeys.has(fileKey)) {
        const dupMessage = messages.duplicateFile(file.name);
        const eventDetails = rejectDetails('DUPLICATE_FILE', dupMessage);
        fileRejections.push({
          file,
          reason: 'DUPLICATE_FILE',
          eventDetails,
        });
        errors.push(dupMessage);
        return;
      }

      const error = validateFile(file);
      if (error) {
        const eventDetails = rejectDetails(error.reason, error.message);
        fileRejections.push({
          file,
          reason: error.reason,
          eventDetails,
        });
        errors.push(`${file.name}: ${error.message}`);
      } else {
        existingKeys.add(fileKey);

        const id = generateId('file');
        const preview = URL.createObjectURL(file);
        previewUrlsRef.current.set(id, preview);

        const extendedFile = Object.assign(file, {
          id,
          preview,
          status: 'idle' as const,
          progress: 0,
        }) as FileUploadRootExtendedFile;

        validFiles.push(extendedFile);
        acceptedCount += 1;
      }
    });

    const successMsg = validFiles.length > 0 ? messages.filesAdded(validFiles.length) : '';
    const errorMsg = errors.length > 0 ? messages.filesRejected(errors.length, errors) : '';
    const separator = successMsg && errorMsg ? ' ' : '';

    onFileDrop?.(
      validFiles,
      fileRejections,
      createChangeEventDetails<FileUploadRootChangeReason>(
        FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_ADDED,
        event,
      ),
    );

    setAnnouncement(`${successMsg}${separator}${errorMsg}`);

    // Use a functional update to merge our changes on top of the latest committed
    // state, preventing concurrent rapid calls from losing earlier additions.
    setFiles((latestPrev) => {
      if (multiple) {
        // Re-enforce maxFiles cap using the actual latest committed state.
        // This prevents concurrent addFiles calls from collectively exceeding
        // maxFiles when they both validated against a stale filesRef.current.
        const actualRemaining = Math.max(0, maxFiles - latestPrev.length);
        const filesToAdd = validFiles.slice(0, actualRemaining);

        // Files beyond the cap will not be added; revoke their preview URLs now.
        validFiles.slice(actualRemaining).forEach((f) => {
          URL.revokeObjectURL(f.preview);
          previewUrlsRef.current.delete(f.id);
        });

        if (latestPrev === prev) {
          return filesToAdd.length > 0 ? [...latestPrev, ...filesToAdd] : latestPrev;
        }
        // A concurrent update has already been applied; merge our filesToAdd on top.
        const latestKeys = new Set(latestPrev.map((f) => getFileKey(f)));
        const uniqueFiles = filesToAdd.filter((f) => !latestKeys.has(getFileKey(f)));
        // Files already present due to a concurrent update are also not added; revoke their URLs.
        filesToAdd.filter((f) => latestKeys.has(getFileKey(f))).forEach((f) => {
          URL.revokeObjectURL(f.preview);
          previewUrlsRef.current.delete(f.id);
        });
        return uniqueFiles.length > 0 ? [...latestPrev, ...uniqueFiles] : latestPrev;
      }

      if (validFiles.length === 0) {
        return latestPrev;
      }

      // single-file mode: replace with the newly selected file
      if (latestPrev !== prev) {
        latestPrev.forEach((f) => {
          URL.revokeObjectURL(f.preview);
          previewUrlsRef.current.delete(f.id);
        });
      }
      return validFiles;
    });

    if (!multiple) {
      if (validFiles.length === 0) {
        return;
      }

      // Revoke URLs for files that are being replaced.
      const nextIds = new Set(validFiles.map((f) => f.id));
      prev.forEach((f) => {
        if (!nextIds.has(f.id)) {
          URL.revokeObjectURL(f.preview);
          previewUrlsRef.current.delete(f.id);
        }
      });
    }
  });

  const removeFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_REMOVED;
    lastChangeEventRef.current = undefined;

    // Read the name before setFiles so the announcement fires reliably —
    // functional updaters don't run synchronously before setState returns.
    const removedFileName = filesRef.current.find((f) => f.id === id)?.name ?? null;

    setFiles((prev) => {
      // URL revocation stays inside the updater so it uses the correct `prev`
      // snapshot and handles batched addFiles + removeFile correctly.
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
        previewUrlsRef.current.delete(id);
      }
      return prev.filter((f) => f.id !== id);
    });

    if (removedFileName) {
      setAnnouncement(messages.fileRemoved(removedFileName));
    }
  });

  const clearFiles = useStableCallback(() => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILES_CLEARED;
    lastChangeEventRef.current = undefined;

    // URL.revokeObjectURL is idempotent — safe to call inside the updater so we
    // always use the correct `prev` snapshot (handles batched addFiles + clearFiles).
    setFiles((prev) => {
      prev.forEach((file) => {
        URL.revokeObjectURL(file.preview);
        previewUrlsRef.current.delete(file.id);
      });
      return [];
    });
    setAnnouncement(messages.allFilesRemoved());
  });

  const updateFile = useStableCallback((id: string, updates: FileUploadRootFileUpdates) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;
    setFiles((prev) => prev.map((file) => (file.id === id ? Object.assign(file, updates) : file)));
  });

  const retryFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;

    const fileToRetry =
      filesRef.current.find((f) => f.id === id && f.status === 'error') ?? null;

    // Call onRetry before setFiles so the callback observes the file in its
    // error state, not the post-mutation idle state produced by Object.assign.
    if (fileToRetry) {
      onRetry?.(fileToRetry);
      setAnnouncement(messages.retryingUpload(fileToRetry.name));
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id && f.status === 'error'
          ? Object.assign(f, {
              status: 'idle' as FileUploadRootFileStatus,
              progress: 0,
              error: undefined,
            })
          : f,
      ),
    );
  });

  const abortUpload = useStableCallback((id: string) => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
      lastChangeEventRef.current = undefined;
      controller.abort();
      abortControllersRef.current.delete(id);

      const canceledFileName: string | null =
        filesRef.current.find((f) => f.id === id && f.status === 'uploading')?.name ?? null;

      setFiles((prev) => {
        return prev.map((f) => {
          if (f.id === id && f.status === 'uploading') {
            return Object.assign(f, {
              status: 'error' as FileUploadRootFileStatus,
              error: 'Upload canceled',
            });
          }
          return f;
        });
      });

      if (canceledFileName) {
        setAnnouncement(messages.uploadCanceled(canceledFileName));
      }
    }
  });

  const getAbortSignal = useStableCallback((id: string): AbortSignal => {
    const existingController = abortControllersRef.current.get(id);
    if (existingController) {
      return existingController.signal;
    }

    const controller = new AbortController();
    abortControllersRef.current.set(id, controller);
    return controller.signal;
  });

  const pauseFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;

    const fileToPause =
      filesRef.current.find((f) => f.id === id && f.status === 'uploading') ?? null;

    // Call onFilePause before setFiles so the callback observes the file in its
    // uploading state, not the post-mutation paused state.
    if (fileToPause) {
      onFilePause?.(fileToPause);
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id && f.status === 'uploading'
          ? Object.assign(f, { status: 'paused' as FileUploadRootFileStatus, isPaused: true })
          : f,
      ),
    );
  });

  const resumeFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;

    const fileToResume =
      filesRef.current.find((f) => f.id === id && f.status === 'paused') ?? null;

    // Call onFileResume before setFiles so the callback observes the file in its
    // paused state, not the post-mutation uploading state.
    if (fileToResume) {
      onFileResume?.(fileToResume);
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id && f.status === 'paused'
          ? Object.assign(f, { status: 'uploading' as FileUploadRootFileStatus, isPaused: false })
          : f,
      ),
    );
  });

  const openFileDialog = useStableCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  });

  const contextValue: FileUploadContextValue = React.useMemo(
    () => ({
      files,
      isDragging,
      maxFiles,
      maxSize,
      minSize,
      accept,
      multiple,
      directory,
      disabled,
      inputId: inputId ?? '',
      removeFile,
      clearFiles,
      addFiles,
      updateFile,
      retryFile,
      abortUpload,
      getAbortSignal,
      pauseFile,
      resumeFile,
      onCancel,
      onRetry,
      onFilePause,
      onFileResume,
      openFileDialog,
    }),
    [
      files,
      isDragging,
      maxFiles,
      maxSize,
      minSize,
      accept,
      multiple,
      directory,
      disabled,
      inputId,
      removeFile,
      clearFiles,
      addFiles,
      updateFile,
      retryFile,
      abortUpload,
      getAbortSignal,
      pauseFile,
      resumeFile,
      onCancel,
      onRetry,
      onFilePause,
      onFileResume,
      openFileDialog,
    ],
  );

  return {
    contextValue,
    inputRef,
    isDragging,
    setIsDragging,
    disabled,
    addFiles,
    announcement,
  };
};
