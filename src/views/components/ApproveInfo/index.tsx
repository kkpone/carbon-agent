/*
 * @@description: 审核详情
 */
import { ProColumns, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { keyBy } from 'lodash-es';
import { useMemo } from 'react';

import { Tags } from '@/components/UI/Tags';

import style from './index.module.less';

function ApproveInfo<
  ProcessType extends object & {
    auditStatus?: number;
    auditStatus_name?: string;
  } = any,
  RecordType extends object & {
    auditStatus?: number;
    auditStatus_name?: string;
  } = any,
>({
  processDataSource = [],
  recordDataSource = [],
}: {
  processDataSource?: ProcessType[];
  recordDataSource?: RecordType[];
}) {
  const processColumns = (): ProColumns<ProcessType>[] => [
    {
      title: I18N.components.reviewStage,
      dataIndex: 'nodeName',
      ellipsis: true,
    },
    {
      title: I18N.components.auditConfiguration,
      dataIndex: 'targetNames',
      ellipsis: true,
    },
    {
      title: I18N.Factors.state,
      dataIndex: 'auditStatus_name',
      render: (_, record) => {
        const { auditStatus, auditStatus_name } = record || {};
        const status = {
          0: 'orange',
          1: 'green',
          2: 'red',
        };
        return (
          <Tags
            className='customTag'
            kind='raduis'
            color={status[auditStatus as unknown as keyof typeof status]}
            tagText={auditStatus_name || ''}
          />
        );
      },
    },
  ];

  const recordColumns = (): ProColumns<RecordType>[] => [
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
    },
    {
      title: I18N.eca.findingsOfAudit,
      dataIndex: 'auditStatus_name',
      render: (_, record) => {
        const { auditStatus_name = '', auditStatus } = record || {};
        const status = {
          1: 'green',
          2: 'red',
          3: 'orange',
        };
        return (
          <Tags
            className='customTag'
            kind='raduis'
            color={status[auditStatus as unknown as keyof typeof status]}
            tagText={auditStatus_name || ''}
          />
        );
      },
    },
    {
      title: I18N.components.reviewer,
      dataIndex: 'auditByName',
      ellipsis: true,
    },
    {
      title: I18N.components.reviewRemarks,
      dataIndex: 'auditComment',
      ellipsis: true,
    },
    {
      title: I18N.components.reviewTime,
      dataIndex: 'auditTime',
    },
  ];

  const processColumnsStateDefault = useMemo(
    () => keyBy(processColumns, 'dataIndex'),
    [],
  );
  const recordColumnsStateDefault = useMemo(
    () => keyBy(recordColumns, 'dataIndex'),
    [],
  );

  return (
    <div className={style.wrapper}>
      <section className={style.content}>
        <h4>{I18N.components.reviewProcess}</h4>
        <ProTable<ProcessType>
          columns={processColumns()}
          pagination={false}
          search={false}
          columnsState={{
            persistenceKey: 'ProcessTable',
            persistenceType: 'localStorage',
            defaultValue: processColumnsStateDefault,
          }}
          toolBarRender={false}
          params={{
            processTableData: processDataSource,
          }}
          request={async params => {
            const { processTableData } = params || {};
            return {
              data: processTableData,
              success: true,
            };
          }}
        />
      </section>
      <section className={style.content}>
        <h4>{I18N.components.auditRecords}</h4>
        <ProTable<RecordType>
          columns={recordColumns()}
          pagination={false}
          search={false}
          columnsState={{
            persistenceKey: 'RecordTable',
            persistenceType: 'localStorage',
            defaultValue: recordColumnsStateDefault,
          }}
          toolBarRender={false}
          params={{
            recordTableData: recordDataSource,
          }}
          request={async params => {
            const { recordTableData } = params || {};
            return {
              data: recordTableData?.map((item: RecordType, index: number) => ({
                ...item,
                allIndex: index + 1,
              })),
              success: true,
            };
          }}
        />
      </section>
    </div>
  );
}
export default ApproveInfo;
