import {
  CopyOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Dropdown, Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';

import { ACCOUNT_SELECT_LIFE_CYCLE_LABEL } from '@/views/carbonFootprint3/FootprintAccount/constant';

import styles from './index.module.less';
import { getModelList } from '../../service';
import {
  MODEL_SOURCE_LABEL,
  ModelItem,
  ModelListParams,
  ModelSourceEnum,
} from '../../type';

const { confirm } = Modal;

interface ListViewProps {
  searchParams: ModelListParams;
  setSearchParams: (params: ModelListParams) => void;
  onEdit: (item: ModelItem) => void;
  onCopy: (item: ModelItem) => void;
  onDelete: (item: ModelItem) => void;
  onViewInfo: (item: ModelItem) => void;
  onCreateAccounting: (item: ModelItem) => void;
}

const ListView: React.FC<ListViewProps> = ({
  searchParams,
  setSearchParams,
  onEdit,
  onCopy,
  onDelete,
  onViewInfo,
  onCreateAccounting,
}) => {
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    getModelList({
      ...searchParams,
      industry:
        searchParams.industry === 'all' ? undefined : searchParams.industry,
    })
      .then(({ data }) => {
        setModelList(data?.data?.rows || []);
        setTotal(data?.data?.total || 0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const columns: ColumnsType<ModelItem> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: 'index',
      width: 60,
      fixed: 'left',
      render: (_: unknown, __: unknown, index: number) =>
        (searchParams.pageNum - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: I18N.carbonFootprint.modelName,
      width: 200,
      dataIndex: 'modelName',
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.modelSource,
      dataIndex: 'source',
      width: 120,
      ellipsis: true,
      render: (source: ModelSourceEnum) => MODEL_SOURCE_LABEL[source],
    },
    {
      title: I18N.carbonFootprint3.industryCategory,
      dataIndex: 'industryNames',
      width: 120,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.systemBoundary,
      dataIndex: 'scope',
      width: 140,
      ellipsis: true,
      render: scope => ACCOUNT_SELECT_LIFE_CYCLE_LABEL[scope],
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 180,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'action',
      width: 160,
      fixed: 'right',
      render: (_: unknown, record: ModelItem) => {
        const isSystem = record.source === ModelSourceEnum.SYSTEM;
        return (
          <div className={styles.operateColumn}>
            <Button type='link' onClick={() => onEdit(record)}>
              {isSystem
                ? I18N.carbonFootprint.check
                : I18N.carbonFootprint.edit}
            </Button>
            <Button type='link' onClick={() => onCreateAccounting(record)}>
              {I18N.carbonFootprint3.addAccounting}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'info',
                    label: I18N.carbonFootprint3.modelInformation,
                    icon: <InfoCircleOutlined />,
                    onClick: () => onViewInfo(record),
                  },
                  {
                    key: 'copy',
                    label: I18N.carbonFootprint.copy,
                    icon: <CopyOutlined />,
                    onClick: () => onCopy(record),
                  },
                  {
                    key: 'delete',
                    label: I18N.carbonFootprint.delete,
                    icon: <DeleteOutlined />,
                    danger: true,
                    disabled: isSystem,
                    onClick: () => {
                      confirm({
                        title: I18N.carbonFootPrintLCA.confirmDeletion,
                        content: I18N.template(
                          I18N.carbonFootprint3.confirmToDeleteTheModel,
                          { val1: record.modelName },
                        ),
                        okText: I18N.base.confirm,
                        cancelText: I18N.carbonFootprint.cancel,
                        okButtonProps: { danger: true },
                        onOk: () => onDelete(record),
                      });
                    },
                  },
                ],
              }}
            >
              <Button type='link'>{I18N.Certification.more}</Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.tableWrapper}>
      <Table<ModelItem>
        columns={columns}
        dataSource={modelList}
        loading={loading}
        rowKey='id'
        scroll={{ x: 1100 }}
        pagination={{
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: t =>
            I18N.template(I18N.carbonFootprint3.totalOfTItems2, { val1: t }),
          onChange: (page, size) =>
            setSearchParams({ ...searchParams, pageNum: page, pageSize: size }),
        }}
      />
    </div>
  );
};

export default ListView;
