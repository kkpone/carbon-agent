import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { TableColumnsType, Button, Modal, Table } from 'antd';
import { isNil } from 'lodash-es';
import React, { useState, useEffect } from 'react';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';

import styles from './index.module.less';
import OperateDataDrawer from '../OperateDataDrawer';
import { deleteOperateData, getOperateDataList } from '../service';
import { OperateData, OperateIndicator } from '../type';

type DataTableProps = {
  indicator?: OperateIndicator;
  queryIndicatorList: () => void;
};

const OperateDataTable: React.FC<DataTableProps> = ({
  indicator,
  queryIndicatorList,
}) => {
  const [dataId, setDataId] = useState<number | null>(null);

  const [dataList, setDataList] = useState<OperateData[]>([]);

  const [dataDrawerOpen, setDataDrawerOpen] = useState(false);

  const getTableList = (id: number | undefined) => {
    if (!isNil(id)) {
      getOperateDataList({ id }).then(resp => {
        setDataList(resp.data.rows || []);
      });
    }
  };

  const onOperateDataDelete = (id: number) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      centered: true,
      content: I18N.enterpriseCarbonAccount2.operationsDataDeletion,
      onOk: async () => {
        await deleteOperateData({ id });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryIndicatorList();
      },
    });
  };

  const tableColumns: TableColumnsType<OperateData> = [
    {
      title: I18N.carbonFootprint.year,
      width: 272,
      dataIndex: 'year',
    },
    {
      title: indicator ? `${indicator.name}（${indicator.unitName}）` : '',
      dataIndex: 'totalValue',
      width: 272,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operator,
      width: 272,
      dataIndex: 'updateBy',
    },
    {
      title: I18N.Certification.operationTime,
      width: 272,
      dataIndex: 'updateTime',
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 124,
      fixed: 'right',
      dataIndex: '__operate__',
      render: (_, data) => (
        <>
          <Button
            className={styles.operateBtn}
            type='link'
            onClick={() => {
              setDataId(data.id);
              setDataDrawerOpen(true);
            }}
          >
            {I18N.carbonFootprint3.details}
          </Button>
          {checkPermissions(
            <Button
              className={styles.operateBtn}
              type='link'
              onClick={() => onOperateDataDelete(data.id)}
            >
              {I18N.carbonFootprint.delete}
            </Button>,
            'enterprise:operate:v2:edit',
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    getTableList(indicator?.id);
  }, [indicator]);

  return (
    <div className={styles.tableContent}>
      <div className={styles.indicator}>
        <IconAlibaba type='icon-icon_index2' />
        <div>{indicator?.name}</div>
        <div>（{indicator?.unitName}）</div>
      </div>
      {checkPermissions(
        <Button
          className={styles.addBtn}
          icon={<PlusOutlined />}
          onClick={() => setDataDrawerOpen(true)}
        >
          {I18N.carbonNeutral.newDataAdded}
        </Button>,
        'enterprise:operate:v2:edit',
      )}
      <Table
        className={styles.table}
        columns={tableColumns}
        scroll={{ x: 1200 }}
        dataSource={dataList}
        bordered={false}
        rowKey='id'
        pagination={false}
      />
      {indicator && (
        <OperateDataDrawer
          open={dataDrawerOpen}
          dataId={dataId}
          indicator={indicator}
          onCancel={() => {
            setDataId(null);
            setDataDrawerOpen(false);
          }}
          onSuccess={() => {
            setDataId(null);
            setDataDrawerOpen(false);
            queryIndicatorList();
          }}
        />
      )}
    </div>
  );
};

export default OperateDataTable;
