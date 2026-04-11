import type { StateAttributesMapping } from '../utils/getStateAttributesProps';
import type { Dropzone } from './Dropzone';
import { DropzoneDataAttributes } from './DropzoneDataAttributes';

export const dropzoneStateAttributesMapping: StateAttributesMapping<Dropzone.State> = {
  dragging(value): Record<string, string> | null {
    return value ? { [DropzoneDataAttributes.dragging]: '' } : null;
  },
  disabled(value): Record<string, string> | null {
    return value ? { [DropzoneDataAttributes.disabled]: '' } : null;
  },
};
