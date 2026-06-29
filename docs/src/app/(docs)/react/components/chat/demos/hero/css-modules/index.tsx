'use client';
import * as React from 'react';
import { Chat, createEchoAdapter } from '@base-ui/react/chat';
import { ChatMessageList } from '@base-ui/react/chat-message-list';
import { ChatMessageGroup } from '@base-ui/react/chat-message-group';
import { ChatMessage } from '@base-ui/react/chat-message';
import { ChatSuggestions } from '@base-ui/react/chat-suggestions';
import { ChatComposer } from '@base-ui/react/chat-composer';
import type { ChatMessage as ChatMessageType, ChatUser } from '@base-ui/react/chat';
import styles from './index.module.css';

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
      className={styles.ActionButton}
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
    <ChatMessageGroup.Root messageId={id} index={index} className={styles.MessageGroup}>
      <ChatMessageGroup.AuthorName className={styles.AuthorName} />
      <ChatMessage.Root messageId={id} className={styles.Message}>
        <ChatMessage.Avatar className={styles.Avatar} />
        <div className={styles.BubbleArea}>
          <ChatMessage.Content className={styles.Content} />
          <ChatMessage.Meta className={styles.Meta} />
          <ChatMessage.Actions className={styles.Actions}>
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
      className={styles.Root}
    >
      <ChatMessageList.Root renderItem={renderMessage} className={styles.MessageList}>
        <ChatMessageList.Status />
        <ChatMessageList.Viewport className={styles.Viewport}>
          <ChatMessageList.Content className={styles.ListContent} />
        </ChatMessageList.Viewport>
      </ChatMessageList.Root>
      <ChatSuggestions.Root alwaysVisible className={styles.Suggestions}>
        <ChatSuggestions.Item value="What is Base UI?" className={styles.SuggestionItem} />
        <ChatSuggestions.Item value="Show me an example" className={styles.SuggestionItem} />
        <ChatSuggestions.Item value="How do I style it?" className={styles.SuggestionItem} />
      </ChatSuggestions.Root>
      <ChatComposer.Root className={styles.Composer}>
        <ChatComposer.TextArea placeholder="Send a message…" className={styles.TextArea} />
        <ChatComposer.Toolbar className={styles.Toolbar}>
          <ChatComposer.SendButton className={styles.SendButton}>Send</ChatComposer.SendButton>
        </ChatComposer.Toolbar>
      </ChatComposer.Root>
    </Chat.Root>
  );
}
