'use client';

import * as React from 'react';
import { Dropzone } from '@base-ui/react/dropzone';
import { FileUpload } from '@base-ui/react/file-upload';

function SelectedFiles() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="mt-4 text-sm text-gray-500">No files selected yet.</p>;
  }

  return (
    <ul className="mt-4 list-none space-y-2 p-0">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2"
        >
          <span className="truncate text-sm text-gray-900" title={file.name}>
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => removeFile(file.id)}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
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
    <Dropzone.Root
      className="mt-4 rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 px-5 py-6 text-center transition-colors hover:border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-dragging:border-blue-600 data-dragging:bg-blue-100 data-disabled:cursor-not-allowed data-disabled:opacity-65"
      onOpen={openFileDialog}
      onFilesDrop={(files, event) => addFiles(files, event.nativeEvent)}
    >
      <p className="text-sm font-semibold text-gray-800">Drop files here or click</p>
    </Dropzone.Root>
  );
}

export default function ExampleDropzoneFileUploadIntegration() {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6">
      <FileUpload.Root multiple>
        <FileUpload.HiddenInput />
        <UploadDropzone />
        <SelectedFiles />
      </FileUpload.Root>
    </div>
  );
}
