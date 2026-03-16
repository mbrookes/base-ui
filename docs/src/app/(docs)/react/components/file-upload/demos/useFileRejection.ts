import * as React from 'react';
import type { FileUploadRootProps } from '@base-ui/react/file-upload';

type OnFileDrop = NonNullable<FileUploadRootProps['onFileDrop']>;
type OnFileChange = NonNullable<FileUploadRootProps['onFileChange']>;

type UseFileRejectionOptions = {
  clearOnRemove?: boolean;
  formatRejectMessage?: ((reason: string, message: string) => string) | undefined;
};

function withFilePrefix(fileName: string, message: string) {
  const prefix = `${fileName}: `;

  if (message.startsWith(prefix)) {
    return message;
  }

  return `${fileName}: ${message}`;
}

export function useFileRejection(options: UseFileRejectionOptions = {}) {
  const { clearOnRemove = true, formatRejectMessage } = options;

  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const previousFileCountRef = React.useRef(0);

  const handleFileDrop = React.useCallback<OnFileDrop>(
    (_acceptedFiles, fileRejections) => {
      const messages = fileRejections.map(({ file, reason, eventDetails }) => {
        const readable =
          formatRejectMessage?.(reason, eventDetails.message) ?? eventDetails.message;
        return withFilePrefix(file.name, readable);
      });
      setErrorMessages([...new Set(messages)]);
    },
    [formatRejectMessage],
  );

  const handleFileChange = React.useCallback<OnFileChange>(
    (files, eventDetails) => {
      const didRemoveFiles =
        eventDetails.reason === 'file-removed' && files.length < previousFileCountRef.current;

      previousFileCountRef.current = files.length;

      if (eventDetails.reason === 'files-cleared' || (clearOnRemove && didRemoveFiles)) {
        setErrorMessages([]);
      }
    },
    [clearOnRemove],
  );

  return {
    errorMessages,
    handleFileDrop,
    handleFileChange,
  };
}
