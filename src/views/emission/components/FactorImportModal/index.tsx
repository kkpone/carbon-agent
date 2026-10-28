import I18N from '@src/lang/I18N';
import { Button, Modal, Table, UploadFile } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import ImportFileHead from '@/components/ImportFileHead';
import { downloadFile, Toast } from '@/utils';

import styles from './index.module.less';
import { downloadTemplate, getRecordList, importFactorFile } from './service';

const importStatus = {
  importing: 0,
  success: 1,
  fail: 2,
};

const FactorImport: FC = () => {
  const [uploadState, setUploadState] = useState<
    'default' | 'success' | 'error'
  >('default');

  const [recordList, setRecordList] = useState<Record<string, any>[]>([]);

  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
  });

  const [total, setTotal] = useState(0);

  const { pageNum, pageSize } = searchParams;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecordList(searchParams)
      .then(({ data }) => {
        setRecordList(data.rows);
        setTotal(data.total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);
  return (
    <div>
      <ImportFileHead
        upLoadState={uploadState}
        importTextOptions={{
          downText: I18N.emission.pleaseDownloadTheModel,
          upLoadText: I18N.emission.uploadFileSupport,
        }}
        onDownTemplateLoadHandle={async () => {
          const res = await downloadTemplate({
            dictTypes: 'company_factor_template',
          });
          const template = res.data.data.company_factor_template[0];
          downloadFile(template.relatedValue, template.dictLabel);
        }}
        onImportSuccessHandle={async (fileList: UploadFile[]) => {
          const formData = new FormData();
          const file = fileList[0].originFileObj;

          if (file) {
            try {
              formData.append('file', file);
              await importFactorFile(formData);
              Toast('success', I18N.carbonFootprint.importSuccessful);
              setUploadState('success');
              setTimeout(() => {
                setUploadState('default');
                setSearchParams({ ...searchParams, pageNum: 1 });
              }, 1000);
            } catch (e) {
              setUploadState('error');
              throw e;
            }
          }
        }}
      />
      <div className={styles.historyTitle}>
        {I18N.carbonFootprint.importHistory}
      </div>
      <Table
        rowKey='id'
        dataSource={recordList}
        loading={loading}
        pagination={{ current: pageNum, pageSize, total }}
        scroll={{ x: 1120 }}
        columns={[
          {
            title: I18N.carbonFootprint.number,
            dataIndex: '__No__',
            width: 68,
            ellipsis: true,
            fixed: 'left',
            render: (_, record, index) => pageSize * (pageNum - 1) + index + 1,
          },
          {
            title: I18N.carbonFootprint.fileName,
            dataIndex: 'name',
            width: 200,
            ellipsis: true,
            fixed: 'left',
          },
          {
            title: I18N.carbonFootprint.totalNumberOfEntries,
            dataIndex: 'total',
            width: 96,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.numberOfImports,
            dataIndex: 'success',
            width: 96,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.numberOfExceptions,
            dataIndex: 'fail',
            width: 96,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.state,
            dataIndex: 'status',
            width: 140,
            ellipsis: true,
            render: (_, record) => (
              <div
                className={classNames(styles.status, {
                  [styles.successStatus]:
                    record.status === importStatus.success,
                  [styles.failStatus]: record.status === importStatus.fail,
                })}
              >
                {record.statusDesc}
              </div>
            ),
          },
          {
            title: I18N.carbonFootprint.operator,
            dataIndex: 'createUser',
            width: 96,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.importTime,
            dataIndex: 'createTime',
            width: 174,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.operation,
            dataIndex: '__operate__',
            width: 154,
            render: (_, record) => (
              <div className={styles.operateColumn}>
                <Button type='link' onClick={() => downloadFile(record.url)}>
                  {I18N.carbonFootprint.sourceFile}
                </Button>
                {record.failUrl && (
                  <Button
                    danger
                    type='link'
                    onClick={() => downloadFile(record.failUrl)}
                  >
                    {I18N.emission.abnormalFile}
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        onChange={pager => {
          setSearchParams({
            pageNum: pager.current || 1,
            pageSize: pager.pageSize || 10,
          });
        }}
      />
    </div>
  );
};

const FactorImportModal: FC<{ open: boolean; onClose: () => void }> = props => {
  const { open, onClose } = props;

  return (
    <Modal
      title={I18N.carbonFootprint3.importData}
      open={open}
      width={1200}
      destroyOnClose
      footer={null}
      onClose={onClose}
      onCancel={onClose}
    >
      <FactorImport />
    </Modal>
  );
};

export default FactorImportModal;
