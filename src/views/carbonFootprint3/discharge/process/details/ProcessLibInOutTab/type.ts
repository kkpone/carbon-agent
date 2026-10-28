/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-23 19:25:43
 * @Date: 2023-02-23 18:06:48
 * @@description:
 */
import { Form } from '@formily/core';
import { ProcessBusinessAccountingMenu } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/type';
import { Ref } from 'react';

type ProcessDrawerRef = {
  form?: Form;
  okSub: (options?: {
    requestSupplier?: boolean;
  }) => Promise<string | undefined>;
  cancelSub: () => void;
};

/** 过程中产品组件Props */
type ProcessLibProductProps = {
  id: number;
  productId?: number | null;
  isEdit: boolean;
  processLibName: string;
  formValuesString?: Record<string, any>;
};

/** 过程中产品组件Props */
export interface ProcessLibProductAddProps extends ProcessLibProductProps {
  isProcessBusinessAccount?: boolean;
  processTreeInfo?: ProcessBusinessAccountingMenu;
  cRef: Ref<ProcessDrawerRef | undefined>;
}
