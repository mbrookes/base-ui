'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

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
    return <p className={styles.empty}>Ningun archivo seleccionado.</p>;
  }

  return (
    <ul className={styles.fileList}>
      {files.map((file) => (
        <li key={file.id}>{file.name}</li>
      ))}
    </ul>
  );
}

export default function FileUploadMessagesDemo() {
  return (
    <div className={styles.container}>
      <FileUpload.Root maxFiles={1} maxSize={1024 * 1024} accept="image/*" messages={messages}>
        <FileUpload.HiddenInput />
        <FileUpload.Trigger className={styles.trigger}>Seleccionar archivo</FileUpload.Trigger>
        <SelectedFiles />
      </FileUpload.Root>
    </div>
  );
}
