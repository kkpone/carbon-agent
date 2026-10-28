import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  Empty,
  Input,
  Modal,
  Pagination,
  Table,
  type TableColumnsType,
  type TableProps,
} from 'antd';
import { type Key, useEffect, useMemo, useState } from 'react';

import { useMobile } from '@/hooks/use-mobile';

import styles from './index.module.less';
import { fetchAgentProductFootprintAccountPage } from './service';
import type {
  AgentProductFootprintAccountRow,
  AgentProductFootprintAccountSelection,
  AgentProductFootprintAccountSelectorProps,
} from './types';

export type { AgentProductFootprintAccountSelection } from './types';

const PAGE_SIZE = 10;

const AgentProductFootprintAccountSelector = ({
  open,
  onCancel,
  onConfirm,
}: AgentProductFootprintAccountSelectorProps) => {
  const isMobile = useMobile();
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [rows, setRows] = useState<AgentProductFootprintAccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedRow, setSelectedRow] =
    useState<AgentProductFootprintAccountSelection>();

  useEffect(() => {
    if (open) return;

    setKeywordInput('');
    setKeyword('');
    setPageNum(1);
    setRows([]);
    setTotal(0);
    setLoading(false);
    setConfirming(false);
    setSelectedRow(undefined);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();
    setLoading(true);

    fetchAgentProductFootprintAccountPage(
      {
        keyword,
        pageNum,
        pageSize: PAGE_SIZE,
      },
      controller.signal,
    )
      .then(result => {
        if (controller.signal.aborted) return;
        setRows(result.rows);
        setTotal(result.total);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [keyword, open, pageNum]);

  const columns = useMemo<TableColumnsType<AgentProductFootprintAccountRow>>(
    () => [
      {
        dataIndex: 'productName',
        ellipsis: true,
        title: I18N.carbonAgent.enterpriseTaskProductName,
        render: value => value || '-',
      },
      {
        dataIndex: 'accountName',
        ellipsis: true,
        title: I18N.carbonAgent.enterpriseTaskFunctionalUnit,
        render: value => value || '-',
      },
      {
        dataIndex: 'factor',
        ellipsis: true,
        title: I18N.carbonAgent.enterpriseTaskUnitEmission,
        render: value => value ?? '-',
      },
      {
        dataIndex: 'factorUnit',
        ellipsis: true,
        title: I18N.carbonAgent.enterpriseTaskAccountingResultUnit,
        render: value => value || '-',
      },
    ],
    [],
  );

  const rowSelection: TableProps<AgentProductFootprintAccountRow>['rowSelection'] =
    {
      preserveSelectedRowKeys: true,
      selectedRowKeys: selectedRow ? [selectedRow.id] : [],
      type: 'radio',
      onChange: (
        _keys: Key[],
        selectedRows: AgentProductFootprintAccountRow[],
      ) => {
        const nextSelectedRow = selectedRows[0];
        setSelectedRow(nextSelectedRow);
      },
    };

  const commitSearch = () => {
    const nextKeyword = keywordInput.trim();

    if (nextKeyword === keyword) return;
    setKeyword(nextKeyword);
    setPageNum(1);
  };

  const handleConfirm = async () => {
    if (!selectedRow) return;

    setConfirming(true);
    try {
      await onConfirm(selectedRow);
      onCancel();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      className={styles.modal}
      open={open}
      width={1120}
      footer={null}
      closable={false}
      destroyOnClose
      maskClosable={false}
      onCancel={confirming ? undefined : onCancel}
    >
      <div className={styles.header}>
        <h2>{I18N.carbonAgent.enterpriseTaskSelectProductFootprint}</h2>
        <div className={styles.headerActions}>
          <Input
            allowClear
            value={keywordInput}
            placeholder={
              I18N.carbonAgent.enterpriseTaskProductFootprintSearchPlaceholder
            }
            suffix={
              <button
                aria-label={I18N.components.search}
                className={styles.searchButton}
                type='button'
                onClick={commitSearch}
              >
                <SearchOutlined />
              </button>
            }
            onChange={event => {
              const nextValue = event.target.value;
              setKeywordInput(nextValue);
              if (!nextValue && keyword) {
                setKeyword('');
                setPageNum(1);
              }
            }}
            onPressEnter={commitSearch}
          />
          <CloseOutlined
            className={styles.closeIcon}
            onClick={confirming ? undefined : onCancel}
          />
        </div>
      </div>

      <div className={styles.referenceModeCard}>
        <div className={styles.referenceModeTitle}>
          {I18N.carbonFootprint3.referenceResult}
        </div>
        <div className={styles.referenceModeDesc}>
          {I18N.carbonFootprint3.referenceResultDesc}
        </div>
        <div className={styles.referenceModeCheck} aria-hidden='true'>
          <CheckOutlined />
        </div>
      </div>

      <Table<AgentProductFootprintAccountRow>
        className={styles.table}
        rowKey='id'
        loading={loading}
        columns={columns}
        dataSource={rows}
        locale={{
          emptyText: (
            <Empty
              description={I18N.carbonAgent.noData}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        rowSelection={rowSelection}
        pagination={false}
        scroll={
          isMobile
            ? {
                x: 720,
                y: 'calc(var(--mobile-visual-viewport-height, 100dvh) - 466px)',
              }
            : undefined
        }
      />

      <div className={styles.footer}>
        <Pagination
          current={pageNum}
          pageSize={PAGE_SIZE}
          total={total}
          showSizeChanger={false}
          showTotal={value =>
            I18N.template(I18N.carbonAgent.enterpriseTaskTotalRecords, {
              val1: value,
            })
          }
          onChange={setPageNum}
        />
        <div className={styles.footerActions}>
          <Button disabled={confirming} onClick={onCancel}>
            {I18N.carbonFootprint.cancel}
          </Button>
          <Button
            type='primary'
            loading={confirming}
            disabled={!selectedRow}
            onClick={handleConfirm}
          >
            {I18N.carbonFootprint.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AgentProductFootprintAccountSelector;
