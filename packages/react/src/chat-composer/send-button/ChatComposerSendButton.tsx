'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useComposerContext } from '../internals/ComposerContext';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
};

/**
 * The send button for the chat composer.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerSendButton = React.forwardRef(function ChatComposerSendButton(
  props: ChatComposerSendButton.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { ...elementProps } = props;
  const composer = useComposerContext();
  const localeText = useChatLocaleText();

  const effectivelyDisabled =
    (!composer.hasValue && composer.attachmentCount === 0) ||
    composer.streaming ||
    composer.disabled;

  const state: ChatComposerSendButton.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: composer.attachmentCount,
    disabled: effectivelyDisabled,
  };

  const { getButtonProps, buttonRef } = useButton({
    disabled: effectivelyDisabled,
    focusableWhenDisabled: true,
  });

  return useRenderElement('button', props, {
    ref: [forwardedRef, buttonRef],
    state,
    props: [
      elementProps,
      getButtonProps({
        'aria-label': localeText.composerSendButtonLabel,
        type: 'submit' as const,
      }),
    ],
    stateAttributesMapping,
  });
});

export namespace ChatComposerSendButton {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'button', State> {}
}
