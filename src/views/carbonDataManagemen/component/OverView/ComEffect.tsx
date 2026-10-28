/** **
 * @file 碳绩效概览
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { useState, useEffect, createContext } from 'react';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import useSyncCallback from '@utils/useSyncCallback';
import { Row, Radio } from 'antd';
import { ApiEffect, ApiAuditType } from '../../service';

import EmoChart from './CarbonEffectEmoChart';
import { EchertPieOption } from './ComAudit';
import { EchartPerLabel } from './ComProportionByDept';

export const CarbonEffect: any = createContext({});

export function ComEffect({
  changeSaveSearchData,
  saveSearchData,
  companyName,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<ApiAuditType[]>([]);
  const [isFirst, changeIsFirst] = useState(true);
  const [level, changeLevel] = useState(0);
  const firstOption = {
    // tooltip: {
    //   trigger: 'item',
    //   formatter: '{a} <br/> {b} : {c} ({d}%)',
    // },
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: I18N.carbonDataManagemen.overviewOfCarbonPerformance,
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
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '8-2': string;
  }>({ '8-2': '1' });
  const ApiEffectFn = async () => {
    await ApiEffect({ audit: currentSaveData['8-2'] }).then(({ data }) => {
      const newAata = data.data.map(item => ({
        ...item,
        key: item.name,
      }));
      getEcuteMenData([...newAata]);
    });
  };
  const syncCallbackFn = useSyncCallback(ApiEffectFn);
  // const changeIsFistFn = ()=>{
  //   changeIsFirst(false)
  // }
  useEffect(() => {
    changeCurrentSaveData({ '8-2': saveSearchData['8-2'] });
    syncCallbackFn();
  }, [saveSearchData['8-2']]);
  const clickFn = () => {
    changeIsFirst(false);
  };
  return (
    <CarbonEffect.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        getEcuteMenData,
        changeSaveSearchData,
        changeCurrentSaveData,
        syncCallbackFn,
        currentSaveData,
        saveSearchData,
        companyName,
      }}
    >
      {ecuteMenData.length === 0 && (
        <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {I18N.template(I18N.carbonDataManagemen.compa16, { val1: companyName })}
        </h6>
      )}
      <Row justify='start' style={{ marginBottom: '10px' }}>
        {ecuteMenData.length === 0 && (
          <Radio.Group
            value={currentSaveData?.['8-2'] || ''}
            onChange={e => {
              changeSaveSearchData({
                ...saveSearchData,
                '8-2': e.target.value,
              });
              changeCurrentSaveData({ '8-2': e.target.value });
              syncCallbackFn();
            }}
          >
            <Radio.Button value='1'>{I18N.carbonDataManagemen.lastWeek}</Radio.Button>
            <Radio.Button value='2'>{I18N.carbonDataManagemen.inThePastMonth}</Radio.Button>
            <Radio.Button value='3'>{I18N.workbench.inThePastYear}</Radio.Button>
          </Radio.Group>
        )}
      </Row>
      {ecuteMenData.length > 0 ? (
        <EmoChart
          option={firstOption}
          currentSaveData={currentSaveData}
          changeIsFirstFn={changeIsFirst}
          isFirst={isFirst}
          clickFn={clickFn}
          level={level}
          changeLevel={changeLevel}
        />
      ) : (
        <Nodata />
      )}
    </CarbonEffect.Provider>
  );
}
