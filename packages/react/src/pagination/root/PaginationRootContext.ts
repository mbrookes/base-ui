import * as React from 'react';
import type { UsePaginationItem } from '../usePagination';

export interface PaginationRootContextValue {
  page: number;
  count: number;
  disabled: boolean;
  items: UsePaginationItem[];
  getItemAriaLabel: (
    type: UsePaginationItem['type'],
    page: number | null,
    selected: boolean,
  ) => string | undefined;
}

export const PaginationRootContext = React.createContext<PaginationRootContextValue | undefined>(
  undefined,
);

if (process.env.NODE_ENV !== 'production') {
  PaginationRootContext.displayName = 'PaginationRootContext';
}

export function usePaginationRootContext(): PaginationRootContextValue {
  const context = React.useContext(PaginationRootContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: PaginationRootContext is missing. ' +
        'Pagination parts must be placed within <Pagination.Root>.',
    );
  }
  return context;
}
