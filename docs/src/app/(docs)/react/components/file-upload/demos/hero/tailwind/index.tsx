'use client';

import * as React from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileUpload } from '@base-ui/react/file-upload';
import { Progress } from '@base-ui/react/progress';

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

function FilePreviewItems() {
  const { files, removeFile, updateFile } = FileUpload.useFileUploadContext();

  // Simulate upload progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      files.forEach((file) => {
        if (file.status !== 'idle' && file.status !== 'uploading') {
          return;
        }

        const newProgress = Math.min(file.progress + Math.random() * 15, 100);
        updateFile(file.id, {
          progress: newProgress,
          status: newProgress >= 100 ? 'success' : 'uploading',
        });
      });
    }, 300);

    return () => clearInterval(interval);
  }, [files, updateFile]);

  return (
    <React.Fragment>
      {files.map((file) => (
        <FileUpload.PreviewItem
          key={file.id}
          file={file}
          className="relative flex flex-col gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300"
        >
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-100">
              <img src={file.preview} alt={file.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-900" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
              {(file.status === 'uploading' || file.status === 'idle') && (
                <Progress.Root
                  value={file.progress}
                  className="w-full mt-2"
                  aria-label={`Upload progress for ${file.name}`}
                >
                  <Progress.Track className="block w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                    <Progress.Indicator className="block h-full bg-blue-500 rounded-full transition-[width] duration-300" />
                  </Progress.Track>
                </Progress.Root>
              )}
              <div className="mt-1 flex items-center gap-2">
                {file.status === 'success' && (
                  <span className="flex items-center whitespace-nowrap text-xs font-medium text-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
                  </span>
                )}
                {file.status === 'error' && (
                  <span className="flex items-center whitespace-nowrap text-xs font-medium text-red-600">
                    <AlertCircle className="mr-1 h-3 w-3" /> Error
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(file.id)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              title={`Remove ${file.name}`}
              aria-label={`Remove ${file.name}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </FileUpload.PreviewItem>
      ))}
    </React.Fragment>
  );
}

export default function FileUploadDemo() {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Upload Images</h3>
        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>

      <FileUpload.Root
        maxFiles={5}
        maxSize={5 * 1024 * 1024}
        accept="image/png, image/jpeg, image/gif"
        multiple
      >
        <FileUpload.Input />

        <FileUpload.Dropzone className="group relative mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 transition-colors hover:bg-gray-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50">
          {({ isDragging }) => (
            <div className="text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-transform ${
                  isDragging ? 'scale-110 bg-blue-100 text-blue-600' : ''
                }`}
              >
                <UploadCloud className="h-6 w-6 text-gray-600" aria-hidden="true" />
              </div>
              <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                <span className="font-semibold text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-500">up to 5 images, max 5MB each</p>
            </div>
          )}
        </FileUpload.Dropzone>

        <FileUpload.PreviewList className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilePreviewItems />
        </FileUpload.PreviewList>
      </FileUpload.Root>
    </div>
  );
}
