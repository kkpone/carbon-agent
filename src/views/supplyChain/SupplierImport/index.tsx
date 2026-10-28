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
import { batchInviteSupplier, importSupplier } from './service';
import BatchInviteSupplierModal from '../components/BatchInviteSupplierModal';
import ImportRecordTable from '../components/ImportRecordTable';
import { SUPPLY_CHAIN_IMPORT_TYPE } from '../constant';
import { downloadTemplate } from '../service';

const SupplierImport: FC = () => {
  const history = useHistory();

  const [uploadState, setUploadState] = useState<
    'default' | 'success' | 'error'
  >('default');

  const [operateKey, setOperateKey] = useState('');

  const [batchInviteModalVisible, setBatchInviteModalVisible] = useState(false);

  const refreshImportTableFunc =
    useRef<(params?: { pageNum?: number; pageSize?: number }) => void>(null);

  const onTemplateDownload = async () => {
    const res = await downloadTemplate({
      dictTypes: 'supplier_template',
    });
    const template = res.data.data.supplier_template[0];
    downloadFile(template.dictLabel, template.relatedValue);
  };

  const onBatchInviteModalClose = () => {
    setBatchInviteModalVisible(false);
  };

  const onSupplierBatchInvite = async (fileList: UploadFile[]) => {
    if (operateKey) {
      setBatchInviteModalVisible(true);
    } else {
      const formData = new FormData();
      const file = fileList[0].originFileObj;

      if (file) {
        formData.append('file', file);

        const res = await batchInviteSupplier(formData);
        setOperateKey(res.data.data.operateKey);
        setBatchInviteModalVisible(true);
      }
    }
  };

  const onSupplierImport = async (opt?: { inviteFlag?: boolean }) => {
    try {
      await importSupplier({ operateKey, inviteFlag: opt?.inviteFlag });
      Toast('success', I18N.carbonFootprint.importSuccessful);
      setUploadState('success');
      setOperateKey('');
      onBatchInviteModalClose();
      setTimeout(() => {
        setUploadState('default');
      }, 1000);
      refreshImportTableFunc.current?.({ pageNum: 1 });
    } catch (err) {
      setUploadState('error');
      throw err;
    }
  };

  return (
    <div className={styles.supplierImport}>
      {checkPermissions(
        <div className={styles.importHeader}>
          <div className={styles.title}>
            {I18N.supplyChain2.importSuppliers}
          </div>
          <ImportFileHead
            upLoadState={uploadState}
            importBtnText={I18N.supplyChain.batchInvitation}
            importTextOptions={{
              downText: I18N.supplyChain.downloadTemplateRoot,
              upLoadText: I18N.carbonFootprint.uploadFileSupport,
            }}
            onFileChange={() => setOperateKey('')}
            onDownTemplateLoadHandle={onTemplateDownload}
            onImportSuccessHandle={onSupplierBatchInvite}
          />
        </div>,
        'supplier:import',
      )}
      <div className={styles.importContent}>
        <div className={styles.title}>{I18N.carbonFootprint.importHistory}</div>
        <div className={styles.importRecordTable}>
          <ImportRecordTable
            type={SUPPLY_CHAIN_IMPORT_TYPE.SUPPLIER}
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
                pathname: RouteMapsSupplyChain2.supplyChainManagement,
              }),
          },
        ]}
      />
      <BatchInviteSupplierModal
        visible={batchInviteModalVisible}
        operateKey={operateKey}
        onCancel={onBatchInviteModalClose}
        onOk={onSupplierImport}
      />
    </div>
  );
};

export default SupplierImport;
