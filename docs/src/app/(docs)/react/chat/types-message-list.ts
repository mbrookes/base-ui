import { ChatMessageList } from '@base-ui/chat/chat-message-list';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatMessageList);

export const TypesChatMessageList = types;
export const TypesChatMessageListAdditional = AdditionalTypes;
