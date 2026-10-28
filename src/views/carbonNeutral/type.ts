import { InputProps } from 'antd/lib/input';
import { DatePickerProps } from 'antd/lib/date-picker';
import { Rule } from 'antd/lib/form';
import {
  ComstomDatePickerType,
  ComstomInputNumberType,
  ComstomInputType,
  ComstomSelectType,
} from './component/From/FromList';

// import {SelectProp} from ''
export interface CommonInterface {
  label: string;
  require: Rule[];
  className: string;
  name: string;
  tooltip?: string;
  disabled: boolean;
  placeholder?: string;
  typeoptions?: { dictValue: string; dictLabel: string; disabled?: boolean }[];
}

export type FormJson = CommonInterface & ItemType;
export type ItemType =
  | ({ type: 'Input' } & CommonInterface & InputProps & ComstomInputType)
  | ({
      type: 'InputNumber';
    } & CommonInterface &
      Partial<ComstomInputNumberType>)
  | ({
      type: 'SuffixInput';
    } & CommonInterface &
      Partial<ComstomInputNumberType>)
  | ({ type: 'DatePicker' } & DatePickerProps &
      CommonInterface &
      ComstomDatePickerType)
  | ({ type: 'Select' } & Partial<ComstomSelectType> &
      CommonInterface & {
        options: {
          disabled?: boolean;
          placeholder?: string;
        }[];
      })
  | ({
      type: 'RadioGroup' | 'CheckBox';
    } & CommonInterface &
      ComstomSelectType)
  | ({
      type?: 'TextArea' | 'addTable';
    } & CommonInterface)
  | ({
      type?: 'Cascader';
    } & CommonInterface &
      Partial<ComstomSelectType> & { fieldNames?: any })
  | { type: 'empty' };
