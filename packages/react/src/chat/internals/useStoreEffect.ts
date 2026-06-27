'use client';
import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { ReadonlyStore } from '@base-ui/utils/store';

/**
 * Runs a side effect whenever a selected value from the store changes.
 * Modelled after @mui/x-internals/store's useStoreEffect for compatibility.
 */
export function useStoreEffect<State, Value>(
  store: ReadonlyStore<State>,
  selector: (state: State) => Value,
  effect: (previous: Value, next: Value) => void,
): void {
  const stableEffect = useStableCallback(effect);
  const previousValueRef = React.useRef<Value>(selector(store.state));

  useIsoLayoutEffect(() => {
    return store.subscribe((state) => {
      const next = selector(state);
      const prev = previousValueRef.current;
      if (!Object.is(prev, next)) {
        previousValueRef.current = next;
        stableEffect(prev, next);
      }
    });
  }, [store, selector, stableEffect]);
}
