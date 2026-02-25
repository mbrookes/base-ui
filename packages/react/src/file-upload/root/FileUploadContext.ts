'use client';

import * as React from 'react';
import { FileUploadRoot } from './FileUploadRoot';

/**
 * Context value provided by FileUploadRoot to all child components.
 *
 * Contains file state, configuration, and methods for managing uploads.
 */
export interface FileUploadContextValue {
  /** Array of files currently managed by the upload component */
  files: FileUploadRoot.ExtendedFile[];
  /** Whether files are currently being dragged over a dropzone */
  isDragging: boolean;
  /** Maximum number of files allowed */
  maxFiles: number;
  /** Maximum file size in bytes */
  maxSize: number;
  /** Minimum file size in bytes */
  minSize: number;
  /** Accepted file types */
  accept: string;
  /** Whether multiple files can be selected */
  multiple: boolean;
  /** Whether the component is disabled */
  disabled: boolean;
  /** Unique identifier for the hidden input element */
  inputId: string;
  /** Remove a file by ID */
  removeFile: (id: string) => void;
  /** Clear all files */
  clearFiles: () => void;
  /** Add new files with validation */
  addFiles: (files: File[]) => void;
  /** Callback fired when the file dialog is canceled */
  onCancel?: () => void;
  /** Trigger the file selection dialog */
  openFileDialog: () => void;
  /** Directly set files state (for advanced use cases) */
  setFiles: React.Dispatch<React.SetStateAction<FileUploadRoot.ExtendedFile[]>>;
  /** Register the hidden file input element */
  registerInput: (node: HTMLInputElement | null) => void;
}

export const FileUploadContext = React.createContext<FileUploadContextValue | null>(null);

/**
 * Hook to access FileUpload context within child components.
 *
 * Provides access to file state and methods for managing file uploads.
 * Must be used within a FileUploadRoot component.
 *
 * @throws Error if used outside of a FileUploadRoot component
 * @returns FileUploadContextValue object with file state and methods
 *
 * @example
 * ```tsx
 * function CustomUploadUI() {
 *   const { files, addFiles, removeFile, isDragging } = useFileUploadContext();
 *   return (
 *     <div>
 *       {files.map(file => (
 *         <div key={file.id}>
 *           {file.name}
 *           <button onClick={() => removeFile(file.id)}>Remove</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export function useFileUploadContext(): FileUploadContextValue {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUploadContext must be used within a FileUploadRoot');
  }
  return context;
}
