import * as React from 'react';

/**
 * A utility to compose event handlers.
 * This pattern ensures both user-defined and internal handlers run.
 * The internal handler is skipped if the user calls `event.preventBaseUIHandler()`
 * (Base UI convention) or `event.preventDefault()`.
 */
export function composeEventHandlers<E extends React.SyntheticEvent<any, Event> | Event>(
  originalEventHandler?: ((event: E) => void) | undefined,
  ourEventHandler?: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    const baseUIHandlerPrevented =
      (event as unknown as { baseUIHandlerPrevented?: boolean | undefined }).baseUIHandlerPrevented ===
      true;
    const defaultPrevented = checkForDefaultPrevented && (event as any).defaultPrevented;

    if (!baseUIHandlerPrevented && !defaultPrevented) {
      ourEventHandler?.(event);
    }
  };
}
