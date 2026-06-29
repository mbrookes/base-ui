'use client';
import * as React from 'react';
import { ownerDocument } from '@base-ui/utils/owner';

export interface ToolPartOwnerState {
  messageId: string;
  pendingApproval: boolean;
  role: string;
  state: string;
  toolName: string;
  isMessageStreaming: boolean;
}

export interface ToolPartSectionOwnerState extends ToolPartOwnerState {
  section: 'input' | 'output';
  summaryLabel: string;
  previewValue: string;
}

/**
 * Resolves the default expanded state of a tool disclosure.
 * Return `true`/`false` to control the disclosure, or `undefined` to defer to the built-in default.
 */
export type ChatToolGetExpanded = (
  ownerState: ToolPartOwnerState & { section?: 'input' | 'output' | undefined },
) => boolean | undefined;

/**
 * A per-tool default-expansion policy.
 */
export type ChatToolExpand = boolean | ChatToolGetExpanded;

/**
 * Carries the tool's resolved expansion policy down to the disclosure slots.
 * @ignore - internal
 */
export const ToolDisclosureContext = React.createContext<ChatToolGetExpanded | undefined>(
  undefined,
);

if (process.env.NODE_ENV !== 'production') {
  ToolDisclosureContext.displayName = 'ToolDisclosureContext';
}

/**
 * Owns the open/close state of a single tool disclosure.
 * @ignore - internal
 */
export function useToolDisclosure(
  ownerState: ToolPartOwnerState | ToolPartSectionOwnerState,
  builtInOpen: boolean,
  disclosureRef?: React.RefObject<HTMLDetailsElement | null>,
): readonly [boolean, (next: boolean) => void] {
  const getExpanded = React.useContext(ToolDisclosureContext);
  const resolved = getExpanded?.(ownerState);
  const authoritative = resolved !== undefined;
  const desired = authoritative ? (resolved as boolean) : builtInOpen;

  const [open, setOpen] = React.useState(desired);
  const [prevDesired, setPrevDesired] = React.useState(desired);
  if (desired !== prevDesired) {
    setPrevDesired(desired);
    if (authoritative || desired) {
      setOpen(desired);
    }
  }

  React.useEffect(() => {
    if (open || !disclosureRef?.current) {
      return;
    }
    const el = disclosureRef.current;
    const doc = ownerDocument(el);
    const active = doc.activeElement;
    if (active && el.contains(active)) {
      const summary = el.querySelector('summary');
      if (summary && summary !== active) {
        (summary as HTMLElement).focus();
      }
    }
  }, [open, disclosureRef]);

  return [open, setOpen] as const;
}
