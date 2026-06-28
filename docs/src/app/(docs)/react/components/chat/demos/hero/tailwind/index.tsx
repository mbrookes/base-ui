'use client';
import * as React from 'react';
import { Chat, createEchoAdapter } from '@base-ui/react/chat';
import { ChatMessageList } from '@base-ui/react/chat-message-list';
import { ChatMessageGroup } from '@base-ui/react/chat-message-group';
import { ChatMessage } from '@base-ui/react/chat-message';
import { ChatComposer } from '@base-ui/react/chat-composer';
import type { ChatMessage as ChatMessageType } from '@base-ui/react/chat';

const adapter = createEchoAdapter({ delayMs: 600 });

const initialMessages: ChatMessageType[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Hello! How can I help you today?' }],
    createdAt: '2026-06-27T09:00:00.000Z',
  },
  {
    id: 'msg-2',
    role: 'user',
    parts: [{ type: 'text', text: 'What is Base UI?' }],
    createdAt: '2026-06-27T09:01:00.000Z',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Base UI is a library of headless React components. It provides the structure, state management, and accessibility semantics — you supply the styles.',
      },
    ],
    createdAt: '2026-06-27T09:01:30.000Z',
  },
];

function renderMessage({ id, index }: { id: string; index: number }) {
  return (
    <ChatMessageGroup.Root messageId={id} index={index} className="flex flex-col gap-0.5">
      <ChatMessage.Root messageId={id} className="flex max-w-[80%] data-[own-message]:self-end">
        <ChatMessage.Content className="rounded-2xl bg-gray-100 px-3 py-2 text-sm leading-relaxed break-words text-gray-950 data-[own-message]:bg-blue-600 data-[own-message]:text-white dark:bg-white/10 dark:text-white dark:data-[own-message]:bg-blue-600" />
      </ChatMessage.Root>
    </ChatMessageGroup.Root>
  );
}

export default function ChatHero() {
  return (
    <Chat.Root
      adapter={adapter}
      initialMessages={initialMessages}
      className="flex h-[480px] w-[400px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-sm font-sans dark:border-white/10 dark:bg-gray-950"
    >
      <ChatMessageList.Root renderItem={renderMessage} className="relative min-h-0 flex-1">
        <ChatMessageList.Viewport className="h-full p-3">
          <ChatMessageList.Content className="flex flex-col gap-1" />
        </ChatMessageList.Viewport>
      </ChatMessageList.Root>
      <ChatComposer.Root className="flex flex-col gap-2 border-t border-gray-200 p-2 dark:border-white/10">
        <ChatComposer.TextArea
          placeholder="Send a message…"
          className="w-full resize-none border-none bg-transparent p-1 text-sm leading-relaxed outline-none placeholder:text-gray-400 dark:text-white"
        />
        <ChatComposer.Toolbar className="flex justify-end">
          <ChatComposer.SendButton className="cursor-pointer rounded-lg bg-gray-950 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100">
            Send
          </ChatComposer.SendButton>
        </ChatComposer.Toolbar>
      </ChatComposer.Root>
    </Chat.Root>
  );
}
