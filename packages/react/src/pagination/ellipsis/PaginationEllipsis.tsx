'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * A non-interactive element indicating skipped pages.
 * Renders a `<li>` element.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationEllipsis = React.forwardRef(function PaginationEllipsis(
  componentProps: PaginationEllipsis.Props,
  forwardedRef: React.ForwardedRef<HTMLLIElement>,
) {
  const { render, className, children, style, ...elementProps } = componentProps;

  const state: PaginationEllipsis.State = {};

  return useRenderElement('li', componentProps, {
    state,
    ref: forwardedRef,
    props: [{ children: children ?? '…' }, elementProps],
  });
});

export type PaginationEllipsisState = {};

export interface PaginationEllipsisProps extends BaseUIComponentProps<
  'li',
  PaginationEllipsisState
> {}

export namespace PaginationEllipsis {
  export type State = PaginationEllipsisState;
  export type Props = PaginationEllipsisProps;
}
