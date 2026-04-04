import { FileUpload } from '@base-ui/react/file-upload';

export type FileUploadRootProps = FileUpload.Root.Props;
export type FileUploadRootState = FileUpload.Root.State;
export type FileUploadRootParameters = FileUpload.Root.Parameters;
export type FileUploadRootExtendedFile = FileUpload.Root.ExtendedFile;
export type FileUploadRootFileStatus = FileUpload.Root.FileStatus;

export type FileUploadTriggerProps = FileUpload.Trigger.Props;
export type FileUploadTriggerState = FileUpload.Trigger.State;

export type FileUploadHiddenInputProps = FileUpload.HiddenInput.Props;
export type FileUploadHiddenInputState = FileUpload.HiddenInput.State;

export interface SimpleFileUploadProps extends Omit<FileUploadRootProps, 'children'> {
  label?: string;
}
