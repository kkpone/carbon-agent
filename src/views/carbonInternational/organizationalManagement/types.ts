/**
 * @file 排放信息类型
 */

import { EmissionList } from '@api/carbon-international/types';
import { Dictionary } from '@src/typings';
import { FormInstance, SelectProps } from 'antd';
import { Props as SelectorProps } from './components/Selector';
import { Props as InputProps } from './components/Input';
import { Props as CheckboxGroupProps } from './components/CheckboxGroup';
import { Props as SelectAndMsgBox } from './components/SelectAndMsgBox';
import { UnitCascaderProps } from './components/Cascader';
import { SelectAndCascaderProps } from './components/SelectAndCascader';

export enum EmissionFormType {
  'select',
  'input',
  'checkboxGroup',
  'selectAndMsgBox',
  'cascader',
  'selectAndCascader',
  'empty',
}

export type SelectOptions = SelectProps<
  string,
  {
    label: string;
    value: string | number;
    disabled?: boolean;
  }
>['options'];

export type StepOneChildType =
  | {
      getForm: () => FormInstance;
    }
  | undefined;
export type Children =
  | { type: EmissionFormType.select; props: SelectorProps }
  | { type: EmissionFormType.input; props: InputProps }
  | { type: EmissionFormType.selectAndMsgBox; props: SelectAndMsgBox }
  | { type: EmissionFormType.checkboxGroup; props: CheckboxGroupProps }
  | { type: EmissionFormType.cascader; props: UnitCascaderProps }
  | { type: EmissionFormType.selectAndCascader; props: SelectAndCascaderProps }
  | { type: EmissionFormType.empty };

export type EmissionArr = {
  title: string;
  props: { childrenColSpan?: number[] } & Dictionary<any>;
  children: Children[];
};

type FormTargetBasePath = string | string[];
export type FormValueTargetPath =
  | {
      [key: string]: string[];
    }
  | FormTargetBasePath;

/** cascade 单位类型 */
export type UnitCascaderOptions = Omit<EmissionList, 'value'> & {
  value: string;
  children: UnitCascaderOptions[];
};
