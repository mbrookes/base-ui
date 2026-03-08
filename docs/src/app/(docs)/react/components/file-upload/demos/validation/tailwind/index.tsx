'use client';

import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import { useTimeout } from '@base-ui/utils/useTimeout';

function RejectionMessage({ reason }: { reason?: string }) {
  if (reason === 'FILE_TOO_LARGE') {
    return <p>File is too large. Maximum size is 2MB.</p>;
  }

  if (reason === 'MIME_TYPE_NOT_ALLOWED') {
    return <p>File type not allowed. Only images are accepted.</p>;
  }

  if (reason === 'FILE_TOO_SMALL') {
    return <p>File is too small. Minimum size is 1KB.</p>;
  }

  return <p>File was rejected.</p>;
}

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No files selected. Maximum 5 files, 2MB each.</p>;
  }

  return (
    <FileUpload.PreviewList className="mt-4 space-y-2">
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
          >
            Remove
          </button>
        </FileUpload.PreviewItem>
      ))}
    </FileUpload.PreviewList>
  );
}

export default function FileUploadValidationTailwindDemo() {
  const rejectionTimeout = useTimeout();
  const [rejectedFile, setRejectedFile] = React.useState<{
    file: File;
    reason: string;
  } | null>(null);

  return (
    <div className="space-y-3">
      <FileUpload.Root
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        minSize={1024}
        maxFiles={5}
        onFileReject={(file, reason) => {
          setRejectedFile({ file, reason });
          rejectionTimeout.clear();
          rejectionTimeout.start(4000, () => setRejectedFile(null));
        }}
      >
        <FileUpload.Input />

        <div className="flex items-center justify-between gap-3">
          <FileUpload.Trigger className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Select files
          </FileUpload.Trigger>
          <span className="text-xs text-gray-500">Max 5 files • 1KB - 2MB each • Images only</span>
        </div>

        <FileList />
      </FileUpload.Root>

      {rejectedFile && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <strong>Rejected: {rejectedFile.file.name}</strong>
          <RejectionMessage reason={rejectedFile.reason} />
        </div>
      )}
    </div>
  );
}
