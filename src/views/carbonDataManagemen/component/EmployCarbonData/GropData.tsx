/**
 * @file 分组热度统计
 * @auth ljh
 * **/
import { StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { hotByOrgUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import { Radio, Row } from 'antd';
import { slice } from 'lodash-es';
import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';

import EmoChart from './EmoChart';
import Nodata from '../NoData';
import { lineSplit } from '../OverView/ComCompanyByStrength';

export default function GropData({
  timeRange,
  saveSearchData,
  changeSaveSearchData,
}) {
  const [echartData, getEchatData] = useState<{
    xaxis?: string[];
    yaxis?: string[];
  }>({});
  const [totalPage, changeTotalPage] = useState(1);
  const [currentPage, changeCurrentPage] = useState(1);

  const hotByOrgFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
    const type = saveSearchData['0-1'];
    if (beginTime && endTime && type) {
      await hotByOrgUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
        type,
      }).then(({ data }) => {
        if (Number(data.code) === 200) {
          const echartData = data.data as {
            xaxis?: string[];
            yaxis?: string[];
          };
          if (echartData?.xaxis?.length && echartData?.xaxis?.length > 0) {
            // eslint-disable-next-line no-unsafe-optional-chaining
            changeTotalPage(Math.ceil(echartData.xaxis?.length / 8));
          } else {
            changeTotalPage(1);
            changeCurrentPage(1);
          }
          getEchatData(echartData);
        }
      });
    }
  };
  useEffect(() => {
    hotByOrgFn();
  }, [timeRange, saveSearchData['0-1']]);
  const culReturnArr = useMemo(() => {
    if (totalPage > 0 && currentPage > 0) {
      return {
        xaxis: slice(echartData.xaxis, (currentPage - 1) * 8, currentPage * 8),
        yaxis: slice(echartData.yaxis, (currentPage - 1) * 8, currentPage * 8),
      };
    }
    return {
      xaxis: echartData.xaxis,
      yaxis: echartData.yaxis,
    };
  }, [currentPage, totalPage, echartData]);
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.groupHeatSystem}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      <Row justify='start' style={{ marginBottom: '10px' }}>
        <Radio.Group
          value={saveSearchData['0-1']}
          onChange={e => {
            changeSaveSearchData({
              ...saveSearchData,
              '0-1': e.target.value,
            });
            changeCurrentPage(1);
            changeTotalPage(1);
          }}
        >
          <Radio.Button value='1'>
            {I18N.carbonDataManagemen.numberOfParticipants}
          </Radio.Button>
          <Radio.Button value='2'>
            {I18N.carbonDataManagemen.participationFrequency}
          </Radio.Button>
        </Radio.Group>
      </Row>
      {echartData.xaxis &&
      echartData.xaxis.length > 0 &&
      echartData.yaxis &&
      echartData.yaxis.length > 0 ? (
        <EmoChart
          style={{ width: '100%', height: '72%' }}
          option={{
            grid: {
              // width: '100%',
              containLabel: true,
              left: 20,
              top: 30,
              right: 90,
            },
            color: ['#6F94F1', '#3AD0BE'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
            },
            xAxis: {
              type: 'value',
              boundaryGap: [0, 0.01],
              minInterval: 1,
            },
            yAxis: [
              {
                type: 'category',
                id: 'category',
                // name:
                //   +saveSearchData['0-1'] === 1 ? '参与人数/人' : '参与次数/次',
                ...lineSplit,
                splitLine: {
                  show: false,
                },
                inverse: true,
                data: culReturnArr.xaxis,
              },
              {
                type: 'category',
                // id: 'category',
                name:
                  +saveSearchData['0-1'] === 1
                    ? I18N.carbonDataManagemen.numberOfParticipants3
                    : I18N.carbonDataManagemen.participationTimes2,
                ...lineSplit,
                splitLine: {
                  show: false,
                },
                minInterval: 1,
                axisLine: {
                  lineStyle: {
                    color: '#DDDDDD',
                  },
                },
                // data: echartData.xaxis,
              },
            ],
            series: [
              {
                type: 'bar',
                data: culReturnArr.yaxis,
              },
            ],
            height: '77%',
          }}
        />
      ) : (
        <Nodata />
      )}
      {totalPage > 1 && (
        <div className='echertPage'>
          <StepBackwardOutlined
            onClick={() => {
              let curcurentPage = currentPage;
              if (curcurentPage > 1) {
                changeCurrentPage(--curcurentPage);
              }
            }}
          />
          <span>
            {currentPage}/{totalPage}
          </span>
          <StepForwardOutlined
            onClick={() => {
              let curcurentPage = currentPage;
              ++curcurentPage;
              if (curcurentPage <= totalPage) {
                changeCurrentPage(curcurentPage);
              }
            }}
          />
        </div>
      )}
    </>
  );
}
