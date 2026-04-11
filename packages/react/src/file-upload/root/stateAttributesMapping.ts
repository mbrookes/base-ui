import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadRoot } from './FileUploadRoot';
import { FileUploadRootDataAttributes } from './FileUploadRootDataAttributes';

export const fileUploadRootStateAttributesMapping: StateAttributesMapping<FileUploadRoot.State> = {
  disabled(value): Record<string, string> | null {
    if (!value) {
      return null;
    }

    return {
      [FileUploadRootDataAttributes.disabled]: '',
    };
  },
};
