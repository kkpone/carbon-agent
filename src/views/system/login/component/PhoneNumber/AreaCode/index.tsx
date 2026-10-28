import { Popover, Select } from 'antd';
import classNames from 'classnames';
import { FC, useState } from 'react';

import styles from './index.module.less';

interface AreaCodeProps {
  value?: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
  disabled?: boolean;
}

export const AreaCode: FC<AreaCodeProps> = ({
  value,
  onChange,
  options,
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled) return;
    setOpen(newOpen);
  };
  return (
    <div>
      <Popover
        placement='bottomLeft'
        trigger='click'
        visible={open}
        onVisibleChange={handleOpenChange}
        content={
          <div className={styles.selectWrapper}>
            <Select
              value={value}
              showSearch
              open
              style={{ width: 298 }}
              onChange={val => {
                setOpen(false);
                onChange(val);
              }}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              getPopupContainer={a => a}
              options={options}
            />
          </div>
        }
      >
        {/* 不传区号会默认为 86 */}
        <div
          className={classNames(styles.Box, {
            [styles.disabled]: disabled,
          })}
        >
          +{value?.match(/\d+/g)?.[0] || '86'}
        </div>
      </Popover>
    </div>
  );
};
