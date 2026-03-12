'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';
import { useFileRejection } from '../useFileRejection';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className={styles.emptyState}>No files selected.</p>;
  }

  return (
    <FileUpload.PreviewList className={styles.list}>
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file} className={styles.item}>
          <div className={styles.itemContent}>
            <div>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeFile(file.id)}
              aria-label={`Remove ${file.name}`}
            >
              Remove
            </button>
          </div>
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadValidationDemo() {
  const { errorMessages, handleFileChange, handleFileReject } = useFileRejection();

  return (
    <div className={styles.root}>
      <FileUpload.Root
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        minSize={1024}
        maxFiles={5}
        onFileChange={handleFileChange}
        onFileReject={handleFileReject}
      >
        <div className={styles.footer}>
          <FileUpload.Trigger className={styles.trigger} aria-describedby="file-validation-hint">
            Select files
          </FileUpload.Trigger>
          <span id="file-validation-hint" className={styles.hint}>
            Max 5 files • 1KB - 2MB each • Images only
          </span>
        </div>

        <FileList />
      </FileUpload.Root>

      {errorMessages.length > 0 ? (
        <ul className={styles.errorList} role="alert">
          {errorMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
