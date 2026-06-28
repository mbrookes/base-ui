'use client';
import * as React from 'react';
import { Chat, createEchoAdapter } from '@base-ui/react/chat';
import { ChatMessageList } from '@base-ui/react/chat-message-list';
import { ChatMessageGroup } from '@base-ui/react/chat-message-group';
import { ChatMessage } from '@base-ui/react/chat-message';
import { ChatComposer } from '@base-ui/react/chat-composer';
import type { ChatMessage as ChatMessageType } from '@base-ui/react/chat';
import styles from './index.module.css';

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
    <ChatMessageGroup.Root messageId={id} index={index} className={styles.MessageGroup}>
      <ChatMessage.Root messageId={id} className={styles.Message}>
        <ChatMessage.Content className={styles.Content} />
      </ChatMessage.Root>
    </ChatMessageGroup.Root>
  );
}

export default function ChatHero() {
  return (
    <Chat.Root adapter={adapter} initialMessages={initialMessages} className={styles.Root}>
      <ChatMessageList.Root renderItem={renderMessage} className={styles.MessageList}>
        <ChatMessageList.Viewport className={styles.Viewport}>
          <ChatMessageList.Content className={styles.ListContent} />
        </ChatMessageList.Viewport>
      </ChatMessageList.Root>
      <ChatComposer.Root className={styles.Composer}>
        <ChatComposer.TextArea placeholder="Send a message…" className={styles.TextArea} />
        <ChatComposer.Toolbar className={styles.Toolbar}>
          <ChatComposer.SendButton className={styles.SendButton}>Send</ChatComposer.SendButton>
        </ChatComposer.Toolbar>
      </ChatComposer.Root>
    </Chat.Root>
  );
}
