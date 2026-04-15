import type { StateAttributesMapping } from '../internals/getStateAttributesProps';
import type { Dropzone } from './Dropzone';
import { DropzoneDataAttributes } from './DropzoneDataAttributes';

export const dropzoneStateAttributesMapping: StateAttributesMapping<Dropzone.State> = {
  dragging(value: boolean): Record<string, string> | null {
    return value ? { [DropzoneDataAttributes.dragging]: '' } : null;
  },
  disabled(value: boolean): Record<string, string> | null {
    return value ? { [DropzoneDataAttributes.disabled]: '' } : null;
  },
};
