import { connect } from '@formily/react';
import Slider from 'rc-slider';
import { FC } from 'react';

import 'rc-slider/assets/index.css';
import styles from './index.module.less';
import { TRANSPORT_WAY_COLOR } from '../../constant';

type Value = {
  transType: number;
  transName: string;
  value: number;
};

const CustomSlider: FC<{
  value: Value[];
  onChange: (val: Value[]) => void;
}> = props => {
  const { value = [], onChange } = props;

  return (
    <>
      <Slider
        className={styles.slider}
        value={value.length > 0 ? [0, ...value.map(i => i.value)] : []}
        range
        allowCross={false}
        trackStyle={value.map(v => ({
          background: TRANSPORT_WAY_COLOR[v.transType],
        }))}
        onChange={e => {
          const rates = e as number[];
          if (rates[rates.length - 1] < 100) {
            return;
          }
          onChange(
            value.map((val, index) => ({ ...val, value: rates[index + 1] })),
          );
        }}
      />
      <div className={styles.rateDesc}>
        {value.map((item, index) => {
          const percent = item.value - (value[index - 1]?.value || 0);
          return (
            <div
              className={styles.rateDescItem}
              key={item.transType}
              style={{ width: `${percent}%` }}
            >
              <div
                className={styles.stick}
                style={{ background: TRANSPORT_WAY_COLOR[item.transType] }}
              />
              <span>{item.transName}</span>
              <span>{percent}%</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default connect(CustomSlider);
