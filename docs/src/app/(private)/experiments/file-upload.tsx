'use client';
import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import {
  SettingsMetadata,
  useExperimentSettings,
} from '../../../components/Experiments/SettingsPanel';
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
        <FileUpload.Dropzone className={styles.Dropzone}>
          {({ isDragging }) => (
            <div className={isDragging ? styles.Dragging : ''}>
              <UploadIcon className={styles.Icon} />
              <p className={styles.Text}>
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <FileUpload.Trigger className={styles.Button}>Browse files</FileUpload.Trigger>
            </div>
          )}
        </FileUpload.Dropzone>

        <FileUpload.PreviewList className={styles.PreviewList}>
          <FilePreviewItems />
        </FileUpload.PreviewList>
      </FileUpload.Root>
    </div>
  );
}

function FilePreviewItems() {
  const { files, removeFile } = FileUpload.useFileUploadContext();

  return (
    <React.Fragment>
      {files.map((file) => (
        <FileUpload.PreviewItem key={file.id} file={file} className={styles.PreviewItem}>
          <div className={styles.FileInfo}>
            <span className={styles.FileName}>{file.name}</span>
            <span className={styles.FileSize}>{(file.size / 1024).toFixed(2)} KB</span>
          </div>
          <button
            type="button"
            className={styles.RemoveButton}
            onClick={() => removeFile(file.id)}
            aria-label={`Remove ${file.name}`}
          >
            ×
          </button>
        </FileUpload.PreviewItem>
      ))}
    </React.Fragment>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" {...props}>
      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor" />
    </svg>
  );
}
