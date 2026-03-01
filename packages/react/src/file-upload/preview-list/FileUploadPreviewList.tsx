'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { useFileUploadContext } from '../root/FileUploadContext';
import type { FileUploadRoot } from '../root/FileUploadRoot';

export interface FileUploadPreviewListState {
  /**
   * The filtered files being displayed in the list.
   */
  files: FileUploadRoot.ExtendedFile[];
}

export interface FileUploadPreviewListParameters {
  /**
   * Function to filter which files should be displayed.
   * Receives the full list of files and should return the filtered list.
   * Useful for showing only uploading files, only errors, etc.
   *
   * @example
   * ```tsx
   * // Show only uploading files
   * <FileUpload.PreviewList filter={(files) => files.filter(f => f.status === 'uploading')}>
   *
   * // Show only errors
   * <FileUpload.PreviewList filter={(files) => files.filter(f => f.status === 'error')}>
   *
   * // Show files by status
   * <FileUpload.PreviewList filter={(files) => files.filter(f => ['uploading', 'error'].includes(f.status))}>
   * ```
   */
  filter?: ((files: FileUploadRoot.ExtendedFile[]) => FileUploadRoot.ExtendedFile[]) | undefined;
}

export interface FileUploadPreviewListProps
  extends BaseUIComponentProps<'ul', FileUploadPreviewListState>, FileUploadPreviewListParameters {}

/**
 * Container list for displaying uploaded files.
 *
 * The PreviewList component renders as an unordered list and automatically hides
 * itself when there are no files. It should contain PreviewItem components for
 * each file being managed by the Root component.
 *
 * @component
 * @example
 * ```tsx
 * <FileUpload.PreviewList>
 *   {files.map(file => (
 *     <FileUpload.PreviewItem key={file.id} file={file}>
 *       {file.name}
 *     </FileUpload.PreviewItem>
 *   ))}
 * </FileUpload.PreviewList>
 * ```
 *
 * @example
 * ```tsx
 * // Show only files with errors
 * <FileUpload.PreviewList filter={(files) => files.filter(f => f.status === 'error')}>
 *   {files.map(file => (
 *     <FileUpload.PreviewItem key={file.id} file={file}>
 *       {file.name} - {file.error}
 *     </FileUpload.PreviewItem>
 *   ))}
 * </FileUpload.PreviewList>
 * ```
 *
 * @param children - PreviewItem components or other list content
 * @param filter - Function to filter which files to display
 * @param className - CSS class name or function
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadPreviewList = React.forwardRef<HTMLUListElement, FileUploadPreviewListProps>(
  function FileUploadPreviewListComponent(props, ref) {
    const { children, filter, className, ...other } = props;
    const { files } = useFileUploadContext();

    const filteredFiles = React.useMemo(() => {
      return filter ? filter(files) : files;
    }, [files, filter]);

    const state: FileUploadPreviewListState = React.useMemo(
      () => ({
        files: filteredFiles,
      }),
      [filteredFiles],
    );

    const resolvedClassName = resolveClassName(className, state);

    if (filteredFiles.length === 0) {
      return null;
    }

    return (
      <ul ref={ref} className={resolvedClassName} {...other}>
        {children}
      </ul>
    );
  },
);

export namespace FileUploadPreviewList {
  export type State = FileUploadPreviewListState;
  export type Props = FileUploadPreviewListProps;
  export type Parameters = FileUploadPreviewListParameters;
}
