'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { useFileUploadContext } from '../root/FileUploadContext';
import type { FileUploadRoot } from '../root/FileUploadRoot';
import { fileUploadPreviewListStateAttributesMapping } from './stateAttributesMapping';

export interface FileUploadPreviewListState {
  /**
   * The filtered files being displayed in the list.
   */
  files: FileUploadRoot.ExtendedFile[];
  /**
   * Whether there are no files in the list.
   */
  empty: boolean;
}

export interface FileUploadPreviewListParameters {
  /**
   * Function to control which files determine the `data-empty` state and the
   * `state.files` value passed to the `className` callback.
   *
   * The list receives the `data-empty` attribute when the filtered result is empty.
   * Note: this function does not automatically filter `children` — you must
   * independently filter the files rendered inside the list using the context.
   *
   * @example
   * ```tsx
   * // Show data-empty unless there are error files
   * <FileUpload.PreviewList filter={(files) => files.filter(f => f.status === 'error')}>
   *   {/* children must also filter independently *\/}
   *   {files.filter(f => f.status === 'error').map(file => (
   *     <FileUpload.PreviewItem key={file.id} file={file}>{file.name}</FileUpload.PreviewItem>
   *   ))}
   * </FileUpload.PreviewList>
   * ```
   */
  // eslint-disable-next-line react/no-unused-prop-types -- false positive, used in component logic
  filter?: ((files: FileUploadRoot.ExtendedFile[]) => FileUploadRoot.ExtendedFile[]) | undefined;
}

export interface FileUploadPreviewListProps
  extends BaseUIComponentProps<'ul', FileUploadPreviewListState>, FileUploadPreviewListParameters {}

/**
 * Container list for displaying uploaded files.
 *
 * The PreviewList component renders as an unordered list and adds a `data-empty`
 * attribute when there are no files. It should contain PreviewItem components for
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
        empty: filteredFiles.length === 0,
      }),
      [filteredFiles],
    );

    return useRenderElement('ul', props, {
      state,
      ref,
      props: [
        {
          children,
        },
        elementProps,
      ],
      stateAttributesMapping: fileUploadPreviewListStateAttributesMapping,
    });
  },
);

export namespace FileUploadPreviewList {
  export type State = FileUploadPreviewListState;
  export type Props = FileUploadPreviewListProps;
  export type Parameters = FileUploadPreviewListParameters;
}
