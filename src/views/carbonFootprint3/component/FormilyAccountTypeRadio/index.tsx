import IconFont, { IconAlibaba } from '@src/components/iconfont';
import classNames from 'classnames';

import style from './index.module.less';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
  FootprintAccountStatusType,
} from '../../FootprintAccount/constant';

/**
 * @description 核算方式的自定义样式组件
 */
type Props = {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

const Radios = Object.keys(FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL);
const { QUICK } = FootprintAccountStatusType;

export const FormilyAccountTypeRadio = ({
  value,
  disabled,
  onChange,
}: Props) => {
  const changeRadio = (type: FootprintAccountStatusType) => {
    onChange(type);
  };

  /** 过滤 = 只读状态下不显示其他单选项 */
  const getBtnStatus = () => {
    if (disabled) {
      return Radios.filter(
        radioBtnValue => Number(radioBtnValue) === Number(value),
      );
    }
    return Radios;
  };

  const typeBtns = getBtnStatus();

  return (
    <div className={style.FormilyAccountTypeRadio}>
      {typeBtns.map(type => (
        <div
          key={type}
          style={disabled ? { cursor: 'not-allowed' } : {}}
          className={classNames(style.radioSystem, {
            [style.radioSystemActive]: value === Number(type),
          })}
          onClick={() => {
            if (!disabled) {
              changeRadio(Number(type));
            }
          }}
        >
          <IconAlibaba
            className={style.radioSystemIcon}
            type={
              QUICK === Number(type)
                ? 'icon-icon_kuaisu'
                : 'icon-icon_qiehuanzhikeshihua'
            }
          />
          <span>{FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[type]}</span>
          <IconFont
            className={classNames(style.radioSystemPitch, {
              [style.radioSystemPitchActive]: value === Number(type),
            })}
            type='icon-icon-xuanzhai'
          />
        </div>
      ))}
    </div>
  );
};
