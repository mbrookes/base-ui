import type { ChatCustomMessagePartMap, ChatDataPartMap } from './chat-type-registry';
import type {
  ChatDataPartTypePattern,
  ChatKnownDataPartType,
  ChatKnownToolName,
  ChatRegisteredDataPartType,
  ChatToolInput,
  ChatToolOutput,
} from './chat-type-helpers';

export type ChatMessagePartStatus = 'streaming' | 'done';

export interface ChatTextMessagePart {
  type: 'text';
  text: string;
  state?: ChatMessagePartStatus | undefined;
}

export interface ChatReasoningMessagePart {
  type: 'reasoning';
  text: string;
  state?: ChatMessagePartStatus | undefined;
}

export interface ChatFileMessagePart {
  type: 'file';
  mediaType: string;
  url: string;
  filename?: string | undefined;
}

export interface ChatSourceUrlMessagePart {
  type: 'source-url';
  sourceId: string;
  url: string;
  title?: string | undefined;
}

export interface ChatSourceDocumentMessagePart {
  type: 'source-document';
  sourceId: string;
  title?: string | undefined;
  text?: string | undefined;
}

export type ChatDataPartType = ChatDataPartTypePattern;

export interface ChatFallbackDataMessagePart<
  TType extends ChatKnownDataPartType = ChatKnownDataPartType,
> {
  type: TType;
  id?: string | undefined;
  data: [ChatRegisteredDataPartType] extends [never]
    ? unknown
    : TType extends keyof ChatDataPartMap
      ? ChatDataPartMap[TType]
      : never;
  transient?: boolean | undefined;
}

type ChatRegisteredDataMessagePart = {
  [TType in ChatRegisteredDataPartType]: {
    type: TType;
    id?: string | undefined;
    data: ChatDataPartMap[TType];
    transient?: boolean | undefined;
  };
}[ChatRegisteredDataPartType];

export type ChatDataMessagePart = [ChatRegisteredDataPartType] extends [never]
  ? ChatFallbackDataMessagePart
  : ChatRegisteredDataMessagePart;

export interface ChatStepStartMessagePart {
  type: 'step-start';
}

export type ChatToolInvocationState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied';

export interface ChatToolApproval {
  approved: boolean;
  reason?: string | undefined;
}

export interface ChatToolInvocation<TToolName extends ChatKnownToolName = ChatKnownToolName> {
  toolCallId: string;
  toolName: TToolName;
  state: ChatToolInvocationState;
  input?: ChatToolInput<TToolName> | undefined;
  output?: ChatToolOutput<TToolName> | undefined;
  errorText?: string | undefined;
  approval?: ChatToolApproval | undefined;
  approvalId?: string | undefined;
  providerExecuted?: boolean | undefined;
  title?: string | undefined;
  callProviderMetadata?: Record<string, unknown> | undefined;
  preliminary?: boolean | undefined;
}

export interface ChatToolMessagePart<TToolName extends ChatKnownToolName = ChatKnownToolName> {
  type: 'tool';
  toolInvocation: ChatToolInvocation<TToolName>;
}

export interface ChatDynamicToolInvocation<TToolName extends string = string> {
  toolCallId: string;
  toolName: TToolName;
  state: ChatToolInvocationState;
  input?: unknown;
  output?: unknown;
  errorText?: string | undefined;
  approval?: ChatToolApproval | undefined;
  approvalId?: string | undefined;
  providerExecuted?: boolean | undefined;
  title?: string | undefined;
  callProviderMetadata?: Record<string, unknown> | undefined;
  preliminary?: boolean | undefined;
}

export interface ChatDynamicToolMessagePart<TToolName extends string = string> {
  type: 'dynamic-tool';
  toolInvocation: ChatDynamicToolInvocation<TToolName>;
}

export type ChatBuiltInMessagePart =
  | ChatTextMessagePart
  | ChatReasoningMessagePart
  | ChatFileMessagePart
  | ChatSourceUrlMessagePart
  | ChatSourceDocumentMessagePart
  | ChatDataMessagePart
  | ChatStepStartMessagePart
  | ChatToolMessagePart
  | ChatDynamicToolMessagePart;

export type ChatCustomMessagePart = ChatCustomMessagePartMap[keyof ChatCustomMessagePartMap];

export type ChatMessagePart = ChatBuiltInMessagePart | ChatCustomMessagePart;
