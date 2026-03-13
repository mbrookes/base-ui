'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
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
   * Function to control which files determine the visibility of the list and the
   * `state.files` value passed to the `className` callback.
   *
   * The list is hidden (returns `null`) when the filtered result is empty.
   * Note: this function does not automatically filter `children` — you must
   * independently filter the files rendered inside the list using the context.
   *
   * @example
   * ```tsx
   * // Hide the list unless there are error files
   * <FileUpload.PreviewList filter={(files) => files.filter(f => f.status === 'error')}>
   *   {/* children must also filter independently *\/}
   *   {files.filter(f => f.status === 'error').map(file => (
   *     <FileUpload.PreviewItem key={file.id} file={file}>{file.name}</FileUpload.PreviewItem>
   *   ))}
   * </FileUpload.PreviewList>
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
    const { children, filter, className, ...elementProps } = props;
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

    const element = useRenderElement('ul', props, {
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

    if (filteredFiles.length === 0) {
      return null;
    }

    return element;
  },
);

export namespace FileUploadPreviewList {
  export type State = FileUploadPreviewListState;
  export type Props = FileUploadPreviewListProps;
  export type Parameters = FileUploadPreviewListParameters;
}
