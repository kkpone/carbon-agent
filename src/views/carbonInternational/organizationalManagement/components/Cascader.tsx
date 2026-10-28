/**
 * @file 联级选择器 内部使用
 */
import I18N from '@src/lang/I18N';
import { Cascader as CascaderAnt } from '@src/components/Cascader';
import { AntdAddedType } from '@src/components/Input/type';
import { CascaderProps, Form } from 'antd';
import { UnitCascaderOptions } from '../types';
import { BaseProps } from './Selector';

export type UnitCascaderProps<DataNodeType = UnitCascaderOptions> =
  CascaderProps<DataNodeType> & Pick<AntdAddedType, 'readonly'> & BaseProps;

export const Cascader = <T = UnitCascaderOptions,>({
  label,
  rules,
  name,
  ...props
}: UnitCascaderProps<T>) => (
  <Form.Item {...{ label, name, rules }}>
    <CascaderAnt<T>
      placeholder={I18N.carbonFootprint.pleaseSelect}
      {...props}
      displayRender={label => label?.[1]}
      aria-label={typeof name === 'object' ? name.join('-') : String(name)}
    />
  </Form.Item>
);
