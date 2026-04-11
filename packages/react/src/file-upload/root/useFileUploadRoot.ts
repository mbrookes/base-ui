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

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'then' in value && typeof (value as PromiseLike<unknown>).then === 'function';
};

// Generate a unique key for file deduplication based on name, size, and timestamp
const getFileKey = (file: {
  name: string;
  size: number;
  lastModified: number;
  type: string;
  webkitRelativePath?: string;
}) => `${file.name}:${file.size}:${file.lastModified}:${file.type}:${file.webkitRelativePath ?? ''}`;

const createExtendedFile = (
  file: File,
  metadata: {
    id: string;
    preview: string;
    status: FileUploadRootExtendedFile['status'];
    progress: number;
    error?: string | undefined;
  },
): FileUploadRootExtendedFile => {
  const clonedFile = new File([file], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  }) as FileUploadRootExtendedFile;

  if ('webkitRelativePath' in file && file.webkitRelativePath) {
    Object.defineProperty(clonedFile, 'webkitRelativePath', {
      configurable: true,
      value: file.webkitRelativePath,
    });
  }

  return Object.assign(clonedFile, metadata);
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
  maxFilesReached: (count: number) => `Cannot add files. Limit of ${count} reached.`,
  duplicateFile: (fileName: string) => `${fileName}: duplicate file`,
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

// Check if a file type matches the accept string
const parseAccept = (accept: string): string[] => {
  if (!accept || accept === '*') {
    return [];
  }

  return accept.split(',').map((t) => t.trim());
};

const isFileTypeAccepted = (file: File, acceptTypes: string[]): boolean => {
  if (acceptTypes.length === 0) {
    return true;
  }

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
      return file.type.startsWith(`${prefix}/`);
    }
    // Exact MIME type like image/png
    return file.type === acceptType;
  });
};

export const useFileUploadRoot = (params: FileUploadRootParameters) => {
  const {
    maxFiles = Number.POSITIVE_INFINITY,
    maxSize = Number.POSITIVE_INFINITY,
    minSize = 0,
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

  const [files, setFiles] = React.useState<FileUploadRootExtendedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
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
  // Mirror of `files` in a ref so addFiles can read the latest value synchronously.
  const filesRef = React.useRef<FileUploadRootExtendedFile[]>([]);
  filesRef.current = files;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = React.useRef<Map<string, string>>(new Map());
  const inputId = useBaseUIId();
  const isInitialRender = React.useRef(true);
  const lastChangeReasonRef = React.useRef<FileUploadRootChangeReason>('file-added');
  const lastChangeEventRef = React.useRef<Event | undefined>(undefined);

  // Cleanup object URLs to prevent memory leaks
  React.useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      previewUrls.clear();
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

  const validateFile = useStableCallback((file: File): ValidationResult => {
    if (Number.isFinite(maxSize) && file.size > maxSize) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.FILE_TOO_LARGE,
        message: messages.fileTooLarge(formatBytes(maxSize, numberFormatter)),
      };
    }

    if (file.size < minSize) {
      return {
        reason: FILE_UPLOAD_ROOT_REJECT_REASONS.FILE_TOO_SMALL,
        message: messages.fileTooSmall(formatBytes(minSize, numberFormatter)),
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
      const customError = validator(file);
      if (isPromiseLike(customError)) {
        return {
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.CUSTOM_VALIDATION_FAILED,
          message: messages.asyncValidatorNotSupported,
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
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.MAX_FILES_REACHED,
          eventDetails,
        });
      });

      setAnnouncement((prev) => ({ text: maxFilesReachedMessage, key: prev.key + 1 }));

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

    const candidates = multiple ? newFiles : newFiles.slice(0, 1);
    const validFiles: FileUploadRootExtendedFile[] = [];
    const fileRejections: FileUploadRootRejection[] = [];
    const errors: string[] = [];

    const existingKeys = new Set(prev.map(getFileKey));
    let acceptedCount = 0;

    candidates.forEach((file) => {
      if (acceptedCount >= remainingSlots) {
        const eventDetails = rejectDetails('MAX_FILES_REACHED', maxFilesReachedMessage);
        fileRejections.push({
          file,
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.MAX_FILES_REACHED,
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
          reason: FILE_UPLOAD_ROOT_REJECT_REASONS.DUPLICATE_FILE,
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

        const extendedFile = createExtendedFile(file, {
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
        previewUrlsRef.current.delete(f.id);
      });
    }

    const filesToAdd = validFiles;
    const nextFiles =
      filesToAdd.length === 0 ? prev : multiple ? [...prev, ...filesToAdd] : filesToAdd;

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

    setAnnouncement((prev) => ({ text: [successMsg, errorMsg].filter(Boolean).join(' '), key: prev.key + 1 }));
  });

  const removeFile = useStableCallback((id: string) => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILE_REMOVED;
    lastChangeEventRef.current = undefined;

    // Read the name before setFiles so the announcement fires reliably —
    // functional updaters don't run synchronously before setState returns.
    const removedFileName = filesRef.current.find((f) => f.id === id)?.name ?? null;

    const prev = filesRef.current;
    const fileToRemove = prev.find((f) => f.id === id);
    if (!fileToRemove) {
      return;
    }

    URL.revokeObjectURL(fileToRemove.preview);
    previewUrlsRef.current.delete(id);

    const nextFiles = prev.filter((f) => f.id !== id);
    filesRef.current = nextFiles;
    setFiles(nextFiles);

    if (removedFileName) {
      setAnnouncement((prev) => ({ text: messages.fileRemoved(removedFileName), key: prev.key + 1 }));
    }
  });

  const clearFiles = useStableCallback(() => {
    lastChangeReasonRef.current = FILE_UPLOAD_ROOT_CHANGE_REASONS.FILES_CLEARED;
    lastChangeEventRef.current = undefined;

    filesRef.current.forEach((file) => {
      URL.revokeObjectURL(file.preview);
      previewUrlsRef.current.delete(file.id);
    });

    filesRef.current = [];
    setFiles([]);
    setAnnouncement((prev) => ({ text: messages.allFilesRemoved, key: prev.key + 1 }));
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
    const nextFile = createExtendedFile(currentFile, {
      id: currentFile.id,
      preview: currentFile.preview,
      status: updates.status ?? currentFile.status,
      progress: updates.progress ?? currentFile.progress,
      error: 'error' in updates ? updates.error : currentFile.error,
    });

    const nextFiles = [...prev];
    nextFiles[fileIndex] = nextFile;
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
      inputId: inputId ?? '',
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
      onCancel,
    ],
  );

  return {
    contextValue,
    isDragging,
    setIsDragging,
    announcement,
  };
};
