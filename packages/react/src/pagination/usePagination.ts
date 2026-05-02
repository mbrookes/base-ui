'use client';
import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails';
import { REASONS } from '../internals/reasons';

export type UsePaginationItemType =
  | 'page'
  | 'first'
  | 'last'
  | 'next'
  | 'previous'
  | 'start-ellipsis'
  | 'end-ellipsis';

export interface UsePaginationItem {
  /**
   * The type of pagination item.
   */
  type: UsePaginationItemType;
  /**
   * The page number this item represents. `null` for non-page items.
   */
  page: number | null;
  /**
   * Whether this item represents the currently selected page.
   */
  selected: boolean;
  /**
   * Whether this item is disabled.
   */
  disabled: boolean;
  /**
   * Click handler for this item. `undefined` for ellipsis items.
   */
  onClick: ((event: React.MouseEvent) => void) | undefined;
}

export interface UsePaginationProps {
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
  onPageChange?: ((page: number, details: UsePagination.ChangeEventDetails) => void) | undefined;
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
}

export interface UsePaginationResult {
  /**
   * The current resolved page.
   */
  page: number;
  /**
   * The list of pagination items to render.
   */
  items: UsePaginationItem[];
}

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

export function usePagination(props: UsePaginationProps): UsePaginationResult {
  const {
    count = 1,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    boundaryCount = 1,
    siblingCount = 1,
    showFirstButton = false,
    showLastButton = false,
    hidePrevButton = false,
    hideNextButton = false,
    disabled = false,
  } = props;

  const [page, setPage] = useControlled({
    controlled: pageProp,
    default: defaultPage,
    name: 'Pagination',
    state: 'page',
  });

  const resolvedPage = page ?? 1;

  const handleClick = React.useCallback(
    (nextPage: number, event: React.MouseEvent) => {
      const details = createChangeEventDetails(REASONS.itemPress, event.nativeEvent as MouseEvent);
      onPageChange?.(nextPage, details);
      if (!details.isCanceled) {
        setPage(nextPage);
      }
    },
    [onPageChange, setPage],
  );

  // Adapted from MUI usePagination
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(resolvedPage - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(resolvedPage + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  const itemList: Array<UsePaginationItemType | number> = [
    ...(showFirstButton ? ['first' as const] : []),
    ...(hidePrevButton ? [] : ['previous' as const]),
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['start-ellipsis' as const]
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['end-ellipsis' as const]
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
    ...(hideNextButton ? [] : ['next' as const]),
    ...(showLastButton ? ['last' as const] : []),
  ];

  const buttonPage = (type: UsePaginationItemType): number | null => {
    switch (type) {
      case 'first':
        return 1;
      case 'previous':
        return resolvedPage - 1;
      case 'next':
        return resolvedPage + 1;
      case 'last':
        return count;
      default:
        return null;
    }
  };

  const items: UsePaginationItem[] = itemList.map((item) => {
    if (typeof item === 'number') {
      return {
        type: 'page',
        page: item,
        selected: item === resolvedPage,
        disabled: disabled || false,
        onClick: (event: React.MouseEvent) => handleClick(item, event),
      };
    }

    const page = buttonPage(item);

    if (item === 'start-ellipsis' || item === 'end-ellipsis') {
      return {
        type: item,
        page: null,
        selected: false,
        disabled: true,
        onClick: undefined,
      };
    }

    return {
      type: item,
      page,
      selected: false,
      disabled:
        disabled ||
        (item === 'next' || item === 'last' ? resolvedPage >= count : resolvedPage <= 1),
      onClick: page !== null ? (event: React.MouseEvent) => handleClick(page, event) : undefined,
    };
  });

  return { page: resolvedPage, items };
}

export namespace UsePagination {
  export type ChangeEventDetails = ReturnType<typeof createChangeEventDetails<'item-press'>>;
  export type ChangeEventReason = typeof REASONS.itemPress;
}
