import I18N from '@src/lang/I18N';
import { Upload, UploadFile } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

import { Toast } from '@/utils';

import icon from './icon.svg';
import styles from './index.module.less';

const FILE_TYPE = [
  '.png',
  '.PNG',
  '.jpg',
  '.JPG',
  '.JPEG',
  '.jpeg',
  '.xlsx',
  '.XLSX',
  '.XLS',
  '.xls',
  '.doc',
  '.DOC',
  '.docx',
  '.DOCX',
  '.pdf',
  '.PDF',
  // '.rar',
  // '.RAR',
  // '.zip',
  // '.ZIP',
];

export interface IAppendixFileProps {
  // title?: string;
  // maxFiles?: number;
  submit?: (
    value: {
      showName: string;
      fileSize: string;
      fileUrl: string;
      fileUid: string;
      status?: string;
    }[],
  ) => void;
  maxCount?: number;
}

export const AppendixFile = forwardRef<
  { delFile: (uid: string) => void },
  IAppendixFileProps
>((props, ref) => {
  const { submit, maxCount = 10 } = props;
  const [wrapperFileList, setWrapperFileList] = useState<UploadFile[]>([]);
  useImperativeHandle(
    ref,
    () => ({
      async delFile(uid: string) {
        setWrapperFileList(prev => prev.filter(file => file.uid !== uid));
      },
      async delAllFiles() {
        setWrapperFileList([]);
      },
    }),
    [],
  );
  return (
    <div className={styles.fileWrapper}>
      <Upload.Dragger
        className={styles.upload}
        name='file'
        multiple
        maxCount={maxCount + wrapperFileList.length}
        accept={FILE_TYPE.join(',')}
        action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
        fileList={wrapperFileList}
        showUploadList={false}
        beforeUpload={uploadFile => {
          if (uploadFile.size > 50 * 1024 * 1024) {
            Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot2);
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
        onChange={async ({ fileList }) => {
          setWrapperFileList(fileList);
          if (fileList.length === 0) {
            return;
          }
          if (fileList?.[fileList.length - 1]?.status === 'error') {
            Toast('error', I18N.components.uploadFailedPlease);
          }
          if (submit) {
            submit(
              fileList.map(file => ({
                fileUid: file.uid,
                status: file.status,
                showName: file.originFileObj?.name || '',
                fileSize: `${((file.size || 0) / 1024).toFixed(2)} KB`,
                fileUrl: (file.response as { data: string })?.data,
              })),
            );
            // setWrapperFileList([]);
          }
        }}
      >
        <div className={styles.btn}>
          <img src={icon} alt='' />
          <span>{I18N.components.addPhotosAnd}</span>
        </div>
      </Upload.Dragger>
    </div>
  );
});
