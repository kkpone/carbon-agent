/**
 * @file 所属行业、碳盘查负责部门、组织边界确定方式 下拉选择器
 * 目前仅考虑单选下的适配
 */

import I18N from '@src/lang/I18N';
import { Divider, Input, Spin } from 'antd';
import { ChangeEvent, memo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { SelectValue } from 'antd/lib/select';
import IconFont from '@components/iconfont';
import classNames from 'classnames';
import { Select, NewSelectProps, Option } from '@src/components/Select';
import styles from './index.module.less';

export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
};
export const filterOption: NewSelectProps<Options[], any>['filterOption'] = (
  input,
  options,
) => {
  const children: string | string[] | undefined = options?.props?.children;
  if (typeof children === 'string') {
    return children.toLowerCase().includes(input);
  }
  return !!children?.some((t: string) => {
    if (!t) return false;
    return String(t)?.toLowerCase()?.includes(input);
  });
};
type ValueTypes = string | number | undefined;
export type Props<T = Options[] | string[], ValueType = ValueTypes> = {
  placeholder?: string;
  onChange?: (value: SelectValue) => void;
  onAddItem?: (value: string) => Promise<any>;
  onDelItem?: (id: number, label: string, item: any) => Promise<any>;
  options?: T;
  style?: React.CSSProperties;
  defaultValue?: string | number;
  value?: string | number;
  filterOption?: NewSelectProps<T, ValueType>['filterOption'];
  disabled?: boolean;
  className?: string;
  dropdownClassName?: NewSelectProps<T, ValueType>['dropdownClassName'];
} & OriginSelectProps;

type OriginSelectProps<T = Options[] | string[], ValueType = any> = Omit<
  NewSelectProps<T, ValueType>,
  'defaultValue' | 'value'
>;

const isOptionsType = (list?: any[]): list is Required<Props>['options'] => {
  if (!list) return true;
  if (list.length && list[0]?.value && list[0]?.label) return true;
  return false;
};
export const checkList = (list?: any[]): Props['options'] =>
  isOptionsType(list) ? list : undefined;

export const Selector = memo(
  <T = Options[] | string[], ValueType = ValueTypes>({
    placeholder,
    onChange,
    onAddItem,
    options,
    onDelItem,
    value,
    className,
    filterOption,
    ...props
  }: Props<ValueType, T>) => {
    const [inputItem, setInputItem] = useState('');
    const [loading, setLoading] = useState(false);
    const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInputItem(event.target.value);
    };

    const onValueChange = (val?: ValueTypes) => {
      onChange?.(val);
    };

    return (
      <Select<ValueType, T>
        className={classNames(styles.selectWrapper, className)}
        // @ts-ignore
        value={value}
        showSearch={!!filterOption}
        filterOption={filterOption}
        placeholder={
          placeholder || I18N.enterpriseCarbonAccount2.dropdownSelectionAlso
        }
        listItemHeight={10}
        listHeight={160}
        // open
        // eslint-disable-next-line react/no-unstable-nested-components
        dropdownRender={menus => (
          <div>
            <Spin spinning={loading}>
              {menus}
              {!!onAddItem && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <div className={styles.addItemWrapper}>
                    <Input
                      value={inputItem}
                      style={{ flex: 'auto', height: 34 }}
                      onChange={onNameChange}
                    />
                    <span
                      className={styles.addButton}
                      onClick={() => {
                        if (inputItem.trim() && onAddItem) {
                          setLoading(true);
                          onAddItem(inputItem)
                            ?.then(() => {
                              setInputItem('');
                            })
                            .finally(() => setLoading(false));
                        }
                      }}
                    >
                      <PlusOutlined /> {I18N.carbonFootprint.add}
                    </span>
                  </div>
                </>
              )}
            </Spin>
          </div>
        )}
        // @ts-ignore
        onChange={val => onValueChange(val)}
        {...props}
      >
        {typeof options?.[0] === 'string'
          ? (options as unknown as string[])?.map(val => (
              <Option value={val} key={val} className={styles.select}>
                {val}
              </Option>
            ))
          : (options as unknown as Options[])?.map(item => {
              const { label, value: val, user, disabled } = item;
              return (
                <Option
                  value={val}
                  key={val}
                  disabled={disabled}
                  className={styles.select}
                >
                  {label}
                  {!!user && onDelItem && (
                    <IconFont
                      className={styles.closeIcon}
                      onClick={ev => {
                        ev.stopPropagation();
                        if (value === +val || value === label) {
                          onValueChange(undefined);
                        }
                        if (onDelItem) {
                          setLoading(true);
                          onDelItem(+val, label, item).finally(() => {
                            setLoading(false);
                          });
                        }
                      }}
                      type='icon-icon-guanbi'
                      style={{ color: '#666' }}
                    />
                  )}
                </Option>
              );
            })}
      </Select>
    );
  },
);
