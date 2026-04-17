'use client';

import * as React from 'react';

export interface DropzoneContextValue {
  disabled: boolean;
  setInputElement: (node: HTMLInputElement | null) => void;
}

export const DropzoneContext = React.createContext<DropzoneContextValue | undefined>(undefined);

export function useDropzoneContext(): DropzoneContextValue {
  const context = React.useContext(DropzoneContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: DropzoneContext is missing. Dropzone parts must be placed within <Dropzone.Root>.',
    );
  }

  return context;
}
