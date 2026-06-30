'use client';
import * as React from 'react';
import { Chat, createEchoAdapter } from '@base-ui/chat/chat';
import { ChatMessageList } from '@base-ui/chat/chat-message-list';
import { ChatMessageGroup } from '@base-ui/chat/chat-message-group';
import { ChatMessage } from '@base-ui/chat/chat-message';
import { ChatSuggestions } from '@base-ui/chat/chat-suggestions';
import { ChatComposer } from '@base-ui/chat/chat-composer';
import type { ChatMessage as ChatMessageType, ChatUser } from '@base-ui/chat/chat';

const adapter = createEchoAdapter({ delayMs: 600 });

const ASSISTANT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Crect width='28' height='28' fill='%23e5e5e5'/%3E%3Ctext x='14' y='19' text-anchor='middle' font-family='system-ui' font-size='12' fill='%23171717'%3EA%3C/text%3E%3C/svg%3E";

const members: ChatUser[] = [
  { id: 'assistant', role: 'assistant', displayName: 'Assistant', avatarUrl: ASSISTANT_AVATAR },
  { id: 'user', role: 'user', displayName: 'You' },
];

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

function CopyButton() {
  const ctx = ChatMessage.useMessageContext();
  const text = (ctx.message?.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');

  return (
    <button
      type="button"
      className="h-6 cursor-pointer border border-neutral-200 bg-white px-1.5 text-xs text-neutral-950 select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
      aria-label="Copy message"
      onClick={() => {
        void navigator.clipboard.writeText(text);
      }}
    >
      Copy
    </button>
  );
}

function renderMessage({ id, index }: { id: string; index: number }) {
  return (
    <ChatMessageGroup.Root
      messageId={id}
      index={index}
      className="group/grp flex flex-col gap-0.5 data-[author-role=user]:items-end"
    >
      <ChatMessageGroup.AuthorName className="px-0.5 pb-0.5 text-[11px] text-neutral-500 group-data-[author-role=user]/grp:hidden dark:text-neutral-400" />
      <ChatMessage.Root messageId={id} className="group/msg flex max-w-[85%] items-start gap-2">
        <ChatMessage.Avatar className="size-7 shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700 dark:invert" />
        <div className="flex min-w-0 flex-col gap-0.5 group-data-grouped/msg:pl-9">
          <ChatMessage.Content className="wrap-break-word border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 leading-relaxed text-neutral-950 data-own-message:border-neutral-950 data-own-message:bg-neutral-950 data-own-message:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:data-own-message:border-white dark:data-own-message:bg-white dark:data-own-message:text-neutral-950" />
          <ChatMessage.Meta className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400" />
          <ChatMessage.Actions className="flex gap-1 invisible group-hover/msg:visible group-focus-within/msg:visible">
            <CopyButton />
          </ChatMessage.Actions>
        </div>
      </ChatMessage.Root>
    </ChatMessageGroup.Root>
  );
}

export default function ChatHero() {
  return (
    <Chat.Root
      adapter={adapter}
      members={members}
      initialMessages={initialMessages}
      className="flex h-[520px] w-[400px] flex-col border border-neutral-950 bg-white text-sm text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white"
    >
      <ChatMessageList.Root renderItem={renderMessage} className="relative min-h-0 flex-1">
        <ChatMessageList.Status />
        <ChatMessageList.Viewport className="h-full overflow-y-auto p-3">
          <ChatMessageList.Content className="flex flex-col gap-2" />
        </ChatMessageList.Viewport>
      </ChatMessageList.Root>
      <ChatSuggestions.Root
        alwaysVisible
        className="flex flex-wrap gap-1.5 border-t border-neutral-200 p-2 dark:border-neutral-700"
      >
        <ChatSuggestions.Item
          value="What is Base UI?"
          className="h-7 cursor-pointer border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-950 select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
        />
        <ChatSuggestions.Item
          value="Show me an example"
          className="h-7 cursor-pointer border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-950 select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
        />
        <ChatSuggestions.Item
          value="How do I style it?"
          className="h-7 cursor-pointer border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-950 select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
        />
      </ChatSuggestions.Root>
      <ChatComposer.Root className="flex flex-col gap-2 border-t border-neutral-200 p-2 dark:border-neutral-700">
        <ChatComposer.TextArea
          placeholder="Send a message…"
          className="w-full resize-none border-none bg-transparent p-1 text-sm leading-relaxed outline-none placeholder:text-neutral-400 dark:text-white"
        />
        <ChatComposer.Toolbar className="flex justify-end">
          <ChatComposer.SendButton className="flex h-8 cursor-pointer items-center border border-neutral-950 bg-neutral-950 px-3 text-sm text-white select-none hover:border-neutral-800 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-white dark:text-neutral-950 dark:hover:border-neutral-100 dark:hover:bg-neutral-100 dark:focus-visible:outline-white">
            Send
          </ChatComposer.SendButton>
        </ChatComposer.Toolbar>
      </ChatComposer.Root>
    </Chat.Root>
  );
}
