'use client';

import * as React from 'react';
import { useId as useBaseUIId } from '@base-ui/utils/useId';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { FileUploadRoot } from './FileUploadRoot';
import type { FileUploadContextValue } from './FileUploadContext';

interface UseFileUploadRootParameters {
  maxFiles?: number | undefined;
  maxSize?: number | undefined;
  minSize?: number | undefined;
  accept?: string | undefined;
  multiple?: boolean | undefined;
  disabled?: boolean | undefined;
  onFilesChange?: ((files: FileUploadRoot.ExtendedFile[]) => void) | undefined;
  onFileReject?: ((file: File, reason: string) => void) | undefined;
}

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
    multiple = true,
    disabled = false,
    onFilesChange,
    onFileReject,
  } = params;

  const [files, setFiles] = React.useState<FileUploadRoot.ExtendedFile[]>([]);
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

    if (
      accept &&
      accept !== '*' &&
      !accept.split(',').some((acceptType) => {
        const trimmedType = acceptType.trim();
        if (trimmedType === '*') {
          return true;
        }
        if (trimmedType.endsWith('/*')) {
          // e.g., "image/*" matches "image/png"
          const prefix = trimmedType.slice(0, -2);
          return file.type.startsWith(prefix);
        }
        return file.type === trimmedType;
      })
    ) {
      return 'File type not accepted';
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
      const validFiles: FileUploadRoot.ExtendedFile[] = [];
      const errors: string[] = [];

      candidates.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          onFileReject?.(file, error);
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(
            Object.assign(file, {
              id: generateId(),
              preview: URL.createObjectURL(file),
              status: 'idle' as FileUploadRoot.FileStatus,
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
      disabled,
      inputId: inputId ?? '',
      removeFile,
      clearFiles,
      addFiles,
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
      disabled,
      inputId,
      removeFile,
      clearFiles,
      addFiles,
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
