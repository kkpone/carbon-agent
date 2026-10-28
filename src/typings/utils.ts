import { SelectProps, SelectValue } from 'antd/lib/select';

type Props<T = Options> = {
  placeholder?: string;
  onChange?: (value: SelectValue) => void;
  onAddItem?: (value: string) => Promise<any>;
  onDelItem?: (id: number, label: string) => Promise<any>;
  options?: T;
  style?: React.CSSProperties;
  defaultValue?: string | number;
  value?: string | number;
  filterOption?: SelectProps<T>['filterOption'];
  disabled?: boolean;
  className?: string;
};
const isOptionsType = (list?: any[]): list is Required<Props>['options'] => {
  if (!list) return true;
  if (list.length && list[0]?.value && list[0]?.label) return true;
  return false;
};
export const checkList = (list?: any[]): Props['options'] =>
  isOptionsType(list) ? list : undefined;
export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
}[];
