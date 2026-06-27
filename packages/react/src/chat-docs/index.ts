// Docs-only entry point used by docs/src/app/(docs)/react/components/chat/types.ts.
// Restricts the type extractor to only Chat.Root and Chat.Layout so the generated
// types.md stays within the WASM syntax-highlighter memory limit.
export * as Chat from '../chat/index.parts';
