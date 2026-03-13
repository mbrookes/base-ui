import * as React from 'react';

/**
 * A utility to compose event handlers.
 * This pattern ensures both user-defined and internal handlers run.
 */
export function composeEventHandlers<E extends React.SyntheticEvent<any, Event> | Event>(
  originalEventHandler?: ((event: E) => void) | undefined,
  ourEventHandler?: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !(event as any).defaultPrevented) {
      ourEventHandler?.(event);
      return undefined;
    }

    return undefined;
  };
}
