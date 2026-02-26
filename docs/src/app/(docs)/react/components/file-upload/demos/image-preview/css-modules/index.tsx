'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

function ImagePreviewItem({ file }: { file: FileUpload.Root.ExtendedFile }) {
  const { onRemove } = FileUpload.useFileUploadPreviewItem();

  return (
    <div className={styles.imageItem}>
      {file.preview && (
        <img
          src={file.preview}
          alt={file.name}
          className={styles.image}
        />
      )}
      <div className={styles.imageInfo}>
        <div className={styles.imageName}>{file.name}</div>
        <div className={styles.imageSize}>{(file.size / 1024).toFixed(1)} KB</div>
      </div>
      <button
        type="button"
        className={styles.removeBtn}
        onClick={onRemove}
        title="Remove image"
      >
        ✕
      </button>
    </div>
  );
}

function ImagePreviewList() {
  const { files } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className={styles.empty}>No images selected</p>;
  }

  return (
    <FileUpload.PreviewList className={styles.grid}>
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file}>
          <ImagePreviewItem file={file} />
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadImagePreviewDemo() {
  return (
    <div className={styles.root}>
      <FileUpload.Root accept="image/*" maxFiles={10} maxSize={5 * 1024 * 1024}>
        <FileUpload.Input />

        <FileUpload.Dropzone className={styles.dropzone}>
          {({ isDragging }) => (
            <div className={`${styles.dropzoneContent} ${isDragging ? styles.isDragging : ''}`}>
              <div className={styles.icon}>📸</div>
              <div>
                <p>{isDragging ? 'Drop images here' : 'Drag images here'}</p>
                <span className={styles.hint}>or click to select</span>
              </div>
            </div>
          )}
        </FileUpload.Dropzone>

        <div className={styles.actions}>
          <FileUpload.Trigger className={styles.selectBtn}>Select images</FileUpload.Trigger>
          <span className={styles.info}>Up to 10 images, 5MB each</span>
        </div>

        <ImagePreviewList />
      </FileUpload.Root>
    </div>
  );
}
