'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { FileUpload } from '@base-ui/react/file-upload';

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

function FileList() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return <p className="mt-4 text-center text-sm text-gray-500">No files selected yet.</p>;
  }

  return (
    <ul className="mt-6 space-y-2 list-none p-0 m-0">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => removeFile(file.id)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            title={`Remove ${file.name}`}
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function FileUploadDemo() {
  const maxFiles = 5;
  const [isUploadDisabled, setIsUploadDisabled] = React.useState(false);

  const handleDemoFileChange = React.useCallback<
    NonNullable<React.ComponentProps<typeof FileUpload.Root>['onFilesChange']>
  >(
    (files) => {
      setIsUploadDisabled(files.length >= maxFiles);
    },
    [maxFiles],
  );

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <FileUpload.Root
        maxFiles={maxFiles}
        maxSize={5 * 1024 * 1024}
        accept="image/png, image/jpeg, image/gif"
        multiple
        disabled={isUploadDisabled}
        onFilesChange={handleDemoFileChange}
      >
        <FileUpload.HiddenInput />
        <FileUpload.Trigger className="mt-2 mx-auto flex items-center justify-center h-10 px-3.5 outline-0 border border-gray-200 rounded-md bg-gray-50 font-inherit text-base font-medium leading-6 text-gray-900 select-none hover:data-[disabled]:bg-gray-50 hover:bg-gray-100 active:data-[disabled]:bg-gray-50 active:bg-gray-200 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:border-t-gray-300 active:data-[disabled]:shadow-none active:data-[disabled]:border-t-gray-200 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 data-[disabled]:text-gray-500">
          {isUploadDisabled ? 'Upload limit reached' : 'Select files'}
        </FileUpload.Trigger>

        <FileList />
      </FileUpload.Root>
    </div>
  );
}
