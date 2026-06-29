'use client';
import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { ownerDocument } from '@base-ui/utils/owner';
import { activeElement } from '../../internals/shadowDom';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext';
import { useLabelableId } from '../../internals/labelable-provider/useLabelableId';
import { useChat } from '../../chat/hooks/useChat';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useComposerContext } from '../internals/ComposerContext';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
};

function syncTextareaHeight(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

/**
 * The text input area for the chat composer.
 * Renders a `<textarea>` element with auto-resize behavior.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerTextArea = React.forwardRef(function ChatComposerTextArea(
  props: ChatComposerTextArea.Props,
  forwardedRef: React.ForwardedRef<HTMLTextAreaElement>,
) {
  const {
    render,
    className,
    style,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    id: idProp,
    ...elementProps
  } = props;

  const { activeConversationId } = useChat();
  const composer = useComposerContext();
  const localeText = useChatLocaleText();
  const { labelId, messageIds } = useLabelableContext();
  const id = useLabelableId({ id: idProp });

  const state: ChatComposerTextArea.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: composer.attachmentCount,
    disabled: composer.disabled,
  };

  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const handleRef = useMergedRefs(forwardedRef, inputRef);
  const previousActiveConversationIdRef = React.useRef(activeConversationId);

  useIsoLayoutEffect(() => {
    syncTextareaHeight(inputRef.current);
  }, [composer.value]);

  useIsoLayoutEffect(() => {
    const previousId = previousActiveConversationIdRef.current;
    previousActiveConversationIdRef.current = activeConversationId;

    if (inputRef.current == null || previousId == null || previousId === activeConversationId) {
      return;
    }

    const doc = ownerDocument(inputRef.current);
    const active = activeElement(doc);
    if (
      active == null ||
      active === doc.body ||
      active === doc.documentElement ||
      !active.isConnected
    ) {
      inputRef.current.focus();
    }
  }, [activeConversationId]);

  return useRenderElement('textarea', props, {
    ref: handleRef,
    state,
    props: [
      elementProps,
      {
        id,
        'aria-label': labelId ? undefined : localeText.composerInputAriaLabel,
        'aria-describedby': messageIds.length > 0 ? messageIds.join(' ') : undefined,
        placeholder: localeText.composerInputPlaceholder,
        value: composer.value,
        disabled: composer.disabled,
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          composer.setValue(event.target.value);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) {
            return;
          }
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            !composer.disabled
          ) {
            event.preventDefault();
            void composer.submit();
          }
        },
        onCompositionStart: (event: React.CompositionEvent<HTMLTextAreaElement>) => {
          onCompositionStart?.(event);
          if (!event.defaultPrevented) {
            composer.setComposerIsComposing(true);
          }
        },
        onCompositionEnd: (event: React.CompositionEvent<HTMLTextAreaElement>) => {
          onCompositionEnd?.(event);
          if (!event.defaultPrevented) {
            composer.setComposerIsComposing(false);
          }
        },
      },
    ],
    stateAttributesMapping,
  });
});

export namespace ChatComposerTextArea {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'textarea', State> {
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement> | undefined;
    onCompositionStart?: React.CompositionEventHandler<HTMLTextAreaElement> | undefined;
    onCompositionEnd?: React.CompositionEventHandler<HTMLTextAreaElement> | undefined;
  }
}
