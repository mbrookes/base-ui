'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * Contains the list of pagination items.
 * Renders a `<ul>` element.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationList = React.forwardRef(function PaginationList(
  componentProps: PaginationList.Props,
  forwardedRef: React.ForwardedRef<HTMLUListElement>,
) {
  const { render, className, style, ...elementProps } = componentProps;

  const state: PaginationList.State = {};

  return useRenderElement('ul', componentProps, {
    state,
    ref: forwardedRef,
    props: [elementProps],
  });
});

export type PaginationListState = {};

export interface PaginationListProps extends BaseUIComponentProps<'ul', PaginationListState> {}

export namespace PaginationList {
  export type State = PaginationListState;
  export type Props = PaginationListProps;
}
