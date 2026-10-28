/**
 * @description 导入评分
 */
import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';

import ImportFile from '@/components/ImportFile';
import { IMPORT_RECORD_TYPE } from '@/components/ImportFile/constants';
import { FileType } from '@/components/ImportFile/type';
import { downloadBlobFile } from '@/utils/fileUtil';
import {
  getDataQualityDownloadTemplate,
  postDataQualityImport,
} from '@/views/carbonFootPrintLCA/CarbonFootprintModel/service';

interface ImportRatingProps {
  /** 方案id */
  assessmentId?: number;
  /** 数据质量类别 */
  dataQualityCategory: number;
  open: boolean;
  handleCancel: () => void;
}

export default function ImportRating({
  assessmentId,
  dataQualityCategory,
  open,
  handleCancel,
}: ImportRatingProps) {
  /** 导入的方法 */
  const onImportFile = async (
    fileParams: FileType,
    successCallBack: () => void,
    failCallBack: () => void,
  ) => {
    try {
      await postDataQualityImport({
        assessmentId,
        dataQualityCategory,
        fileName: fileParams.name,
        fileUrl: fileParams.url,
      });
      successCallBack();
    } catch (e) {
      failCallBack();
    }
  };
  return (
    <Modal
      centered
      title={I18N.carbonFootPrintLCA.importRating}
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
        importType={IMPORT_RECORD_TYPE.LCA_DATA_QUALITY_RATING}
        dataId={assessmentId}
        scroll={{ y: 350 }}
        onDownloadTemplate={async () => {
          if (!assessmentId || !dataQualityCategory) return;
          getDataQualityDownloadTemplate({
            assessmentId,
            dataQualityCategory,
          }).then(res => {
            downloadBlobFile(res?.data, res);
          });
        }}
        onImportFile={onImportFile}
      />
    </Modal>
  );
}
