import type { StateAttributesMapping } from '../utils/getStateAttributesProps';
import type { Dropzone } from './Dropzone';
import { DropzoneDataAttributes } from './DropzoneDataAttributes';

export const dropzoneStateAttributesMapping: StateAttributesMapping<Dropzone.State> = {
  dragging(value): Record<string, string> | null {
    if (!value) {
      return null;
    }

    return {
      [DropzoneDataAttributes.dragging]: '',
    };
  },
  disabled(value): Record<string, string> | null {
    if (!value) {
      return null;
    }

    return {
      [DropzoneDataAttributes.disabled]: '',
    };
  },
};
