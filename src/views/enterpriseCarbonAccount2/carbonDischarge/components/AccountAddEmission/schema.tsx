/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-19 10:10:00
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-18 10:03:35
 */
import { Cascader } from '@formily/antd-v5';
import { ISchema } from '@formily/react';
import {
  getTextSchema,
  // initFormilyRadio,
  initFormilyInput,
  initFormilyCascader,
  initFormilySelect,
  schemaGridColumns,
  gridColumnSchema,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import {
  GHGTree,
  ISOTree,
  factorType,
} from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import {
  activityCategorys,
  titleTip,
} from '@src/views/enterpriseCarbonAccount2/utils';
import { disabledDate } from '@src/views/supplyChain2/utils';
import { Select } from 'antd';
// import FormilySystemBoundaryRadio from '../../component/FormilySystemBoundaryRadio';

import { isNil } from 'lodash-es';

import { isNumberInputWithinDigitLimits } from '@/utils/limitNumberInputDigits';

import { ACTIVITY_TYPE } from './constant';
import { getEmissionGroupsByCategory } from './service';
import { SupplierOptions } from '../../emissionAccount/emissionManage/emissionFormPage';
import FormilySystemBoundaryRadio from '../FormilySystemBoundaryRadio';

/** 基本信息Schema */
export const baseInfoSchema = (
  matchFactor: (value) => void,
  matchEmission: (value) => void,
  computationId?: string | number,
  agentPreviewLayout = false,
) => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 32,
        },
        properties: {
          name: gridColumnSchema(1, {
            name: {
              type: 'string',
              ...initFormilyInput(
                I18N.carbonFootprint3.emissionSourceName,
                true,
                {
                  maxLength: 100,
                  onBlur(e) {
                    const value = e.target?.value?.trim();
                    matchFactor(value);
                    matchEmission(value);
                  },
                },
              ),
              title: titleTip(
                I18N.carbonFootprint3.emissionSourceName,
                I18N.enterpriseCarbonAccount2.generatingGreenhouseGas,
              ),
            },
          }),
          facility: gridColumnSchema(1, {
            facility: {
              type: 'string',
              ...initFormilyInput(
                I18N.components.emissionFacilityActivity,
                true,
                {
                  maxLength: 100,
                },
              ),
              title: titleTip(
                I18N.components.emissionFacilityActivity,
                I18N.enterpriseCarbonAccount2.refersToTheGenerationOfEmissions,
              ),
            },
          }),
          paf222: gridColumnSchema(3, {
            sdfdd: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'FormGrid',
              // 'x-component-props': {
              //   className: 'grid-row',
              //   //   'ant-formily-item ant-formily-item-layout-vertical ant-formily-item-feedback-layout-loose ant-formily-item-label-align-left ant-formily-item-control-align-left',
              // },
              title: (
                <div className='flex-a-c display-i-b'>
                  <span style={{ color: '#ff4d4f', paddingRight: 3 }}>*</span>
                  <span>{I18N.carbonFootprint.emissionSourceType}</span>
                </div>
              ),

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
                        minColumns: 2,
                        columnGap: 32,
                      },
                      properties: {
                        col1: schemaGridColumns(
                          'ghg',
                          {
                            type: 'array',
                            ...initFormilyCascader(
                              I18N.enterpriseCarbonAccount2.ghgClassification2,
                              false,
                              {},
                            ),
                            'x-component': props => (
                              <>
                                <Cascader
                                  options={GHGTree}
                                  {...props}
                                  placeholder={
                                    I18N.carbonFootprint.pleaseSelect
                                  }
                                />
                                <span className='font-s-12 color-999EA4'>
                                  {
                                    I18N.enterpriseCarbonAccount2
                                      .ghgClassification
                                  }
                                </span>
                              </>
                            ),
                            'x-decorator': 'FormItem',
                            'x-validator': (value: string[]) =>
                              isNil(value?.[1])
                                ? I18N.enterpriseCarbonAccount2.pleaseSelectGh
                                : '',
                          },
                          {
                            'x-component-props': {
                              gridSpan: 1,
                            },
                          },
                        ),
                        col2: schemaGridColumns(
                          'iso',
                          {
                            type: 'array',
                            ...initFormilyCascader(
                              I18N.enterpriseCarbonAccount2.isoClassification2,
                              false,
                              {},
                            ),
                            'x-component': props => (
                              <>
                                <Cascader
                                  options={ISOTree}
                                  {...props}
                                  disabled
                                  placeholder={
                                    I18N.enterpriseCarbonAccount2.accordingToGhg
                                  }
                                />
                                <span className='font-s-12 color-999EA4'>
                                  {
                                    I18N.enterpriseCarbonAccount2
                                      .isoClassification
                                  }
                                </span>
                              </>
                            ),
                            'x-validator': (value: string[]) =>
                              isNil(value?.[1])
                                ? I18N.enterpriseCarbonAccount2.pleaseSelectIs
                                : '',
                          },
                          {
                            'x-component-props': {
                              gridSpan: 1,
                            },
                          },
                        ),
                        col3: schemaGridColumns(
                          'groupId',
                          {
                            type: 'number',
                            title: I18N.enterpriseCarbonAccount2.customGrouping,
                            'x-decorator': 'FormItem',
                            'x-component': 'Select',
                            'x-hidden': agentPreviewLayout || !computationId,
                            'x-component-props': {
                              allowClear: true,
                              placeholder:
                                I18N.enterpriseCarbonAccount2.pleaseSelectGroup,
                            },
                            'x-reactions': async (field: any) => {
                              const ghgClassify = field
                                .query('.ghg')
                                .value()?.[1];
                              if (!ghgClassify || !computationId) {
                                field.dataSource = [];
                                field.disabled = true;
                                return;
                              }
                              field.loading = true;
                              try {
                                const res = await getEmissionGroupsByCategory({
                                  ghgClassify,
                                  computationId,
                                });
                                const groups = res.data.data || [];
                                field.dataSource = groups.map(g => ({
                                  label: g.groupName,
                                  value: Number(g.id),
                                }));
                                field.disabled = groups.length === 0;
                                field.componentProps.placeholder =
                                  groups.length === 0
                                    ? I18N.enterpriseCarbonAccount2
                                        .noCustomGroup
                                    : I18N.enterpriseCarbonAccount2
                                        .pleaseSelectGroup;
                              } finally {
                                field.loading = false;
                              }
                            },
                          },
                          {
                            'x-component-props': {
                              gridSpan: 1,
                            },
                          },
                        ),
                      },
                    },
                  },
                },
              },
            },
          }),
        },
      },
    },
  };
  return data;
};

/** 活动数据Schema */
const AGENT_ACTIVITY_DATA_DIGIT_LIMITS = {
  maxDecimals: 10,
  maxIntegerDigits: 9,
} as const;

export const activitySchema = (
  isShare: boolean,
  agentPreviewLayout = false,
) => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 32,
        },
        properties: {
          activityData: {
            type: 'string',
            title: I18N.enterpriseCarbonAccount2.numberOfActivities,
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            ...(agentPreviewLayout
              ? {
                  'x-validator': (value: string | number | null | undefined) =>
                    isNumberInputWithinDigitLimits(
                      value,
                      AGENT_ACTIVITY_DATA_DIGIT_LIMITS,
                    )
                      ? ''
                      : I18N.carbonAgent.enterpriseCarbonActivityDataDigitLimit,
                }
              : {}),
            'x-component-props': {
              placeholder: I18N.supplyChain2.pleaseEnterTheActivity,
              controls: false,
              min: 0,
              stringMode: true,
            },
            'x-reactions': [
              {
                dependencies: ['.activityType'],
                fulfill: {
                  state: {
                    visible: `{{$deps[0] == ${ACTIVITY_TYPE.EMISSION_FACTOR}}}`,
                  },
                },
              },
            ],
          },
          activityUnit: {
            type: 'string',
            ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
              showSearch: {
                filter: (inputValue: string, path: { label: string }[]) =>
                  !!(path[0]?.label || '')
                    .toLocaleLowerCase()
                    .includes(inputValue.toLocaleLowerCase()) ||
                  !!(path[1]?.label || '')
                    .toLocaleLowerCase()
                    .includes(inputValue.toLocaleLowerCase()),
              },
            }),
            title: titleTip(
              I18N.carbonFootprint.unit,
              I18N.enterpriseCarbonAccount2.activityData,
            ),
            // 'x-decorator-props': {
            //   gridSpan: 3,
            // },
            'x-reactions': [
              '{{useFiledUnitDictSource("factorUnitM")}}',
              {
                dependencies: ['.activityType'],
                fulfill: {
                  state: {
                    visible: `{{$deps[0] == ${ACTIVITY_TYPE.EMISSION_FACTOR}}}`,
                  },
                },
              },
            ],
          },
          activityRecordWay: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.recordingMethod,
              false,
              {
                // @ts-ignore
                type: '0',
                isShare,
              },
            ),
            'x-component': 'SelectFormily',
          },
          activityDept: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.saveDepartment,
              false,
              {
                // @ts-ignore
                type: '1',
                isShare,
              },
            ),
            'x-component': 'SelectFormily',
          },
          activityCategory: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint3.dataCategory, true, {
              options: activityCategorys,
              allowClear: true,
            }),
            'x-reactions': [
              {
                target: 'activityScore',
                fulfill: {
                  state: {
                    value: '{{$self.value}}',
                  },
                },
              },
            ],
          },
          activityScore: {
            ...getTextSchema({
              title: I18N.enterpriseCarbonAccount2.dataRating,
              componentProps: {
                placeholder: I18N.enterpriseCarbonAccount2.automaticCalculation,
              },
            }),
          },
        },
      },
    },
  };
  return data;
};
// 手动填写因子

/** 自定义供应商 选项数据 */
const defaultAddSupplyData: SupplierOptions = {
  label: '',
  value: '',
  parmasId: NaN,
  email: '',
};
// 供应商

export const supplierDataFormItems = ({
  form,
  cequivalentUnitZ,
  cascaderOptions,
  pageType,
  supplierItem,
  supplierList,
  setSupplierList,
}) => [
  {
    label: I18N.carbonFootprint.unitProductScheduling,
    name: 'unitDischarge',
    type: 'input',
    rules: false,
    props: {
      disabled: true,
    },
  },
  {
    label: I18N.carbonFootprint.unit,
    name: 'render',
    type: 'render',
    rules: false,
    render: () => (
      <div className='flex-a-c flex-j-b'>
        <Select
          value={form.getFieldValue('unitSupplier')}
          style={{ width: '47.55%', transition: 'none' }}
          options={cequivalentUnitZ}
          disabled
          fieldNames={{
            label: 'dictLabel',
            value: 'dictValue',
          }}
        />
        /
        <Cascader
          value={form.getFieldValue('unitmSupplier')}
          style={{ width: '47.55%', transition: 'none' }}
          disabled
          options={cascaderOptions}
          fieldNames={{
            label: 'dictLabel',
            value: 'dictValue',
            children: 'enumList',
          }}
        />
      </div>
    ),
  },
  {
    label: I18N.carbonFootprint3.accountingYear2,
    name: 'year',
    // type: 'input',
    type: 'date',
    padding: '0',
    rules: false,
    props: {
      picker: 'year',
      disabled: true,
    },
  },
  {
    label: I18N.enterpriseCarbonAccount2.emissionFactors,
    name: 'factorType',
    type: 'select',
    rules: true,
    props: {
      disabled: pageType === 'detail',
      options: factorType,
      onChange(value) {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          factorScore: value,
        });
      },
    },
  },
  {
    label: I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
    name: 'factorScore',
    type: 'input',
    rules: false,
    props: {
      disabled: true,
    },
  },
  {
    label: '',
    name: '',
    type: '',
    rules: false,
    props: {
      style: { display: 'none' },
    },
  },
  {
    label: I18N.carbonFootprint3.supplierName,
    name: 'supplierName',
    type: 'select',
    rules: pageType !== 'detail',
    props: {
      disabled: pageType === 'detail',
      showSearch: true,
      // onBlur: () => {
      //   const hasSuplier = supplierList?.find(
      //     item => item.label === supplierItem?.current?.label,
      //   );
      //   if (!hasSuplier && supplierItem?.current?.label) {
      //     setSupplierList([...supplierList, supplierItem?.current]);
      //     form.setFieldsValue({
      //       ...form.getFieldsValue(),
      //       supplierName: supplierItem?.current?.label,
      //     });
      //     supplierItem!.current = {
      //       ...defaultAddSupplyData,
      //     };
      //   } else {
      //     setSupplierList([...supplierList]);
      //   }
      // },
      // onInput() {
      //   form.setFieldsValue({
      //     ...form.getFieldsValue(),
      //     email: '',
      //   });
      // },
      onClear: () => {
        form.setFieldValue('email', '');
      },
      onSelect: (lable, item) => {
        form.setFieldsValue({
          ...form.getFieldsValue(),
          email: item?.email || '-',
        });
        supplierItem!.current = {
          ...defaultAddSupplyData,
        };
      },
      onSearch(input: string) {
        if (!input) {
          return;
        }
        supplierItem!.current = {
          ...defaultAddSupplyData,
          label: input,
          value: input,
        };
      },
      optionFilterProp: 'label',
      options: supplierList,
    },
  },
  {
    label: I18N.carbonFootprint3.eMail,
    name: 'email',
    type: 'input',
    rulesCustom: [
      {
        required: pageType !== 'detail',
        message: I18N.enterpriseCarbonAccount2.emailCannotBe,
      },
      {
        type: 'email',
        message: I18N.enterpriseCarbonAccount2.emailFormatIsIncorrect,
      },
    ],
    props: {
      disabled:
        !supplierList?.some(
          item =>
            item.label === form.getFieldValue('supplierName') &&
            Number.isNaN(item.parmasId),
        ) || pageType === 'detail',
      onBlur(e) {
        const { value } = e.target;
        const supItem = supplierList.find(
          item => item.label === form.getFieldValue('supplierName'),
        );
        if (supItem.label === supItem.parmasId) {
          // 用户输入
          supplierList.forEach(item => {
            if (item.label === supItem.label) {
              item.email = value;
            }
          });
          setSupplierList([...supplierList]);
        }
      },
    },
  },
  {
    label: I18N.carbonFootprint3.deadline,
    name: 'expireTime',
    type: 'date',
    padding: '0',
    rules: pageType !== 'detail',
    props: {
      disabled: pageType === 'detail',
      disabledDate,
    },
  },
  {
    label: I18N.carbonFootprint3.dataRequestClass,
    name: 'dataType',
    type: 'radio',
    rules: pageType !== 'detail',
    col: 24,
    props: {
      disabled: pageType === 'detail',
      options: [
        { value: 1, label: I18N.carbonFootprint3.carbonFootprintVerification2 },
        { value: 2, label: I18N.carbonFootprint3.carbonFootprintVerification },
      ],
    },
  },
  {
    label: I18N.carbonFootprint3.theSystemBoundaryNeedsTo,
    name: 'borderType',
    type: 'render',
    rules: pageType !== 'detail',
    col: 24,
    props: {
      disabled: pageType === 'detail',
      className: 'brstyle',
      options: [
        {
          value: 1,
          label: (
            <div style={{ marginBottom: 16, border: '1px solid' }}>
              <span>{I18N.carbonFootprint3.halfLifeCycle}</span>
              <span style={{ color: '#999EA4' }}>
                {I18N.carbonFootprint3.fromResourceExtraction2}
              </span>
            </div>
          ),
        },
        {
          value: 2,
          label: (
            <>
              <span>{I18N.carbonFootprint3.fullLifecycle}</span>
              <span style={{ color: '#999EA4' }}>
                {I18N.carbonFootprint3.fromResourceExtraction}
              </span>
            </>
          ),
        },
      ],
    },
    render() {
      return (
        <FormilySystemBoundaryRadio
          value={1}
          disabled={pageType === 'detail'}
          onChange={(): void => {}}
        />
      );
    },
  },
  {
    label: I18N.carbonFootprint3.dataRequirementDescription,
    name: 'descr',
    type: 'textArea',
    rules: false,
    col: 16,
    props: {
      disabled: pageType === 'detail',
      row: 4,
    },
  },
];
