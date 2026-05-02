'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { PaginationRootContext } from './PaginationRootContext';
import type { PaginationRootContextValue } from './PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';
import { usePagination } from '../usePagination';
import type { UsePaginationItem } from '../usePagination';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { REASONS } from '../../internals/reasons';

function defaultGetItemAriaLabel(
  type: UsePaginationItem['type'],
  page: number | null,
  selected: boolean,
): string | undefined {
  if (type === 'page') {
    return selected ? `page ${page}, current page` : `Go to page ${page}`;
  }
  if (type === 'first') return 'Go to first page';
  if (type === 'last') return 'Go to last page';
  if (type === 'previous') return 'Go to previous page';
  if (type === 'next') return 'Go to next page';
  return undefined;
}

/**
 * Groups all parts of the pagination component and manages page state.
 * Renders a `<nav>` element.
 */
export const PaginationRoot = React.forwardRef(function PaginationRoot(
  componentProps: PaginationRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const {
    page: pageProp,
    defaultPage = 1,
    count = 1,
    disabled = false,
    onPageChange,
    boundaryCount = 1,
    siblingCount = 1,
    showFirstButton = false,
    showLastButton = false,
    hidePrevButton = false,
    hideNextButton = false,
    getItemAriaLabel = defaultGetItemAriaLabel,
    render,
    className,
    'aria-label': ariaLabel = 'pagination navigation',
    style,
    ...elementProps
  } = componentProps;
  // `render`, `className`, `style` are intentionally destructured but handled by componentProps in useRenderElement
  void render;
  void className;

  const { page, items } = usePagination({
    count,
    page: pageProp,
    defaultPage,
    onPageChange,
    boundaryCount,
    siblingCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
  });

  const state: PaginationRoot.State = { page, count, disabled };

  const contextValue: PaginationRootContextValue = React.useMemo(
    () => ({ page, count, disabled, items, getItemAriaLabel }),
    [page, count, disabled, items, getItemAriaLabel],
  );

  const element = useRenderElement('nav', componentProps, {
    state,
    ref: forwardedRef,
    props: [{ 'aria-label': ariaLabel }, elementProps],
  });

  return (
    <PaginationRootContext.Provider value={contextValue}>{element}</PaginationRootContext.Provider>
  );
});

export interface PaginationRootState {
  /**
   * The current page.
   */
  page: number;
  /**
   * The total number of pages.
   */
  count: number;
  /**
   * Whether the pagination is disabled.
   */
  disabled: boolean;
}

export interface PaginationRootProps extends BaseUIComponentProps<'nav', PaginationRootState> {
  /**
   * The total number of pages.
   * @default 1
   */
  count?: number | undefined;
  /**
   * The current page (controlled).
   */
  page?: number | undefined;
  /**
   * The default page when uncontrolled.
   * @default 1
   */
  defaultPage?: number | undefined;
  /**
   * Callback fired when the page changes.
   */
  onPageChange?: ((page: number, details: PaginationRoot.ChangeEventDetails) => void) | undefined;
  /**
   * Number of pages to show at the start and end of the range.
   * @default 1
   */
  boundaryCount?: number | undefined;
  /**
   * Number of sibling pages around the current page.
   * @default 1
   */
  siblingCount?: number | undefined;
  /**
   * Whether to show a button for the first page.
   * @default false
   */
  showFirstButton?: boolean | undefined;
  /**
   * Whether to show a button for the last page.
   * @default false
   */
  showLastButton?: boolean | undefined;
  /**
   * Whether to hide the previous page button.
   * @default false
   */
  hidePrevButton?: boolean | undefined;
  /**
   * Whether to hide the next page button.
   * @default false
   */
  hideNextButton?: boolean | undefined;
  /**
   * Whether all pagination items are disabled.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Accepts a function which returns an accessible label for a pagination item.
   */
  getItemAriaLabel?:
    | ((
        type: UsePaginationItem['type'],
        page: number | null,
        selected: boolean,
      ) => string | undefined)
    | undefined;
}

export namespace PaginationRoot {
  export type State = PaginationRootState;
  export type Props = PaginationRootProps;
  export type ChangeEventDetails = BaseUIChangeEventDetails<typeof REASONS.itemPress>;
  export type ChangeEventReason = typeof REASONS.itemPress;
}
