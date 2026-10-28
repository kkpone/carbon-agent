import { LoadingOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Modal, Upload, UploadFile } from 'antd';
import { cloneElement, FC, ReactElement, useState } from 'react';

import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils';

import styles from './index.module.less';

const AttachmentModal: FC<{
  children: ReactElement;
  onConfirm: (fileList: UploadFile<{ data: string }>[]) => Promise<void> | void;
}> = ({ children, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [fileList, setFileList] = useState<UploadFile<{ data: string }>[]>([]);

  const submit = async () => {
    try {
      setLoading(true);
      await onConfirm(fileList);
      setLoading(false);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={I18N.components.addAttachment}
        open={open}
        width={488}
        destroyOnClose
        okButtonProps={{ loading }}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        afterClose={() => {
          setFileList([]);
        }}
        onOk={submit}
      >
        <Upload.Dragger
          className={styles.uploadDragger}
          showUploadList={false}
          name='file'
          fileList={fileList}
          multiple
          accept='.xls, .xlsx, .pdf, .jpg, .png, .doc, .docx, .rar, .zip, .XLS, .XLSX, .PDF, .JPG, .PNG, .DOC,.DOCX, .RAR, .ZIP'
          action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
          beforeUpload={uploadFile => {
            if (uploadFile.size > 20 * 1024 * 1024) {
              Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot);
              return false;
            }
            return true;
          }}
          onChange={info => {
            const uploadFileList = info.fileList as UploadFile<{
              data: string;
            }>[];
            setFileList(uploadFileList);
          }}
        >
          <IconAlibaba className={styles.uploadIcon} type='icon-icon_upload' />
          <div className={styles.uploadTip}>
            <span>{I18N.esg.dragOrSelect}</span>
            <span className={styles.strokeUploadTip}>{I18N.esg.localFile}</span>
            <span>{I18N.auth.upload}</span>
          </div>
        </Upload.Dragger>
        {fileList.length > 0 && (
          <div className={styles.fileList}>
            {fileList.map(file => (
              <div className={styles.fileItem} key={file.uid}>
                {file.status === 'uploading' ? (
                  <LoadingOutlined />
                ) : (
                  <IconAlibabaNew
                    className={styles.linkIcon}
                    type='icon-link'
                  />
                )}
                <div className={styles.fileName} title={file.name}>
                  {file.name}
                </div>
                <IconAlibaba
                  className={styles.deleteIcon}
                  type='icon-icon_delete'
                  onClick={() =>
                    setFileList(fileList.filter(f => f.uid !== file.uid))
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(!open) })}
    </>
  );
};

export default AttachmentModal;
