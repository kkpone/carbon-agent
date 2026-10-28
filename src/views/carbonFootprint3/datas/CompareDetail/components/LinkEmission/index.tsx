import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import TextWidthOverflow from '@/views/carbonFootprint3/component/TextOverflowTable/byWidth';

import style from './index.module.less';
import { ByTypeItem } from '../../type';

interface ILinkEmissionProps {
  title: string;
  LinkEmissions?: ByTypeItem[];
}

export const LinkEmission: FC<ILinkEmissionProps> = props => {
  const { title, LinkEmissions = [] } = props;
  const maxEmission = Math.max(
    ...(LinkEmissions?.map(item => Number(item.total)) || []),
  );
  const maxEmissionCompare = Math.max(
    ...(LinkEmissions?.map(item => Number(item.totalCompare)) || []),
  );
  const max = Math.max(maxEmission, maxEmissionCompare);
  const width = document.querySelector('body')?.clientWidth || 0;
  return (
    <div className={style.wrapper}>
      <div className={style.title}>{title}</div>
      <div className={style.content}>
        <div className={style.name}>
          <div className={style.none}>{' a'}</div>
          {LinkEmissions?.map(item => (
            <div className={style.item}>
              <TextWidthOverflow
                width={width > 1600 ? 186 : width < 1400 ? 80 : 146}
                value={item.name}
              />
            </div>
          ))}
        </div>
        <div className={style.chart}>
          <div className={style.none}>{' b'}</div>
          {LinkEmissions?.map(item => (
            <Tooltip
              color='#fff'
              title={
                <div className={style.tooltip}>
                  <div className={style.tooltipItem}>
                    <div className={style.tooltipItemBar} />
                    <span>
                      {I18N.carbonFootprint3.targetProductRanking}
                      {item.total || '-'}
                    </span>
                  </div>
                  <div className={style.tooltipItem}>
                    <div className={style.tooltipItemNextBar} />
                    <span>
                      {I18N.carbonFootprint3.benchmarkProductRanking}
                      {item.totalCompare || '-'}
                    </span>
                  </div>
                </div>
              }
            >
              <div className={classNames(style.item, style.itemCompare)}>
                <div className={style.bar}>
                  <div
                    className={style.barItem}
                    style={{ width: `${(Number(item.total) / max) * 100}%` }}
                  />
                </div>
                <div className={classNames(style.bar, style.barCompare)}>
                  <div
                    className={style.barItem}
                    style={{
                      width: `${(Number(item.totalCompare) / max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
        <div className={style.total}>
          <div className={style.totalTitle}>
            {I18N.carbonFootprint3.emissionReductionKg}
          </div>
          {LinkEmissions?.map(item => (
            <div
              className={classNames(style.item, {
                [style.rateTitleRed]: Number(item?.reduction) < 0,
              })}
            >
              {item.reduction}
            </div>
          ))}
        </div>
        <div className={style.rate}>
          <div className={classNames(style.rateTitle)}>
            {I18N.carbonFootprint3.emissionReductionRatio}
          </div>
          {LinkEmissions?.map(item => (
            <div
              className={classNames(style.item, {
                [style.rateTitleRed]: Number(item?.reductionRate) < 0,
              })}
            >
              {item.reductionRate}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
