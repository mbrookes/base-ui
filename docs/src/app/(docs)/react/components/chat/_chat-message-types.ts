/* eslint-disable no-restricted-imports -- deep imports required to limit the type extractor
   surface to 7 exports and stay within the WASM syntax-highlighter memory limit. */
export { ChatMessageRoot as Root } from '@base-ui/react/chat-message/root/ChatMessageRoot';
export { ChatMessageContent as Content } from '@base-ui/react/chat-message/content/ChatMessageContent';
export { ChatMessageAvatar as Avatar } from '@base-ui/react/chat-message/avatar/ChatMessageAvatar';
export { ChatMessageAuthorLabel as AuthorLabel } from '@base-ui/react/chat-message/author-label/ChatMessageAuthorLabel';
export { ChatMessageMeta as Meta } from '@base-ui/react/chat-message/meta/ChatMessageMeta';
export { ChatMessageActions as Actions } from '@base-ui/react/chat-message/actions/ChatMessageActions';
export { ChatMessageError as Error } from '@base-ui/react/chat-message/error/ChatMessageError';
