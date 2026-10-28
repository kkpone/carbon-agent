/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 14:48:26
 * @Date: 2023-04-20 17:54:45
 * @@description:
 */
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';

import styles from './index.module.less';

type FormilySystemBoundaryRadioProps = {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

type RadioSystemsType = {
  title: string;
  details: string;
  value: number;
};

const RadioSystems: RadioSystemsType[] = [
  {
    title: I18N.carbonFootprint3.halfLifeCycle,
    details: I18N.carbonFootprint3.fromResourceExtraction4,
    value: 1,
  },
  {
    title: I18N.carbonFootprint3.fullLifecycle,
    details:
      I18N.carbonFootprint3.fromResourceExtraction3,
    value: 2,
  },
];

export default ({
  value,
  onChange,
  disabled,
}: FormilySystemBoundaryRadioProps) => {
  const changeRadio = (info: RadioSystemsType) => {
    if (value !== info.value) {
      onChange(info.value);
    }
  };

  return (
    <div
      className={
        disabled
          ? styles.formilySystemBoundaryRadioMain
          : `${styles.formilySystemBoundaryRadioMain} ${styles.formilySystemBoundaryRadioMainHover}`
      }
    >
      {RadioSystems.map(info => (
        <div
          style={disabled ? { cursor: 'not-allowed' } : {}}
          onClick={() => {
            if (!disabled) {
              changeRadio(info);
            }
          }}
          className={`${styles.radioSystem} ${
            value === info.value ? styles.radioSystemActive : ''
          }`}
        >
          <div className={styles.radioSystemTitle}>{info.title}</div>
          <div className={styles.radioSystemDetails}>{info.details}</div>
          <IconFont
            className={styles.radioSystemIcon}
            type={
              value === info.value
                ? 'icon-icon-chenggong-5'
                : 'icon-icon-shanxuanweixuanzhong-2'
            }
            style={{ fontSize: '16px' }}
          />
        </div>
      ))}
    </div>
  );
};
