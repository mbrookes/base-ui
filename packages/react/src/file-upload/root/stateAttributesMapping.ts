import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { FileUploadRoot } from './FileUploadRoot';
import { FileUploadRootDataAttributes } from './FileUploadRootDataAttributes';

export const fileUploadRootStateAttributesMapping: StateAttributesMapping<FileUploadRoot.State> = {
  disabled(value: boolean): Record<string, string> | null {
    return value ? { [FileUploadRootDataAttributes.disabled]: '' } : null;
  },
};
