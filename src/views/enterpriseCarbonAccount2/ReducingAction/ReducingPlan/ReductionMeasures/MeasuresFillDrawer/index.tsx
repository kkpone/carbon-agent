/* eslint-disable react/no-array-index-key */
import {
  Form,
  FormItem,
  NumberPicker,
  DatePicker,
  FormGrid,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { Field, VoidField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { isNil } from 'lodash-es';
import moment from 'moment';
import { FC, useEffect, useMemo, useState } from 'react';

import { useScope, useUnit } from '@/hooks/useScope';
import { ACCOUNT_WAY } from '@/views/enterpriseCarbonAccount2/AccountingSetting/constant';

import styles from './index.module.less';
import {
  COST_EARN_UNIT,
  FEASIBILITY_LABEL,
  MEASURES_TYPE_LABEL,
  PARAM_TYPE,
  REDUCTION_EFFECT_UNIT,
} from '../constant';
import { getMeasures } from '../service';
import { MeasuresType, AccountSetting } from '../type';
import { findCascadeValue } from '../utils';

type MeasuresFillDrawerProps = {
  accountSetting: AccountSetting;
  id?: number;
  confirmText?: string;
  category?: string;
  readPretty?: boolean;
  onCancel: () => void;
  onConfirm: (val: {
    id: number;
    [P: string]: string | number | undefined;
  }) => Promise<void> | void;
};

const MeasuresFillDrawer: FC<MeasuresFillDrawerProps> = ({
  id,
  confirmText,
  readPretty,
  category,
  accountSetting,
  onCancel,
  onConfirm,
}) => {
  const [measures, setMeasures] = useState<MeasuresType | null>(null);

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const unitDict = useUnit();

  const scopeDict = useScope();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const form = useMemo(() => createForm({ readPretty }), [id, readPretty]);

  const submit = async () => {
    try {
      setSubmitLoading(true);
      const val = await form.submit<{ [P: string]: string | number }>();
      if (!isNil(id)) {
        await onConfirm({ ...val, id, category });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (!isNil(id)) {
      setLoading(true);
      getMeasures({ id, category })
        .then(({ data }) => {
          setMeasures(data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id, category]);

  useEffect(() => {
    if (measures) {
      form.setValues({
        begTime: measures.begTime,
        endTime: measures.endTime,
      });
      (measures.paramItem || []).forEach(param => {
        const field = form.query(param.id).take();

        if (param.type === PARAM_TYPE.ABSOLUTE) {
          field?.setComponentProps({
            addonAfter: param.unit,
          });
        } else {
          field?.setComponentProps({
            addonAfter: '%',
          });
        }
        form.setValuesIn(param.id, param.defaultValue);
      });
    }
  }, [form, unitDict, measures]);

  return (
    <Drawer
      className={styles.drawer}
      closeIcon={null}
      width={768}
      open={!isNil(id)}
      zIndex={1001}
      loading={loading}
      destroyOnClose
      footer={
        <div className={styles.drawerFooter}>
          <Button onClick={onCancel}>
            {readPretty
              ? I18N.carbonFootprint3.close
              : I18N.carbonFootprint.cancel}
          </Button>
          {!readPretty && (
            <Button type='primary' loading={submitLoading} onClick={submit}>
              {confirmText || I18N.enterpriseCarbonAccount2.saveAndAdd}
            </Button>
          )}
        </div>
      }
      onClose={onCancel}
    >
      <div className={styles.content}>
        <div className={styles.measuresPlan}>
          <div className={styles.measuresPlanTitle}>
            {I18N.enterpriseCarbonAccount2.actionPlan}
          </div>
          <Form form={form} layout='vertical'>
            <VoidField
              name='grid'
              component={[FormGrid, { rowGap: 20, maxColumns: 1 }]}
            >
              <Field
                name='begTime'
                title={
                  <span className={styles.baseFormLabel}>
                    {I18N.enterpriseCarbonAccount2.atTheBeginningOfThePlan}
                  </span>
                }
                required
                decorator={[
                  FormItem,
                  { colon: false, className: styles.baseFormItem },
                ]}
                component={[
                  accountSetting.accountWay === ACCOUNT_WAY.FINANCIAL_YEAR
                    ? Select
                    : DatePicker,
                  {
                    placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
                    picker: 'year',
                    options: accountSetting.yearList,
                  },
                ]}
              />
              <Field
                name='endTime'
                title={
                  <span className={styles.baseFormLabel}>
                    {I18N.carbonAccount.completionTime}
                  </span>
                }
                required
                decorator={[
                  FormItem,
                  { colon: false, className: styles.baseFormItem },
                ]}
                component={[
                  accountSetting.accountWay === ACCOUNT_WAY.FINANCIAL_YEAR
                    ? Select
                    : DatePicker,
                  {
                    placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
                    picker: 'year',
                    minDate: moment(),
                    options: accountSetting.yearList,
                  },
                ]}
              />
              {(measures?.paramItem || []).map(param => (
                <Field
                  key={param.id}
                  name={param.id}
                  title={
                    <span className={styles.baseFormLabel} title={param.name}>
                      {param.name}
                    </span>
                  }
                  required
                  decorator={[
                    FormItem,
                    { colon: false, className: styles.baseFormItem },
                  ]}
                  component={[
                    NumberPicker,
                    {
                      className: styles.numberPicker,
                      placeholder: I18N.carbonFootprint.pleaseEnter,
                      precision: 2,
                      controls: false,
                      stringMode: true,
                    },
                  ]}
                />
              ))}
            </VoidField>
          </Form>
        </div>
        {measures && (
          <div className={styles.measuresInfo}>
            <div className={styles.measuresInfoTitle}>
              {I18N.enterpriseCarbonAccount2.detailsOfMeasures}
            </div>
            <div className={styles.infoContent}>
              <div>
                <div className={styles.infoSecondaryTitle}>
                  {I18N.carbonFootprint.basicInformation}
                </div>
                <div className={styles.basicInfoItem}>
                  <div className={styles.basicInfoLabel}>
                    {I18N.enterpriseCarbonAccount2.measureName}
                  </div>
                  <div className={styles.basicInfoValue}>{measures.name}</div>
                </div>
                <div className={styles.basicInfoItem}>
                  <div className={styles.basicInfoLabel}>
                    {I18N.enterpriseCarbonAccount2.typeOfMeasures}
                  </div>
                  <div className={styles.typeTag}>
                    {MEASURES_TYPE_LABEL[measures.type]}
                  </div>
                </div>
                <div className={styles.basicInfoItem}>
                  <div className={styles.basicInfoLabel}>
                    {I18N.enterpriseCarbonAccount2.feasibility}
                  </div>
                  <div className={styles.basicInfoValue}>
                    {FEASIBILITY_LABEL[measures.feasibility]}
                  </div>
                </div>
                <div className={styles.basicInfoItem}>
                  <div className={styles.basicInfoLabel}>
                    {I18N.enterpriseCarbonAccount2.descriptionOfMeasures}
                  </div>
                  <div className={styles.basicInfoValue}>
                    {measures.measureDesc}
                  </div>
                </div>
              </div>

              {/* 措施内容 */}
              {measures.paramItem?.length > 0 && (
                <div>
                  <div className={styles.infoSecondaryTitle}>
                    {I18N.enterpriseCarbonAccount2.measuresContent}
                  </div>
                  {measures.paramItem.map(param => (
                    // const [, unit] = findCascadeValue(unitDict, param.unit);
                    <div className={styles.paramInfoItem} key={param.id}>
                      <div className={styles.basicInfoLabel}>{param.name}</div>
                      <div className={styles.basicInfoLabel}>
                        {I18N.components.unit}
                        {param.type === PARAM_TYPE.ABSOLUTE ? param.unit : '%'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 减排效果 */}
              <div>
                <div className={styles.infoSecondaryTitle}>
                  {
                    I18N.enterpriseCarbonAccount2
                      .theEmissionReductionEffectIsAverage
                  }
                </div>
                {(measures.reduceResult || []).map((reduction, index) => {
                  const [scopeCategory, scopeClassify] = findCascadeValue(
                    scopeDict,
                    reduction.scope,
                    {
                      value: 'value',
                      label: 'name',
                      children: 'classifyList',
                    },
                  );
                  const unit = REDUCTION_EFFECT_UNIT[reduction.type];

                  return (
                    <div key={index} className={styles.scopeInfoItem}>
                      <div className={styles.scopeInfo}>
                        <div className={styles.scopeName}>
                          {scopeCategory?.name}/{scopeClassify?.name}
                        </div>
                        <div className={styles.reductionUnit}>
                          {I18N.components.unit}
                          {unit}
                        </div>
                      </div>
                      <div className={styles.reductionFormula}>
                        {reduction.formula.map(({ label }) => label).join('')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 成本收益 */}
              <div>
                <div className={styles.infoSecondaryTitle}>
                  {I18N.enterpriseCarbonAccount2.costBenefitBalance}
                </div>
                <div className={styles.scopeInfoItem}>
                  <div className={styles.scopeInfo}>
                    <div className={styles.scopeName}>
                      {I18N.enterpriseCarbonAccount2.costOfMeasures}
                    </div>
                    <div className={styles.reductionUnit}>
                      {I18N.components.unit}
                      {COST_EARN_UNIT.COST}
                    </div>
                  </div>
                  <div className={styles.reductionFormula}>
                    {(measures.cost || []).map(({ label }) => label).join('') ||
                      '-'}
                  </div>
                </div>
                <div className={styles.scopeInfoItem}>
                  <div className={styles.scopeInfo}>
                    <div className={styles.scopeName}>
                      {I18N.enterpriseCarbonAccount2.annualIncome}
                    </div>
                    <div className={styles.reductionUnit}>
                      {I18N.components.unit}
                      {COST_EARN_UNIT.EARN}
                    </div>
                  </div>
                  <div className={styles.reductionFormula}>
                    {(measures.earnings || [])
                      .map(({ label }) => label)
                      .join('') || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default MeasuresFillDrawer;
