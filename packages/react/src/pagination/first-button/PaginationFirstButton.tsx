'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button/useButton';
import { usePaginationRootContext } from '../root/PaginationRootContext';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * A button that navigates to the first page.
 * Renders a `<li>` element containing a `<button>`.
 *
 * Documentation: [Base UI Pagination](https://base-ui.com/react/components/pagination)
 */
export const PaginationFirstButton = React.forwardRef(function PaginationFirstButton(
  componentProps: PaginationFirstButton.Props,
  forwardedRef: React.ForwardedRef<HTMLLIElement>,
) {
  const {
    render,
    className,
    children,
    style,
    'aria-label': ariaLabel = 'Go to first page',
    ...elementProps
  } = componentProps;

  const { page, disabled: rootDisabled, setPage } = usePaginationRootContext();
  const disabled = rootDisabled || page <= 1;

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setPage(1, event);
  });

  const { getButtonProps, buttonRef } = useButton({ disabled });

  const state: PaginationFirstButton.State = { disabled };

  const buttonElement = (
    <button
      type="button"
      ref={buttonRef}
      aria-label={ariaLabel}
      {...getButtonProps({ onClick: handleClick })}
    >
      {children ?? '\u00AB'}
    </button>
  );

  return useRenderElement('li', componentProps, {
    state,
    ref: forwardedRef,
    props: [{ children: buttonElement }, elementProps],
  });
});

export interface PaginationFirstButtonState {
  /**
   * Whether the button is disabled.
   */
  disabled: boolean;
}

export interface PaginationFirstButtonProps extends BaseUIComponentProps<
  'li',
  PaginationFirstButtonState
> {}

export namespace PaginationFirstButton {
  export type State = PaginationFirstButtonState;
  export type Props = PaginationFirstButtonProps;
}
