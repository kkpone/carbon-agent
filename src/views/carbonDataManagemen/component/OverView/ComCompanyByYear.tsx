/** **
 * @file 对比基准年碳排放变化趋势图
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import React, { useState, useEffect } from 'react';
import { Row, Radio } from 'antd';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { ApiCompanyByYear, ApiSubmissionTrendType } from '../../service';
import EmoChart from '../EmoChart';
import { lineOption } from './ComSubmissionTrend';
import { lineSplit, showLabel } from './ComCompanyByStrength';

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
    '2-1': string;
  }>({ '2-1': '1' });
  const ApiCompanyByYearFn = async () => {
    if (currentSaveData['2-1']) {
      await ApiCompanyByYear({ contrastYear: currentSaveData['2-1'] }).then(
        ({ data }) => {
          getEcuteMenData({ ...data.data });
        },
      );
    }
  };
  const syncCallbackFn = useSyncCallback(ApiCompanyByYearFn);

  useEffect(() => {
    changeCurrentSaveData({ '2-1': saveSearchData['2-1'] });
    syncCallbackFn();
  }, [saveSearchData['2-1']]);
  return (
    <>
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {I18N.template(I18N.carbonDataManagemen.compa15, { val1: companyName })}
      </h6>
      <Row justify='start' style={{ marginBottom: '10px' }}>
        <Radio.Group
          value={currentSaveData['2-1']}
          onChange={e => {
            // getEcuteMenData(e.target.value);
            changeSaveSearchData({
              ...saveSearchData,
              '2-1': `${e.target.value}`,
            });
            changeCurrentSaveData({ '2-1': `${e.target.value}` });
            syncCallbackFn();
          }}
        >
          <Radio.Button value='1'>{I18N.carbonDataManagemen.throughoutHistory}</Radio.Button>
          <Radio.Button value='2'>{I18N.enterpriseCarbonAccount2.recentYears3}</Radio.Button>
          <Radio.Button value='3'>{I18N.enterpriseCarbonAccount2.recentYears2}</Radio.Button>
        </Radio.Group>
      </Row>
      {ecuteMenData.xaxis.length > 0 || ecuteMenData.yaxis.length > 0 ? (
        <EmoChart
          option={{
            xAxis: {
              type: 'category',
              data: ecuteMenData.xaxis,
              axisLabel: {
                textAlign: 'center',
                color: '#999EA4',
              },
            },
            grid: {
              containLabel: true,
              left: 0,
              top: 50,
              bottom: 10,
              right: 0,
            },
            yAxis: {
              type: 'value',
              name: I18N.carbonDataManagemen.currentYearRanking,
              ...lineSplit,
              nameTextStyle: {
                padding: [0, -10, 10, 150],
              },
            },
            tooltip: {
              valueFormatter(value: string) {
                return `${value} %`;
              },
              hoverAnimation: false,
            },
            series: [
              {
                name: I18N.carbonDataManagemen.comparedToTheBaseYear,
                data: ecuteMenData.yaxis,
                type: 'line',
                smooth: true,
                ...showLabel,
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
