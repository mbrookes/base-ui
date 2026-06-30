import { ChatMessageGroup } from '@base-ui/chat/chat-message-group';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatMessageGroup);

export const TypesChatMessageGroup = types;
export const TypesChatMessageGroupAdditional = AdditionalTypes;
