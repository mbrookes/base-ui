'use client';

import * as React from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileUpload } from '@base-ui/react/file-upload';
import { Progress } from '@base-ui/react/progress';
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

function FilePreviewItems() {
  const { files, removeFile, updateFile } = FileUpload.useFileUploadContext();

  // Simulate upload progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      files.forEach((file) => {
        if (file.status !== 'idle' && file.status !== 'uploading') {
          return;
        }

        const newProgress = Math.min(file.progress + Math.random() * 15, 100);
        updateFile(file.id, {
          progress: newProgress,
          status: newProgress >= 100 ? 'success' : 'uploading',
        });
      });
    }, 300);

    return () => clearInterval(interval);
  }, [files, updateFile]);

  return (
    <React.Fragment>
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file} className={styles.previewItem}>
          <div className={styles.previewContent}>
            <div className={styles.previewImage}>
              <img src={file.preview} alt={file.name} className={styles.image} />
            </div>
            <div className={styles.previewInfo}>
              <p className={styles.fileName} title={file.name}>
                {file.name}
              </p>
              <p className={styles.fileSize}>{formatBytes(file.size)}</p>
              {(file.status === 'uploading' || file.status === 'idle') && (
                <Progress.Root
                  value={file.progress}
                  className={styles.progress}
                  aria-label={`Upload progress for ${file.name}`}
                >
                  <Progress.Track className={styles.progressTrack}>
                    <Progress.Indicator className={styles.progressIndicator} />
                  </Progress.Track>
                </Progress.Root>
              )}
              <div className={styles.statusContainer}>
                {file.status === 'success' && (
                  <span className={styles.statusSuccess}>
                    <CheckCircle2 className={styles.statusIcon} /> Complete
                  </span>
                )}
                {file.status === 'error' && (
                  <span className={styles.statusError}>
                    <AlertCircle className={styles.statusIcon} /> Error
                  </span>
                )}
              </div>
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
          </div>
        </FileUpload.PreviewItem>
      ))}
    </React.Fragment>
  );
}

export default function FileUploadDemo() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const previousFileCountRef = React.useRef(0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upload Images</h3>
        <p className={styles.subtitle}>PNG, JPG, GIF up to 5MB</p>
      </div>

      <FileUpload.Root
        maxFiles={5}
        maxSize={5 * 1024 * 1024}
        accept="image/png, image/jpeg, image/gif"
        multiple
        onFilesChange={(files, eventDetails) => {
          const previousFileCount = previousFileCountRef.current;
          previousFileCountRef.current = files.length;

          if (eventDetails.reason === 'file-added' && files.length > previousFileCount) {
            setErrorMessage(null);
          }
        }}
        onFileReject={(_, __, details) => {
          setErrorMessage(details.message);
        }}
      >
        <FileUpload.Dropzone className={styles.dropzone}>
          {({ isDragging }) => (
            <div className={styles.dropzoneContent}>
              <div className={`${styles.dropzoneIcon} ${isDragging ? styles.dragging : ''}`}>
                <UploadCloud className={styles.icon} aria-hidden="true" />
              </div>
              <div className={styles.dropzoneText}>
                <span className={styles.dropzoneAction}>Click to upload</span>
                <p className={styles.dropzoneOr}>or drag and drop</p>
              </div>
              <p className={styles.dropzoneHint}>up to 5 images, max 5MB each</p>
            </div>
          )}
        </FileUpload.Dropzone>

        <FileUpload.PreviewList className={styles.previewList}>
          <FilePreviewItems />
        </FileUpload.PreviewList>

        {errorMessage ? (
          <p role="alert" className={styles.errorMessage}>
            {errorMessage}
          </p>
        ) : null}
      </FileUpload.Root>
    </div>
  );
}
