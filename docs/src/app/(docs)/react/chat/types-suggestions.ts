import { ChatSuggestions } from '@base-ui/chat/chat-suggestions';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatSuggestions);

export const TypesChatSuggestions = types;
export const TypesChatSuggestionsAdditional = AdditionalTypes;
