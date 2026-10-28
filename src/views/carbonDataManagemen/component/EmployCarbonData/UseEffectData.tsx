/** **
 * @file 场景使用比例 （按使用人数）
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { hotTplOrgUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import useSyncCallback from '@utils/useSyncCallback';
import moment from 'moment';
import { useState, useEffect, createContext } from 'react';
// import Nodata from '@views/carbonDataManagemen/component/NoData';

import EmoChart from './useEffectDataSecond';
import Nodata from '../NoData';
import { EchertPieOption } from '../OverView/ComAudit';
import { EchartPerLabel } from '../OverView/ComProportionByDept';

const CarbonEffect: any = createContext({});

export function UseEffectData({ timeRange, saveSearchData }) {
  const [ecuteMenData, getEcuteMenData] = useState<
    {
      tplName: string;
      countNum: string;
      tplId: string;
      tplIds: string[];
    }[]
  >([]);
  const [isFirst, changeIsFirst] = useState(true);
  const [level, changeLevel] = useState(0);
  const firstOption = {
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: I18N.carbonDataManagemen.scenarioUsageRatio,
        type: 'pie',
        top: 50,
        hoverAnimation: false,
        radius: '70%',
        data: [...ecuteMenData],
        emphasis: {
          itemStyle: {
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        ...EchartPerLabel,
      },
    ],
    ...EchertPieOption,
  };
  const ApiEffectFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
    const type = saveSearchData['9-0'];
    await hotTplOrgUsingPOSTAccountControllerApi({
      type,
      beginTime,
      endTime,
    }).then(({ data }) => {
      if (Number(data.code) === 200) {
        const dataMap = data.data as {
          tplName: string;
          countNum: string;
          tplId: string;
          tplIds: string[];
        }[];
        const newAata = dataMap.map(item => ({
          name: item.tplName,
          value: item.countNum,
          tplId: item.tplId,
          tplIds: item.tplIds,
        }));
        // @ts-ignore

        getEcuteMenData([...newAata]);
      }
    });
  };
  const syncCallbackFn = useSyncCallback(ApiEffectFn);
  useEffect(() => {
    syncCallbackFn();
  }, [timeRange]);
  const clickFn = () => {
    changeIsFirst(false);
  };
  return (
    <CarbonEffect.Provider>
      {/* {JSON.stringify(ecuteMenData)} */}
      {!(ecuteMenData.length > 0) && (
        <p className='title'>{I18N.carbonDataManagemen.scenarioUsageRatio}</p>
      )}
      {!(ecuteMenData.length > 0) && (
        <p className='time'>
          {' '}
          {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
          {I18N.carbonFootprint.to}{' '}
          {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
        </p>
      )}
      {ecuteMenData.length > 0 ? (
        <EmoChart
          option={firstOption}
          changeIsFirstFn={changeIsFirst}
          isFirst={isFirst}
          clickFn={clickFn}
          level={level}
          changeLevel={changeLevel}
          timeRange={timeRange}
          currentSaveData={saveSearchData}
        />
      ) : (
        <Nodata />
      )}
    </CarbonEffect.Provider>
  );
}
