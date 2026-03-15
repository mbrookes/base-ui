import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';
import type { FileUploadPreviewList } from './FileUploadPreviewList';
import { FileUploadPreviewListDataAttributes } from './FileUploadPreviewListDataAttributes';

export const fileUploadPreviewListStateAttributesMapping: StateAttributesMapping<FileUploadPreviewList.State> =
  {
    empty(value): Record<string, string> | null {
      if (!value) {
        return null;
      }

      return {
        [FileUploadPreviewListDataAttributes.empty]: '',
      };
    },
    // Suppresses the default `data-files` attribute that getStateAttributesProps
    // would otherwise emit for this non-boolean array value.
    files(_files): Record<string, string> | null {
      return null;
    },
  };
