import { downloadFile } from '@src/components/DownLoadFile';
import { FormActions } from '@src/components/FormActions';
import ImportFileHead from '@src/components/ImportFileHead';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { Toast } from '@src/utils/Toast';
import { UploadFile } from 'antd/lib/upload/interface';
import { FC, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './index.module.less';
import { importPurchaseProduct } from './service';
import ImportRecordTable from '../components/ImportRecordTable';
import { SUPPLY_CHAIN_IMPORT_TYPE } from '../constant';
import { downloadTemplate } from '../service';

const PurchaseProductImport: FC = () => {
  const history = useHistory();

  const [uploadState, setUploadState] = useState<
    'default' | 'success' | 'error'
  >('default');

  const refreshImportTableFunc =
    useRef<(params?: { pageNum?: number; pageSize?: number }) => void>(null);

  const onTemplateDownload = async () => {
    const res = await downloadTemplate({
      dictTypes: 'purchase_produc_template',
    });
    const template = res.data.data.purchase_produc_template[0];
    downloadFile(template.dictLabel, template.relatedValue);
  };

  const onPurchaseProductImport = async (fileList: UploadFile[]) => {
    const formData = new FormData();
    const file = fileList[0].originFileObj;

    if (file) {
      formData.append('file', file);
      try {
        await importPurchaseProduct(formData);
        Toast('success', I18N.carbonFootprint.importSuccessful);
        setUploadState('success');
        setTimeout(() => {
          setUploadState('default');
        }, 1000);
        refreshImportTableFunc.current?.({ pageNum: 1 });
      } catch (err) {
        setUploadState('error');
        throw err;
      }
    }
  };

  return (
    <div className={styles.purchaseProductImport}>
      {checkPermissions(
        <div className={styles.importHeader}>
          <div className={styles.title}>
            {I18N.supplyChain2.importProcurementProducts}
          </div>
          <ImportFileHead
            upLoadState={uploadState}
            importTextOptions={{
              downText: I18N.supplyChain.downloadTemplateRoot,
              upLoadText: I18N.carbonFootprint.uploadFileSupport,
            }}
            onDownTemplateLoadHandle={onTemplateDownload}
            onImportSuccessHandle={onPurchaseProductImport}
          />
        </div>,
        'supplier:goods:import',
      )}
      <div className={styles.importContent}>
        <div className={styles.title}>{I18N.carbonFootprint.importHistory}</div>
        <div className={styles.importRecordTable}>
          <ImportRecordTable
            type={SUPPLY_CHAIN_IMPORT_TYPE.PURCHASE_PRODUCT}
            ref={refreshImportTableFunc}
          />
        </div>
      </div>
      <FormActions
        place='center'
        buttons={[
          {
            type: 'default',
            title: I18N.carbonFootprint.return,
            onClick: () =>
              history.push({
                pathname: RouteMapsSupplyChain2.supplyChainProduct,
              }),
          },
        ]}
      />
    </div>
  );
};

export default PurchaseProductImport;
