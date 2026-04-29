import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { FileUploadRemove } from './FileUploadRemove';
import { FileUploadRemoveDataAttributes } from './FileUploadRemoveDataAttributes';

export const fileUploadRemoveStateAttributesMapping: StateAttributesMapping<FileUploadRemove.State> =
  {
    disabled(value: boolean): Record<string, string> | null {
      return value ? { [FileUploadRemoveDataAttributes.disabled]: '' } : null;
    },
  };
