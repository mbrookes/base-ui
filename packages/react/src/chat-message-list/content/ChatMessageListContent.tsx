'use client';
import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useAnimationFrame } from '@base-ui/utils/useAnimationFrame';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMessageListInternalContext } from '../internals/MessageListInternalContext';

interface RenderedRowProps {
  id: string;
  index: number;
  renderItem(params: { id: string; index: number }): React.ReactNode;
  registerRowElement(id: string, element: HTMLDivElement | null): void;
  scheduleResizeRestore(): void;
}

function RenderedRow(props: RenderedRowProps) {
  const { id, index, renderItem, registerRowElement, scheduleResizeRestore } = props;
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const resizeFrame = useAnimationFrame();

  useIsoLayoutEffect(() => {
    registerRowElement(id, rowRef.current);
    return () => {
      registerRowElement(id, null);
    };
  }, [id, registerRowElement]);

  useIsoLayoutEffect(() => {
    if (!rowRef.current || typeof globalThis.ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new globalThis.ResizeObserver(() => {
      resizeFrame.request(() => {
        scheduleResizeRestore();
      });
    });

    observer.observe(rowRef.current);

    return () => {
      resizeFrame.cancel();
      observer.disconnect();
    };
  }, [resizeFrame, scheduleResizeRestore]);

  return (
    <div data-message-id={id} data-message-list-row="" ref={rowRef} style={{ width: '100%' }}>
      {renderItem({ id, index })}
    </div>
  );
}

/**
 * The content container of the chat message list.
 * Renders the list of message rows.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageListContent = React.forwardRef(function ChatMessageListContent(
  props: ChatMessageListContent.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { ...elementProps } = props;
  const { itemIds, renderItem, getItemKey, registerRowElement, scheduleResizeRestore } =
    useMessageListInternalContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state: {},
    props: [
      elementProps,
      {
        children: itemIds.map((id, index) => (
          <RenderedRow
            id={id}
            index={index}
            key={getItemKey(id, index)}
            registerRowElement={registerRowElement}
            renderItem={renderItem}
            scheduleResizeRestore={scheduleResizeRestore}
          />
        )),
      },
    ],
  });
});

export namespace ChatMessageListContent {
  export type State = Record<string, never>;
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
