/**
 * @file 单位双cascade，用于添加碳排放数据
 * @author qifeng
 */
import I18N from '@src/lang/I18N';
import { Cascader } from '@src/components/Cascader';
import { NewSelectProps, Select } from '@src/components/Select';
import { Form } from 'antd';
import { UnitCascaderOptions } from '../types';
import { UnitCascaderProps } from './Cascader';
import style from './formItems.module.less';
import { BaseProps } from './Selector';

export type SelectAndCascaderProps<DataNodeType = UnitCascaderOptions> = {
  first: Omit<
    NewSelectProps<string, { label: string; value: string }>,
    'aria-label'
  > &
    BaseProps;
  second: UnitCascaderProps<DataNodeType>;
};

export const SelectAndCascader = <T = UnitCascaderOptions,>({
  first: { label, name, rules, ...props },
  second: { label: label2, name: name2, rules: rules2, ...props2 },
}: SelectAndCascaderProps<T>) => (
  <div className={style.doubleCascaderWrapper}>
    <Form.Item {...{ label, name, rules }}>
      <Select
        placeholder={I18N.carbonFootprint.pleaseSelect}
        {...props}
        aria-label={typeof name === 'object' ? name.join('-') : String(name)}
      />
    </Form.Item>
    <span className={style.devide}>/</span>
    <Form.Item {...{ name: name2, rules: rules2 }}>
      <Cascader<T>
        {...props2}
        displayRender={label => label?.[1]}
        aria-label={typeof name2 === 'object' ? name2.join('-') : String(name2)}
      />
    </Form.Item>
  </div>
);
