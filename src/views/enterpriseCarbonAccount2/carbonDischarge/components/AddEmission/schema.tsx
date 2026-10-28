/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-19 10:10:00
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 21:35:58
 */
import { Cascader } from '@formily/antd-v5';
import { ISchema } from '@formily/react';
import {
  getTextSchema,
  initFormilyRadio,
  initFormilyInput,
  initFormilyCascader,
  initFormilySelect,
  initFormilyDate,
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
import { DefaultOptionType } from 'antd/lib/cascader';
import { isNil } from 'lodash-es';

import { ACTIVITY_TYPE } from '../AccountAddEmission/constant';

/** 基本信息Schema */
export const baseInfoSchema = (
  matchFactor: (value) => void,
  matchEmission: (value) => void,
) => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          minColumns: 3,
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
                {},
              ),
              title: titleTip(
                I18N.components.emissionFacilityActivity,
                I18N.enterpriseCarbonAccount2.refersToTheGenerationOfEmissions,
              ),
            },
          }),
          sourceId: gridColumnSchema(1, {
            sourceId: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-component': () => <div />,
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
                        maxColumns: 3,
                        minColumns: 3,
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
export const activitySchema = () => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 32,
        },
        properties: {
          activityUnit: {
            type: 'string',
            ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
              showSearch: true,
              displayRender: (labels: string[]) => labels?.[1],
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
              },
            ),
            'x-component': 'SelectFormily',
          },
          activityCategory: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint3.dataCategory, true, {
              options: activityCategorys,
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
export const factorSchema = () => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 16,
        },
        properties: {
          name: gridColumnSchema(1, {
            name: {
              type: 'string',
              ...initFormilyInput(I18N.carbonFootprint.factorName, true, {}),

              'x-decorator-props': {
                gridSpan: 1,
              },
            },
          }),
          col2: gridColumnSchema(1, {
            factorValue: {
              type: 'string',
              ...initFormilyInput(I18N.components.factorValueTwo, true, {}),
              'x-decorator-props': {
                gridSpan: 1,
              },
            },
          }),
          unitColumns: {
            type: 'void',
            title: I18N.components.factorUnit,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-decorator-props': {
              asterisk: true,
              feedbackLayout: 'none',
            },
            properties: {
              factorUnit: {
                type: 'number',
                ...initFormilySelect(
                  I18N.carbonFootprint3.molecularUnit,
                  true,
                  {},
                  true,
                ),
                'x-decorator-props': {
                  addonAfter: '/',
                },
              },
              factorUnitM: {
                type: 'string',
                ...initFormilyCascader(
                  I18N.carbonFootprint3.denominatorUnit,
                  true,
                  {
                    displayRender: (label: string[]) => {
                      if (!label) return '';
                      return label.slice(-1);
                    },
                    showSearch: (
                      inputValue: string,
                      path: DefaultOptionType[],
                    ) =>
                      path.some(
                        option =>
                          (option.label as string)
                            .toLowerCase()
                            .indexOf(inputValue.toLowerCase()) > -1,
                      ),
                  },
                ),
                title: false,
              },
              factorUnitM2: {
                ...getTextSchema({ title: '' }),
                'x-visible': false,
              },
            },
          },
          factorType: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.factorCategories,
              true,
              {
                options: factorType,
              },
            ),
          },
          factorSource: {
            type: 'string',
            ...initFormilySelect(I18N.components.factorSources, false, {
              // options: activityCategorys,
              // 特殊组件，仅针对当前页面使用
              // @ts-ignore
              type: 2,
            }),
            'x-component': 'SelectFormily',
          },
          factorPublic: {
            type: 'string',
            ...initFormilyDate(I18N.carbonFootprint.yearOfPublication, false, {
              picker: 'year',
            }),
          },
        },
      },
    },
  };
  return data;
};

// 供应商
export const supplierSchema = () => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 16,
        },
        properties: {
          nam2e: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonFootprint.unitProductScheduling,
              true,
              {},
            ),
          },
          unitColum1ns: {
            type: 'void',
            title: I18N.enterpriseCarbonAccount2.unit,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-decorator-props': {
              asterisk: true,
              feedbackLayout: 'none',
            },
            properties: {
              numeratorUnit: {
                type: 'number',
                ...initFormilySelect(
                  I18N.carbonFootprint3.molecularUnit,
                  true,
                  {},
                  true,
                ),
                'x-decorator-props': {
                  addonAfter: '/',
                },
              },
              denominatorUnit: {
                type: 'string',
                ...initFormilyCascader(
                  I18N.carbonFootprint3.denominatorUnit,
                  true,
                ),
                title: false,
              },
            },
          },
          year: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonFootprint3.accountingYear2,
              true,
              {},
            ),
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          factorType: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.factorCategories,
              true,
              {
                options: factorType,
              },
            ),
          },
          factorScore: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
              true,
              {
                options: factorType,
              },
            ),
          },
          asdww: {
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          supplierName: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint3.supplierName, false, {
              // options: activityCategorys,
            }),
          },
          email: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.eMail, false, {
              // options: activityCategorys,
            }),
          },
          expireTime: {
            type: 'string',
            ...initFormilyDate(I18N.carbonFootprint.yearOfPublication, false),
          },
          dataType: {
            type: 'string',
            ...initFormilyRadio(I18N.carbonFootprint3.dataRequestClass, false, {
              options: [
                {
                  value: 1,
                  label: I18N.carbonFootprint3.carbonFootprintVerification2,
                },
                {
                  value: 2,
                  label: I18N.carbonFootprint3.carbonFootprintVerification,
                },
              ],
            }),
          },
          asdw3w: {
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          footBorderType: {
            type: 'number',
            enum: [
              {
                label: (
                  <div className='flex-a-c'>
                    <b style={{ color: '#999EA4' }}>
                      <span style={{ color: '#343A40' }}>
                        {I18N.carbonFootprint3.halfLifeCycle}
                      </span>
                      {I18N.carbonFootprint3.fromResourceExtraction2}
                    </b>
                  </div>
                ),
                value: 1,
              },
              {
                label: (
                  <div className='flex-a-c foot-border-type'>
                    <b
                      style={{
                        color: '#999EA4',
                      }}
                    >
                      <span style={{ color: '#343A40' }}>
                        {I18N.carbonFootprint3.fullLifecycle}
                      </span>
                      {I18N.carbonFootprint3.fromResourceExtraction}
                    </b>
                  </div>
                ),
                value: 2,
              },
            ],
            'x-decorator-props': {
              gridSpan: 3,
            },
            default: 1,
            ...initFormilyRadio(
              I18N.carbonFootprint3.theSystemBoundaryNeedsTo,
              true,
              {
                style: {
                  display: 'grid',
                },
              },
            ),
            'x-validator': {
              required: true,
            },
          },
        },
      },
    },
  };
  return data;
};
