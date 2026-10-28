/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 20:21:08
 * @Date: 2022-12-27 10:34:47
 * @@description: 快速核算 - 列表
 */
import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyDate,
  initFormilyInput,
  initFormilyCascader,
  initFormilyRadio,
  initFormilyCheckBox,
} from '@src/components/FormilyUtil/util';

import {
  disabledDateYear,
  RegFactorEmission,
  RegFactorUnitDischarge,
} from './utils';

/** 系统边界要求 */
export const footBorderType = {
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
    ...initFormilyRadio(I18N.carbonFootprint3.theSystemBoundaryNeedsTo, true, {
      style: {
        display: 'grid',
      },
    }),
    'x-validator': {
      required: true,
    },
  },
};

/**
 * 产品碳足迹核算结果
 * 页面 1.采购产品管理-查看-产品碳足迹详情-核算结果
 *      2.碳数据管理-供应商碳数据-查看/审核-填报数据-产品碳足迹核算结果
 */
export const productCarbonPrintResultSchema = (
  footBorderTypes?: number,
): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 40,
      },
      properties: {
        name: {
          ...initFormilyInput(I18N.carbonFootprint.productName),
          type: 'string',
        },
        computationUnitArr: {
          type: 'string',
          ...initFormilyCascader(I18N.carbonFootprint3.accountingUnit),
        },
        year: {
          type: 'string',
          ...initFormilyDate(I18N.carbonFootprint3.accountingYear2, true, {
            picker: 'year',
            disabledDate: disabledDateYear,
          }),
        },
        table: {
          type: 'array',
          'x-decorator': 'FormItem',
          title: I18N.carbonFootprint.unitProductScheduling,
          'x-component': 'ArrayTable',
          'x-decorator-props': {
            gridSpan: 3,
          },
          items: {
            type: 'object',
            // 'x-designable-id': 'rawMaterial',
            properties: {
              rawMaterial: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.supplyChain2.rawMaterialAcquisition,
                },
                'x-index': 0,
                name: 'rawMaterial',
                properties: {
                  rawMaterial: {
                    type: 'string',
                    'x-component': 'Text',
                    'x-decorator': 'FormItem',
                  },
                },
              },
              manufacturing: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.supplyChain2.productionAndManufacturingLevel,
                },
                'x-index': 1,
                name: 'manufacturing',
                properties: {
                  manufacturing: {
                    type: 'string',
                    'x-component': 'Text',
                    'x-decorator': 'FormItem',
                  },
                },
              },
              distribution: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.supplyChain2.distributionAndStorage,
                },
                'x-index': 2,
                name: 'distribution',
                properties: {
                  distribution: {
                    type: 'string',
                    'x-component': 'Text',
                    'x-decorator': 'FormItem',
                  },
                },
              },
              employ: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.supplyChain2.productUsageLevel,
                },
                'x-index': 3,
                name: 'employ',
                properties: {
                  employ: {
                    type: 'string',
                    'x-component': 'Text',
                    'x-decorator': 'FormItem',
                  },
                },
              },
              abandon: {
                type: 'void',
                'x-component': 'ArrayTable.Column',
                'x-component-props': {
                  title: I18N.supplyChain2.wasteDisposalStage2,
                },
                'x-index': 4,
                name: 'abandon',
                properties: {
                  abandon: {
                    type: 'string',
                    'x-component': 'Text',
                    'x-decorator': 'FormItem',
                  },
                },
              },
            },
          },
        },
        emission: {
          type: 'number',
          ...initFormilyInput(
            footBorderTypes === 1
              ? I18N.supplyChain2.unitProductScheduling13
              : I18N.supplyChain2.unitProductScheduling11,
            true,
            {},
          ),
          'x-validator': val => RegFactorUnitDischarge(val),
          'x-decorator-props': {
            gridSpan: 1,
          },
          'x-decorator': 'FormItem',
        },
      },
    },
  },
});
/** 企业碳核算结果*/
export const carbonAccounResultSchema = () => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 40,
      },
      properties: {
        computeCompanyName: {
          ...initFormilyInput(I18N.carbonFootprint3.supplierName, false),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
        computationYear: {
          ...initFormilyInput(I18N.carbonFootprint3.accountingYear2, false, {
            // @ts-ignore
            picker: 'year',
            disabledDate: disabledDateYear,
          }),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
        emission: {
          ...initFormilyInput(I18N.supplyChain2.totalEmissionsT, false),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
      },
    },
  },
});
/** 企业碳核算结果GHG*/
export const carbonAccounResultGHGSchema = () => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 40,
      },
      properties: {
        ...GHGSchema,
      },
    },
  },
});
/** 企业碳核算结果ISO*/
export const carbonAccounResultISOSchema = () => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 40,
      },
      properties: {
        ...ISOSchema,
      },
    },
  },
});
export const computationScopeGHG = {
  type: 'string',
  ...initFormilyCheckBox(I18N.supplyChain2.accountingScopeG, true, {
    options: [
      { label: I18N.enterpriseCarbonAccount2.scopeOne, value: 1 },
      { label: I18N.enterpriseCarbonAccount2.scope2, value: 2 },
      { label: I18N.enterpriseCarbonAccount2.fanWeisan, value: 3 },
    ],
  }),
  default: [1, 2],
  'x-reactions': {
    dependencies: ['computationTypes'], // 依赖路径写法默认是取value，如果依赖的是字段的其他属性，可以使用 source#modified，用#分割取详细属性
    fulfill: {
      schema: {
        'x-visible': "{{$deps[0] && $deps[0][0] === '1'}}", // 任意层次属性都支持表达式
      },
    },
  },
  'x-decorator-props': {
    gridSpan: 3,
  },
  'x-validator': {
    required: true,
    message: I18N.supplyChain2.pleaseSelectAccounting4,
  },
};
export const computationScopeISO = {
  type: 'string',
  ...initFormilyCheckBox(I18N.supplyChain2.accountingScopeI, true, {
    options: [
      { label: I18N.enterpriseCarbonAccount2.directDischargeOr, value: '4' },
      {
        label: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
        value: '5',
      },
      {
        label: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
        value: '6',
      },
      { label: I18N.enterpriseCarbonAccount2.outsourcedProductsOr, value: '7' },
      {
        label: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain3,
        value: '8',
      },
      {
        label: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
        value: '9',
      },
    ],
  }),
  'x-validator': {
    required: true,
    message: I18N.supplyChain2.pleaseSelectAccounting4,
  },
  'x-reactions': {
    dependencies: ['computationTypes'], // 依赖路径写法默认是取value，如果依赖的是字段的其他属性，可以使用 source#modified，用#分割取详细属性
    fulfill: {
      schema: {
        'x-visible':
          "{{($deps[0]&& $deps[0][1] === '2')||$deps[0]&& $deps[0][0] === '2'}}", // 任意层次属性都支持表达式
      },
    },
  },
  'x-decorator-props': {
    gridSpan: 3,
  },
};
const GHGSchema = {
  ac: {
    type: 'void',
    'x-component': () => <b>{I18N.supplyChain2.accountingScopeG}</b>,
    'x-decorator-props': {
      gridSpan: 3,
    },
    'x-decorator': 'FormItem',
  },
  scopeOne: {
    ...initFormilyInput(I18N.enterpriseCarbonAccount2.scope1Emissions, false),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  scopeTwo: {
    ...initFormilyInput(I18N.enterpriseCarbonAccount2.scope2Emissions, false),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  scopeThree: {
    ...initFormilyInput(
      I18N.enterpriseCarbonAccount2.scopeThreeEmissions,
      false,
    ),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
};
const ISOSchema = {
  acd: {
    type: 'string',
    // title: '',
    'x-component': () => <b>{I18N.supplyChain2.accountingScopeI}</b>,
    'x-decorator': 'FormItem',
    'x-decorator-props': {
      gridSpan: 3,
    },
  },
  direct: {
    ...initFormilyInput(
      I18N.enterpriseCarbonAccount2.directDischargeOr2,
      false,
    ),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  energy: {
    ...initFormilyInput(
      I18N.enterpriseCarbonAccount2.indirectEnergyEmissions2,
      false,
    ),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  transportation: {
    ...initFormilyInput(
      I18N.enterpriseCarbonAccount2.transportationIndirectDischarge2,
      false,
    ),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  outsourcing: {
    ...initFormilyInput(
      I18N.enterpriseCarbonAccount2.outsourcedProductsOr2,
      false,
    ),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  supply: {
    ...initFormilyInput(I18N.supplyChain2.downstreamOfSupplyChain, false),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
  rests: {
    ...initFormilyInput(
      I18N.enterpriseCarbonAccount2.otherIndirectEmissions2,
      false,
    ),
    type: 'string',
    'x-validator': val => RegFactorEmission(val),
  },
};
