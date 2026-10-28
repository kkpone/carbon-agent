/**
 * 产品核算列表 — 将核算保存为自定义模型（POST /model/copyAccount）
 */
import processAccountingIcon from '@src/assets/svg/carbonFootprint/processAccounting.svg';
import quickAccountingIcon from '@src/assets/svg/carbonFootprint/quickAccounting.svg';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { postCopyViewSubBasicInfo } from '@src/views/subModulesCommon/carbonFootprintModel/service';
import { Checkbox, Form, Input, Modal, Select } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';
import styles from '@/views/carbonFootprint3/discharge/ModelLibrary/components/ModelInfoModal/index.module.less';
import {
  LIFE_CYCLE_STAGE_OPTIONS,
  SYSTEM_BOUNDARY_DESC,
  SYSTEM_BOUNDARY_OPTIONS,
} from '@/views/carbonFootprint3/discharge/ModelLibrary/model';
import { getIndustryCategoryList } from '@/views/carbonFootprint3/discharge/ModelLibrary/service';
import { IndustryCategory } from '@/views/carbonFootprint3/discharge/ModelLibrary/type';

import { ProductAccountingList } from '../../component/ProductSelectAccount/type';
import {
  AccountLifeCycle,
  FootprintAccountLifeCycle,
  FootprintAccountStatusType,
} from '../../constant';

const { QUICK, PROCESS } = FootprintAccountStatusType;

function getDefaultScopeValue(account: ProductAccountingList): number[] {
  if (account.scopeValue) {
    return account.scopeValue
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !Number.isNaN(n));
  }
  if (account.scope === FootprintAccountLifeCycle.HALF) {
    return [
      AccountLifeCycle.MATERIAL,
      AccountLifeCycle.PRODUCT,
      AccountLifeCycle.DISTRIBUTION,
    ];
  }
  if (account.scope === FootprintAccountLifeCycle.FULL) {
    return [
      AccountLifeCycle.MATERIAL,
      AccountLifeCycle.PRODUCT,
      AccountLifeCycle.DISTRIBUTION,
      AccountLifeCycle.USE,
      AccountLifeCycle.WASTE_DISPOSAL,
    ];
  }
  return [
    AccountLifeCycle.MATERIAL,
    AccountLifeCycle.PRODUCT,
    AccountLifeCycle.DISTRIBUTION,
    AccountLifeCycle.WASTE_DISPOSAL,
  ];
}

export type SaveAsCustomModelModalProps = {
  open: boolean;
  account: ProductAccountingList | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const SaveAsCustomModelModal: React.FC<SaveAsCustomModelModalProps> = ({
  open,
  account,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<{
    modelName: string;
    industry: string;
    intro?: string;
  }>();
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
    if (!open || !account) return;
    form.setFieldsValue({
      modelName: I18N.template(I18N.carbonFootprint3.modelNameWithSuffix, {
        val1: account.accountName,
      }),
    });
  }, [open, account, form]);

  const handleOk = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const values = await form.validateFields();
      const industryName =
        industryList.find(i => i.code === values.industry)?.name || '';

      const industryJson = JSON.stringify([values.industry]);
      const scopeValueStr =
        account.scopeValue && String(account.scopeValue).trim() !== ''
          ? account.scopeValue
          : getDefaultScopeValue(account).map(String).join(',');

      const { data } = await postCopyViewSubBasicInfo({
        id: account.id,
        type: account.type,
        modelName: values.modelName,
        accountName: account.accountName,
        amount: account.amount,
        unitName: account.unitName,
        unitCode: account.unitCode,
        industry: industryJson,
        industryName,
        intro: values.intro ?? '',
        scope: account.scope,
        scopeValue: scopeValueStr,
      } as any);
      if (data.code !== 200) {
        Toast('error', data.msg);
        return;
      }
      Toast('success', I18N.carbonFootprint3.savedAsATemplate);
      onClose();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  if (!open || !account) {
    return null;
  }

  const readOnlyScopeValue = getDefaultScopeValue(account);

  return (
    <Modal
      title={I18N.carbonFootprint3.saveAsCustomModel}
      width={800}
      open
      onOk={handleOk}
      onCancel={onClose}
      okText={I18N.carbonFootprint3.okButton}
      cancelText={I18N.carbonFootprint3.cancel}
      okButtonProps={{ loading }}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='modelName'
          label={I18N.carbonFootprint.modelName}
          rules={[
            {
              required: true,
              message: I18N.carbonFootprint3.pleaseEnterModelName,
            },
          ]}
        >
          <Input maxLength={100} placeholder={I18N.carbonFootprint.modelName} />
        </Form.Item>
        <Form.Item
          name='industry'
          label={I18N.carbonFootprint3.industryCategory}
          rules={[
            {
              required: true,
              message: I18N.carbonFootprint3.pleaseSelectIndustry,
            },
          ]}
        >
          <Select
            placeholder={I18N.carbonFootprint3.industryCategory}
            options={industryList || []}
            fieldNames={{ label: 'name', value: 'code' }}
            showSearch
            optionFilterProp='name'
          />
        </Form.Item>
        <Form.Item name='intro' label={I18N.carbonFootprint.remarks}>
          <Input.TextArea
            maxLength={1000}
            rows={3}
            placeholder={I18N.carbonFootprint.remarks}
            showCount
          />
        </Form.Item>

        <Form.Item label={I18N.carbonFootprint3.accountingMethod} required>
          <div className={styles.accountTypeList}>
            <div
              className={classNames(styles.accountTypeCard, styles.disabled, {
                [styles.active]: account.type === QUICK,
              })}
            >
              <img
                className={styles.accountTypeIcon}
                src={quickAccountingIcon}
                alt=''
              />
              <span className={styles.accountTypeName}>
                {I18N.carbonFootprint3.quickAccounting}
              </span>
              {account.type === QUICK && (
                <IconAlibabaNew
                  className={styles.checkIcon}
                  type='icon-slect'
                />
              )}
            </div>
            <div
              className={classNames(styles.accountTypeCard, styles.disabled, {
                [styles.active]: account.type === PROCESS,
              })}
            >
              <img
                className={styles.accountTypeIcon}
                src={processAccountingIcon}
                alt=''
              />
              <span className={styles.accountTypeName}>
                {I18N.carbonFootprint3.processAccounting}
              </span>
              {account.type === PROCESS && (
                <IconAlibabaNew
                  className={styles.checkIcon}
                  type='icon-slect'
                />
              )}
            </div>
          </div>
        </Form.Item>

        <Form.Item label={I18N.carbonFootprint3.modelSystemBoundary} required>
          <div className={styles.boundaryGrid}>
            {SYSTEM_BOUNDARY_OPTIONS.map(item => (
              <div
                key={item.value}
                className={classNames(styles.boundaryCard, styles.disabled, {
                  [styles.active]: account.scope === item.value,
                })}
              >
                <div className={styles.boundaryTitle}>{item.label}</div>
                {SYSTEM_BOUNDARY_DESC[item.value] && (
                  <div className={styles.boundaryDesc}>
                    {SYSTEM_BOUNDARY_DESC[item.value]}
                  </div>
                )}
                {item.value === FootprintAccountLifeCycle.CUSTOM && (
                  <div className={styles.customCycleCheckbox}>
                    <Checkbox.Group
                      options={LIFE_CYCLE_STAGE_OPTIONS}
                      value={
                        account.scope === FootprintAccountLifeCycle.CUSTOM
                          ? readOnlyScopeValue
                          : []
                      }
                      disabled
                    />
                  </div>
                )}
                {account.scope === item.value && (
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

export default SaveAsCustomModelModal;
