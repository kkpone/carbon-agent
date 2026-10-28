/* eslint-disable @typescript-eslint/naming-convention */
import { Gauge } from '@ant-design/charts';
import {
  CaretUpOutlined,
  CaretDownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import downImg from '@src/assets/svg/down.svg';
import upImg from '@src/assets/svg/up.svg';
import I18N from '@src/lang/I18N';
import { ORG_TYPE } from '@src/views/enterpriseCarbonAccount2/constant';
import { Dropdown, Menu, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import React, { useEffect, useState, memo, useMemo } from 'react';

import Empty from './Empty';
import styles from './index.module.less';
import { getDataCockpit } from './service';
import { CockpitData } from './type';

type GaugeChartProps = {
  period: string;
  orgId?: number | string;
  computationId?: number;
  computationPeriod?: string;
  foreignId?: number;
  orgType?: string;
  refreshFlag?: boolean;
  sessionId?: string;
  shareId?: string;
  setForeignId: (id: number) => void;
};
const GaugeChart: React.FC<GaugeChartProps> = ({
  period,
  computationId,
  computationPeriod,
  orgId,
  foreignId,
  orgType,
  refreshFlag,
  sessionId,
  shareId,
  setForeignId,
}) => {
  const [cockpitData, setCockpitData] = useState<CockpitData>();

  const [dropDownVisible, setDropDownVisible] = useState(false);

  useEffect(() => {
    const request =
      sessionId || shareId
        ? getDataCockpit({
            period,
            foreignId,
            computationId,
            computationPeriod,
            orgId,
            ...(sessionId ? { sessionId } : {}),
            ...(shareId ? { shareId } : {}),
          })
        : getDataCockpit({
            period,
            foreignId,
            computationId,
            computationPeriod,
            orgId,
          });

    request.then(resp => {
      setCockpitData(resp.data.data[0]);
    });
  }, [
    period,
    computationId,
    computationPeriod,
    orgId,
    foreignId,
    refreshFlag,
    sessionId,
    shareId,
    setForeignId,
  ]);

  const quantityCompare =
    !!cockpitData?.comparison_before_totalYearQuantity &&
    cockpitData.comparison_before_totalYearQuantity >= 0;

  const intensityCompare =
    !!cockpitData?.comparison_before_totalYearQuantity_intensity &&
    cockpitData.comparison_before_totalYearQuantity_intensity >= 0;

  const [quantityPercent, intensityPercent] = useMemo(() => {
    if (!cockpitData) {
      return [0, 0];
    }
    const {
      comparison_totalYearQuantity,
      comparison_baseYear_totalYearQuantity_intensity,
    } = cockpitData;
    return [
      isNaN(comparison_totalYearQuantity)
        ? 0
        : new BigNumber(comparison_totalYearQuantity).dividedBy(100).toNumber(),
      isNaN(comparison_baseYear_totalYearQuantity_intensity)
        ? 0
        : new BigNumber(comparison_baseYear_totalYearQuantity_intensity)
            .dividedBy(100)
            .toNumber(),
    ];
  }, [cockpitData]);

  const getColor = (num: number) => {
    if (num === 1) {
      return '#F6C06B';
    }
    if (num > 1) {
      return '#ED5555';
    }
    return '#0CBF9F';
  };

  const getUpDownColor = (isUp: boolean) => (isUp ? '#ED5555' : '#0CBF9F');

  const indicator = useMemo(() => {
    if (!cockpitData) {
      return null;
    }
    return (
      (cockpitData.indicatorList || []).find(
        item => item.foreignId === foreignId,
      ) || cockpitData.indicatorList?.[0]
    );
  }, [foreignId, cockpitData]);

  return (
    <div className={styles.gaugeChart}>
      <div className={styles.gaugeChartItem}>
        <div className={classNames(styles.title, styles.gaugeTitle)}>
          {I18N.enterpriseCarbonAccount2.annualCarbonEmissions2}
        </div>
        <div className={styles.gaugeChartItemContent}>
          <div className={styles.gaugeChartContent}>
            <Gauge
              percent={quantityPercent}
              radius={1}
              range={{ width: 8, color: getColor(quantityPercent) }}
              indicator={{ pointer: undefined, pin: undefined }}
              statistic={{
                title: {
                  offsetY: -40,
                  style: {
                    fontSize: '20px',
                    fontWeight: 500,
                    color: getColor(quantityPercent),
                  },
                  formatter: value =>
                    value !== undefined
                      ? `${new BigNumber(value.percent).multipliedBy(100)}%`
                      : '',
                },
                content: {
                  offsetY: -20,
                  style: {
                    fontSize: '10px',
                    color: '#999EA4',
                  },
                  formatter: () =>
                    I18N.enterpriseCarbonAccount2.comparedToTheBaseYear,
                },
              }}
              axis={{
                tickInterval: 25,
                subTickLine: null,
                tickLine: null,
                label: null,
                max: 100,
                min: 0,
              }}
            />
          </div>
          <div className={styles.gaugeSplit} />
          <div className={styles.gaugeInfoBlock}>
            <div className={styles.infoTip}>
              {I18N.enterpriseCarbonAccount2.annualEmissions}
            </div>
            <div className={styles.infoValue}>
              {cockpitData?.totalYearQuantity?.toLocaleString()}
            </div>
            <div className={styles.infoTip}>
              {I18N.enterpriseCarbonAccount2.yoY}
              {quantityCompare
                ? I18N.enterpriseCarbonAccount2.rise
                : I18N.enterpriseCarbonAccount2.decline}
              <span
                className='m-l-6'
                style={{ color: getUpDownColor(quantityCompare) }}
              >
                {isNaN(Number(cockpitData?.comparison_before_totalYearQuantity))
                  ? cockpitData?.comparison_before_totalYearQuantity
                  : `${Math.abs(
                      Number(cockpitData?.comparison_before_totalYearQuantity),
                    )}%`}
                <img
                  className={styles.upImg}
                  style={{
                    filter: `drop-shadow(1000px 0 0 ${getUpDownColor(
                      quantityCompare,
                    )})`,
                  }}
                  src={quantityCompare ? upImg : downImg}
                  alt=''
                />
              </span>
            </div>
          </div>
          <div className={styles.gaugeInfoBlock}>
            <div className={styles.infoTip}>
              {I18N.enterpriseCarbonAccount2.baseYearTC}
            </div>
            <div className={styles.infoValue}>
              {cockpitData?.baseYear_totalYearQuantity?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.gaugeChartItem}>
        <div className={classNames(styles.title, styles.gaugeTitle)}>
          <div>
            {I18N.enterpriseCarbonAccount2.annualCarbonEmissions}
            <Tooltip
              overlay={
                <span>
                  {I18N.enterpriseCarbonAccount2.carbonEmissionIntensity}
                </span>
              }
            >
              <ExclamationCircleOutlined
                className='m-l-6'
                style={{ color: '#B5B8BB', cursor: 'pointer' }}
              />
            </Tooltip>
          </div>
        </div>
        <div className={styles.gaugeChartItemContent}>
          {Number(orgType) !== ORG_TYPE.ENTERPRISE && (
            <Empty
              classNames={styles.floatEmpty}
              text={I18N.enterpriseCarbonAccount2.subOrganizationsTemporarily2}
            />
          )}
          <div className={styles.gaugeChartContent}>
            <Gauge
              percent={intensityPercent}
              radius={1}
              range={{ width: 8, color: getColor(intensityPercent) }}
              indicator={{ pointer: undefined, pin: undefined }}
              statistic={{
                title: {
                  offsetY: -40,
                  style: {
                    fontSize: '20px',
                    fontWeight: 500,
                    color: getColor(intensityPercent),
                  },
                  formatter: value =>
                    value !== undefined
                      ? `${new BigNumber(value.percent).multipliedBy(100)}%`
                      : '',
                },
                content: {
                  offsetY: -20,
                  style: {
                    fontSize: '10px',
                    color: '#999EA4',
                  },
                  formatter: () =>
                    I18N.enterpriseCarbonAccount2.comparedToTheBaseYear,
                },
              }}
              axis={{
                tickInterval: 25,
                subTickLine: null,
                tickLine: null,
                label: null,
                max: 100,
                min: 0,
              }}
            />
          </div>
          <div className={styles.gaugeSplit} />
          <div className={styles.gaugeInfoBlock}>
            <div className={styles.infoTip}>
              {I18N.enterpriseCarbonAccount2.annualStrongEmissions}
              {cockpitData?.indicatorList &&
                cockpitData.indicatorList.length > 0 && (
                  <Dropdown
                    className={styles.unitDropDown}
                    trigger={['click']}
                    overlay={
                      <Menu
                        selectedKeys={
                          indicator ? [String(indicator.foreignId)] : undefined
                        }
                      >
                        {cockpitData.indicatorList.map(
                          ({
                            foreignId: _foreignId,
                            unitValue,
                            indicatorName,
                          }) => (
                            <Menu.Item
                              key={_foreignId}
                              onClick={() => {
                                setForeignId(_foreignId);
                                setDropDownVisible(false);
                              }}
                            >
                              {indicatorName}({unitValue})
                            </Menu.Item>
                          ),
                        )}
                      </Menu>
                    }
                    onVisibleChange={setDropDownVisible}
                  >
                    <span className={styles.dropDownBody}>
                      (tCO₂e/{indicator?.unitValue || ''})
                      {dropDownVisible ? (
                        <CaretUpOutlined />
                      ) : (
                        <CaretDownOutlined />
                      )}
                    </span>
                  </Dropdown>
                )}
            </div>
            <div className={styles.infoValue}>
              {cockpitData?.totalYearQuantity_intensity?.toLocaleString()}
            </div>
            <div className={styles.infoTip}>
              {I18N.enterpriseCarbonAccount2.yoY}
              {intensityCompare
                ? I18N.enterpriseCarbonAccount2.rise
                : I18N.enterpriseCarbonAccount2.decline}
              <span
                className='m-l-6'
                style={{ color: getUpDownColor(intensityCompare) }}
              >
                {isNaN(
                  Number(
                    cockpitData?.comparison_before_totalYearQuantity_intensity,
                  ),
                )
                  ? cockpitData?.comparison_before_totalYearQuantity_intensity
                  : `${Math.abs(
                      Number(
                        cockpitData?.comparison_before_totalYearQuantity_intensity,
                      ),
                    )}%`}
                <img
                  className={styles.upImg}
                  style={{
                    filter: `drop-shadow(1000px 0 0 ${getUpDownColor(
                      intensityCompare,
                    )})`,
                  }}
                  src={intensityCompare ? upImg : downImg}
                  alt=''
                />
              </span>
            </div>
          </div>
          <div className={styles.gaugeInfoBlock}>
            <div className={styles.infoTip}>
              {I18N.enterpriseCarbonAccount2.baseYear}
              {!!indicator && `(tCO₂e/${indicator.unitValue})`}
            </div>
            <div className={styles.infoValue}>
              {cockpitData?.baseYear_totalYearQuantity_intensity?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GaugeChart);
