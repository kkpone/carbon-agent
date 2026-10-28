import { MinusOutlined } from '@ant-design/icons';
import {
  ArrayTable,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
  Switch,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  Form,
  onFieldValidateStart,
  onFieldValueChange,
  onFormValuesChange,
} from '@formily/core';
import { createSchemaField, ISchema, useForm } from '@formily/react';
import I18N from '@src/lang/I18N';
import { cloneDeep } from 'lodash-es';
import { FC, memo, useEffect, useMemo, useRef } from 'react';

import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import FormilyTableFactor from '@/components/FormilyUtil/FormilyTableFactor';
import { selectSchema } from '@/components/FormilyUtil/util';
import { MODEL_EMISSION_MATCH_WAY } from '@/views/carbonFootprint3/BusinessAccountingModel/constant';
import { postAutoMatchFactor } from '@/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';
import {
  transportTypeEnum,
  useFieldDataSourceReaction,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import FormAiDataName from './FormAiDataName';
import style from './expandForm.module.less';
import { Remove } from './remove';
import { FormilyTableIndex } from '../FormilyTableIndex';

const { FACTOR, FACTOR_CREATE } = MODEL_EMISSION_MATCH_WAY;

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    Input,
    Select,
    FormItem,
    FormLayout,
    FormGrid,
    DatePicker,
    ArrayTable,
    NumberPicker,
    // Text,
    // FormAiDataAmount,
    // FormAiDataName,
    FormAiDataName,
    Switch,
    FormilyTableFactor,
    FormilyTableIndex,
    Remove,
  },
});

interface IExpandFormProps {
  index: number;
  record?: unknown;
  factorSourceRange?: {
    enableFactorSourceRange?: boolean;
    factorPrefId?: number | string;
  };
}

const aiDataSchema = (
  factorSourceRange?: IExpandFormProps['factorSourceRange'],
): ISchema => ({
  type: 'object',
  properties: {
    accountEmissionTransportList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-component-props': {
        pagination: false,
      },
      items: {
        type: 'object',
        properties: {
          col4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '',
              width: 60,
            },
            properties: {
              item: {
                type: 'void',
                'x-component': 'FormItem',
                properties: {
                  remove: {
                    type: 'void',
                    'x-component': 'Remove',
                    'x-component-props': {
                      icon: <MinusOutlined />,
                      style: {
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    },
                  },
                },
              },
            },
          },
          col9: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      color: '#ff4d4f',
                      marginRight: 4,
                    }}
                  >
                    *
                  </span>
                  <span>{I18N.carbonFootprint3.roadSectionName}</span>
                </div>
              ),
              width: 150,
            },
            required: true,
            properties: {
              name: {
                // ...selectSchema('', true, {}, true),
                type: 'string',
                'x-component': 'FormilyTableIndex',
                'x-component-props': {
                  placeholder: I18N.carbonFootprint3.pleaseEnterTheRoadSection,
                },
                // enum: typeEnum,
              },
            },
          },
          col1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      color: '#ff4d4f',
                      marginRight: 4,
                    }}
                  >
                    *
                  </span>
                  <span>{I18N.carbonFootprint3.typeOfShipping}</span>
                </div>
              ),
              width: 150,
            },
            required: true,
            properties: {
              transportType: {
                ...selectSchema(
                  '',
                  true,
                  {
                    placeholder:
                      I18N.carbonFootprint3.pleaseChooseTransportation2,
                  },
                  true,
                ),
                enum: transportTypeEnum(),
              },
            },
          },
          col2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* <span
                    style={{
                      color: '#ff4d4f',
                      marginRight: 4,
                    }}
                  >
                    *
                  </span> */}
                  <span>{I18N.carbonFootprint3.weightOfGoods}</span>
                </div>
              ),
              width: 200,
            },
            properties: {
              amount: {
                type: 'number',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  // precision: 2,
                  placeholder: I18N.carbonFootprint3.pleaseEnterTheGoods,
                  min: 0.000001,
                },
                'x-decorator': 'FormItem',
                // required: true,
                'x-reactions': {
                  dependencies: ['..[].way', '..[].transportType'],
                  when: '{{($deps[0] === 2 || $deps[0] === 3) && $deps[1] === 1}}', // 运输
                  fulfill: {
                    schema: {
                      'x-hidden': true,
                      'x-component-props': {
                        disabled: true,
                      },
                    },
                  },
                  otherwise: {
                    schema: {
                      'x-hidden': false,
                      'x-component-props': {
                        disabled: false,
                      },
                    },
                  },
                },
              },
              way: {
                type: 'number',
              },
            },
          },
          col7: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* <span
                    style={{
                      color: '#ff4d4f',
                      marginRight: 4,
                    }}
                  >
                    *
                  </span> */}
                  <span>{I18N.carbonFootprint3.goodsWeightList}</span>
                </div>
              ),
              width: 200,
            },
            properties: {
              unitCode: {
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-component-props': {
                  placeholder: I18N.carbonFootprint.pleaseSelectAUnit,
                },
                // required: true,
                'x-reactions': [
                  '{{useFieldDataSourceReaction("trans_enum")}}',
                  {
                    dependencies: ['..[].way', '..[].transportType'],
                    when: '{{($deps[0] === 2 || $deps[0] === 3) && $deps[1] === 1}}', // 运输
                    fulfill: {
                      schema: {
                        'x-hidden': true,
                        'x-component-props': {
                          disabled: true,
                        },
                      },
                    },
                    otherwise: {
                      schema: {
                        'x-hidden': false,
                        'x-component-props': {
                          disabled: false,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
          col11: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* <span
                    style={{
                      color: '#ff4d4f',
                      marginRight: 4,
                    }}
                  >
                    *
                  </span> */}
                  <span>{I18N.carbonFootprint3.transportationDistance}</span>
                </div>
              ),
              width: 200,
            },
            properties: {
              distance: {
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.carbonFootprint3.pleaseEnterTransportation2,
                  addonAfter: 'km',
                  min: 0.000001,
                },
                // required: true,
                'x-reactions': {
                  dependencies: ['..[].way', '..[].transportType'],
                  when: '{{($deps[0] === 2 || $deps[0] === 3) && $deps[1] === 1}}', // 运输
                  fulfill: {
                    schema: {
                      'x-hidden': true,
                      'x-component-props': {
                        disabled: true,
                      },
                    },
                  },
                  otherwise: {
                    schema: {
                      'x-hidden': false,
                      'x-component-props': {
                        disabled: false,
                      },
                    },
                  },
                },
              },
            },
          },

          col3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* <span
                    style={{
                      color: '#ff4d4f',
                      marginRight: 4,
                    }}
                  >
                    *
                  </span> */}
                  <span>{I18N.carbonFootprint3.transportationFactor}</span>
                </div>
              ),
              width: '260px',
            },
            properties: {
              factorObj: {
                type: 'object',
                'x-component': 'FormilyTableFactor',
                'x-component-props': {
                  autoFactorName: false,
                  isTransport: true,
                  enableFactorSourceRange:
                    factorSourceRange?.enableFactorSourceRange,
                  factorPrefId: factorSourceRange?.factorPrefId,
                },
                'x-decorator': 'FormItem',
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          'x-component': 'ArrayTable.Addition',
          'x-component-props': {
            style: {
              border: 'none',
              display: 'flex',
              justifyContent: 'flex-start',
              padding: '0 0 0 12px',
            },
          },

          title: '',
        },
      },
    },
  },
});

export const ExpandForm: FC<IExpandFormProps> = memo(props => {
  const { index, factorSourceRange } = props;

  const onBasicNameChange = async (
    field: Field,
    fireImmediately: boolean,
    form: Form,
  ) => {
    // debugger
    // 没有更改表单直接返回
    if (!form.modified && !fireImmediately) return;

    // 名称相同不出发
    // if (formNameUseRef.current === newName) return;

    const parentPath = field.path.pop();
    // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
    if (
      form.getValuesIn(`${parentPath}.factorObj.matchWay`) === FACTOR_CREATE ||
      form.getValuesIn(`${parentPath}.matchWay`) === FACTOR_CREATE
    )
      return;

    try {
      // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
      // setAutoMatchFactorLoading(true);
      form.setFieldState(`${parentPath}.factorObj`, {
        loading: true,
      });
      const { data } = await postAutoMatchFactor({
        factorType: '3',
        sourceType: '2',
        transportType: field.value.toString(),
        // way: "1",
      });
      if (data.data) {
        const [numeratorUnit, denominatorUnit] = (data.data.unit || '').split(
          '/',
        );
        const formFactorObjValue = form.getValuesIn(`${parentPath}.factorObj`);
        form.setValuesIn(`${parentPath}.factorObj`, {
          ...formFactorObjValue,
          ...data.data,
          numeratorUnit,
          denominatorUnit,
          matchWay: FACTOR,
        });
        form.setValuesIn(`${parentPath}.matchWay`, FACTOR);
      } else {
        form.setValuesIn(`${parentPath}.factorObj`, undefined);
      }
    } catch (e) {
      form.setValuesIn(`${parentPath}.factorObj`, undefined);
    } finally {
      form.setFieldState(`${parentPath}.factorObj`, {
        loading: false,
      });
      // setAutoMatchFactorLoading(false);
    }
  };

  const parentForm = useForm();

  let initValue =
    parentForm.getValuesIn(
      `AiDataList.${index}.accountEmissionTransportList`,
    ) || [];

  const amount = parentForm.getValuesIn(`AiDataList.${index}.amountObj.amount`);

  const unitCode = parentForm.getValuesIn(
    `AiDataList.${index}.amountObj.unitCode`,
  );

  const unitCodeArr = parentForm.getValuesIn(
    `AiDataList.${index}.amountObj.unitCodeArr`,
  );

  if (unitCodeArr?.[0] === '1') {
    initValue = initValue.map(item => ({
      amount,
      unitCode,
      ...item,
    }));
  }

  const preAccountEmissionTransportListLength = useRef(initValue.length || 0);

  const form = useMemo(
    () =>
      createForm({
        values: {
          accountEmissionTransportList: cloneDeep(initValue),
        },
        effects: () => {
          onFieldValueChange('.type', (field, newForm) => {
            // 获取消耗数量的路径
            const amountFieldPath = field.query('.amountObj').take()?.path;
            if (amountFieldPath && field.visited) {
              newForm.setValuesIn(amountFieldPath, {
                type: field.value,
                amount: undefined,
                unitCode: undefined,
              });
            }
          });
          onFieldValueChange(
            'accountEmissionTransportList.*.transportType',
            (field, form) => {
              if (field.selfModified) {
                field.selfModified = false;
                onBasicNameChange(field, true, form);
              }
            },
          );
          onFormValuesChange(form => {
            const listValue = form.values.accountEmissionTransportList;
            const firstUnitCodeArr =
              parentForm.getValuesIn(
                `AiDataList.${index}.amountObj.unitCodeArr`,
              )?.[0] || '';
            const innerUnitCode =
              parentForm.getValuesIn(
                `AiDataList.${index}.amountObj.unitCode`,
              ) ||
              parentForm.getValuesIn(
                `AiDataList.${index}.amountObj.unitCodeArr`,
              )?.[1] ||
              '';
            const innerAmount = parentForm.getValuesIn(
              `AiDataList.${index}.amountObj.amount`,
            );
            if (
              listValue.length > preAccountEmissionTransportListLength.current
            ) {
              listValue.forEach((item, index) => {
                if (
                  index >= preAccountEmissionTransportListLength.current &&
                  firstUnitCodeArr === '1'
                ) {
                  form.setValuesIn(
                    `accountEmissionTransportList.${index}.amount`,
                    innerAmount,
                  );
                  form.setValuesIn(
                    `accountEmissionTransportList.${index}.unitCode`,
                    innerUnitCode,
                  );
                }
              });
            }
            preAccountEmissionTransportListLength.current = listValue.length;
          });
          onFormValuesChange(form => {
            parentForm.setValuesIn(
              `AiDataList.${index}.accountEmissionTransportList`,
              form.values.accountEmissionTransportList,
            );
            setTimeout(() => {
              if (form.modified) {
                parentForm.setFieldState(
                  `AiDataList.${index}.accountEmissionTransportList`,
                  {
                    selfModified: true,
                  },
                );
              }
            }, 100);
          });
        },
      }),
    [cloneDeep(initValue), index],
  );

  useEffect(() => {
    parentForm.addEffects(
      `AiDataList.${index}.accountEmissionTransportListValTest`,
      () => {
        onFieldValidateStart(`AiDataList.${index}.factorObj`, () => {
          form.validate();
        });
      },
    );
    parentForm.addEffects(
      `AiDataList.${index}.accountEmissionTransportListValAmountObj`,
      () => {
        onFieldValueChange(`AiDataList.${index}.amountObj`, (field: Field) => {
          if (field.value?.unitCodeArr?.[0] === '1') {
            const list = form.getValuesIn(
              `accountEmissionTransportList`,
            ) as any[];
            list?.forEach((_, i) => {
              form.setValuesIn(
                `accountEmissionTransportList.${i}.amount`,
                field.value?.amount,
              );
              form.setValuesIn(
                `accountEmissionTransportList.${i}.unitCode`,
                field.value?.unitCode || field.value?.unitCodeArr?.[1],
              );
            });
          }
        });
      },
    );
    return () => {
      parentForm.removeEffects(
        `AiDataList.${index}.accountEmissionTransportListValTest`,
      );
      parentForm.removeEffects(
        `AiDataList.${index}.accountEmissionTransportListValAmountObj`,
      );
    };
  }, [parentForm, index, form]);

  return (
    <div className={style.expandForm}>
      <FormilyCommon form={form}>
        <SchemaField
          schema={aiDataSchema(factorSourceRange)}
          scope={{
            useFieldDataSourceReaction,
          }}
        />
      </FormilyCommon>
    </div>
  );
});
