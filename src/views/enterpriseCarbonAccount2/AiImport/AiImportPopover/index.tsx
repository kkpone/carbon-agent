/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoadingOutlined } from '@ant-design/icons';
import closeImg from '@assets/svg/close.svg';
import uploadIcon from '@assets/svg/upload.svg';
import I18N from '@src/lang/I18N';
import { Button, Popover, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { cloneElement, FC, ReactElement, useState } from 'react';

import AiImg from '@/assets/svg/ai.svg';
import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils';

import styles from './index.module.less';
import { createAiModel, downloadTemplate } from './service';

type AiImportPopoverProps = {
  computationId: string;
  computationPeriod: string;
  children: ReactElement;
  onImportSuccess: () => void;
};

const fileIconMap = {
  doc: 'icon-icon-word1',
  docx: 'icon-icon-word1',
  xlx: 'icon-a-icon-excel',
  xlsx: 'icon-a-icon-excel',
};

const AiImportPopover: FC<AiImportPopoverProps> = props => {
  const { children, computationId, computationPeriod, onImportSuccess } = props;

  const [file, setFile] = useState<{
    name: string;
    url: string;
    status?: string;
  } | null>(null);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const onImport = async () => {
    if (!file || file.status !== 'done') {
      Toast('error', I18N.Certification.pleaseSelectAFile);
      return;
    }
    try {
      setLoading(true);
      // 后端的create接口是同步的
      createAiModel({
        computationId,
        computationPeriod,
        fileUrl: [{ url: file.url }],
      });
      // 兼容后端逻辑，2秒后再去轮询导入状态
      await new Promise(rsl => {
        setTimeout(rsl, 2000);
      });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      setOpen(false);
      onImportSuccess();
    } finally {
      setLoading(false);
    }
  };

  const onTemplateDownload = async () => {
    const { data } = await downloadTemplate({ computationId });
    window.open(data.data.path);
  };

  return (
    <Popover
      rootClassName={styles.AiImportPopover}
      placement='bottomRight'
      arrow={false}
      open={open}
      trigger={['click']}
      content={
        <div className={styles.popoverContent}>
          <div className={styles.title}>
            <img alt='' src={AiImg} />
            {I18N.carbonFootprint.import}
          </div>
          <div className={styles.tip}>
            {I18N.enterpriseCarbonAccount2.aiWillAnalyze}
          </div>
          <div className={styles.uploadContent}>
            <Upload.Dragger
              className={classNames(styles.uploadDragger, {
                [styles.hiddenUploadDragger]: !isNil(file),
              })}
              showUploadList={false}
              name='file'
              accept='.doc, .docx, .DOC, .DOCX, .xls, .xlsx, .XLS, .XLSX'
              action={`${
                process.env.REACT_APP_API_URL || ''
              }/file/file/uploadImg`}
              beforeUpload={uploadFile => {
                if (uploadFile.size > 20 * 1024 * 1024) {
                  Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot);
                  return false;
                }
                return true;
              }}
              onChange={info => {
                const uploadFile = info.file as UploadFile<{ data: string }>;
                setFile({
                  name: uploadFile.name,
                  url: uploadFile.response?.data || '',
                  status: uploadFile.status,
                });
              }}
            >
              <img alt='' src={uploadIcon} />
              <div className={styles.uploadText}>
                <span>{I18N.components.dragAndDropTheFile}</span>
                <span className={styles.strokeText}>
                  {I18N.components.clickToUpload}
                </span>
              </div>
              <span className={styles.uploadTip}>
                {I18N.enterpriseCarbonAccount2.supportWor}
              </span>
            </Upload.Dragger>
            {file && (
              <div className={styles.file}>
                {file.status === 'uploading' ? (
                  <LoadingOutlined />
                ) : (
                  <IconAlibabaNew
                    type={
                      fileIconMap[
                        file.name.split('.').pop() || 'icon-icon-word1'
                      ]
                    }
                  />
                )}
                <span className={styles.fileName} title={file.name}>
                  {file.name}
                </span>
                <div
                  className={styles.fileCloseCircle}
                  onClick={() => setFile(null)}
                >
                  <img alt='' src={closeImg} />
                </div>
              </div>
            )}
          </div>
          <div className={styles.downloadText}>
            <span>{I18N.carbonAccount.adopt}</span>
            <span
              className={styles.strokeText}
              onClick={() => onTemplateDownload()}
            >
              {I18N.components.downloadTemplate}
            </span>
            <span>{I18N.enterpriseCarbonAccount2.fillInAndUpload}</span>
          </div>
          <div className={styles.btnContent}>
            <Button onClick={() => setOpen(false)}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button type='primary' loading={loading} onClick={onImport}>
              {I18N.base.confirm}
            </Button>
          </div>
        </div>
      }
      onOpenChange={setOpen}
      afterOpenChange={() => setFile(null)}
    >
      {cloneElement(children, { onClick: () => setOpen(!open) })}
    </Popover>
  );
};

export default AiImportPopover;
