'use client';
import * as React from 'react';
import { warn } from '@base-ui/utils/warn';
import { useRenderElement } from '../../internals/useRenderElement';
import { BaseUIComponentProps } from '../../internals/types';
import { getChatLayoutPaneKind, type ChatLayoutPaneKind } from './chatLayoutPaneKind';

export interface ChatLayoutPaneState {
  pane: ChatLayoutPaneKind;
}

const layoutStateAttributesMapping = {
  hasConversationsPane: (v: boolean) => (v ? { 'data-has-conversations-pane': '' } : null),
  hasThreadPane: (v: boolean) => (v ? { 'data-has-thread-pane': '' } : null),
};

function assignPaneChild(
  paneChildren: Record<ChatLayoutPaneKind, React.ReactNode[]>,
  kind: ChatLayoutPaneKind,
  child: React.ReactNode,
) {
  paneChildren[kind].push(child);
}

function resolvePaneChildren(children: React.ReactNode) {
  const allChildren = React.Children.toArray(children);
  const paneChildren: Record<ChatLayoutPaneKind, React.ReactNode[]> = {
    conversations: [],
    thread: [],
  };
  const unassignedChildren: React.ReactNode[] = [];

  allChildren.forEach((child) => {
    const paneKind = getChatLayoutPaneKind(child);
    if (paneKind === null) {
      unassignedChildren.push(child);
      return;
    }
    assignPaneChild(paneChildren, paneKind, child);
  });

  if (allChildren.length <= 1) {
    const singleChild =
      paneChildren.conversations[0] ?? paneChildren.thread[0] ?? unassignedChildren[0];

    if (singleChild === undefined) {
      return paneChildren;
    }

    if (paneChildren.conversations.length > 0) {
      return { conversations: [singleChild], thread: [] };
    }

    if (paneChildren.thread.length > 0) {
      return { conversations: [], thread: [singleChild] };
    }

    return { conversations: [], thread: [singleChild] };
  }

  unassignedChildren.forEach((child) => {
    if (paneChildren.conversations.length === 0) {
      assignPaneChild(paneChildren, 'conversations', child);
      return;
    }
    assignPaneChild(paneChildren, 'thread', child);
  });

  if (
    process.env.NODE_ENV !== 'production' &&
    unassignedChildren.length > 0 &&
    unassignedChildren.length < allChildren.length
  ) {
    warn(
      'Base UI: ChatLayout could not determine the pane kind for some children. ' +
        'Use the `pane` prop (pane="conversations" or pane="thread") to explicitly assign children to panes, ' +
        'or use Chat.ConversationList and Chat.Conversation components directly.',
    );
  }

  return paneChildren;
}

/**
 * Two-pane layout shell for a chat interface.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatLayout = React.forwardRef(function ChatLayout(
  props: ChatLayout.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, style, ...elementProps } = props;

  const paneChildren = resolvePaneChildren(children);
  const state: ChatLayout.State = {
    hasConversationsPane: paneChildren.conversations.length > 0,
    hasThreadPane: paneChildren.thread.length > 0,
  };

  return useRenderElement('div', props, {
    state,
    ref: forwardedRef,
    props: {
      ...elementProps,
      style: { display: 'flex', ...style },
      children: (
        <React.Fragment>
          {state.hasConversationsPane && (
            <div
              data-pane-conversations=""
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {paneChildren.conversations}
            </div>
          )}
          {state.hasThreadPane && (
            <div
              data-pane-thread=""
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {paneChildren.thread}
            </div>
          )}
        </React.Fragment>
      ),
    },
    stateAttributesMapping: layoutStateAttributesMapping,
  });
});

export namespace ChatLayout {
  export interface State {
    hasConversationsPane: boolean;
    hasThreadPane: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {
    children?: React.ReactNode;
    style?: React.CSSProperties;
  }
}
