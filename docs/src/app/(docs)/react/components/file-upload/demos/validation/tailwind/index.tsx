'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import { useFileRejection } from '../useFileRejection';

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="mt-4 text-sm text-gray-500">No files selected.</p>;
  }

  return (
    <FileUpload.PreviewList className="mt-4 space-y-2 list-none p-0 m-0">
      {files.map((file) => (
        <FileUpload.PreviewItem
          key={file.id}
          file={file}
          className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            className="text-sm text-red-600 hover:text-red-700"
            onClick={() => removeFile(file.id)}
            aria-label={`Remove ${file.name}`}
          >
            Remove
          </button>
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadValidationTailwindDemo() {
  const { errorMessages, handleFileDrop, handleFileChange } = useFileRejection();

  return (
    <div className="space-y-3">
      <FileUpload.Root
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        minSize={1024}
        maxFiles={5}
        onFileChange={handleFileChange}
        onFileDrop={handleFileDrop}
      >
        <div className="flex items-center justify-between gap-3">
          <FileUpload.Trigger
            className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
            aria-describedby="file-validation-hint"
          >
            Select files
          </FileUpload.Trigger>
          <span id="file-validation-hint" className="text-xs text-gray-500">
            Max 5 files • 1KB - 2MB each • Images only
          </span>
        </div>

        <FileList />
      </FileUpload.Root>

      {errorMessages.length > 0 ? (
        <ul
          role="alert"
          className="list-disc space-y-1 rounded-md border border-red-200 bg-red-50 px-7 py-3 text-sm text-red-700"
        >
          {errorMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
