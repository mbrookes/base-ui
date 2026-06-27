import * as ChatMessage from '@base-ui/react/chat-message-docs';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatMessage);

export const TypesChatMessage = types;
export const TypesChatMessageAdditional = AdditionalTypes;
