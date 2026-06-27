// Restricts the type extractor to the 7 core ChatMessage components so the generated
// types-message.md stays within the WASM syntax-highlighter memory limit.
export { ChatMessageRoot as Root } from '@base-ui/react/chat-message/root/ChatMessageRoot';
export { ChatMessageContent as Content } from '@base-ui/react/chat-message/content/ChatMessageContent';
export { ChatMessageAvatar as Avatar } from '@base-ui/react/chat-message/avatar/ChatMessageAvatar';
export { ChatMessageAuthorLabel as AuthorLabel } from '@base-ui/react/chat-message/author-label/ChatMessageAuthorLabel';
export { ChatMessageMeta as Meta } from '@base-ui/react/chat-message/meta/ChatMessageMeta';
export { ChatMessageActions as Actions } from '@base-ui/react/chat-message/actions/ChatMessageActions';
export { ChatMessageError as Error } from '@base-ui/react/chat-message/error/ChatMessageError';
