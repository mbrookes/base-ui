import * as Chat from './_chat-types';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, Chat);

export const TypesChat = types;
export const TypesChatAdditional = AdditionalTypes;
