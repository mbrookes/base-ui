import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadPreviewList } from './FileUploadPreviewList';
import { FileUploadPreviewListDataAttributes } from './FileUploadPreviewListDataAttributes';

export const fileUploadPreviewListStateAttributesMapping: StateAttributesMapping<FileUploadPreviewList.State> =
  {
    files(): null {
      return null;
    },
    empty(value): Record<string, string> | null {
      if (!value) {
        return null;
      }

      return {
        [FileUploadPreviewListDataAttributes.empty]: '',
      };
    },
  };
