/* eslint-disable @typescript-eslint/naming-convention */

import { Gauge } from '@ant-design/charts';
import {
  CaretUpOutlined,
  CaretDownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import caretDownImg from '@assets/svg/caretdown.svg';
import downImg from '@src/assets/svg/down.svg';
import upImg from '@src/assets/svg/up.svg';
import I18N from '@src/lang/I18N';
import { Dropdown, Menu, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import React, { useEffect, useState, memo, useMemo } from 'react';

import { checkPermissions } from '@/components/Permission/utils';

import { Org } from '../../AccountingList/type';
import styles from '../index.module.less';
import { getDataCockpit } from '../service';
import { CockpitData, Indicator } from '../type';

type GaugeChartProps = {
  year: number | undefined;
  type: number;
  standardYearList: string[];
  standardYearRefresh: boolean;
  org?: Org;
  foreignId?: number;
  standardYear?: string;
  setForeignId: (id: number) => void;
  setIndicatorList: (value: Indicator[]) => void;
  onStandardYearChange: (data: { standardYear: string }) => void;
};
const GaugeChart: React.FC<GaugeChartProps> = ({
  type,
  year,
  foreignId,
  org,
  standardYearList,
  standardYear,
  standardYearRefresh,
  setForeignId,
  setIndicatorList,
  onStandardYearChange,
}) => {
  const [cockpitData, setCockpitData] = useState<CockpitData | null>(null);

  const [dropDownVisible, setDropDownVisible] = useState(false);

  const { id: orgId } = org || {};

  useEffect(() => {
    if (!isNil(year) && !isNil(orgId)) {
      getDataCockpit({
        type,
        period: year.toString(),
        foreignId,
        orgId,
      }).then(resp => {
        setCockpitData(resp.data.data[0]);
        setIndicatorList(resp.data.data[0]?.indicatorList || []);

        if (isNil(foreignId)) {
          setForeignId(Number(resp.data.data[0].foreignId));
        }
      });
    } else {
      setCockpitData(null);
      setIndicatorList([]);
    }
  }, [
    type,
    year,
    foreignId,
    orgId,
    standardYearRefresh,
    setIndicatorList,
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
      return '#026961';
    }
    return '#08A28B';
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

  const standardYearDropdown = checkPermissions(
    true,
    'enterprise:data:standYearUpdate',
  ) ? (
    <Dropdown
      className={styles.unitDropDown}
      trigger={['click']}
      overlay={
        <Menu selectedKeys={[standardYear || '']}>
          {standardYearList.map(sYear => (
            <Menu.Item
              key={sYear}
              onClick={() => onStandardYearChange({ standardYear: sYear })}
            >
              {sYear}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <div className={styles.standardYearSelect}>
        {standardYear || I18N.enterpriseCarbonAccount2.pleaseSelectABenchmark}
        <img className={styles.caretDownImg} alt='' src={caretDownImg} />
      </div>
    </Dropdown>
  ) : (
    <div className={styles.standardYearSelect}>
      {standardYear || I18N.enterpriseCarbonAccount2.pleaseSelectABenchmark}
      <img className={styles.caretDownImg} alt='' src={caretDownImg} />
    </div>
  );
  return (
    <div className={styles.gaugeChart}>
      <div className={styles.gaugeChartItem}>
        <div className={classNames(styles.title, styles.gaugeTitle)}>
          {I18N.enterpriseCarbonAccount2.annualCarbonEmissions2}
          <span className={styles['caption-s']}>
            {I18N.enterpriseCarbonAccount2.unitTCo}
          </span>
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
              {I18N.enterpriseCarbonAccount2.annualEmissions3}
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
              {I18N.enterpriseCarbonAccount2.baseYear}
              {standardYearDropdown}
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
          {cockpitData?.indicatorList &&
            cockpitData.indicatorList.length > 0 && (
              <Dropdown
                className={styles.unitDropDown}
                trigger={['click']}
                overlay={
                  <Menu
                    selectedKeys={!isNil(foreignId) ? [`${foreignId}`] : []}
                  >
                    {cockpitData.indicatorList.map(
                      ({ foreignId: _foreignId, unitValue, indicatorName }) => (
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
        <div className={styles.gaugeChartItemContent}>
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
                    color: '#026961',
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
              {standardYearDropdown}
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
