import { LoadingOutlined } from '@ant-design/icons';
import closeImg from '@assets/svg/close.svg';
import uploadIcon from '@assets/svg/upload.svg';
import I18N from '@src/lang/I18N';
import { Popover, Upload, Button, UploadFile } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, ReactElement, useEffect, useState } from 'react';

import AiImg from '@/assets/svg/ai.svg';
import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils';
import { IMPORT_STATUS } from '@/views/enterpriseCarbonAccount2/AiImport/constant';

import styles from './index.module.less';
import { createTravelAiModel, getImportStatus } from './service';
import TravelImportResult from '../TravelImportResult';

const fileIconMap = {
  doc: 'icon-icon-word1',
  docx: 'icon-icon-word1',
  xlx: 'icon-a-icon-excel',
  xlsx: 'icon-a-icon-excel',
};

const TravelImport: FC<{
  children: ReactElement;
  computationId: string;
  computationPeriod?: string;
  onImportSuccess: () => void;
}> = props => {
  const { children, computationId, computationPeriod, onImportSuccess } = props;

  const [open, setOpen] = useState(false);

  const [file, setFile] = useState<{
    name: string;
    url: string;
    status?: string;
  } | null>(null);

  const [importResultOpen, setImportResultOpen] = useState(false);

  const [importStatus, setImportStatus] = useState<number>();

  const [loading, setLoading] = useState(false);

  const queryImportStatus = async (params: {
    computationId: string;
    computationPeriod?: string;
  }) => {
    const { data } = await getImportStatus({
      computationId: params.computationId,
      computationPeriod: params.computationPeriod,
    });

    setImportStatus(data.data);
  };

  const onImport = async () => {
    if (!file || file.status !== 'done') {
      Toast('error', I18N.Certification.pleaseSelectAFile);
      return;
    }
    try {
      setLoading(true);
      // 后端的create接口是同步的
      createTravelAiModel({
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
      setImportResultOpen(true);
      setImportStatus(IMPORT_STATUS.PENDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryImportStatus({ computationId, computationPeriod });
  }, [computationId, computationPeriod]);

  if (isNil(importStatus)) {
    return <div onClick={e => e.stopPropagation()}>{children}</div>;
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <TravelImportResult
        open={importResultOpen}
        importStatus={importStatus}
        computationId={computationId}
        computationPeriod={computationPeriod}
        onClose={() => {
          setImportResultOpen(false);
          queryImportStatus({ computationId, computationPeriod });
        }}
        onImportSuccess={() => {
          setImportResultOpen(false);
          queryImportStatus({ computationId, computationPeriod });
          onImportSuccess();
        }}
      />
      {importStatus === IMPORT_STATUS.NOT_EXIST_OR_FAIL ? (
        <Popover
          rootClassName={styles.AiImportPopover}
          align={{ offset: [-20, -10] }}
          placement='leftTop'
          arrow={false}
          trigger={['click']}
          open={open}
          content={
            <div className={styles.popoverContent}>
              <div className={styles.title}>
                <img alt='' src={AiImg} />
                {I18N.carbonFootprint.import}
              </div>
              <div className={styles.tip}>
                {I18N.enterpriseCarbonAccount2.canUploadTravelExpenses}
              </div>
              <div className={styles.uploadContent}>
                <Upload.Dragger
                  className={classNames(styles.uploadDragger, {
                    [styles.hiddenUploadDragger]: !isNil(file),
                  })}
                  showUploadList={false}
                  name='file'
                  maxCount={1}
                  accept='.xls, .xlsx, .XLS, .XLSX'
                  action={`${
                    process.env.REACT_APP_API_URL || ''
                  }/file/file/uploadImg`}
                  beforeUpload={uploadFile => {
                    if (uploadFile.size > 20 * 1024 * 1024) {
                      Toast(
                        'error',
                        I18N.enterpriseCarbonAccount2.fileMaximumNot,
                      );
                      return false;
                    }
                    return true;
                  }}
                  onChange={info => {
                    const uploadFile = info.file as UploadFile<{
                      data: string;
                    }>;
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
                  <div className={styles.uploadTip}>
                    {I18N.enterpriseCarbonAccount2.supportExc}
                  </div>
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
          <div>{children}</div>
        </Popover>
      ) : (
        <div
          onClick={async () => {
            const { data } = await getImportStatus({
              computationId,
              computationPeriod,
            });

            setImportStatus(data.data);
            setImportResultOpen(true);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default TravelImport;
