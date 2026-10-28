/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 20:22:30
 * @Date: 2022-12-27 10:34:47
 * @@description:供应商详情表单
 */
import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyDate,
  initFormilyInputTextArea,
  initFormilyRadio,
  initFormilyCheckBox,
  initFormilyCascader,
} from '@src/components/FormilyUtil/util';

import {
  computationScopeGHG,
  computationScopeISO,
  footBorderType,
} from '../../schema';
import { disabledDate, disabledDateYear } from '../../utils';
import { carbonDataOptions } from '../form';

/**
 *
 * @param
 * @returns 碳数据管理-供应商碳数据-碳数据概览
 */
export const carbonDataPriviewSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 30,
      },
      properties: {
        computeCompanyName: {
          ...initFormilyInput(I18N.carbonFootprint3.supplierName, false),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
        reqType: {
          ...initFormilySelect(I18N.carbonFootprint3.dataType, false, {
            options: [
              { label: I18N.carbonFootprint.carbonFootprintVerification2, value: 1 },
              { label: I18N.carbonFootprint3.enterpriseCarbonAccounting, value: 2 },
              { label: I18N.carbonFootprint.carbonFootprintVerification2, value: 3 },
              { label: I18N.carbonFootprint.carbonFootprintVerification2, value: 4 },
            ],
          }),
        },
        emissionDesc: {
          ...initFormilyInput(I18N.carbonFootprint3.greenhouseGasEmissions, false),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
        submitTime: {
          ...initFormilyInput(I18N.carbonFootprint3.submissionTime, false),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
        status: {
          ...initFormilySelect(I18N.carbonFootprint.state, false, {
            options: carbonDataOptions,
          }),
        },
      },
    },
  },
});

/**
 * 供应商管理- 供应商列表  申请企业碳核算
 */
export const dataRequestSchema = (type?: string): ISchema => {
  const linkUserCommData = {
    createBy: {
      ...initFormilyInput(I18N.system.applicant, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    phone: {
      ...initFormilyInput(I18N.supplyChain2.applicantContact, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    createTime: {
      ...initFormilyInput(I18N.system.applicationTime, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    descr: {
      type: 'string',
      'x-decorator-props': {
        gridSpan: 2,
      },
      ...initFormilyInputTextArea(I18N.carbonFootprint3.dataRequirementDescription, false, {
        rows: 4,
      }),
      'x-validator': {
        max: 1000,
      },
    },
  };
  const productData = {
    name: {
      ...initFormilyInput(I18N.carbonFootprint3.purchasingProducts, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    computationUnitArr: {
      ...initFormilyCascader(I18N.carbonFootprint3.accountingUnit, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    expireTime: {
      // @ts-ignore
      ...initFormilyInput(I18N.carbonFootprint3.deadline, false, { disabledDate }),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    dataType: {
      type: 'string',
      'x-decorator-props': {
        gridSpan: 2,
      },
      default: 1,
      ...initFormilyRadio(I18N.carbonFootprint3.dataRequestClass, false, {
        options: [
          { label: I18N.carbonFootprint3.carbonFootprintVerification2, value: 1 },
          { label: I18N.carbonFootprint3.carbonFootprintVerification2, value: 4 },
          { label: I18N.carbonFootprint3.carbonFootprintVerification, value: 2 },
          { label: I18N.carbonFootprint3.carbonFootprintVerification, value: 3 },
        ],
      }),
    },
  };
  if (type === 'footPrint') {
    return {
      type: 'object',
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          'x-component-props': {
            maxColumns: 3,
            columnGap: 30,
          },
          properties: {
            demand: {
              type: 'string',
              ...initFormilyInput(I18N.supplyChain2.carbonFootprintVerification3, false),
            },
            ...productData,
            ...footBorderType,
            ...linkUserCommData,
          },
        },
      },
    };
  }
  if (type === 'carbonAccount') {
    return {
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
            demand: {
              ...initFormilyInput(I18N.carbonFootprint.accountingName, false),
              type: 'string',
              'x-validator': {
                max: 100,
              },
            },
            ...productData,
            ...footBorderType,
            ...linkUserCommData,
          },
        },
      },
    };
  }
  if (type === 'purchase') {
    return {
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
            ...productData,
            ac: {
              type: 'void',
              'x-component': () => <div />,
              'x-decorator': 'FormItem',
            },
            ...footBorderType,
            ...linkUserCommData,
          },
        },
      },
    };
  }

  if (type === 'supplier') {
    const carbonAccount: ISchema = {
      type: 'object',
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          'x-component-props': {
            maxColumns: 3,
            columnGap: 30,
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
              type: 'string',
              ...initFormilyDate(I18N.carbonFootprint3.accountingYear2, true, {
                picker: 'year',
                disabledDate: disabledDateYear,
              }),
              'x-validator': {
                max: 50,
              },
            },
            expireTime: {
              type: 'string',
              ...initFormilyDate(I18N.carbonFootprint3.deadline, true, { disabledDate }),
              'x-validator': {
                max: 100,
              },
            },
            dataType: {
              type: 'string',
              ...initFormilyRadio(I18N.carbonFootprint3.dataRequestClass, true, {
                options: [
                  { label: I18N.supplyChain2.enterpriseCarbonAccounting5, value: 1 },
                  { label: I18N.supplyChain2.enterpriseCarbonAccounting5, value: 4 },
                  { label: I18N.supplyChain2.enterpriseCarbonAccounting4, value: 2 },
                  { label: I18N.supplyChain2.enterpriseCarbonAccounting4, value: 3 },
                ],
              }),
              'x-validator': {
                max: 11,
              },
              'x-decorator-props': {
                gridSpan: 1,
              },
            },
            computationTypes: {
              type: 'string',
              ...initFormilyCheckBox(I18N.supplyChain2.enterpriseCarbonAccounting3, true, {
                options: [
                  { label: 'GHG Protocol', value: '1' },
                  { label: 'ISO 14064-1:2018', value: '2' },
                ],
              }),
              'x-validator': {
                max: 11,
              },
            },
            adzcx: {
              type: 'void',
              'x-component': () => <div />,
              'x-decorator': 'FromItem',
            },
            computationScopeGHG,
            computationScopeISO,
            ...linkUserCommData,
          },
        },
      },
    };
    return carbonAccount;
  }
  return {};
};

/**
 * 审核弹窗
 */

export const auditSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 1,
        columnGap: 24,
      },
      properties: {
        result: {
          type: 'string',
          ...initFormilyRadio(I18N.carbonFootprint3.findingsOfAudit, true, {
            options: [
              { label: I18N.carbonFootprint3.approved, value: '3' },
              { label: I18N.carbonFootprint3.reviewFailed2, value: '4' },
            ],
          }),
        },
        content: {
          type: 'string',
          ...initFormilyInputTextArea(I18N.carbonFootprint3.reviewRemarks, false, {
            rows: 4,
          }),
          'x-validator': {
            max: 1000,
            message: I18N.carbonFootprint3.pleaseFillInTheReviewForm,
            required: true,
          },
          'x-reactions': {
            dependencies: ['result'], // 依赖路径写法默认是取value，如果依赖的是字段的其他属性，可以使用 source#modified，用#分割取详细属性
            when: "{{$deps[0] === '4'}}",
            otherwise: {
              state: {
                required: false,
              },
            },
            fulfill: {
              state: {
                validator: [{ required: true, massage: I18N.carbonFootprint3.pleaseFillInTheReviewForm }],
              },
            },
          },
        },
      },
    },
  },
});
