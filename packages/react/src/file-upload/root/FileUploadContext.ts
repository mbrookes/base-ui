'use client';

import * as React from 'react';
import { FileUploadRoot } from './FileUploadRoot';

export interface FileUploadContextValue {
  files: FileUploadRoot.ExtendedFile[];
  isDragging: boolean;
  maxFiles: number;
  maxSize: number;
  minSize: number;
  accept: string;
  multiple: boolean;
  disabled: boolean;
  inputId: string;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  addFiles: (files: File[]) => void;
  openFileDialog: () => void;
  setFiles: React.Dispatch<React.SetStateAction<FileUploadRoot.ExtendedFile[]>>;
  registerInput: (node: HTMLInputElement | null) => void;
}

export const FileUploadContext = React.createContext<FileUploadContextValue | null>(null);

export const useFileUploadContext = () => {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error('FileUpload components must be used within a FileUploadRoot');
  }
  return context;
};
