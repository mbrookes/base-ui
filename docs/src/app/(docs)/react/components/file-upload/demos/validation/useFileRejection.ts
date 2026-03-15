import { useFileRejection as useSharedFileRejection } from '../useFileRejection';

const MIME_TYPE_NOT_ALLOWED_MESSAGE = 'File type not allowed. Only images are accepted.';

export function useFileRejection() {
  return useSharedFileRejection({
    formatRejectMessage(reason, message) {
      if (reason === 'MIME_TYPE_NOT_ALLOWED') {
        return MIME_TYPE_NOT_ALLOWED_MESSAGE;
      }

      return message;
    },
  });
}
