/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-09 10:15:43
 * @Date: 2022-12-27 10:34:47
 * @@description: 快速核算 - 列表
 */
import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';

/**
 * 供应商管理列表页,供应商管理审核页 筛选框
 */

export const formList: FromItemProps<any>[] = [
  {
    label: '',
    name: 'companyName',
    type: 'input',
    rules: false,
    placeholder: I18N.carbonFootprint3.supplierName,
    props: {
      style: { width: 208 },
    },
  },
  {
    label: '',
    name: 'result',
    type: 'select',
    rules: false,
    placeholder: I18N.carbonFootprint.state,
    props: {
      options: [
        { label: I18N.carbonFootprint3.whole, value: null },
        { label: I18N.carbonFootprint3.fillingIn, value: 0 },
        { label: I18N.carbonFootprint3.unfilled, value: 1 },
        { label: I18N.carbonFootprint3.pendingReview, value: 2 },
        { label: I18N.carbonFootprint3.approved, value: 3 },
        { label: I18N.carbonFootprint3.reviewFailed2, value: 4 },
      ],
      style: { width: 208 },
    },
  },
];
