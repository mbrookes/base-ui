import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadTrigger } from './FileUploadTrigger';
import { FileUploadTriggerDataAttributes } from './FileUploadTriggerDataAttributes';

export const fileUploadTriggerStateAttributesMapping: StateAttributesMapping<FileUploadTrigger.State> =
  {
    disabled(value): Record<string, string> | null {
      return value ? { [FileUploadTriggerDataAttributes.disabled]: '' } : null;
    },
  };
