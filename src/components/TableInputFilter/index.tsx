import I18N from '@src/lang/I18N';
import { Button, Input, InputRef } from 'antd';
import { useEffect, useRef } from 'react';

import styles from './index.module.less';

const TableInputFilter = (props: {
  selectedKeys: React.Key[];
  setSelectedKeys: (keys: React.Key[]) => void;
  confirm: (params?: { closeDropdown: boolean }) => void;
}) => {
  const { selectedKeys = [], confirm, setSelectedKeys } = props;
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <div className={styles.filter}>
      <div className={styles.filterContent}>
        <Input
          className={styles.input}
          ref={inputRef}
          value={selectedKeys[0]}
          onChange={e => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
        />
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

export default TableInputFilter;
