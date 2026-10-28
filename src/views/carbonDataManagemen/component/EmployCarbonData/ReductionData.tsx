/**
 * @file 减排量趋势图
 * @auth ljh
 * **/
import I18N from '@src/lang/I18N';
import { cersTrendUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
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
      await cersTrendUsingPOSTAccountControllerApi({
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
        {I18N.carbonDataManagemen.trendOfEmissionReduction}
      </p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      {/* color: ['#6F94F1', '#3AD0BE'], */}
      {Number(echartData?.xaxis?.length) > 0 &&
      Number(echartData?.yaxis?.length) > 0 ? (
        <>
          {' '}
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
                name: I18N.carbonDataManagemen.reducedDisplacementKg,
                ...lineSplit,
                nameTextStyle: {
                  padding: [0, -10, 10, 30],
                },
              },
              series: [
                {
                  name: I18N.carbonDataManagemen.historicalCarbonEmissions,
                  type: 'line',
                  stack: 'Total',
                  smooth: true,
                  data: echartData.yaxis,
                  ...showLabel,
                  label: !(Number(echartData?.xaxis?.length) > 1),
                  symbol: 'none',
                },
              ],
              ...lineOption,
            }}
          />
          <div className='sectionBottom'>
            <span>
              {I18N.carbonDataManagemen.historicalEmissionReductions}
              {echartData.historyCers}
            </span>
          </div>
        </>
      ) : (
        <Nodata />
      )}
    </>
  );
}
