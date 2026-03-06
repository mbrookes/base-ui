import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadPreviewItem } from './FileUploadPreviewItem';
import { FileUploadPreviewItemDataAttributes } from './FileUploadPreviewItemDataAttributes';

export const fileUploadPreviewItemStateAttributesMapping: StateAttributesMapping<FileUploadPreviewItem.State> =
  {
    uploading(value): Record<string, string> | null {
      if (!value) {
        return null;
      }

      return {
        [FileUploadPreviewItemDataAttributes.uploading]: '',
      };
    },
    complete(value): Record<string, string> | null {
      if (!value) {
        return null;
      }

      return {
        [FileUploadPreviewItemDataAttributes.complete]: '',
      };
    },
  };
