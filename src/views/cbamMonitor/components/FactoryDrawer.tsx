import { CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Cascader, Drawer, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';

import styles from '../index.module.less';
import {
  createMonitorFactory,
  getMonitorFactory,
  getMonitorOrgTree,
  MonitorOrgOption,
  updateMonitorFactory,
} from '../service';
import { FactoryOption } from '../types';

interface FactoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  factoryId?: number;
  countryOptions: Array<{ label: string; value: string }>;
}

const flattenLastValue = (value?: number[]) => value?.[value.length - 1];
const findOrgPath = (options: MonitorOrgOption[], target?: number, parent: number[] = []): number[] | undefined => {
  const matched = options.reduce<number[] | undefined>((result, option) => {
    if (result) return result;
    const path = [...parent, option.id];
    if (option.id === target) return path;
    return findOrgPath(option.children || [], target, path);
  }, undefined);
  return matched;
};

export const FactoryDrawer = ({
  open,
  onClose,
  onSaved,
  factoryId,
  countryOptions,
}: FactoryDrawerProps) => {
  const [form] = Form.useForm<FactoryOption & { orgPath?: number[] }>();
  const [orgOptions, setOrgOptions] = useState<MonitorOrgOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    form.resetFields();
    if (!factoryId) {
      form.setFieldsValue({ factoryCode: `${Date.now()}` });
    }
    getMonitorOrgTree().then(async ({ data }) => {
      if (!active) return;
      const options = data?.data || [];
      setOrgOptions(options);
      if (factoryId) {
        const detail = (await getMonitorFactory(factoryId)).data?.data;
        if (!active) return;
        form.setFieldsValue({ ...detail, orgPath: findOrgPath(options, detail?.orgId) });
      }
    });
    return () => {
      active = false;
    };
  }, [factoryId, form, open]);

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        id: factoryId,
        orgId: flattenLastValue(values.orgPath),
        factoryCode: values.factoryCode || `${Date.now()}`,
      };
      if (factoryId) await updateMonitorFactory(payload);
      else await createMonitorFactory(payload);
      message.success(factoryId ? I18N.cbamMonitor.factoryUpdated : I18N.cbamMonitor.factoryCreated);
      form.resetFields();
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      className={styles.factoryDrawer}
      width={564}
      title={factoryId ? I18N.cbamMonitor.editFactory : I18N.cbamMonitor.addFactory}
      open={open}
      closable={false}
      destroyOnClose
      onClose={onClose}
      extra={(
        <button
          type='button'
          aria-label={I18N.cbamMonitor.close}
          className={styles.factoryDrawerClose}
          onClick={onClose}
        >
          <CloseOutlined />
        </button>
      )}
      footer={
        <div className={styles.drawerFooter}>
          <Button onClick={onClose}>{I18N.cbamMonitor.cancel}</Button>
          <Button type='primary' loading={saving} onClick={submit}>
            {I18N.cbamMonitor.confirm}
          </Button>
        </div>
      }
    >
      <Form form={form} layout='vertical' requiredMark>
        <div className={styles.drawerSectionTitle}>{I18N.cbamMonitor.relatedInformation}</div>
        <Form.Item name='orgPath' label={I18N.cbamMonitor.relatedEntity}>
          <Cascader
            className={styles.factoryOrgCascader}
            popupClassName={styles.factoryOrgCascaderPopup}
            fieldNames={{ label: 'name', value: 'id' }}
            options={orgOptions}
          />
        </Form.Item>
        <div className={styles.drawerSectionTitle}>{I18N.cbamMonitor.factoryIdentificationAndAddress}</div>
        <div className={styles.drawerGrid}>
          <Form.Item name='factorName' label={I18N.cbamMonitor.factoryName} rules={[{ required: true, max: 40 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='factoryCode' label={I18N.cbamMonitor.uniqueIdentifier} rules={[{ required: true, max: 40 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='locationCode' label={I18N.cbamMonitor.locationCode} rules={[{ required: true, max: 20 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='postalCode' label={I18N.cbamMonitor.postalCode} rules={[{ required: true, max: 40 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='country' label={I18N.cbamMonitor.country} rules={[{ required: true, max: 40 }]}>
            <Select
              allowClear
              showSearch
              optionFilterProp='label'
              options={countryOptions}
              placeholder={I18N.carbonFootprint.pleaseSelect}
            />
          </Form.Item>
          <Form.Item name='city' label={I18N.cbamMonitor.city} rules={[{ required: true, max: 40 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='detailedAddress' label={I18N.cbamMonitor.chineseAddress} rules={[{ required: true, max: 200 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='addressEn' label={I18N.cbamMonitor.englishAddress} rules={[{ required: true, max: 200 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='longitude' label={I18N.cbamMonitor.longitude} rules={[{ required: true, max: 10 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='latitude' label={I18N.cbamMonitor.latitude} rules={[{ required: true, max: 10 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
          <Form.Item name='ePrtrCode' label={I18N.cbamMonitor.ePrtrIdentifier} rules={[{ max: 40 }]}>
            <Input placeholder={I18N.cbamMonitor.enter} />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};
