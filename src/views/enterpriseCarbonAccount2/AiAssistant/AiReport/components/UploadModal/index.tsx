import I18N from '@src/lang/I18N';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import pdfIcon from '@assets/svg/pdf_icon.svg';
import uploadIcon from '@assets/svg/upload.svg';
import { IconAlibaba } from '@src/components/iconfont';
import { Toast } from '@src/utils/Toast';
import { Modal, Select, Tooltip, Upload } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, useState } from 'react';

import styles from './index.module.less';
import { RANK_LIST } from '../../constant';

type UploadModalProps = {
  visible: boolean;
  yearList: string[];
  onCancel: () => void;
  onConfirm: (data: {
    name: string;
    url: string;
    year: string;
    scores?: string;
  }) => Promise<void>;
};

const UploadModal: FC<UploadModalProps> = ({
  visible,
  yearList,
  onCancel,
  onConfirm,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const file = files[0];

  const [fileParams, setFileParams] = useState<{
    scores?: string;
    year?: string;
  }>({
    scores: I18N.carbonFootprint3.other,
  });

  const [loading, setLoading] = useState(false);

  const onClose = () => {
    onCancel();
    setFiles([]);
    setFileParams({});
  };

  const submit = async () => {
    const { scores, year } = fileParams;
    if (isNil(year)) {
      Toast('error', I18N.enterpriseCarbonAccount2.pleaseSelectAReport);
      return;
    }

    if (file) {
      setLoading(true);
      try {
        await onConfirm({
          name: file.name,
          scores,
          year,
          url: (file.response as { data: string }).data,
        });
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadFileRender = (uploadFile: UploadFile, remove: () => void) => {
    const { status, name } = uploadFile;

    return (
      <Tooltip
        overlay={
          status === 'error' ? I18N.enterpriseCarbonAccount2.uploadError : null
        }
      >
        <div className={styles.uploadFile}>
          <div className={styles.uploadFileLeft}>
            {status === 'done' && <img alt='' src={pdfIcon} />}
            {status === 'uploading' && (
              <LoadingOutlined className={styles.uploadingIcon} />
            )}
            {status === 'error' && (
              <ExclamationCircleOutlined className={styles.errorIcon} />
            )}
            <span
              className={classNames(styles.fileName, {
                [styles.errorFileName]: status === 'error',
              })}
              title={name}
            >
              {name}
            </span>
          </div>
          <IconAlibaba
            className={styles.fileDeleteIcon}
            type='icon-icon_delete'
            onClick={remove}
          />
        </div>
      </Tooltip>
    );
  };

  return (
    <Modal
      className={styles.uploadModal}
      title={
        <div className={styles.modalTitle}>
          {I18N.enterpriseCarbonAccount2.uploadReport}
        </div>
      }
      open={visible}
      destroyOnClose
      width={448}
      okText={I18N.enterpriseCarbonAccount2.startParsing}
      okButtonProps={{
        disabled: file?.status !== 'done' || fileParams.year === undefined,
        loading,
      }}
      onCancel={onClose}
      onOk={submit}
    >
      <Upload.Dragger
        className={styles.upload}
        name='file'
        accept='.pdf, .PDF'
        action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
        fileList={files}
        itemRender={(_, uploadFile, fileList, { remove }) =>
          uploadFileRender(uploadFile, remove)
        }
        beforeUpload={uploadFile => {
          if (uploadFile.size > 50 * 1024 * 1024) {
            Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot);
            return false;
          }
          return true;
        }}
        onChange={info => {
          setFiles(info.file.status === 'removed' ? [] : [info.file]);
        }}
      >
        <img alt='' src={uploadIcon} />
        <div className={styles.uploadText}>
          <span>{I18N.enterpriseCarbonAccount2.directlyTransferFiles}</span>
          <span className={styles.uploadClickText}>
            {I18N.components.clickToUpload}
          </span>
        </div>
        <div className={styles.uploadTip}>
          {I18N.enterpriseCarbonAccount2.supportPdf}
        </div>
      </Upload.Dragger>
      <div className={styles.fileRank}>
        <div className={styles.fileRankText}>
          <span>
            <span className={styles.red}>*</span>
            {I18N.enterpriseCarbonAccount2.reportYear}
          </span>
        </div>
        <Select
          className={styles.fileRankSelect}
          placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectTheYear}
          value={fileParams.year}
          options={yearList.map(year => ({ value: year, label: year }))}
          onChange={year => setFileParams({ ...fileParams, year })}
        />
      </div>
      <div className={styles.fileRank}>
        <div className={styles.fileRankText}>
          <span>{I18N.enterpriseCarbonAccount2.reportRating}</span>
          <span className={styles.fileRankTip}>
            {I18N.enterpriseCarbonAccount2.optionalSupplementaryReport}
          </span>
        </div>
        <Select
          className={styles.fileRankSelect}
          placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectARating}
          value={fileParams.scores}
          options={RANK_LIST.map(rank => ({ value: rank, label: rank }))}
          onChange={scores => setFileParams({ ...fileParams, scores })}
        />
      </div>
    </Modal>
  );
};

export default UploadModal;
