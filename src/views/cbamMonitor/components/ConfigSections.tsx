import {
  CloseOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  AutoComplete,
  Button,
  Collapse,
  DatePicker,
  Drawer,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Pagination,
  Radio,
  Select,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import { Rule } from 'antd/lib/form';
import { NamePath } from 'antd/lib/form/interface';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { BusinessEvidenceCard } from './BusinessEvidenceCard';
import { EvidenceSelectModal } from './EvidenceSelectModal';
import { FileObjectUpload } from './FileObjectUpload';
import { PrecursorSelectModal } from './PrecursorSelectModal';
import { ProcessMonitorSection } from './ProcessMonitorSection';
import selectEvidenceIcon from '../assets/select-evidence.svg';
import { showMonitorDeleteConfirm } from '../deleteConfirm';
import styles from '../plan.module.less';
import { getMonitorCnOptions } from '../service';
import {
  FactoryOption,
  FactorSamplingItem,
  MonitorChildDeleteRequest,
  MonitorChildDeleteType,
  MonitorEvidence,
  MonitorEvidenceRelation,
  MonitorPlanPayload,
  MonitorPrecursorOption,
  PfcMonitorItem,
  PrecursorItem,
  ProcessItem,
  ProcessMonitorItem,
  ProcedureItem,
  ResponsibilityItem,
} from '../types';

type DeleteChild = (request: Omit<MonitorChildDeleteRequest, 'dataVersion'>) => Promise<void>;
type FieldKind = 'input' | 'number' | 'select' | 'multi' | 'singleArray' | 'textarea' | 'readonly' | 'autocomplete';
interface FieldSchema {
  name: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  max?: number;
  minWidth?: number;
  flex?: number;
  options?: { label: string; value: string | number | boolean }[];
  loading?: boolean;
  searchable?: boolean;
  placeholder?: string;
  strictOptions?: boolean;
  multiline?: boolean;
  formatValue?: (value: unknown, rowName: number) => string;
  onChange?: (value: unknown, rowName: number) => void;
}

const monitorFrequencyOptions = [
  [I18N.cbamMonitor.monitorContinuous, 'CONTINUOUS'],
  [I18N.cbamMonitor.monitorShift, 'SHIFT'],
  [I18N.cbamMonitor.monitorDaily, 'DAILY'],
  [I18N.cbamMonitor.monitorMonthly, 'MONTHLY'],
  [I18N.cbamMonitor.monitorQuarterly, 'QUARTERLY'],
  [I18N.cbamMonitor.monitorAnnual, 'ANNUAL'],
].map(([label, value]) => ({ label, value }));

const factorTypeOptions = [
  [I18N.cbamMonitor.lowerHeatingValue, 'NCV'],
  [I18N.cbamMonitor.emissionFactor, 'EMISSION_FACTOR'],
  [I18N.cbamMonitor.preliminaryEmissionFactor, 'PRELIMINARY_FACTOR'],
  [I18N.cbamMonitor.oxidationFactor, 'OXIDATION_FACTOR'],
  [I18N.cbamMonitor.conversionFactor, 'CONVERSION_FACTOR'],
  [I18N.cbamMonitor.carbonContent, 'CARBON_CONTENT'],
  [I18N.cbamMonitor.biomassFraction, 'BIOMASS_FRACTION'],
].map(([label, value]) => ({ label, value }));

const createItemKey = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const pfcFormulaCode = (method?: string) => ({
  SLOPE_METHOD: 'PFC_SLOPE',
  OVERVOLTAGE_METHOD: 'PFC_OVERVOLTAGE',
}[method || '']);

const pfcFormulaText = (code?: string) => ({
  PFC_SLOPE: 'EmCF4.duct = AEM × (SEFCF4 / 1000) × PrAl\nEmC2F6.duct = EmCF4.duct × FC2F6',
  PFC_OVERVOLTAGE: 'EmCF4.duct = OVC × (AEO / CE) × PrAl × 0.001\nEmC2F6.duct = EmCF4.duct × FC2F6',
}[code || ''] || '--');

const isAluminumCnCode = (cnCode?: string) => {
  const prefix = Number((cnCode || '').replace(/\D/g, '').slice(0, 4));
  return prefix >= 7601 && prefix <= 7616;
};

const Section = ({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) => (
  <section className={`${styles.section} ${className || ''}`}>
    <h3>{title}</h3>
    {description && <p className={styles.sectionDescription}>{description}</p>}
    {children}
  </section>
);

const ReadOnlyFactoryField = ({ label, value, required }: { label: string; value?: string; required?: boolean }) => (
  <Form.Item label={label} required={required}>
    <Input className={styles.readOnlyFactoryField} value={value || ''} readOnly placeholder='--' />
  </Form.Item>
);

const fieldControl = (field: FieldSchema, onChange?: (value: unknown) => void) => {
  if (field.kind === 'textarea') return <Input.TextArea rows={4} maxLength={field.max} />;
  if (field.kind === 'number') return <InputNumber min={0} max={field.max} />;
  if (field.kind === 'readonly') return <Input readOnly />;
  if (field.kind === 'autocomplete') {
    return (
      <AutoComplete
        allowClear
        maxLength={field.max}
        options={field.options}
        placeholder={field.placeholder || I18N.cbamMonitor.select}
        showArrow
        suffixIcon={<DownOutlined />}
        filterOption={false}
        onChange={onChange}
      />
    );
  }
  if (field.kind === 'select' || field.kind === 'multi' || field.kind === 'singleArray') {
    return (
      <Select
        allowClear={field.kind !== 'multi'}
        className={field.kind === 'multi' ? styles.multiSelect : undefined}
        mode={field.kind === 'multi' ? 'multiple' : undefined}
        maxTagCount={field.kind === 'multi' ? 2 : undefined}
        options={field.options}
        placeholder={field.placeholder || I18N.cbamMonitor.select}
        loading={field.loading}
        showSearch={field.searchable}
        optionFilterProp={field.searchable ? 'label' : undefined}
        onChange={onChange}
      />
    );
  }
  return <Input maxLength={field.max} placeholder={I18N.cbamMonitor.enter} />;
};

const maxLengthRule = (field: string, max: number): Rule => ({
  max,
  message: I18N.template(I18N.cbamMonitor.fieldLengthExceeded, { field, max }),
});

const fieldRules = (field: FieldSchema): Rule[] => [
  { required: field.required, message: I18N.template(I18N.cbamMonitor.requiredField, { field: field.label }) },
  ...(field.max !== undefined && !['number', 'select', 'multi', 'singleArray'].includes(field.kind || '')
    ? [maxLengthRule(field.label, field.max)]
    : []),
  ...(['multi', 'singleArray'].includes(field.kind || '') ? [{ type: 'array' as const }] : []),
  ...(field.strictOptions ? [{
    validator: (_: unknown, value?: string | number | boolean) =>
      value === undefined || value === null || value === '' || field.options?.some(option => option.value === value)
        ? Promise.resolve()
        : Promise.reject(new Error(I18N.cbamMonitor.cnCodeOptionOnly)),
  }] : []),
];

const confirmRemoveItem = (onOk: () => void | Promise<void>) => {
  showMonitorDeleteConfirm({
    title: I18N.cbamMonitor.confirmDeleteItem,
    content: I18N.cbamMonitor.deleteItemTip,
    onOk,
  });
};

const ResponsibilitySection = ({ onDeleteChild }: { onDeleteChild?: DeleteChild }) => {
  const form = Form.useFormInstance();
  const [editingRow, setEditingRow] = useState<number>();
  return (
    <section className={styles.controlSubsection}>
      <h4>{I18N.cbamMonitor.responsibilities}</h4>
      <Form.List name={['controlConfirmation', 'divideWorkJson', 'responsibilities']}>
        {(rows, { add, remove }) => (
          <>
            <div className={styles.responsibilityTable}>
              <div className={styles.responsibilityHeader}>
                <span className={styles.requiredHeaderMark}>*</span>
                {I18N.cbamMonitor.positionTitle}
              </div>
              <div className={styles.responsibilityHeader}>{I18N.cbamMonitor.responsibility}</div>
              <div className={styles.responsibilityHeader}>{I18N.cbamMonitor.operation}</div>
              {rows.map(row => {
                const editing = editingRow === row.name;
                return (
                  <div className={styles.responsibilityRow} key={row.key}>
                    <div className={styles.responsibilityCell}>
                      {editing ? (
                        <Form.Item name={[row.name, 'positionName']} rules={fieldRules({ name: 'positionName', label: I18N.cbamMonitor.positionTitle, required: true, max: 40 })}>
                          <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                      ) : (
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => getFieldValue(['controlConfirmation', 'divideWorkJson', 'responsibilities', row.name, 'positionName']) || '--'}
                        </Form.Item>
                      )}
                    </div>
                    <div className={styles.responsibilityCell}>
                      {editing ? (
                        <Form.Item name={[row.name, 'responsibility']} rules={[maxLengthRule(I18N.cbamMonitor.responsibility, 200)]}>
                          <Input maxLength={200} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                      ) : (
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => getFieldValue(['controlConfirmation', 'divideWorkJson', 'responsibilities', row.name, 'responsibility']) || '--'}
                        </Form.Item>
                      )}
                    </div>
                    <div className={`${styles.responsibilityCell} ${styles.responsibilityActions}`}>
                      <Button type='link' onClick={() => setEditingRow(editing ? undefined : row.name)}>
                        {editing ? I18N.cbamMonitor.done : I18N.cbamMonitor.edit}
                      </Button>
                      <Button type='link' danger onClick={() => confirmRemoveItem(async () => {
                        const itemKey = form.getFieldValue([
                          'controlConfirmation', 'divideWorkJson', 'responsibilities', row.name, 'itemKey',
                        ]);
                        const positionName = form.getFieldValue([
                          'controlConfirmation', 'divideWorkJson', 'responsibilities', row.name, 'positionName',
                        ]);
                        if (itemKey) await onDeleteChild?.({ target: 'RESPONSIBILITY', itemKey });
                        remove(row.name);
                        if (positionName) {
                          const procedurePaths = [
                            ['controlConfirmation', 'manageEvaluateJson', 'procedures'],
                            ['controlConfirmation', 'dataFlowJson', 'procedures'],
                            ['controlConfirmation', 'controlActivityJson', 'procedures'],
                            ['controlConfirmation', 'otherProcedureJson', 'procedures'],
                          ];
                          const looseForm = form as FormInstance;
                          procedurePaths.forEach(path => {
                            const procedures = looseForm.getFieldValue(path) as ProcedureItem[] | undefined;
                            looseForm.setFieldValue(path, (procedures || []).map(procedure => (
                              procedure.positionOrDepartment === positionName
                                ? { ...procedure, positionOrDepartment: undefined }
                                : procedure
                            )));
                          });
                        }
                        setEditingRow(undefined);
                      })}>
                        {I18N.cbamMonitor.delete}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              className={styles.controlAddButton}
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRow(rows.length);
                add({ itemKey: createItemKey(), sortNo: rows.length + 1 });
              }}
            >
              {I18N.cbamMonitor.addResponsibility}
            </Button>
          </>
        )}
      </Form.List>
    </section>
  );
};

const ProcedureCardHeader = ({
  name,
  index,
  numbered,
  fallbackTitle,
  fixedTitles,
}: {
  name: NamePath;
  index: number;
  numbered: boolean;
  fallbackTitle: string;
  fixedTitles?: Record<string, string>;
}) => (
  <Form.Item noStyle shouldUpdate>
    {({ getFieldValue }) => {
      const item = (getFieldValue(name) || {}) as ProcedureItem;
      const configured = ['title', 'positionOrDepartment', 'frequency', 'recordLocation']
        .every(field => item[field] !== undefined && item[field] !== null && item[field] !== '');
      const automaticTitle = item.title?.match(/^(补充程序|Supplementary Procedure)\s+\d+$/);
      const displayTitle = item.procedureType && fixedTitles?.[item.procedureType]
        || (automaticTitle
          ? `${I18N.cbamMonitor.supplementaryProcedure} ${item.sortNo || index + 1}`
          : item.title)
        || fallbackTitle;
      return (
        <div className={styles.procedureCardHeader}>
          <span className={configured ? styles.configuredTag : styles.pendingConfigurationTag}>
            {configured ? I18N.cbamMonitor.configured : I18N.cbamMonitor.pendingConfiguration}
          </span>
          <span className={styles.procedureCardTitle}>
            {`${numbered ? `${String.fromCharCode(97 + index)}. ` : ''}${displayTitle}`}
          </span>
        </div>
      );
    }}
  </Form.Item>
);

const ProcedureListSection = ({
  title,
  name,
  positionOptions,
  addable,
  management,
  numbered = true,
  fixedTitles,
  deleteTarget,
  onDeleteChild,
}: {
  title?: string;
  name: NamePath;
  positionOptions: { label: string; value: string }[];
  addable?: boolean;
  management?: boolean;
  numbered?: boolean;
  fixedTitles?: Record<string, string>;
  deleteTarget: MonitorChildDeleteType;
  onDeleteChild?: DeleteChild;
}) => {
  const form = Form.useFormInstance();
  return (
    <section className={`${styles.controlSubsection} ${management ? styles.managementProcedureSubsection : ''}`}>
    {title && <h4>{title}</h4>}
    <Form.List name={name}>
      {(rows, { add, remove }) => (
        <>
          <div className={styles.procedureCardList}>
            {rows.map((row, rowIndex) => {
              const rowPath = [...name as (string | number)[], row.name];
              const fallbackTitle = addable
                ? `${I18N.cbamMonitor.supplementaryProcedure} ${rowIndex + 1}`
                : `${title || I18N.cbamMonitor.procedure} ${rowIndex + 1}`;
              const deleteProcedure = () => confirmRemoveItem(async () => {
                const itemKey = form.getFieldValue([...rowPath, 'itemKey']);
                if (itemKey) await onDeleteChild?.({ target: deleteTarget, itemKey });
                const procedures = (form.getFieldValue(name) || []) as ProcedureItem[];
                const remainingProcedures = procedures
                  .filter((_, index) => index !== row.name)
                  .map((procedure, index) => {
                    const sequence = index + 1;
                    const automaticTitle = procedure.title?.match(
                      /^(补充程序|Supplementary Procedure)\s+\d+$/,
                    );
                    return {
                      ...procedure,
                      sortNo: sequence,
                      title: automaticTitle
                        ? `${automaticTitle[1]} ${sequence}`
                        : procedure.title?.trim()
                          || `${I18N.cbamMonitor.supplementaryProcedure} ${sequence}`,
                    };
                  });
                remove(row.name);
                form.setFieldValue(name, remainingProcedures);
              });
              return (
                <Collapse
                  className={`${styles.procedureCard} ${styles.controlProcedureCard}`}
                  defaultActiveKey={rowIndex < 2 ? 'form' : undefined}
                  expandIconPosition='end'
                  expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
                  key={row.key}
                  items={[{
                    key: 'form',
                    extra: addable ? (
                      <Button
                        className={styles.procedureDeleteButton}
                        danger
                        type='text'
                        onClick={event => {
                          event.stopPropagation();
                          deleteProcedure();
                        }}
                      >
                        {I18N.cbamMonitor.delete}
                      </Button>
                    ) : undefined,
                    label: (
                      <ProcedureCardHeader
                        name={rowPath}
                        index={rowIndex}
                        numbered={numbered}
                        fallbackTitle={fallbackTitle}
                        fixedTitles={fixedTitles}
                      />
                    ),
                    children: (
                      <div className={styles.procedureFormGrid}>
                        <Form.Item name={[row.name, 'title']} label={I18N.cbamMonitor.procedureTitle} rules={fieldRules({ name: 'title', label: I18N.cbamMonitor.procedureTitle, required: true, max: 40 })}>
                          <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                        <Form.Item name={[row.name, 'referenceNo']} label={I18N.cbamMonitor.procedureReference} rules={[{ max: 40 }]}>
                          <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                        <Form.Item name={[row.name, 'positionOrDepartment']} label={I18N.cbamMonitor.responsibleDepartment} rules={fieldRules({ name: 'positionOrDepartment', label: I18N.cbamMonitor.responsibleDepartment, required: true })}>
                          <Select allowClear options={positionOptions} placeholder={I18N.cbamMonitor.select} />
                        </Form.Item>
                        <Form.Item name={[row.name, 'recordLocation']} label={I18N.cbamMonitor.recordLocation} rules={fieldRules({ name: 'recordLocation', label: I18N.cbamMonitor.recordLocation, required: true, max: 40 })}>
                          <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                        <Form.Item name={[row.name, 'mainRisk']} label={I18N.cbamMonitor.mainRisk} rules={[{ max: 200 }]}>
                          <Input maxLength={200} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                        <Form.Item name={[row.name, 'frequency']} label={I18N.cbamMonitor.frequency} rules={fieldRules({ name: 'frequency', label: I18N.cbamMonitor.frequency, required: true })}>
                          <Select allowClear options={monitorFrequencyOptions} placeholder={I18N.cbamMonitor.select} />
                        </Form.Item>
                        <Form.Item className={styles.procedureDescription} name={[row.name, 'description']} label={I18N.cbamMonitor.procedureControlDescription} rules={[{ max: 1000 }]}>
                          <Input maxLength={1000} placeholder={I18N.cbamMonitor.enter} />
                        </Form.Item>
                      </div>
                    ),
                  }]}
                />
              );
            })}
          </div>
          {addable && (
            <Button
              className={styles.controlAddButton}
              icon={<PlusOutlined />}
              onClick={() => {
                const procedures = (form.getFieldValue(name) || []) as ProcedureItem[];
                const nextNo = Math.max(0, ...procedures.map((item, index) => item.sortNo || index + 1)) + 1;
                add({
                  itemKey: createItemKey(),
                  sortNo: nextNo,
                  title: `${I18N.cbamMonitor.supplementaryProcedure} ${nextNo}`,
                });
              }}
            >
              {I18N.cbamMonitor.addProcedure}
            </Button>
          )}
        </>
      )}
    </Form.List>
    </section>
  );
};

const GOODS_PAGE_SIZE = 10;
const DIRECT_STATUS_WIDTH = 100;
const DIRECT_ACTION_WIDTH = 112;
const GoodsTableSection = ({
  name,
  fields,
  addText,
  actionWidth = 96,
  columnMinWidth = 180,
  onSelectPrecursor,
  onRemove,
  deleteTarget,
  onDeleteChild,
  evidencePartCode,
  editText,
  onAddEvidence,
  onEditEvidence,
  normalizeItem,
  requiredRows = false,
  borderless = false,
}: {
  name: NamePath;
  fields: FieldSchema[];
  addText: string;
  actionWidth?: number;
  columnMinWidth?: number;
  onSelectPrecursor?: (rowName: number) => void;
  onRemove?: (itemKey?: string) => void;
  deleteTarget: MonitorChildDeleteType;
  onDeleteChild?: DeleteChild;
  evidencePartCode?: number;
  editText?: string;
  onAddEvidence?: (itemKey: string, onCreated: (evidenceId: number) => void) => void;
  onEditEvidence?: (evidenceId: number) => void;
  normalizeItem?: (item: Record<string, unknown>) => Record<string, unknown>;
  requiredRows?: boolean;
  borderless?: boolean;
}) => {
  const form = Form.useFormInstance();
  const [editor] = Form.useForm<Record<string, unknown>>();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState<number>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const evidences = Form.useWatch<MonitorEvidence[]>('evidences', {
    form,
    preserve: true,
  }) || [];
  const evidenceRelations = Form.useWatch<MonitorEvidenceRelation[]>('evidenceRelations', {
    form,
    preserve: true,
  }) || [];
  const editorEvidenceIds = Form.useWatch<number[]>('evidenceIds', editor) || [];
  const listItems = Form.useWatch<Record<string, unknown>[]>(name, {
    form,
    preserve: true,
  }) || [];
  const showEvidenceStatus = evidencePartCode !== undefined;
  const statusColumn = showEvidenceStatus ? ` ${DIRECT_STATUS_WIDTH}px` : '';
  const fieldColumns = fields
    .map(field => `minmax(${field.minWidth || columnMinWidth}px, ${field.flex || 1}fr)`)
    .join(' ');
  const editorFields = [
    ...fields.filter(field => field.kind !== 'readonly'),
    ...fields.filter(field => field.kind === 'readonly'),
  ];
  const gridTemplateColumns = `${fieldColumns}${statusColumn} ${actionWidth}px`;
  const tableMinWidth = fields.reduce((total, field) => total + (field.minWidth || columnMinWidth), 0)
    + (showEvidenceStatus ? DIRECT_STATUS_WIDTH : 0) + actionWidth;
  const relatedEvidences = evidences.filter(evidence => evidence.id !== undefined
    && editorEvidenceIds.includes(evidence.id));
  const selectableEvidences = evidences.filter(evidence => evidence.id !== undefined
    && !editorEvidenceIds.includes(evidence.id));
  const closeEditor = () => {
    setDrawerOpen(false);
    setEditingRow(undefined);
    editor.resetFields();
  };
  const openEditor = (rowName?: number) => {
    setEditingRow(rowName);
    const current = rowName === undefined
      ? { itemKey: createItemKey(), sortNo: listItems.length + 1 }
      : listItems[rowName];
    editor.resetFields();
    editor.setFieldsValue(
      (normalizeItem ? normalizeItem(current) : current) as Parameters<
        typeof editor.setFieldsValue
      >[0],
    );
    setDrawerOpen(true);
  };
  const saveEditor = () => {
    const values = editor.getFieldsValue(true);
    const nextItem = normalizeItem ? normalizeItem(values) : values;
    const nextItems = editingRow === undefined
      ? [...listItems, nextItem]
      : listItems.map((item, index) => (index === editingRow ? nextItem : item));
    form.setFieldValue(name, nextItems);
    if (editingRow === undefined) {
      setCurrentPage(Math.ceil(nextItems.length / GOODS_PAGE_SIZE));
    }
    closeEditor();
  };
  const relateSelectedEvidence = (evidenceIds: number[]) => {
    const itemKey = editor.getFieldValue('itemKey') as string;
    editor.setFieldValue('evidenceIds', Array.from(new Set([
      ...editorEvidenceIds,
      ...evidenceIds,
    ])));
    form.setFieldValue('evidenceRelations', [
      ...evidenceRelations,
      ...evidenceIds.map(evidenceId => ({
        evidenceId,
        partCode: evidencePartCode as number,
        itemKey,
      })),
    ]);
    setEvidenceModalOpen(false);
  };
  const unlinkEvidence = (evidenceId?: number) => {
    if (evidenceId === undefined) return;
    const relation = evidenceRelations.find(item => (
      item.evidenceId === evidenceId
      && item.partCode === evidencePartCode
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
          evidenceRelations.filter(item => !(
            item.evidenceId === evidenceId
            && item.partCode === evidencePartCode
            && item.itemKey === editor.getFieldValue('itemKey')
          )),
        );
        const nextEvidenceIds = editorEvidenceIds.filter(id => id !== evidenceId);
        editor.setFieldValue('evidenceIds', nextEvidenceIds);
        if (editingRow !== undefined) {
          form.setFieldValue([
            ...name as (string | number)[], editingRow, 'evidenceIds',
          ], nextEvidenceIds);
        }
      },
    });
  };
  const evidenceEditor = showEvidenceStatus ? (
    <>
      <Drawer
        closable={false}
        destroyOnClose
        open={drawerOpen}
        rootClassName={styles.processMonitorDrawer}
        title={editingRow === undefined ? addText : editText || addText}
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
            if (!normalizeItem) return;
            const normalized = normalizeItem(values);
            Object.entries(normalized).forEach(([key, value]) => {
              if (editor.getFieldValue(key) !== value) editor.setFieldValue(key, value);
            });
          }}
        >
          <div className={styles.processMonitorFormGrid}>
            <Form.Item name='itemKey' hidden><Input /></Form.Item>
            <Form.Item name='sortNo' hidden><Input /></Form.Item>
            <Form.Item name='evidenceIds' hidden><Input /></Form.Item>
            {editorFields.map(field => field.kind === 'readonly' ? (
              <Form.Item noStyle shouldUpdate key={field.name}>
                {() => (
                  <Form.Item className={styles.processMonitorFormulaField} label={field.label}>
                    <div className={`${styles.processMonitorFormulaValue} ${field.multiline ? styles.processMonitorFormulaValueMultiline : ''}`}>
                      {field.formatValue
                        ? field.formatValue(editor.getFieldValue(field.name), editingRow || 0)
                        : editor.getFieldValue(field.name) || '--'}
                    </div>
                  </Form.Item>
                )}
              </Form.Item>
            ) : (
              <Form.Item
                className={field.kind === 'textarea' ? styles.processMonitorWideField : undefined}
                key={field.name}
                name={field.name}
                label={field.label}
                rules={fieldRules(field)}
                getValueProps={field.kind === 'singleArray'
                  ? value => ({ value: Array.isArray(value) ? value[0] : value })
                  : undefined}
                getValueFromEvent={field.kind === 'singleArray'
                  ? value => value === undefined || value === null ? [] : [value]
                  : undefined}
              >
                {fieldControl(field, value => field.onChange?.(value, editingRow || 0))}
              </Form.Item>
            ))}
            <div className={styles.processMonitorEvidenceField}>
              <div className={styles.processMonitorEvidenceHeader}>
                <span>{I18N.cbamMonitor.evidenceStatus}</span>
                <Space size={12}>
                  <Button
                    className={styles.evidenceAddButton}
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const itemKey = editor.getFieldValue('itemKey') as string;
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
  ) : null;
  return (
    <>
      <Form.List
        name={name}
        rules={requiredRows ? [{
          validator: async (_, rows?: unknown[]) => rows?.length
            ? Promise.resolve()
            : Promise.reject(new Error(I18N.cbamMonitor.requiredItemsIncomplete)),
        }] : undefined}
      >
      {(rows, { add, remove }, { errors }) => {
        const totalPages = Math.max(1, Math.ceil(rows.length / GOODS_PAGE_SIZE));
        const safePage = Math.min(currentPage, totalPages);
        const visibleRows = rows.slice((safePage - 1) * GOODS_PAGE_SIZE, safePage * GOODS_PAGE_SIZE);
        const handleAdd = () => {
          add({ itemKey: createItemKey(), sortNo: rows.length + 1 });
          setCurrentPage(Math.ceil((rows.length + 1) / GOODS_PAGE_SIZE));
        };
        const handleRemove = (rowName: number) => {
          const itemKey = form.getFieldValue([...name as (string | number)[], rowName, 'itemKey']);
          remove(rowName);
          if (evidencePartCode !== undefined && itemKey) {
            form.setFieldValue('evidenceRelations', evidenceRelations.filter(relation => !(
              relation.partCode === evidencePartCode && relation.itemKey === itemKey
            )));
          }
          if (editingRow === rowName) setEditingRow(undefined);
          onRemove?.(itemKey);
          setCurrentPage(Math.min(safePage, Math.max(1, Math.ceil((rows.length - 1) / GOODS_PAGE_SIZE))));
        };
        const confirmRowRemove = (rowName: number) => confirmRemoveItem(async () => {
          const itemKey = form.getFieldValue([...name as (string | number)[], rowName, 'itemKey']);
          if (itemKey) await onDeleteChild?.({ target: deleteTarget, itemKey });
          handleRemove(rowName);
        });
        if (showEvidenceStatus) {
          type DirectTableRow = { key: number; name: number };
          const displayFieldValue = (field: FieldSchema, rowName: number) => {
            const value = form.getFieldValue([...name as (string | number)[], rowName, field.name]);
            if (field.formatValue) return field.formatValue(value, rowName);
            const values = Array.isArray(value) ? value : [value];
            const displayValue = values.filter(item => item !== undefined && item !== null && item !== '')
              .map(item => field.options?.find(option => option.value === item)?.label || String(item))
              .join('、');
            return displayValue || '--';
          };
          const columns: TableColumnsType<DirectTableRow> = [
            ...fields.map(field => ({
              title: field.label,
              key: field.name,
              width: field.minWidth || columnMinWidth,
              render: (_: unknown, row: DirectTableRow) => (
                <Form.Item noStyle shouldUpdate>
                  {() => (
                    <span className={`${styles.directTableCell} ${field.multiline ? styles.directTableCellMultiline : ''}`} title={displayFieldValue(field, row.name)}>
                      {displayFieldValue(field, row.name)}
                    </span>
                  )}
                </Form.Item>
              ),
            })),
            {
              title: I18N.cbamMonitor.evidenceStatus,
              key: 'evidenceStatus',
              fixed: 'right',
              width: DIRECT_STATUS_WIDTH,
              render: (_: unknown, row: DirectTableRow) => {
                const evidenceIds = form.getFieldValue([
                  ...name as (string | number)[], row.name, 'evidenceIds',
                ]) as number[] | undefined;
                const configured = Boolean(evidenceIds?.length);
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
              width: actionWidth,
              render: (_: unknown, row: DirectTableRow) => (
                <div className={styles.directTableActions}>
                  <Button type='text' className={styles.directEditButton} onClick={() => openEditor(row.name)}>
                    {I18N.cbamMonitor.edit}
                  </Button>
                  <Button
                    type='text'
                    danger
                    className={styles.directDeleteButton}
                    onClick={() => confirmRowRemove(row.name)}
                  >
                    {I18N.cbamMonitor.delete}
                  </Button>
                </div>
              ),
            },
          ];
          return (
            <>
              <div className={`${styles.processMonitorTable} ${borderless ? styles.processMonitorTableBorderless : ''}`}>
                <Table<DirectTableRow>
                  columns={columns}
                  dataSource={visibleRows}
                  locale={{ emptyText: null }}
                  pagination={false}
                  rowKey='key'
                  scroll={{ x: tableMinWidth }}
                />
              </div>
              <Button className={styles.goodsAddRowButton} icon={<PlusOutlined />} onClick={() => openEditor()}>
                {addText}
              </Button>
              {rows.length > GOODS_PAGE_SIZE && (
                <Pagination
                  className={styles.goodsPagination}
                  current={safePage}
                  pageSize={GOODS_PAGE_SIZE}
                  showSizeChanger={false}
                  total={rows.length}
                  onChange={setCurrentPage}
                />
              )}
            </>
          );
        }
        return (
          <>
            <div className={styles.goodsTableViewport}>
              <div className={styles.goodsTable} style={{ minWidth: tableMinWidth }}>
                <div className={styles.goodsTableHeader} style={{ gridTemplateColumns }}>
                  {fields.map(field => <div key={field.name}>{field.label}</div>)}
                  {showEvidenceStatus && (
                    <div className={styles.directStatusColumn}>{I18N.cbamMonitor.evidenceStatus}</div>
                  )}
                  <div className={showEvidenceStatus ? styles.directActionColumn : undefined}>
                    {I18N.cbamMonitor.operation}
                  </div>
                </div>
                {visibleRows.map(row => {
                  const evidenceIds = form.getFieldValue([
                    ...name as (string | number)[], row.name, 'evidenceIds',
                  ]) as number[] | undefined;
                  const evidenceConfigured = Boolean(evidenceIds?.length);
                  return (
                  <div className={styles.goodsTableRow} style={{ gridTemplateColumns }} key={row.key}>
                    {fields.map(field => (
                      <div className={styles.goodsTableCell} key={field.name}>
                        <Form.Item
                          name={[row.name, field.name]}
                          rules={fieldRules(field)}
                          getValueProps={field.kind === 'singleArray'
                            ? value => ({ value: Array.isArray(value) ? value[0] : value })
                            : undefined}
                          getValueFromEvent={field.kind === 'singleArray'
                            ? value => value === undefined || value === null ? [] : [value]
                            : undefined}
                        >
                          {fieldControl(field)}
                        </Form.Item>
                      </div>
                    ))}
                    {showEvidenceStatus && (
                      <div className={`${styles.goodsTableCell} ${styles.directStatusColumn}`}>
                        <span className={evidenceConfigured ? styles.configuredTag : styles.pendingConfigurationTag}>
                          {evidenceConfigured ? I18N.cbamMonitor.configured : I18N.cbamMonitor.pendingConfiguration}
                        </span>
                      </div>
                    )}
                    <div className={`${styles.goodsTableCell} ${styles.goodsTableAction} ${showEvidenceStatus ? styles.directActionColumn : ''}`}>
                      {onSelectPrecursor && (
                        <Button
                          type='text'
                          className={styles.selectPrecursorButton}
                          onClick={() => onSelectPrecursor(row.name)}
                        >
                          {I18N.cbamMonitor.selectPrecursor}
                        </Button>
                      )}
                      <Button
                        type='text'
                        danger
                        className={showEvidenceStatus ? styles.directDeleteButton : undefined}
                        onClick={() => confirmRowRemove(row.name)}
                      >
                        {I18N.cbamMonitor.delete}
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            <Button className={styles.goodsAddRowButton} icon={<PlusOutlined />} onClick={handleAdd}>
              {addText}
            </Button>
            <Form.ErrorList errors={errors} />
            {rows.length > GOODS_PAGE_SIZE && (
              <Pagination
                className={styles.goodsPagination}
                current={safePage}
                pageSize={GOODS_PAGE_SIZE}
                showSizeChanger={false}
                total={rows.length}
                onChange={setCurrentPage}
              />
            )}
          </>
        );
      }}
      </Form.List>
      {evidenceEditor}
    </>
  );
};

const ConditionEvidenceLink = ({
  name,
  partCode,
  onAddEvidence,
  onEditEvidence,
  onDeleteChild,
  onConfigChange,
  label = I18N.cbamMonitor.proofMaterials,
  hint = I18N.cbamMonitor.proofMaterialsHint,
}: {
  name: NamePath;
  partCode: number;
  onAddEvidence?: (
    partCode: number,
    itemKey: string,
    onCreated: (evidenceId: number) => void,
  ) => void;
  onEditEvidence?: (evidenceId: number) => void;
  onDeleteChild?: DeleteChild;
  onConfigChange?: () => void;
  label?: string;
  hint?: string;
}) => {
  const form = Form.useFormInstance();
  const itemKeyPath = [...name as (string | number)[], 'itemKey'];
  const evidenceIdsPath = [...name as (string | number)[], 'evidenceIds'];
  const applicablePath = [...name as (string | number)[], 'applicable'];
  const applicable = Form.useWatch<boolean | undefined>(applicablePath, { form, preserve: true });
  const evidenceIds = Form.useWatch<number[]>(evidenceIdsPath, { form, preserve: true }) || [];
  const evidences = Form.useWatch<MonitorEvidence[]>('evidences', { form, preserve: true }) || [];
  const relations = Form.useWatch<MonitorEvidenceRelation[]>('evidenceRelations', {
    form,
    preserve: true,
  }) || [];
  const [selectOpen, setSelectOpen] = useState(false);
  const relatedEvidences = evidences.filter(item => item.id !== undefined && evidenceIds.includes(item.id));
  const selectableEvidences = evidences.filter(item => item.id !== undefined && !evidenceIds.includes(item.id));
  if (applicable === false) return null;
  const unlink = (evidenceId: number) => {
    const itemKey = form.getFieldValue(itemKeyPath) as string | undefined;
    const relation = relations.find(item => item.evidenceId === evidenceId
      && item.partCode === partCode && item.itemKey === itemKey);
    showMonitorDeleteConfirm({
      title: I18N.cbamMonitor.confirmDeleteItem,
      content: I18N.cbamMonitor.deleteItemTip,
      onOk: async () => {
        if (relation?.id) {
          await onDeleteChild?.({ target: 'EVIDENCE_RELATION', relationId: relation.id });
        }
        form.setFieldValue(evidenceIdsPath, evidenceIds.filter(id => id !== evidenceId));
        form.setFieldValue('evidenceRelations', relations.filter(item => !(
          item.evidenceId === evidenceId && item.partCode === partCode && item.itemKey === itemKey
        )));
        onConfigChange?.();
      },
    });
  };
  return (
    <div className={styles.conditionEvidenceBlock}>
      <span className={styles.conditionEvidenceLabel}>
        <span className={styles.conditionEvidenceRequired}>*</span>
        {label}
      </span>
      <span className={styles.conditionEvidenceHint}>{hint}</span>
      <Space size={16}>
        <Button
          className={styles.evidenceAddButton}
          icon={<PlusOutlined />}
          onClick={() => {
            const itemKey = form.getFieldValue(itemKeyPath) || createItemKey();
            form.setFieldValue(itemKeyPath, itemKey);
            onAddEvidence?.(partCode, itemKey, evidenceId => {
              form.setFieldValue(
                evidenceIdsPath,
                Array.from(new Set([...(form.getFieldValue(evidenceIdsPath) || []), evidenceId])),
              );
              onConfigChange?.();
            });
          }}
        >
          {I18N.cbamMonitor.addEvidence}
        </Button>
        <Button
          className={styles.evidenceSelectButton}
          icon={<img alt='' className={styles.evidenceSelectIcon} src={selectEvidenceIcon} />}
          onClick={() => setSelectOpen(true)}
        >
          {I18N.cbamMonitor.selectEvidence}
        </Button>
      </Space>
      <div className={styles.processMonitorEvidenceCards}>
        {relatedEvidences.map(evidence => (
          <BusinessEvidenceCard
            evidence={evidence}
            key={evidence.id}
            onDelete={unlink}
            onEdit={evidenceId => onEditEvidence?.(evidenceId)}
          />
        ))}
      </div>
      <EvidenceSelectModal
        evidences={selectableEvidences}
        open={selectOpen}
        onCancel={() => setSelectOpen(false)}
        onConfirm={selectedIds => {
          const itemKey = form.getFieldValue(itemKeyPath) || createItemKey();
          form.setFieldValue(itemKeyPath, itemKey);
          form.setFieldValue(evidenceIdsPath, Array.from(new Set([...evidenceIds, ...selectedIds])));
          form.setFieldValue('evidenceRelations', [
            ...relations,
            ...selectedIds.map(evidenceId => ({ evidenceId, partCode, itemKey })),
          ]);
          onConfigChange?.();
          setSelectOpen(false);
        }}
      />
    </div>
  );
};

const ConditionNotice = ({ children }: { children: ReactNode }) => (
  <div className={styles.conditionNotice}>
    <ExclamationCircleFilled />
    <span>{children}</span>
  </div>
);

const ConditionApplicableFields = ({
  name,
  label,
  children,
}: {
  name: NamePath;
  label: string;
  children: ReactNode;
}) => (
  <div className={styles.conditionApplicableFields}>
    <Form.Item name={[...name as (string | number)[], 'applicable']} label={label} initialValue>
      <Radio.Group>
        <Radio value>{I18N.cbamMonitor.yes}</Radio>
        <Radio value={false}>{I18N.cbamMonitor.no}</Radio>
      </Radio.Group>
    </Form.Item>
    <Form.Item noStyle shouldUpdate>
      {({ getFieldValue }) => getFieldValue([...name as (string | number)[], 'applicable']) !== false
        ? children
        : (
          <Form.Item
            name={[...name as (string | number)[], 'notApplicableReason']}
            label={I18N.cbamMonitor.notApplicableDescription}
            rules={[{ max: 100 }]}
          >
            <Input maxLength={100} />
          </Form.Item>
        )}
    </Form.Item>
  </div>
);

const optionFields = (labelKey: 'productName' | 'precursorName' | 'processName' | 'sourceFlowName', values: { itemKey?: string; productName?: string; precursorName?: string; processName?: string; sourceFlowName?: string }[] = []) =>
  values.flatMap(item => {
    const label = item[labelKey]?.trim();
    return item.itemKey && label ? [{ label, value: item.itemKey }] : [];
  });

export const ConfigSections = ({
  activeNav,
  countryOptions,
  form,
  factories,
  factory,
  onAddEvidence,
  onEditEvidence,
  onDeleteChild,
  onConfigChange,
  readonly = false,
}: {
  activeNav: string;
  countryOptions: { label: string; value: string }[];
  form: FormInstance<MonitorPlanPayload>;
  factories: FactoryOption[];
  factory?: FactoryOption;
  onAddEvidence?: (
    partCode: number,
    itemKey: string,
    onCreated: (evidenceId: number) => void,
  ) => void;
  onEditEvidence?: (evidenceId: number) => void;
  onDeleteChild?: DeleteChild;
  onConfigChange?: () => void;
  readonly?: boolean;
}) => {
  const looseForm = form as FormInstance;
  const [cnOptions, setCnOptions] = useState<{ label: string; value: string }[]>([]);
  const [cnOptionsLoaded, setCnOptionsLoaded] = useState(false);
  const [cnOptionsLoading, setCnOptionsLoading] = useState(false);
  const [selectingPrecursorRow, setSelectingPrecursorRow] = useState<number>();
  const products = Form.useWatch(['goodsBoundary', 'productJson', 'products'], {
    form,
    preserve: true,
  });
  const precursors = Form.useWatch(['goodsBoundary', 'precursorJson', 'precursors'], {
    form,
    preserve: true,
  });
  const processes = Form.useWatch(['goodsBoundary', 'processJson', 'processes'], {
    form,
    preserve: true,
  });
  const methods = Form.useWatch<ProcessMonitorItem[]>(['directEmission', 'processMonitorJson', 'methods'], {
    form,
    preserve: true,
  });
  const factorSamplingItems = Form.useWatch<FactorSamplingItem[]>(
    ['directEmission', 'factorSamplingJson', 'factors'],
    { form, preserve: true },
  );
  const pfcMethods = Form.useWatch<PfcMonitorItem[]>(
    ['directEmission', 'pfcMonitorJson', 'methods'],
    { form, preserve: true },
  );
  const responsibilities = Form.useWatch(
    ['controlConfirmation', 'divideWorkJson', 'responsibilities'],
    form,
  ) as ResponsibilityItem[] | undefined;
  const positionOptions = useMemo(
    () => (responsibilities || [])
      .filter(item => item.positionName)
      .map(item => ({ label: item.positionName || '', value: item.positionName || '' })),
    [responsibilities],
  );
  const refs = useMemo(
    () => ({
      products: optionFields('productName', products),
      precursors: optionFields('precursorName', precursors),
      processes: optionFields('processName', processes),
    }),
    [precursors, processes, products],
  );
  const sourceFlowOptions = useMemo(() => Array.from(new Set([
    ...(methods || []),
    ...(factorSamplingItems || []),
  ]
    .map(item => item.sourceFlowName?.trim())
    .filter((value): value is string => Boolean(value))))
    .map(value => ({ label: value, value })), [factorSamplingItems, methods]);
  const aluminumProcessOptions = useMemo(() => {
    const aluminumProductKeys = new Set((products || [])
      .filter(product => isAluminumCnCode(product.cnCode))
      .map(product => product.itemKey)
      .filter(Boolean));
    return (processes || []).flatMap(process => (
      process.itemKey
      && process.processName
      && process.productItemKeys?.some(itemKey => aluminumProductKeys.has(itemKey))
        ? [{ label: process.processName, value: process.itemKey }]
        : []
    ));
  }, [processes, products]);
  useEffect(() => {
    if (products === undefined || processes === undefined || !pfcMethods?.length) return;
    const validProcessKeys = new Set(aluminumProcessOptions.map(option => option.value));
    let changed = false;
    const nextMethods = pfcMethods.map(method => {
      if (!method.processItemKey || validProcessKeys.has(method.processItemKey)) return method;
      changed = true;
      return { ...method, processItemKey: undefined };
    });
    if (!changed) return;
    form.setFieldValue(['directEmission', 'pfcMonitorJson', 'methods'], nextMethods);
    onConfigChange?.();
  }, [aluminumProcessOptions, form, onConfigChange, pfcMethods, processes, products]);
  useEffect(() => {
    if (processes === undefined || !methods?.length) return;
    const validProcessKeys = new Set((processes || []).flatMap(process => (
      process.itemKey && process.processName?.trim() ? [process.itemKey] : []
    )));
    let changed = false;
    const nextMethods = methods.map(method => {
      if (!method.processItemKey || validProcessKeys.has(method.processItemKey)) return method;
      changed = true;
      return { ...method, processItemKey: undefined };
    });
    if (!changed) return;
    form.setFieldValue(['directEmission', 'processMonitorJson', 'methods'], nextMethods);
    onConfigChange?.();
  }, [form, methods, onConfigChange, processes]);
  const removeProcessReference = (
    fieldName: 'productItemKeys' | 'precursorItemKeys',
    itemKey?: string,
  ) => {
    if (!itemKey) return;
    const currentProcesses = form.getFieldValue([
      'goodsBoundary', 'processJson', 'processes',
    ]) as ProcessItem[] | undefined;
    let changed = false;
    const nextProcesses = (currentProcesses || []).map(process => {
      const currentItemKeys = process[fieldName];
      const nextItemKeys = currentItemKeys?.filter(currentItemKey => currentItemKey !== itemKey);
      if (nextItemKeys?.length === currentItemKeys?.length) return process;
      changed = true;
      return {
        ...process,
        [fieldName]: nextItemKeys,
      };
    });
    if (changed) form.setFieldValue(['goodsBoundary', 'processJson', 'processes'], nextProcesses);
  };
  const clearListReference = (
    path: (string | number)[],
    fieldName: string,
    itemKey?: string,
  ) => {
    if (!itemKey) return;
    const items = looseForm.getFieldValue(path) as Record<string, unknown>[] | undefined;
    const nextItems = (items || []).map(item => (
      item[fieldName] === itemKey ? { ...item, [fieldName]: undefined } : item
    ));
    looseForm.setFieldValue(path, nextItems);
  };
  const removeDependentProcessReferences = (itemKey?: string) => {
    const paths = [
      ['goodsBoundary', 'nonCbamGoodsJson', 'goods'],
      ['directEmission', 'processMonitorJson', 'methods'],
      ['directEmission', 'pfcMonitorJson', 'methods'],
      ['condition', 'measurableHeatJson', 'heatFlows'],
      ['condition', 'facilityElectricityJson', 'generators'],
      ['condition', 'wasteGasJson', 'wasteGasFlows'],
    ];
    paths.forEach(path => clearListReference(path, 'processItemKey', itemKey));
    onConfigChange?.();
  };
  useEffect(() => {
    if (activeNav !== 'goods' || cnOptionsLoaded) return undefined;
    let active = true;
    setCnOptionsLoading(true);
    getMonitorCnOptions()
      .then(({ data }) => {
        if (!active) return;
        const records = data?.data?.records || [];
        setCnOptions(records
          .filter(item => item.defaultCode)
          .map(item => ({
            label: [item.defaultCode, item.defaultName].filter(Boolean).join(' / '),
            value: item.defaultCode || '',
          })));
      })
      .catch(() => {
        if (active) setCnOptions([]);
      })
      .finally(() => {
        if (active) {
          setCnOptionsLoading(false);
          setCnOptionsLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [activeNav, cnOptionsLoaded]);
  const handlePrecursorSelected = (record: MonitorPrecursorOption) => {
    if (selectingPrecursorRow === undefined) return;
    const path: ['goodsBoundary', 'precursorJson', 'precursors', number] = [
      'goodsBoundary', 'precursorJson', 'precursors', selectingPrecursorRow,
    ];
    const current = (form.getFieldValue(path) || {}) as PrecursorItem;
    form.setFieldValue(path, {
      ...current,
      sourceId: record.id,
      cnCode: record.cnCode,
      precursorName: record.precursorName,
      emissionBasis: 'MEASURED_VALUE',
      supplierName: record.supplyName,
      sourceFacility: record.sourceFacility || current.sourceFacility,
      originCountry: record.countryValue || record.countryName,
      verificationPeriod: record.verificationPeriod,
      embeddedEmission: record.embeddedEmission,
    });
    setSelectingPrecursorRow(undefined);
  };

  if (activeNav === 'identity') {
    return (
      <>
        <Section className={styles.identityPlanSection} title={I18N.cbamMonitor.planDateAndVersion}>
          <div className={styles.identityFormGrid}>
            <Form.Item name='planName' label={I18N.cbamMonitor.planName} rules={[{ required: true }]}>
              <Input maxLength={100} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item name='planDate' label={I18N.cbamMonitor.planDate} rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name='versionNo' label={I18N.cbamMonitor.versionNo} rules={[{ required: true }, { pattern: /^V/, message: I18N.cbamMonitor.versionNoRule }]}>
              <Input maxLength={40} placeholder={I18N.cbamMonitor.versionNoExample} />
            </Form.Item>
            <Form.Item name='year' label={I18N.cbamMonitor.reportingYear} rules={[{ required: true }]}>
              <Select options={Array.from(
                { length: new Date().getFullYear() - 2023 + 4 },
                (_, index) => 2023 + index,
              ).map(year => ({ label: year, value: year }))} />
            </Form.Item>
            <Form.Item name='effectiveDate' label={I18N.cbamMonitor.effectiveDate} rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name='changeReason' label={I18N.cbamMonitor.versionChangeReason} rules={[{ max: 200 }]}>
              <Input maxLength={200} placeholder={I18N.cbamMonitor.versionChangeReasonHint} />
            </Form.Item>
          </div>
        </Section>
        <Section
          title={I18N.cbamMonitor.operatorFacilityIdentification}
          description={I18N.cbamMonitor.operatorFacilityIdentificationHint}
        >
          <div className={styles.identitySubsection}>
            <h4>{I18N.cbamMonitor.factoryIdentificationAndAddress}</h4>
            <div className={styles.identityFormGrid}>
              <Form.Item name='factoryId' label={I18N.cbamMonitor.factoryName} rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp='label'
                  placeholder={I18N.cbamMonitor.selectFactory}
                  options={factories.map(item => ({
                    label: [item.factorName, item.factoryCode].filter(Boolean).join(' / '),
                    value: item.id,
                  }))}
                />
              </Form.Item>
              <ReadOnlyFactoryField label={I18N.cbamMonitor.uniqueIdentifier} value={factory?.factoryCode} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.portUnLocode} value={factory?.locationCode} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.postalCode} value={factory?.postalCode} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.country} value={factory?.countryName || factory?.country} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.city} value={factory?.city} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.chineseAddress} value={factory?.detailedAddress} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.englishAddress} value={factory?.addressEn} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.longitude} value={factory?.longitude} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.latitude} value={factory?.latitude} required />
              <ReadOnlyFactoryField label={I18N.cbamMonitor.ePrtrIdentifier} value={factory?.ePrtrCode} />
            </div>
          </div>
          <div className={styles.identitySubsection}>
            <h4>{I18N.cbamMonitor.operatorInformation}</h4>
            <div className={styles.identityFormGrid}>
              <Form.Item name={['facility', 'facilityJson', 'operatorName']} label={I18N.cbamMonitor.operatorName} rules={[{ required: true, max: 100 }]}>
                <Input maxLength={100} placeholder={I18N.cbamMonitor.enter} />
              </Form.Item>
              <Form.Item name={['facility', 'facilityJson', 'registNo']} label={I18N.cbamMonitor.registrationNo} rules={[{ required: true, max: 40 }]}>
                <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
              </Form.Item>
            </div>
          </div>
          <div className={styles.identityTextSection}>
            <Form.Item name={['facility', 'facilityJson', 'activityOverview']} label={I18N.cbamMonitor.facilityActivityOverview} rules={[{ required: true, max: 1000 }]}>
              <Input.TextArea className={styles.identityTextArea} maxLength={1000} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
          </div>
          <div className={styles.identityTextSection}>
            <Form.Item name={['facility', 'facilityJson', 'processDescription']} label={I18N.cbamMonitor.processDescription} rules={[{ required: true, max: 1000 }]}>
              <Input.TextArea className={styles.identityTextArea} maxLength={1000} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
          </div>
        </Section>
      </>
    );
  }

  if (activeNav === 'goods') {
    const goodsCollapseItems = [
      {
        key: 'products',
        label: I18N.cbamMonitor.productListComposition,
        children: <GoodsTableSection name={['goodsBoundary', 'productJson', 'products']} addText={I18N.cbamMonitor.addGoods} deleteTarget='PRODUCT' onDeleteChild={onDeleteChild} onRemove={itemKey => removeProcessReference('productItemKeys', itemKey)} requiredRows fields={[
          { name: 'cnCode', label: I18N.cbamMonitor.cnCode, kind: 'select', required: true, options: cnOptions, loading: cnOptionsLoading, searchable: true, strictOptions: true },
          { name: 'productName', label: I18N.cbamMonitor.productName, required: true, max: 40 },
          { name: 'functionalUnit', label: I18N.cbamMonitor.functionalUnit, required: true, max: 40 },
          { name: 'productType', label: I18N.cbamMonitor.productType, kind: 'select', required: true, options: [{ label: I18N.cbamMonitor.soldProduct, value: 'SOLD_PRODUCT' }, { label: I18N.cbamMonitor.intermediateProduct, value: 'INTERMEDIATE_PRODUCT' }] },
        ]} />,
      },
      {
        key: 'precursors',
        label: I18N.cbamMonitor.purchasedPrecursors,
        children: <GoodsTableSection name={['goodsBoundary', 'precursorJson', 'precursors']} addText={I18N.cbamMonitor.addPrecursor} actionWidth={80} columnMinWidth={140} deleteTarget='PRECURSOR' onDeleteChild={onDeleteChild} onRemove={itemKey => removeProcessReference('precursorItemKeys', itemKey)} requiredRows fields={[
          { name: 'cnCode', label: I18N.cbamMonitor.cnCode, kind: 'select', required: true, options: cnOptions, loading: cnOptionsLoading, searchable: true, strictOptions: true },
          { name: 'precursorName', label: I18N.cbamMonitor.precursorName, required: true, max: 40 },
          { name: 'emissionBasis', label: I18N.cbamMonitor.emissionDataBasis, kind: 'select', required: true, options: [{ label: I18N.cbamMonitor.measuredValue, value: 'MEASURED_VALUE' }, { label: I18N.cbamMonitor.defaultValue, value: 'DEFAULT_VALUE' }] },
          { name: 'supplierName', label: I18N.cbamMonitor.supplierName, required: true, max: 40 },
          { name: 'sourceFacility', label: I18N.cbamMonitor.sourceFacility, required: true, max: 40 },
          {
            name: 'originCountry',
            label: I18N.cbamMonitor.countryOfOrigin,
            kind: 'select',
            required: true,
            options: countryOptions,
            searchable: true,
          },
        ]} />,
      },
      {
        key: 'processes',
        label: I18N.cbamMonitor.processGoodsMapping,
        children: <GoodsTableSection name={['goodsBoundary', 'processJson', 'processes']} addText={I18N.cbamMonitor.addProcess} actionWidth={80} deleteTarget='PROCESS' onDeleteChild={onDeleteChild} onRemove={removeDependentProcessReferences} fields={[
          { name: 'processName', label: I18N.cbamMonitor.processName, required: true, max: 40, minWidth: 140 },
          { name: 'productItemKeys', label: I18N.cbamMonitor.relatedProducts, kind: 'singleArray', required: true, options: refs.products, minWidth: 280, flex: 2 },
          { name: 'precursorItemKeys', label: I18N.cbamMonitor.relatedPrecursors, kind: 'multi', required: true, options: refs.precursors, minWidth: 180 },
          { name: 'productionRoute', label: I18N.cbamMonitor.productionRoute, required: true, max: 40, minWidth: 140 },
          { name: 'description', label: I18N.cbamMonitor.processDetail, required: true, max: 200, minWidth: 220 },
        ]} />,
      },
      {
        key: 'nonCbamGoods',
        label: I18N.cbamMonitor.nonCbamGoodsAllocation,
        children: <GoodsTableSection name={['goodsBoundary', 'nonCbamGoodsJson', 'goods']} addText={I18N.cbamMonitor.addNonCbamGoods} deleteTarget='NON_CBAM_GOODS' onDeleteChild={onDeleteChild} fields={[
          { name: 'processItemKey', label: I18N.cbamMonitor.process, kind: 'select', required: true, options: refs.processes },
          { name: 'goodsName', label: I18N.cbamMonitor.goodsName, required: true, max: 40 },
          { name: 'allocationMethod', label: I18N.cbamMonitor.allocationMethod, required: true, max: 200 },
          { name: 'allocationRate', label: I18N.cbamMonitor.allocationRate, kind: 'number', required: true, max: 100 },
        ]} />,
      },
      {
        key: 'systemBoundary',
        label: I18N.cbamMonitor.systemBoundaryDiagram,
        children: (
          <div className={styles.goodsBoundaryForm}>
            <Form.Item name={['goodsBoundary', 'systemBoundaryJson', 'files']} label={I18N.cbamMonitor.systemBoundaryFile} rules={[{ required: true, type: 'array', min: 1, message: I18N.cbamMonitor.uploadBoundaryFile }]}>
              <FileObjectUpload
                disabled={readonly}
                maxCount={5}
                maxSize={20}
                variant='boundary'
                onDelete={file => onDeleteChild?.({
                  target: 'SYSTEM_BOUNDARY_FILE',
                  fileUrl: file.url,
                  fileName: file.name,
                  uploadTime: file.uploadTime,
                })}
              />
            </Form.Item>
            <Form.Item name={['goodsBoundary', 'systemBoundaryJson', 'boundaryDescription']} label={I18N.cbamMonitor.systemBoundaryDescription} rules={[{ required: true, max: 1000 }]}>
              <Input.TextArea className={styles.boundaryDescription} maxLength={1000} />
            </Form.Item>
          </div>
        ),
      },
    ];
    return (
      <>
        <Collapse
          className={styles.goodsCollapse}
          defaultActiveKey='products'
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
          items={goodsCollapseItems}
        />
        <PrecursorSelectModal
          cnOptions={cnOptions}
          open={selectingPrecursorRow !== undefined}
          onCancel={() => setSelectingPrecursorRow(undefined)}
          onConfirm={handlePrecursorSelected}
        />
      </>
    );
  }

  if (activeNav === 'direct') {
    const directCollapseItems = [
      {
        key: 'processMonitor',
        label: I18N.cbamMonitor.processMonitoringMethods,
        children: (
          <ProcessMonitorSection
            form={form}
            processes={processes}
            sourceFlowOptions={sourceFlowOptions}
            onAddEvidence={(itemKey, onCreated) => onAddEvidence?.(1, itemKey, onCreated)}
            onEditEvidence={onEditEvidence}
            onDeleteChild={onDeleteChild}
          />
        ),
      },
      {
        key: 'factorSampling',
        label: I18N.cbamMonitor.calculationFactorsSampling,
        children: <GoodsTableSection
          name={['directEmission', 'factorSamplingJson', 'factors']}
          addText={I18N.cbamMonitor.addCalculationFactor}
          deleteTarget='FACTOR_SAMPLING'
          onDeleteChild={onDeleteChild}
          actionWidth={DIRECT_ACTION_WIDTH}
          columnMinWidth={160}
          evidencePartCode={2}
          editText={I18N.cbamMonitor.editCalculationFactor}
          onAddEvidence={(itemKey, onCreated) => onAddEvidence?.(2, itemKey, onCreated)}
          onEditEvidence={onEditEvidence}
          fields={[
            {
              name: 'sourceFlowName',
              label: I18N.cbamMonitor.sourceFlow,
              kind: 'autocomplete',
              required: true,
              max: 40,
              options: sourceFlowOptions,
            },
            {
              name: 'factorType',
              label: I18N.cbamMonitor.factorType,
              kind: 'select',
              required: true,
              options: factorTypeOptions,
              searchable: true,
              strictOptions: true,
            },
            { name: 'acquisitionPath', label: I18N.cbamMonitor.acquisitionPath, max: 40 },
            { name: 'sourceName', label: I18N.cbamMonitor.source, required: true, max: 40 },
            { name: 'sourceVersion', label: I18N.cbamMonitor.sourceVersion, max: 40 },
            { name: 'samplingPlan', label: I18N.cbamMonitor.samplingPlan, kind: 'textarea', required: true, max: 200 },
            { name: 'laboratory', label: I18N.cbamMonitor.laboratory, required: true, max: 40 },
            { name: 'laboratoryMethod', label: I18N.cbamMonitor.laboratoryMethod, required: true, max: 1000 },
          ]}
        />,
      },
      {
        key: 'pfcMonitor',
        label: I18N.cbamMonitor.pfcMonitoring,
        children: (
          <div className={styles.directApplicableContent}>
            <Form.Item
              className={styles.pfcApplicableToggle}
              name={['directEmission', 'pfcMonitorJson', 'applicable']}
              label={I18N.cbamMonitor.applicable}
              initialValue
            >
              <Radio.Group
                onChange={event => {
                  const reasonPath: ['directEmission', 'pfcMonitorJson', 'notApplicableReason'] = [
                    'directEmission', 'pfcMonitorJson', 'notApplicableReason',
                  ];
                  if (!event.target.value && !form.getFieldValue(reasonPath)?.trim()) {
                    form.setFieldValue(reasonPath, I18N.cbamMonitor.pfcNotApplicableDefault);
                  }
                }}
              >
                <Radio value>{I18N.cbamMonitor.yes}</Radio>
                <Radio value={false}>{I18N.cbamMonitor.no}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => getFieldValue(['directEmission', 'pfcMonitorJson', 'applicable']) !== false ? (
                <div className={styles.pfcApplicableConfiguration}>
                  <ConditionNotice>{I18N.cbamMonitor.pfcMonitoringNotice}</ConditionNotice>
                  <GoodsTableSection
                    name={['directEmission', 'pfcMonitorJson', 'methods']}
                    addText={I18N.cbamMonitor.addPfcMethod}
                    deleteTarget='PFC_MONITOR'
                    onDeleteChild={onDeleteChild}
                    actionWidth={DIRECT_ACTION_WIDTH}
                    columnMinWidth={160}
                    evidencePartCode={3}
                    borderless
                    editText={I18N.cbamMonitor.editPfcMethod}
                    onAddEvidence={(itemKey, onCreated) => onAddEvidence?.(3, itemKey, onCreated)}
                    onEditEvidence={onEditEvidence}
                    normalizeItem={item => ({
                      ...item,
                      processItemKey: aluminumProcessOptions.some(
                        option => option.value === item.processItemKey,
                      ) ? item.processItemKey : undefined,
                      formulaCode: pfcFormulaCode(item.method as string),
                    })}
                    fields={[
                      {
                        name: 'processItemKey',
                        label: I18N.cbamMonitor.processName,
                        kind: 'select',
                        required: true,
                        options: aluminumProcessOptions,
                        searchable: true,
                        placeholder: I18N.cbamMonitor.enterOrSelect,
                        minWidth: 180,
                      },
                      { name: 'technology', label: I18N.cbamMonitor.technologyType, required: true, max: 40 },
                      {
                        name: 'method',
                        label: I18N.cbamMonitor.method,
                        kind: 'select',
                        required: true,
                        options: [{ label: I18N.cbamMonitor.slopeMethod, value: 'SLOPE_METHOD' }, { label: I18N.cbamMonitor.overvoltageMethod, value: 'OVERVOLTAGE_METHOD' }],
                      },
                      {
                        name: 'formulaCode',
                        label: I18N.cbamMonitor.calculationFormula,
                        kind: 'readonly',
                        minWidth: 360,
                        multiline: true,
                        formatValue: value => pfcFormulaText(value as string),
                      },
                      { name: 'dataSource', label: I18N.cbamMonitor.dataSource, required: true, max: 40 },
                      { name: 'frequency', label: I18N.cbamMonitor.frequency, kind: 'select', required: true, options: monitorFrequencyOptions },
                      { name: 'equipment', label: I18N.cbamMonitor.measuringEquipment, required: true, max: 40 },
                      { name: 'location', label: I18N.cbamMonitor.equipmentLocation, max: 40 },
                      { name: 'uncertainty', label: I18N.cbamMonitor.uncertainty, max: 10 },
                      { name: 'calibration', label: I18N.cbamMonitor.calibrationMethod, required: true, max: 200 },
                      { name: 'missingDataMethod', label: I18N.cbamMonitor.missingDataMethod, kind: 'textarea', max: 1000, minWidth: 220 },
                    ]}
                  />
                </div>
              ) : (
                <Form.Item
                  name={['directEmission', 'pfcMonitorJson', 'notApplicableReason']}
                  label={I18N.cbamMonitor.notApplicableDescription}
                  initialValue={I18N.cbamMonitor.pfcNotApplicableDefault}
                  rules={[{ max: 100 }]}
                >
                  <Input maxLength={100} />
                </Form.Item>
              )}
            </Form.Item>
          </div>
        ),
      },
    ];
    return (
      <Collapse
        className={styles.goodsCollapse}
        defaultActiveKey='processMonitor'
        expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
        items={directCollapseItems}
      />
    );
  }

  if (activeNav === 'condition') {
    const conditionCollapseItems = [
      {
        key: 'zeroRatedFuel',
        label: I18N.cbamMonitor.zeroRatedFuels,
        children: (
          <div className={styles.conditionGroupContent}>
            <ConditionApplicableFields
              name={['condition', 'zeroRatedFuelJson']}
              label={I18N.template(I18N.cbamMonitor.whetherApplicable, { item: I18N.cbamMonitor.zeroRatedFuels })}
            >
              <div className={styles.conditionFields}>
                <Form.Item name={['condition', 'zeroRatedFuelJson', 'description']} label={I18N.cbamMonitor.zeroRatedFuelDescription} rules={[{ required: true, max: 1000 }]}>
                  <Input.TextArea className={styles.conditionTextArea} maxLength={1000} />
                </Form.Item>
                <Form.Item name={['condition', 'zeroRatedFuelJson', 'additionalDescription']} label={I18N.cbamMonitor.description} rules={[{ max: 1000 }]}>
                  <Input.TextArea
                    className={styles.conditionTextArea}
                    maxLength={1000}
                    placeholder={I18N.cbamMonitor.zeroRatedFuelAdditionalDescriptionPlaceholder}
                  />
                </Form.Item>
                <ConditionEvidenceLink name={['condition', 'zeroRatedFuelJson']} partCode={4} onAddEvidence={onAddEvidence} onEditEvidence={onEditEvidence} onDeleteChild={onDeleteChild} onConfigChange={onConfigChange} />
              </div>
            </ConditionApplicableFields>
          </div>
        ),
      },
      {
        key: 'measurableHeat',
        label: I18N.cbamMonitor.measurableHeatFlows,
        children: (
          <div className={styles.conditionGroupContent}>
            <ConditionApplicableFields
              name={['condition', 'measurableHeatJson']}
              label={I18N.cbamMonitor.measurableHeatQuestion}
            >
              <GoodsTableSection
                name={['condition', 'measurableHeatJson', 'heatFlows']}
                addText={I18N.cbamMonitor.addHeatFlow}
                columnMinWidth={160}
                deleteTarget='MEASURABLE_HEAT'
                onDeleteChild={onDeleteChild}
                actionWidth={DIRECT_ACTION_WIDTH}
                evidencePartCode={5}
                editText={I18N.cbamMonitor.editHeatFlow}
                onAddEvidence={(itemKey, onCreated) => onAddEvidence?.(5, itemKey, onCreated)}
                onEditEvidence={onEditEvidence}
                fields={[
                  { name: 'direction', label: I18N.cbamMonitor.direction, kind: 'select', required: true, options: [{ label: I18N.cbamMonitor.input, value: 'INPUT' }, { label: I18N.cbamMonitor.output, value: 'OUTPUT' }] },
                  {
                    name: 'medium',
                    label: I18N.cbamMonitor.medium,
                    kind: 'autocomplete',
                    required: true,
                    max: 40,
                    options: [I18N.cbamMonitor.steam, I18N.cbamMonitor.hotWater, I18N.cbamMonitor.other]
                      .map(value => ({ label: value, value })),
                    placeholder: I18N.cbamMonitor.enterOrSelect,
                  },
                  { name: 'counterparty', label: I18N.cbamMonitor.counterpartyFacility, max: 40 },
                  { name: 'processItemKey', label: I18N.cbamMonitor.belongingProcess, kind: 'select', required: true, options: refs.processes },
                  { name: 'allocationMethod', label: I18N.cbamMonitor.emissionAllocationMethod, required: true, max: 100 },
                  { name: 'meteringPoint', label: I18N.cbamMonitor.meteringPoint, required: true, max: 100 },
                ]}
              />
            </ConditionApplicableFields>
          </div>
        ),
      },
      {
        key: 'facilityElectricity',
        label: I18N.cbamMonitor.onsiteElectricityEvidence,
        children: (
          <div className={styles.conditionGroupContent}>
            <div className={`${styles.conditionSubsection} ${styles.facilityGenerationSubsection}`}>
              <ConditionApplicableFields
                name={['condition', 'facilityElectricityJson']}
                label={I18N.cbamMonitor.onsiteElectricityGeneration}
              >
                <GoodsTableSection
                  name={['condition', 'facilityElectricityJson', 'generators']}
                  addText={I18N.cbamMonitor.addGenerator}
                  columnMinWidth={180}
                  deleteTarget='FACILITY_ELECTRICITY'
                  onDeleteChild={onDeleteChild}
                  actionWidth={DIRECT_ACTION_WIDTH}
                  evidencePartCode={6}
                  editText={I18N.cbamMonitor.editGenerator}
                  onAddEvidence={(itemKey, onCreated) => onAddEvidence?.(6, itemKey, onCreated)}
                  onEditEvidence={onEditEvidence}
                  fields={[
                  { name: 'generationMode', label: I18N.cbamMonitor.generationMode, required: true, max: 40 },
                  { name: 'energyProperty', label: I18N.cbamMonitor.energyProperty, required: true, max: 40 },
                  { name: 'includedInOutputBoundary', label: I18N.cbamMonitor.includedInOutputBoundary, kind: 'select', required: true, options: [{ label: I18N.cbamMonitor.yes, value: true }, { label: I18N.cbamMonitor.no, value: false }] },
                  { name: 'processItemKey', label: I18N.cbamMonitor.belongingProcess, kind: 'select', required: true, options: refs.processes },
                  { name: 'meteringAllocationMethod', label: I18N.cbamMonitor.meteringAllocationMethod, required: true, max: 100 },
                  ]}
                />
              </ConditionApplicableFields>
            </div>
            <div className={`${styles.conditionSubsection} ${styles.electricityFactorSubsection}`}>
              <h4>{I18N.cbamMonitor.electricityFactorMeasuredInfo}</h4>
              <ConditionApplicableFields
                name={['condition', 'electricityFactorJson']}
                label={I18N.template(I18N.cbamMonitor.whetherApplicable, { item: I18N.cbamMonitor.electricityFactorMeasuredInfo })}
              >
                <Form.Item name={['condition', 'electricityFactorJson', 'description']} label={I18N.cbamMonitor.indirectEmissionEvidenceDescription} rules={[{ required: true, max: 1000 }]}>
                  <Input.TextArea
                    className={styles.conditionTextArea}
                    maxLength={1000}
                    placeholder={I18N.cbamMonitor.indirectEmissionEvidencePlaceholder}
                  />
                </Form.Item>
                <Form.Item name={['condition', 'electricityFactorJson', 'additionalDescription']} label={I18N.cbamMonitor.description} rules={[{ max: 1000 }]}>
                  <Input.TextArea
                    className={styles.conditionTextArea}
                    maxLength={1000}
                    placeholder={I18N.cbamMonitor.electricityFactorAdditionalDescriptionPlaceholder}
                  />
                </Form.Item>
              </ConditionApplicableFields>
            </div>
            <ConditionEvidenceLink
              name={['condition', 'electricityFactorJson']}
              partCode={6}
              hint={I18N.cbamMonitor.electricityProofMaterialsHint}
              onAddEvidence={onAddEvidence}
              onEditEvidence={onEditEvidence}
              onDeleteChild={onDeleteChild}
              onConfigChange={onConfigChange}
            />
          </div>
        ),
      },
      {
        key: 'wasteGas',
        label: I18N.cbamMonitor.wasteGasTransfers,
        children: (
          <div className={styles.conditionGroupContent}>
            <ConditionApplicableFields
              name={['condition', 'wasteGasJson']}
              label={I18N.template(I18N.cbamMonitor.whetherApplicable, { item: I18N.cbamMonitor.wasteGasTransfers })}
            >
              <GoodsTableSection
                name={['condition', 'wasteGasJson', 'wasteGasFlows']}
                addText={I18N.cbamMonitor.addWasteGas}
                columnMinWidth={180}
                deleteTarget='WASTE_GAS'
                onDeleteChild={onDeleteChild}
                actionWidth={DIRECT_ACTION_WIDTH}
                evidencePartCode={7}
                editText={I18N.cbamMonitor.editWasteGas}
                onAddEvidence={(itemKey, onCreated) => onAddEvidence?.(7, itemKey, onCreated)}
                onEditEvidence={onEditEvidence}
                fields={[
                  { name: 'wasteGasType', label: I18N.cbamMonitor.wasteGasType, required: true, max: 40 },
                  { name: 'flowModes', label: I18N.cbamMonitor.mode, kind: 'multi', options: [{ label: I18N.cbamMonitor.produce, value: 'PRODUCE' }, { label: I18N.cbamMonitor.use, value: 'USE' }, { label: I18N.cbamMonitor.input, value: 'INPUT' }, { label: I18N.cbamMonitor.output, value: 'OUTPUT' }] },
                  { name: 'counterparty', label: I18N.cbamMonitor.counterpartyFacility, max: 40 },
                  { name: 'processItemKey', label: I18N.cbamMonitor.belongingProcess, kind: 'select', required: true, options: refs.processes },
                  { name: 'method', label: I18N.cbamMonitor.monitoringAllocationMethod, required: true, max: 100 },
                ]}
              />
            </ConditionApplicableFields>
          </div>
        ),
      },
      {
        key: 'co2Stage',
        label: I18N.cbamMonitor.co2CaptureUse,
        children: (
          <div className={styles.conditionGroupContent}>
            <ConditionApplicableFields
              name={['condition', 'co2StageJson']}
              label={I18N.cbamMonitor.applicable}
            >
              <div className={`${styles.conditionFields} ${styles.conditionCompactFields}`}>
                <ConditionNotice>{I18N.cbamMonitor.co2ApplicabilityNotice}</ConditionNotice>
                <ConditionEvidenceLink
                  name={['condition', 'co2StageJson']}
                  partCode={8}
                  onAddEvidence={onAddEvidence}
                  onEditEvidence={onEditEvidence}
                  onDeleteChild={onDeleteChild}
                  onConfigChange={onConfigChange}
                  label={I18N.cbamMonitor.co2EvidenceTitle}
                  hint={I18N.cbamMonitor.co2EvidenceHint}
                />
              </div>
            </ConditionApplicableFields>
          </div>
        ),
      },
    ];
    return (
      <Collapse
        className={`${styles.goodsCollapse} ${styles.conditionCollapse}`}
        defaultActiveKey='zeroRatedFuel'
        expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
        items={conditionCollapseItems}
      />
    );
  }

  const controlCollapseItems = [
    {
      key: 'managementEvaluation',
      label: I18N.cbamMonitor.managementResponsibilitiesEvaluation,
      children: (
        <div className={styles.controlGroupContent}>
          <ResponsibilitySection onDeleteChild={onDeleteChild} />
          <ProcedureListSection
            title={I18N.cbamMonitor.managementEvaluation}
            name={['controlConfirmation', 'manageEvaluateJson', 'procedures']}
            positionOptions={positionOptions}
            management
            deleteTarget='MANAGE_EVALUATE_PROCEDURE'
            onDeleteChild={onDeleteChild}
            fixedTitles={{
              RESPONSIBILITY_ASSIGNMENT: I18N.cbamMonitor.responsibilityAssignmentProcedure,
              PLAN_REGULAR_EVALUATION: I18N.cbamMonitor.planRegularEvaluationProcedure,
              IMPROVEMENT_REPORT_DEADLINE: I18N.cbamMonitor.improvementReportDeadlineProcedure,
            }}
          />
        </div>
      ),
    },
    {
      key: 'dataFlow',
      label: I18N.cbamMonitor.dataFlowActivities,
      children: (
        <ProcedureListSection
          name={['controlConfirmation', 'dataFlowJson', 'procedures']}
          positionOptions={positionOptions}
          numbered={false}
          fixedTitles={{ DATA_FLOW: I18N.cbamMonitor.dataFlowProcedure }}
          deleteTarget='DATA_FLOW_PROCEDURE'
          onDeleteChild={onDeleteChild}
        />
      ),
    },
    {
      key: 'controlActivity',
      label: I18N.cbamMonitor.controlActivities,
      children: (
        <div className={styles.controlGroupContent}>
          <div className={styles.controlActivityMeta}>
            <Form.Item
              name={['controlConfirmation', 'controlActivityJson', 'writtenRiskAssessmentRef']}
              label={I18N.cbamMonitor.writtenRiskAssessmentReference}
              rules={[{ max: 200 }]}
            >
              <Input maxLength={200} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item
              name={['controlConfirmation', 'controlActivityJson', 'includedInEnvironmentalManagementSystem']}
              label={I18N.cbamMonitor.includedInEnvironmentalManagementSystem}
              initialValue
            >
              <Radio.Group>
                <Radio value>{I18N.cbamMonitor.yes}</Radio>
                <Radio value={false}>{I18N.cbamMonitor.no}</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <ProcedureListSection
            name={['controlConfirmation', 'controlActivityJson', 'procedures']}
            positionOptions={positionOptions}
            deleteTarget='CONTROL_ACTIVITY_PROCEDURE'
            onDeleteChild={onDeleteChild}
            fixedTitles={{
              RISK_ASSESSMENT: I18N.cbamMonitor.riskAssessmentProcedure,
              MEASUREMENT_QUALITY_ASSURANCE: I18N.cbamMonitor.measurementQualityAssuranceProcedure,
              IT_QUALITY_ASSURANCE: I18N.cbamMonitor.itQualityAssuranceProcedure,
              INTERNAL_REVIEW: I18N.cbamMonitor.internalReviewProcedure,
              CORRECTIVE_ACTION: I18N.cbamMonitor.correctiveActionProcedure,
              OUTSOURCED_PROCESS: I18N.cbamMonitor.outsourcedProcessProcedure,
              DATA_GAP: I18N.cbamMonitor.dataGapProcedure,
              RECORD_KEEPING: I18N.cbamMonitor.recordKeepingProcedure,
            }}
          />
        </div>
      ),
    },
    {
      key: 'otherProcedure',
      label: I18N.cbamMonitor.otherProcedures,
      children: (
        <ProcedureListSection
          name={['controlConfirmation', 'otherProcedureJson', 'procedures']}
          positionOptions={positionOptions}
          addable
          numbered={false}
          deleteTarget='OTHER_PROCEDURE'
          onDeleteChild={onDeleteChild}
        />
      ),
    },
  ];
  return (
    <Collapse
      className={`${styles.goodsCollapse} ${styles.controlCollapse}`}
      defaultActiveKey='managementEvaluation'
      expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
      items={controlCollapseItems}
    />
  );
};
