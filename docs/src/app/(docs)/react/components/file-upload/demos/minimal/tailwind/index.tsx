'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No files selected.</p>;
  }

  return (
    <FileUpload.PreviewList className="mt-3 space-y-2">
      {files.map((file) => (
        <FileUpload.PreviewItem
          key={file.id}
          file={file}
          className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
        >
          <span className="truncate text-sm text-gray-900">{file.name}</span>
          <button
            type="button"
            className="text-sm text-gray-900 hover:text-gray-700"
            onClick={() => removeFile(file.id)}
          >
            Remove
          </button>
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadMinimalTailwindDemo() {
  return (
    <FileUpload.Root>
      <FileUpload.Input />
      <FileUpload.Dropzone className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600 hover:bg-gray-50">
        Drop files here or click to select
      </FileUpload.Dropzone>
      <FileUpload.Trigger className="mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Choose files
      </FileUpload.Trigger>
      <FileList />
    </FileUpload.Root>
  );
}
