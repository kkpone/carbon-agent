import I18N from '@src/lang/I18N';
import { UploadFile } from 'antd';
import { FC, useState } from 'react';

import FileUploadModal from '@/components/FileUploadModal';
import { IconAlibabaNew } from '@/components/iconfont';
import { IMPORT_STATUS } from '@/views/enterpriseCarbonAccount2/AiImport/constant';

import AnalyzeResultModal from './AnalyzeResultModal';
import styles from './index.module.less';
import { createAiModel, getImportStatus } from './service';

const AiImport: FC<{
  ticket?: string;
  disabled?: boolean;
  onSuccess: () => void;
}> = ({ ticket, disabled, onSuccess }) => {
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false);

  const [resultModalProps, setResultModalProps] = useState<{
    open: boolean;
    importStatus?: number;
  }>({ open: false });

  const onAiImportClick = async () => {
    const { data } = await getImportStatus();

    if (data.data === IMPORT_STATUS.NOT_EXIST_OR_FAIL) {
      setFileUploadModalOpen(true);
    } else {
      setResultModalProps({ open: true, importStatus: data.data });
    }
  };

  const analyzeFile = async ({
    fileList,
  }: {
    fileList: UploadFile<{ data: { name: string; url: string } }>[];
  }) => {
    createAiModel({
      fileUrl: fileList.map(file => ({
        url: file.response?.data?.url || '',
      })),
    });

    // 兼容同步接口createAiModel
    await new Promise(rsl => {
      setTimeout(rsl, 2000);
    });
    // Toast('success', I18N.carbonFootprint.operationSuccessful);
    setFileUploadModalOpen(false);
    setResultModalProps({
      open: true,
      importStatus: IMPORT_STATUS.PENDING,
    });
  };

  return (
    <>
      <FileUploadModal
        title={I18N.carbonFootprint.import}
        open={fileUploadModalOpen}
        allowEmpty={false}
        exampleText={
          <div className={styles.exampleText}>
            {I18N.enterpriseCarbonAccount2.applicableToEmissions}
          </div>
        }
        onClose={() => setFileUploadModalOpen(false)}
        onConfirm={fileList => analyzeFile({ fileList })}
      />
      <AnalyzeResultModal
        {...resultModalProps}
        ticket={ticket}
        onClose={() => setResultModalProps({ open: false })}
        onSuccess={() => {
          onSuccess();
          setResultModalProps({ open: false });
        }}
      />
      <div
        className={styles.AiImportBtn}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={() => {
          if (!disabled) {
            onAiImportClick();
          }
        }}
      >
        <IconAlibabaNew className={styles.AiIcon} type='icon-a-AItag' />
        <span className={styles.importBtnText}>
          {I18N.carbonFootprint.batchImport}
        </span>
      </div>
    </>
  );
};

export default AiImport;
