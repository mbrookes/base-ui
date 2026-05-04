'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import { PaginationEllipsis } from '../ellipsis/PaginationEllipsis';
import { computePageRange } from '../utils/computePageRange';

function defaultGetAriaLabel(p: number, isCurrent: boolean): string {
  return isCurrent ? `page ${p}` : `Go to page ${p}`;
}

/**
 * Renders the sequence of page buttons and ellipsis elements based on the
 * current page, total count, and windowing configuration.
 * Renders no element itself — outputs a React fragment.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export function PaginationPages(componentProps: PaginationPages.Props): React.ReactElement {
  const { siblingCount = 1, boundaryCount = 1, getAriaLabel = defaultGetAriaLabel } = componentProps;

  const { page, count, disabled, setPage } = usePaginationRootContext();

  const { startPages, middlePages, endPages, showStartEllipsis, showEndEllipsis } =
    computePageRange(page, count, siblingCount, boundaryCount);

  const handlePageClick = useStableCallback((nextPage: number, event: React.MouseEvent) => {
    setPage(nextPage, event);
  });

  function renderPageButton(p: number) {
    const selected = p === page;
    return (
      <li key={`page-${p}`}>
        <button
          type="button"
          disabled={disabled}
          aria-current={selected ? 'page' : undefined}
          aria-label={getAriaLabel(p, selected)}
          {...(selected && { 'data-selected': '' })}
          {...(disabled && { 'data-disabled': '' })}
          onClick={(event) => handlePageClick(p, event)}
        >
          {p}
        </button>
      </li>
    );
  }

  return (
    <React.Fragment>
      {startPages.map(renderPageButton)}
      {showStartEllipsis && <PaginationEllipsis key="start-ellipsis" />}
      {middlePages.map(renderPageButton)}
      {showEndEllipsis && <PaginationEllipsis key="end-ellipsis" />}
      {endPages.map(renderPageButton)}
    </React.Fragment>
  );
}

export interface PaginationPagesProps {
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
  /**
   * Returns the accessible label for a page button.
   * @param page - The page number.
   * @param isCurrent - Whether the page is the currently active page.
   * @default (page, isCurrent) => isCurrent ? `page ${page}` : `Go to page ${page}`
   */
  getAriaLabel?: ((page: number, isCurrent: boolean) => string) | undefined;
}

export namespace PaginationPages {
  export type Props = PaginationPagesProps;
}
