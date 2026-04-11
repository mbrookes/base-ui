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
  FileUploadRootRejection,
} from './FileUploadRoot';
import type { FileUploadContextValue } from './FileUploadContext';

type ValidationResult = {
  reason: FileUploadRootRejectReason;
  message: string;
} | null;

type ExtendedFileMetadata = {
  id: string;
  preview: string;
  status: FileUploadRootExtendedFile['status'];
  progress: number;
  error?: string | undefined;
};

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'then' in value && typeof (value as PromiseLike<unknown>).then === 'function';
};

// Generate a unique key for file deduplication based on file identity metadata.
const getFileKey = (file: {
  name: string;
  size: number;
  lastModified: number;
  type: string;
  webkitRelativePath?: string | undefined;
}) =>
  `${file.name}:${file.size}:${file.lastModified}:${file.type}:${file.webkitRelativePath ?? ''}`;

const createExtendedFile = (
  file: File,
  metadata: ExtendedFileMetadata,
): FileUploadRootExtendedFile => {
  Object.keys(metadata).forEach((key) => {
    Object.defineProperty(file, key, {
      value: metadata[key as keyof ExtendedFileMetadata],
      enumerable: true,
      configurable: true,
      writable: true,
    });
  });
  return file as FileUploadRootExtendedFile;
};

const createFileRejection = (
  file: File,
  reason: FileUploadRootRejectReason,
  message: string,
  event?: Event,
): FileUploadRootRejection => ({
  file,
  reason,
  eventDetails: createChangeEventDetails<FileUploadRootRejectReason, { message: string }>(
    reason,
    event,
    undefined,
    { message },
  ),
});

const cloneFileForUpload = (file: File) => {
  const cloned = new File([file], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });

  const webkitRelativePath = (file as File & { webkitRelativePath?: string | undefined })
    .webkitRelativePath;
  if (webkitRelativePath) {
    Object.defineProperty(cloned, 'webkitRelativePath', {
      configurable: true,
      value: webkitRelativePath,
    });
  }

  return cloned;
};

const formatBytes = (bytes: number, formatter: Intl.NumberFormat) => {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

  const value = bytes / Math.pow(k, i);
  const formattedValue = formatter.format(value);

  return `${formattedValue} ${sizes[i]}`;
};

const messages = {
  fileTooLarge: (maxSizeFormatted: string) => `File too large (max ${maxSizeFormatted})`,
  fileTooSmall: (minSizeFormatted: string) => `File too small (min ${minSizeFormatted})`,
  fileTypeNotAccepted: 'File type not accepted',
  asyncValidatorNotSupported:
    'Async validators are not supported. Return a string or null synchronously.',
  duplicateFile: 'duplicate file',
  maxFilesReached: (count: number) => `Cannot add files. Limit of ${count} reached.`,
  filesAdded: (count: number) => `Added ${count} file${count !== 1 ? 's' : ''}.`,
  filesRejected: (count: number, errors: string[]) => {
    const details = errors.slice(0, 3).join(', ');
    if (!details) {
      return `${count} rejected`;
    }

    return `${count} rejected: ${details}${errors.length > 3 ? ', and more' : ''}`;
  },
  fileRemoved: (fileName: string) => `Removed file ${fileName}`,
  allFilesRemoved: 'All files removed',
};

const formatFileError = (fileName: string, message: string) => `${fileName}: ${message}`;

const getThrownErrorMessage = (error: unknown) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Custom validator threw an error.';
};

const normalizeNonNegativeFinite = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(0, value) : fallback;

const normalizeFileCountLimit = (value: number) => {
  if (!Number.isFinite(value)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor(value));
};

const createAnnouncementText = (successText: string, errorText: string) =>
  [successText, errorText].filter(Boolean).join(' ');

const incrementAnnouncement = (
  setAnnouncement: React.Dispatch<React.SetStateAction<{ text: string; key: number }>>,
  text: string,
) => {
  setAnnouncement((currentAnnouncement) => ({
    text,
    key: currentAnnouncement.key + 1,
  }));
};

// Check if a file type matches the accept string
const parseAccept = (accept: string): string[] => {
  if (!accept || accept === '*') {
    return [];
  }

  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
};

const isFileTypeAccepted = (file: File, acceptTypes: string[]): boolean => {
  if (acceptTypes.length === 0) {
    return true;
  }

  const fileType = file.type.toLowerCase();

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
      return fileType.startsWith(`${prefix}/`);
    }
    // Exact MIME type like image/png
    return fileType === acceptType;
  });
};

export const useFileUploadRoot = (params: FileUploadRootParameters) => {
  const {
    maxFiles: maxFilesProp = Number.POSITIVE_INFINITY,
    maxSize: maxSizeProp = Number.POSITIVE_INFINITY,
    minSize: minSizeProp = 0,
    accept = '',
    validator,
    multiple = true,
    directory = false,
    disabled = false,
    onFilesChange,
    onFilesAdd,
    onCancel,
    locale,
  } = params;

  const maxFiles = normalizeFileCountLimit(maxFilesProp);
  const minSize = normalizeNonNegativeFinite(minSizeProp, 0);
  const maxSize = normalizeNonNegativeFinite(maxSizeProp, Number.POSITIVE_INFINITY);

  const [files, setFiles] = React.useState<FileUploadRootExtendedFile[]>([]);
  const [announcement, setAnnouncement] = React.useState({ text: '', key: 0 });
  const numberFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    [locale],
  );
  const acceptTypes = React.useMemo(() => parseAccept(accept), [accept]);
  const formattedMinSize = React.useMemo(
    () => messages.fileTooSmall(formatBytes(minSize, numberFormatter)),
    [minSize, numberFormatter],
  );
  const formattedMaxSize = React.useMemo(() => {
    if (!Number.isFinite(maxSize)) {
      return null;
    }

    return messages.fileTooLarge(formatBytes(maxSize, numberFormatter));
  }, [maxSize, numberFormatter]);

  const warnedInvertedBoundsRef = React.useRef(false);
  if (process.env.NODE_ENV !== 'production' && minSizeProp > maxSizeProp && !warnedInvertedBoundsRef.current) {
    warnedInvertedBoundsRef.current = true;
    console.warn(
      'Base UI: `minSize` is greater than `maxSize` in <FileUpload.Root>. ' +
        'The values were normalized to keep file-size validation stable.',
    );
  }

  // Mirror of `files` in a ref so addFiles can read the latest value synchronously.
  const filesRef = React.useRef<FileUploadRootExtendedFile[]>([]);
  filesRef.current = files;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const fallbackInputIdRef = React.useRef<string | null>(null);
  if (fallbackInputIdRef.current === null) {
    fallbackInputIdRef.current = generateId('file-upload-input');
  }
  const inputId = useBaseUIId() ?? fallbackInputIdRef.current;
  const isInitialRender = React.useRef(true);
  const lastChangeReasonRef = React.useRef<FileUploadRootChangeReason>('file-added');
  const lastChangeEventRef = React.useRef<Event | undefined>(undefined);

  // Cleanup object URLs to prevent memory leaks
  React.useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
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
    onFilesChange?.(files, eventDetails);
  }, [files, onFilesChange]);

  // Stable callbacks intentionally avoid dependency-array churn while still
  // reading the latest render-time constraints and handlers.
  const validateFile = useStableCallback((file: File): ValidationResult => {
    if (Number.isFinite(maxSize) && file.size > maxSize) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.FILE_TOO_LARGE,
        message: formattedMaxSize ?? '',
      };
    }

    if (file.size < minSize) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.FILE_TOO_SMALL,
        message: formattedMinSize,
      };
    }

    if (!isFileTypeAccepted(file, acceptTypes)) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.MIME_TYPE_NOT_ALLOWED,
        message: messages.fileTypeNotAccepted,
      };
    }

    // Custom validation
    if (validator) {
      let customError: unknown;

      try {
        customError = validator(file);
      } catch (error) {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: getThrownErrorMessage(error),
        };
      }

      if (isPromiseLike(customError)) {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: messages.asyncValidatorNotSupported,
        };
      }

      if (typeof customError === 'string') {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: customError,
        };
      }

      if (customError) {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: 'Custom validator failed.',
        };
      }
    }

    return null;
  });

  const addFiles = useStableCallback((newFiles: File[], event?: Event) => {
    if (disabled) {
      return;
    }

    if (newFiles.length === 0) {
      return;
    }

    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_ADDED;
    lastChangeEventRef.current = event;

    // Use the ref so rapid successive calls always see the up-to-date list.
    const prev = filesRef.current;
    const selectionLimit = multiple ? maxFiles : Math.min(1, maxFiles);
    const remainingSlots = multiple ? selectionLimit - prev.length : selectionLimit;

    const maxFilesReachedMessage = messages.maxFilesReached(maxFiles);

    if (remainingSlots <= 0) {
      const fileRejections: FileUploadRootRejection[] = [];

      newFiles.forEach((file) => {
        fileRejections.push(
          createFileRejection(
            file,
            FILE_UPLOAD_ROOT_REJECT_REASONS.MAX_FILES_REACHED,
            maxFilesReachedMessage,
            event,
          ),
        );
      });

      incrementAnnouncement(setAnnouncement, maxFilesReachedMessage);

      onFilesAdd?.(
        [],
        fileRejections,
        createChangeEventDetails<FileUploadRootChangeReason>(
          FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_ADDED,
          event,
        ),
      );

      return;
    }

    const candidates = newFiles;
    const validFiles: FileUploadRootExtendedFile[] = [];
    const fileRejections: FileUploadRootRejection[] = [];
    const errors: string[] = [];

    const existingKeys = new Set(prev.map(getFileKey));
    let acceptedCount = 0;

    candidates.forEach((file) => {
      if (acceptedCount >= remainingSlots) {
        fileRejections.push(
          createFileRejection(
            file,
            FILE_UPLOAD_ROOT_REJECT_REASONS.MAX_FILES_REACHED,
            maxFilesReachedMessage,
            event,
          ),
        );
        errors.push(formatFileError(file.name, maxFilesReachedMessage));
        return;
      }

      const fileKey = getFileKey(file);
      if (existingKeys.has(fileKey)) {
        fileRejections.push(
          createFileRejection(
            file,
            FILE_UPLOAD_ROOT_REJECT_REASONS.DUPLICATE_FILE,
            messages.duplicateFile,
            event,
          ),
        );
        errors.push(formatFileError(file.name, messages.duplicateFile));
        return;
      }

      const error = validateFile(file);
      if (error) {
        fileRejections.push(createFileRejection(file, error.reason, error.message, event));
        errors.push(formatFileError(file.name, error.message));
      } else {
        existingKeys.add(fileKey);

        const id = generateId('file');
        const normalizedFile = cloneFileForUpload(file);
        const preview = URL.createObjectURL(normalizedFile);

        const extendedFile = createExtendedFile(normalizedFile, {
          id,
          preview,
          status: 'idle' as const,
          progress: 0,
        });

        validFiles.push(extendedFile);
        acceptedCount += 1;
      }
    });

    const successMsg = validFiles.length > 0 ? messages.filesAdded(validFiles.length) : '';
    const errorMsg = errors.length > 0 ? messages.filesRejected(errors.length, errors) : '';

    if (!multiple && validFiles.length > 0) {
      // single-file mode: replace with the newly selected file; revoke all previous URLs.
      prev.forEach((f) => {
        URL.revokeObjectURL(f.preview);
      });
    }

    const filesToAdd = validFiles;
    let nextFiles = prev;
    if (filesToAdd.length > 0) {
      nextFiles = multiple ? [...prev, ...filesToAdd] : filesToAdd;
    }

    if (nextFiles !== prev) {
      filesRef.current = nextFiles;
      setFiles(nextFiles);
    }

    onFilesAdd?.(
      filesToAdd,
      fileRejections,
      createChangeEventDetails<FileUploadRootChangeReason>(
        FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_ADDED,
        event,
      ),
    );

    incrementAnnouncement(setAnnouncement, createAnnouncementText(successMsg, errorMsg));
  });

  const removeFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_REMOVED;
    lastChangeEventRef.current = undefined;

    const prev = filesRef.current;
    const fileToRemove = prev.find((f) => f.id === id);
    if (!fileToRemove) {
      return;
    }

    URL.revokeObjectURL(fileToRemove.preview);

    const nextFiles = prev.filter((f) => f.id !== id);
    filesRef.current = nextFiles;
    setFiles(nextFiles);

    incrementAnnouncement(setAnnouncement, messages.fileRemoved(fileToRemove.name));
  });

  const clearFiles = useStableCallback(() => {
    if (filesRef.current.length === 0) {
      return;
    }

    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILES_CLEARED;
    lastChangeEventRef.current = undefined;

    filesRef.current.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });

    filesRef.current = [];
    setFiles([]);
    incrementAnnouncement(setAnnouncement, messages.allFilesRemoved);
  });

  const updateFile = useStableCallback((id: string, updates: FileUploadRootFileUpdates) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_UPDATED;
    lastChangeEventRef.current = undefined;

    const prev = filesRef.current;
    const fileIndex = prev.findIndex((file) => file.id === id);
    if (fileIndex === -1) {
      return;
    }

    const currentFile = prev[fileIndex];
    // Metadata updates should not clone file contents; mutate metadata fields only.
    if (updates.status !== undefined) {
      currentFile.status = updates.status;
    }
    if (updates.progress !== undefined) {
      currentFile.progress = updates.progress;
    }
    if ('error' in updates) {
      currentFile.error = updates.error;
    }

    const nextFiles = [...prev];
    nextFiles[fileIndex] = currentFile;
    filesRef.current = nextFiles;
    setFiles(nextFiles);
  });

  const openFileDialog = useStableCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  });

  const setInputElement = useStableCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
  });

  const onInputChange = useStableCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      addFiles(Array.from(event.target.files), event.nativeEvent);
    } else {
      onCancel?.();
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  });

  const contextValue: FileUploadContextValue = React.useMemo(
    () => ({
      files,
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
      onCancel,
      openFileDialog,
      setInputElement,
      onInputChange,
    }),
    [
      files,
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
      onCancel,
      openFileDialog,
      setInputElement,
      onInputChange,
    ],
  );

  return {
    contextValue,
    announcement,
  };
};
