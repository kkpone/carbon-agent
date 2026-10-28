/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-22 17:28:20
 * @Date: 2022-12-27 10:34:47
 * @@description:供应商详情表单
 */
import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyInputTextArea,
  initFormilyRadio,
} from '@src/components/FormilyUtil/util';
import { carbonDataOptions } from '@src/views/supplyChain2/carbonDataManage/form';
import { footBorderType } from '@src/views/supplyChain2/schema';

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
        companyName: {
          ...initFormilyInput(I18N.carbonFootprint3.supplierName, false),
          type: 'string',
          'x-validator': {
            max: 100,
          },
        },
        dataType: {
          ...initFormilySelect(I18N.carbonFootprint3.dataType, false, {
            options: [
              {
                label: I18N.carbonFootprint.carbonFootprintVerification2,
                value: 1,
              },
              {
                label: I18N.carbonFootprint3.enterpriseCarbonAccounting,
                value: 2,
              },
            ],
          }),
        },
        emissionDesc: {
          ...initFormilyInput(
            I18N.carbonFootprint3.greenhouseGasEmissions,
            false,
          ),
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
 * 供应商管理- 数据请求
 */
export const dataRequestSchema = (): ISchema => {
  const linkUserCommData = {
    contacts: {
      ...initFormilyInput(I18N.carbonFootprint.contacts, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    phone: {
      ...initFormilyInput(I18N.carbonFootprint3.contactInformation, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    auditTime: {
      ...initFormilyInput(I18N.carbonFootprint3.reviewTime, false),
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
      ...initFormilyInputTextArea(
        I18N.carbonFootprint3.dataRequirementDescription,
        false,
        {
          rows: 4,
        },
      ),
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
    computationUnit: {
      ...initFormilyInput(I18N.carbonFootprint3.accountingUnit, false),
      type: 'string',
      'x-validator': {
        max: 100,
      },
    },
    expireTime: {
      ...initFormilyInput(I18N.carbonFootprint3.deadline, false),
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
      ...initFormilyRadio(I18N.carbonFootprint3.dataRequestClass, false, {
        options: [
          {
            label: I18N.carbonFootprint3.carbonFootprintVerification2,
            value: '1',
          },
          {
            label: I18N.carbonFootprint3.carbonFootprintVerification,
            value: '2',
          },
        ],
      }),
    },
  };

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
          computationName: {
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
        productDesc: {
          type: 'string',
          ...initFormilyRadio(I18N.carbonFootprint3.findingsOfAudit, true, {
            options: [
              { label: I18N.carbonFootprint3.approved, value: '1' },
              { label: I18N.carbonFootprint3.reviewFailed2, value: '2' },
            ],
          }),
        },
        productDessc: {
          type: 'string',
          ...initFormilyInputTextArea(
            I18N.carbonFootprint3.reviewRemarks,
            false,
            {
              rows: 4,
            },
          ),
          'x-reactions': {
            dependencies: ['productDesc'], // 依赖路径写法默认是取value，如果依赖的是字段的其他属性，可以使用 source#modified，用#分割取详细属性
            when: "{{$deps[0] === '2'}}",
            otherwise: {
              state: {
                required: false,
              },
            },
            fulfill: {
              state: {
                validator: [
                  {
                    required: true,
                    massage: I18N.carbonFootprint3.pleaseFillInTheReviewForm,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
});
