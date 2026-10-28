/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 11:36:59
 * @Date: 2022-12-27 10:34:47
 * @@description: 快速核算 - 列表
 */
import I18N from '@src/lang/I18N';

// 审核状态
export const statusArr = [
  { class: 'gray base', value: I18N.enterpriseCarbonAccount2.toBeFilledOut },
  { class: 'blue base', value: I18N.enterpriseCarbonAccount2.reported },
  { class: 'off base', value: I18N.carbonFootprint3.pendingReview },
  { class: 'on base', value: I18N.carbonFootprint3.approved },
  { class: 'pass base', value: I18N.carbonFootprint3.reviewFailed2 },
];
