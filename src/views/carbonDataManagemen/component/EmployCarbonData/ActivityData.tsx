/** *
 * @file 活跃度趋势图
 * @auth ljh
 */
import I18N from '@src/lang/I18N';
import { activesTrendUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import { ceilNumber } from '@src/utils';
import { max } from 'lodash-es';
import moment from 'moment';
import { useEffect, useState, useCallback } from 'react';

import EmoChart from './EmoChart';
import Nodata from '../NoData';
import { lineSplit } from '../OverView/ComCompanyByStrength';
import { lineOption } from '../OverView/ComMulberryChart';

export default function ActivityData({ timeRange, saveSearchData }) {
  const [echartData, getEchatData] = useState<{
    xaxis?: string[];
    yaxis?: string[];
    zaxis?: string[];
    historyPv?: string;
    historyUv?: string;
  }>({});
  const hotByOrgFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
    const type = saveSearchData['1-1']; // 1 uv 2 pv
    if (beginTime && endTime) {
      await activesTrendUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
        type,
      }).then(({ data }) => {
        const newData = data as unknown as {
          code: number;
          data: {
            xaxis?: string[];
            yaxis?: string[];
            zaxis?: string[];
            historyPv?: string;
            historyUv?: string;
          };
        };
        if (newData.code === 200) {
          const echartData = newData.data;
          getEchatData(echartData);
        }
      });
    }
  };
  const isShowPoint = useCallback(
    (arr: string[]) =>
      arr.length !== 1
        ? {
            label: {
              show: false,
            },
            symbol: 'none',
          }
        : {
            label: {
              show: false,
            },
            symbol: 'emptyCircle',
          },
    [echartData],
  );
  const returnOption = useCallback(
    () => ({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [
          I18N.carbonDataManagemen.numberOfParticipantsU,
          I18N.carbonDataManagemen.participationFrequencyP,
        ],
        top: '-5',
        itemGap: 10,
        itemHeight: 5,
        itemWidth: 14,
        textStyle: {
          color: '#666666',
        },
      },
      grid: {
        containLabel: true,
        left: 20,
        top: 30,
        bottom: 40,
        right: 40,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: echartData.xaxis,
        // alignTicks: true,
        // axisTick: {
        //   show: false,
        // },
        // stack: false,
      },
      yAxis: {
        type: 'value',
        ...lineSplit,
        nameTextStyle: {
          padding: [0, -10, 10, 0],
        },
        max: echartData?.yaxis
          ? // @ts-ignore
            ceilNumber(max(echartData?.yaxis, echartData.zaxis))
          : 10,
        min: 0,
        // @ts-ignore
        interval:
          // @ts-ignore
          +ceilNumber(max(echartData?.yaxis, echartData.zaxis)).toFixed(2) / 5,
      },
      series: [
        {
          name: I18N.carbonDataManagemen.numberOfParticipantsU,
          type: 'line',
          smooth: true,
          data: echartData.zaxis,
          // ...showLabel,
          ...isShowPoint(echartData.zaxis || []),
        },
        {
          name: I18N.carbonDataManagemen.participationFrequencyP,
          type: 'line',
          smooth: true,
          data: echartData.yaxis,
          // ...showLabel,
          ...isShowPoint(echartData.yaxis || []),
        },
      ],
      ...lineOption,
    }),
    [echartData],
  );
  useEffect(() => {
    hotByOrgFn();
  }, [timeRange, saveSearchData['1-1']]);
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.activityTrend}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      {/* color: ['#6F94F1', '#3AD0BE'], */}
      {echartData.xaxis && echartData.xaxis.length > 0 ? (
        <>
          <EmoChart option={returnOption()} />
          <div className='sectionBottom'>
            <span>
              {I18N.carbonDataManagemen.historicalParticipants}
              {echartData.historyUv}
            </span>
            <span>
              {I18N.carbonDataManagemen.historicalParticipationTimes}
              {echartData.historyPv}
            </span>
          </div>
        </>
      ) : (
        <Nodata />
      )}
    </>
  );
}
