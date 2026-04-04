'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null) {
    return 'Unknown';
  }
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className={styles.emptyState}>No files selected yet.</p>;
  }

  return (
    <ul className={styles.fileList}>
      {files.map((file) => (
        <li key={file.id} className={styles.fileRow}>
          <div className={styles.fileMeta}>
            <span className={styles.fileName} title={file.name}>
              {file.name}
            </span>
            <span className={styles.fileSize}>{formatBytes(file.size)}</span>
          </div>
          <button
            type="button"
            onClick={() => removeFile(file.id)}
            className={styles.removeButton}
            title={`Remove ${file.name}`}
            aria-label={`Remove ${file.name}`}
          >
            <X className={styles.removeIcon} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function FileUploadDemo() {
  const maxFiles = 5;
  const [isUploadDisabled, setIsUploadDisabled] = React.useState(false);

  const handleDemoFileChange = React.useCallback<
    NonNullable<React.ComponentProps<typeof FileUpload.Root>['onFilesChange']>
  >(
    (files) => {
      setIsUploadDisabled(files.length >= maxFiles);
    },
    [maxFiles],
  );

  return (
    <div className={styles.container}>
      <FileUpload.Root
        maxFiles={maxFiles}
        maxSize={5 * 1024 * 1024}
        accept="image/png, image/jpeg, image/gif"
        multiple
        disabled={isUploadDisabled}
        onFilesChange={handleDemoFileChange}
      >
        <FileUpload.HiddenInput />
        <FileUpload.Trigger className={styles.trigger}>
          {isUploadDisabled ? 'Upload limit reached' : 'Select files'}
        </FileUpload.Trigger>

        <FileList />
      </FileUpload.Root>
    </div>
  );
}
