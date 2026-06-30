export * from './chat';
export * from './chat-composer';
export * from './chat-conversation';
export * from './chat-conversation-list';
export * from './chat-message';
export * from './chat-message-group';
export * from './chat-message-list';
export * from './chat-suggestions';
// Explicit re-exports resolve wildcard ambiguities: ChatMessage and ChatConversation are
// exported both as entity types from './chat' and as component namespaces from their own
// packages. The explicit exports below let TypeScript choose the namespace (value) as the
// authoritative export; entity types remain available via '@base-ui/react/chat'.
export { ChatMessage } from './chat-message';
export { ChatConversation } from './chat-conversation';

export type * from './types';
