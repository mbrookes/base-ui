'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p>No files selected. Maximum 5 files, 2MB each.</p>;
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
  const [rejectedFile, setRejectedFile] = React.useState<{
    file: File;
    reason?: string;
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
          // Auto-dismiss error after 4 seconds
          setTimeout(() => setRejectedFile(null), 4000);
        }}
      >
        <FileUpload.Input />
        <FileUpload.Dropzone className={styles.dropzone}>
          {({ isDragging }) => (
            <div
              className={`${styles.dropzoneContent} ${isDragging ? styles.isDragging : ''}`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v12m0 0l-3.5-3.5m3.5 3.5l3.5-3.5M2 12h8m0 0v8m0-8H2m12 8h8m0-8h-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                {isDragging ? (
                  <React.Fragment>
                    <p>Drop your image files here</p>
                    <span className={styles.subtitle}>Images only, up to 2MB each</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <p>Drag and drop images here</p>
                    <span className={styles.subtitle}>or click to browse</span>
                  </React.Fragment>
                )}
              </div>
            </div>
          )}
        </FileUpload.Dropzone>

        <div className={styles.footer}>
          <FileUpload.Trigger className={styles.trigger}>Browse files</FileUpload.Trigger>
          <span className={styles.hint}>Max 5 files • 1KB - 2MB each</span>
        </div>

        <FileList />
      </FileUpload.Root>

      {rejectedFile && (
        <div className={styles.errorContainer}>
          <strong>Rejected: {rejectedFile.file.name}</strong>
          <RejectionMessage reason={rejectedFile.reason} />
        </div>
      )}
    </div>
  );
}
