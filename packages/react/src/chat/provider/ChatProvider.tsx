'use client';
import * as React from 'react';
import type { ChatAdapter } from '../adapters';
import { type ChatStoreConstructor, type ChatStoreParameters } from '../store';
import { useChatController } from '../internals/useChatController';
import { useChatInstance } from '../internals/useChatInstance';
import {
  ChatRuntimeContext,
  type ChatRuntimeContextValue,
} from '../internals/useChatRuntimeContext';
import type { ChatPartRendererMap } from '../renderers';
import { defaultPartRenderers } from '../renderers/defaultPartRenderers';
import { ChatStoreContext } from '../internals/useChatStoreContext';
import type { ChatOnData, ChatOnError, ChatOnFinish, ChatOnToolCall } from '../types';

/**
 * Runtime feature flags for the headless chat controller.
 */
export interface ChatFeatures {
  /**
   * Whether the runtime sends outbound typing signals through `adapter.setTyping()`
   * automatically as the user composes a message.
   * @default false
   */
  typingSignal?: boolean | undefined;
}

export interface ChatProviderProps<Cursor = string> extends Omit<
  ChatStoreParameters<Cursor>,
  'activeConversationIdControlled'
> {
  children?: React.ReactNode;
  adapter: ChatAdapter<Cursor>;
  onToolCall?: ChatOnToolCall | undefined;
  onFinish?: ChatOnFinish | undefined;
  onData?: ChatOnData | undefined;
  onError?: ChatOnError | undefined;
  /**
   * Flush interval in milliseconds for batching rapid streaming deltas before applying them to the store.
   * @default 16
   */
  streamFlushInterval?: number | undefined;
  partRenderers?: ChatPartRendererMap | undefined;
  /**
   * The store class to use for this provider.
   * @default ChatStore
   */
  storeClass?: ChatStoreConstructor<Cursor> | undefined;
  /**
   * Runtime feature flags for the chat controller (e.g. outbound typing signals).
   */
  features?: ChatFeatures | undefined;
}

export function ChatProvider<Cursor = string>(props: ChatProviderProps<Cursor>) {
  const isActiveConversationIdControlled = Object.prototype.hasOwnProperty.call(
    props,
    'activeConversationId',
  );
  const {
    children,
    adapter,
    onToolCall,
    onFinish,
    onData,
    onError,
    streamFlushInterval,
    partRenderers,
    storeClass,
    features,
    members,
    currentUser,
    roleDisplayNames,
    getMessageAuthorId,
    getMessageAuthorDisplayName,
    getMessageAuthorAvatarUrl,
    messages,
    initialMessages,
    conversations,
    initialConversations,
    activeConversationId,
    initialActiveConversationId,
    composerValue,
    initialComposerValue,
    onMessagesChange,
    onConversationsChange,
    onActiveConversationChange,
    onComposerValueChange,
  } = props;

  const parameters = React.useMemo(
    () => ({
      members,
      currentUser,
      roleDisplayNames,
      getMessageAuthorId,
      getMessageAuthorDisplayName,
      getMessageAuthorAvatarUrl,
      messages,
      initialMessages,
      conversations,
      initialConversations,
      activeConversationId,
      activeConversationIdControlled: isActiveConversationIdControlled,
      initialActiveConversationId,
      composerValue,
      initialComposerValue,
      onMessagesChange,
      onConversationsChange,
      onActiveConversationChange,
      onComposerValueChange,
    }),
    [
      members,
      currentUser,
      roleDisplayNames,
      getMessageAuthorId,
      getMessageAuthorDisplayName,
      getMessageAuthorAvatarUrl,
      messages,
      initialMessages,
      conversations,
      initialConversations,
      activeConversationId,
      isActiveConversationIdControlled,
      initialActiveConversationId,
      composerValue,
      initialComposerValue,
      onMessagesChange,
      onConversationsChange,
      onActiveConversationChange,
      onComposerValueChange,
    ],
  );
  const store = useChatInstance(parameters, storeClass);
  const actions = useChatController({
    store,
    adapter,
    onToolCall,
    onFinish,
    onData,
    onError,
    streamFlushInterval,
    features,
  });
  const mergedPartRenderers = React.useMemo<ChatPartRendererMap>(
    () => ({
      ...defaultPartRenderers,
      ...partRenderers,
    }),
    [partRenderers],
  );

  const runtimeContextValue = React.useMemo<ChatRuntimeContextValue<Cursor>>(
    () => ({
      adapter,
      onToolCall,
      onFinish,
      onData,
      onError,
      partRenderers: mergedPartRenderers,
      actions,
    }),
    [actions, adapter, mergedPartRenderers, onToolCall, onFinish, onData, onError],
  );

  return (
    <ChatStoreContext.Provider value={store}>
      <ChatRuntimeContext.Provider value={runtimeContextValue}>
        {children}
      </ChatRuntimeContext.Provider>
    </ChatStoreContext.Provider>
  );
}
