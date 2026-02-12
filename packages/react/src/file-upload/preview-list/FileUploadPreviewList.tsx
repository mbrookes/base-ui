'use client';

import * as React from 'react';
import type { BaseUIComponentProps } from '../../utils/types';
import { resolveClassName } from '../../utils/resolveClassName';
import { useFileUploadContext } from '../root/FileUploadContext';

export namespace FileUploadPreviewList {
  export interface State {}

  export interface Props extends BaseUIComponentProps<'ul', State> {}
}

export type FileUploadPreviewListProps = FileUploadPreviewList.Props;

/**
 * Container for displaying the list of uploaded files.
 *
 * Documentation: [Base UI File Upload](https://base-ui.com/react/components/file-upload)
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
