'use client';

import * as React from 'react';
import { Dropzone } from '@base-ui/react/dropzone';
import { FileUpload } from '@base-ui/react/file-upload';
import styles from './index.module.css';

function SelectedFiles() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className={styles.empty}>No files selected yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {files.map((file) => (
        <li key={file.id} className={styles.item}>
          <span className={styles.fileName} title={file.name}>
            {file.name}
          </span>
          <button type="button" className={styles.remove} onClick={() => removeFile(file.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

function UploadDropzone() {
  const { openFileDialog, addFiles } = FileUpload.useFileUploadContext();

  return (
    <Dropzone
      className={styles.dropzone}
      onOpen={openFileDialog}
      onFilesDrop={(files, event) => addFiles(files, event.nativeEvent)}
    >
      <p className={styles.heading}>Drop files here or click</p>
    </Dropzone>
  );
}

export default function ExampleDropzoneFileUploadIntegration() {
  return (
    <div className={styles.container}>
      <FileUpload.Root multiple>
        <FileUpload.HiddenInput />
        <UploadDropzone />
        <SelectedFiles />
      </FileUpload.Root>
    </div>
  );
}
