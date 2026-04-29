'use client';
import * as React from 'react';
import { Dropzone } from '@base-ui/react/dropzone';
import { FileUpload } from '@base-ui/react/file-upload';
import { SettingsMetadata, useExperimentSettings } from './_components/SettingsPanel';
import styles from './file-upload.module.css';

interface Settings {
  multiple: boolean;
  disabled: boolean;
  maxFiles: number;
  maxSize: number;
}

export const settingsMetadata: SettingsMetadata<Settings> = {
  multiple: {
    type: 'boolean',
    label: 'Multiple',
    default: true,
  },
  disabled: {
    type: 'boolean',
    label: 'Disabled',
    default: false,
  },
  maxFiles: {
    type: 'number',
    label: 'Max Files',
    default: 5,
  },
  maxSize: {
    type: 'number',
    label: 'Max Size (MB)',
    default: 2,
  },
};

export default function FileUploadExperiment() {
  const { settings } = useExperimentSettings<Settings>();

  return (
    <div className={styles.Container}>
      <FileUpload.Root
        multiple={settings.multiple}
        disabled={settings.disabled}
        maxFiles={settings.maxFiles}
        maxSize={settings.maxSize * 1024 * 1024}
        accept="image/*"
      >
        <FileUpload.HiddenInput />
        <UploadDropzone />

        <FilePreviewItems />
      </FileUpload.Root>
    </div>
  );
}

function UploadDropzone() {
  const { disabled, openFileDialog } = FileUpload.useFileUploadContext();

  return (
    <Dropzone.Root className={styles.Dropzone} disabled={disabled} onOpen={openFileDialog}>
      {({ isDragging }) => (
        <div className={isDragging ? styles.Dragging : ''}>
          <UploadIcon className={styles.Icon} />
          <p className={styles.Text}>{isDragging ? 'Drop files here' : 'Drag & drop files here'}</p>
          <FileUpload.Trigger className={styles.Button}>Browse files</FileUpload.Trigger>
        </div>
      )}
    </Dropzone.Root>
  );
}

function FilePreviewItems() {
  const { files } = FileUpload.useFileUploadContext();

  if (files.length === 0) {
    return null;
  }

  return (
    <ul className={styles.PreviewList}>
      {files.map((file) => (
        <li key={file.id} className={styles.PreviewItem}>
          <div className={styles.FileInfo}>
            <span className={styles.FileName}>{file.name}</span>
            <FileUpload.FileSize bytes={file.size} className={styles.FileSize} />
          </div>
          <FileUpload.Remove
            fileId={file.id}
            className={styles.RemoveButton}
            aria-label={`Remove ${file.name}`}
          >
            ×
          </FileUpload.Remove>
        </li>
      ))}
    </ul>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" {...props}>
      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor" />
    </svg>
  );
}
