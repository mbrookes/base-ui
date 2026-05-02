'use client';
import { usePaginationRootContext } from './root/PaginationRootContext';
import { computePageRange } from './utils/computePageRange';
import type { ComputePageRangeResult } from './utils/computePageRange';

export interface UsePaginationParameters {
  /**
   * Number of pages to always show at the start and end of the list.
   * @default 1
   */
  boundaryCount?: number | undefined;
  /**
   * Number of pages to show on each side of the current page.
   * @default 1
   */
  siblingCount?: number | undefined;
}

export interface UsePaginationReturnValue extends ComputePageRangeResult {
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
  /**
   * Navigate to the given page. Must be called from within a React event handler.
   */
  setPage: (page: number, event: React.MouseEvent) => void;
}

/**
 * Reads the current pagination state from context and returns page range
 * data useful for building custom pagination UIs inside `<Pagination.Root>`.
 *
 * Must be called inside a component rendered within `<Pagination.Root>`.
 */
export function usePagination(params: UsePaginationParameters = {}): UsePaginationReturnValue {
  const { siblingCount = 1, boundaryCount = 1 } = params;
  const { page, count, disabled, setPage } = usePaginationRootContext();
  const range = computePageRange(page, count, siblingCount, boundaryCount);
  return { page, count, disabled, setPage, ...range };
}
