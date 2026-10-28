import I18N from '@src/lang/I18N';
import { useForm } from '@formily/react';
import { Checkbox, InputNumber } from 'antd';
import { useState, useEffect } from 'react';

import styles from './index.module.less';
import { ILimitType } from '../../type';

export const CheckInput = props => {
  const { value, onChange, disabled } = props;
  const [scoreMaxCheck, setScoreMaxCheck] = useState(value?.scoreMaxValue >= 0);
  const [timeMaxCheck, setTimeMaxCheck] = useState(value?.timesMaxValue >= 0);

  const form = useForm();

  const initLimitType = form.getInitialValuesIn('limitType');

  useEffect(() => {
    if (initLimitType === ILimitType.LIMIT_SCORE) {
      setScoreMaxCheck(true);
      setTimeMaxCheck(false);
    } else if (initLimitType === ILimitType.LIMIT_TIMES) {
      setScoreMaxCheck(false);
      setTimeMaxCheck(true);
    } else if (initLimitType === ILimitType.LIMIT_SCORE_AND_TIMES) {
      setScoreMaxCheck(true);
      setTimeMaxCheck(true);
    } else {
      setScoreMaxCheck(false);
      setTimeMaxCheck(false);
    }
  }, [initLimitType]);
  return (
    <>
      <div className={styles.wrapper}>
        <Checkbox
          disabled={disabled}
          checked={scoreMaxCheck}
          onChange={e => {
            setScoreMaxCheck(e.target.checked);
            if (!e.target.checked) {
              onChange({
                ...value,
                scoreMaxValue: undefined,
                limitType: timeMaxCheck
                  ? ILimitType.LIMIT_TIMES
                  : ILimitType.NO_LIMIT,
              });
            } else {
              onChange({
                ...value,
                limitType: timeMaxCheck
                  ? ILimitType.LIMIT_SCORE_AND_TIMES
                  : ILimitType.LIMIT_SCORE,
              });
            }
          }}
        >
          {I18N.carbonAccount.carbonCoinRestrictions}</Checkbox>
        <InputNumber
          className={styles.input}
          min={0}
          max={10000}
          precision={0}
          keyboard
          disabled={!scoreMaxCheck || disabled}
          value={value?.scoreMaxValue}
          onChange={v =>
            onChange({
              ...value,
              scoreMaxValue: v,
            })
          }
        />
        <span>{I18N.carbonAccount.maximumWithinTheCycle2}</span>
      </div>
      <div className={styles.wrapper}>
        <Checkbox
          disabled={disabled}
          checked={timeMaxCheck}
          onChange={e => {
            setTimeMaxCheck(e.target.checked);
            if (!e.target.checked) {
              onChange({
                ...value,
                timesMaxValue: undefined,
                limitType: scoreMaxCheck
                  ? ILimitType.LIMIT_SCORE
                  : ILimitType.NO_LIMIT,
              });
            } else {
              onChange({
                ...value,
                limitType: scoreMaxCheck
                  ? ILimitType.LIMIT_SCORE_AND_TIMES
                  : ILimitType.LIMIT_TIMES,
              });
            }
          }}
        >
          {I18N.carbonAccount.frequencyLimit}</Checkbox>
        <InputNumber
          className={styles.input}
          min={0}
          max={10000}
          precision={0}
          keyboard
          disabled={!timeMaxCheck || disabled}
          value={value?.timesMaxValue}
          onChange={v =>
            onChange({
              ...value,
              timesMaxValue: v,
            })
          }
        />
        <span>{I18N.carbonAccount.maximumWithinTheCycle}</span>
      </div>
    </>
  );
};
