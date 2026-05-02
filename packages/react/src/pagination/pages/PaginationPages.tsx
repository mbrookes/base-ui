'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import { PaginationEllipsis } from '../ellipsis/PaginationEllipsis';
import { computePageRange } from '../utils/computePageRange';

/**
 * Renders the sequence of page buttons and ellipsis elements based on the
 * current page, total count, and windowing configuration.
 * Renders no element itself — outputs a React fragment.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export function PaginationPages(componentProps: PaginationPages.Props): React.ReactElement {
  const { siblingCount = 1, boundaryCount = 1 } = componentProps;

  const { page, count, disabled, setPage } = usePaginationRootContext();

  const { startPages, middlePages, endPages, showStartEllipsis, showEndEllipsis } =
    computePageRange(page, count, siblingCount, boundaryCount);

  const handlePageClick = useStableCallback((nextPage: number, event: React.MouseEvent) => {
    setPage(nextPage, event);
  });

  function renderPageButton(p: number) {
    const selected = p === page;
    return (
      <li
        key={`page-${p}`}
        {...(selected && { 'data-selected': '' })}
        {...(disabled && { 'data-disabled': '' })}
      >
        <button
          type="button"
          disabled={disabled}
          aria-current={selected ? 'page' : undefined}
          aria-label={selected ? `page ${p}, current page` : `Go to page ${p}`}
          onClick={(event) => handlePageClick(p, event)}
          tabIndex={disabled ? -1 : 0}
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
}

export namespace PaginationPages {
  export type Props = PaginationPagesProps;
}
