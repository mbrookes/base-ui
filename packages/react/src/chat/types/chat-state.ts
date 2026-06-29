import type { ChatConversation, ChatDraftAttachment, ChatMessage } from './chat-entities';
import type { ChatError } from './chat-error';

export interface ChatPublicState<Cursor = string> {
  conversations: ChatConversation[];
  activeConversationId?: string | undefined;
  messages: ChatMessage[];
  messageCount: number;
  isStreaming: boolean;
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;
  historyCursor?: Cursor | undefined;
  error: ChatError | null;
}

export interface ChatInternalState<Cursor = string> {
  conversationsById: Record<string, ChatConversation>;
  conversationIds: string[];
  activeConversationId?: string | undefined;
  messageIds: string[];
  messagesById: Record<string, ChatMessage>;
  messageErrorsById: Record<string, ChatError | undefined>;
  /** Tracks which users are typing per conversation: { [conversationId]: { [userId]: isTyping } } */
  typingByConversation: Record<string, Record<string, boolean>>;
  activeStreamAbortController: AbortController | null;
  isStreaming: boolean;
  /** The conversation the in-flight response stream belongs to, when known. */
  streamingConversationId?: string | undefined;
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;
  historyCursor?: Cursor | undefined;
  composerValue: string;
  composerIsComposing: boolean;
  composerAttachments: ChatDraftAttachment[];
  error: ChatError | null;
}
