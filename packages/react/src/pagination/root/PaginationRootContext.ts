import * as React from 'react';

export interface PaginationRootContextValue {
  page: number;
  count: number;
  disabled: boolean;
  setPage: (page: number, event: React.MouseEvent) => void;
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
