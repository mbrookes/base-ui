'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from '../../internals/useRenderElement';
import { useButton } from '../../internals/use-button';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ChatAttachmentRejection } from '../../chat/types/chat-entities';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useComposerContext } from '../internals/ComposerContext';
import { matchesMimeType } from '../internals/matchesMimeType';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
};

/**
 * A button that opens a file picker to attach files to the message.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerAttachButton = React.forwardRef(function ChatComposerAttachButton(
  props: ChatComposerAttachButton.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { children, onClick, ...elementProps } = props;
  const composer = useComposerContext();
  const localeText = useChatLocaleText();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleClick = useStableCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    (onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(event);
    if (!event.defaultPrevented) {
      inputRef.current?.click();
    }
  });

  const state: ChatComposerAttachButton.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: composer.attachmentCount,
    disabled: composer.disabled,
  };

  const { attachmentConfig } = composer;
  const acceptAttr = attachmentConfig?.acceptedMimeTypes?.join(',') || undefined;

  const { getButtonProps, buttonRef } = useButton({
    disabled: composer.disabled,
    focusableWhenDisabled: true,
  });

  return (
    <React.Fragment>
      <input
        aria-label={localeText.composerAttachInputLabel}
        hidden
        multiple
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(event.currentTarget.files ?? []);
          const rejections: ChatAttachmentRejection[] = [];
          const accepted: File[] = [];
          const currentCount = composer.attachmentCount;

          for (const file of files) {
            if (
              attachmentConfig?.acceptedMimeTypes &&
              attachmentConfig.acceptedMimeTypes.length > 0 &&
              !matchesMimeType(file.type, attachmentConfig.acceptedMimeTypes)
            ) {
              rejections.push({ file, reason: 'mime-type' });
              continue;
            }
            if (attachmentConfig?.maxFileSize != null && file.size > attachmentConfig.maxFileSize) {
              rejections.push({ file, reason: 'file-size' });
              continue;
            }
            if (
              attachmentConfig?.maxFileCount != null &&
              currentCount + accepted.length >= attachmentConfig.maxFileCount
            ) {
              rejections.push({ file, reason: 'file-count' });
              continue;
            }
            accepted.push(file);
          }

          if (rejections.length > 0) {
            attachmentConfig?.onAttachmentReject?.(rejections);
          }

          for (const file of accepted) {
            composer.addAttachment(file);
          }

          event.currentTarget.value = '';
        }}
      />
      {useRenderElement('button', props, {
        ref: [forwardedRef, buttonRef],
        state,
        props: [
          elementProps,
          getButtonProps({
            type: 'button' as const,
            'aria-label': localeText.composerAttachButtonLabel,
            children,
            onClick: handleClick,
          }),
        ],
        stateAttributesMapping,
      })}
    </React.Fragment>
  );
});

export namespace ChatComposerAttachButton {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends Omit<BaseUIComponentProps<'button', State>, 'type'> {}
}
