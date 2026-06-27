'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type {
  ChatDynamicToolMessagePart,
  ChatToolInvocationState,
  ChatToolMessagePart,
} from '../../chat/types/chat-message-parts';
import type {
  ChatPartRenderer,
  ChatPartRendererProps,
} from '../../chat/renderers/chatPartRenderer';
import type { ChatRole } from '../../chat/types/chat-entities';
import { useChat } from '../../chat/hooks/useChat';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useMessageContentTabIndex } from '../../chat-message-list/internals/MessageRovingContext';
import { formatStructuredValue } from './partUtils';
import { type ChatToolExpand, ToolDisclosureContext, useToolDisclosure } from './toolDisclosure';
import type { ToolPartOwnerState, ToolPartSectionOwnerState } from './toolDisclosure';

type ToolPart = ChatToolMessagePart | ChatDynamicToolMessagePart;

function buildPreviewValue(formatted: string): string {
  const firstLine = formatted.split('\n').find((line) => line.trim().length > 0) ?? '';
  const trimmed = firstLine.trim();
  if (trimmed.length <= 60) {
    return trimmed;
  }
  return `${trimmed.slice(0, 60)}…`;
}

function ToolPayloadSection(props: {
  label: string;
  ownerState: ToolPartOwnerState;
  section: 'input' | 'output';
  value: unknown;
}) {
  const { label, ownerState, section, value } = props;
  const formatted = React.useMemo(() => formatStructuredValue(value), [value]);
  const previewValue = React.useMemo(() => buildPreviewValue(formatted), [formatted]);
  const contentTabIndex = useMessageContentTabIndex();

  const sectionOwnerState: ToolPartSectionOwnerState = React.useMemo(
    () => ({
      ...ownerState,
      section,
      summaryLabel: label,
      previewValue,
    }),
    [ownerState, section, label, previewValue],
  );

  const [open, setOpen] = useToolDisclosure(sectionOwnerState, false);

  return (
    <details
      open={open || undefined}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary tabIndex={contentTabIndex}>{label}</summary>
      <pre>{formatted}</pre>
    </details>
  );
}

const stateAttributesMapping = {
  messageId: () => null,
  role: () => null,
  toolName: (v: string) => ({ 'data-tool-name': v }),
  state: (v: string) => ({ 'data-tool-state': v }),
  isMessageStreaming: () => null,
};

/**
 * Renders a tool invocation card (header, input/output sections, approval actions).
 * Used as a `ChatPartRenderer` for `'tool'` and `'dynamic-tool'` part types.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageToolPart = React.forwardRef(function ChatMessageToolPart(
  props: ChatMessageToolPart.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    index: _index,
    message,
    onToolCall: _onToolCall,
    part,
    defaultExpanded,
    ...elementProps
  } = props;

  const { addToolApprovalResponse } = useChat();
  const localeText = useChatLocaleText();
  const [pendingApproval, setPendingApproval] = React.useState(false);
  const contentTabIndex = useMessageContentTabIndex();

  const toolName = part.toolInvocation.toolName;
  const isMessageStreaming = message.status === 'streaming';

  const ownerState: ToolPartOwnerState = React.useMemo(
    () => ({
      messageId: message.id,
      pendingApproval,
      role: message.role,
      state: part.toolInvocation.state,
      toolName,
      isMessageStreaming,
    }),
    [
      message.id,
      message.role,
      part.toolInvocation.state,
      toolName,
      pendingApproval,
      isMessageStreaming,
    ],
  );

  const boundExpansion = React.useMemo(() => {
    const policy = defaultExpanded?.[toolName] ?? defaultExpanded?.['*'];
    if (policy === undefined) {
      return undefined;
    }
    return typeof policy === 'function' ? policy : () => policy;
  }, [defaultExpanded, toolName]);

  const disclosureRef = React.useRef<HTMLDetailsElement>(null);
  const isRunning =
    part.toolInvocation.state === 'input-streaming' ||
    part.toolInvocation.state === 'input-available';
  const [cardOpen, setCardOpen] = useToolDisclosure(ownerState, isRunning, disclosureRef);

  const handleApproval = React.useCallback(
    async (approved: boolean) => {
      setPendingApproval(true);
      try {
        await addToolApprovalResponse({
          id: part.toolInvocation.approvalId ?? part.toolInvocation.toolCallId,
          approved,
        });
      } catch {
        // Errors surface through the chat runtime error channel.
      } finally {
        setPendingApproval(false);
      }
    },
    [addToolApprovalResponse, part.toolInvocation.approvalId, part.toolInvocation.toolCallId],
  );

  const { toolInvocation } = part;
  const toolTitle = toolInvocation.title ?? toolInvocation.toolName;
  const stateLabel = localeText.toolStateLabel(toolInvocation.state as ChatToolInvocationState);

  const showInput =
    (toolInvocation.state === 'input-streaming' ||
      toolInvocation.state === 'input-available' ||
      toolInvocation.state === 'approval-requested' ||
      toolInvocation.state === 'approval-responded' ||
      toolInvocation.state === 'output-available' ||
      toolInvocation.state === 'output-error') &&
    toolInvocation.input !== undefined;

  const showOutput =
    toolInvocation.state === 'output-available' && toolInvocation.output !== undefined;

  const state: ChatMessageToolPart.State = {
    messageId: message.id,
    pendingApproval,
    role: message.role,
    state: part.toolInvocation.state as ChatToolInvocationState,
    toolName,
    isMessageStreaming,
  };

  return (
    <ToolDisclosureContext.Provider value={boundExpansion}>
      {useRenderElement('div', props, {
        ref: forwardedRef,
        state,
        props: [
          elementProps,
          {
            children: (
              <details
                open={cardOpen || undefined}
                ref={disclosureRef}
                onToggle={(e) => setCardOpen((e.currentTarget as HTMLDetailsElement).open)}
              >
                <summary tabIndex={contentTabIndex}>
                  <span>{toolTitle}</span>
                  {stateLabel ? <span>{stateLabel}</span> : null}
                </summary>
                {showInput ? (
                  <ToolPayloadSection
                    label={localeText.messageToolInputLabel}
                    ownerState={ownerState}
                    section="input"
                    value={toolInvocation.input}
                  />
                ) : null}
                {showOutput ? (
                  <ToolPayloadSection
                    label={localeText.messageToolOutputLabel}
                    ownerState={ownerState}
                    section="output"
                    value={toolInvocation.output}
                  />
                ) : null}
                {toolInvocation.state === 'output-error' && toolInvocation.errorText ? (
                  <div>{toolInvocation.errorText}</div>
                ) : null}
                {toolInvocation.state === 'output-denied' ? (
                  <div>
                    {toolInvocation.approval?.reason ?? localeText.toolStateLabel('output-denied')}
                  </div>
                ) : null}
                {toolInvocation.state === 'approval-requested' ? (
                  <div>
                    <button
                      disabled={pendingApproval}
                      tabIndex={contentTabIndex}
                      type="button"
                      onClick={async (event) => {
                        if (!event.defaultPrevented) {
                          await handleApproval(true);
                        }
                      }}
                    >
                      {localeText.messageToolApproveButtonLabel}
                    </button>
                    <button
                      disabled={pendingApproval}
                      tabIndex={contentTabIndex}
                      type="button"
                      onClick={async (event) => {
                        if (!event.defaultPrevented) {
                          await handleApproval(false);
                        }
                      }}
                    >
                      {localeText.messageToolDenyButtonLabel}
                    </button>
                  </div>
                ) : null}
              </details>
            ),
          },
        ],
        stateAttributesMapping,
      })}
    </ToolDisclosureContext.Provider>
  );
});

export namespace ChatMessageToolPart {
  export interface State {
    messageId: string;
    pendingApproval: boolean;
    role: ChatRole;
    state: ChatToolInvocationState;
    toolName: string;
    isMessageStreaming: boolean;
  }

  export interface Props
    extends ChatPartRendererProps<ToolPart>, Omit<BaseUIComponentProps<'div', State>, 'children'> {
    defaultExpanded?: Record<string, ChatToolExpand | undefined>;
  }
}

// Re-export as ToolPart for backwards compat with x-chat-headless naming
export { ChatMessageToolPart as ToolPart };

export type ToolPartExternalProps = Omit<
  ChatMessageToolPart.Props,
  'index' | 'message' | 'onToolCall' | 'part'
>;

export function createToolPartRenderer(
  defaultProps: ToolPartExternalProps = {},
): ChatPartRenderer<ToolPart> {
  return function ToolPartRendererFn(rendererProps) {
    return <ChatMessageToolPart {...defaultProps} {...rendererProps} />;
  };
}
