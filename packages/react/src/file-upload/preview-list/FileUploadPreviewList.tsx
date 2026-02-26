'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { useFileUploadContext } from '../root/FileUploadContext';

export interface FileUploadPreviewListState {}

export interface FileUploadPreviewListProps extends BaseUIComponentProps<
  'ul',
  FileUploadPreviewListState
> {}

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
 * @param children - PreviewItem components or other list content
 * @param className - CSS class name or function
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadPreviewList = React.forwardRef<HTMLUListElement, FileUploadPreviewListProps>(
  function FileUploadPreviewListComponent(props, ref) {
    const { children, className, ...other } = props;
    const { files } = useFileUploadContext();

    const resolvedClassName = resolveClassName(className, {});

    if (files.length === 0) {
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
}
