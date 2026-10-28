import {
  CloseOutlined,
  DownOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  AutoComplete,
  Button,
  Drawer,
  Form,
  FormInstance,
  Input,
  Select,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import { useMemo, useState } from 'react';

import { BusinessEvidenceCard } from './BusinessEvidenceCard';
import { EvidenceSelectModal } from './EvidenceSelectModal';
import selectEvidenceIcon from '../assets/select-evidence.svg';
import { showMonitorDeleteConfirm } from '../deleteConfirm';
import styles from '../plan.module.less';
import {
  MonitorEvidence,
  MonitorEvidenceRelation,
  MonitorChildDeleteRequest,
  MonitorPlanPayload,
  ProcessItem,
  ProcessMonitorItem,
} from '../types';

const PROCESS_MONITOR_PART_CODE = 1;
const DIRECT_STATUS_WIDTH = 100;
const DIRECT_ACTION_WIDTH = 112;
const PROCESS_MONITOR_PATH: ['directEmission', 'processMonitorJson', 'methods'] = [
  'directEmission', 'processMonitorJson', 'methods',
];

const sourceTypeOptions = [
  { label: I18N.cbamMonitor.combustionFlow, value: 'combustion' },
  { label: I18N.cbamMonitor.processFlow, value: 'process' },
  { label: I18N.cbamMonitor.emissionSource, value: 'emission_source' },
];

const monitorMethodOptions = [
  { label: I18N.cbamMonitor.standardCalculation, value: 'standard_calculation' },
  { label: I18N.cbamMonitor.massBalance, value: 'mass_balance' },
  { label: I18N.cbamMonitor.measurementCems, value: 'measurement_cems' },
];

const ghgTypeOptions = [
  { label: 'CO₂', value: 'CO₂' },
  { label: 'N₂O', value: 'N₂O' },
];

const frequencyOptions = [
  [I18N.cbamMonitor.monitorContinuous, 'CONTINUOUS'],
  [I18N.cbamMonitor.monitorShift, 'SHIFT'],
  [I18N.cbamMonitor.monitorDaily, 'DAILY'],
  [I18N.cbamMonitor.monitorMonthly, 'MONTHLY'],
  [I18N.cbamMonitor.monitorQuarterly, 'QUARTERLY'],
  [I18N.cbamMonitor.monitorAnnual, 'ANNUAL'],
].map(([label, value]) => ({ label, value }));

const formulaCode = (item: Partial<ProcessMonitorItem>) => {
  if (!item.sourceType || !item.monitorMethod) return undefined;
  if (item.monitorMethod === 'mass_balance') return 'FLOW_MASS_BALANCE';
  if (item.monitorMethod === 'measurement_cems') return 'MEASUREMENT_CEMS';
  if (item.sourceType === 'combustion') return 'FLOW_COMBUSTION';
  if (item.sourceType === 'process') return 'FLOW_PROCESS_EMISSION';
  return undefined;
};

const formulaText = (code?: string) => ({
  FLOW_COMBUSTION: 'Emi = FQi × NCVi × EFi × OFi',
  FLOW_PROCESS_EMISSION: 'Emj = ADj × EFj × CFj',
  FLOW_MASS_BALANCE: 'EmMB = Σ(ADk × CCk × 3.664)',
  MEASUREMENT_CEMS: 'GHGEm.total = Σ(GHGconc.i × Vi) ÷ 1000000',
}[code || ''] || '--');

const optionLabel = (
  options: { label: string; value: string }[],
  value?: string,
) => options.find(option => option.value === value)?.label || value || '--';

type ProcessMonitorRow = ProcessMonitorItem & { rowIndex: number };

export const ProcessMonitorSection = ({
  form,
  processes,
  sourceFlowOptions,
  onAddEvidence,
  onEditEvidence,
  onDeleteChild,
}: {
  form: FormInstance<MonitorPlanPayload>;
  processes?: ProcessItem[];
  sourceFlowOptions: { label: string; value: string }[];
  onAddEvidence?: (itemKey: string, onCreated: (evidenceId: number) => void) => void;
  onEditEvidence?: (evidenceId: number) => void;
  onDeleteChild?: (request: Omit<MonitorChildDeleteRequest, 'dataVersion'>) => Promise<void>;
}) => {
  const watchedMethods = Form.useWatch<ProcessMonitorItem[]>(PROCESS_MONITOR_PATH, {
    form,
    preserve: true,
  });
  const evidences = Form.useWatch<MonitorEvidence[]>('evidences', {
    form,
    preserve: true,
  }) || [];
  const watchedRelations = Form.useWatch<MonitorEvidenceRelation[]>('evidenceRelations', {
    form,
    preserve: true,
  });
  const methods = useMemo(() => watchedMethods || [], [watchedMethods]);
  const relations = useMemo(() => watchedRelations || [], [watchedRelations]);
  const [editor] = Form.useForm<ProcessMonitorItem>();
  const [editingIndex, setEditingIndex] = useState<number>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const editorEvidenceIds = Form.useWatch<number[]>('evidenceIds', editor) || [];

  const processOptions = useMemo(() => (processes || []).flatMap(process => (
    process.itemKey && process.processName
      ? [{ label: process.processName, value: process.itemKey }]
      : []
  )), [processes]);
  const processNameMap = useMemo(
    () => new Map(processOptions.map(option => [option.value, option.label])),
    [processOptions],
  );
  const relatedEvidences = evidences.filter(evidence => evidence.id !== undefined
    && editorEvidenceIds.includes(evidence.id));
  const selectableEvidences = evidences.filter(evidence => evidence.id !== undefined
    && !editorEvidenceIds.includes(evidence.id));

  const openEditor = (rowIndex?: number) => {
    setEditingIndex(rowIndex);
    const current = rowIndex === undefined ? undefined : methods[rowIndex];
    const initial = current || {
      itemKey: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      sortNo: methods.length + 1,
      ghgType: 'CO₂',
    };
    editor.setFieldsValue({
      ...initial,
      formulaCode: formulaCode(initial),
    });
    setDrawerOpen(true);
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setEditingIndex(undefined);
    editor.resetFields();
  };

  const saveEditor = () => {
    const values = editor.getFieldsValue(true);
    const nextItem = { ...values, formulaCode: formulaCode(values) };
    const nextMethods = editingIndex === undefined
      ? [...methods, nextItem]
      : methods.map((method, index) => (index === editingIndex ? nextItem : method));
    form.setFieldValue(PROCESS_MONITOR_PATH, nextMethods);
    closeEditor();
  };

  const removeMethod = (rowIndex: number) => {
    const itemKey = methods[rowIndex]?.itemKey;
    showMonitorDeleteConfirm({
      title: I18N.cbamMonitor.confirmDeleteItem,
      content: I18N.cbamMonitor.deleteItemTip,
      onOk: async () => {
        if (itemKey) await onDeleteChild?.({ target: 'PROCESS_MONITOR', itemKey });
        form.setFieldValue(
          PROCESS_MONITOR_PATH,
          methods.filter((_, index) => index !== rowIndex),
        );
        form.setFieldValue('evidenceRelations', relations.filter(relation => !(
          relation.partCode === PROCESS_MONITOR_PART_CODE && relation.itemKey === itemKey
        )));
      },
    });
  };

  const relateSelectedEvidence = (evidenceIds: number[]) => {
    const itemKey = editor.getFieldValue('itemKey');
    editor.setFieldValue('evidenceIds', Array.from(new Set([
      ...editorEvidenceIds,
      ...evidenceIds,
    ])));
    form.setFieldValue('evidenceRelations', [
      ...relations,
      ...evidenceIds.map(evidenceId => ({
        evidenceId,
        partCode: PROCESS_MONITOR_PART_CODE,
        itemKey,
      })),
    ]);
    setEvidenceModalOpen(false);
  };

  const unlinkEvidence = (evidenceId?: number) => {
    if (evidenceId === undefined) return;
    const relation = relations.find(item => (
      item.evidenceId === evidenceId
      && item.partCode === PROCESS_MONITOR_PART_CODE
      && item.itemKey === editor.getFieldValue('itemKey')
    ));
    showMonitorDeleteConfirm({
      title: I18N.cbamMonitor.confirmDeleteItem,
      content: I18N.cbamMonitor.deleteItemTip,
      onOk: async () => {
        if (relation?.id) {
          await onDeleteChild?.({ target: 'EVIDENCE_RELATION', relationId: relation.id });
        }
        form.setFieldValue(
          'evidenceRelations',
          relations.filter(item => !(
            item.evidenceId === evidenceId
            && item.partCode === PROCESS_MONITOR_PART_CODE
            && item.itemKey === editor.getFieldValue('itemKey')
          )),
        );
        const nextEvidenceIds = editorEvidenceIds.filter(id => id !== evidenceId);
        editor.setFieldValue('evidenceIds', nextEvidenceIds);
        if (editingIndex !== undefined) {
          form.setFieldValue([...PROCESS_MONITOR_PATH, editingIndex, 'evidenceIds'], nextEvidenceIds);
        }
      },
    });
  };

  const rows = methods.map((method, rowIndex) => ({ ...method, rowIndex }));
  const columns: TableColumnsType<ProcessMonitorRow> = [
    {
      title: I18N.cbamMonitor.processName,
      dataIndex: 'processItemKey',
      width: 148,
      ellipsis: true,
      render: value => processNameMap.get(value) || '--',
    },
    { title: I18N.cbamMonitor.sourceFlow, dataIndex: 'sourceFlowName', width: 140, ellipsis: true },
    {
      title: I18N.cbamMonitor.type,
      dataIndex: 'sourceType',
      width: 110,
      render: value => optionLabel(sourceTypeOptions, value),
    },
    {
      title: I18N.cbamMonitor.ghgType,
      dataIndex: 'ghgType',
      width: 124,
      render: (value?: string) => value || '--',
    },
    {
      title: I18N.cbamMonitor.monitoringMethod,
      dataIndex: 'monitorMethod',
      width: 160,
      render: value => optionLabel(monitorMethodOptions, value),
    },
    {
      title: I18N.cbamMonitor.calculationFormula,
      dataIndex: 'formulaCode',
      width: 220,
      ellipsis: true,
      render: (value, record) => formulaText(value || formulaCode(record)),
    },
    { title: I18N.cbamMonitor.dataSource, dataIndex: 'dataSource', width: 140, ellipsis: true },
    {
      title: I18N.cbamMonitor.acquisitionFrequency,
      dataIndex: 'frequency',
      width: 110,
      render: value => optionLabel(frequencyOptions, value),
    },
    { title: I18N.cbamMonitor.measuringEquipment, dataIndex: 'equipment', width: 140, ellipsis: true },
    { title: I18N.cbamMonitor.equipmentLocation, dataIndex: 'location', width: 140, ellipsis: true },
    { title: I18N.cbamMonitor.uncertainty, dataIndex: 'uncertainty', width: 100, ellipsis: true },
    { title: I18N.cbamMonitor.calibrationMethod, dataIndex: 'calibration', width: 180, ellipsis: true },
    {
      title: I18N.cbamMonitor.missingDataMethod,
      dataIndex: 'missingDataMethod',
      width: 220,
      ellipsis: true,
    },
    {
      title: I18N.cbamMonitor.evidenceStatus,
      key: 'evidenceStatus',
      fixed: 'right',
      width: DIRECT_STATUS_WIDTH,
      render: (_, record) => {
        const configured = Boolean(record.evidenceIds?.length);
        return (
          <span className={configured ? styles.configuredTag : styles.pendingConfigurationTag}>
            {configured ? I18N.cbamMonitor.configured : I18N.cbamMonitor.pendingConfiguration}
          </span>
        );
      },
    },
    {
      title: I18N.cbamMonitor.operation,
      key: 'operation',
      fixed: 'right',
      width: DIRECT_ACTION_WIDTH,
      render: (_, record) => (
        <div className={styles.directTableActions}>
          <Button className={styles.directEditButton} type='text' onClick={() => openEditor(record.rowIndex)}>
            {I18N.cbamMonitor.edit}
          </Button>
          <Button className={styles.directDeleteButton} type='text' danger onClick={() => removeMethod(record.rowIndex)}>
            {I18N.cbamMonitor.delete}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className={styles.processMonitorTable}>
        <Table<ProcessMonitorRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          rowKey={record => record.itemKey || record.rowIndex}
          locale={{ emptyText: null }}
          scroll={{ x: 2144 }}
        />
      </div>
      <Button className={styles.goodsAddRowButton} icon={<PlusOutlined />} onClick={() => openEditor()}>
        {I18N.cbamMonitor.addMonitoringMethod}
      </Button>
      <Drawer
        closable={false}
        destroyOnClose
        open={drawerOpen}
        rootClassName={styles.processMonitorDrawer}
        title={editingIndex === undefined
          ? I18N.cbamMonitor.addMonitoringMethod
          : I18N.cbamMonitor.editMonitoringMethod}
        width={724}
        extra={(
          <button type='button' aria-label='close' className={styles.processMonitorDrawerClose} onClick={closeEditor}>
            <CloseOutlined />
          </button>
        )}
        footer={(
          <div className={styles.drawerActions}>
            <Button onClick={closeEditor}>{I18N.cbamMonitor.cancel}</Button>
            <Button type='primary' onClick={saveEditor}>{I18N.cbamMonitor.confirm}</Button>
          </div>
        )}
        onClose={closeEditor}
      >
        <Form
          form={editor}
          layout='vertical'
          onValuesChange={(_, values) => {
            const nextFormulaCode = formulaCode(values);
            if (values.formulaCode !== nextFormulaCode) editor.setFieldValue('formulaCode', nextFormulaCode);
          }}
        >
          <div className={styles.processMonitorFormGrid}>
            <Form.Item name='itemKey' hidden><Input /></Form.Item>
            <Form.Item name='sortNo' hidden><Input /></Form.Item>
            <Form.Item name='evidenceIds' hidden><Input /></Form.Item>
            <Form.Item name='formulaCode' hidden><Input /></Form.Item>
            <Form.Item name='processItemKey' label={I18N.cbamMonitor.processName} rules={[{ required: true }]}>
              <Select allowClear options={processOptions} placeholder={I18N.cbamMonitor.select} />
            </Form.Item>
            <Form.Item name='sourceFlowName' label={I18N.cbamMonitor.sourceFlow} rules={[{ required: true, max: 40 }]}>
              <AutoComplete
                allowClear
                maxLength={40}
                options={sourceFlowOptions}
                placeholder={I18N.cbamMonitor.select}
                showArrow
                suffixIcon={<DownOutlined />}
                filterOption={false}
              />
            </Form.Item>
            <Form.Item name='sourceType' label={I18N.cbamMonitor.type} rules={[{ required: true }]}>
              <Select allowClear options={sourceTypeOptions} placeholder={I18N.cbamMonitor.select} />
            </Form.Item>
            <Form.Item name='ghgType' label={I18N.cbamMonitor.ghgType} rules={[{ required: true }]}>
              <Select allowClear options={ghgTypeOptions} placeholder={I18N.cbamMonitor.select} />
            </Form.Item>
            <Form.Item name='monitorMethod' label={I18N.cbamMonitor.monitoringMethod} rules={[{ required: true }]}>
              <Select allowClear options={monitorMethodOptions} placeholder={I18N.cbamMonitor.select} />
            </Form.Item>
            <Form.Item name='dataSource' label={I18N.cbamMonitor.dataSource} rules={[{ required: true, max: 40 }]}>
              <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item name='frequency' label={I18N.cbamMonitor.acquisitionFrequency} rules={[{ required: true }]}>
              <Select allowClear options={frequencyOptions} placeholder={I18N.cbamMonitor.select} />
            </Form.Item>
            <Form.Item name='equipment' label={I18N.cbamMonitor.measuringEquipment} rules={[{ required: true, max: 40 }]}>
              <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item name='location' label={I18N.cbamMonitor.equipmentLocation} rules={[{ max: 40 }]}>
              <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item name='uncertainty' label={I18N.cbamMonitor.uncertainty} rules={[{ max: 10 }]}>
              <Input maxLength={10} placeholder={I18N.cbamMonitor.uncertaintyPlaceholder} />
            </Form.Item>
            <Form.Item name='calibration' label={I18N.cbamMonitor.calibrationMethod} rules={[{ required: true, max: 200 }]}>
              <Input maxLength={200} placeholder={I18N.cbamMonitor.calibrationPlaceholder} />
            </Form.Item>
            <Form.Item className={styles.processMonitorWideField} name='missingDataMethod' label={I18N.cbamMonitor.missingDataMethod} rules={[{ max: 1000 }]}>
              <Input.TextArea maxLength={1000} rows={4} placeholder={I18N.cbamMonitor.missingDataMethodPlaceholder} />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {() => (
                <Form.Item className={styles.processMonitorFormulaField} label={I18N.cbamMonitor.calculationFormula}>
                  <div className={styles.processMonitorFormulaValue}>
                    {formulaText(editor.getFieldValue('formulaCode'))}
                  </div>
                </Form.Item>
              )}
            </Form.Item>
            <div className={styles.processMonitorEvidenceField}>
              <div className={styles.processMonitorEvidenceHeader}>
                <span>{I18N.cbamMonitor.evidenceStatus}</span>
                <Space size={12}>
                  <Button
                    className={styles.evidenceAddButton}
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const itemKey = editor.getFieldValue('itemKey');
                      if (!itemKey) return;
                      onAddEvidence?.(itemKey, evidenceId => editor.setFieldValue(
                        'evidenceIds',
                        Array.from(new Set([...(editor.getFieldValue('evidenceIds') || []), evidenceId])),
                      ));
                    }}
                  >
                    {I18N.cbamMonitor.addEvidence}
                  </Button>
                  <Button
                    className={styles.evidenceSelectButton}
                    icon={<img alt='' className={styles.evidenceSelectIcon} src={selectEvidenceIcon} />}
                    onClick={() => setEvidenceModalOpen(true)}
                  >
                    {I18N.cbamMonitor.selectEvidence}
                  </Button>
                </Space>
              </div>
              <div className={styles.processMonitorEvidenceCards}>
                {relatedEvidences.map(evidence => (
                  <BusinessEvidenceCard
                    evidence={evidence}
                    key={evidence.id}
                    onDelete={unlinkEvidence}
                    onEdit={evidenceId => onEditEvidence?.(evidenceId)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Form>
      </Drawer>
      <EvidenceSelectModal
        evidences={selectableEvidences}
        open={evidenceModalOpen}
        onCancel={() => setEvidenceModalOpen(false)}
        onConfirm={relateSelectedEvidence}
      />
    </>
  );
};
