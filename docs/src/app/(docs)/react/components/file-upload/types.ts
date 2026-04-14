import { FileUpload } from '@base-ui/react/file-upload';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, FileUpload);

export const TypesFileUpload = types;
export const TypesFileUploadAdditional = AdditionalTypes;