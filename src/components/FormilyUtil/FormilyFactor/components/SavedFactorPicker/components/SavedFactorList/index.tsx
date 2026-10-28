import emptyImage from '@src/assets/icon/empty.svg';
import I18N from '@src/lang/I18N';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Pagination,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { getSavedFactorScope } from '../../../../customFactorReuse/scope';

import type {
  SavedCustomFactor,
  SavedFactorFilters,
  SavedFactorPage,
  SavedFactorService,
} from '../../../../customFactorReuse/types';
import styles from './index.module.less';

type FilterValues = Omit<SavedFactorFilters, 'year'> & { year?: Dayjs };

type Props = {
  service: SavedFactorService;
  revision: number;
  mode: 'select' | 'manage';
  toolbar?: ReactNode;
  deletingId?: string;
  disabled?: boolean;
  selectedFactor?: SavedCustomFactor;
  onSelectionChange?: (record: SavedCustomFactor | undefined) => void;
  onDelete?: (record: SavedCustomFactor) => void;
};

export default function SavedFactorList({
  service,
  revision,
  mode,
  toolbar,
  deletingId,
  disabled = false,
  selectedFactor,
  onSelectionChange,
  onDelete,
}: Props) {
  const [form] = Form.useForm<FilterValues>();
  const [filters, setFilters] = useState<SavedFactorFilters>({});
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState<SavedFactorPage>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const text = I18N.customFactorReuse;

  useEffect(() => {
    let cancelled = false;
    const scope = getSavedFactorScope();
    setLoading(true);
    onSelectionChange?.(undefined);
    service
      .query({ ...filters, pageNum, pageSize })
      .then(next => {
        if (cancelled || scope !== getSavedFactorScope()) return;
        const lastPage = Math.max(1, Math.ceil(next.total / pageSize));
        if (pageNum > lastPage) {
          setPageNum(lastPage);
          return;
        }
        setPage(next);
      })
      .catch(() => {
        // 接口错误由统一请求层处理；失败时不展示过期行供选择。
        if (!cancelled && scope === getSavedFactorScope())
          setPage({ rows: [], total: 0 });
      })
      .finally(() => {
        if (!cancelled && scope === getSavedFactorScope()) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service, filters, pageNum, pageSize, revision, onSelectionChange]);

  const columns: ColumnsType<SavedCustomFactor> = [
    {
      title: text.sequence,
      key: 'sequence',
      width: 64,
      render: (_, __, index) => (pageNum - 1) * pageSize + index + 1,
    },
    { title: text.name, dataIndex: 'name', width: 220, ellipsis: true },
    { title: text.factor, dataIndex: 'factor', width: 160, ellipsis: true },
    {
      title: text.unit,
      width: 180,
      dataIndex: 'unit',
      ellipsis: true,
    },
    {
      title: text.institution,
      dataIndex: 'institution',
      width: 180,
      ellipsis: true,
    },
    {
      title: text.year,
      dataIndex: 'year',
      width: 100,
      ellipsis: true,
      render: year => year || '—',
    },
  ];

  if (mode === 'manage') {
    columns.push({
      title: text.operation,
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type='link'
          className={styles.rowAction}
          danger
          disabled={loading || !!deletingId}
          loading={deletingId === record.id}
          onClick={() => onDelete?.(record)}
        >
          {text.delete}
        </Button>
      ),
    });
  }

  return (
    <div className={styles.list}>
      <Form<FilterValues>
        name={`saved-factor-${mode}`}
        form={form}
        disabled={disabled}
        layout='vertical'
        className={styles.filters}
        onFinish={values => {
          onSelectionChange?.(undefined);
          setPageNum(1);
          setFilters({
            name: values.name?.trim(),
            factor: values.factor ?? undefined,
            institution: values.institution?.trim(),
            year: values.year?.format('YYYY'),
          });
        }}
      >
        <Form.Item name='name' label={text.name}>
          <Input maxLength={40} allowClear placeholder={text.namePlaceholder} />
        </Form.Item>
        <Form.Item name='factor' label={text.factor}>
          <InputNumber<string>
            stringMode
            formatter={(value, { userTyping, input }) =>
              userTyping ? input : value ?? ''
            }
            controls={false}
            placeholder={text.factorPlaceholder}
          />
        </Form.Item>
        <Form.Item name='institution' label={text.institution}>
          <Input
            maxLength={40}
            allowClear
            placeholder={text.institutionPlaceholder}
          />
        </Form.Item>
        <Form.Item name='year' label={text.year}>
          <DatePicker picker='year' />
        </Form.Item>
        <div className={styles.actions}>
          <Button htmlType='submit' type='primary'>
            {text.search}
          </Button>
          <Button
            onClick={() => {
              onSelectionChange?.(undefined);
              form.resetFields();
              setPageNum(1);
              setFilters({});
            }}
          >
            {text.reset}
          </Button>
          {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
        </div>
      </Form>
      <div className={styles.tableArea}>
        <Table<SavedCustomFactor>
          className={styles.table}
          rowKey='id'
          size='small'
          tableLayout='fixed'
          columns={columns}
          dataSource={page.rows}
          loading={loading}
          locale={{
            emptyText: (
              <div className={styles.empty}>
                <img src={emptyImage} alt='' />
                <span>{text.empty}</span>
              </div>
            ),
          }}
          rowSelection={
            mode === 'select'
              ? {
                  type: 'radio',
                  columnWidth: 40,
                  selectedRowKeys: selectedFactor ? [selectedFactor.id] : [],
                  onChange: (_, rows) => onSelectionChange?.(rows[0]),
                  getCheckboxProps: record => ({
                    disabled: loading || disabled,
                    'aria-label': `${text.select} ${record.name}`,
                  }),
                }
              : undefined
          }
          scroll={{
            x: mode === 'select' ? 944 : 1004,
            y: '100%',
          }}
          pagination={false}
        />
      </div>
      <Pagination
        className={styles.pagination}
        size='default'
        current={pageNum}
        pageSize={pageSize}
        total={page.total}
        disabled={disabled}
        showSizeChanger
        pageSizeOptions={[10, 20, 50]}
        showTotal={total => (
          <span className={styles.total}>
            {I18N.carbonFootprint3.totalPrefix}
            <span className={styles.totalCount}>{total}</span>
            {I18N.carbonFootprint3.totalRecordSuffix}
          </span>
        )}
        onChange={(next, nextSize) => {
          onSelectionChange?.(undefined);
          setPageNum(nextSize === pageSize ? next : 1);
          setPageSize(nextSize);
        }}
      />
    </div>
  );
}
