import { FileUpload } from '@base-ui/react/file-upload';

export type FileUploadRootProps = FileUpload.Root.Props;
export type FileUploadRootState = FileUpload.Root.State;
export type FileUploadRootParameters = FileUpload.Root.Parameters;
export type FileUploadRootExtendedFile = FileUpload.Root.ExtendedFile;
export type FileUploadRootFileStatus = FileUpload.Root.FileStatus;

export type FileUploadDropzoneProps = FileUpload.Dropzone.Props;
export type FileUploadDropzoneState = FileUpload.Dropzone.State;

export type FileUploadTriggerProps = FileUpload.Trigger.Props;
export type FileUploadTriggerState = FileUpload.Trigger.State;

export type FileUploadPreviewListProps = FileUpload.PreviewList.Props;
export type FileUploadPreviewListState = FileUpload.PreviewList.State;

export type FileUploadPreviewItemProps = FileUpload.PreviewItem.Props;
export type FileUploadPreviewItemState = FileUpload.PreviewItem.State;

export interface SimpleFileUploadProps extends Omit<FileUploadRootProps, 'children'> {
  label?: string;
}
