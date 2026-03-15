import * as React from 'react';
import type { FileUploadRootProps } from '@base-ui/react/file-upload';

type OnFileChange = NonNullable<FileUploadRootProps['onFileChange']>;
type OnFileReject = NonNullable<FileUploadRootProps['onFileReject']>;

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
  const currentActionEventRef = React.useRef<Event | undefined>(undefined);
  const currentActionMessagesRef = React.useRef<string[]>([]);

  const resetCurrentAction = React.useCallback(() => {
    currentActionMessagesRef.current = [];
    currentActionEventRef.current = undefined;
  }, []);

  const handleFileChange = React.useCallback<OnFileChange>(
    (files, eventDetails) => {
      const didAddFiles =
        eventDetails.reason === 'file-added' && files.length > previousFileCountRef.current;
      const didRemoveFiles =
        eventDetails.reason === 'file-removed' && files.length < previousFileCountRef.current;

      previousFileCountRef.current = files.length;

      if (eventDetails.reason === 'files-cleared' || (clearOnRemove && didRemoveFiles)) {
        resetCurrentAction();
        setErrorMessages([]);
        return;
      }

      if (!didAddFiles) {
        return;
      }

      setErrorMessages(
        eventDetails.event === currentActionEventRef.current
          ? [...currentActionMessagesRef.current]
          : [],
      );
      resetCurrentAction();
    },
    [clearOnRemove, resetCurrentAction],
  );

  const handleFileReject = React.useCallback<OnFileReject>((file, reason, eventDetails) => {
    if (eventDetails.event !== currentActionEventRef.current) {
      currentActionEventRef.current = eventDetails.event;
      currentActionMessagesRef.current = [];
    }

    const readableMessage = formatRejectMessage?.(reason, eventDetails.message) ?? eventDetails.message;
    const message = withFilePrefix(file.name, readableMessage);

    if (!currentActionMessagesRef.current.includes(message)) {
      currentActionMessagesRef.current = [...currentActionMessagesRef.current, message];
      setErrorMessages([...currentActionMessagesRef.current]);
    }
  }, [formatRejectMessage]);

  return {
    errorMessages,
    handleFileChange,
    handleFileReject,
  };
}
