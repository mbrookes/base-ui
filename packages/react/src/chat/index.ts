export * as Chat from './index.parts';

// Core
export { ChatRoot } from './root/ChatRoot';
export type { ChatRootState } from './root/ChatRoot';
export { ChatLayout } from './layout/ChatLayout';
export { ChatProvider } from './provider/ChatProvider';
export type { ChatProviderProps, ChatFeatures } from './provider/ChatProvider';

// Adapters
export { createAiSdkAdapter } from './adapters/createAiSdkAdapter';
export { createEchoAdapter } from './adapters/createEchoAdapter';
export type { ChatAdapter } from './adapters/chatAdapter';

// Store
export { ChatStore } from './store/ChatStore';
export type { ChatStoreConstructor, ChatStoreParameters } from './store/ChatStore';

// Hooks (public)
export * from './hooks/index';

// Selectors
export {
  chatSelectors,
  selectMessageIds,
  selectMessagesById,
  selectConversationIds,
  selectConversationsById,
  selectActiveConversationId,
  selectIsStreaming,
  selectStreamingConversationId,
  selectHasMoreHistory,
  selectIsLoadingHistory,
  selectError,
  selectMessages,
  selectMessage,
  selectMessageError,
  selectConversations,
  selectConversation,
  selectActiveConversation,
  selectMessageCount,
  selectConversationCount,
  selectComposerValue,
  selectComposerAttachments,
  selectTypingUserIds,
  selectTypingUserIdsForActiveConversation,
} from './selectors/chatSelectors';

// Indicators
export {
  ScrollToBottomAffordance,
  StreamingIndicator,
  TypingIndicator,
  UnreadMarker,
} from './indicators';

// Types
export type {
  ChatMessage,
  ChatConversation,
  ChatUser,
  ChatRole,
  ChatMessageStatus,
  ChatAttachmentsConfig,
  ChatDraftAttachment,
} from './types/chat-entities';
export type { ChatError } from './types/chat-error';
export type { ChatMessagePart } from './types/chat-message-parts';
export type { ChatOnData, ChatOnError, ChatOnFinish, ChatOnToolCall } from './types/chat-callbacks';
export type { ChatPartRenderer } from './renderers/chatPartRenderer';
export type { ChatVariant } from './variant/ChatVariantContext';
export type { ChatDensity } from './density/ChatDensityContext';
export type { ChatLocaleText } from './locales/chatLocaleText';
