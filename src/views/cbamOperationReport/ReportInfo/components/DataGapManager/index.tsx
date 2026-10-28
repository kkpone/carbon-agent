import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

import I18N from '@src/lang/I18N';

import {
  CbamDrawerClose,
  CbamDrawerTitle,
} from '@/components/CbamDrawerHeader';
import { showMonitorDeleteConfirm } from '@/views/cbamMonitor/deleteConfirm';

import {
  DataGapData,
  DataGapStatus,
  OperationProcessItem,
} from '../../../types';
import styles from './index.module.less';

interface DataGapFormValue
  extends Partial<Omit<DataGapData, 'gapStartDate' | 'gapEndDate'>> {
  gapPeriod?: [Dayjs, Dayjs];
}

interface DataGapManagerProps {
  value: DataGapData[];
  processes: OperationProcessItem[];
  disabled?: boolean;
  confirmedNoGaps: boolean;
  onConfirmedNoGapsChange: (value: boolean) => void;
  onChange: (value: DataGapData[]) => void;
}

const statusName: Record<DataGapStatus, string> = {
  0: I18N.cbamOperationReport.pending,
  1: I18N.cbamOperationReport.processing,
  2: I18N.cbamOperationReport.closed,
};

const DataGapManager = ({
  value,
  processes,
  disabled,
  confirmedNoGaps,
  onConfirmedNoGapsChange,
  onChange,
}: DataGapManagerProps) => {
  const [form] = Form.useForm<DataGapFormValue>();
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string>();
  const processOptions = processes
    .filter(item => item.itemKey)
    .map(item => ({ label: item.processName || '-', value: item.itemKey }));

  const close = () => {
    setOpen(false);
    setEditingKey(undefined);
    form.resetFields();
  };

  const edit = (record?: DataGapData) => {
    if (!record && (disabled || confirmedNoGaps)) return;
    setEditingKey(record?.itemKey);
    form.resetFields();
    form.setFieldsValue(
      record
        ? {
            ...record,
            gapPeriod:
              record.gapStartDate && record.gapEndDate
                ? [dayjs(record.gapStartDate), dayjs(record.gapEndDate)]
                : undefined,
          }
        : ({
            itemKey: `gap-${Date.now()}`,
            status: undefined,
          } as Partial<DataGapFormValue>),
    );
    setOpen(true);
  };

  const save = () => {
    const { gapPeriod, ...result } = form.getFieldsValue();
    const next = {
      ...result,
      itemKey: result.itemKey || editingKey || `gap-${Date.now()}`,
      gapStartDate: gapPeriod?.[0]?.format('YYYY-MM-DD'),
      gapEndDate: gapPeriod?.[1]?.format('YYYY-MM-DD'),
    } as DataGapData;
    onChange(
      editingKey
        ? value.map(item => (item.itemKey === editingKey ? next : item))
        : [...value, next],
    );
    close();
  };

  const remove = (record: DataGapData) => {
    showMonitorDeleteConfirm({
      title: I18N.cbamOperationReport.deleteDataGap,
      content: I18N.template(I18N.cbamOperationReport.confirmDeleteDataGap, {
        name: record.parameterName,
      }),
      onOk: () =>
        onChange(value.filter(item => item.itemKey !== record.itemKey)),
    });
  };

  const columns: ColumnsType<DataGapData> = [
    {
      title: I18N.cbamOperationReport.parameterName,
      dataIndex: 'parameterName',
      render: value => value || '-',
    },
    {
      title: I18N.cbamOperationReport.productionProcess,
      dataIndex: 'processItemKey',
      render: processItemKey =>
        processOptions.find(item => item.value === processItemKey)?.label ||
        processItemKey ||
        '-',
    },
    {
      title: I18N.cbamOperationReport.missingAmount,
      dataIndex: 'missingAmount',
      render: value => value || '-',
    },
    {
      title: I18N.cbamOperationReport.gapPeriod,
      render: (_, record) =>
        record.gapStartDate && record.gapEndDate
          ? `${record.gapStartDate} ~ ${record.gapEndDate}`
          : '-',
    },
    {
      title: I18N.cbamOperationReport.status,
      dataIndex: 'status',
      render: status => statusName[status as DataGapStatus] || '-',
    },
    {
      title: I18N.cbamOperationReport.actions,
      width: 140,
      render: (_, record) =>
        disabled ? (
          '-'
        ) : (
          <Space>
            <Button
              type='link'
              icon={<EditOutlined />}
              onClick={() => edit(record)}
            >
              {I18N.cbamOperationReport.edit}
            </Button>
            <Button
              type='link'
              danger
              icon={<DeleteOutlined />}
              onClick={() => remove(record)}
            >
              {I18N.cbamOperationReport.delete}
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h3>{I18N.cbamOperationReport.dataGaps}</h3>
        <Checkbox
          className={styles.noGapCheckbox}
          checked={confirmedNoGaps}
          disabled={disabled || value.length > 0}
          onChange={event => onConfirmedNoGapsChange(event.target.checked)}
        >
          {I18N.cbamOperationReport.confirmNoDataGaps}
        </Checkbox>
        {!disabled && (
          <Button
            className={styles.addButton}
            type='primary'
            icon={<PlusOutlined />}
            disabled={confirmedNoGaps}
            onClick={() => edit()}
          >
            {I18N.cbamOperationReport.addDataGap}
          </Button>
        )}
      </div>
      <Table<DataGapData>
        rowKey='itemKey'
        columns={columns}
        dataSource={value}
        pagination={false}
        className={styles.table}
      />
      <Drawer
        closable={false}
        open={open}
        width={604}
        rootClassName={styles.dataGapDrawer}
        destroyOnClose
        title={
          <CbamDrawerTitle>
            {editingKey
              ? I18N.cbamOperationReport.editDataGap
              : I18N.cbamOperationReport.addDataGap}
          </CbamDrawerTitle>
        }
        onClose={close}
        extra={<CbamDrawerClose onClick={close} />}
        footer={
          <div className={styles.drawerActions}>
            <Button onClick={close}>{I18N.cbamOperationReport.cancel}</Button>
            <Button type='primary' onClick={save}>
              {I18N.cbamOperationReport.confirm}
            </Button>
          </div>
        }
      >
        <Form form={form} layout='vertical' className={styles.dataGapForm}>
          <Form.Item name='itemKey' hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name='parameterName'
            label={I18N.cbamOperationReport.parameterName}
            rules={[{ required: true }]}
          >
            <Input
              maxLength={40}
            />
          </Form.Item>
          <Form.Item
            name='processItemKey'
            label={I18N.cbamOperationReport.productionProcess}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp='label'
              options={processOptions}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='gapPeriod'
            label={I18N.cbamOperationReport.gapPeriod}
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker
              placeholder={['', '']}
            />
          </Form.Item>
          <Form.Item
            name='missingAmount'
            label={I18N.cbamOperationReport.missingAmount}
            rules={[{ required: true }]}
          >
            <Input
              maxLength={40}
            />
          </Form.Item>
          <Form.Item
            name='status'
            label={I18N.cbamOperationReport.handlingStatus}
            rules={[{ required: true }]}
          >
            <Select
              options={Object.entries(statusName).map(([code, label]) => ({
                label,
                value: Number(code),
              }))}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='reason'
            label={I18N.cbamOperationReport.gapReason}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              maxLength={200}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='substituteSource'
            label={I18N.cbamOperationReport.substituteDataSource}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              maxLength={200}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='estimationMethod'
            label={I18N.cbamOperationReport.estimationMethod}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              maxLength={200}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='estimationResult'
            label={I18N.cbamOperationReport.estimationResult}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              maxLength={200}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='impactAssessment'
            label={I18N.cbamOperationReport.impactAssessment}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              maxLength={200}
            />
          </Form.Item>
          <Form.Item
            className={styles.fullField}
            name='correctiveAction'
            label={I18N.cbamOperationReport.correctiveActions}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default DataGapManager;
