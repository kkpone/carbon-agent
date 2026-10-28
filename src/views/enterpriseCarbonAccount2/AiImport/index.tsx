import I18N from '@src/lang/I18N';
import { Dropdown, UploadFile } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

import FileUploadModal from '@/components/FileUploadModal';
import { IconAlibabaNew } from '@/components/iconfont';

import AnalyzeResultModal from './AnalyzeResultModal';
import { AI_IMPORT_TYPE, IMPORT_STATUS } from './constant';
import styles from './index.module.less';
import {
  createAiModel,
  createTravelAiModel,
  downloadTemplate,
  getImportStatus,
  getTravelImportStatus,
} from './service';

type AiImportProps = {
  computationId: string;
  computationPeriod: string;
  onImportSuccess: () => void;
};

const AiImport = forwardRef<{}, AiImportProps>((props, ref) => {
  const { computationId, computationPeriod, onImportSuccess } = props;

  const [importType, setImportType] = useState(AI_IMPORT_TYPE.COMMON);

  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false);

  const [resultModalProps, setResultModalProps] = useState<{
    open: boolean;
    importStatus?: number;
  }>({ open: false });

  const onImportTypeClick = async (params: {
    type: string;
    computationId: string;
    computationPeriod: string;
  }) => {
    const { type, ...postData } = params;
    let importStatus = IMPORT_STATUS.NOT_EXIST_OR_FAIL;

    setImportType(type);

    if (type === AI_IMPORT_TYPE.COMMON) {
      const { data } = await getImportStatus(postData);
      importStatus = data.data;
    } else if (type === AI_IMPORT_TYPE.TRAVEL) {
      const { data } = await getTravelImportStatus(postData);
      importStatus = data.data;
    }

    if (importStatus === IMPORT_STATUS.NOT_EXIST_OR_FAIL) {
      setFileUploadModalOpen(true);
    } else {
      setResultModalProps({ open: true, importStatus });
    }
  };

  const analyzeFile = async ({
    fileList,
  }: {
    fileList: UploadFile<{ data: { name: string; url: string } }>[];
  }) => {
    const postData = {
      computationId,
      computationPeriod,
      fileUrl: fileList.map(file => ({
        url: file.response?.data?.url || '',
      })),
    };
    if (importType === AI_IMPORT_TYPE.COMMON) {
      createAiModel(postData);
    } else if (importType === AI_IMPORT_TYPE.TRAVEL) {
      createTravelAiModel(postData);
    }

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

  useImperativeHandle(ref, () => ({ onImportTypeClick }), []);

  return (
    <>
      <FileUploadModal
        title={
          importType === AI_IMPORT_TYPE.COMMON
            ? I18N.enterpriseCarbonAccount2.basicDataGuide
            : I18N.enterpriseCarbonAccount2.travelDataGuide
        }
        open={fileUploadModalOpen}
        allowEmpty={false}
        exampleText={
          importType === AI_IMPORT_TYPE.COMMON ? (
            <div className={styles.exampleText}>
              {I18N.enterpriseCarbonAccount2.applicableToEmissions}
            </div>
          ) : (
            <>
              <div className={styles.exampleText}>
                {I18N.enterpriseCarbonAccount2.applicableToDifferences}
              </div>
              <div className={styles.exampleText}>
                {I18N.enterpriseCarbonAccount2.employeeAShanghai}
              </div>
              <div className={styles.exampleText}>
                {I18N.enterpriseCarbonAccount2.employeeBAdo}
              </div>
            </>
          )
        }
        onTemplateDownload={
          importType === AI_IMPORT_TYPE.COMMON
            ? async () => {
                const { data } = await downloadTemplate({ computationId });
                window.open(data.data.path);
              }
            : undefined
        }
        onClose={() => setFileUploadModalOpen(false)}
        onConfirm={fileList => analyzeFile({ fileList })}
      />

      <AnalyzeResultModal
        {...resultModalProps}
        type={importType}
        computationId={computationId}
        computationPeriod={computationPeriod}
        onClose={() => setResultModalProps({ open: false })}
        onSuccess={() => {
          onImportSuccess();
          setResultModalProps({ open: false });
        }}
      />
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              label: I18N.enterpriseCarbonAccount2.basicDataGuide,
              key: AI_IMPORT_TYPE.COMMON,
            },
            {
              label: I18N.enterpriseCarbonAccount2.travelDataGuide,
              key: AI_IMPORT_TYPE.TRAVEL,
            },
          ],
          onClick: ({ key }) =>
            onImportTypeClick({ type: key, computationId, computationPeriod }),
        }}
      >
        <div className={styles.AiImportBtn}>
          <IconAlibabaNew className={styles.AiIcon} type='icon-a-AItag' />
          <span className={styles.importBtnText}>
            {I18N.carbonFootprint.batchImport}
          </span>
        </div>
      </Dropdown>
    </>
  );
});

export default AiImport;
