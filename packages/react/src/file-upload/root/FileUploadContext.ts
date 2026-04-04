'use client';

import * as React from 'react';
import type { FileUploadRoot } from './FileUploadRoot';

/**
 * Context value provided by FileUploadRoot to all child components.
 *
 * Contains file state, configuration, and methods for managing uploads.
 */
export interface FileUploadContextValue {
  /** Array of files currently managed by the upload component */
  files: FileUploadRoot.ExtendedFile[];
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
  /** Whether directories can be selected */
  directory: boolean;
  /** Whether the component is disabled */
  disabled: boolean;
  /** Unique identifier for the hidden input element */
  inputId: string;
  /** Remove a file by ID */
  removeFile: (id: string) => void;
  /** Clear all files */
  clearFiles: () => void;
  /** Add new files with validation */
  addFiles: (files: File[], event?: Event) => void;
  /** Update a file's upload metadata without replacing the full files array */
  updateFile: (id: string, updates: FileUploadRoot.FileUpdates) => void;
  /** Callback fired when the file dialog is canceled */
  onCancel?: (() => void) | undefined;
  /** Trigger the file selection dialog */
  openFileDialog: () => void;
  /** Internal: register the hidden input element used by `FileUpload.HiddenInput` */
  setInputElement: (node: HTMLInputElement | null) => void;
  /** Internal: change handler used by `FileUpload.HiddenInput` */
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadContext = React.createContext<FileUploadContextValue | undefined>(undefined);

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
 *   const { files, removeFile } = useFileUploadContext();
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
  if (context === undefined) {
    throw new Error(
      'Base UI: FileUploadContext is missing. File upload parts must be placed within <FileUpload.Root>.',
    );
  }

  return context;
}
