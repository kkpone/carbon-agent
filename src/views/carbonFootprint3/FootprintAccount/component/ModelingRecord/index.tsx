/**
 * @description: AI 建模记录弹窗，展示批量建模任务列表
 */
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Modal, Pagination, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { getBatchTaskList } from './service';
import { BatchTaskRecord, BatchTaskStatus } from './type';

const TABLE_BODY_SCROLL_Y = 480;

type ModelingRecordSearchParams = {
  productName?: string;
  status?: BatchTaskStatus;
};

type ModelingRecordProps = {
  open: boolean;
  onClose: () => void;
  /** 点击「查看」时回调，后续可跳转批量建模详情页 */
  onView?: (record: BatchTaskRecord) => void;
};

const formatCompletionTime = (time?: string) => {
  if (!time) {
    return '-';
  }

  const date = new Date(time.replace(/-/g, '/'));
  if (Number.isNaN(date.getTime())) {
    return time;
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getStatusMeta = (status?: BatchTaskStatus) => {
  switch (status) {
    case BatchTaskStatus.BEFORE_PARSE:
      return {
        label: I18N.carbonFootprint3.batchTaskStatusBeforeParse,
        className: styles.statusPending,
      };
    case BatchTaskStatus.WAIT_MODEL:
      return {
        label: I18N.carbonFootprint3.batchTaskStatusWaitModel,
        className: styles.statusPending,
      };
    case BatchTaskStatus.MODELING:
      return {
        label: I18N.carbonFootprint3.batchTaskStatusModeling,
        className: styles.statusProcessing,
      };
    case BatchTaskStatus.MODEL_DONE:
      return {
        label: I18N.carbonFootprint3.batchTaskStatusDone,
        className: styles.statusDone,
      };
    case BatchTaskStatus.MODEL_FAIL:
      return {
        label: I18N.carbonFootprint3.batchTaskStatusFail,
        className: styles.statusFail,
      };
    default:
      return {
        label: '-',
        className: styles.statusPending,
      };
  }
};

const ModelingRecord: FC<ModelingRecordProps> = ({ open, onClose, onView }) => {
  const [records, setRecords] = useState<BatchTaskRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [productNameInput, setProductNameInput] = useState('');
  const [searchParams, setSearchParams] = useState<ModelingRecordSearchParams>(
    {},
  );
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  const statusOptions = useMemo(
    () => [
      {
        label: I18N.carbonFootprint3.batchTaskStatusBeforeParse,
        value: BatchTaskStatus.BEFORE_PARSE,
      },
      {
        label: I18N.carbonFootprint3.batchTaskStatusWaitModel,
        value: BatchTaskStatus.WAIT_MODEL,
      },
      {
        label: I18N.carbonFootprint3.batchTaskStatusModeling,
        value: BatchTaskStatus.MODELING,
      },
      {
        label: I18N.carbonFootprint3.batchTaskStatusDone,
        value: BatchTaskStatus.MODEL_DONE,
      },
      {
        label: I18N.carbonFootprint3.batchTaskStatusFail,
        value: BatchTaskStatus.MODEL_FAIL,
      },
    ],
    [],
  );

  const loadRecords = async (
    pageNum = 1,
    pageSize = 10,
    filters: ModelingRecordSearchParams = searchParams,
  ) => {
    setLoading(true);
    try {
      const { rows, total } = await getBatchTaskList({
        pageNum,
        pageSize,
        productName: filters.productName,
        status: filters.status,
      });
      setRecords(rows);
      setPagination({
        pageNum,
        pageSize,
        total,
      });
    } catch {
      setRecords([]);
      setPagination(prev => ({
        ...prev,
        pageNum,
        pageSize,
        total: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setProductNameInput('');
    setSearchParams({});
    loadRecords(1, pagination.pageSize, {}).catch(() => undefined);

    return undefined;
    // 打开弹窗时重置筛选与分页
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSearch = () => {
    const nextFilters: ModelingRecordSearchParams = {
      ...searchParams,
      productName: productNameInput.trim() || undefined,
    };
    setSearchParams(nextFilters);
    loadRecords(1, pagination.pageSize, nextFilters).catch(() => undefined);
  };

  const handleStatusChange = (status?: BatchTaskStatus) => {
    const nextFilters: ModelingRecordSearchParams = {
      ...searchParams,
      status,
    };
    setSearchParams(nextFilters);
    loadRecords(1, pagination.pageSize, nextFilters).catch(() => undefined);
  };

  const handlePaginationChange = (pageNum: number, pageSize: number) => {
    loadRecords(pageNum, pageSize, searchParams).catch(() => undefined);
  };
  const shouldScrollTable = pagination.pageSize > 10 || records.length > 10;

  const columns: ColumnsType<BatchTaskRecord> = [
    {
      title: I18N.carbonFootprint3.finalProductName,
      dataIndex: 'productName',
      width: 300,
      ellipsis: true,
      render: (_, record) => (
        <span
          className={styles.productNameCell}
          title={record.productName || '-'}
        >
          {record.productName?.trim() ? record.productName : '-'}
        </span>
      ),
    },
    {
      title: I18N.carbonFootprint3.batchTaskOperator,
      dataIndex: 'updateName',
      width: 120,
      ellipsis: true,
      render: value => value || '-',
    },
    {
      title: I18N.carbonFootprint3.batchTaskStatus,
      dataIndex: 'status',
      width: 120,
      render: (_, record) => {
        const statusMeta = getStatusMeta(record.status);
        return (
          <span className={classNames(styles.statusTag, statusMeta.className)}>
            {statusMeta.label}
          </span>
        );
      },
    },
    {
      title: I18N.carbonFootprint3.batchTaskCompletionTime,
      dataIndex: 'updateTime',
      width: 180,
      render: value => formatCompletionTime(value),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operation',
      width: 120,
      render: (_, record) => (
        <Button
          type='link'
          className={styles.viewLink}
          onClick={() => onView?.(record)}
        >
          {I18N.carbonFootprint3.view}
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={I18N.carbonFootprint3.modelingRecord}
      width={904}
      open={open}
      centered
      destroyOnClose
      className={styles.modelingRecordModal}
      closeIcon={<CloseOutlined className={styles.modalCloseIcon} />}
      footer={null}
      onCancel={onClose}
    >
      <div className={styles.filters}>
        <Input
          className={styles.keywordInput}
          allowClear
          maxLength={100}
          placeholder={I18N.carbonFootprint.productName}
          value={productNameInput}
          suffix={
            <SearchOutlined
              className={styles.searchIcon}
              onClick={handleSearch}
            />
          }
          onChange={event => setProductNameInput(event.target.value)}
          onPressEnter={handleSearch}
        />
        <Select
          className={styles.statusSelect}
          allowClear
          placeholder={I18N.carbonFootprint3.batchTaskStatus}
          options={statusOptions}
          value={searchParams.status}
          onChange={value =>
            handleStatusChange(
              value === undefined || value === null
                ? undefined
                : (value as BatchTaskStatus),
            )
          }
        />
      </div>
      <div className={styles.tableArea}>
        <Table<BatchTaskRecord>
          rowKey='id'
          className={styles.recordTable}
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={false}
          scroll={shouldScrollTable ? { y: TABLE_BODY_SCROLL_Y } : undefined}
          tableLayout='fixed'
        />
      </div>
      <div className={styles.paginationFooter}>
        <Pagination
          current={pagination.pageNum}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          showTotal={total => (
            <span className={styles.paginationTotal}>
              <span>{I18N.carbonFootprint3.totalPrefix}</span>
              <span className={styles.paginationTotalCount}>{total}</span>
              <span>{I18N.carbonFootprint3.totalRecordSuffix}</span>
            </span>
          )}
          onChange={handlePaginationChange}
        />
      </div>
    </Modal>
  );
};

export default ModelingRecord;
