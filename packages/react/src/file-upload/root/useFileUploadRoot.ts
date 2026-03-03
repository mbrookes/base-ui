'use client';

import * as React from 'react';
import { useId as useBaseUIId } from '@base-ui/utils/useId';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type {
  FileUploadRootExtendedFile,
  FileUploadRootParameters,
  FileUploadRootFileStatus,
} from './FileUploadRoot';
import type { FileUploadContextValue } from './FileUploadContext';

type UseFileUploadRootParameters = FileUploadRootParameters;

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatBytes = (bytes: number, locale?: Intl.LocalesArgument) => {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = bytes / Math.pow(k, i);
  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${sizes[i]}`;
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
    onFilesChange,
    onFileReject,
    onCancel,
    onDuplicateFile,
    onRetry,
    onFilePause,
    onFileResume,
    locale,
  } = params;

  const getFileTooLargeMessage = useStableCallback((_file: File, maxSizeFormatted: string) => {
    return `File too large (max ${maxSizeFormatted})`;
  });

  const getFileTooSmallMessage = useStableCallback((_file: File, minSizeFormatted: string) => {
    return `File too small (min ${minSizeFormatted})`;
  });

  const getFileTypeNotAcceptedMessage = useStableCallback((_file: File) => {
    return 'File type not accepted';
  });

  const getMaxFilesReachedMessage = useStableCallback((maxFilesCount: number) => {
    return `Cannot add files. Limit of ${maxFilesCount} reached.`;
  });

  const getDuplicateFileMessage = useStableCallback((fileItem: File) => {
    return `${fileItem.name}: duplicate file`;
  });

  const getFilesAddedMessage = useStableCallback((count: number) => {
    return `Added ${count} file${count !== 1 ? 's' : ''}.`;
  });

  const getFilesRejectedMessage = useStableCallback((count: number, errors: string[]) => {
    return `${count} rejected: ${errors.join(', ')}`;
  });

  const getFileRemovedMessage = useStableCallback((fileItem: FileUploadRootExtendedFile) => {
    return `Removed file ${fileItem.name}`;
  });

  const getAllFilesRemovedMessage = useStableCallback(() => {
    return 'All files removed';
  });

  const getRetryingUploadMessage = useStableCallback((fileItem: FileUploadRootExtendedFile) => {
    return `Retrying upload for ${fileItem.name}`;
  });

  const getUploadCanceledMessage = useStableCallback((fileItem: FileUploadRootExtendedFile) => {
    return `Upload canceled for ${fileItem.name}`;
  });

  const [files, setFiles] = React.useState<FileUploadRootExtendedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const abortControllersRef = React.useRef<Map<string, AbortController>>(new Map());
  const inputId = useBaseUIId();
  const isInitialRender = React.useRef(true);

  // Cleanup object URLs and abort controllers to prevent memory leaks
  React.useEffect(() => {
    const controllers = abortControllersRef.current;
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, [files]);

  // Notify parent of changes
  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  const validateFile = useStableCallback((file: File): string | null => {
    const hasMaxSizeLimit = Number.isFinite(maxSize);

    if (hasMaxSizeLimit && file.size > maxSize) {
      return getFileTooLargeMessage(file, formatBytes(maxSize, locale));
    }
    if (file.size < minSize) {
      return getFileTooSmallMessage(file, formatBytes(minSize, locale));
    }

    if (accept && accept !== '*') {
      const acceptTypes = accept.split(',').map((t) => t.trim());
      const isAccepted = acceptTypes.some((acceptType) => {
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

      if (!isAccepted) {
        return getFileTypeNotAcceptedMessage(file);
      }
    }

    // Custom validation
    if (validator) {
      const customError = validator(file);
      if (customError) {
        return customError;
      }
    }

    return null;
  });

  const addFiles = useStableCallback((newFiles: File[]) => {
    if (disabled) {
      return;
    }

    setFiles((prev) => {
      const remainingSlots = maxFiles - prev.length;
      if (remainingSlots <= 0) {
        setAnnouncement(getMaxFilesReachedMessage(maxFiles));
        return prev;
      }

      const candidates = multiple ? newFiles.slice(0, remainingSlots) : [newFiles[0]];
      const validFiles: FileUploadRootExtendedFile[] = [];
      const errors: string[] = [];

      const existingKeys = new Set(
        prev.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
      );

      candidates.forEach((file) => {
        const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
        if (existingKeys.has(fileKey)) {
          onDuplicateFile?.(file);
          errors.push(getDuplicateFileMessage(file));
          return;
        }

        const error = validateFile(file);
        if (error) {
          onFileReject?.(file, error);
          errors.push(`${file.name}: ${error}`);
        } else {
          existingKeys.add(fileKey);
          // Create an object with all File properties plus our extended properties
          const extendedFile: FileUploadRootExtendedFile = {
            // Copy File properties
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            webkitRelativePath: file.webkitRelativePath,
            // Extended properties
            id: generateId(),
            preview: URL.createObjectURL(file),
            status: 'idle',
            progress: 0,
          } as any; // Cast to any to allow File methods
          validFiles.push(extendedFile);
        }
      });

      const successMsg = validFiles.length > 0 ? getFilesAddedMessage(validFiles.length) : '';
      const errorMsg = errors.length > 0 ? getFilesRejectedMessage(errors.length, errors) : '';

      setAnnouncement(`${successMsg}${errorMsg}`);

      return multiple ? [...prev, ...validFiles] : validFiles;
    });
  });

  const removeFile = useStableCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        setAnnouncement(getFileRemovedMessage(fileToRemove));
      }
      return prev.filter((f) => f.id !== id);
    });
  });

  const clearFiles = useStableCallback(() => {
    setFiles([]);
    setAnnouncement(getAllFilesRemovedMessage());
  });

  const retryFile = useStableCallback((id: string) => {
    setFiles((prev) => {
      return prev.map((file) => {
        if (file.id === id && file.status === 'error') {
          onRetry?.(file);
          setAnnouncement(getRetryingUploadMessage(file));
          return {
            ...file,
            status: 'idle' as FileUploadRootFileStatus,
            progress: 0,
            error: undefined,
          };
        }
        return file;
      });
    });
  });

  const abortUpload = useStableCallback((id: string) => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(id);
      setFiles((prev) => {
        return prev.map((file) => {
          if (file.id === id && file.status === 'uploading') {
            setAnnouncement(getUploadCanceledMessage(file));
            return {
              ...file,
              status: 'error' as FileUploadRootFileStatus,
              error: 'Upload canceled',
            };
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
    setFiles((prev) => {
      return prev.map((file) => {
        if (file.id === id && file.status === 'uploading') {
          onFilePause?.(file);
          return {
            ...file,
            status: 'paused' as FileUploadRootFileStatus,
            isPaused: true,
          };
        }
        return file;
      });
    });
  });

  const resumeFile = useStableCallback((id: string) => {
    setFiles((prev) => {
      return prev.map((file) => {
        if (file.id === id && file.status === 'paused') {
          onFileResume?.(file);
          return {
            ...file,
            status: 'uploading' as FileUploadRootFileStatus,
            isPaused: false,
          };
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
      setFiles,
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
