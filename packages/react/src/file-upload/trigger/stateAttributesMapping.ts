import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { FileUploadTrigger } from './FileUploadTrigger';
import { FileUploadTriggerDataAttributes } from './FileUploadTriggerDataAttributes';

export const fileUploadTriggerStateAttributesMapping: StateAttributesMapping<FileUploadTrigger.State> =
  {
    disabled(value: boolean): Record<string, string> | null {
      return value ? { [FileUploadTriggerDataAttributes.disabled]: '' } : null;
    },
  };
