import { Form } from '@formily/core';
import { ReactNode } from 'react';

/**
 * @description: 产品碳足迹3.0通用型表单组件封装
 */
export interface FormilyCommonProps<FormDataType extends object> {
  children: ReactNode;
  form: Form<FormDataType>;
  className?: string;
  colon?: boolean;
}
