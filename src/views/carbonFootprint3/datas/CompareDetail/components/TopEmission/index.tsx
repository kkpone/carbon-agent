import I18N from '@src/lang/I18N';
import { FC } from 'react';

import { IconAlibaba } from '@/components/iconfont';

import style from './index.module.less';
import { TopEmissionItem } from '../../type';

interface ITopEmissionProps {
  title: string;
  topEmissions?: TopEmissionItem[];
}

const TagMap = {
  0: <IconAlibaba type='icon-icon_1st' />,
  1: <IconAlibaba type='icon-icon_2nd' />,
  2: <IconAlibaba type='icon-icon_3rd' />,
  3: 4,
  4: 5,
};

export const TopEmission: FC<ITopEmissionProps> = props => {
  const { title, topEmissions = [] } = props;
  return (
    <div className={style.wrapper}>
      <div className={style.title}>{title}</div>
      <div className={style.content}>
        <div className={style.name}>
          <div className={style.none}>{' a'}</div>
          {topEmissions?.map((item, index) => (
            <div className={style.item}>
              <span className={style.tag}>{TagMap[index]}</span>
              {item.name}
            </div>
          ))}
        </div>
        <div className={style.chart}>
          <div className={style.none}>{' b'}</div>
          {topEmissions?.map(item => (
            <div className={style.item}>
              <div className={style.bar}>
                <div
                  className={style.barItem}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={style.total}>
          <div className={style.totalTitle}>
            {I18N.carbonFootprint3.emissionsKg}
          </div>
          {topEmissions?.map(item => (
            <div className={style.item}>{item.total}</div>
          ))}
        </div>
        <div className={style.rate}>
          <div className={style.rateTitle}>
            {I18N.carbonFootprint3.proportionOfEmissions}
          </div>
          {topEmissions?.map(item => (
            <div className={style.item}>{item.rate}%</div>
          ))}
        </div>
      </div>
    </div>
  );
};
