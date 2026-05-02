'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * A button that navigates to the last page.
 * Renders a `<li>` element containing a `<button>`.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationLastButton = React.forwardRef(function PaginationLastButton(
  componentProps: PaginationLastButton.Props,
  forwardedRef: React.ForwardedRef<HTMLLIElement>,
) {
  const { render, className, children, style, ...elementProps } = componentProps;

  const { page, count, disabled: rootDisabled, setPage } = usePaginationRootContext();
  const disabled = rootDisabled || page >= count;

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setPage(count, event);
  });

  const { getButtonProps, buttonRef } = useButton({ disabled });

  const state: PaginationLastButton.State = { disabled };

  const buttonElement = (
    <button ref={buttonRef} aria-label="Go to last page" {...getButtonProps({ onClick: handleClick })}>
      {children ?? '\u00BB'}
    </button>
  );

  return useRenderElement('li', componentProps, {
    state,
    ref: forwardedRef,
    props: [{ children: buttonElement }, elementProps],
  });
});

export interface PaginationLastButtonState {
  /**
   * Whether the button is disabled.
   */
  disabled: boolean;
}

export interface PaginationLastButtonProps extends BaseUIComponentProps<
  'li',
  PaginationLastButtonState
> {}

export namespace PaginationLastButton {
  export type State = PaginationLastButtonState;
  export type Props = PaginationLastButtonProps;
}
