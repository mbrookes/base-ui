import type { StateAttributesMapping } from '../internals/getStateAttributesProps';
import type { DropzoneRootState } from './root/DropzoneRoot';
import { DropzoneDataAttributes } from './DropzoneDataAttributes';

export const dropzoneStateAttributesMapping: StateAttributesMapping<DropzoneRootState> = {
  dragging(value: boolean): Record<string, string> | null {
    return value ? { [DropzoneDataAttributes.dragging]: '' } : null;
  },
  disabled(value: boolean): Record<string, string> | null {
    return value ? { [DropzoneDataAttributes.disabled]: '' } : null;
  },
};
