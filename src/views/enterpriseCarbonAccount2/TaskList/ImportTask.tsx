/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import I18N from '@src/lang/I18N';
import { Button, Table, UploadFile } from 'antd';
import { FC, useEffect, useState } from 'react';

import { downloadFile } from '@/components/DownLoadFile';
import ImportFileHead from '@/components/ImportFileHead';
import { Toast } from '@/utils/Toast';

import { getImportRecords, getImportTemplate, importTask } from './service';

type ImportTaskProps = {
  ticket?: string;
};

const state = [
  { name: I18N.carbonFootprint.importing, className: 'woring btn-base' },
  { name: I18N.carbonFootprint3.importAllAs, className: 'succsse btn-base' },
  { name: I18N.carbonFootprint3.importAllLost, className: 'error btn-base' },
  {
    name: I18N.carbonFootprint3.partialImportAs,
    className: 'woring btn-base',
  },
];

const ImportTask: FC<ImportTaskProps> = ({ ticket }) => {
  const [uploadState, setUploadState] = useState<
    'default' | 'success' | 'error'
  >('default');

  const [importRecordList, setImportRecordList] = useState<
    Record<string, any>[]
  >([]);

  const [pager, setPager] = useState({
    pageNum: 1,
    pageSize: 10,
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setInterval(async () => {
      const { data } = await getImportRecords({
        pageNum: pager.pageNum,
        pageSize: pager.pageSize,
        ticket,
      });
      setImportRecordList(data.rows);
      setTotal(data.total);
    }, 1000);

    return () => clearInterval(timer);
  }, [pager, ticket]);

  return (
    <div>
      <ImportFileHead
        upLoadState={uploadState}
        onDownTemplateLoadHandle={async () => {
          const { data } = await getImportTemplate({ ticket });
          downloadFile(
            I18N.enterpriseCarbonAccount2.emissionSourceTemplate,
            data.data.path,
          );
        }}
        onImportSuccessHandle={async (files: UploadFile[]) => {
          const file = files[0].originFileObj;

          if (!file) {
            return;
          }
          const formData = new FormData();
          formData.append('file', file);

          if (ticket) {
            formData.append('ticket', ticket);
          }

          try {
            await importTask(formData);
            setUploadState('success');
            setPager({ ...pager });
            Toast('success', I18N.carbonFootprint.importSuccessful);
            setTimeout(() => {
              setUploadState('default');
            }, 1000);
          } catch {
            setUploadState('error');
          }
        }}
      />
      <p className='import-word'>{I18N.carbonFootprint.importHistory}</p>
      <Table
        columns={[
          {
            title: I18N.carbonFootprint.number,
            dataIndex: '__index__',
            fixed: 'left',
            width: 70,
            render: (txt, _, index: number) =>
              (pager.pageNum - 1) * pager.pageSize + index + 1,
          },
          {
            title: I18N.carbonFootprint.fileName,
            fixed: 'left',
            dataIndex: 'name',
            width: 240,
          },
          {
            title: I18N.carbonFootprint.totalNumberOfEntries,
            dataIndex: 'total',
            width: 100,
            render: txt => <div>{txt}</div>,
          },
          {
            title: I18N.carbonFootprint.numberOfImports,
            dataIndex: 'success',
            width: 100,
            render: txt => <div>{txt}</div>,
          },
          {
            title: I18N.carbonFootprint.numberOfExceptions,
            width: 100,
            dataIndex: 'fail',
            render: txt => <div style={{ color: '#EC5B56' }}>{txt}</div>,
          },
          {
            title: I18N.carbonFootprint.state,
            width: 160,
            dataIndex: 'status',
            render: status => (
              <span className={state[status]?.className}>
                {state[status]?.name}
              </span>
            ),
          },
          {
            title: I18N.carbonFootprint.operator,
            width: 90,
            dataIndex: 'createUser',
            render: txt => <div>{txt}</div>,
          },
          {
            title: I18N.carbonFootprint.importTime,
            width: 190,
            dataIndex: 'createTime',
            render: txt => <div>{txt}</div>,
          },

          {
            title: I18N.carbonFootprint.operation,
            width: 180,
            fixed: 'right',
            dataIndex: 'supplyQuantity',
            render: (txt, record) => (
              <>
                <Button
                  type='link'
                  onClick={() => {
                    downloadFile(record.name, record.url);
                  }}
                >
                  {I18N.carbonFootprint.sourceFile}
                </Button>
                {!(record.fail === 0 && record.status === 1) && (
                  <Button
                    type='link'
                    onClick={() => {
                      downloadFile(record.name, record.failUrl);
                    }}
                  >
                    {I18N.carbonFootprint.abnormalData}
                  </Button>
                )}
              </>
            ),
          },
        ]}
        scroll={{ y: 'calc(100vh - 483px)' }}
        dataSource={importRecordList}
        onChange={({ current, pageSize }) => {
          setPager({ pageNum: current || 1, pageSize: pageSize || 10 });
        }}
        pagination={{
          total,
          current: pager.pageNum,
          pageSize: pager.pageSize,
        }}
      />
    </div>
  );
};

export default ImportTask;
