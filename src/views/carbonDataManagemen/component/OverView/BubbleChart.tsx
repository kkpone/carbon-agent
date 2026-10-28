/** **
 * @file 报送趋势图
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { hotTimeUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import { ceilNumber } from '@src/utils';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { fill, map, max } from 'lodash-es';
import moment from 'moment';
import { useState, useEffect } from 'react';

import { lineSplit } from './ComCompanyByStrength';
import EmoChart from '../EmployCarbonData/EmoChart';

// const i = 0;
const now_data = new Date();
const firstDay = now_data.setDate(now_data.getDate());
const test = now_data.setDate(now_data.getDate() + 1);
const time_min = `${moment(firstDay).format('YYYY-MM-DD')} 00:00`;
const time_max = `${moment(test).format('YYYY-MM-DD')} 00:00`; // 引入moment.js库
const schema = [
  { name: 'date', index: 0, text: I18N.carbonAccount.day },
  {
    name: 'AQIindex',
    index: 1,
    text: I18N.carbonDataManagemen.activePopulation,
  },
  {
    name: 'PM25',
    index: 2,
    text: I18N.carbonDataManagemen.totalNumberOfPeopleInTheGroup,
  },
];
const itemStyle = {
  opacity: 0.8,
  shadowBlur: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: 'rgba(100,219,197,0.25)',
};
export default function BubbleChart({ timeRange }) {
  const [ecuteMenData, getEcuteMenData] = useState<
    {
      data: unknown[];
      name: string;
    }[]
  >([]);
  const [allData, getAllData] = useState<number[]>([]);
  const [allData1, getAllData1] = useState<number[]>([]);
  const returnFillArr = arr => {
    const first = arr[0];
    return fill(arr, `${moment(firstDay).format('YYYY-MM-DD')} ${first}`, 0, 1);
  };
  const ApiSubmissionTrendFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';

    if (beginTime && endTime) {
      await hotTimeUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
      }).then(({ data }) => {
        // @ts-ignore
        const { yaxis } = data.data as {
          yaxis: { name: string; data: string[] }[];
        };
        const arr: number[] = [];
        const arr1: number[] = [];
        const newArr = map(yaxis, value => {
          arr.push(Number(value.data[1]) as number);
          arr1.push(Number(value.data[2]) as number);
          return {
            ...value,
            data: [returnFillArr(value.data)],
            name: value.name || 'ceshi',
            type: 'scatter',
            itemStyle,
          };
        });
        getAllData([...arr]);
        getAllData1([...arr1]);
        getEcuteMenData(newArr);
      });
    }
  };
  const syncCallbackFn = useSyncCallback(ApiSubmissionTrendFn);

  useEffect(() => {
    syncCallbackFn();
  }, [timeRange]);
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.activeOrganizations}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      {ecuteMenData.length > 0 ? (
        <>
          <EmoChart
            option={{
              color: ['#dd4444', '#fec42c', '#80F1BE'],
              legend: {
                top: 10,
                data: [
                  I18N.carbonDataManagemen.grouping2,
                  I18N.carbonDataManagemen.grouping,
                  I18N.carbonDataManagemen.groupThree,
                ],
                textStyle: {
                  fontSize: 16,
                },
              },
              grid: {
                containLabel: true,
                left: 30,
                right: 100,
                top: 40,
                bottom: '0%',
              },
              tooltip: {
                backgroundColor: 'rgba(255,255,255,0.7)',
                formatter(param) {
                  const { value } = param;

                  const text1 = I18N.carbonDataManagemen.groupName;
                  const text2 = I18N.carbonDataManagemen.averageActiveTime;

                  return `<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">
                  ${text1}：${param.seriesName} </div>${schema[1].text}：${
                    value[1]
                  }<br>${schema[2].text}：${value[2]}<br>${text2}：${
                    value[0].split(' ')[1]
                  }`;
                },
              },
              xAxis: {
                type: 'time',
                show: true,
                splitLine: {
                  show: false,
                },
                axisLabel: {
                  formatter(value) {
                    const showH = moment(value).format('HH:mm');
                    return `${showH}`;
                  },
                },
                splitNumber: 6,
                min: new Date(time_min),
                max: new Date(time_max),
              },
              yAxis: {
                type: 'value',
                name: I18N.carbonDataManagemen.activePopulation,
                minInterval: 1,
                nameLocation: 'end',
                ...lineSplit,
                nameTextStyle: {
                  padding: [0, -10, 10, 0],
                  splitLine: {
                    show: false,
                  },
                },
                scale: true,
                // @ts-ignore
                max: max(allData) ? ceilNumber(max(allData)) + 1 : 10,
                min: 0,
              },
              visualMap: [
                {
                  left: 'right',
                  top: '10%',
                  dimension: 2,
                  min: 0,
                  // @ts-ignore
                  max: max(allData1) ? ceilNumber(max(allData1)) : 10,
                  itemWidth: 30,
                  itemHeight: 120,
                  calculable: true,
                  precision: 0.1,
                  // text: ['圆形大小：PM2.5'],
                  textGap: 30,
                  inRange: {
                    symbolSize: [10, 70],
                  },
                  outOfRange: {
                    symbolSize: [10, 70],
                    color: ['rgba(255,255,255,0.4)'],
                  },
                  controller: {
                    inRange: {
                      color: ['#64DBC5'],
                    },
                    outOfRange: {
                      color: [' rgba(100,219,197,0.25)'],
                    },
                  },
                },
              ],
              series: [...ecuteMenData],
            }}
          />
          <p className='echartSuperTitle'>
            {I18N.carbonDataManagemen.timePoint}
          </p>
        </>
      ) : (
        <Nodata />
      )}
    </>
  );
}
