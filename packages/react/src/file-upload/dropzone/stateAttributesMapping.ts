import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadDropzoneDataAttributes } from './FileUploadDropzoneDataAttributes';

export const fileUploadDropzoneStateAttributesMapping: StateAttributesMapping<FileUploadDropzone.State> =
  {
    dragging(value): Record<string, string> | null {
      if (!value) {
        return null;
      }

      return {
        [FileUploadDropzoneDataAttributes.dragging]: '',
      };
    },
    disabled(value): Record<string, string> | null {
      if (!value) {
        return null;
      }

      return {
        [FileUploadDropzoneDataAttributes.disabled]: '',
      };
    },
  };
