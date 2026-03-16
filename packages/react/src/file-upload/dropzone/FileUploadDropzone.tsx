'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { useFileUploadContext } from '../root/FileUploadContext';
import { fileUploadDropzoneStateAttributesMapping } from './stateAttributesMapping';

export interface FileUploadDropzoneState {
  /**
   * Whether files are being dragged over the dropzone.
   */
  dragging: boolean;
  /**
   * Whether the dropzone is disabled.
   */
  disabled: boolean;
}

export interface FileUploadDropzoneProps extends Omit<
  BaseUIComponentProps<'div', FileUploadDropzoneState>,
  'children'
> {
  // eslint-disable-next-line react/no-unused-prop-types -- false positive, used in useRenderElement children prop
  children?: React.ReactNode | ((state: { isDragging: boolean }) => React.ReactNode);
}

/**
 * Interactive drop target and file selection area.
 *
 * The Dropzone component provides a visual area where users can drag and drop files
 * or click to select files. It automatically handles drag events and integrates with
 * the Root component's file validation and state management.
 *
 * @component
 * @example
 * ```tsx
 * <FileUpload.Dropzone>
 *   {({ isDragging }) => (
 *     <div className={isDragging ? 'dragging' : 'idle'}>
 *       Drop files here or click to select
 *     </div>
 *   )}
 * </FileUpload.Dropzone>
 * ```
 *
 * @param children - Content to display, or a render function that receives `{ isDragging }`
 * @param className - CSS class name or function that receives `{ dragging, disabled }`
 * @param disabled - Whether the dropzone is disabled
 *
 * @see [File Upload Documentation](https://base-ui.com/react/components/file-upload)
 */
export const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzoneComponent(props, ref) {
    const { render, className, children, ...elementProps } = props;
    const { isDragging, disabled, openFileDialog } = useFileUploadContext();

    const state: FileUploadDropzoneState = React.useMemo(
      () => ({
        dragging: isDragging,
        disabled,
      }),
      [isDragging, disabled],
    );

    const handleClick = useStableCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      // Prevent opening dialog if clicking an interactive element inside
      const target = event.target as HTMLElement;
      const currentTarget = event.currentTarget as HTMLElement;
      const interactiveElement = target.closest(
        'button, a, input, textarea, select, [role="button"]',
      );
      // Only prevent if we clicked an interactive element that's not the dropzone itself
      if (interactiveElement && interactiveElement !== currentTarget) {
        return;
      }
      event.preventDefault();
      openFileDialog();
    });

    const handleKeyDown = useStableCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openFileDialog();
      }
    });

    return useRenderElement('div', props, {
      state,
      ref,
      props: [
        {
          'aria-disabled': state.disabled || undefined,
          'aria-label':
            elementProps['aria-label'] ??
            (elementProps['aria-labelledby'] == null
              ? 'Drop files here or click to select'
              : undefined),
          role: 'button',
          tabIndex: state.disabled ? -1 : 0,
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          children: typeof children === 'function' ? children({ isDragging }) : children,
        },
        elementProps,
      ],
      stateAttributesMapping: fileUploadDropzoneStateAttributesMapping,
    });
  },
);

export namespace FileUploadDropzone {
  export type State = FileUploadDropzoneState;
  export type Props = FileUploadDropzoneProps;
}
