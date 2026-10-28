/** **
 * @file 碳数据审核概览
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import React, { useState, useEffect, createContext } from 'react';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { Row, Radio } from 'antd';
import EmoChart from './CarbonAuditEmoChart';
import { ApiAudit, ApiAuditType } from '../../service';
import { EchartPerLabel } from './ComProportionByDept';

export const EchertPieOption = {
  color: [
    '#698CFF',
    '#64DBC5',
    '#F6C06B',
    '#EE8F58',
    '#F06E6E',
    '#695BE7',
    '#43A4B1',
    '#0CBF9F',
    '#DEDEDE',
    '#945FB9',
    '#6DC8EC',
    '#5D7092',
  ],
  label: {
    show: true,
    color: '#999EA4',
  },
  emphasis: {
    itemStyle: {
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
    },
    selectorLabel: {
      color: '#999EA4',
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/> {b} : {c} ({d}%)',
    transitionDuration: 0.000001,
    className: 'ComCompanyByStrength_tooltip',
  },
};
export const CarbonAudit: any = createContext({});
export function ComAudit({
  changeSaveSearchData,
  saveSearchData,
  companyName,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<ApiAuditType[]>([]);
  const [isFirst, changeIsFirst] = useState(true);
  const [level, changeLevel] = useState(0);

  const firstOption = {
    legend: {
      top: '5%',
      left: 'center',
      width: 'auto',
    },
    series: [
      {
        name: I18N.carbonDataManagemen.carbonDataReview,
        type: 'pie',
        top: 50,
        hoverAnimation: false,
        radius: '70%',
        data: [...ecuteMenData],
        ...EchartPerLabel,
      },
    ],
    ...EchertPieOption,
  };
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '8-1': string;
  }>({ '8-1': '1' });
  const ApiAuditFn = async () => {
    await ApiAudit({ audit: currentSaveData['8-1'] }).then(({ data }) => {
      const newAata = data.data.map(item => ({
        ...item,
        key: item.name,
        name:
          Number(item.name) === 0
            ? I18N.carbonFootprint3.pendingReview
            : Number(item.name) === 1
            ? I18N.carbonFootprint3.approved
            : I18N.emission.reviewRejection,
      }));
      getEcuteMenData([...newAata]);
    });
  };
  const syncCallbackFn = useSyncCallback(ApiAuditFn);
  // const changeIsFistFn = ()=>{
  //   changeIsFirst(false)
  // }
  useEffect(() => {
    changeCurrentSaveData({ '8-1': saveSearchData['8-1'] });
    syncCallbackFn();
  }, [saveSearchData['8-1']]);
  const clickFn = () => {
    changeIsFirst(false);
  };
  return (
    <CarbonAudit.Provider
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
          {I18N.template(I18N.carbonDataManagemen.compa11, { val1: companyName })}
        </h6>
      )}
      {ecuteMenData.length === 0 && (
        <Row justify='start' style={{ marginBottom: '10px' }}>
          {Number(level) === 0 && (
            <Radio.Group
              value={currentSaveData?.['8-1'] || ''}
              onChange={e => {
                changeSaveSearchData({
                  ...saveSearchData,
                  '8-1': e.target.value,
                });
                changeCurrentSaveData({ '8-1': e.target.value });
                syncCallbackFn();
              }}
            >
              <Radio.Button value='1'>{I18N.carbonDataManagemen.lastWeek}</Radio.Button>
              <Radio.Button value='2'>{I18N.carbonDataManagemen.inThePastMonth}</Radio.Button>
              <Radio.Button value='3'>{I18N.workbench.inThePastYear}</Radio.Button>
            </Radio.Group>
          )}
        </Row>
      )}
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
    </CarbonAudit.Provider>
  );
}
