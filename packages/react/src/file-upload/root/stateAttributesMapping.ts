import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadRoot } from './FileUploadRoot';
import { FileUploadRootDataAttributes } from './FileUploadRootDataAttributes';

export const fileUploadRootStateAttributesMapping: StateAttributesMapping<FileUploadRoot.State> = {
  disabled(value): Record<string, string> | null {
    return value ? { [FileUploadRootDataAttributes.disabled]: '' } : null;
  },
};
