import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadInput } from './FileUploadInput';
import { FileUploadInputDataAttributes } from './FileUploadInputDataAttributes';

export const fileUploadInputStateAttributesMapping: StateAttributesMapping<FileUploadInput.State> = {
  disabled(value): Record<string, string> | null {
    if (!value) {
      return null;
    }

    return {
      [FileUploadInputDataAttributes.disabled]: '',
    };
  },
};
