import {
  Form,
  FormItem,
  Input,
  FormGrid,
  Select,
  Radio,
  Cascader,
  FormLayout,
  NumberPicker,
  DatePicker,
} from '@formily/antd-v5';
import { createForm, Field, onFieldChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import moment from 'moment';
import { FC, useEffect, useMemo, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';
import { ACCOUNT_WAY } from '@/views/enterpriseCarbonAccount2/AccountingSetting/constant';

import ReductionEffect from './ReductionEffect';
import styles from './index.module.less';
import {
  COST_EARN_UNIT,
  FEASIBILITY,
  FEASIBILITY_LABEL,
  MEASURES_TYPE,
  MEASURES_TYPE_LABEL,
  PARAM_TYPE,
  SIMPLE_REDUCTION_EFFECT_UNIT,
} from '../constant';
import { AccountSetting, MeasuresType } from '../type';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormGrid,
    Select,
    Radio,
    Cascader,
    FormLayout,
    NumberPicker,
    ReductionEffect,
    DatePicker,
  },
});

type CustomMeasuresDrawerProps = {
  open: boolean;
  accountSetting: AccountSetting;
  onCancel: () => void;
  onSetting: (val: Record<string, any>) => void;
  onConfirm: (measures: MeasuresType) => Promise<void>;
};

const CustomMeasuresDrawer: FC<CustomMeasuresDrawerProps> = props => {
  const { open, accountSetting, onCancel, onConfirm, onSetting } = props;

  const [loading, setLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm({
        initialValues: {
          feasibility: FEASIBILITY.HIGH,
          reduceResult: [
            {
              type: PARAM_TYPE.ABSOLUTE,
            },
          ],
        },
        effects: formIns => {
          onFieldChange('reduceResult.*.type', ['value'], field => {
            setTimeout(() => {
              formIns
                .query(`${field.parent.address.entire}.formula`)
                .take()
                ?.setComponentProps({
                  addonAfter:
                    SIMPLE_REDUCTION_EFFECT_UNIT[
                      (field as Field).value as number
                    ],
                });
            }, 50);
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const submit = async () => {
    try {
      setLoading(true);
      const val = await form.submit<
        Omit<MeasuresType, 'reduceResult' | 'cost' | 'earnings'> & {
          reduceResult: {
            scope: string[];
            type: number;
            formula: string;
            formulaString: string;
          }[];
          cost: string;
          earnings: string;
        }
      >();

      const { paramItem, reduceResult, cost = '', earnings = '' } = val;
      onConfirm({
        ...val,
        paramItem: paramItem || [],
        reduceResult: reduceResult.map(item => ({
          ...item,
          formula: [{ value: item.formula, label: item.formula }],
          formulaString: item.formula,
        })),
        cost: cost ? [{ value: cost, label: cost }] : [],
        costString: cost,
        earnings: earnings ? [{ value: earnings, label: earnings }] : [],
        earningsString: earnings,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { accountWay, yearList } = accountSetting;

    if (accountWay === ACCOUNT_WAY.FINANCIAL_YEAR) {
      ['begTime', 'endTime'].forEach(fieldKey => {
        const field = form.query(fieldKey).take();

        field?.setComponent('Select', {
          options: yearList,
        });
      });
    }
  }, [accountSetting, form]);

  return (
    <CustomDrawer
      title={I18N.enterpriseCarbonAccount2.customMeasures}
      width={704}
      open={open}
      zIndex={1001}
      footer={
        <div className={styles.footer}>
          <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
          <Button type='primary' loading={loading} onClick={submit}>
            {I18N.enterpriseCarbonAccount2.saveAndAdd}
          </Button>
          <Button
            onClick={() => {
              onSetting(form.values);
            }}
          >
            {I18N.enterpriseCarbonAccount2.advancedSetting}
          </Button>
        </div>
      }
      onClose={onCancel}
    >
      <Form form={form}>
        <SchemaField
          scope={{ useFieldUnitDictSource }}
          schema={{
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                'x-component': 'FormLayout',
                'x-component-props': {
                  layout: 'vertical',
                },
                properties: {
                  grid: {
                    type: 'void',
                    'x-component': 'FormGrid',
                    'x-component-props': {
                      maxColumns: 2,
                      columnGap: 32,
                      rowGap: 20,
                    },
                    properties: {
                      begTime: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {
                              I18N.enterpriseCarbonAccount2
                                .atTheBeginningOfThePlan
                            }
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          gridSpan: 1,
                          colon: false,
                        },
                        'x-component': 'DatePicker',
                        'x-component-props': {
                          placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
                          picker: 'year',
                        },
                      },
                      endTime: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {I18N.carbonAccount.completionTime}
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          gridSpan: 1,
                          colon: false,
                        },
                        'x-component': 'DatePicker',
                        'x-component-props': {
                          placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
                          picker: 'year',
                          minDate: moment(),
                        },
                      },
                      name: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {I18N.enterpriseCarbonAccount2.measureName}
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          gridSpan: 2,
                          colon: false,
                        },
                        'x-component': 'Input',
                        'x-component-props': {
                          placeholder:
                            I18N.enterpriseCarbonAccount2.measureName,
                          maxLength: 20,
                        },
                      },
                      measureDesc: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {I18N.carbonFootprint.describe}
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          gridSpan: 2,
                          colon: false,
                        },
                        'x-component': 'Input.TextArea',
                        'x-component-props': {
                          placeholder: I18N.carbonFootprint.describe,
                          maxLength: 200,
                        },
                      },
                      type: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {I18N.enterpriseCarbonAccount2.typeOfMeasures}
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          colon: false,
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          options: Object.values(MEASURES_TYPE).map(
                            measuresType => ({
                              value: measuresType,
                              label: MEASURES_TYPE_LABEL[measuresType],
                            }),
                          ),
                          placeholder:
                            I18N.enterpriseCarbonAccount2.typeOfMeasures,
                        },
                      },
                      feasibility: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {I18N.enterpriseCarbonAccount2.feasibility}
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          colon: false,
                        },
                        'x-component': 'Radio.Group',
                        'x-component-props': {
                          options: Object.values(FEASIBILITY).map(
                            measuresType => ({
                              value: measuresType,
                              label: FEASIBILITY_LABEL[measuresType],
                            }),
                          ),
                        },
                      },
                      reduceResult: {
                        type: 'array',
                        title: (
                          <span className={styles.baseFormLabel}>
                            <span>
                              {
                                I18N.enterpriseCarbonAccount2
                                  .expectedEmissionReduction2
                              }
                            </span>
                            <span className={styles['caption-s']}>
                              {
                                I18N.enterpriseCarbonAccount2
                                  .annualEmissionReduction2
                              }
                            </span>
                          </span>
                        ),
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          colon: false,
                          gridSpan: 2,
                        },
                        'x-component': 'ReductionEffect',
                      },
                      cost: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {I18N.enterpriseCarbonAccount2.estimatedCost}
                          </span>
                        ),
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          colon: false,
                          gridSpan: 1,
                        },
                        'x-component': 'NumberPicker',
                        'x-component-props': {
                          className: styles.numberPicker,
                          addonAfter: COST_EARN_UNIT.COST,
                          controls: false,
                          placeholder:
                            I18N.enterpriseCarbonAccount2.estimatedCost,
                          stringMode: true,
                          precision: 2,
                        },
                      },
                      earnings: {
                        title: (
                          <span className={styles.baseFormLabel}>
                            {
                              I18N.enterpriseCarbonAccount2
                                .expectedAnnualRevenue
                            }
                          </span>
                        ),
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: styles.baseFormItem,
                          colon: false,
                          gridSpan: 1,
                        },
                        'x-component': 'NumberPicker',
                        'x-component-props': {
                          className: styles.numberPicker,
                          addonAfter: COST_EARN_UNIT.EARN,
                          controls: false,
                          placeholder:
                            I18N.enterpriseCarbonAccount2.expectedAnnualRevenue,
                          stringMode: true,
                          precision: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
          }}
        />
      </Form>
    </CustomDrawer>
  );
};

export default CustomMeasuresDrawer;
