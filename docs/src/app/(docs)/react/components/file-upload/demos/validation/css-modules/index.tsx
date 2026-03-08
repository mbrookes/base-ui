'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import { useTimeout } from '@base-ui/utils/useTimeout';
import styles from './index.module.css';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p>No files selected.</p>;
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

function RejectionMessage({ reason }: { reason?: string }) {
  return (
    <div className={styles.error}>
      {reason === 'FILE_TOO_LARGE' && 'File is too large. Maximum size is 2MB.'}
      {reason === 'MIME_TYPE_NOT_ALLOWED' && 'File type not allowed. Only images are accepted.'}
      {reason === 'FILE_TOO_SMALL' && 'File is too small. Minimum size is 1KB.'}
      {!reason && 'File was rejected.'}
    </div>
  );
}

export default function FileUploadValidationDemo() {
  const rejectionTimeout = useTimeout();
  const [rejectedFile, setRejectedFile] = React.useState<{
    file: File;
    reason: string;
  } | null>(null);

  return (
    <div className={styles.root}>
      <FileUpload.Root
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        minSize={1024}
        maxFiles={5}
        onFileReject={(file, reason) => {
          setRejectedFile({ file, reason });
          rejectionTimeout.clear();
          rejectionTimeout.start(4000, () => setRejectedFile(null));
        }}
      >
        <FileUpload.Input />

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

      {rejectedFile && (
        <div className={styles.errorContainer} role="alert">
          <strong>Rejected: {rejectedFile.file.name}</strong>
          <RejectionMessage reason={rejectedFile.reason} />
        </div>
      )}
    </div>
  );
}
