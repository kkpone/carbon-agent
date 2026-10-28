import I18N from '@src/lang/I18N';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { FC, useState, useEffect } from 'react';

import EditIcon from '@/assets/svg/edit.svg';

import styles from './index.module.less';
import { editMsciRating } from '../../service';

export interface EditableCompanyNameProps {
  id: number;
  period: string;
  initialValue: string;
  onUpdate?: (newValue: string) => void;
}

export const EditableCompanyName: FC<EditableCompanyNameProps> = ({
  id,
  period,
  initialValue,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [shouldSaveOnBlur, setShouldSaveOnBlur] = useState(true);

  // 当 initialValue 变化时更新 value
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleEdit = () => {
    setIsEditing(true);
    setShouldSaveOnBlur(true);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
    setShouldSaveOnBlur(true);
  };

  const handleSave = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      message.warning(I18N.system.enterpriseNameNotApplicable);
      return;
    }

    if (trimmedValue === initialValue) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await editMsciRating({
        id,
        period,
        businessName: trimmedValue,
      });
      message.success(I18N.carbonFootprint.modifiedSuccessfully);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(trimmedValue);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.DomesticVersion.modificationFailed, error);
      message.error(I18N.esg.modificationFailedPlease);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // 使用 setTimeout 确保按钮点击事件先执行
    setTimeout(() => {
      if (shouldSaveOnBlur) {
        handleSave();
      }
    }, 200);
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    // 阻止 blur 事件触发
    e.preventDefault();
    setShouldSaveOnBlur(false);
  };

  if (isEditing) {
    return (
      <div className={styles.editableWrapper}>
        <Input
          className={styles.input}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          autoFocus
          disabled={loading}
          suffix={
            <div className={styles.actions}>
              <CheckOutlined
                className={styles.actionIcon}
                onMouseDown={handleButtonMouseDown}
                onClick={handleSave}
              />
              <CloseOutlined
                className={styles.actionIcon}
                onMouseDown={handleButtonMouseDown}
                onClick={handleCancel}
              />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <span className={styles.companyName} onClick={handleEdit}>
      <span className={styles.companyNameText}>{value || ''}</span>
      <img src={EditIcon} alt='edit' className={styles.editIcon} />
    </span>
  );
};
