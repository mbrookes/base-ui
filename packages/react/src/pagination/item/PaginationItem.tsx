'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';
import type { UsePaginationItemType } from '../usePagination';

type PaginationItemBaseProps = Omit<BaseUIComponentProps<'li', PaginationItemState>, 'onClick'>;

function getDefaultItemContent(type: UsePaginationItemType, page: number | null) {
  switch (type) {
    case 'page':
      return page;
    case 'first':
      return '\u00AB';
    case 'last':
      return '\u00BB';
    case 'previous':
      return '\u2039';
    case 'next':
      return '\u203A';
    default:
      return null;
  }
}

/**
 * A single pagination item — a page button, or navigation button (first, last, previous, next).
 * Renders a `<li>` element containing a `<button>`.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationItem = React.forwardRef(function PaginationItem(
  componentProps: PaginationItem.Props,
  forwardedRef: React.ForwardedRef<HTMLLIElement>,
) {
  const {
    render,
    className,
    style,
    children,
    type,
    page,
    selected,
    disabled,
    onPress,
    ...elementProps
  } = componentProps;

  const { getItemAriaLabel } = usePaginationRootContext();

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    onPress?.(event);
  });

  const state: PaginationItem.State = { selected, disabled, type };

  const ariaLabel = getItemAriaLabel(type, page, selected);

  const buttonElement = (
    <button
      type="button"
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      tabIndex={disabled ? -1 : 0}
    >
      {children ?? getDefaultItemContent(type, page)}
    </button>
  );

  return useRenderElement('li', componentProps, {
    state,
    ref: forwardedRef,
    props: [
      {
        children: buttonElement,
      },
      elementProps,
    ],
  });
});

export interface PaginationItemState {
  /**
   * Whether this item is the current page.
   */
  selected: boolean;
  /**
   * Whether this item is disabled.
   */
  disabled: boolean;
  /**
   * The type of pagination item.
   */
  type: UsePaginationItemType;
}

export interface PaginationItemProps extends PaginationItemBaseProps {
  /**
   * The type of pagination item.
   */
  type: UsePaginationItemType;
  /**
   * The page number this item represents. `null` for non-page navigation items.
   */
  page: number | null;
  /**
   * Whether this item is selected (current page).
   */
  selected: boolean;
  /**
   * Whether this item is disabled.
   */
  disabled: boolean;
  /**
   * Press handler for the inner button, passed from the pagination items list.
   */
  onPress?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined;
}

export namespace PaginationItem {
  export type State = PaginationItemState;
  export type Props = PaginationItemProps;
}
