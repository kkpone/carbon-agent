/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-25 17:31:31
 * @Date: 2022-12-27 10:34:47
 * @@description: 快速核算 - 列表
 */
import I18N from '@src/lang/I18N';

/**
 * 供应商管理列表页,供应商管理审核页 筛选框
 */
export const carbonDataOptions = [
  { label: I18N.carbonFootprint3.whole, value: null },
  { label: I18N.enterpriseCarbonAccount2.toBeFilledOut, value: 0 },
  { label: I18N.enterpriseCarbonAccount2.reported, value: 1 },
  { label: I18N.carbonFootprint3.pendingReview, value: 2 },
  { label: I18N.carbonFootprint3.approved, value: 3 },
  { label: I18N.carbonFootprint3.reviewFailed2, value: 4 },
];
