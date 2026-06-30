import { createMultipleTypes } from 'docs/src/utils/createTypes';
import * as ChatMessage from './_chat-message-types';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatMessage);

export const TypesChatMessage = types;
export const TypesChatMessageAdditional = AdditionalTypes;
