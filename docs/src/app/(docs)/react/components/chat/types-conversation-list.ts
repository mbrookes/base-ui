import { ChatConversationList } from '@base-ui/chat/chat-conversation-list';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatConversationList);

export const TypesChatConversationList = types;
export const TypesChatConversationListAdditional = AdditionalTypes;
