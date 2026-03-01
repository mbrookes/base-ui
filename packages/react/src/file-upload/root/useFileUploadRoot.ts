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

const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const useFileUploadRoot = (params: UseFileUploadRootParameters) => {
  const {
    maxFiles = 10,
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
  } = params;

  const [files, setFiles] = React.useState<FileUploadRootExtendedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputId = useBaseUIId();
  const isInitialRender = React.useRef(true);

  // Cleanup object URLs to prevent memory leaks
  React.useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
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
      return `File too large (max ${formatBytes(maxSize)})`;
    }
    if (file.size < minSize) {
      return `File too small (min ${formatBytes(minSize)})`;
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
        return 'File type not accepted';
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
        setAnnouncement(`Cannot add files. Limit of ${maxFiles} reached.`);
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
          errors.push(`${file.name}: duplicate file`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          onFileReject?.(file, error);
          errors.push(`${file.name}: ${error}`);
        } else {
          existingKeys.add(fileKey);
          validFiles.push(
            Object.assign(file, {
              id: generateId(),
              preview: URL.createObjectURL(file),
              status: 'idle' as FileUploadRootFileStatus,
              progress: 0,
            }),
          );
        }
      });

      const successMsg =
        validFiles.length > 0
          ? `Added ${validFiles.length} file${validFiles.length !== 1 ? 's' : ''}.`
          : '';
      const errorMsg = errors.length > 0 ? ` ${errors.length} rejected: ${errors.join(', ')}` : '';

      setAnnouncement(`${successMsg}${errorMsg}`);

      return multiple ? [...prev, ...validFiles] : validFiles;
    });
  });

  const removeFile = useStableCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        setAnnouncement(`Removed file ${fileToRemove.name}`);
      }
      return prev.filter((f) => f.id !== id);
    });
  });

  const clearFiles = useStableCallback(() => {
    setFiles([]);
    setAnnouncement('All files removed');
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
      onCancel,
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
      onCancel,
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
