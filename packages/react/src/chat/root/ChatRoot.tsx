'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { BaseUIComponentProps } from '../../internals/types';
import { ChatProvider, type ChatProviderProps } from '../provider/ChatProvider';
import type { ChatLocaleText } from '../locales/chatLocaleText';
import { ChatLocaleProvider } from '../locales/ChatLocaleContext';
import { ChatVariantProvider, type ChatVariant } from '../variant/ChatVariantContext';
import { ChatDensityProvider, type ChatDensity } from '../density/ChatDensityContext';

export interface ChatRootState {
  variant: ChatVariant | undefined;
  density: ChatDensity | undefined;
}

const rootStateAttributesMapping = {
  variant: (v: ChatVariant | undefined) => (v ? { [`data-variant-${v}`]: '' } : null),
  density: (d: ChatDensity | undefined) => (d ? { [`data-density-${d}`]: '' } : null),
};

/**
 * The root component that provides chat context to its children.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatRoot = React.forwardRef(function ChatRoot<Cursor = string>(
  props: ChatRoot.Props<Cursor>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const isActiveConversationIdControlled = Object.prototype.hasOwnProperty.call(
    props,
    'activeConversationId',
  );
  const {
    render,
    className,
    adapter,
    localeText,
    variant,
    density,
    members,
    currentUser,
    roleDisplayNames,
    getMessageAuthorId,
    getMessageAuthorDisplayName,
    getMessageAuthorAvatarUrl,
    messages,
    initialMessages,
    onMessagesChange,
    conversations,
    initialConversations,
    onConversationsChange,
    activeConversationId,
    initialActiveConversationId,
    onActiveConversationChange,
    composerValue,
    initialComposerValue,
    onComposerValueChange,
    onToolCall,
    onFinish,
    onData,
    onError,
    streamFlushInterval,
    partRenderers,
    storeClass,
    features,
    ...elementProps
  } = props;

  const state: ChatRoot.State = {
    variant,
    density,
  };

  const element = useRenderElement('div', props, {
    state,
    ref: forwardedRef,
    props: elementProps,
    stateAttributesMapping: rootStateAttributesMapping,
  });

  let content = <ChatLocaleProvider localeText={localeText}>{element}</ChatLocaleProvider>;

  if (variant) {
    content = <ChatVariantProvider variant={variant}>{content}</ChatVariantProvider>;
  }

  if (density) {
    content = <ChatDensityProvider density={density}>{content}</ChatDensityProvider>;
  }

  return (
    <ChatProvider
      adapter={adapter}
      members={members}
      currentUser={currentUser}
      getMessageAuthorId={getMessageAuthorId}
      getMessageAuthorDisplayName={getMessageAuthorDisplayName}
      getMessageAuthorAvatarUrl={getMessageAuthorAvatarUrl}
      messages={messages}
      initialMessages={initialMessages}
      onMessagesChange={onMessagesChange}
      conversations={conversations}
      initialConversations={initialConversations}
      onConversationsChange={onConversationsChange}
      {...(isActiveConversationIdControlled ? { activeConversationId } : {})}
      initialActiveConversationId={initialActiveConversationId}
      onActiveConversationChange={onActiveConversationChange}
      composerValue={composerValue}
      initialComposerValue={initialComposerValue}
      onComposerValueChange={onComposerValueChange}
      onToolCall={onToolCall}
      onFinish={onFinish}
      onData={onData}
      onError={onError}
      streamFlushInterval={streamFlushInterval}
      partRenderers={partRenderers}
      storeClass={storeClass}
      roleDisplayNames={roleDisplayNames}
      features={features}
    >
      {content}
    </ChatProvider>
  );
}) as {
  <Cursor = string>(
    props: ChatRoot.Props<Cursor> & React.RefAttributes<HTMLDivElement>,
  ): React.JSX.Element;
};

export namespace ChatRoot {
  export interface State {
    variant: ChatVariant | undefined;
    density: ChatDensity | undefined;
  }

  export interface Props<Cursor = string>
    extends ChatProviderProps<Cursor>, BaseUIComponentProps<'div', State> {
    localeText?: Partial<ChatLocaleText> | undefined;
    variant?: ChatVariant | undefined;
    density?: ChatDensity | undefined;
  }
}
