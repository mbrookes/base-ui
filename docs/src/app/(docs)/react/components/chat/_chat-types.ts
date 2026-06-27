// Restricts the type extractor to only Chat.Root and Chat.Layout so the generated
// types.md stays within the WASM syntax-highlighter memory limit.
export { ChatRoot as Root } from '@base-ui/react/chat/root/ChatRoot';
export { ChatLayout as Layout } from '@base-ui/react/chat/layout/ChatLayout';
