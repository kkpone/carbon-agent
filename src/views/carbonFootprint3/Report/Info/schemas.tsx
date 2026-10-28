/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-14 16:25:26
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-03 17:19:36
 */

import {
  inputSchema,
  selectSchema,
  gridColumnSchema,
  dateRangeSchema,
  textareaSchema,
  initFormilyRadio,
  initFormilyCascader,
} from '@components/FormilyUtil/util';
import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';

import { REPORT_TYPE, REPORT_TYPE_LABEL } from '../../constant';

const { REPORT, COMPARE, CARBON_LABEL, REDUCTION } = REPORT_TYPE;
const { innerWidth } = window;

const isMinWindow = innerWidth <= 1700;

export const basicSchema = ({ isEdit }: { isEdit: boolean }): ISchema => ({
  type: 'object',

  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        rowGap: 8,
        columnGap: 20,
      },
      properties: {
        reportName: {
          ...inputSchema(I18N.carbonFootprint.reportName, true, {
            maxLength: 100,
          }),
        },
        type: {
          type: 'number',
          enum: [
            { value: REPORT, label: REPORT_TYPE_LABEL[REPORT]() },
            { value: COMPARE, label: REPORT_TYPE_LABEL[COMPARE]() },
            { value: REDUCTION, label: REPORT_TYPE_LABEL[REDUCTION]() },
            { value: CARBON_LABEL, label: REPORT_TYPE_LABEL[CARBON_LABEL]() },
          ],
          ...initFormilyRadio(I18N.carbonFootprint.reportType, true, {
            disabled: isEdit,
          }),
          default: REPORT,
          'x-decorator-props': {
            gridSpan: 2,
          },
        },
        reportAccountList: {
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
              <span>{I18N.carbonFootprint3.carbonFootprintVerification4}</span>
            </div>
          ),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${REPORT}}}`,
              },
            },
          },
          type: 'array',
          'x-component': 'ArrayTable',
          'x-decorator': 'FormItem',
          'x-component-props': {
            pagination: false,
            scroll: { x: 1500 },
          },
          'x-decorator-props': {
            gridSpan: 3,
          },
          properties: {
            add: {
              type: 'void',
              'x-component': 'ArrayTable.Addition',
              title: I18N.carbonFootprint3.newProductsAdded,
            },
          },
          items: {
            type: 'object',
            properties: {
              col1: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.carbonFootprint.productName,
                  width: 400,
                },
                required: true,
                properties: {
                  productName: {
                    ...selectSchema(
                      '',
                      true,
                      {
                        style: {
                          width: 400,
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                        placeholder: I18N.carbonFootprint.pleaseSelect,
                        showSearch: true,
                        allowClear: true,
                        filterOption: (input: string, option: any) => {
                          if (
                            (option?.label ?? '')
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          ) {
                            return true;
                          }

                          return false;
                        },
                      },
                      true,
                    ),
                    'x-reactions': ['{{useAsyncProductList()}}'],
                    'x-validator': {
                      required: true,
                      message: ' ',
                    },
                  },
                  productNameList: {
                    type: 'object',
                    ...inputSchema('', true, {}, true),
                    'x-hidden': true,
                  },
                },
              },
              col2: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.carbonFootprint3.specificationAndModel,
                  width: 300,
                  minWidth: 250,
                },
                properties: {
                  specification: {
                    type: 'object',
                    ...inputSchema('', true, {}, true),
                    'x-read-pretty': true,
                  },
                },
              },
              col3: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.carbonFootprint3.functionalUnits,
                  width: 450,
                },
                properties: {
                  accountName: {
                    type: 'number',
                    ...selectSchema(
                      '',
                      true,
                      {
                        style: {
                          width: 450,
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                        placeholder: I18N.carbonFootprint.pleaseSelect,
                        allowClear: true,
                        showSearch: true,
                        optionLabelProp: 'accountName',
                        fieldNames: {
                          label: 'accountNameNode',
                          value: 'value',
                        },
                        filterOption: (input, option) =>
                          (option?.accountName ?? '').includes(input),
                      },
                      true,
                    ),
                    'x-validator': {
                      required: true,
                      message: ' ',
                    },
                  },
                  accountInfoList: {
                    type: 'object',
                    ...inputSchema('', true, {}, true),
                    'x-hidden': true,
                  },
                },
              },
              col4: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.carbonFootprint.accountingCycle,
                  width: 250,
                },
                properties: {
                  periodTime: {
                    type: 'object',
                    ...inputSchema('', true, {}, true),
                    'x-read-pretty': true,
                  },
                },
              },
              col5: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.carbonFootprint.operation,
                  width: 100,
                },
                'x-reactions': {
                  deps: ['$$form.readPretty'],
                  fulfill: {
                    state: {
                      hidden: false,
                    },
                  },
                },
                properties: {
                  index: {
                    type: 'void',
                    'x-component': 'ArrayTable.Index',
                    'x-hidden': true,
                  },
                  set: {
                    type: 'void',
                    // 'x-component': () => (
                    //   <div
                    //     style={{
                    //       color: '#0cbf9f',
                    //       fontSize: 14,
                    //       cursor: 'pointer',
                    //     }}
                    //   >
                    //     删除
                    //   </div>
                    // ),
                    'x-component': 'ArrayTable.Remove',
                    'x-component-props': {
                      title: I18N.carbonFootprint.delete,
                    },
                    'x-reactions': {
                      dependencies: ['.index'],
                      fulfill: {
                        state: {
                          hidden: '{{$index === 0}}',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        productName: {
          ...selectSchema(I18N.carbonFootprint3.targetProductName, true, {
            showSearch: true,
            allowClear: true,
            filterOption: (input: string, option: any) => {
              if (
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              ) {
                return true;
              }

              return false;
            },
          }),
          'x-reactions': [
            '{{useAsyncProductDataSource()}}',
            {
              dependencies: ['type'],
              fulfill: {
                schema: {
                  'x-hidden': `{{$deps[0] == ${REPORT}}}`,
                  title: `{{$deps[0] == ${COMPARE} ? '${I18N.carbonFootprint3.targetProductName}' : $deps[0] == ${REDUCTION} ? '${I18N.carbonFootprint3.projectScenario}' : '${I18N.Factors.productName}'}}`,
                },
              },
            },
          ],
        },
        accountName: {
          ...selectSchema(I18N.carbonFootprint3.functionalUnits, true, {
            allowClear: true,
            showSearch: true,
            optionLabelProp: 'accountName',
            fieldNames: {
              label: 'accountNameNode',
              value: 'value',
            },
            filterOption: (input, option) =>
              (option?.accountName ?? '').includes(input),
          }),
          'x-read-pretty': true,
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] !== ${REPORT}}}`,
              },
            },
          },
        },
        reductionBasicInfoSpacer: {
          ...gridColumnSchema(1),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${REDUCTION}}}`,
              },
            },
          },
        },
        startTime: {
          ...dateRangeSchema(I18N.carbonFootprint.accountingCycle, true),
          'x-read-pretty': true,
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] !== ${REPORT} && $deps[0] !== ${REDUCTION}}}`,
                required: `{{$deps[0] !== ${REPORT} && $deps[0] !== ${REDUCTION}}}`,
              },
            },
          },
        },
        compareObj: {
          ...gridColumnSchema(2),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${COMPARE} || $deps[0] === ${REDUCTION}}}`,
              },
            },
          },
          properties: {
            compareGrid: {
              type: 'void',
              'x-component': 'FormGrid',
              'x-component-props': {
                maxColumns: 2,
                rowGap: 8,
                columnGap: 20,
              },
              properties: {
                compareProductName: {
                  ...selectSchema(
                    I18N.carbonFootprint3.benchmarkProductName,
                    true,
                    {
                      showSearch: true,
                      allowClear: true,
                      filterOption: (input: string, option: any) => {
                        if (
                          (option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        ) {
                          return true;
                        }

                        return false;
                      },
                    },
                  ),
                  'x-reactions': [
                    '{{useAsyncProductDataSource()}}',
                    {
                      dependencies: ['type'],
                      fulfill: {
                        schema: {
                          title: `{{$deps[0] == ${REDUCTION} ? '${I18N.carbonFootprint3.benchmarkScenario}' : '${I18N.carbonFootprint3.benchmarkProductName}'}}`,
                        },
                      },
                    },
                  ],
                },
                compareAccountName: {
                  ...selectSchema(I18N.carbonFootprint3.functionalUnits, true, {
                    allowClear: true,
                    showSearch: true,
                    optionLabelProp: 'compareAccountName',
                    fieldNames: {
                      label: 'compareAccountNameNode',
                      value: 'value',
                    },
                    filterOption: (input, option) =>
                      (option?.compareAccountName ?? '').includes(input),
                  }),
                  'x-read-pretty': true,
                },
              },
            },
          },
        },
        compareStartTime: {
          ...dateRangeSchema(I18N.carbonFootprint.accountingCycle, true),
          'x-read-pretty': true,
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${COMPARE}}}`,
                required: `{{$deps[0] === ${COMPARE}}}`,
              },
            },
          },
        },
        reductionCompareInfoSpacer: {
          ...gridColumnSchema(1),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${REDUCTION}}}`,
              },
            },
          },
        },
      },
    },
  },
});

const reductionFieldSchema = (
  fieldName: string,
  title: string,
  placeholder?: string,
): ISchema =>
  gridColumnSchema(2, {
    [fieldName]: textareaSchema(title, false, {
      maxLength: 1000,
      placeholder: placeholder || title,
    }),
  });

const reductionInputRowSchema = (
  fieldName: string,
  title: string,
  placeholder: string,
): ISchema =>
  gridColumnSchema(2, {
    [fieldName]: inputSchema(title, false, {
      placeholder,
    }),
  });

export const reductionReportIntroSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        rowGap: 8,
        columnGap: 20,
      },
      properties: {
        projectIntroductionCol: reductionFieldSchema(
          'description',
          I18N.carbonFootprint3.projectIntroduction,
        ),
        projectIntroductionEmpty: gridColumnSchema(1),
      },
    },
  },
});

export const reductionLifeCycleSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        rowGap: 8,
        columnGap: 20,
      },
      properties: {
        lifeCycleStageANameCol: reductionInputRowSchema(
          'reduceExtra.stageList.0.name',
          I18N.carbonFootprint3.stageA,
          I18N.carbonFootprint3.originalMaterialAcquisitionStage,
        ),
        lifeCycleStageANameEmpty: gridColumnSchema(1),
        lifeCycleStageBNameCol: reductionInputRowSchema(
          'reduceExtra.stageList.1.name',
          I18N.carbonFootprint3.stageB,
          I18N.carbonFootprint3.originalProductionManufacturingStage,
        ),
        lifeCycleStageBNameEmpty: gridColumnSchema(1),
        lifeCycleStageCNameCol: reductionInputRowSchema(
          'reduceExtra.stageList.2.name',
          I18N.carbonFootprint3.stageC,
          I18N.carbonFootprint3.originalDistributionStorageStage,
        ),
        lifeCycleStageCNameEmpty: gridColumnSchema(1),
        lifeCycleStageDNameCol: reductionInputRowSchema(
          'reduceExtra.stageList.3.name',
          I18N.carbonFootprint3.stageD,
          I18N.carbonFootprint3.originalProductUseStage,
        ),
        lifeCycleStageDNameEmpty: gridColumnSchema(1),
        lifeCycleStageENameCol: reductionInputRowSchema(
          'reduceExtra.stageList.4.name',
          I18N.carbonFootprint3.stageE,
          I18N.carbonFootprint3.originalWasteDisposalStage,
        ),
        lifeCycleStageENameEmpty: gridColumnSchema(1),
      },
    },
  },
});

export const reductionReportRestSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        rowGap: 8,
        columnGap: 20,
      },
      properties: {
        projectScenarioSettingCol: reductionFieldSchema(
          'reduceExtra.targetScence',
          I18N.carbonFootprint3.projectScenarioSetting,
        ),
        projectScenarioSettingEmpty: gridColumnSchema(1),
        benchmarkScenarioSettingCol: reductionFieldSchema(
          'reduceExtra.baseScence',
          I18N.carbonFootprint3.benchmarkScenarioSetting,
        ),
        benchmarkScenarioSettingEmpty: gridColumnSchema(1),
        supposeCol: reductionFieldSchema(
          'suppose',
          I18N.carbonFootprint3.assumption,
        ),
        supposeEmpty: gridColumnSchema(1),
        overallAnalysisCol: reductionFieldSchema(
          'reduceExtra.allAnalysis',
          I18N.carbonFootprint3.overallAnalysis,
        ),
        overallAnalysisEmpty: gridColumnSchema(1),
        reductionStructureAnalysisCol: reductionFieldSchema(
          'reduceExtra.structureAnalysis',
          I18N.carbonFootprint3.reductionStructureAnalysis,
        ),
        reductionStructureAnalysisEmpty: gridColumnSchema(1),
        reductionPotentialAnalysisCol: reductionFieldSchema(
          'reduceExtra.potentialAnalysis',
          I18N.carbonFootprint3.reductionPotentialAnalysis,
        ),
        reductionPotentialAnalysisEmpty: gridColumnSchema(1),
        optimizationSuggestionsCol: reductionFieldSchema(
          'reduceExtra.suggestion',
          I18N.carbonFootprint3.optimizationSuggestions,
        ),
        optimizationSuggestionsEmpty: gridColumnSchema(1),
      },
    },
  },
});

export const reportMsgSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        rowGap: 8,
        columnGap: 20,
      },
      properties: {
        companyProfile: gridColumnSchema(2, {
          companyProfile: {
            ...textareaSchema(
              I18N.carbonFootprint3.companyIntroduction,
              false,
              {
                maxLength: 1000,
              },
            ),
            'x-reactions': {
              dependencies: ['type'],
              fulfill: {
                schema: {
                  required: `{{$deps[0] === ${REPORT}}}`,
                },
              },
            },
          },
        }),
        empty: gridColumnSchema(1),
        productionAddress: {
          type: 'array',
          ...initFormilyCascader(
            I18N.carbonFootprint3.productionAddress,
            true,
            {
              allowClear: true,
              showSearch: true,
              placeholder: I18N.carbonFootprint.pleaseSelect,
              changeOnSelect: false,
            },
          ),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                required: `{{$deps[0] === ${REPORT}}}`,
                'x-visible': `{{$deps[0] === ${REPORT}}}`,
              },
            },
          },
        },
        evaluateProductCategory: {
          type: 'array',
          ...initFormilyCascader(
            I18N.carbonFootprint3.evaluateProductCategory,
            true,
            {
              allowClear: true,
              showSearch: true,
              placeholder: I18N.carbonFootprint.pleaseSelect,
              changeOnSelect: false,
            },
          ),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                required: `{{$deps[0] === ${REPORT}}}`,
                'x-visible': `{{$deps[0] === ${REPORT}}}`,
              },
            },
          },
        },
        empty1: {
          ...gridColumnSchema(1),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${REPORT}}}`,
              },
            },
          },
        },
        grids: gridColumnSchema(2, {
          suppose: {
            ...textareaSchema(
              I18N.carbonFootprint3.carbonFootprintVerification3,
              false,
              {
                maxLength: 2000,
              },
            ),
            'x-reactions': {
              dependencies: ['type'],
              fulfill: {
                schema: {
                  required: `{{$deps[0] === ${REPORT}}}`,
                },
              },
            },
          },
        }),
        empty2: gridColumnSchema(1),
        productionProcessDescriptionCol: {
          ...gridColumnSchema(2),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${REPORT}}}`,
              },
            },
          },
          properties: {
            productionProcess: {
              ...textareaSchema(
                I18N.carbonFootprint3.processTechDescription,
                false,
                {
                  maxLength: 1000,
                },
              ),
              'x-reactions': {
                dependencies: ['type'],
                fulfill: {
                  schema: {
                    required: `{{$deps[0] === ${REPORT}}}`,
                  },
                },
              },
            },
          },
        },
        empty3: gridColumnSchema(1),
        overallDescriptionCol: {
          ...gridColumnSchema(2),
          'x-reactions': {
            dependencies: ['type'],
            fulfill: {
              schema: {
                'x-visible': `{{$deps[0] === ${REPORT}}}`,
              },
            },
          },
          properties: {
            overallDescription: {
              ...textareaSchema(
                I18N.carbonFootprint3.overallDescription,
                false,
                {
                  maxLength: 1000,
                },
              ),
              'x-reactions': {
                dependencies: ['type'],
                fulfill: {
                  schema: {
                    required: `{{$deps[0] === ${REPORT}}}`,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
export const dataSchema = (): ISchema => ({
  type: 'object',
  properties: {
    reportActivityList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-component-props': {
        pagination: false,
      },
      items: {
        type: 'object',
        properties: {
          col1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.dataCategory,
              width: 130,
            },
            properties: {
              dataType: {
                ...selectSchema('', false, {}, true),
                'x-read-pretty': true,
              },
            },
          },
          col2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.activityDataDescription,
            },
            properties: {
              descs: {
                ...inputSchema(
                  I18N.carbonFootprint3.activityDataDescription,
                  false,
                  {
                    maxLength: 500,
                  },
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
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
              title: I18N.carbonFootprint3.activityDataClass,
            },
            properties: {
              activityType: {
                ...selectSchema(
                  I18N.carbonFootprint3.activityDataClass,
                  false,
                  {},
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
export const emissiondataSchema = (): ISchema => ({
  type: 'object',
  properties: {
    reportFactoryList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-component-props': {
        pagination: false,
        scroll: {
          x: 'max-content',
        },
      },
      items: {
        type: 'object',
        properties: {
          col1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.dataCategory,
              width: 130,
              fixed: 'left',
            },
            properties: {
              dataType: {
                ...selectSchema('', false, {}, true),
                'x-read-pretty': true,
              },
            },
          },
          col2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.emissionFactorDescription,
              width: 192,
            },
            properties: {
              div: {
                type: 'void',
                'x-component': props => (
                  <div style={{ width: 192 }}>{props.children}</div>
                ),
                properties: {
                  descs: {
                    ...inputSchema(
                      I18N.carbonFootprint3.emissionFactorDescription,
                      false,
                      {
                        maxLength: 200,
                      },
                      true,
                    ),
                    'x-reactions': {
                      dependencies: ['type'],
                      fulfill: {
                        schema: {
                          required: `{{$deps[0] === ${REPORT}}}`,
                        },
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
              title: I18N.carbonFootprint3.timeCorrelation,
            },
            properties: {
              times: {
                ...selectSchema(
                  I18N.carbonFootprint3.timeCorrelation,
                  false,
                  {
                    allowClear: true,
                  },
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
                    },
                  },
                },
              },
            },
          },
          col4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.regionalRelevance,
            },
            properties: {
              region: {
                ...selectSchema(
                  I18N.carbonFootprint3.regionalRelevance,
                  false,
                  {
                    allowClear: true,
                    optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                  },
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
                    },
                  },
                },
              },
            },
          },
          col5: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.technicalRelevance,
            },
            properties: {
              technology: {
                ...selectSchema(
                  I18N.carbonFootprint3.technicalRelevance,
                  false,
                  {
                    allowClear: true,
                    optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                  },
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
                    },
                  },
                },
              },
            },
          },
          col6: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.dataAccuracy,
            },
            properties: {
              datas: {
                ...selectSchema(
                  I18N.carbonFootprint3.dataAccuracy,
                  false,
                  {
                    allowClear: true,
                    optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                  },
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
                    },
                  },
                },
              },
            },
          },
          col7: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.methodologySuitability2,
            },
            properties: {
              methodology: {
                ...selectSchema(
                  I18N.carbonFootprint3.methodologySuitability2,
                  false,
                  {
                    allowClear: true,
                    optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                  },
                  true,
                ),
                'x-reactions': {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      required: `{{$deps[0] === ${REPORT}}}`,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
