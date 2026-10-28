import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { selectSchema } from '@components/FormilyUtil/util';
import { Field } from '@formily/core';
import { ISchema } from '@formily/react';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { Button, TabsProps } from 'antd';

import { ExpandForm } from './ExpandForm';

const typeEnum = Object.keys(ALL_EMISSION_LABEL()).map(em => ({
  label: ALL_EMISSION_LABEL()[em],
  value: Number(em),
}));

export const aiDataSchema = (
  unitDataSource: Dicts[],
  removeTemp: (index: number, name: string) => void,
  showDrawer: (id: number) => void,
  submit: (data: any) => void,
  isEn: boolean = false,
  stageItem: TabsProps['items'] = [],
  factorSourceRange?: {
    enableFactorSourceRange?: boolean;
    factorPrefId?: number | string;
  },
): ISchema => ({
  type: 'object',
  properties: {
    AiDataList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-component-props': {
        pagination: false,
        rowKey: 'id',
        expandable: {
          expandedRowRender: (record, index) => (
            <ExpandForm
              record={record}
              index={index}
              factorSourceRange={factorSourceRange}
            />
          ),
          rowExpandable: record => record.needTrans,
          expandIcon: ({ expanded, onExpand, record }) => {
            if (record.needTrans) {
              return expanded ? (
                <CaretDownOutlined onClick={e => onExpand(record, e)} />
              ) : (
                <CaretRightOutlined onClick={e => onExpand(record, e)} />
              );
            }
            return null;
          },
        },
        scroll: {
          x: 1270,
        },
      },
      items: {
        type: 'object',
        properties: {
          col11: {
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
                  <span>{I18N.carbonFootprint.lifeCycleStage}</span>
                </div>
              ),
              width: '164px',
            },
            required: true,
            properties: {
              stage: {
                ...selectSchema('', true, {}, true),
                enum: stageItem.map(item => ({
                  label: item.label,
                  value: Number(item.key),
                })),
              },
            },
          },
          col2: {
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
                  <span>{I18N.carbonFootprint3.emissionSourceName}</span>
                </div>
              ),
              width: '160px',
            },
            properties: {
              name: {
                type: 'object',
                'x-component': 'FormAiDataName',
                'x-decorator': 'FormItem',
                'x-validator': (value: { value: string }) =>
                  typeof value?.value === 'string' && value?.value?.length === 0
                    ? I18N.carbonFootprint3.pleaseEnterEmissions
                    : '',
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
                  <span>{I18N.carbonFootprint.type}</span>
                </div>
              ),
              width: '134px',
            },
            required: true,
            properties: {
              type: {
                ...selectSchema('', true, {}, true),
                enum: typeEnum,
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
                  <span>{I18N.carbonFootprint.quantity}</span>
                </div>
              ),
              width: '208px',
            },
            properties: {
              amountObj: {
                type: 'object',
                'x-component': 'FormAiDataAmount',
                'x-component-props': {
                  unitCascader: unitDataSource,
                },
                // 'x-reactions': [
                //   {
                //     dependencies: ['..[].type'],
                //     when: '{{$deps[0] === 7}}', // 运输
                //     fulfill: {
                //       schema: {
                //         'x-hidden': true,
                //         'x-component-props': {
                //           disabled: true,
                //         },
                //       },
                //     },
                //     otherwise: {
                //       schema: {
                //         'x-hidden': false,
                //         'x-component-props': {
                //           disabled: false,
                //         },
                //       },
                //     },
                //   },
                // ],
                'x-decorator': 'FormItem',
              },
              accountEmissionTransportList: {
                type: 'Array',
                'x-component': 'FormTransportList',
                'x-component-props': {
                  unitCascader: unitDataSource,
                },
                'x-reactions': [
                  {
                    dependencies: ['..[].type'],
                    when: '{{$deps[0] !== 7}}', // 运输
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
                        'x-hidden': true,
                        'x-component-props': {
                          disabled: true,
                        },
                      },
                    },
                  },
                ],
                'x-decorator': 'FormItem',
                // 'x-validator': value => {
                //   if (value.length > 0) {
                //     if (value.some(item => !!item.name)) {
                //       return '';
                //     }
                //   }
                //   return '';
                // },
              },
            },
          },
          col6: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.numberOfBackgroundFactors,
              width: '242px',
            },
            properties: {
              factorObj: {
                type: 'object',
                'x-component': 'FormilyTableFactor',
                'x-component-props': {
                  enableFactorSourceRange:
                    factorSourceRange?.enableFactorSourceRange,
                  factorPrefId: factorSourceRange?.factorPrefId,
                },

                'x-reactions': [
                  {
                    dependencies: ['..[].type'],
                    when: '{{$deps[0] === 7}}', // 运输
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
                          enableFactorSourceRange:
                            factorSourceRange?.enableFactorSourceRange,
                          factorPrefId: factorSourceRange?.factorPrefId,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
          col5: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.doYouNeedToTransportIt,
              width: isEn ? '100px' : '110px',
            },
            properties: {
              needTrans: {
                type: 'boolean',
                'x-component': 'Switch',
                'x-reactions': [
                  {
                    dependencies: ['..[].type'],
                    when: '{{$deps[0] === 7}}', // 运输
                    fulfill: {
                      schema: {
                        'x-hidden': false,
                        'x-component-props': {
                          disabled: true,
                        },
                      },
                      state: {
                        value: true,
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
          col4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint.operation,
              width: '206px',
              fixed: 'right',
            },
            properties: {
              edit: {
                type: 'void',
                'x-component': 'EditButton',
                'x-component-props': {
                  showDrawer,
                  submit,
                  text: I18N.carbonFootprint.edit,
                },
              },
              set: {
                type: 'object',
                'x-component': (
                  field: Field<
                    any,
                    any,
                    any,
                    { id: number; index: number; name: string }
                  >,
                ) => (
                  <Button
                    type='link'
                    style={{
                      padding: '7px 8px',
                    }}
                    onClick={() => {
                      removeTemp(field.value.id, field.value.name);
                    }}
                  >
                    {I18N.carbonFootprint.delete}
                  </Button>
                ),
              },
              submit: {
                type: 'void',
                'x-component': 'SubmitButton',
                'x-component-props': {
                  // showDrawer,
                  submit,
                },
              },
            },
          },
        },
      },
    },
  },
});
