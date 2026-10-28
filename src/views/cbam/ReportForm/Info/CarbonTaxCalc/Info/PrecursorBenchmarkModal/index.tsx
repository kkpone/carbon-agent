import { Button, Form, Input, Modal, Radio, Space, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';

import I18N from '@/lang/I18N';

import { getCnBenchmarkPage } from '../../../../service';
import { CnBenchmarkOption } from '../../../../type';

const PAGE_SIZE = 10;
const BMG_STAR = 1;
const BMG = 2;

export interface PrecursorBenchmarkSelection extends CnBenchmarkOption {
  benchmarkType: number;
  benchmarkValue: number;
  rowKey: string;
}

interface SearchValues {
  cnCode?: string;
}

interface PrecursorBenchmarkModalProps {
  open: boolean;
  embedded?: boolean;
  allowedBenchmarkType?: number;
  initialCnCode?: string;
  initialSelection?: PrecursorBenchmarkSelection;
  onCancel: () => void;
  onClear?: () => void;
  onSelect: (value: PrecursorBenchmarkSelection) => void;
}

export const PrecursorBenchmarkModal = ({
  open,
  embedded = false,
  allowedBenchmarkType,
  initialCnCode,
  initialSelection,
  onCancel,
  onClear,
  onSelect,
}: PrecursorBenchmarkModalProps) => {
  const [form] = Form.useForm<SearchValues>();
  const [rows, setRows] = useState<CnBenchmarkOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<SearchValues>({});
  const [selectedValue, setSelectedValue] =
    useState<PrecursorBenchmarkSelection>();

  const loadData = useCallback(
    async (current: number, size: number, search: SearchValues) => {
      if (!open && !embedded) return;
      setLoading(true);
      try {
        const { data } = await getCnBenchmarkPage({
          pageNum: current,
          pageSize: size,
          cnCode: search.cnCode?.trim() || undefined,
        });
        const page = data?.data || {};
        setRows(page.records || []);
        setTotal(page.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [embedded, open],
  );

  useEffect(() => {
    if (!open && !embedded) return;
    const initialFilters = {
      cnCode: initialCnCode,
    };
    form.resetFields();
    form.setFieldsValue(initialFilters);
    setFilters(initialFilters);
    setPageNum(1);
    setPageSize(PAGE_SIZE);
    setSelectedValue(initialSelection);
    loadData(1, PAGE_SIZE, initialFilters);
  }, [embedded, form, initialCnCode, initialSelection, loadData, open]);

  const selectBenchmark = (
    record: CnBenchmarkOption,
    benchmarkType: number,
    benchmarkValue?: number,
  ) => {
    if (
      benchmarkValue === undefined ||
      benchmarkValue === null ||
      (allowedBenchmarkType !== undefined &&
        benchmarkType !== allowedBenchmarkType)
    ) {
      return;
    }
    const selection = {
      ...record,
      benchmarkType,
      benchmarkValue,
      rowKey: `${record.id}:${benchmarkType}`,
    };
    setSelectedValue(selection);
    if (embedded) onSelect(selection);
  };

  const columns: ColumnsType<CnBenchmarkOption> = [
    {
      title: I18N.cbam.cnCode,
      dataIndex: 'cnCode',
      width: 130,
    },
    {
      title: I18N.cbam.cnName3,
      dataIndex: 'cnDescription',
      width: 260,
      ellipsis: true,
      render: value => value || '-',
    },
    {
      title: I18N.cbam.measuredBenchmarkValue,
      dataIndex: 'bmgStar',
      width: 150,
      render: (value, record) =>
        value === undefined || value === null ? (
          '-'
        ) : (
          <Radio
            disabled={
              allowedBenchmarkType !== undefined &&
              allowedBenchmarkType !== BMG_STAR
            }
            checked={
              selectedValue?.id === record.id &&
              selectedValue.benchmarkType === BMG_STAR
            }
            onClick={() => selectBenchmark(record, BMG_STAR, value)}
          >
            {value}
          </Radio>
        ),
    },
    {
      title: I18N.cbam.defaultBenchmarkValue,
      dataIndex: 'bmg',
      width: 150,
      render: (value, record) =>
        value === undefined || value === null ? (
          '-'
        ) : (
          <Radio
            disabled={
              allowedBenchmarkType !== undefined && allowedBenchmarkType !== BMG
            }
            checked={
              selectedValue?.id === record.id &&
              selectedValue.benchmarkType === BMG
            }
            onClick={() => selectBenchmark(record, BMG, value)}
          >
            {value}
          </Radio>
        ),
    },
    {
      title: I18N.cbam.productionRouteCode,
      dataIndex: 'productionRouteCode',
      width: 180,
      render: value => value || '-',
    },
    {
      title: I18N.cbam.productionRoute,
      dataIndex: 'productionRouteIndicator',
      width: 260,
      ellipsis: true,
      render: value => value || '-',
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const nextPage = pagination.current || 1;
    const nextSize = pagination.pageSize || PAGE_SIZE;
    setPageNum(nextPage);
    setPageSize(nextSize);
    setSelectedValue(undefined);
    onClear?.();
    loadData(nextPage, nextSize, filters);
  };

  const content = (
    <>
      <Form<SearchValues>
        form={form}
        layout='inline'
        style={{ marginBottom: 16 }}
        onFinish={values => {
          const nextFilters = {
            cnCode: values.cnCode?.trim(),
          };
          setFilters(nextFilters);
          setPageNum(1);
          setSelectedValue(undefined);
          onClear?.();
          loadData(1, pageSize, nextFilters);
        }}
      >
        <Form.Item label={I18N.cbam.cnCode} name='cnCode'>
          <Input allowClear placeholder={I18N.cbam.filterByCnCode} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type='primary' htmlType='submit'>
              {I18N.utils.search}
            </Button>
            <Button
              onClick={() => {
                const initialFilters = {
                  cnCode: initialCnCode,
                };
                form.resetFields();
                form.setFieldsValue(initialFilters);
                setFilters(initialFilters);
                setPageNum(1);
                setSelectedValue(undefined);
                onClear?.();
                loadData(1, pageSize, initialFilters);
              }}
            >
              {I18N.utils.reset}
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Table<CnBenchmarkOption>
        bordered
        rowKey='id'
        size='small'
        loading={loading}
        columns={columns}
        dataSource={rows}
        scroll={{ x: 1100 }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        rowClassName={record =>
          selectedValue?.id === record.id ? 'ant-table-row-selected' : ''
        }
      />
    </>
  );

  if (embedded) return content;

  return (
    <Modal
      centered
      destroyOnClose
      maskClosable={false}
      open={open}
      title={I18N.cbam.findBenchmarkValue}
      width={1150}
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          {I18N.Factors.cancel}
        </Button>,
        <Button
          key='confirm'
          type='primary'
          disabled={!selectedValue}
          onClick={() => {
            if (selectedValue) onSelect(selectedValue);
          }}
        >
          {I18N.base.confirm}
        </Button>,
      ]}
    >
      {content}
    </Modal>
  );
};
