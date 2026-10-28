import I18N from '@src/lang/I18N';
import { InputNumber } from 'antd';
import { useEffect } from 'react';

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
