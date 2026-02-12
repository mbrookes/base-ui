'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p>No files selected.</p>;
  }

  return (
    <FileUpload.PreviewList>
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file}>
          <span>{file.name}</span>{' '}
          <button type="button" onClick={() => removeFile(file.id)}>
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
      <FileUpload.Dropzone>Drop files here or click to select</FileUpload.Dropzone>
      <FileUpload.Trigger>Choose files</FileUpload.Trigger>
      <FileList />
    </FileUpload.Root>
  );
}
