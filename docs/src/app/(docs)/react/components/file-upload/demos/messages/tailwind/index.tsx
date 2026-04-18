'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';

const messages: NonNullable<React.ComponentProps<typeof FileUpload.Root>['messages']> = {
  fileTooLarge: (maxSizeFormatted) => `Archivo demasiado grande (max ${maxSizeFormatted})`,
  maxFilesReached: (count) => `Solo se permite ${count} archivo`,
  filesAdded: (count) =>
    `${count} archivo${count !== 1 ? 's' : ''} agregado${count !== 1 ? 's' : ''}.`,
  filesRejected: (count) =>
    `${count} archivo${count !== 1 ? 's' : ''} rechazado${count !== 1 ? 's' : ''}.`,
  allFilesRemoved: 'Se eliminaron todos los archivos',
};

function SelectedFiles() {
  const { files } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="mt-3 text-sm text-gray-600">Ningun archivo seleccionado.</p>;
  }

  return (
    <ul className="mt-3 list-disc pl-5 text-sm text-gray-900">
      {files.map((file) => (
        <li key={file.id}>{file.name}</li>
      ))}
    </ul>
  );
}

export default function FileUploadMessagesDemo() {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
      <FileUpload.Root maxFiles={1} maxSize={1024 * 1024} accept="image/*" messages={messages}>
        <FileUpload.HiddenInput />
        <FileUpload.Trigger className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-3.5 text-sm font-medium text-gray-900 hover:bg-gray-200">
          Seleccionar archivo
        </FileUpload.Trigger>
        <SelectedFiles />
      </FileUpload.Root>
    </div>
  );
}
