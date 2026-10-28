/**
 * @description 数据集批量导入
 */
import I18N, { LocaleType } from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import { useContext } from 'react';

import ImportFile from '@/components/ImportFile';
import {
  IMPORT_RECORD_TYPE,
  TEMPLATE_FILE_TYPE,
} from '@/components/ImportFile/constants';
import { LocaleContext } from '@/components/LocaleProvider';
import { FileType } from '@/views/components/utils/types';

import { columns } from './columns';
import { postImport } from './service';

const { DATA_SET } = IMPORT_RECORD_TYPE;

const { DATA_SET_ZH } = TEMPLATE_FILE_TYPE;

interface DataSetImportProps {
  dataId: number;
  open: boolean;
  handleCancel: () => void;
}
function DataSetImport({ dataId, open, handleCancel }: DataSetImportProps) {
  const { locale } = useContext(LocaleContext);

  /** 模版文件类型 */
  const templateType = locale === LocaleType.enUS ? DATA_SET_ZH : DATA_SET_ZH;

  return (
    <Modal
      centered
      title={I18N.carbonFootPrintLCA.importDataset}
      open={open}
      width='80%'
      maskClosable={false}
      destroyOnClose
      onCancel={() => {
        handleCancel();
      }}
      footer={[
        <Button
          onClick={() => {
            handleCancel();
          }}
        >
          {I18N.carbonFootPrintLCA.close}
        </Button>,
      ]}
    >
      <ImportFile
        importType={DATA_SET}
        templateType={templateType}
        dataId={dataId}
        downloadTemplateTips={I18N.carbonFootPrintLCA.downloadDataset}
        columns={columns()}
        scroll={{ y: 350 }}
        onImportFile={async (
          { name, url }: FileType,
          successCallBack: () => void,
          failCallBack: () => void,
        ) => {
          if (!dataId) return;
          try {
            await postImport({
              fileName: name,
              fileUrl: url,
              modelId: dataId,
            });
            successCallBack();
          } catch {
            failCallBack();
          }
        }}
      />
    </Modal>
  );
}
export default DataSetImport;
