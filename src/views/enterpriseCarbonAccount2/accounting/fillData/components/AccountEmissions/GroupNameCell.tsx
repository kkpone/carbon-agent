import { EditOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Input } from 'antd';
import { useRef, useState } from 'react';

import { Toast } from '@/utils';

import styles from './index.module.less';
import { editEmissionGroup } from './service';

type GroupNameCellProps = {
  name: string;
  computationId: string;
  categoryId: number;
  groupId: number;
  readPretty?: boolean;
  onSaveSuccess: () => void;
  finishCount?: number;
  totalCount?: number;
};

const GroupNameCell = ({
  name,
  computationId,
  categoryId,
  groupId,
  readPretty,
  onSaveSuccess,
  finishCount,
  totalCount,
}: GroupNameCellProps) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const isSavingRef = useRef(false);

  const save = async (value: string) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const trimmed = value.trim();
      if (trimmed && trimmed !== name) {
        await editEmissionGroup({
          computationId: Number(computationId),
          categoryId,
          groupName: trimmed,
          id: groupId,
        });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        onSaveSuccess();
      }
      setEditing(false);
    } finally {
      isSavingRef.current = false;
    }
  };

  if (editing) {
    return (
      <Input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className={styles.groupNameInput}
        value={inputValue}
        maxLength={50}
        onChange={e => setInputValue(e.target.value)}
        onPressEnter={() => save(inputValue)}
        onBlur={() => save(inputValue)}
      />
    );
  }

  return (
    <div className={styles.groupNameCell}>
      <div className={styles.groupName} title={name}>
        {name}
      </div>
      <div className={styles.count}>
        （{finishCount ?? 0}/{totalCount ?? 0}）
      </div>
      {!readPretty && (
        <EditOutlined
          className={styles.groupNameEditIcon}
          onClick={e => {
            e.stopPropagation();
            setInputValue(name);
            setEditing(true);
          }}
        />
      )}
    </div>
  );
};

export default GroupNameCell;
