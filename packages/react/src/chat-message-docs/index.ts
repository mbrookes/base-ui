// Docs-only entry point used by docs/src/app/(docs)/react/components/chat/types-message.ts.
// Restricts the type extractor to the 7 core ChatMessage components so the generated
// types-message.md stays within the WASM syntax-highlighter memory limit.
export { ChatMessageRoot as Root } from '../chat-message/root/ChatMessageRoot';
export { ChatMessageContent as Content } from '../chat-message/content/ChatMessageContent';
export { ChatMessageAvatar as Avatar } from '../chat-message/avatar/ChatMessageAvatar';
export { ChatMessageAuthorLabel as AuthorLabel } from '../chat-message/author-label/ChatMessageAuthorLabel';
export { ChatMessageMeta as Meta } from '../chat-message/meta/ChatMessageMeta';
export { ChatMessageActions as Actions } from '../chat-message/actions/ChatMessageActions';
export { ChatMessageError as Error } from '../chat-message/error/ChatMessageError';
