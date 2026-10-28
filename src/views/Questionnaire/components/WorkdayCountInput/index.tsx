import { connect } from '@formily/react';
import I18N from '@src/lang/I18N';
import { InputNumber } from 'antd';
import { FC } from 'react';

import styles from './index.module.less';
import { WORKDAY_TYPE } from '../../constant';
import CustomSelect from '../CustomSelect';

type Value = string | number;

const weeklyOptions = new Array(7).fill('').map((_, index) => ({
  value: index + 1,
  label: index + 1,
}));

const WorkdayCountInput: FC<{
  mode?: number;
  value?: Value;
  onChange: (val?: Value) => void;
}> = ({ mode = WORKDAY_TYPE.WEEKLY, value, onChange }) => {
  if (mode === WORKDAY_TYPE.YEARLY) {
    return (
      <InputNumber
        className={styles.annualInput}
        placeholder={I18N.base.pleaseEnter}
        min={1}
        max={365}
        precision={0}
        controls={false}
        stringMode
        value={value}
        onChange={val => onChange(val ?? undefined)}
      />
    );
  }

  return (
    <CustomSelect
      value={value}
      onChange={val => onChange(val as Value)}
      options={weeklyOptions}
    />
  );
};

export default connect(WorkdayCountInput);
