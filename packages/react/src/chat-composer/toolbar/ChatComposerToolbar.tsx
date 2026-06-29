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
 * A container for composer action buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerToolbar = React.forwardRef(function ChatComposerToolbar(
  props: ChatComposerToolbar.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { ...elementProps } = props;
  const composer = useComposerContext();
  const localeText = useChatLocaleText();

  const state: ChatComposerToolbar.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: composer.attachmentCount,
    disabled: composer.disabled,
  };

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        role: 'group' as const,
        'aria-label': localeText.composerToolbarLabel,
      },
    ],
    stateAttributesMapping,
  });
});

export namespace ChatComposerToolbar {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {}
}
