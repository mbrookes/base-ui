'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { LabelableProvider } from '../../internals/labelable-provider';
import { useChatComposer } from '../../chat/hooks/useChatComposer';
import { useChatStatus } from '../../chat/hooks/useChatStatus';
import { useChatStore } from '../../chat/hooks/useChatStore';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import type { ChatAttachmentsConfig } from '../../chat/types/chat-entities';
import { ComposerContextProvider, type ComposerContextValue } from '../internals/ComposerContext';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
};

/**
 * The root form element for the chat composer.
 * Renders a `<form>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerRoot = React.forwardRef(function ChatComposerRoot(
  props: ChatComposerRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
) {
  const {
    render,
    className,
    style,
    children,
    disabled = false,
    attachmentConfig,
    onSubmit,
    ...elementProps
  } = props;

  const composer = useChatComposer();
  const status = useChatStatus();
  const store = useChatStore();
  const localeText = useChatLocaleText();

  const state: ChatComposerRoot.State = {
    submitting: composer.isSubmitting,
    hasValue: composer.value.trim() !== '',
    streaming: status.isStreaming,
    attachmentCount: composer.attachments.length,
    disabled,
  };

  const contextValue = React.useMemo<ComposerContextValue>(
    () => ({
      ...state,
      value: composer.value,
      setValue: composer.setValue,
      submit: composer.submit,
      addAttachment: composer.addAttachment,
      removeAttachment: composer.removeAttachment,
      attachments: composer.attachments,
      attachmentConfig,
      error: status.error,
      setComposerIsComposing: store.setComposerIsComposing,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      attachmentConfig,
      composer.addAttachment,
      composer.removeAttachment,
      composer.attachments,
      composer.setValue,
      composer.submit,
      composer.value,
      composer.isSubmitting,
      status.isStreaming,
      status.error,
      store,
      disabled,
    ],
  );

  return (
    <ComposerContextProvider value={contextValue}>
      <LabelableProvider>
        {useRenderElement('form', props, {
          ref: forwardedRef,
          state,
          props: {
            ...elementProps,
            'aria-label': localeText.composerLandmarkLabel,
            children,
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              let submitPrevented = false;
              const originalPreventDefault = event.preventDefault.bind(event);
              event.preventDefault = () => {
                submitPrevented = true;
                originalPreventDefault();
              };
              onSubmit?.(event);
              if (submitPrevented || disabled) {
                return;
              }
              void composer.submit();
            },
          },
          stateAttributesMapping,
        })}
      </LabelableProvider>
    </ComposerContextProvider>
  );
});

export namespace ChatComposerRoot {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'form', State> {
    onSubmit?: React.FormEventHandler<HTMLFormElement> | undefined;
    disabled?: boolean | undefined;
    attachmentConfig?: ChatAttachmentsConfig | undefined;
  }
}
