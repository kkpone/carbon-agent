import { IconAlibaba, IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Checkbox, Form, Input, Modal, Select } from 'antd';
import classNames from 'classnames';
import { isArray } from 'lodash';
import { useEffect, useState } from 'react';

import {
  AccountLifeCycle,
  FootprintAccountStatusType,
} from '@/views/carbonFootprint3/FootprintAccount/constant';

import styles from './index.module.less';
import {
  LIFE_CYCLE_STAGE_OPTIONS,
  SYSTEM_BOUNDARY_DESC,
  SYSTEM_BOUNDARY_OPTIONS,
} from '../../model';
import { getIndustryCategoryList } from '../../service';
import {
  ModelForm,
  ModelItem,
  IndustryCategory,
  ModelSourceEnum,
  SystemBoundaryEnum,
} from '../../type';

interface ModelInfoModalProps {
  open: boolean;
  model?: ModelItem;
  isCopy?: boolean;
  onOk: (values: Record<string, any>) => void | Promise<void>;
  onCancel: () => void;
}

const ModelInfoModal: React.FC<ModelInfoModalProps> = ({
  open,
  model,
  isCopy,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm<ModelForm>();
  const isSystem = model?.source === ModelSourceEnum.SYSTEM;
  const disabled = isSystem && !isCopy;
  const scope = Form.useWatch('scope', form);
  const scopeValue = Form.useWatch('scopeValue', form);
  const [loading, setLoading] = useState(false);
  const [industryList, setIndustryList] = useState<IndustryCategory[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getIndustryCategoryList();
        if (!cancelled) {
          setIndustryList(res.data.data || []);
        }
      } catch {
        if (!cancelled) setIndustryList([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open && model) {
      const nameWithCopySuffix = isCopy
        ? `${model.modelName}${I18N.carbonFootprint3.modelCopyNameSuffix}`.slice(
            0,
            100,
          )
        : model.modelName;
      form.setFieldsValue({
        modelName: nameWithCopySuffix,
        industry: isArray(JSON.parse(model.industry)[0])
          ? [JSON.parse(model.industry)?.[0]?.[0]]
          : [JSON.parse(model.industry)?.[0]],
        intro: model.intro,
        scope: model.scope,
        scopeValue: model.scopeValue.split(',').map(Number),
      });
    }
  }, [open, model, isCopy, form]);

  const handleOk = async () => {
    if (disabled) {
      onCancel();
      return;
    }
    setLoading(true);
    try {
      const values = await form.validateFields();
      await onOk({
        ...values,
        industry: isArray(values.industry)
          ? JSON.stringify(values.industry)
          : JSON.stringify([values.industry]),
        scopeValue: values.scopeValue.join(','),
        // 默认给快速核算类型
        type: FootprintAccountStatusType.QUICK,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        isCopy
          ? I18N.router.copyModel
          : model
          ? I18N.productDigitalPassport.editModel
          : I18N.productDigitalPassport.addNewModel
      }
      width={800}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={
        disabled ? I18N.carbonFootprint3.close : I18N.carbonFootprint.confirm2
      }
      okButtonProps={{ loading }}
      cancelButtonProps={{ style: disabled ? { display: 'none' } : undefined }}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        layout='vertical'
        preserve={false}
        initialValues={{
          scope: SystemBoundaryEnum.HALF,
          scopeValue: [
            AccountLifeCycle.MATERIAL,
            AccountLifeCycle.PRODUCT,
            AccountLifeCycle.DISTRIBUTION,
          ],
        }}
      >
        <Form.Item
          name='modelName'
          label={I18N.carbonFootprint.modelName}
          rules={[
            {
              required: !disabled,
              message: I18N.carbonFootprint3.pleaseEnterModelName,
            },
          ]}
        >
          <Input
            maxLength={100}
            placeholder={I18N.carbonFootprint3.pleaseEnterModelName}
            disabled={disabled}
          />
        </Form.Item>
        <Form.Item
          name='industry'
          label={I18N.carbonFootprint3.industryCategory}
          rules={[
            {
              required: !disabled,
              message: I18N.carbonFootprint3.pleaseSelectIndustry,
            },
          ]}
        >
          <Select
            placeholder={I18N.carbonFootprint3.pleaseSelectIndustry}
            disabled={disabled}
            options={industryList || []}
            fieldNames={{ label: 'name', value: 'code' }}
          />
        </Form.Item>
        <Form.Item name='intro' label={I18N.carbonFootprint.remarks}>
          <Input.TextArea
            maxLength={1000}
            rows={3}
            placeholder={I18N.eca.pleaseEnterANote}
            showCount
            disabled={disabled}
          />
        </Form.Item>

        {/* 核算方式 - 仅快速核算 */}
        <Form.Item label={I18N.carbonFootprint3.accountingMethod}>
          <div className={styles.accountTypeList}>
            <div className={classNames(styles.accountTypeCard, styles.active)}>
              <IconAlibaba
                className={styles.accountTypeIcon}
                type='icon-icon_kuaisu'
              />
              <span className={styles.accountTypeName}>
                {I18N.carbonFootprint3.quickAccounting}
              </span>
              <IconAlibabaNew className={styles.checkIcon} type='icon-slect' />
            </div>
          </div>
        </Form.Item>

        {/* 系统边界 - 卡片选择 */}
        <Form.Item name='scope' hidden />
        <Form.Item name='scopeValue' noStyle hidden />
        <Form.Item label={I18N.carbonFootprint.systemBoundary} required>
          <div className={styles.boundaryGrid}>
            {SYSTEM_BOUNDARY_OPTIONS.map(item => (
              <div
                key={item.value}
                className={classNames(styles.boundaryCard, {
                  [styles.active]: scope === item.value,
                  [styles.disabled]: disabled || isCopy,
                })}
                onClick={() => {
                  if (!disabled && !isCopy) {
                    form.setFieldValue('scope', item.value);
                    if (item.value === SystemBoundaryEnum.HALF) {
                      form.setFieldValue('scopeValue', [
                        AccountLifeCycle.MATERIAL,
                        AccountLifeCycle.PRODUCT,
                        AccountLifeCycle.DISTRIBUTION,
                      ]);
                    } else if (item.value === SystemBoundaryEnum.FULL) {
                      form.setFieldValue('scopeValue', [
                        AccountLifeCycle.MATERIAL,
                        AccountLifeCycle.PRODUCT,
                        AccountLifeCycle.DISTRIBUTION,
                        AccountLifeCycle.USE,
                        AccountLifeCycle.WASTE_DISPOSAL,
                      ]);
                    }
                  }
                }}
              >
                <div className={styles.boundaryTitle}>{item.label}</div>
                {SYSTEM_BOUNDARY_DESC[item.value] && (
                  <div className={styles.boundaryDesc}>
                    {SYSTEM_BOUNDARY_DESC[item.value]}
                  </div>
                )}
                {item.value === SystemBoundaryEnum.CUSTOM && (
                  <div className={styles.customCycleCheckbox}>
                    <Checkbox.Group
                      options={LIFE_CYCLE_STAGE_OPTIONS}
                      value={
                        scope === SystemBoundaryEnum.CUSTOM ? scopeValue : []
                      }
                      disabled={disabled || isCopy}
                      onChange={val => {
                        form.setFieldValue('scopeValue', val);
                      }}
                    />
                  </div>
                )}
                {scope === item.value && (
                  <IconAlibabaNew
                    className={styles.checkIcon}
                    type='icon-slect'
                  />
                )}
              </div>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelInfoModal;
