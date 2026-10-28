/**
 * @file  注册趋势图
 * @auth ljh
 * **/
import I18N from '@src/lang/I18N';
import { registerTrendUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import { ceilNumber } from '@src/utils';
import { max } from 'lodash-es';
import moment from 'moment';
import { useEffect, useState, useCallback } from 'react';

import EmoChart from './EmoChart';
import Nodata from '../NoData';
import { lineSplit, showLabel } from '../OverView/ComCompanyByStrength';
import { lineOption } from '../OverView/ComMulberryChart';
import { EchartDataType } from '../Typings/type';

export default function ActivityData({ timeRange, saveSearchData }) {
  const [echartData, getEchatData] = useState<EchartDataType>({});
  const hotByOrgFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
    const type = saveSearchData['2-1']; // 1 uv 2 pv
    if (beginTime && endTime) {
      await registerTrendUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
        type,
      }).then(({ data }) => {
        const newData = data as unknown as {
          code: number;
          data: EchartDataType;
        };
        if (newData.code === 200) {
          const echartData = newData.data;
          getEchatData(echartData);
        }
      });
    }
  };
  useEffect(() => {
    hotByOrgFn();
  }, [timeRange, saveSearchData['2-1']]);
  const isShowPoint = useCallback(
    (arr: number[]) =>
      Number(arr.length) !== 1
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
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.registrationTrendChart}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      {/* color: ['#6F94F1', '#3AD0BE'], */}
      {echartData.xaxis && echartData.xaxis.length > 0 ? (
        <>
          <EmoChart
            option={{
              tooltip: {
                trigger: 'axis',
              },
              grid: {
                containLabel: true,
                left: 60,
                top: 40,
                bottom: 40,
                right: 40,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: echartData.xaxis,
              },
              yAxis: {
                type: 'value',
                name: I18N.carbonDataManagemen.numberOfRegistrations,
                ...lineSplit,
                nameTextStyle: {
                  padding: [0, -10, 10, 0],
                },
                minInterval: 1,
                min: 0,
                max: echartData?.yaxis
                  ? // @ts-ignore
                    ceilNumber(max(echartData?.yaxis))
                  : 10,
                // @ts-ignore
                interval: +ceilNumber(max(echartData?.yaxis)).toFixed(2) / 5,
              },
              series: [
                {
                  name: I18N.carbonDataManagemen.numberOfRegistrations,
                  type: 'line',
                  stack: 'Total',
                  smooth: true,
                  data: echartData.yaxis,
                  ...showLabel,
                  ...isShowPoint(echartData.yaxis || []),
                },
              ],
              ...lineOption,
            }}
          />
          <div className='sectionBottom'>
            <span>
              {I18N.carbonDataManagemen.historicalRegistrant}
              {echartData.historyRegister}
            </span>
          </div>
        </>
      ) : (
        <Nodata />
      )}
    </>
  );
}
