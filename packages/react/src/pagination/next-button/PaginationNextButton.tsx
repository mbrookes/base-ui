'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * A button that navigates to the next page.
 * Renders a `<li>` element containing a `<button>`.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationNextButton = React.forwardRef(function PaginationNextButton(
  componentProps: PaginationNextButton.Props,
  forwardedRef: React.ForwardedRef<HTMLLIElement>,
) {
  const {
    render,
    className,
    children,
    style,
    'aria-label': ariaLabel = 'Go to next page',
    ...elementProps
  } = componentProps;

  const { page, count, disabled: rootDisabled, setPage } = usePaginationRootContext();
  const disabled = rootDisabled || page >= count;

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setPage(page + 1, event);
  });

  const { getButtonProps, buttonRef } = useButton({ disabled });

  const state: PaginationNextButton.State = { disabled };

  const buttonElement = (
    <button
      type="button"
      ref={buttonRef}
      aria-label={ariaLabel}
      {...getButtonProps({ onClick: handleClick })}
    >
      {children ?? '\u203A'}
    </button>
  );

  return useRenderElement('li', componentProps, {
    state,
    ref: forwardedRef,
    props: [{ children: buttonElement }, elementProps],
  });
});

export interface PaginationNextButtonState {
  /**
   * Whether the button is disabled.
   */
  disabled: boolean;
}

export interface PaginationNextButtonProps extends BaseUIComponentProps<
  'li',
  PaginationNextButtonState
> {}

export namespace PaginationNextButton {
  export type State = PaginationNextButtonState;
  export type Props = PaginationNextButtonProps;
}
