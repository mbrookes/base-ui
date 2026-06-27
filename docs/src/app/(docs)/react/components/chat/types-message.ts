import * as ChatMessage from './_chat-message-types';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatMessage);

export const TypesChatMessage = types;
export const TypesChatMessageAdditional = AdditionalTypes;
