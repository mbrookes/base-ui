'use client';
import * as React from 'react';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import { PaginationItem } from '../item/PaginationItem';
import { PaginationEllipsis } from '../ellipsis/PaginationEllipsis';

/**
 * Renders the list of pagination item components from the pagination state.
 * Renders no element itself — outputs a React fragment of items.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export function PaginationItems(_props: PaginationItems.Props): React.ReactElement {
  const { items } = usePaginationRootContext();

  return (
    <React.Fragment>
      {items.map((item) => {
        const key = item.type === 'page' ? `page-${item.page}` : item.type;

        if (item.type === 'start-ellipsis' || item.type === 'end-ellipsis') {
          return <PaginationEllipsis key={key} />;
        }

        return (
          <PaginationItem
            key={key}
            type={item.type}
            page={item.page}
            selected={item.selected}
            disabled={item.disabled}
            onPress={
              item.onClick as ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined
            }
          />
        );
      })}
    </React.Fragment>
  );
}

export type PaginationItemsState = {};

export interface PaginationItemsProps {}

export namespace PaginationItems {
  export type State = PaginationItemsState;
  export type Props = PaginationItemsProps;
}
