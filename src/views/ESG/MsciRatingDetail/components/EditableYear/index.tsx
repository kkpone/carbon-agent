import I18N from '@src/lang/I18N';
import { Select, message } from 'antd';
import { FC, useState, useEffect } from 'react';
import { getYear } from '@/utils';
import styles from './index.module.less';
import { editMsciRating } from '../../service';

export interface EditableYearProps {
  id: number;
  initialPeriod: string;
  businessName: string;
  onUpdate?: (newPeriod: string) => void;
}

export const EditableYear: FC<EditableYearProps> = ({
  id,
  initialPeriod,
  businessName,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialPeriod);
  const [loading, setLoading] = useState(false);

  // 当 initialPeriod 变化时更新 value
  useEffect(() => {
    setValue(initialPeriod);
  }, [initialPeriod]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = async (newValue: string) => {
    setValue(newValue);

    // 如果选择的值和初始值相同，直接关闭编辑模式
    if (newValue === initialPeriod) {
      setIsEditing(false);
      return;
    }

    // 选择后立即保存
    setLoading(true);
    try {
      await editMsciRating({
        id,
        period: newValue,
        businessName,
      });
      message.success(I18N.carbonFootprint.modifiedSuccessfully);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(newValue);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.DomesticVersion.modificationFailed, error);
      message.error(I18N.esg.modificationFailedPlease);
      // 恢复原值
      setValue(initialPeriod);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    // 如果值未改变且不在加载中，直接关闭编辑模式
    if (value === initialPeriod && !loading) {
      setIsEditing(false);
    }
    // 如果正在加载中，等待 handleChange 中的保存完成
  };

  const yearOptions = getYear(2015, new Date().getFullYear() + 1).map(y => ({
    label: y.toString(),
    value: y.toString(),
  }));

  if (isEditing) {
    return (
      <Select
        className={styles.yearSelect}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        suffixIcon={null}
        options={yearOptions}
        loading={loading}
        autoFocus
        open
      />
    );
  }

  return (
    <span className={styles.yearDisplay} onClick={handleEdit}>
      {value || '—'}
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M12.375 5.824C12.375 5.92259 12.3385 6.0222 12.2655 6.10539L8.37814 10.4576C8.2835 10.5634 8.14096 10.625 7.98929 10.625C7.83877 10.625 7.69509 10.5634 7.60158 10.4576L3.73472 6.12387C3.56253 5.93081 3.59674 5.64839 3.81112 5.49332C4.02551 5.33825 4.3391 5.36906 4.51129 5.56213L7.99043 9.46044L11.489 5.54262C11.6612 5.34955 11.9747 5.31874 12.1891 5.47381C12.3111 5.56316 12.375 5.69255 12.375 5.824Z'
          fill='#6C757D'
        />
      </svg>
    </span>
  );
};
