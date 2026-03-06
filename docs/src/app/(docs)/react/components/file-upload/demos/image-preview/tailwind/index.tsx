'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';

function ImagePreviewItem({ file }: { file: FileUpload.Root.ExtendedFile }) {
  const { onRemove } = FileUpload.useFileUploadPreviewItem();
  const fileSize = file.size ? (file.size / 1024).toFixed(1) : '0';

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
      {file.preview && <img src={file.preview} alt={file.name} className="h-32 w-full object-cover" />}
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{fileSize} KB</p>
        </div>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          onClick={onRemove}
          title="Remove image"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function ImagePreviewList() {
  const { files } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No images selected</p>;
  }

  return (
    <FileUpload.PreviewList className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file}>
          <ImagePreviewItem file={file} />
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadImagePreviewTailwindDemo() {
  return (
    <FileUpload.Root accept="image/*" maxFiles={10} maxSize={5 * 1024 * 1024}>
      <FileUpload.Input />

      <FileUpload.Dropzone className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600 hover:bg-gray-50">
        {({ isDragging }) => (isDragging ? 'Drop images here' : 'Drag images here or click to select')}
      </FileUpload.Dropzone>

      <div className="mt-3 flex items-center justify-between gap-3">
        <FileUpload.Trigger className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Select images
        </FileUpload.Trigger>
        <span className="text-xs text-gray-500">Up to 10 images, 5MB each</span>
      </div>

      <ImagePreviewList />
    </FileUpload.Root>
  );
}
