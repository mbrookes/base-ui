'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { resolveClassName } from '../../utils/resolveClassName';
import type { FileUploadRoot } from '../root/FileUploadRoot';
import { useFileUploadContext } from '../root/FileUploadContext';

export interface FileUploadPreviewItemContextValue {
  file: FileUploadRoot.ExtendedFile;
  onRemove: () => void;
}

export interface FileUploadPreviewItemState {}

export const FileUploadPreviewItemContext =
  React.createContext<FileUploadPreviewItemContextValue | undefined>(undefined);

/**
 * Hook to access file preview context within PreviewItem children.
 *
 * Provides access to the current file object and onRemove callback for removing
 * the file from the upload list.
 *
 * @throws Error if used outside of a FileUploadPreviewItem component
 * @returns Object containing `file` and `onRemove` callback
 *
 * @example
 * ```tsx
 * function FilePreview() {
 *   const { file, onRemove } = useFileUploadPreviewItem();
 *   return (
 *     <div>
 *       <span>{file.name}</span>
 *       <button onClick={onRemove}>Remove</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export function useFileUploadPreviewItem(): FileUploadPreviewItemContextValue {
  const context = React.useContext(FileUploadPreviewItemContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: FileUploadPreviewItemContext is missing. File upload preview parts must be placed within <FileUpload.PreviewItem>.',
    );
  }

  return context;
}

export interface FileUploadPreviewItemProps extends BaseUIComponentProps<
  'li',
  FileUploadPreviewItemState
> {
  /**
   * The file to preview.
   */
  file: FileUploadRoot.ExtendedFile;
  children: React.ReactNode;
}

/**
 * Individual preview item for an uploaded file.
 *
 * The PreviewItem component renders a list item that displays a single file
 * and provides context for accessing the file object and remove functionality.
 * Use the `useFileUploadPreviewItem` hook in children to access file details
 * and the remove callback.
 *
 * @component
 * @example
 * ```tsx
 * function FilePreview() {
 *   const { file, onRemove } = useFileUploadPreviewItem();
 *   return (
 *     <div>
 *       <img src={file.preview} alt={file.name} />
 *       <span>{file.name}</span>
 *       <button onClick={onRemove}>Remove</button>
 *     </div>
 *   );
 * }
 *
 * <FileUpload.PreviewList>
 *   {files.map(file => (
 *     <FileUpload.PreviewItem key={file.id} file={file}>
 *       <FilePreview />
 *     </FileUpload.PreviewItem>
 *   ))}
 * </FileUpload.PreviewList>
 * ```
 *
 * @param file - The file object to preview (ExtendedFile from Root)
 * @param children - Content to display inside the list item
 * @param className - CSS class name or function
 *
 * @see useFileUploadPreviewItem - Hook for accessing file context
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadPreviewItem = React.forwardRef<HTMLLIElement, FileUploadPreviewItemProps>(
  function FileUploadPreviewItemComponent(props, ref) {
    const { file, children, className, ...elementProps } = props;
    const { removeFile } = useFileUploadContext();

    const state: FileUploadPreviewItemState = React.useMemo(() => ({}), []);

    const contextValue = React.useMemo(
      () => ({
        file,
        onRemove: () => removeFile(file.id),
      }),
      [file, removeFile],
    );

    const resolvedClassName = resolveClassName(className, {});

    const element = useRenderElement('li', props, {
      state,
      ref,
      props: [
        {
          className: resolvedClassName,
          children,
        },
        elementProps,
      ],
    });

    return <FileUploadPreviewItemContext.Provider value={contextValue}>{element}</FileUploadPreviewItemContext.Provider>;
  },
);

export namespace FileUploadPreviewItem {
  export type State = FileUploadPreviewItemState;
  export type Props = FileUploadPreviewItemProps;
}
