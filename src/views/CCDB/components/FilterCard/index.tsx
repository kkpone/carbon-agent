import I18N from '@src/lang/I18N';
import { Cascader, CascaderProps, Checkbox, Input } from 'antd';
import { useMemo, useState } from 'react';

import { Dicts } from '@/hooks/useFieldUnitDictSource';

import styles from './index.module.less';

type CheckoutValue = (string | number)[];
type CascaderValue = (string | number)[][];

type ComType<T> = T extends 'checkbox' ? CheckoutValue : CascaderValue;

type CardType = 'checkbox' | 'cascader';

interface IFilterCardProps<T extends CardType> {
  title: string;
  showFilter: boolean;
  type: T;
  value: ComType<T>;
  options: Partial<Dicts>[];
  onChange: (value: ComType<T>) => void;
  showCount?: boolean;
}

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

export function FilterCard<T extends CardType = CardType>(
  props: IFilterCardProps<T>,
) {
  const { title, showFilter, type, value, options, onChange, showCount } =
    props;

  const selectedNumbers = useMemo(() => {
    if (type === 'checkbox') {
      return value.length;
    }
    return value.length;
  }, [value, type]);

  const onMultipleChange: CascaderProps<
    Option,
    'value',
    true
  >['onChange'] = innerValue => {
    onChange(innerValue as any);
  };

  const [filterValue, setFilterValue] = useState('');

  const filteredOptions = useMemo(() => {
    if (type === 'checkbox') {
      return options.filter(item => item.dictLabel?.includes(filterValue));
    }
    if (type === 'cascader') {
      const finalOptions = options.map(item => ({
        ...item,
        enumList: item.enumList?.filter(innerItem =>
          innerItem.dictLabel.includes(filterValue),
        ),
      }));
      return finalOptions.filter(item => Boolean(item.enumList?.length));
    }
    return options;
  }, [options, filterValue, type]);

  const hideSelected = useMemo(
    () =>
      value.filter(
        item =>
          !filteredOptions.some(innerItem => innerItem.dictValue === item),
      ),
    [value, filteredOptions],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.left}>
          {title}
          {selectedNumbers > 0 ? `(${selectedNumbers})` : ''}
        </div>
        <div className={styles.right} onClick={() => onChange([])}>
          {I18N.carbonFootprint3.reset}
        </div>
      </div>
      <div className={styles.content}>
        {showFilter && (
          <div className={styles.inputWrapper}>
            <Input
              placeholder={I18N.components.pleaseEnterTheContent}
              onChange={e => setFilterValue(e.target.value)}
            />
          </div>
        )}
        {type === 'checkbox' && (
          <Checkbox.Group
            style={{
              maxHeight: showFilter ? 176 : 206,
              overflowY: 'auto',
            }}
            key={filteredOptions.length}
            onChange={(e: any) => {
              onChange(e.concat(hideSelected));
            }}
            value={value as CheckoutValue}
          >
            {/* <Row> */}
            {filteredOptions?.map(option => (
              <Checkbox
                value={option.dictValue}
                style={{
                  margin: '2px 0',
                  paddingInlineEnd: 0,
                  height: '32px',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <div className={styles.option}>
                  <div className={styles.dictLabel} title={option.dictLabel}>
                    {option.dictLabel}
                  </div>
                  {showCount && (
                    <div className={styles.count}>{option.dictType}</div>
                  )}
                </div>
              </Checkbox>
              // </Col>
            ))}
            {/* </Row> */}
          </Checkbox.Group>
        )}
        {type === 'cascader' && (
          <Cascader.Panel<Dicts>
            options={filteredOptions}
            style={{
              height: 160,
              overflowY: 'auto',
              width: 276,
              overflowX: 'auto',
            }}
            value={value as CascaderValue}
            onChange={onMultipleChange}
            multiple
            fieldNames={{
              label: 'dictLabel',
              value: 'dictValue',
              children: 'enumList',
            }}
          />
        )}
      </div>
    </div>
  );
}
