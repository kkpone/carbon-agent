import { selectSchema } from '@components/FormilyUtil/util';
import { Field } from '@formily/core';
import { ISchema } from '@formily/react';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { Button } from 'antd';

// import { ExpandForm } from './ExpandForm';

const typeEnum = Object.keys(ALL_EMISSION_LABEL()).map(em => ({
  label: ALL_EMISSION_LABEL()[em],
  value: Number(em),
}));

export const aiDataSchema = (
  unitDataSource: Dicts[],
  removeTemp: (index: number, name: string) => void,
  showDrawer: (id: number) => void,
  isEn: boolean = false,
): ISchema => ({
  type: 'object',
  properties: {
    AiDataList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-component-props': {
        pagination: false,
        // rowKey: 'id',
        // expandedRowRender: (record, index) => <ExpandForm index={index} />,
        // rowExpandable: (record) => record.isTransport,
      },
      items: {
        type: 'object',
        properties: {
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
              width: '104px',
            },
            required: true,
            properties: {
              type: {
                ...selectSchema('', true, {}, true),
                enum: typeEnum,
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
              width: '180px',
            },
            properties: {
              name: {
                type: 'object',
                'x-component': 'FormAiDataName',
                'x-decorator': 'FormItem',
                required: true,
              },
            },
          },
          col3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{I18N.carbonFootprint.quantity}</span>
                </div>
              ),
              // width: '228px',
            },
            properties: {
              amountObj: {
                type: 'object',
                'x-component': 'FormAiDataAmount',
                'x-component-props': {
                  unitCascader: unitDataSource,
                },
                'x-reactions': [
                  {
                    dependencies: ['..[].type'],
                    when: '{{$deps[0] === 1000}}', // 运输
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
                'x-decorator': 'FormItem',
              },
              // accountEmissionTransportList: {
              //   type: 'Array',
              //   'x-component': 'FormTransportList',
              //   'x-component-props': {
              //     unitCascader: unitDataSource,
              //   },
              //   'x-reactions': [
              //     {
              //       dependencies: ['..[].type'],
              //       when: '{{$deps[0] !== 7}}', // 运输
              //       fulfill: {
              //         schema: {
              //           'x-hidden': true,
              //           'x-component-props': {
              //             disabled: true,
              //           },
              //         },
              //       },
              //       otherwise: {
              //         schema: {
              //           'x-hidden': false,
              //           'x-component-props': {
              //             disabled: false,
              //           },
              //         },
              //       },
              //     },
              //   ],
              //   'x-decorator': 'FormItem',
              // },
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
                'x-component': (
                  field: Field<
                    any,
                    any,
                    any,
                    { id: number; index: number; name: string }
                  >,
                ) => (
                  <div>
                    {field.value
                      ? I18N.carbonNeutral.yes
                      : I18N.carbonNeutral.no}
                  </div>
                ),
              },
            },
          },
          col4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint.operation,
              width: isEn ? '184px' : '152px',
            },
            properties: {
              edit: {
                type: 'object',
                'x-component': 'EditButton',
                'x-component-props': {
                  showDrawer,
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
                    onClick={() => {
                      removeTemp(field.value.id, field.value.name);
                    }}
                  >
                    {I18N.carbonFootprint.delete}
                  </Button>
                ),
              },
            },
          },
        },
      },
    },
  },
});
