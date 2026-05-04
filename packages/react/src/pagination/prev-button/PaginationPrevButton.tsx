'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * A button that navigates to the previous page.
 * Renders a `<li>` element containing a `<button>`.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationPrevButton = React.forwardRef(function PaginationPrevButton(
  componentProps: PaginationPrevButton.Props,
  forwardedRef: React.ForwardedRef<HTMLLIElement>,
) {
  const { render, className, children, style, 'aria-label': ariaLabel = 'Go to previous page', ...elementProps } = componentProps;

  const { page, disabled: rootDisabled, setPage } = usePaginationRootContext();
  const disabled = rootDisabled || page <= 1;

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setPage(page - 1, event);
  });

  const { getButtonProps, buttonRef } = useButton({ disabled });

  const state: PaginationPrevButton.State = { disabled };

  const buttonElement = (
    <button ref={buttonRef} aria-label={ariaLabel} {...getButtonProps({ onClick: handleClick })}>
      {children ?? '\u2039'}
    </button>
  );

  return useRenderElement('li', componentProps, {
    state,
    ref: forwardedRef,
    props: [{ children: buttonElement }, elementProps],
  });
});

export interface PaginationPrevButtonState {
  /**
   * Whether the button is disabled.
   */
  disabled: boolean;
}

export interface PaginationPrevButtonProps extends BaseUIComponentProps<
  'li',
  PaginationPrevButtonState
> {}

export namespace PaginationPrevButton {
  export type State = PaginationPrevButtonState;
  export type Props = PaginationPrevButtonProps;
}
