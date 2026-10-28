import { Ref } from 'react';
import { AddFileData } from '../../type';

export interface UploadFileProps {
  fileListBack: AddFileData[];
  isDetail: boolean;
  cRef: Ref<{ subFilesData: () => AddFileData[] }>;
  maxWidth?: number;
  onChange?: (...args: any[]) => void;
  col?: number;
  value?: AddFileData[];
}
