'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useComposerContext } from '../internals/ComposerContext';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
  error: (v: boolean) => (v ? { 'data-error': '' } : null),
};

/**
 * Renders helper text or error messages for the composer.
 * Returns `null` when there is no content to display.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerHelperText = React.forwardRef(function ChatComposerHelperText(
  props: ChatComposerHelperText.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, role, ...elementProps } = props;
  const composer = useComposerContext();
  const hasError = composer.error != null;

  const state: ChatComposerHelperText.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: composer.attachmentCount,
    disabled: composer.disabled,
    error: hasError,
  };

  const content = children ?? composer.error?.message ?? null;

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      role: role ?? (hasError ? 'alert' : undefined),
      children: content,
    },
    stateAttributesMapping,
  });

  if (content == null) {
    return null;
  }

  return element;
});

export namespace ChatComposerHelperText {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
    error: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {}
}
