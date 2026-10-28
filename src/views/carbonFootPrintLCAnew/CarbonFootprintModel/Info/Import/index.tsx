/**
 * @description 导入清单
 */
import I18N, { LocaleType } from '@src/lang/I18N';
import { Modal, Button } from 'antd';
import { useContext } from 'react';

import ImportFile from '@/components/ImportFile';
import {
  IMPORT_RECORD_TYPE,
  TEMPLATE_FILE_TYPE,
} from '@/components/ImportFile/constants';
import { LocaleContext } from '@/components/LocaleProvider';
import { FileType } from '@/views/components/utils/types';

import { columns } from './columns';
import { postImportList } from '../../service';

const { LCA_MODEL_EN, LCA_MODEL_ZH } = TEMPLATE_FILE_TYPE;

interface ImportProps {
  dataId: number;
  open: boolean;
  handleCancel: () => void;
}
function ListImport({ dataId, open, handleCancel }: ImportProps) {
  const { locale } = useContext(LocaleContext);

  const templateType = locale === LocaleType.enUS ? LCA_MODEL_EN : LCA_MODEL_ZH;

  return (
    <Modal
      centered
      title={I18N.carbonFootPrintLCA.importInventory}
      open={open}
      width='80%'
      maskClosable={false}
      style={{
        zIndex: 1999,
      }}
      styles={{
        wrapper: {
          zIndex: 1999,
        },
        mask: {
          zIndex: 1999,
        },
      }}
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
        downloadTemplateTips={I18N.carbonFootPrintLCA.downloadListGuide}
        maxSize={5}
        dataId={dataId}
        importType={IMPORT_RECORD_TYPE.LCA_MODEL}
        templateType={templateType}
        columns={columns()}
        scroll={{ y: 350 }}
        onImportFile={async (
          { name, url }: FileType,
          successCallback: () => void,
          failCallback: () => void,
        ) => {
          if (!dataId) return;
          try {
            await postImportList({
              fileName: name,
              fileUrl: url,
              modelId: dataId,
            });
            successCallback();
          } catch (error) {
            failCallback();
          }
        }}
      />
    </Modal>
  );
}
export default ListImport;
