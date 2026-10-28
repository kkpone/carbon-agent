import { Button, Input, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import I18N from '@/lang/I18N';

import { CarbonTaxPrecursorOption } from '../../../../type';

interface PrecursorSourceModalProps {
  open: boolean;
  options: CarbonTaxPrecursorOption[];
  excludedKeys: string[];
  onCancel: () => void;
  onSelect: (value: CarbonTaxPrecursorOption) => void;
}

const buildKey = (row: CarbonTaxPrecursorOption) =>
  `${row.sourceKind}-${row.sourceId}`;

export const PrecursorSourceModal = ({
  open,
  options,
  excludedKeys,
  onCancel,
  onSelect,
}: PrecursorSourceModalProps) => {
  const [keyword, setKeyword] = useState('');
  const [sourceKind, setSourceKind] = useState<number>();
  const [selectedKey, setSelectedKey] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setKeyword('');
    setSourceKind(undefined);
    setSelectedKey(undefined);
  }, [open]);

  const availableOptions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return options.filter(item => {
      if (excludedKeys.includes(buildKey(item))) return false;
      if (sourceKind && item.sourceKind !== sourceKind) return false;
      if (!normalizedKeyword) return true;
      return [item.precursorName, item.cnCode, item.productCategoryName]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(normalizedKeyword));
    });
  }, [excludedKeys, keyword, options, sourceKind]);

  const columns: ColumnsType<CarbonTaxPrecursorOption> = [
    {
      title: I18N.cbam.type,
      dataIndex: 'sourceTypeName',
      width: 100,
      render: (_value, row) =>
        row.sourceKind === 1 ? I18N.cbam.otherProcess : I18N.cbam.precursor,
    },
    {
      title: I18N.cbam.precursorName,
      dataIndex: 'precursorName',
      width: 180,
    },
    {
      title: I18N.cbam.productCategory,
      dataIndex: 'productCategoryName',
      width: 180,
      render: value => value || '-',
    },
    {
      title: I18N.cbam.currentCn,
      dataIndex: 'cnCode',
      width: 130,
      render: value => value || '-',
    },
    {
      title: I18N.cbam.totalConsumption,
      dataIndex: 'totalConsumption',
      width: 110,
      render: value => value ?? 0,
    },
    {
      title: I18N.cbam.unitConsumption,
      dataIndex: 'unitConsumption',
      width: 110,
      render: value => value ?? 0,
    },
  ];

  return (
    <Modal
      centered
      destroyOnClose
      maskClosable={false}
      open={open}
      title={I18N.cbam.selectPrecursor}
      width={1100}
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          {I18N.Factors.cancel}
        </Button>,
        <Button
          key='confirm'
          type='primary'
          disabled={!selectedKey}
          onClick={() => {
            const selected = availableOptions.find(
              item => buildKey(item) === selectedKey,
            );
            if (selected) onSelect(selected);
          }}
        >
          {I18N.base.confirm}
        </Button>,
      ]}
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          allowClear
          value={keyword}
          placeholder={I18N.cbam.precursorFilterPlaceholder}
          style={{ width: 320 }}
          onChange={event => setKeyword(event.target.value)}
        />
        <Select
          allowClear
          value={sourceKind}
          placeholder={I18N.cbam.allTypes}
          style={{ width: 160 }}
          options={[
            { label: I18N.cbam.otherProcess, value: 1 },
            { label: I18N.cbam.precursor, value: 2 },
          ]}
          onChange={setSourceKind}
        />
      </Space>
      <Table<CarbonTaxPrecursorOption>
        bordered
        rowKey={buildKey}
        size='small'
        columns={columns}
        dataSource={availableOptions}
        pagination={{ pageSize: 10 }}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedKey ? [selectedKey] : [],
          onChange: keys => setSelectedKey(keys[0] as string),
        }}
        onRow={record => ({
          onClick: () => setSelectedKey(buildKey(record)),
        })}
      />
    </Modal>
  );
};
