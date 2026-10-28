import { Modal, Upload, UploadFile } from 'antd';
import { FC, useState } from 'react';
import styles from './index.module.less';
import { downloadFileFromBlob, Toast } from '@/utils';
import I18N from '@src/lang/I18N';
import uploadIconSvg from './uploadIcon.svg';
import { AppendixList } from '@/components/Appendix/ShowList';
import { exportTempData } from '../../service';

export interface IUploadDataProps {
  open: boolean;
  onOK: (file: UploadFile) => void;
  onClose: () => void;
}

const FILE_TYPE = [
  // '.png',
  // '.PNG',
  // '.jpg',
  // '.JPG',
  // '.JPEG',
  // '.jpeg',
  '.xlsx',
  '.XLSX',
  '.XLS',
  '.xls',
  // '.doc',
  // '.DOC',
  // '.docx',
  // '.DOCX',
  // '.pdf',
  // '.PDF',
  // '.rar',
  // '.RAR',
  // '.zip',
  // '.ZIP',
];

export const UploadData: FC<IUploadDataProps> = props => {
  const { open, onOK, onClose } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const exportTemp = async () => {
    try {
      const response = await exportTempData();
      downloadFileFromBlob(response, I18N.esg.esgKey);
    } finally {
      // setExportLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      title={I18N.esg.uploadData}
      onOk={() => {
        if (fileList[0].status !== 'done') {
          Toast('info', I18N.esg.pleaseWaitForTheFile);
          return;
        }
        if (fileList.length === 0) {
          Toast('warn', I18N.enterpriseCarbonAccount2.pleaseUploadTheFile);
        }
        onOK(fileList[0]);
        setFileList([]);
      }}
      onCancel={() => {
        onClose();
        setFileList([]);
      }}
    >
      <div className={styles.appendix}>
        <AppendixList
          canDelete
          items={fileList.map(file => ({
            type: 'file',
            uuid: file.uid,
            value: {
              showName: file.name,
              fileUrl: file.response?.data,
              fileSize: `${((file.size || 0) / 1024).toFixed(2)} KB`,
            },
          }))}
          del={() => setFileList([])}
        />
      </div>
      <Upload.Dragger
        className={styles.upload}
        name='file'
        accept={FILE_TYPE.join(',')}
        multiple
        disabled={fileList.length >= 1}
        action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
        fileList={fileList}
        // itemRender={(_, uploadFile, fileList, { remove }) =>
        //   uploadFileRender(uploadFile, remove)
        // }
        showUploadList={false}
        beforeUpload={uploadFile => {
          if (uploadFile.size > 20 * 1024 * 1024) {
            Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot2);
            return false;
          }
          return true;
        }}
        onChange={async ({ fileList: changeFiles }) => {
          setFileList(changeFiles);

          // if (changeFiles.every(({ status }) => status === 'done')) {
          //   await onSuccess(
          //     changeFiles.map(file => ({
          //       name: file.name,
          //       url: (file.response as { data: string })?.data,
          //     })),
          //   );
          //   setFileList([]);
          //   setUploadedFileList([
          //     ...uploadedFileList,
          //     ...changeFiles.map(file => ({
          //       ...file,
          //       id: file.uid,
          //       url: (file.response as { data: string })?.data,
          //     })),
          //   ]);
          // }
        }}
      >
        <img alt='' src={uploadIconSvg} />
        <div className={styles.uploadText}>
          <span>{I18N.enterpriseCarbonAccount2.directlyTransferFiles}</span>
          <span className={styles.uploadClickText}>
            {I18N.components.clickToUpload}
          </span>
        </div>
        <div className={styles.uploadTip}>{I18N.esg.supportExcel}</div>
      </Upload.Dragger>
      <div className={styles.uploadTemplate}>
        {I18N.esg.underTheDataTemplate}
        <span className={styles.tip}>{I18N.esg.ifYouHaventYet}</span>
      </div>
      <div className={styles.downloadWrapper}>
        <div className={styles.name}>
          <div />
          <div>{I18N.esg.esgKey}</div>
        </div>

        <div className={styles.downloadBtn} onClick={() => exportTemp()}>
          {I18N.carbonFootprint.download}
        </div>
      </div>
    </Modal>
  );
};
