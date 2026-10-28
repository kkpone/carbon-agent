import I18N from '@src/lang/I18N';
import { InputNumber, Select } from 'antd';
import { useEffect } from 'react';

import { CbamEnumResp } from '@/views/cbam/hook/type';

import { SOURCE_ENUM } from '../../constant';

const { DEFAULT } = SOURCE_ENUM;

/** 隐含排放输入框 */
export const ImpliedEmissionInput: React.FC<{
  value?: number;
  onChange?: (value?: number) => void;
  impliedEmission?: number;
}> = ({ value, onChange, impliedEmission }) => {
  useEffect(() => {
    onChange?.(impliedEmission);
  }, [impliedEmission]);

  return (
    <InputNumber
      value={value || impliedEmission}
      disabled
      placeholder={I18N.base.pleaseEnter}
    />
  );
};

/** 使用默认值的原因的下拉框 */
export const DefaultSelect: React.FC<{
  value?: number;
  onChange?: (value?: number | null) => void;
  disabled?: boolean;
  options?: CbamEnumResp[];
}> = ({ value, onChange, disabled, options }) => {
  if (disabled) {
    onChange?.(null);
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options}
      fieldNames={{
        label: 'name',
        value: 'code',
      }}
      placeholder={I18N.Factors.pleaseSelect}
    />
  );
};

/** 隐含排放（直接）来源下拉框 */
export const EmissionSourceSelect: React.FC<{
  value?: number;
  onChange?: (value?: number) => void;
  disabled?: boolean;
  options?: CbamEnumResp[];
}> = ({ value, onChange, disabled, options }) => {
  if (disabled) {
    onChange?.(DEFAULT);
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options}
      fieldNames={{
        label: 'name',
        value: 'code',
      }}
      placeholder={I18N.Factors.pleaseSelect}
    />
  );
};
