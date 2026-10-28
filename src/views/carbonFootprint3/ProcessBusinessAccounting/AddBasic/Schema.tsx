/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 15:16:49
 * @Date: 2023-02-28 16:15:05
 * @@description:
 */
import { Form } from '@formily/core';
import { ISchema } from '@formily/react';
import { DebouncedFunc } from 'lodash-es';

import { quickBusinessAccountingBasicSchema } from '../../QuickBusinessAccounting/addBasic/model';

/** 过程核算 - 新增基本信息 */
export const processBusinessAccountingBasicSchema = (
  productSearchRef: React.MutableRefObject<{
    productSearchValue: string;
  }>,
  form: Form<any>,
  callbackFunc: DebouncedFunc<(form: Form<any>) => Promise<void>>,
): ISchema => {
  const data = quickBusinessAccountingBasicSchema(
    productSearchRef,
    form,
    callbackFunc,
  );
  return data;
};
