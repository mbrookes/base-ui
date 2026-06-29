import type {
  ChatDataMessagePart,
  ChatDynamicToolInvocation,
  ChatMessagePart,
  ChatToolInvocation,
} from './chat-message-parts';
import type {
  ChatDateTimeString,
  ChatDraftAttachment,
  ChatMessage,
  ChatUser,
} from './chat-entities';
import type { ChatMessageMetadata } from './chat-type-registry';
import type { ChatError } from './chat-error';

export interface ChatOnToolCallPayload {
  toolCall: ChatToolInvocation | ChatDynamicToolInvocation;
}

export type ChatOnToolCall = (payload: ChatOnToolCallPayload) => void | Promise<void>;

export type ChatOnData = (part: ChatDataMessagePart) => void | Promise<void>;

export type ChatOnError = (error: ChatError) => void;

export interface ChatOnFinishPayload {
  message: ChatMessage;
  messages: ChatMessage[];
  isAbort: boolean;
  isDisconnect: boolean;
  isError: boolean;
  finishReason?: string | undefined;
}

export type ChatOnFinish = (payload: ChatOnFinishPayload) => void | Promise<void>;

export interface ChatAddToolApproveResponseInput {
  id: string;
  approved: boolean;
  reason?: string | undefined;
}

export interface UseChatSendMessageInput {
  id?: string | undefined;
  conversationId?: string | undefined;
  parts: ChatMessagePart[];
  metadata?: ChatMessageMetadata | undefined;
  author?: ChatUser | undefined;
  createdAt?: ChatDateTimeString | undefined;
  attachments?: ChatDraftAttachment[] | undefined;
}
