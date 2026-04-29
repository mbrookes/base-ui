'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

function FileList() {
  const { files } = FileUpload.useFileUploadContext();

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
            <FileUpload.FileSize bytes={file.size} className={styles.fileSize} />
          </div>
          <FileUpload.Remove
            fileId={file.id}
            className={styles.removeButton}
            aria-label={`Remove ${file.name}`}
          >
            <X className={styles.removeIcon} />
          </FileUpload.Remove>
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
