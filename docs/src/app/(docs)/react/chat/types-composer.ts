import { ChatComposer } from '@base-ui/chat/chat-composer';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ChatComposer);

export const TypesChatComposer = types;
export const TypesChatComposerAdditional = AdditionalTypes;
