import {
  FormItem,
  Input,
  FormGrid,
  Select,
  Radio,
  ArrayTable,
  Cascader,
  FormLayout,
  NumberPicker,
  Form,
  DatePicker,
} from '@formily/antd-v5';
import {
  createForm,
  onFieldChange,
  Field,
  Form as FormType,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import { pick } from 'lodash-es';
import moment from 'moment';
import { FC, useState, useMemo, useEffect } from 'react';

import FormulaInput, {
  INPUT_CHAR_PREFIX,
  PARAM_CHART_SIGN,
} from '@/components/FormulaInput';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';
import { nanoid } from '@/utils';
import { ACCOUNT_WAY } from '@/views/enterpriseCarbonAccount2/AccountingSetting/constant';

import ParamAdd from './ParamAdd';
import ParamRemove from './ParamRemove';
import ReductionEffect from './ReductionEffect';
import styles from './index.module.less';
import {
  COST_EARN_UNIT,
  FEASIBILITY,
  FEASIBILITY_LABEL,
  MEASURES_TYPE,
  MEASURES_TYPE_LABEL,
  PARAM_TYPE,
  PARAM_TYPE_LABEL,
  REDUCTION_EFFECT_UNIT,
} from '../constant';
import { MeasuresType, AccountSetting } from '../type';
import { formulaValidator } from '../utils';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormGrid,
    Select,
    Radio,
    ArrayTable,
    Cascader,
    FormLayout,
    ParamRemove,
    ParamAdd,
    ReductionEffect,
    FormulaInput,
    NumberPicker,
    DatePicker,
    PercentUnit: () => <div>%</div>,
  },
});

const Measures: FC<{ form: FormType; accountSetting: AccountSetting }> = ({
  form,
  accountSetting,
}) => {
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
    <div>
      <Form form={form} previewTextPlaceholder='-'>
        <div className={styles.formBlock}>
          <div className={styles.formBlockTitle}>
            {I18N.carbonFootprint.basicInformation}
          </div>
          <SchemaField
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
                            placeholder:
                              I18N.DomesticVersion.pleaseSelectTheYear,
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
                            placeholder:
                              I18N.DomesticVersion.pleaseSelectTheYear,
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
                            maxLength: 500,
                            showCount: true,
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
                      },
                    },
                  },
                },
              },
            }}
          />
        </div>
        <div className={styles.formBlock}>
          <div className={styles.formBlockTitle}>
            {I18N.enterpriseCarbonAccount2.parameterItems}
          </div>
          <SchemaField
            scope={{ useFieldUnitDictSource }}
            schema={{
              type: 'object',
              properties: {
                paramItem: {
                  type: 'array',
                  'x-component': 'ArrayTable',
                  'x-component-props': {
                    pagination: false,
                    className: styles.paramItemTable,
                  },
                  items: {
                    type: 'object',
                    properties: {
                      nameColumn: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          width: 344,
                          title: I18N.emission.parameterName,
                        },
                        properties: {
                          name: {
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'Input',
                            'x-component-props': {
                              placeholder: I18N.emission.parameterName,
                              maxLength: 20,
                            },
                            'x-validator': (
                              paramName: string,
                              _: { message: string },
                              { field }: { field: Field },
                            ) => {
                              const { index } = field;
                              const paramItem =
                                (form.values as MeasuresType).paramItem || [];
                              if (
                                paramItem
                                  .filter((param, idx) => idx !== index)
                                  .some(param => param.name === paramName)
                              ) {
                                return I18N.enterpriseCarbonAccount2
                                  .parameterNameIsIncorrect;
                              }
                              return '';
                            },
                          },
                        },
                      },
                      typeColumn: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          width: 216,
                          title: I18N.enterpriseCarbonAccount2.parameterType,
                        },
                        properties: {
                          type: {
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'Radio.Group',
                            'x-component-props': {
                              options: Object.values(PARAM_TYPE).map(
                                paramType => ({
                                  value: paramType,
                                  label: PARAM_TYPE_LABEL[paramType],
                                }),
                              ),
                            },
                          },
                        },
                      },
                      defaultValueColumn: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          width: 152,
                          title: I18N.carbonFootprint.quantity,
                        },
                        properties: {
                          defaultValue: {
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'NumberPicker',
                            'x-component-props': {
                              className: styles.defaultValueInput,
                              placeholder: I18N.carbonFootprint.quantity,
                              controls: false,
                              precision: 2,
                            },
                          },
                        },
                      },
                      unitColumn: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          width: 152,
                          title: I18N.carbonFootprint.unit,
                        },
                        properties: {
                          unit: {
                            type: 'string',
                            'x-reactions': [
                              {
                                dependencies: ['.type'],
                                when: `{{$deps[0] == ${PARAM_TYPE.ABSOLUTE} }}`,
                                fulfill: {
                                  schema: {
                                    required: true,
                                    'x-decorator': 'FormItem',
                                    'x-component': 'Input',
                                    'x-component-props': {
                                      placeholder: I18N.carbonFootprint.unit,
                                    },
                                  },
                                },
                                otherwise: {
                                  schema: {
                                    required: false,
                                    'x-component': 'PercentUnit',
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                      deleteColumn: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          width: 72,
                          title: I18N.carbonFootprint.operation,
                          align: 'center',
                        },
                        properties: {
                          remove: {
                            type: 'void',
                            'x-component': 'ParamRemove',
                          },
                        },
                      },
                    },
                  },
                },
                paramAdd: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ParamAdd',
                },
              },
            }}
          />
        </div>
        <div className={styles.formBlock}>
          <div className={styles.formBlockTitle}>
            {I18N.enterpriseCarbonAccount2.emissionReductionEffect}
            <span className={styles['caption-s']}>
              {I18N.enterpriseCarbonAccount2.annualEmissionReduction2}
            </span>
          </div>
          <SchemaField
            schema={{
              type: 'object',
              properties: {
                reduceResult: {
                  type: 'array',
                  'x-decorator': 'FormItem',
                  'x-component': 'ReductionEffect',
                },
              },
            }}
          />
        </div>
        <div className={styles.formBlock}>
          <div className={styles.formBlockTitle}>
            {I18N.enterpriseCarbonAccount2.costBenefit}
          </div>
          <div className={styles.costFormContent}>
            <SchemaField
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
                        'x-component': 'FormGird',
                        'x-component-props': {
                          rowGap: 20,
                          maxColumns: 2,
                        },
                        properties: {
                          cost: {
                            title: (
                              <span className={styles.baseFormLabel}>
                                {I18N.enterpriseCarbonAccount2.costFormula}
                              </span>
                            ),
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: styles.baseFormItem,
                              colon: false,
                              gridSpan: 2,
                            },
                            'x-component': 'FormulaInput',
                            'x-component-props': {
                              unitText: COST_EARN_UNIT.COST,
                              placeholder:
                                I18N.enterpriseCarbonAccount2.costFormula,
                              optionFieldNames: {
                                value: 'id',
                                label: 'name',
                              },
                            },
                            'x-validator': [formulaValidator],
                          },
                          earnings: {
                            title: (
                              <span className={styles.baseFormLabel}>
                                {I18N.enterpriseCarbonAccount2.annualIncome}
                              </span>
                            ),
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: styles.baseFormItem,
                              colon: false,
                              gridSpan: 2,
                            },
                            'x-component': 'FormulaInput',
                            'x-component-props': {
                              unitText: COST_EARN_UNIT.EARN,
                              placeholder:
                                I18N.enterpriseCarbonAccount2.annualIncome,
                              optionFieldNames: {
                                value: 'id',
                                label: 'name',
                              },
                            },
                            'x-validator': [formulaValidator],
                          },
                        },
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

type MeasuresProps = {
  open: boolean;
  defaultMeasuresVal: Record<string, any>;
  accountSetting: AccountSetting;
  onCancel: () => void;
  onConfirm: (val: MeasuresType) => void | Promise<void>;
};

const MeasuresModal: FC<MeasuresProps> = ({
  open,
  defaultMeasuresVal,
  accountSetting,
  onConfirm,
  onCancel,
}) => {
  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        initialValues: {
          ...pick(defaultMeasuresVal, [
            'begTime',
            'endTime',
            'name',
            'measureDesc',
            'type',
            'feasibility',
          ]),
          paramItem: [
            {
              id: nanoid(),
              name: I18N.enterpriseCarbonAccount2.defaultParameters,
              type: PARAM_TYPE.ABSOLUTE,
            },
          ],
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
                  unitText:
                    REDUCTION_EFFECT_UNIT[(field as Field).value as number],
                });
            }, 50);
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, defaultMeasuresVal],
  );

  const [confirmLoading, setConfirmLoading] = useState(false);

  const submit = async () => {
    try {
      setConfirmLoading(true);
      const val = await form.submit<MeasuresType>();
      const { paramItem } = val;

      const formulaToString = (
        formula: { label: string; value: string }[] = [],
      ) =>
        formula
          .map(({ label, value }) =>
            value.startsWith(INPUT_CHAR_PREFIX)
              ? label
              : value.split(PARAM_CHART_SIGN)[0],
          )
          .join('');

      const transformFormula = (
        formula: { value: string; label: string }[] = [],
      ) =>
        formula.map(item => {
          const value = item.value.split(PARAM_CHART_SIGN)[0];
          return {
            value,
            label:
              paramItem.find(param => param.id === value)?.name || item.label,
          };
        });
      await onConfirm({
        ...val,
        reduceResult: (val.reduceResult || []).map(reduceItem => ({
          ...reduceItem,
          formula: transformFormula(reduceItem.formula),
          formulaString: formulaToString(reduceItem.formula),
        })),
        cost: transformFormula(val.cost),
        costString: formulaToString(val.cost),
        earnings: transformFormula(val.earnings),
        earningsString: formulaToString(val.earnings),
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      className={styles.measuresModal}
      title={I18N.enterpriseCarbonAccount2.advancedSetting}
      width={896}
      open={open}
      zIndex={1001}
      destroyOnClose
      footer={
        <>
          <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
          <Button type='primary' loading={confirmLoading} onClick={submit}>
            {I18N.carbonFootprint.confirm}
          </Button>
        </>
      }
      onClose={onCancel}
      onCancel={onCancel}
    >
      <Measures form={form} accountSetting={accountSetting} />
    </Modal>
  );
};

export default MeasuresModal;
