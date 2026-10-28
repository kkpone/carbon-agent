/*
 * @@description: formily schema 工具函数
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-02-14 16:54:28
 * @LastEditors: ljh255 jinhai@carbonstop.net
 * @LastEditTime: 2023-03-28 14:50:23
 */

import { ArrayTable, ArrayBase, IArrayBaseContext } from '@formily/antd-v5';
import { ISchema } from '@formily/react';
import { FormLayout } from 'antd/es/form/Form';
import { ReactNode } from 'react';

import { MenuType, TableActions } from '@/components/Table/TableActions';
import I18N from '@/lang/I18N';

type EmptyComponentProps<T = any> = {
  showVal?: (row: T, index?: number) => ReactNode;
};
const EmptyComponent = <T = any,>(props?: EmptyComponentProps<T>) => {
  const row = ArrayTable?.useRecord?.();
  const index = ArrayTable?.useIndex?.();
  return <div>{props?.showVal?.(row, index) ?? ''}</div>;
};
/** 渲染空节点 */
export const renderEmptySchema = <T = any,>(
  props?: ISchema,
  additionProps?: EmptyComponentProps<T>,
): ISchema => ({
  type: 'void',
  'x-decorator': 'FormItem',
  'x-component': EmptyComponent,
  'x-component-props': additionProps,
  ...props,
});

const FormilyTableActions = (props: any) => {
  const row = ArrayTable?.useRecord?.();
  const index = ArrayTable?.useIndex?.();
  const array = ArrayBase?.useArray?.();

  return <TableActions menus={props.actionBtns({ row, index, array }) || []} />;
};
/**
 * 渲染formily table的actions
 * @param param0.wrapperProps [ISchema]   'ArrayTable.Column' 层 schema
 * @param param0.actionBtns   [Function]  返回tableAction 组件的按钮
 * @param param0.width        [Number]    column 宽度
 * @returns
 */
export const renderFormilyTableAction = <Row = any,>({
  wrapperProps,
  actionBtns,
  width,
}: {
  width?: number;
  actionBtns?: (props: {
    row: Row;
    index: number;
    array: IArrayBaseContext;
  }) => MenuType[];
  wrapperProps?: ISchema;
}): ISchema => ({
  type: 'void',
  'x-component': 'ArrayTable.Column',

  properties: {
    action: {
      type: 'void',
      'x-component': FormilyTableActions,
      'x-component-props': { actionBtns },
    },
  },
  ...wrapperProps,
  'x-component-props': {
    title: I18N.Factors.operation,
    width,
    ...wrapperProps?.['x-component-props'],
  },
});

type FormItemSchemaProps = {
  /** required为动态-解决动态required校验文本丢失问题 */
  dynamicRequired?: boolean;
  /** 自定义校验文本 */
  customValidate?: string;
  /** 当不需要展示title 时，替代title内容 */
  validateTitle?: string;
} & ISchema;
/** 渲染节点 schema
 * 默认required true
 */
export const renderFormItemSchema = ({
  dynamicRequired = false,
  customValidate,
  validateTitle,
  required,
  ...props
}: FormItemSchemaProps): ISchema => {
  const isInput = [
    'Input',
    'NumberPicker',
    'Input.TextArea',
    'TextArea',
  ].includes(props['x-component']);

  const placeholder = isInput
    ? I18N.utils.pleaseEnter
    : I18N.utils.pleaseSelect;
  const oldValidator = props['x-validator'];
  const validator =
    Object.is(required, false) && !dynamicRequired
      ? undefined
      : [
          {
            required,
            message:
              customValidate ||
              `${placeholder}${props.title || validateTitle || ''}`,
          },
        ].concat(oldValidator || []);
  return {
    type: 'string',
    required: !!validator,
    'x-decorator': 'FormItem',
    ...props,
    'x-validator': [...(validator || [])],
    'x-component-props': {
      placeholder,
      ...props?.['x-component-props'],
    },
  };
};
type RenderSchemaWithLayoutOptions = {
  layout?: FormLayout;
};
export const renderSchemaWithLayout = (
  options: RenderSchemaWithLayoutOptions,
  props: ISchema['properties'],
): ISchema => ({
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        layout: options.layout || 'vertical',
      },
      properties: props,
    },
  },
});

type FromGridSchemaProps = ISchema & {
  columns?: number;
};
/** 保持全局相同的Grid 配置
 * 默认 布局 3列
 */
export const renderFromGridSchema = (props?: FromGridSchemaProps): ISchema => {
  const { columns, ...schemaProps } = props || {};
  return {
    type: 'void',
    'x-component': 'FormGrid',
    'x-component-props': {
      maxColumns: columns || 3,
      minColumns: columns || 3,
      columnGap: 25,
      rowGap: 2,
      colWrap: true,
    },
    ...schemaProps,
  };
};
