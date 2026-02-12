'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import type { FileUploadRoot } from '../root/FileUploadRoot';
import { useFileUploadContext } from '../root/FileUploadContext';

export interface FileUploadPreviewItemContextValue {
  file: FileUploadRoot.ExtendedFile;
  onRemove: () => void;
}

export const FileUploadPreviewItemContext =
  React.createContext<FileUploadPreviewItemContextValue | null>(null);

export const useFileUploadPreviewItem = () => {
  const context = React.useContext(FileUploadPreviewItemContext);
  if (!context) {
    throw new Error('useFileUploadPreviewItem must be used within a FileUploadPreviewItem');
  }
  return context;
};

export namespace FileUploadPreviewItem {
  export interface State {}

  export interface Props extends BaseUIComponentProps<'li', State> {
    /**
     * The file to preview.
     */
    file: FileUploadRoot.ExtendedFile;
    children: React.ReactNode;
  }
}

export type FileUploadPreviewItemProps = FileUploadPreviewItem.Props;

/**
 * Individual preview item for an uploaded file.
 *
 * Documentation: [Base UI File Upload](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadPreviewItem = React.forwardRef<HTMLLIElement, FileUploadPreviewItemProps>(
  function FileUploadPreviewItemComponent(props, ref) {
    const { file, children, className, ...other } = props;
    const { removeFile } = useFileUploadContext();

    const contextValue = React.useMemo(
      () => ({
        file,
        onRemove: () => removeFile(file.id),
      }),
      [file, removeFile],
    );

    const resolvedClassName = resolveClassName(className, {});

    return (
      <FileUploadPreviewItemContext.Provider value={contextValue}>
        <li ref={ref} className={resolvedClassName} {...other}>
          {children}
        </li>
      </FileUploadPreviewItemContext.Provider>
    );
  },
);
