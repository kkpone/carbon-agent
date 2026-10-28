/** **
 * @file 报送趋势图
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Radio } from 'antd';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { ApiSubmissionTrend, ApiSubmissionTrendType } from '../../service';
import EmoChart from '../EmoChart';
import { lineSplit, showLabel } from './ComCompanyByStrength';

export const lineOption = {
  color: ['#6F94F1', '#3AD0BE'],
};
export default function ComSubmissionTrend({
  changeSaveSearchData,
  saveSearchData,
  companyName,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<ApiSubmissionTrendType>({
    xaxis: [],
    yaxis: [],
  });
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '4-1': string;
  }>({ '4-1': '1' });
  const ApiSubmissionTrendFn = async () => {
    await ApiSubmissionTrend({ audit: currentSaveData['4-1'] }).then(
      ({ data }) => {
        getEcuteMenData(data.data);
      },
    );
  };
  const syncCallbackFn = useSyncCallback(ApiSubmissionTrendFn);

  useEffect(() => {
    changeCurrentSaveData({ '4-1': saveSearchData['4-1'] });
    syncCallbackFn();
  }, [saveSearchData['4-1']]);
  const memoizedValue = useMemo(
    () => ({
      xaxis: ecuteMenData.xaxis,
      interval:
        Number(saveSearchData['4-1']) === 1
          ? 0
          : Number(saveSearchData['4-1']) === 2
          ? 6
          : 89,
    }),
    [ecuteMenData.xaxis],
  );
  return (
    <>
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {I18N.template(I18N.carbonDataManagemen.compa19, { val1: companyName })}
      </h6>
      <Row justify='start' style={{ marginBottom: '10px' }}>
        <Radio.Group
          value={currentSaveData['4-1']}
          onChange={e => {
            // getEcuteMenData(e.target.value);
            changeSaveSearchData({ ...saveSearchData, '4-1': e.target.value });
            changeCurrentSaveData({ '4-1': e.target.value });
            syncCallbackFn();
          }}
        >
          <Radio.Button value='1'>{I18N.carbonDataManagemen.lastWeek}</Radio.Button>
          <Radio.Button value='2'>{I18N.carbonDataManagemen.inThePastMonth}</Radio.Button>
          <Radio.Button value='3'>{I18N.workbench.inThePastYear}</Radio.Button>
        </Radio.Group>
      </Row>
      {/* {JSON.stringify(Number(saveSearchData['4-1']))}=1212 */}
      {ecuteMenData.xaxis.length > 0 || ecuteMenData.xaxis.length > 0 ? (
        <EmoChart
          option={{
            grid: {
              containLabel: true,
              left: 20,
              top: 50,
              bottom: 10,
              right: 30,
            },
            tooltip: {
              trigger: 'axis',
              transitionDuration: 0.000001,
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#6a7985',
                },
              },
            },
            xAxis: {
              type: 'category',
              data: memoizedValue.xaxis,
              axisTick: {
                show: false,
              },
              alignTicks: true,
              axisLabel: {
                textStyle: {
                  fontSize: '12',
                },
                color: '#999EA4',
                // minInterval: 0,
                // maxInterval: 89,
                // interval:
                //   Number(saveSearchData['4-1']) === 2
                //     ? 6
                //     : Number(saveSearchData['4-1']) === 3
                //     ? 89
                //     : 0,
                interval: memoizedValue.interval,
              },
              stack: false,
            },
            yAxis: {
              type: 'value',
              name: I18N.carbonDataManagemen.numberOfSubmissions,
              ...lineSplit,
              nameTextStyle: {
                padding: [0, -10, 10, 10],
              },
              min: 0,
              minInterval: 1,
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
              },
            }, // 是否显示坐标轴轴线
            series: [
              {
                name: I18N.carbonDataManagemen.numberOfSubmissions,
                type: 'line',
                data: ecuteMenData.yaxis,
                ...showLabel,
                smooth: true,
                stack: 'value',
                showSymbol: false,
                emphasis: {
                  focus: 'series',
                },
                animation: true,
              },
            ],
            ...lineOption,
          }}
        />
      ) : (
        <Nodata />
      )}
    </>
  );
}
