import I18N from '@src/lang/I18N';
import { Button, Checkbox } from 'antd';
import { useState } from 'react';

import styles from './index.module.less';

const TableCascaderFilter = (props: {
  selectedKeys: React.Key[];
  options: {
    id: React.Key;
    name: string;
    children: { id: React.Key; name: string }[];
  }[];
  setSelectedKeys: (keys: React.Key[]) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  close: () => void;
  confirm: (params?: { closeDropdown: boolean }) => void;
}) => {
  const { selectedKeys = [], options, confirm, setSelectedKeys } = props;

  const [activeOpt, setActiveOpt] = useState(() => options[0]);

  return (
    <div className={styles.filter}>
      <div className={styles.filterContent}>
        <div className={styles.firstFilterContent}>
          {options.map(category => {
            const { id, name, children } = category;
            const childrenIds = (children || []).map(child => child.id);
            const checked = childrenIds.every(childId =>
              selectedKeys.includes(childId),
            );
            return (
              <div
                className={styles.filterItem}
                key={id}
                onMouseEnter={() => setActiveOpt(category)}
              >
                <Checkbox
                  checked={checked}
                  indeterminate={
                    !checked &&
                    childrenIds.some(childId => selectedKeys.includes(childId))
                  }
                  onChange={e => {
                    setSelectedKeys(
                      e.target.checked
                        ? [...new Set([...selectedKeys, ...childrenIds])]
                        : selectedKeys.filter(
                            val => !childrenIds.includes(val),
                          ),
                    );
                  }}
                >
                  {name}
                </Checkbox>
              </div>
            );
          })}
        </div>
        <div className={styles.filterSplit} />
        <div className={styles.secondaryFilterContent}>
          {(activeOpt?.children || []).map(classify => {
            const { id, name } = classify;
            return (
              <div className={styles.filterItem} key={id}>
                <Checkbox
                  checked={selectedKeys.includes(id)}
                  onChange={e => {
                    setSelectedKeys(
                      e.target.checked
                        ? [...new Set([...selectedKeys, id])]
                        : selectedKeys.filter(val => val !== id),
                    );
                  }}
                >
                  {name}
                </Checkbox>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.filterFooter}>
        <Button
          size='small'
          type='link'
          disabled={selectedKeys.length === 0}
          onClick={() => setSelectedKeys([])}
        >
          {I18N.carbonFootprint3.reset}
        </Button>
        <Button
          type='primary'
          size='small'
          onClick={() => {
            confirm({
              closeDropdown: true,
            });
          }}
        >
          {I18N.carbonFootprint.confirm2}
        </Button>
      </div>
    </div>
  );
};

export default TableCascaderFilter;
