'use client';
import * as React from 'react';

export interface SuggestionsContextValue {
  onSelect(value: string): void;
}

const SuggestionsContext = React.createContext<SuggestionsContextValue | null>(null);

export const SuggestionsContextProvider = SuggestionsContext.Provider;

export function useSuggestionsContext(): SuggestionsContextValue | null {
  return React.useContext(SuggestionsContext);
}
