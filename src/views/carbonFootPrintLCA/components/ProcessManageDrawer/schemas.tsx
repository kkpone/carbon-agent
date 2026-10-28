import { QuestionCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import { find, isArray, omit } from 'lodash-es';
import moment, { Moment } from 'moment';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
  renderFormilyTableAction,
} from '@/components/formily/utils';
import { formatScientific, reverseHandleLangFields } from '@/utils';
import { Dicts } from '@/views/dashborad/Dicts/hooks';

import {
  PRODUCTION_TYPE_OPTIONS,
  INPUT_TYPE_OPTIONS,
  INPUT_TYPE,
  OUTPUT_TYPE_OPTIONS,
  OUTPUT_TYPE,
  SELECT_BUTTON_TYPE,
} from './constant';
import style from './index.module.less';
import { ProcessModelIORes } from '../../CarbonFootprintModel/type';
import { DictTree } from '../../hook/type';
import { PROCESS_CATEGORY } from '../ProcessManageTable/constant';
import { UploadFile } from '../ProcessManageTable/type';

/** 高精度25位小数 */
const stringMode25 = {
  stringMode: true,
  formatter: (v: string | number) => `${v}`,
  precision: 25,
  min: '0.0000000000000000000000001',
  max: '99999999999.9999999999999999999999999',
};

/** 获取数据分类名称 */
function getNameByValuePath(data: DictTree[], path: string[]) {
  const result = [];

  function findName(items: DictTree[], code: string) {
    return find(items, { code });
  }

  let currentLevel = data;
  // eslint-disable-next-line no-restricted-syntax
  for (const code of path) {
    const item = findName(currentLevel, code);
    if (item) {
      result.push(item.name);
      currentLevel = item.children || [];
    } else {
      break;
    }
  }
  return result.join('/');
}

/** 过程管理类型：产品、输入、输出 */
const { PRODUCTION, INPUT, OUTPUT } = PROCESS_CATEGORY;

/** 输入类型 资本货物 */
const { CAPITAL_GOODS } = INPUT_TYPE;

/** 输出类型 可再生输出物 有价值的输出物*/
const { RENEWABLE_OUTPUTS, VALUABLE_OUTPUTS } = OUTPUT_TYPE;

/** 上下游数据选择按钮 过程数据、模型引用、数据库数据、引用供应商结果数据、因子数据 */
const {
  PROCESS_DATA,
  MODEL_REFERENCE,
  DATABASE_DATA,
  SUPPLIER_DATA,
  FACTOR_DATA,
} = SELECT_BUTTON_TYPE;

type SchemasProps = {
  /** 过程模型类别：1输入 2输出 3产品 */
  categoryType?: number;
  /** 生命周期阶段 */
  lifeStageType?: number;
  /** 是否展示过程模型的完整数据（包括产品、输入、输出） */
  showWholeProcess?: boolean;
  /** 是否展示生命周期阶段选择按钮 */
  showLifeStageSelectRadio?: boolean;
  /** 是否是子节点-多重引用的输出 */
  isChild?: boolean;
  /** 是否是多重引用的新增关联输出 */
  isAddConnect?: boolean;
};

/** 不同类型的上下游数据的展示信息 */
const onGetCategoryTypeUpOrDownstreamData = (categoryType?: number) => {
  const categoryTypeUpOrDownstreamData = {
    /** 产品 默认选择因子数据库 */
    [PRODUCTION]: {
      title: I18N.carbonFootPrintLCA.upstreamAndDownstreamData,
      default: FACTOR_DATA,
      dependencies: 'productType',
      visible: true,
    },
    /** 输入 默认展示过程数据 */
    [INPUT]: {
      title: I18N.carbonFootPrintLCA.upstreamData,
      default: PROCESS_DATA,
      dependencies: 'dataType',
      visible: false,
    },
    /** 输出 默认展示过程数据  */
    [OUTPUT]: {
      title: I18N.carbonFootPrintLCA.downstreamData,
      default: PROCESS_DATA,
      dependencies: 'dataType',
      visible: false,
    },
  };
  return categoryTypeUpOrDownstreamData[
    categoryType as keyof typeof categoryTypeUpOrDownstreamData
  ];
};

/** 获取过程模型的schemas */
const onGetProcessManageScheams = ({ categoryType }: SchemasProps) => {
  /** 过程管理的完整scheams */
  const processSchemasProperties = {
    /** 产品 */
    [PRODUCTION]: {
      productType: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.type,
        'x-component': 'Radio.Group',
        enum: PRODUCTION_TYPE_OPTIONS,
      }),
      name: renderFormItemSchema({
        title: I18N.Factors.productName,
        'x-component': 'Input',
        'x-component-props': {
          maxLength: 100,
        },
      }),
      productCount: {
        type: 'void',
        title: I18N.carbonFootPrintLCA.quantity,
        'x-decorator': 'FormItem',
        'x-component': 'FormGrid',
        'x-component-props': {
          className: style.gridWrapper,
        },
        'x-reactions': [
          {
            fulfill: {
              schema: {
                'x-decorator-props': {
                  asterisk: `{{!$form.readPretty}}`,
                },
              },
            },
          },
        ],
        properties: {
          dataValue: renderFormItemSchema({
            validateTitle: I18N.carbonFootPrintLCA.quantity,
            type: 'number',
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.base.pleaseEnter,
              ...stringMode25,
            },
          }),
          unit: renderFormItemSchema({
            validateTitle: I18N.carbonFootPrintLCA.quantityUnit,
            'x-component': 'Cascader',
            'x-component-props': {
              placeholder: I18N.Factors.pleaseSelect,
              displayRender: (label: string[]) => {
                if (!label) return '';
                return label.slice(-1);
              },
              showSearch: true,
            },
          }),
        },
      },
    },
    /** 输入 */
    [INPUT]: {
      dataType: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.type,
        'x-component': 'Select',
        'x-component-props': {
          allowClear: true,
        },
        enum: INPUT_TYPE_OPTIONS,
      }),
      ioName: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.inTheInputName,
        'x-component': 'Input',
        'x-component-props': {
          maxLength: 100,
        },
      }),
      inputCount: {
        type: 'void',
        title: I18N.carbonFootPrintLCA.quantity,
        'x-decorator': 'FormItem',
        'x-component': 'FormGrid',
        'x-component-props': {
          className: style.gridWrapper,
        },
        'x-decorator-props': {
          asterisk: `{{!$form.readPretty}}`,
        },
        properties: {
          dataValue: renderFormItemSchema({
            validateTitle: I18N.carbonFootPrintLCA.quantity,
            type: 'number',
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.base.pleaseEnter,
              ...stringMode25,
            },
          }),
          unit: renderFormItemSchema({
            validateTitle: I18N.carbonFootPrintLCA.quantityUnit,
            'x-component': 'Cascader',
            'x-component-props': {
              placeholder: I18N.Factors.pleaseSelect,
              displayRender: (label: string[]) => {
                if (!label) return '';
                return label.slice(-1);
              },
              showSearch: true,
            },
          }),
        },
      },
      weightRatio: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.qualityConversionSystem,
        type: 'number',
        'x-component': 'NumberPicker',
        'x-component-props': {
          placeholder: I18N.base.pleaseEnter,
          ...stringMode25,
          min: 0,
        },
      }),
      ioNameEn: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.enterNameInEnglish,
        'x-component': 'Input',
        'x-component-props': {
          maxLength: 100,
        },
      }),
      depreciationRate: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.depreciationRate,
        type: 'number',
        'x-component': 'NumberPicker',
        'x-component-props': {
          placeholder: I18N.base.pleaseEnter,
          stringMode: true,
          formatter: (v: string | number) => `${v}`,
          precision: 2,
          min: 0.01,
          max: 99.99,
        },
        'x-reactions': {
          dependencies: ['dataType'],
          fulfill: {
            schema: {
              'x-visible': `{{($deps[0] === ${CAPITAL_GOODS})}}`,
            },
          },
        },
      }),
      suppDesc: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.supplementaryDescription,
        required: false,
        'x-component': 'TextArea',
        'x-component-props': {
          maxLength: 1000,
        },
        'x-decorator-props': {
          gridSpan: 2,
        },
      }),
    },
    /** 输出 */
    [OUTPUT]: {
      dataType: renderFormItemSchema({
        customValidate: I18N.carbonFootPrintLCA.pleaseEnterTheType,
        title: (
          <span>
            {I18N.carbonFootPrintLCA.type}
            <Tooltip
              title={
                <div>
                  <p>{I18N.carbonFootPrintLCA.pendingOutput2}</p>
                  <p>{I18N.carbonFootPrintLCA.valuableLoss}</p>
                </div>
              }
            >
              <QuestionCircleOutlined className={style.basicStreamTip} />
            </Tooltip>
          </span>
        ),
        'x-component': 'Select',
        'x-component-props': {
          allowClear: true,
        },
        enum: OUTPUT_TYPE_OPTIONS,
      }),
      ioName: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.inTheOutputName,
        'x-component': 'Input',
        'x-component-props': {
          maxLength: 100,
        },
      }),
      outputCount: {
        type: 'void',
        title: I18N.carbonFootPrintLCA.quantity,
        'x-decorator': 'FormItem',
        'x-component': 'FormGrid',
        'x-component-props': {
          className: style.gridWrapper,
        },
        'x-decorator-props': {
          asterisk: `{{!$form.readPretty}}`,
        },
        properties: {
          dataValue: renderFormItemSchema({
            validateTitle: I18N.carbonFootPrintLCA.quantity,
            type: 'number',
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.base.pleaseEnter,
              ...stringMode25,
            },
          }),
          unit: renderFormItemSchema({
            validateTitle: I18N.carbonFootPrintLCA.quantityUnit,
            'x-component': 'Cascader',
            'x-component-props': {
              placeholder: I18N.Factors.pleaseSelect,
              displayRender: (label: string[]) => {
                if (!label) return '';
                return label.slice(-1);
              },
              showSearch: true,
            },
          }),
        },
      },
      weightRatio: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.qualityConversionSystem,
        type: 'number',
        'x-component': 'NumberPicker',
        'x-component-props': {
          placeholder: I18N.base.pleaseEnter,
          ...stringMode25,
          min: 0,
        },
      }),
      ioNameEn: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.outputNameInEnglish,
        'x-component': 'Input',
        'x-component-props': {
          maxLength: 100,
        },
      }),
      suppDesc: renderFormItemSchema({
        title: I18N.carbonFootPrintLCA.supplementaryDescription,
        required: false,
        'x-component': 'TextArea',
        'x-component-props': {
          maxLength: 1000,
        },
        'x-decorator-props': {
          gridSpan: 2,
        },
      }),
    },
  };

  /** 完整的过程展示的schemas */
  return processSchemasProperties[
    categoryType as keyof typeof processSchemasProperties
  ];
};

export const schema = ({
  categoryType,
  showLifeStageSelectRadio,
  isChild,
  isAddConnect,
}: SchemasProps) => {
  /** 是否是多重引用的输出 */
  if (isChild || isAddConnect) {
    return renderSchemaWithLayout(
      {},
      {
        grid: {
          ...renderFromGridSchema({
            columns: 2,
          }),
          properties: {
            title: renderFormItemSchema({
              required: false,
              'x-component': 'InfoTitle',
              'x-component-props': {
                title: I18N.carbonFootPrintLCA.addOutputLetter,
                isFormily: true,
                borderLeft: false,
              },
              'x-decorator-props': {
                gridSpan: 2,
              },
            }),
            dataType: renderFormItemSchema({
              customValidate: I18N.carbonFootPrintLCA.pleaseEnterTheType,
              title: (
                <span>
                  {I18N.carbonFootPrintLCA.type}
                  <Tooltip
                    title={
                      <div>
                        <p>{I18N.carbonFootPrintLCA.pendingOutput2}</p>
                      </div>
                    }
                  >
                    <QuestionCircleOutlined className={style.basicStreamTip} />
                  </Tooltip>
                </span>
              ),
              'x-component': 'Select',
              'x-component-props': {
                allowClear: true,
              },
              enum: OUTPUT_TYPE_OPTIONS?.filter(
                item => item.value !== VALUABLE_OUTPUTS,
              ),
            }),
            outputCount: {
              type: 'void',
              title: I18N.carbonFootPrintLCA.addOutputOrder,
              required: false,
              'x-decorator': 'FormItem',
              'x-component': 'FormGrid',
              'x-component-props': {
                className: style.gridWrapper,
              },
              properties: {
                unit: renderFormItemSchema({
                  required: false,
                  validateTitle: I18N.carbonFootPrintLCA.quantityUnit,
                  'x-component': 'Cascader',
                  'x-component-props': {
                    placeholder: '-',
                    displayRender: (label: string[]) => {
                      if (!label) return '';
                      return label.slice(-1);
                    },
                    showSearch: true,
                  },
                  'x-disabled': true,
                }),
              },
            },
          },
        },
      },
    );
  }

  return renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          ...onGetProcessManageScheams({
            categoryType,
            showLifeStageSelectRadio,
          }),
        },
      },
    },
  );
};

/** 上下游数据 */
export const upOrDownstreamDataSchemas = ({ categoryType }: SchemasProps) => {
  const { default: defaultValue } =
    onGetCategoryTypeUpOrDownstreamData(categoryType) || {};
  return renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          linkType: renderFormItemSchema({
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Radio.Group',
            'x-component-props': {
              optionType: 'button',
              buttonStyle: 'solid',
            },
            default: defaultValue,
            required: false,
            'x-reactions': [
              {
                dependencies: ['dataType'],
                fulfill: {
                  schema: {
                    'x-visible': `{{($deps[0] !== ${RENEWABLE_OUTPUTS})}}`,
                  },
                },
              },
              `{{getLinkTypeEnum()}}`,
            ],
          }),
          /** 上下游数据-过程数据、自建因子 */
          upOrDownstreamData: {
            type: 'object',
            'x-reactions': {
              dependencies: ['linkType'],
              fulfill: {
                schema: {
                  'x-visible': `{{ ($deps[0] === ${PROCESS_DATA} || $deps[0] === ${FACTOR_DATA})}}`,
                },
              },
            },
            properties: {
              lifeCycle: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.lifeCycleStage,
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
                'x-reactions': {
                  dependencies: ['linkType'],
                  fulfill: {
                    schema: {
                      'x-visible': `{{$deps[0] === ${PROCESS_DATA}}}`,
                    },
                  },
                },
              }),
              relatedProcessName: renderFormItemSchema({
                validateTitle: I18N.carbonFootPrintLCA.dataName,
                type: 'string',
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: 100,
                },
              }),
              relatedProductName: renderFormItemSchema({
                title: I18N.Factors.productName,
                type: 'string',
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: 100,
                },
                'x-reactions': [
                  {
                    dependencies: ['linkType'],
                    fulfill: {
                      schema: {
                        'x-visible': `{{$deps[0] === ${FACTOR_DATA} }}`,
                      },
                    },
                  },
                ],
              }),
              relatedProductUnit: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.productUnit,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.Factors.pleaseSelect,
                  displayRender: (label: string[]) => {
                    if (!label) return '';
                    return label.slice(-1);
                  },
                  showSearch: true,
                },
                'x-reactions': [
                  {
                    dependencies: ['linkType'],
                    fulfill: {
                      schema: {
                        'x-visible': `{{$deps[0] === ${FACTOR_DATA} }}`,
                      },
                    },
                  },
                ],
              }),
              convertRatio: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.unitConversionRatio2,
                type: 'number',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.base.pleaseEnter,
                  ...stringMode25,
                },
                'x-reactions': [
                  {
                    dependencies: ['linkType'],
                    fulfill: {
                      schema: {
                        'x-visible': `{{$deps[0] === ${FACTOR_DATA} }}`,
                        'x-decorator-props': {
                          asterisk: `{{!$form.readPretty}}`,
                        },
                      },
                    },
                  },
                ],
              }),
              '[timeRepresentStart, timeRepresentEnd]': renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.timeRepresentativeness,
                'x-component': 'DatePicker.RangePicker',
                'x-component-props': {
                  placeholder: [
                    I18N.carbonData.startingYear,
                    I18N.carbonData.endYear,
                  ],
                  className: style.datePicker,
                  picker: 'year',
                  disabledDate: (current: Moment) =>
                    (current && current < moment('1990')) ||
                    (current && current > moment()),
                },
              }),
              area: {
                type: 'void',
                title: I18N.Factors.geographicalRepresentativeness,
                'x-decorator': 'FormItem',
                'x-component': 'FormGrid',
                'x-component-props': {
                  className: style.gridWrapper,
                },
                properties: {
                  areaRepresent: renderFormItemSchema({
                    validateTitle: I18N.Factors.geographicalRepresentativeness,
                    type: 'number',
                    'x-component': 'Select',
                    'x-component-props': {
                      showSearch: true,
                      optionFilterProp: 'label',
                      allowClear: true,
                    },
                  }),
                  areaRepresentDetail: renderFormItemSchema({
                    validateTitle: I18N.Factors.detailedAddress,
                    required: false,
                    'x-disabled': true,
                    'x-component': 'Input',
                    'x-component-props': {
                      maxLength: 100,
                      placeholder: I18N.carbonFootPrintLCA.detailedAddress,
                    },
                  }),
                },
              },
              processDesc: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.processDescription,
                required: false,
                'x-disabled': true,
                'x-decorator-props': {
                  gridSpan: 2,
                },
                'x-component': 'TextArea',
                'x-component-props': {
                  maxLength: 1000,
                },
                'x-reactions': [
                  {
                    dependencies: ['linkType'],
                    fulfill: {
                      schema: {
                        'x-visible': `{{$deps[0] === ${PROCESS_DATA} }}`,
                      },
                    },
                  },
                ],
              }),
              assessmentList: {
                type: 'array',
                'x-component': 'ArrayTable',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  gridSpan: 2,
                },
                'x-component-props': {
                  pagination: false,
                },
                default: [{}],
                required: false,
                'x-reactions': [
                  {
                    dependencies: ['linkType'],
                    fulfill: {
                      schema: {
                        'x-visible': `{{$deps[0] === ${FACTOR_DATA} }}`,
                      },
                    },
                  },
                ],
                items: {
                  type: 'object',
                  properties: {
                    columns1: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: I18N.certificationReviewCenter.evaluationMethods,
                      },
                      properties: {
                        assessmentMethod: renderFormItemSchema({
                          validateTitle:
                            I18N.certificationReviewCenter.evaluationMethods,
                          'x-component': 'Select',
                        }),
                      },
                    },
                    columns2: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title:
                          I18N.certificationReviewCenter.evaluatingIndicator,
                      },
                      properties: {
                        assessmentTarget: renderFormItemSchema({
                          validateTitle:
                            I18N.certificationReviewCenter.evaluatingIndicator,
                          'x-component': 'Select',
                          'x-reactions': `{{matchTargetOptionFn()}}`,
                        }),
                      },
                    },
                    columns3: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: I18N.carbonFootPrintLCA.numericalValue,
                      },
                      properties: {
                        dataValue: renderFormItemSchema({
                          validateTitle: I18N.carbonFootPrintLCA.numericalValue,
                          'x-component': 'NumberPicker',
                          'x-component-props': {
                            ...stringMode25,
                          },
                        }),
                      },
                    },
                    columns4: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: I18N.Factors.unit,
                      },
                      properties: {
                        unit: renderFormItemSchema({
                          validateTitle: I18N.Factors.unit,
                          'x-component': 'Select',
                          'x-disabled': true,
                        }),
                      },
                    },
                    columns5: renderFormilyTableAction({
                      width: 68,
                      actionBtns: ({ index, array }) => [
                        {
                          label: I18N.Factors.delete,
                          key: 'del',
                          disabled: index === 0,
                          onClick: () => {
                            array.field.remove(index);
                          },
                        },
                      ],
                    }),
                  },
                },
                properties: {
                  add: {
                    type: 'void',
                    'x-component': 'ArrayTable.Addition',
                    title: I18N.carbonAccount.add,
                  },
                },
              },
            },
          },
          /** 上下游数据-模型引用 */
          upOrDownModel: {
            type: 'object',
            'x-reactions': {
              dependencies: ['linkType'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${MODEL_REFERENCE}}}`,
                },
              },
            },
            properties: {
              modelName: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.modelName,
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelCode: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.modelCodingFor,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelFuncUnit: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.functionalUnits,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelOrgId: renderFormItemSchema({
                title: I18N.carbonData.affiliatedOrganization,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelProductCycle: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.productionCycle,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelProductName: renderFormItemSchema({
                title: I18N.Factors.productName,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelProductCode: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.productCode,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              modelSupplierName: renderFormItemSchema({
                title: I18N.carbonFootprint.supplierName,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
            },
          },
          /** 上下游数据-数据库数据 */
          upOrDownDatabase: {
            type: 'object',
            'x-reactions': {
              dependencies: ['linkType'],
              fulfill: {
                schema: {
                  'x-visible': `{{ ($deps[0] === ${DATABASE_DATA})}}`,
                },
              },
            },
            properties: {
              lcaFactorCategory: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.dataClassification,
                required: false,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.Factors.pleaseSelect,
                  changeOnSelect: true,
                  showSearch: true,
                  expandTrigger: 'hover',
                  fieldNames: {
                    label: 'name',
                    value: 'code',
                    children: 'children',
                  },
                },
              }),
              lcaMaterial: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.specificMaterial,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: 100,
                },
              }),
            },
          },
          /** 上下游数据-引用供应商结果数据 */
          upOrDownSupplier: {
            type: 'object',
            required: false,
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['linkType'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${SUPPLIER_DATA}}}`,
                },
              },
            },
            properties: {
              supplyCode: renderFormItemSchema({
                title: I18N.supplyChainCarbonManagement.supplierData,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              supplyName: renderFormItemSchema({
                title: I18N.carbonFootprint.supplierName,
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              supplyProductName: renderFormItemSchema({
                title: I18N.supplyChainCarbonManagement.purchaseProductName,
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              supplyUnit: renderFormItemSchema({
                title: I18N.carbonFootprint.accountingUnit,
                required: false,
                'x-disabled': true,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.Factors.pleaseSelect,
                  displayRender: (label: string[]) => {
                    if (!label) return '';
                    return label.slice(-1);
                  },
                  showSearch: true,
                },
              }),
              convertRatioIsEnabled: renderFormItemSchema({
                required: false,
                'x-disabled': true,
                'x-hidden': true,
                'x-component': 'Input',
              }),
              convertRatio: renderFormItemSchema({
                title: I18N.components.unitConversionRatio,
                dynamicRequired: true,
                type: 'number',
                required: false,
                'x-disabled': true,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.base.pleaseEnter,
                  ...stringMode25,
                },
                'x-reactions': {
                  dependencies: ['*(upOrDownSupplier.convertRatioIsEnabled)'],
                  fulfill: {
                    schema: {
                      'x-disabled': `{{!$deps[0]}}`,
                      required: `{{!!$deps[0]}}`,
                    },
                  },
                },
              }),
              supplyMethod: renderFormItemSchema({
                title: I18N.certificationReviewCenter.evaluationMethods,
                type: 'string',
                'x-component': 'Input',
                required: false,
                'x-disabled': true,
              }),
              supplyAssessmentList: {
                type: 'array',
                'x-component': 'ArrayTable',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  gridSpan: 2,
                },
                'x-component-props': {
                  pagination: false,
                },
                default: [],
                required: false,
                items: {
                  type: 'object',
                  properties: {
                    columns1: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: I18N.carbonFootPrintLCA.number,
                      },
                      properties: {
                        allIndex: renderEmptySchema(
                          { type: 'string' },
                          { showVal: (_row, index) => Number(index) + 1 },
                        ),
                      },
                    },
                    columns2: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title:
                          I18N.certificationReviewCenter.evaluatingIndicator,
                      },
                      properties: {
                        assessmentTargetName: renderFormItemSchema({
                          validateTitle:
                            I18N.certificationReviewCenter.evaluatingIndicator,
                          'x-component': 'Input',
                          required: false,
                          'x-disabled': true,
                        }),
                      },
                    },
                    columns3: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title:
                          I18N.supplyChainCarbonManagement
                            .unitProductEnvironment,
                      },
                      properties: {
                        dataValue: renderFormItemSchema({
                          validateTitle:
                            I18N.supplyChainCarbonManagement
                              .unitProductEnvironment,
                          'x-component': 'Input',
                          required: false,
                          'x-disabled': true,
                        }),
                      },
                    },
                    columns4: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: I18N.Factors.unit,
                      },
                      properties: {
                        unit: renderFormItemSchema({
                          validateTitle: I18N.Factors.unit,
                          'x-component': 'Input',
                          required: false,
                          'x-disabled': true,
                        }),
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
  );
};

/** 上游关联输出/下游关联输入  可再生输出物的下游数据*/
export const upOrDownAssociatesOutOrInSchemas = ({
  categoryType,
}: SchemasProps) => {
  /** 是否是输出 */
  const isOutput = categoryType === OUTPUT;
  return renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          upOrDownAssociates: {
            type: 'object',
            'x-reactions': {
              dependencies: ['linkType', 'dataType'],
              fulfill: {
                schema: {
                  'x-visible': `{{($deps[0] === ${PROCESS_DATA} || $deps[0] === ${MODEL_REFERENCE} || ($deps[1] === ${RENEWABLE_OUTPUTS})) && ($deps[1] !== ${VALUABLE_OUTPUTS}) }}`,
                },
              },
            },
            properties: {
              renewableProcessName: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.processName,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
                'x-reactions': {
                  dependencies: ['dataType'],
                  fulfill: {
                    schema: {
                      'x-visible': `{{$deps[0] === ${RENEWABLE_OUTPUTS}}}`,
                    },
                  },
                },
              }),
              relatedInputName: renderFormItemSchema({
                title: isOutput
                  ? I18N.carbonFootPrintLCA.enterName
                  : I18N.carbonFootPrintLCA.outputName,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              relatedInputNum: renderFormItemSchema({
                title: isOutput
                  ? I18N.carbonFootPrintLCA.inputQuantity
                  : I18N.carbonFootPrintLCA.outputQuantity,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              relatedInputUnit: renderFormItemSchema({
                title: isOutput
                  ? I18N.carbonFootPrintLCA.inputQuantityOrder
                  : I18N.carbonFootPrintLCA.outputQuantityList,
                required: false,
                'x-disabled': true,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.Factors.pleaseSelect,
                  displayRender: (label: string[]) => {
                    if (!label) return '';
                    return label.slice(-1);
                  },
                },
              }),
              convertRatioIsEnabled: renderFormItemSchema({
                required: false,
                'x-disabled': true,
                'x-hidden': true,
                'x-component': 'Input',
              }),
              convertRatio: renderFormItemSchema({
                title: isOutput
                  ? I18N.carbonFootPrintLCA.unitConversionRatio4
                  : I18N.carbonFootPrintLCA.unitConversionRatio3,
                dynamicRequired: true,
                type: 'number',
                required: false,
                'x-disabled': true,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.base.pleaseEnter,
                  ...stringMode25,
                },
                'x-reactions': {
                  dependencies: ['*(upOrDownAssociates.convertRatioIsEnabled)'],
                  fulfill: {
                    schema: {
                      'x-disabled': `{{!$deps[0]}}`,
                      required: `{{!!$deps[0]}}`,
                    },
                  },
                },
              }),
            },
          },
        },
      },
    },
  );
};

/** 数据库数据 */
export const databaseSchemas = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          databaseData: {
            type: 'object',
            'x-reactions': {
              dependencies: ['linkType'],
              fulfill: {
                schema: {
                  'x-visible': `{{$deps[0] === ${DATABASE_DATA}}}`,
                },
              },
            },
            properties: {
              databaseActivityName: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.activityName,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              databaseProductName: renderFormItemSchema({
                title: I18N.Factors.productName,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              databaseYear: renderFormItemSchema({
                title: I18N.Factors.yearOfPublication,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              areaRepresent: renderFormItemSchema({
                title: I18N.Factors.geographicalRepresentativeness,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              databaseName: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.databaseName,
                type: 'string',
                required: false,
                'x-disabled': true,
                'x-component': 'Input',
              }),
              databaseProductUnit: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.productUnit,
                required: false,
                'x-disabled': true,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.Factors.pleaseSelect,
                  displayRender: (label: string[]) => {
                    if (!label) return '';
                    return label.slice(-1);
                  },
                  showSearch: true,
                },
              }),
              convertRatioIsEnabled: renderFormItemSchema({
                required: false,
                'x-disabled': true,
                'x-hidden': true,
                'x-component': 'Input',
              }),
              convertRatio: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.unitConversionRatio2,
                dynamicRequired: true,
                type: 'number',
                required: false,
                'x-disabled': true,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.base.pleaseEnter,
                  ...stringMode25,
                },
                'x-reactions': {
                  dependencies: ['*(databaseData.convertRatioIsEnabled)'],
                  fulfill: {
                    schema: {
                      'x-disabled': `{{!$deps[0]}}`,
                      required: `{{!!$deps[0]}}`,
                    },
                  },
                },
              }),
            },
          },
        },
      },
    },
  );

/** 支持材料 */
export const fileSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          supportFile: renderFormItemSchema({
            required: false,
            type: 'array',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'FormilyFileUpload',
          }),
        },
      },
    },
  );

/** 新增、编辑保存时的公共部分数据处理 */
export const onHandleAddOrEditData = ({
  formValues,
}: {
  /** 表单填写的数据 */
  formValues: ProcessModelIORes;
}) => {
  /** 表单填写的数据 */
  const {
    dataType,
    ioName,
    ioNameEn,
    dataValue,
    unit,
    suppDesc,
    weightRatio,
    /** 折旧率 */
    depreciationRate,
    /** 上下游数据相关 */
    linkType: fromLinkType,
    upOrDownstreamData,
    upOrDownDatabase,
    /** 上下游关联 */
    upOrDownAssociates,
    /** 支撑材料 */
    supportFile,
    /** 数据库数据 */
    databaseData,
    /** 供应商数据 */
    upOrDownSupplier,
  } = formValues || {};

  /** 是否是可再生输出物 */
  const isRenewable = dataType === RENEWABLE_OUTPUTS;
  /** 上下游链接类型 */
  const linkType = isRenewable ? PROCESS_DATA : fromLinkType;

  /** 上下游数据的-过程数据、因子数据 */
  const {
    relatedProcessName,
    relatedProductName,
    relatedProductUnit,
    convertRatio,
    timeRepresentStart,
    timeRepresentEnd,
    areaRepresent,
    areaRepresentDetail,
    assessmentList,
  } = upOrDownstreamData || {};

  /** 上下游关联的单位换算比例-过程数据/模型引用 */
  const { convertRatio: associateConvertRatio } = upOrDownAssociates || {};

  /** 单位换算比例 */
  const usedConvertRatio = {
    [PROCESS_DATA]: associateConvertRatio,
    [MODEL_REFERENCE]: associateConvertRatio,
    [DATABASE_DATA]: databaseData?.convertRatio,
    [SUPPLIER_DATA]: upOrDownSupplier?.convertRatio,
    [FACTOR_DATA]: convertRatio,
  };

  /** 数量单位的处理 */
  const unitBack = unit ? (isArray(unit) ? String(unit) : unit) : '';
  /** 上下游数据的产品单位 */
  const relatedProductUnitBack = relatedProductUnit
    ? isArray(relatedProductUnit)
      ? String(relatedProductUnit)
      : relatedProductUnit
    : '';

  /** 支撑材料的处理 */
  const supportMaterialsList =
    supportFile?.map((file: any) => {
      const { name: fileName, uid, url } = file || {};
      return omit(
        {
          ...file,
          fileId: uid,
          fileName,
          fileUrl: url,
        },
        ['name', 'uid', 'url'],
      );
    }) || [];
  /** 支撑材料 */
  const supportFiles = supportMaterialsList?.length
    ? JSON.stringify(supportMaterialsList)
    : undefined;

  /** 输入输出基本信息 */
  const baseInfo = {
    dataType,
    ioName,
    ioNameEn,
    dataValue,
    unit: unitBack,
    weightRatio,
    depreciationRate: dataType === CAPITAL_GOODS ? depreciationRate : undefined,
    suppDesc,
  };

  /** 全部公共信息 */
  const wholeIOData = {
    // 基本信息
    ...baseInfo,
    // 上下游数据链接类型
    linkType,
    // 单位换算比例
    convertRatio: usedConvertRatio?.[linkType as keyof typeof usedConvertRatio],
    // 支撑材料
    supportFile: supportFiles,
  };

  /** 自建因子数据 */
  const factorData = {
    factorName: relatedProcessName,
    productName: relatedProductName,
    productUnit: relatedProductUnitBack,
    timeRepresentStart,
    timeRepresentEnd,
    areaRepresent,
    areaRepresentDetail,
    assessmentList,
  };
  if (linkType === FACTOR_DATA) {
    return { ...wholeIOData, ...factorData };
  }

  if (linkType === DATABASE_DATA) {
    const lcaFactorCategory = upOrDownDatabase?.lcaFactorCategory;
    return {
      ...wholeIOData,
      lcaFactorCategory: lcaFactorCategory
        ? String(lcaFactorCategory)
        : undefined,
      lcaMaterial: upOrDownDatabase?.lcaMaterial,
    };
  }
  return wholeIOData;
};

/** 编辑/详情反显时的数据处理 */
export const onHandleDetailData = ({
  showBaseLine,
  processManageDataSource,
  unitOptions,
  isDetail,
  dataCategoryOptions,
}: {
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 详情 */
  processManageDataSource: ProcessModelIORes;
  /** 单位 */
  unitOptions?: Dicts[];
  /** 是否是详情 */
  isDetail: boolean;
  /** 数据分类 */
  dataCategoryOptions?: DictTree[];
}) => {
  const {
    dataType,
    ioName,
    dataValue,
    baselineValue,
    unit,
    depreciationRate,
    suppDesc,
    /** 多语言数组 */
    languageSourceList,
    /** 上下游数据部分 */
    linkType,
    convertRatio,
    factorList,
    ioData,
    linkIo,
    /** 支撑材料 */
    supportFile,
    /** 供应商结果数据 */
    supplierRef,
  } = processManageDataSource || {};

  /** 反处理多语言 */
  const langFields = reverseHandleLangFields(languageSourceList);

  /** 获取单位名称 */
  const getUnitLabel = (dictValue: string) => {
    const unitEnumsItem = unitOptions?.find(
      item => item.dictValue === dictValue,
    );
    return unitEnumsItem?.dictLabel;
  };
  /** 数量单位处理 */
  const unitArr = unit ? unit.split(',') : undefined;
  const unitBack =
    isDetail && unit ? getUnitLabel((unitArr || [])?.[1]) : unitArr;

  /** 数据分类处理 */
  const lcaFactorCategoryArr = ioData?.lcaFactorCategory
    ? ioData?.lcaFactorCategory?.split(',')
    : undefined;
  const lcaFactorCategoryBack =
    isDetail && lcaFactorCategoryArr
      ? getNameByValuePath(dataCategoryOptions || [], lcaFactorCategoryArr)
      : lcaFactorCategoryArr;

  /** 地理代表性处理-数据库数据 */
  const areaRepresent = `${ioData?.areaRepresent || ''}${
    ioData?.areaRepresentDetail ? `-${ioData?.areaRepresentDetail}` : ''
  }`;

  /** 支撑材料 */
  let supportMaterialsFileList = [];
  if (supportFile && typeof supportFile === 'string') {
    try {
      const parsedFileData = JSON.parse(supportFile) || [];
      supportMaterialsFileList = parsedFileData?.map((file: UploadFile) => {
        const { fileName, fileId, fileUrl } = file || {};
        return {
          ...file,
          name: fileName,
          uid: fileId,
          url: fileUrl,
        };
      });
    } catch (error) {
      // 防止脏数据导致页面空白
    }
  } else {
    supportMaterialsFileList = [];
  }

  /** 产品单位处理 */
  const relatedProductUnitArr = ioData?.productUnit
    ? ioData?.productUnit?.split(',')
    : undefined;
  const relatedProductUnitBack =
    isDetail && ioData?.productUnit
      ? getUnitLabel((relatedProductUnitArr || [])?.[1])
      : relatedProductUnitArr;

  /** 时间是否为空-修复详情页空值展示问题 */
  const isDetailTimeNull =
    isDetail && !linkIo?.timeRepresentStart && !linkIo?.timeRepresentEnd;

  /** 上游关联输出/下游关联输入-过程数据/模型引用 */
  const upOrDownAssociatesData = {
    renewableProcessName: linkIo?.processName,
    relatedInputName: linkIo?.ioName,
    relatedInputNum: linkIo?.dataValue,
    relatedInputUnit: linkIo?.unitName,
    convertRatio: convertRatio ?? '',
    convertRatioIsEnabled: !isDetail,
  };

  /** 处理评价指标表格数据值为科学记数法-引用供应商结果数据 */
  const newSupplierResultList = supplierRef?.resultList?.map(list => ({
    ...list,
    dataValue: formatScientific(list?.dataValue),
  }));

  /** 处理评价指标表格数据值为科学记数法-自建因子 */
  const newFactorListResultList = isDetail
    ? factorList?.map(list => ({
        ...list,
        dataValue: formatScientific(list?.dataValue),
      }))
    : factorList;

  const allUpOrDownData = {
    [PROCESS_DATA]: {
      /** 上下游数据-过程数据 */
      upOrDownstreamData: {
        ...linkIo,
        relatedProcessName: linkIo?.processName,
        timeRepresentStart: isDetailTimeNull
          ? '-'
          : linkIo?.timeRepresentStart || undefined,
        timeRepresentEnd: linkIo?.timeRepresentEnd || undefined,
        areaRepresent: linkIo?.areaRepresent || undefined,
      },
      /** 上游关联输出/下游关联输入-过程数据 */
      upOrDownAssociates: upOrDownAssociatesData,
    },
    [MODEL_REFERENCE]: {
      /** 上下游数据-模型引用 */
      upOrDownModel: {
        modelName: ioData?.modelName,
        modelCode: ioData?.modelCode,
        modelFuncUnit: ioData?.funcUnit,
        modelOrgId: ioData?.orgName,
        modelProductCycle:
          ioData?.startTime && ioData?.endTime
            ? `${ioData?.startTime}~${ioData?.endTime}`
            : '-',
        modelProductName: ioData?.productName,
        modelProductCode: ioData?.productCode,
        modelSupplierName: ioData?.supplierName,
      },
      /** 上游关联输出/下游关联输入-模型引用 */
      upOrDownAssociates: upOrDownAssociatesData,
    },
    [DATABASE_DATA]: {
      /** 数据分类 */
      upOrDownDatabase: {
        lcaFactorCategory: lcaFactorCategoryBack,
        lcaMaterial: ioData?.lcaMaterial,
      },
      /** 数据库数据 */
      databaseData: {
        databaseActivityName: ioData?.factorName,
        databaseProductName: ioData?.productName,
        databaseYear: ioData?.year,
        areaRepresent,
        databaseName: ioData?.dbName,
        databaseProductUnit: ioData?.productUnitName,
        convertRatio: convertRatio ?? '',
        convertRatioIsEnabled: !isDetail,
      },
    },
    [SUPPLIER_DATA]: {
      /** 上下游数据-引用供应商结果数据 */
      upOrDownSupplier: {
        supplyCode: supplierRef?.dataCode,
        supplyName: supplierRef?.supplierName,
        supplyProductName: supplierRef?.productName,
        supplyUnit: supplierRef?.productUnitName,
        supplyMethod: supplierRef?.assessmentMethodName,
        supplyAssessmentList: newSupplierResultList,
        convertRatio: convertRatio ?? '',
        convertRatioIsEnabled: !isDetail,
      },
    },
    [FACTOR_DATA]: {
      /** 上下游数据-自建因子 */
      upOrDownstreamData: {
        relatedProcessName: ioData?.factorName,
        relatedProductName: ioData?.productName,
        relatedProductUnit: relatedProductUnitBack,
        convertRatio: convertRatio ?? '',
        timeRepresentStart: ioData?.timeRepresentStart,
        timeRepresentEnd: ioData?.timeRepresentEnd,
        areaRepresent: ioData?.areaRepresent,
        areaRepresentDetail: ioData?.areaRepresentDetail,
        assessmentList: newFactorListResultList,
      },
    },
  };

  return {
    dataType,
    ioName,
    ...langFields,
    dataValue: showBaseLine ? baselineValue : dataValue,
    unit: unitBack,
    depreciationRate,
    suppDesc,
    linkType,
    ...allUpOrDownData[linkType as keyof typeof allUpOrDownData],
    supportFile: supportMaterialsFileList,
  };
};
