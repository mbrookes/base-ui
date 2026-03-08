'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className={styles.empty}>No files selected.</p>;
  }

  return (
    <FileUpload.PreviewList className={styles.list}>
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file} className={styles.item}>
          <span className={styles.fileName}>{file.name}</span>
          <button type="button" className={styles.remove} onClick={() => removeFile(file.id)}>
            Remove
          </button>
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadMinimalDemo() {
  return (
    <FileUpload.Root>
      <FileUpload.Input />
      <FileUpload.Dropzone className={styles.dropzone}>
        Drop files here or click to select
      </FileUpload.Dropzone>
      <FileList />
    </FileUpload.Root>
  );
}
