/**
 * @file 各时间段活跃人数统计
 * @auth ljh
 * **/
import I18N from '@src/lang/I18N';
import { hotUvUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import moment from 'moment';
import { useEffect, useState } from 'react';

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
      await hotUvUsingPOSTAccountControllerApi({
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
  return (
    <>
      <p className='title'>
        {I18N.carbonDataManagemen.activeDuringEachTimePeriod}
      </p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      {/* color: ['#6F94F1', '#3AD0BE'], */}
      {echartData.yaxis &&
      echartData.yaxis.length > 0 &&
      echartData.xaxis &&
      echartData.xaxis.length > 0 ? (
        <>
          <EmoChart
            option={{
              tooltip: {
                trigger: 'axis',
              },
              grid: {
                containLabel: true,
                left: 20,
                top: 40,
                bottom: 40,
                right: 30,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: echartData.xaxis,
              },
              yAxis: {
                type: 'value',
                name: I18N.carbonDataManagemen.activePopulation,
                ...lineSplit,
                nameTextStyle: {
                  padding: [0, -10, 10, 0],
                },
              },
              series: [
                {
                  name: I18N.carbonDataManagemen.activePopulation,
                  type: 'line',
                  stack: 'Total',
                  smooth: true,
                  data: echartData.yaxis,
                  ...showLabel,
                  showSymbol: false,
                  emphasis: {
                    focus: 'series',
                  },
                  animation: true,
                },
              ],
              ...lineOption,
              height: '87%',
            }}
          />
          <p className='echartSuperTitle'>
            {I18N.carbonDataManagemen.timePeriod}
          </p>
        </>
      ) : (
        <Nodata />
      )}
    </>
  );
}
