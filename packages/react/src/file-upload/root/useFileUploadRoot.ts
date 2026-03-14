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
    onFileReject,
    onCancel,
    onRetry,
    onFilePause,
    onFileResume,
    locale,
  } = params;

  // Screen reader announcement messages
  const messages = React.useMemo(
    () => ({
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
    }),
    [],
  );

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

    if (remainingSlots <= 0) {
      const maxFilesReachedMessage = messages.maxFilesReached(maxFiles);
      newFiles.forEach((file) => {
        const eventDetails = createChangeEventDetails<
          FileUploadRootRejectReason,
          { message: string }
        >('MAX_FILES_REACHED', event, undefined, { message: maxFilesReachedMessage });

        onFileReject?.(file, 'MAX_FILES_REACHED', eventDetails);
      });

      setAnnouncement(maxFilesReachedMessage);
      return;
    }

    const candidates = multiple ? newFiles : [newFiles[0]];
    const validFiles: FileUploadRootExtendedFile[] = [];
    const errors: string[] = [];

    const existingKeys = new Set(prev.map(getFileKey));
    const maxFilesReachedMessage = messages.maxFilesReached(maxFiles);
    let acceptedCount = 0;

    candidates.forEach((file) => {
      if (!file) {
        return;
      }

      if (acceptedCount >= remainingSlots) {
        const eventDetails = createChangeEventDetails<
          FileUploadRootRejectReason,
          { message: string }
        >('MAX_FILES_REACHED', event, undefined, { message: maxFilesReachedMessage });

        onFileReject?.(file, 'MAX_FILES_REACHED', eventDetails);
        errors.push(`${file.name}: ${maxFilesReachedMessage}`);
        return;
      }

      const fileKey = getFileKey(file);
      if (existingKeys.has(fileKey)) {
        const eventDetails = createChangeEventDetails<
          FileUploadRootRejectReason,
          { message: string }
        >('DUPLICATE_FILE', event, undefined, { message: messages.duplicateFile(file.name) });
        onFileReject?.(file, 'DUPLICATE_FILE', eventDetails);
        errors.push(messages.duplicateFile(file.name));
        return;
      }

      const error = validateFile(file);
      if (error) {
        const eventDetails = createChangeEventDetails<
          FileUploadRootRejectReason,
          { message: string }
        >(error.reason, event, undefined, { message: error.message });

        onFileReject?.(file, error.reason, eventDetails);
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

        // Files beyond the cap will not be added; revoke their URLs immediately.
        const droppedByCap = validFiles.slice(actualRemaining);
        droppedByCap.forEach((f) => {
          URL.revokeObjectURL(f.preview);
          previewUrlsRef.current.delete(f.id);
        });

        if (latestPrev === prev) {
          return filesToAdd.length > 0 ? [...latestPrev, ...filesToAdd] : latestPrev;
        }
        // A concurrent update has already been applied; merge our filesToAdd on top.
        const latestIds = new Set(latestPrev.map((f) => f.id));
        const uniqueFiles = filesToAdd.filter((f) => !latestIds.has(f.id));
        // Files already present due to a concurrent update are also not added; revoke their URLs.
        const duplicates = filesToAdd.filter((f) => latestIds.has(f.id));
        duplicates.forEach((f) => {
          URL.revokeObjectURL(f.preview);
          previewUrlsRef.current.delete(f.id);
        });
        return uniqueFiles.length > 0 ? [...latestPrev, ...uniqueFiles] : latestPrev;
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

    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        setAnnouncement(messages.fileRemoved(fileToRemove.name));
        URL.revokeObjectURL(fileToRemove.preview);
        previewUrlsRef.current.delete(id);
      }
      return prev.filter((f) => f.id !== id);
    });
  });

  const clearFiles = useStableCallback(() => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILES_CLEARED;
    lastChangeEventRef.current = undefined;

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
    setFiles((prev) => {
      return prev.map((file) => {
        if (file.id === id && file.status === 'error') {
          onRetry?.(file);
          setAnnouncement(messages.retryingUpload(file.name));
          return Object.assign(file, {
            status: 'idle' as FileUploadRootFileStatus,
            progress: 0,
            error: undefined,
          });
        }
        return file;
      });
    });
  });

  const abortUpload = useStableCallback((id: string) => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
      lastChangeEventRef.current = undefined;
      controller.abort();
      abortControllersRef.current.delete(id);
      setFiles((prev) => {
        return prev.map((file) => {
          if (file.id === id && file.status === 'uploading') {
            setAnnouncement(messages.uploadCanceled(file.name));
            return Object.assign(file, {
              status: 'error' as FileUploadRootFileStatus,
              error: 'Upload canceled',
            });
          }
          return file;
        });
      });
    }
  });

  const getAbortSignal = useStableCallback((id: string): AbortSignal => {
    const controller = new AbortController();
    abortControllersRef.current.set(id, controller);
    return controller.signal;
  });

  const pauseFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;
    setFiles((prev) => {
      return prev.map((file) => {
        if (file.id === id && file.status === 'uploading') {
          onFilePause?.(file);
          return Object.assign(file, {
            status: 'paused' as FileUploadRootFileStatus,
            isPaused: true,
          });
        }
        return file;
      });
    });
  });

  const resumeFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;
    setFiles((prev) => {
      return prev.map((file) => {
        if (file.id === id && file.status === 'paused') {
          onFileResume?.(file);
          return Object.assign(file, {
            status: 'uploading' as FileUploadRootFileStatus,
            isPaused: false,
          });
        }
        return file;
      });
    });
  });

  const openFileDialog = useStableCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  });

  const registerInput = useStableCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
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
      registerInput,
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
      registerInput,
    ],
  );

  return {
    contextValue,
    isDragging,
    setIsDragging,
    disabled,
    addFiles,
    announcement,
  };
};
