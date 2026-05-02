'use client';
import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { PaginationRootContext } from './PaginationRootContext';
import type { PaginationRootContextValue } from './PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { REASONS } from '../../internals/reasons';

/**
 * Groups all parts of the pagination component and manages page state.
 * Renders a `<nav>` element.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
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
    render,
    className,
    'aria-label': ariaLabel = 'pagination navigation',
    style,
    ...elementProps
  } = componentProps;

  void render;
  void className;

  const [page, setPageState] = useControlled({
    controlled: pageProp,
    default: defaultPage,
    name: 'Pagination',
    state: 'page',
  });

  const resolvedPage = page ?? 1;

  const setPage = useStableCallback((nextPage: number, event: React.MouseEvent) => {
    const details = createChangeEventDetails(REASONS.itemPress, event.nativeEvent as MouseEvent);
    onPageChange?.(nextPage, details);
    if (!details.isCanceled) {
      setPageState(nextPage);
    }
  });

  const state: PaginationRoot.State = { page: resolvedPage, count, disabled };

  const contextValue: PaginationRootContextValue = React.useMemo(
    () => ({ page: resolvedPage, count, disabled, setPage }),
    [resolvedPage, count, disabled, setPage],
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
   * Whether all pagination items are disabled.
   * @default false
   */
  disabled?: boolean | undefined;
}

export namespace PaginationRoot {
  export type State = PaginationRootState;
  export type Props = PaginationRootProps;
  export type ChangeEventDetails = BaseUIChangeEventDetails<typeof REASONS.itemPress>;
  export type ChangeEventReason = typeof REASONS.itemPress;
}
