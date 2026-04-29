'use client';

import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';

export interface FileUploadFileSizeState {}

export interface FileUploadFileSizeProps
  extends BaseUIComponentProps<'span', FileUploadFileSizeState> {
  /**
   * The file size in bytes to format.
   */
  bytes: number | undefined;
  /**
   * The locale used by `Intl.NumberFormat` when formatting the value.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument | undefined;
}

function formatBytes(bytes: number | undefined, locale: Intl.LocalesArgument | undefined): string {
  if (bytes === undefined || bytes === null) {
    return 'Unknown';
  }
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return `${formatter.format(value)} ${sizes[i]}`;
}

/**
 * Renders the formatted file size for a given byte count.
 *
 * @component
 * @example
 * ```tsx
 * {files.map((file) => (
 *   <li key={file.id}>
 *     {file.name}
 *     <FileUpload.FileSize bytes={file.size} />
 *   </li>
 * ))}
 * ```
 *
 * @param bytes - The file size in bytes to format
 * @param locale - Locale for number formatting (default: runtime locale)
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadFileSize = React.forwardRef(function FileUploadFileSize(
  componentProps: FileUploadFileSizeProps,
  ref: React.ForwardedRef<HTMLSpanElement>,
) {
  const { bytes, locale, render, className, style, ...elementProps } = componentProps;

  const formatted = formatBytes(bytes, locale);

  return useRenderElement('span', componentProps, {
    state: {},
    ref,
    props: [{ children: formatted }, elementProps],
  });
});

export namespace FileUploadFileSize {
  export type State = FileUploadFileSizeState;
  export type Props = FileUploadFileSizeProps;
}
