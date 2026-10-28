import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Select, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import I18N from '@/lang/I18N';

import { CarbonTaxPrecursor, CarbonTaxPrecursorOption } from '../../../../type';
import {
  PrecursorBenchmarkModal,
  PrecursorBenchmarkSelection,
} from '../PrecursorBenchmarkModal';

export type PrecursorEditorValue = CarbonTaxPrecursor &
  Partial<CarbonTaxPrecursorOption> & {
    rowKey: string;
  };

type EditorMode = 'add' | 'edit' | 'show';

interface PrecursorEditorModalProps {
  open: boolean;
  mode: EditorMode;
  value?: PrecursorEditorValue;
  precursorOptions: CarbonTaxPrecursorOption[];
  excludedKeys: string[];
  onCancel: () => void;
  onOk: (value: PrecursorEditorValue) => void;
}

const BMG_STAR = 1;
const BMG = 2;
const PRECURSOR_BENCHMARK_TIP = I18N.cbam.precursorBenchmarkTip;

const precursorBenchmarkLabel = (
  <span>
    {I18N.cbam.selectPrecursorBenchmarkValue}
    <Tooltip title={PRECURSOR_BENCHMARK_TIP}>
      <QuestionCircleOutlined className='iconTip' />
    </Tooltip>
  </span>
);

const buildPrecursorKey = (row: { sourceKind?: number; sourceId?: number }) =>
  `${row.sourceKind}-${row.sourceId}`;

export const PrecursorEditorModal = ({
  open,
  mode,
  value,
  precursorOptions,
  excludedKeys,
  onCancel,
  onOk,
}: PrecursorEditorModalProps) => {
  const [form] = Form.useForm<PrecursorEditorValue>();
  const [selectedPrecursor, setSelectedPrecursor] =
    useState<PrecursorEditorValue>();
  const readOnly = mode === 'show';
  const productionRouteCode = Form.useWatch('productionRouteCode', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setSelectedPrecursor(value);
    if (value) form.setFieldsValue(value);
  }, [form, open, value]);

  const availableOptions = useMemo(
    () =>
      precursorOptions.filter(
        item => !excludedKeys.includes(buildPrecursorKey(item)),
      ),
    [excludedKeys, precursorOptions],
  );

  const initialBenchmarkSelection = useMemo<
    PrecursorBenchmarkSelection | undefined
  >(() => {
    if (
      !selectedPrecursor?.benchmarkId ||
      !selectedPrecursor.benchmarkType ||
      selectedPrecursor.benchmarkValue === undefined
    ) {
      return undefined;
    }
    return {
      id: selectedPrecursor.benchmarkId,
      cnCode: selectedPrecursor.cnCode,
      cnDescription: selectedPrecursor.cnName,
      benchmarkType: selectedPrecursor.benchmarkType,
      benchmarkValue: selectedPrecursor.benchmarkValue,
      productionRouteCode: selectedPrecursor.productionRouteCode,
      productionRouteIndicator: selectedPrecursor.productionRouteIndicator,
      rowKey: `${selectedPrecursor.benchmarkId}:${selectedPrecursor.benchmarkType}`,
    };
  }, [selectedPrecursor]);

  const clearBenchmark = () => {
    form.setFieldsValue({
      defaultCnId: undefined,
      cnCode: undefined,
      cnName: undefined,
      benchmarkId: undefined,
      benchmarkType: undefined,
      benchmarkValue: undefined,
      productionRouteCode: undefined,
      productionRouteIndicator: undefined,
    });
  };

  const selectBenchmark = (selection: PrecursorBenchmarkSelection) => {
    form.setFieldsValue({
      defaultCnId: undefined,
      cnCode: selection.cnCode,
      cnName: selection.cnDescription,
      benchmarkId: selection.id,
      benchmarkType: selection.benchmarkType,
      benchmarkValue: selection.benchmarkValue,
      productionRouteCode: selection.productionRouteCode,
      productionRouteIndicator: selection.productionRouteIndicator,
    });
  };

  let title = I18N.cbam.addPrecursor;
  if (mode === 'edit') title = I18N.cbam.editPrecursorBenchmark;
  if (mode === 'show') title = I18N.cbam.viewPrecursor;

  return (
    <Modal
      centered
      destroyOnClose
      maskClosable={false}
      open={open}
      title={title}
      width={1180}
      onCancel={onCancel}
      footer={
        readOnly
          ? [
              <Button key='close' onClick={onCancel}>
                {I18N.carbonFootPrintLCA.close}
              </Button>,
            ]
          : [
              <Button key='cancel' onClick={onCancel}>
                {I18N.Factors.cancel}
              </Button>,
              <Button
                key='confirm'
                type='primary'
                disabled={!selectedPrecursor}
                onClick={async () => {
                  const fields = await form.validateFields();
                  if (!selectedPrecursor) return;
                  const benchmarkContribution = new BigNumber(
                    fields.benchmarkValue || 0,
                  )
                    .times(selectedPrecursor.unitConsumption || 0)
                    .toNumber();
                  onOk({
                    ...selectedPrecursor,
                    ...fields,
                    defaultCnId: undefined,
                    benchmarkContribution,
                  });
                }}
              >
                {I18N.base.confirm}
              </Button>,
            ]
      }
    >
      <Form form={form} layout='vertical' disabled={readOnly}>
        <Form.Item
          name='benchmarkId'
          hidden
          rules={[
            { required: true, message: I18N.cbam.selectPrecursorBenchmark },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='productionRouteCode' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='cnCode' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='cnName' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='benchmarkType' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='benchmarkValue' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='productionRouteIndicator' hidden>
          <Input />
        </Form.Item>
        {mode === 'add' && (
          <Form.Item
            label={I18N.cbam.selectPrecursor}
            required
            style={{ width: 440 }}
          >
            <Select
              showSearch
              optionFilterProp='label'
              placeholder={I18N.cbam.pleaseSelectPrecursor2}
              value={selectedPrecursor?.rowKey}
              options={availableOptions.map(item => ({
                value: buildPrecursorKey(item),
                label: [
                  item.precursorName,
                  item.productCategoryName,
                  item.cnCode,
                ]
                  .filter(Boolean)
                  .join(' / '),
              }))}
              onChange={rowKey => {
                const option = availableOptions.find(
                  item => buildPrecursorKey(item) === rowKey,
                );
                if (!option) return;
                const row: PrecursorEditorValue = {
                  ...option,
                  precursorNameSnapshot: option.precursorName,
                  rowKey: buildPrecursorKey(option),
                };
                form.resetFields();
                form.setFieldsValue(row);
                setSelectedPrecursor(row);
              }}
            />
          </Form.Item>
        )}
        {readOnly && (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={I18N.cbam.type}>
                <Input
                  disabled
                  value={
                    selectedPrecursor?.sourceKind === 1
                      ? I18N.cbam.otherProcess
                      : I18N.cbam.precursor
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.precursorName}>
                <Input
                  disabled
                  value={
                    selectedPrecursor?.precursorNameSnapshot ||
                    selectedPrecursor?.precursorName
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.productCategory}>
                <Input
                  disabled
                  value={selectedPrecursor?.productCategoryName || '-'}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.currentCn}>
                <Input disabled value={selectedPrecursor?.cnCode || '-'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.totalConsumption}>
                <Input disabled value={selectedPrecursor?.totalConsumption} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.precursorUnitConsumption}>
                <Input disabled value={selectedPrecursor?.unitConsumption} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.benchmarkCnCode} name='cnCode'>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label={I18N.cbam.benchmarkCnName} name='cnName'>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={I18N.cbam.benchmarkValueType}
                name='benchmarkType'
              >
                <Select
                  disabled
                  options={[
                    { label: I18N.cbam.actualValue, value: BMG_STAR },
                    { label: I18N.cbam.defaultValue, value: BMG },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={I18N.cbam.precursorBenchmark}
                name='benchmarkValue'
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={I18N.cbam.productionRouteCode}>
                <Input disabled value={productionRouteCode} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={I18N.cbam.productionRouteDescription}
                name='productionRouteIndicator'
              >
                <Input.TextArea disabled autoSize />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
      {!readOnly && selectedPrecursor && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>
            {precursorBenchmarkLabel}
          </div>
          <PrecursorBenchmarkModal
            embedded
            open
            initialCnCode={selectedPrecursor.cnCode}
            initialSelection={initialBenchmarkSelection}
            onCancel={() => undefined}
            onClear={clearBenchmark}
            onSelect={selectBenchmark}
          />
        </div>
      )}
    </Modal>
  );
};
