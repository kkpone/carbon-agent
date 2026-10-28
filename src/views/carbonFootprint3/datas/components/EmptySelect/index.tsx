/*
 * @@description: dropdown Select with search , 目前只支持单选
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-24 17:26:30
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 14:48:45
 */
import { DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Dropdown, Select } from 'antd';
import { useEffect, useState } from 'react';

import style from './index.module.less';
import './index.less';
import { EmptySelectProps } from './types';

export const EmptySelect = <ValueType = any,>({
  options,
  onChange,
  value,
  noWrapper,
  selectName,
  onClear,
}: EmptySelectProps<ValueType>) => {
  const [visible, setVisible] = useState(false);

  const closeListener = () => {
    setVisible(false);
  };

  useEffect(() => {
    document.addEventListener('click', closeListener);
    return () => {
      document.removeEventListener('click', closeListener);
    };
  }, []);

  const inner = (
    <Dropdown
      open={visible}
      overlay={
        <div
          className={style.overlayWrapper}
          onClick={ev => {
            ev.stopPropagation();
          }}
        >
          <Select
            showSearch
            allowClear
            open
            fieldNames={{
              label: 'accountNameNode',
              value: 'id',
            }}
            value={value}
            optionLabelProp='productName'
            onChange={(ev: ValueType) => {
              if (ev) {
                onChange?.(ev);
                setVisible(false);
              }
            }}
            autoFocus
            placeholder={I18N.carbonFootprint3.pleaseEnterTheProduct2}
            filterOption={(input, option) =>
              (option?.productName ?? '').includes(input)
            }
            style={{
              width: '440px',
            }}
            getPopupContainer={a => a}
            options={options}
            onClear={onClear}
          />
        </div>
      }
      trigger={['click']}
      placement='bottom'
    >
      <div
        onClick={() => {
          setTimeout(() => {
            setVisible(true);
          }, 32);
        }}
      >
        {noWrapper ? (
          <>
            {I18N.carbonFootprint3.replaceTheProduct}
            <DownOutlined className={style.dropdownIcon} />
          </>
        ) : (
          <div className={style.emptySelect}>
            <PlusCircleOutlined />
            {selectName ?? I18N.carbonFootprint.selectProduct}
          </div>
        )}
      </div>
    </Dropdown>
  );
  if (noWrapper) return inner;
  return <div className={style.wrapper}>{inner}</div>;
};
