'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useComposerContext } from '../internals/ComposerContext';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
};

/**
 * A `<label>` element for the conversation input textarea.
 * Renders a `<label>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerLabel = React.forwardRef(function ChatComposerLabel(
  props: ChatComposerLabel.Props,
  forwardedRef: React.ForwardedRef<HTMLLabelElement>,
) {
  const { children, htmlFor, ...elementProps } = props;
  const composer = useComposerContext();
  const localeText = useChatLocaleText();

  const state: ChatComposerLabel.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: composer.attachmentCount,
    disabled: composer.disabled,
  };

  return useRenderElement('label', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      htmlFor,
      children: children ?? localeText.composerInputAriaLabel,
    },
    stateAttributesMapping,
  });
});

export namespace ChatComposerLabel {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'label', State> {
    htmlFor?: string | undefined;
  }
}
