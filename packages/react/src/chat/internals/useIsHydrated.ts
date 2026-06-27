'use client';
import * as React from 'react';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsHydrated(): boolean {
  return React.useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}
