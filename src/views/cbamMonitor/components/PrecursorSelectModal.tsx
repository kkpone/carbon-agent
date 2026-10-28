import I18N from '@src/lang/I18N';
import { Button, Modal, Pagination, Select, Space, Table, TableColumnsType } from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

import styles from '../plan.module.less';
import { getMonitorPrecursorPage } from '../service';
import { MonitorPrecursorOption } from '../types';

const PAGE_SIZE = 10;
const APPROVED = 'APPROVED';

interface PrecursorSelectModalProps {
  open: boolean;
  cnOptions: { label: string; value: string }[];
  onCancel: () => void;
  onConfirm: (record: MonitorPrecursorOption) => void;
}

const displayDateRange = (record: MonitorPrecursorOption) => {
  if (record.verificationPeriod) return record.verificationPeriod;
  if (!record.applyTime || !record.submitTime) return '--';
  return `${moment(record.applyTime).format('YYYY-MM-DD')} ${I18N.cbamMonitor.to} ${moment(record.submitTime).format('YYYY-MM-DD')}`;
};

const displayEmbeddedEmission = (value?: number | string) => {
  if (value === undefined || value === null || value === '') return '--';
  return typeof value === 'number' ? `${value} tCO₂e/t` : value;
};

export const PrecursorSelectModal = ({
  open,
  cnOptions,
  onCancel,
  onConfirm,
}: PrecursorSelectModalProps) => {
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<MonitorPrecursorOption[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<MonitorPrecursorOption>();
  const [cnCode, setCnCode] = useState<string>();
  const [supplyName, setSupplyName] = useState<string>();
  const [preName, setPreName] = useState<string>();

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    getMonitorPrecursorPage({
      pageNum,
      pageSize: PAGE_SIZE,
      applyStatus: APPROVED,
      type: 1,
      cnCode,
      supplyName,
      preName,
    })
      .then(({ data }) => {
        if (!active) return;
        const page = data?.data;
        setRecords(page?.records || page?.rows || page?.list || []);
        setTotal(page?.total || 0);
      })
      .catch(() => {
        if (active) {
          setRecords([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cnCode, open, pageNum, preName, supplyName]);

  useEffect(() => {
    if (open) return;
    setPageNum(1);
    setSelected(undefined);
    setCnCode(undefined);
    setSupplyName(undefined);
    setPreName(undefined);
  }, [open]);

  const supplyOptions = useMemo(() => Array.from(new Set(records.map(item => item.supplyName).filter(Boolean)))
    .map(value => ({ label: value || '', value: value || '' })), [records]);
  const precursorOptions = useMemo(() => Array.from(new Set(records.map(item => item.precursorName).filter(Boolean)))
    .map(value => ({ label: value || '', value: value || '' })), [records]);

  const columns: TableColumnsType<MonitorPrecursorOption> = [
    { title: I18N.cbamMonitor.cnCodeShort, dataIndex: 'cnCode', width: 130 },
    {
      title: I18N.cbamMonitor.declarationName,
      dataIndex: 'declarationName',
      width: 280,
      ellipsis: true,
      render: (value, record) => value || record.companyName || '--',
    },
    { title: I18N.cbamMonitor.precursorName, dataIndex: 'precursorName', width: 130, ellipsis: true },
    { title: I18N.cbamMonitor.supplier, dataIndex: 'supplyName', width: 140, ellipsis: true },
    {
      title: I18N.cbamMonitor.verificationPeriod,
      dataIndex: 'verificationPeriod',
      width: 210,
      render: (_, record) => displayDateRange(record),
    },
    {
      title: I18N.cbamMonitor.embeddedEmission,
      dataIndex: 'embeddedEmission',
      width: 140,
      render: displayEmbeddedEmission,
    },
  ];

  const updateFilter = (setter: (value?: string) => void, value?: string) => {
    setPageNum(1);
    setter(value || undefined);
  };

  return (
    <Modal
      centered
      className={styles.precursorSelectModal}
      destroyOnClose
      footer={(
        <div className={styles.precursorModalFooter}>
          <Pagination
            current={pageNum}
            pageSize={PAGE_SIZE}
            showSizeChanger={false}
            showTotal={count => I18N.template(I18N.cbamMonitor.totalRecords, { total: count })}
            total={total}
            onChange={setPageNum}
          />
          <Space size={12}>
            <Button onClick={onCancel}>{I18N.cbamMonitor.cancel}</Button>
            <Button type='primary' disabled={!selected} onClick={() => selected && onConfirm(selected)}>
              {I18N.cbamMonitor.confirm}
            </Button>
          </Space>
        </div>
      )}
      maskClosable={false}
      open={open}
      title={I18N.cbamMonitor.selectPrecursor}
      width={1140}
      onCancel={onCancel}
    >
      <div className={styles.precursorModalFilters}>
        <Select
          allowClear
          showSearch
          optionFilterProp='label'
          options={cnOptions}
          placeholder={I18N.cbamMonitor.cnCode}
          value={cnCode}
          onChange={value => updateFilter(setCnCode, value)}
        />
        <Select
          allowClear
          showSearch
          filterOption={false}
          options={supplyOptions}
          placeholder={I18N.cbamMonitor.supplier}
          value={supplyName}
          onChange={value => updateFilter(setSupplyName, value)}
          onSearch={value => updateFilter(setSupplyName, value)}
        />
        <Select
          allowClear
          showSearch
          filterOption={false}
          options={precursorOptions}
          placeholder={I18N.cbamMonitor.precursorName}
          value={preName}
          onChange={value => updateFilter(setPreName, value)}
          onSearch={value => updateFilter(setPreName, value)}
        />
      </div>
      <Table<MonitorPrecursorOption>
        columns={columns}
        dataSource={records}
        loading={loading}
        pagination={false}
        rowKey={record => record.id || record.productPrecursorId || `${record.cnCode}-${record.precursorName}`}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selected ? [selected.id || selected.productPrecursorId || `${selected.cnCode}-${selected.precursorName}`] : [],
          onChange: (_, selectedRows) => setSelected(selectedRows[0]),
        }}
        scroll={{ x: 1030, y: 480 }}
      />
    </Modal>
  );
};
