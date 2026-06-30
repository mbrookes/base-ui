import { ChatConversation } from '@base-ui/chat/chat-conversation';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatConversation);

export const TypesChatConversation = types;
export const TypesChatConversationAdditional = AdditionalTypes;
