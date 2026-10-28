/** **
 * @file 各部门排放占比图
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { useState, useEffect, createContext } from 'react';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { Row, Radio } from 'antd';
import EmoChart from './CarbonProportionByDeptEmoChart';
import { ApiProportionByDept, ApiAuditType } from '../../service';
import { EchertPieOption } from './ComAudit';

export const CarbonAudit: any = createContext({});
export const EchartPerLabel = {
  label: {
    //  formatter: '{b}\n{d}%',
    formatter: ['{b}', '{d}%'].join('\n'),
    textstyle: {
      fontWeight: 'normal',
      fontSize: 15,
    },
    rich: {
      b: {
        color: 'red',
        lineHeight: 22,
        align: 'center',
      },
      hr: {
        borderColor: '#fff',
        width: '100%',
        borderWidth: 1,
        height: 0,
      },
      d: {
        color: '#666666',
        fontSize: 12,
        lineHeight: 33,
      },
    },
  },
  animationThreshold: 2000,
  animationDuration: 1000,
  animationEasing: 'cubicOut',
  animationDelay(idx) {
    // 越往后的数据延迟越大
    return idx * 100;
  },
};
export function ComProportionByDept({
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
        name: I18N.carbonDataManagemen.departmentalEmissionsAccountedFor,
        type: 'pie',
        hoverAnimation: false,
        radius: '70%',
        top: 50,
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
    '3-1': string;
  }>({ '3-1': '1' });
  const ApiAuditFn = async () => {
    await ApiProportionByDept({ deptMonth: currentSaveData['3-1'] }).then(
      ({ data }) => {
        const newAata = data.data.map(item => ({
          ...item,
          key: item.name,
        }));
        getEcuteMenData([...newAata]);
      },
    );
  };
  const syncCallbackFn = useSyncCallback(ApiAuditFn);
  // const changeIsFistFn = ()=>{
  //   changeIsFirst(false)
  // }
  useEffect(() => {
    changeCurrentSaveData({ '3-1': saveSearchData['3-1'] });
    syncCallbackFn();
  }, [saveSearchData['3-1']]);
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
          {I18N.template(I18N.carbonDataManagemen.compa17, { val1: companyName })}
        </h6>
      )}
      {ecuteMenData.length === 0 && (
        <Row justify='start' style={{ marginBottom: '10px' }}>
          {Number(level) === 0 && (
            <Radio.Group
              value={currentSaveData?.['3-1'] || ''}
              onChange={e => {
                changeSaveSearchData({
                  ...saveSearchData,
                  '3-1': e.target.value,
                });
                changeCurrentSaveData({ '3-1': e.target.value });
                syncCallbackFn();
              }}
            >
              <Radio.Button value='1'>{I18N.carbonDataManagemen.lastMonth}</Radio.Button>
              <Radio.Button value='2'>{I18N.workbench.inThePastThreeMonths}</Radio.Button>
              <Radio.Button value='3'>{I18N.carbonDataManagemen.sinceThisYearOn}</Radio.Button>
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
