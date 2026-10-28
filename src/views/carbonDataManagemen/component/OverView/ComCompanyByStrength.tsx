/** **
 * @file 排放量&强度变化趋势图
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { useState, useEffect, createContext, useMemo } from 'react';
import { Row, Col } from 'antd';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { ceilNumber } from '@src/utils';
import EmoChart from './ComCompanyByStrengthEmoChart';
import { ComstomCascader, ComstomSelect } from '../Basic';
import {
  ApiCompanyByStrength,
  ApiQueryYears,
  ApiQueryIndicators,
} from '../../service';

export const lineSplit = {
  nameTextStyle: {
    fontSize: '12px',
    align: 'center',
    color: '#999EA4',
    width: 900, // 将这里设置为你想要的宽度，例如100像素
    overflow: 'break', // 确保长文本会换行
  },
  axisLabel: {
    textAlign: 'center',
    formatter: '{value}',
    color: '#999EA4',
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: '#DDDDDD', // 网格线
      type: 'dashed',
      width: 1,
    },
  },
}; // echert 虚线展示 和y轴文字样式
export const showLabel = {
  // 文字展示在坐标中
  label: {
    show: true,
    position: 'top',
    color: '#999EA4',
    formatter: (num: { value: number }) => {
      if (Number(num.value) > 0) {
        return num.value;
      }
      return '';
    },
  },
};
export const CarbonAudit: any = createContext({});

export function ComCompanyByStrength({
  changeSaveSearchData,
  saveSearchData,
  companyName,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<{
    xaxis: number[] | string[];
    yaxis: number[];
    zaxis: number[];
  }>({ xaxis: [], yaxis: [], zaxis: [] });
  const [isFirst, changeIsFirst] = useState(true);
  /**
   *月度指标
   * **/
  const [monthOption, getMonthOption] = useState<
    { label: string; value: string }[]
  >([]);
  /**
   * 生产运营指标
   * **/
  const [queryIndicatorsOption, getQueryIndicatorsOption] = useState<
    { label: string; value: string; unitValue: string; isAdd: number }[]
  >([]);
  // 用户获取指标的单位
  const [unit, getUnit] = useState<string>('-');
  const [level, changeLevel] = useState(0);
  // const Option = getCarbonDataEchertOption();
  const interValu = useMemo(() => {
    // const zMaxNum = (
    //   (Math.ceil(
    //     (Math.ceil(Math.max(...ecuteMenData.zaxis) * 100) / 100 / 10) * 100,
    //   ) /
    //     100) *
    //   10
    // ).toFixed(2);
    const zMaxNum =
      (Math.ceil((Math.max(...ecuteMenData.zaxis) / 5) * 100) * 5) / 100;
    // debugger;
    return {
      yaxisMax: ceilNumber(Math.max(...ecuteMenData.yaxis)),
      yaxisInterval: ceilNumber(Math.max(...ecuteMenData.yaxis)) / 5,
      zaxisMax: zMaxNum.toFixed(2),
      zaxisInterval: +(Number(zMaxNum) / 5).toFixed(2),
    };
  }, [ecuteMenData.zaxis, ecuteMenData.yaxis]);
  const firstOption = {
    width: 'auto',
    height: 'auton',
    grid: {
      // width: '100%',
      containLabel: true,
      left: 20,
      top: 60,
      bottom: 10,
      right: 10,
    },
    legend: {
      data: [
        I18N.carbonFootprint.emissions,
        I18N.carbonFootprint.emissionIntensity,
      ],
    },
    xAxis: [
      {
        type: 'category',
        data: ecuteMenData.xaxis,
        axisPointer: {
          type: 'shadow',
        },
        // max: 60,
        // min: 10,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: I18N.enterpriseCarbonAccount2.emissionsTC,
        ...lineSplit,
        nameTextStyle: {
          padding: [0, 0, 10, 20],
        },
        min: 0, // 最小值
        max: interValu.yaxisMax, // 最大值
        interval: interValu.yaxisInterval, // 每个刻度的间隔值
        // axisTick: {
        //   show: true,
        // },
      },
      {
        type: 'value',
        name: I18N.template(I18N.carbonDataManagemen.emissionIntensityT2, {
          val1: unit || '-',
        }),
        ...lineSplit,
        nameTextStyle: {
          padding: [0, 100, 10, -10],
        },
        // axisTick: {
        //   show: true,
        // },
        min: 0, // 最小值
        max: interValu.zaxisMax, // 最大值
        // max: 0.01,
        interval: interValu.zaxisInterval,
      },
    ],
    tooltip: {
      trigger: 'axis',
      triggerOn: 'mousemove',
      // hideDelay: 1,
      transitionDuration: 0.000001,
      className: 'ComCompanyByStrength_tooltip',
    },

    series: [
      {
        name: I18N.carbonFootprint.emissions,
        type: 'bar',
        data: [...ecuteMenData.yaxis],
        color: ['#6F94F1', '#3AD0BE'],
        ...showLabel,
        barMaxWidth: 60,
        barMinWidth: 10,
      },
      {
        name: I18N.carbonFootprint.emissionIntensity,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [...ecuteMenData.zaxis],
        color: ['#3AD0BE'],
        // ...showLabel,
      },
    ],
    color: ['#6F94F1', '#3AD0BE'],
  };
  const [currentSaveData, changeCurrentSaveData] = useState<{
    strengthType: string | null;
    strengthYear: string | null;
    strengthNorm: string | null;
    isAdd: number;
  }>({ strengthType: '1', strengthYear: '1', strengthNorm: '', isAdd: 0 });
  const [controlApiQueryIndicators, changecontrolApiQueryIndicators] =
    useState(false);
  const [isFirsstYear, changeIsFirstYear] = useState(true);
  const ApiCompanyByStrengthFn = async () => {
    if (currentSaveData.strengthType && currentSaveData.strengthYear) {
      await ApiCompanyByStrength({
        strengthNorm: currentSaveData.strengthNorm || '',
        strengthType: currentSaveData.strengthType || '',
        strengthYear: currentSaveData.strengthYear || '',
        isAdd: currentSaveData.isAdd,
      }).then(({ data }) => {
        if (data.data) {
          let copayData: {
            xaxis: number[] | string[];
            yaxis: number[];
            zaxis: number[];
          } = {
            ...data.data,
          };
          if (Number(saveSearchData.strengthType) === 1) {
            copayData = {
              ...copayData,
              // @ts-ignore
              xaxis: data?.data?.xaxis?.map((item: string | number) =>
                I18N.template(I18N.carbonDataManagemen.itemMonth2, {
                  val1: item,
                }),
              ),
            };
          }
          getEcuteMenData({ ...copayData });
        }
      });
    } else {
      getEcuteMenData({
        xaxis: [],
        yaxis: [],
        zaxis: [],
      });
    }

    // asyncApiQueryIndicatorsFn();
  };
  const syncCallbackFn = useSyncCallback(ApiCompanyByStrengthFn);
  // 获取年份查询
  const ApiQueryYearsFn = async () => {
    // eslint-disable-next-line no-debugger
    await ApiQueryYears().then(({ data }) => {
      if (data.data.length > 0) {
        const newArr = data.data.map(item => ({
          label: item,
          value: `1-${item}`,
        }));
        getMonthOption([...newArr]);
        // asyncApiQueryIndicatorsFn();
        return;
      }
      if (Number(saveSearchData?.strengthType) !== 2) {
        // debugger;
        // 如果年份查询为空  需要用户自己选择
        changeSaveSearchData({
          ...saveSearchData,
          strengthType: null,
          strengthYear: null,
          strengthNorm: null,
        });
        changeCurrentSaveData({
          ...currentSaveData,
          strengthType: null,
          strengthYear: null,
          strengthNorm: null,
        });
        changeIsFirstYear(false);
      }
    });
  };
  /**
   * 获取运营指标接口
   * **/
  const ApiQueryIndicatorsFn = async () => {
    if (saveSearchData.strengthType && saveSearchData.strengthYear) {
      await ApiQueryIndicators({
        strengthType: saveSearchData.strengthType || '',
        strengthYear: saveSearchData.strengthYear || '',
      }).then(({ data }) => {
        if (data.data.length > 0) {
          const culOptionSave = () =>
            data.data.some(
              item => item.indicatorName === saveSearchData.strengthNorm,
            );
          const newArr = data.data.map((item, index) => {
            // 判断 strengthNorm 有值吗 有值 找出单位 没有值选择 指标的第一项
            if (saveSearchData.strengthNorm === item.indicatorName) {
              getUnit(item.unitValue);
            }

            if (
              (index === 0 && saveSearchData.strengthNorm === null) ||
              (saveSearchData.strengthNorm !== null && !culOptionSave())
            ) {
              changeSaveSearchData({
                ...saveSearchData,
                strengthNorm: data.data[0].indicatorName,
                isAdd: data.data[0].isAdd,
              });
              changeCurrentSaveData({
                ...currentSaveData,
                strengthNorm: data.data[0].indicatorName,
                isAdd: data.data[0].isAdd,
              });
              getUnit(data.data[0].unitValue);
            }
            return {
              label: item.indicatorName,
              value: item.indicatorName,
              unitValue: item.unitValue,
              isAdd: item.isAdd,
            };
          });
          getQueryIndicatorsOption([...newArr]);
        } else {
          changecontrolApiQueryIndicators(true);
          changeSaveSearchData({
            ...saveSearchData,
            strengthNorm: null,
          });
          changeCurrentSaveData({
            ...saveSearchData,
            strengthNorm: null,
          });
          getQueryIndicatorsOption([]);
        }
      });
    }
  };
  const asyncApiQueryIndicatorsFn = useSyncCallback(ApiQueryIndicatorsFn);
  useEffect(() => {
    // 排放量 强度变化趋势图
    syncCallbackFn();
    // 获取运营指标
    // if (!currentSaveData.strengthNorm) {
    if (!controlApiQueryIndicators) {
      asyncApiQueryIndicatorsFn();
    }
    if (isFirsstYear) {
      ApiQueryYearsFn();
    }
    // }
  }, [
    currentSaveData.strengthType,
    currentSaveData.strengthYear,
    currentSaveData.strengthNorm,
    currentSaveData.isAdd,
    controlApiQueryIndicators,
  ]);
  // 不断获取 部门排行榜的高度 和table内容的高度

  useEffect(() => {
    changeCurrentSaveData({
      strengthType: saveSearchData.strengthType,
      strengthYear: saveSearchData.strengthYear,
      strengthNorm: saveSearchData.strengthNorm,
      isAdd: saveSearchData.isAdd,
    });
  }, []);
  const clickFn = () => {
    changeIsFirst(false);
  };
  const sublevelArr = [
    {
      label: I18N.carbonDataManagemen.monthly,
      value: '1',
      children: monthOption,
    },
    {
      label: I18N.carbonDataManagemen.year,
      value: '2',
      children: [
        {
          label: I18N.carbonDataManagemen.inThePastFiveYears,
          value: '2-1',
        },
        {
          label: I18N.carbonDataManagemen.inThePastDecade,
          value: '2-2',
        },
        {
          label: I18N.carbonDataManagemen.throughoutHistory,
          value: '2-3',
        },
      ],
    },
  ];
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
        getUnit,
        companyName,
        changecontrolApiQueryIndicators,
        getQueryIndicatorsOption,
      }}
    >
      {/* {JSON.stringify(controlApiQueryIndicators)}=controlApiQueryIndicators */}
      {/* {JSON.stringify(saveSearchData)}=saveSearchData
      {JSON.stringify(currentSaveData)}=currentSaveData */}
      {ecuteMenData.xaxis.length === 0 &&
        ecuteMenData.yaxis.length === 0 &&
        ecuteMenData.zaxis.length === 0 && (
          <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {I18N.template(I18N.carbonDataManagemen.compa12, {
              val1: companyName,
            })}
          </h6>
        )}
      {ecuteMenData.xaxis.length === 0 &&
        ecuteMenData.yaxis.length === 0 &&
        ecuteMenData.zaxis.length === 0 && (
          <Row justify='start' style={{ marginBottom: '10px' }}>
            <Col xs={6} sm={6} md={6} lg={6} xl={5}>
              <ComstomCascader
                placeholder={I18N.carbonDataManagemen.dataRangeSelection}
                options={[...sublevelArr]}
                // dropdownClassName='costomCascader'
                // dropdownMatchSelectWidth={true}
                style={{ width: '100%' }}
                onClick={e => e.preventDefault()}
                onChange={e => {
                  if (`${e[1]}`.split('-')[1]) {
                    changeSaveSearchData({
                      ...saveSearchData,
                      strengthType: e[0],
                      strengthYear: `${e[1]}`.split('-')[1] || '',
                    });
                    changeCurrentSaveData({
                      ...currentSaveData,
                      strengthType: `${e[0]}`,
                      strengthYear: `${e[1]}`.split('-')[1] || '',
                    });
                  } else {
                    changeSaveSearchData({
                      ...saveSearchData,
                      strengthType: e[0],
                      strengthYear: `${e[1]}`.split('-')[1] || '',
                      strengthNorm: null,
                    });
                    changeCurrentSaveData({
                      ...currentSaveData,
                      strengthType: `${e[0]}`,
                      strengthYear: `${e[1]}`.split('-')[1] || '',
                      strengthNorm: null,
                    });
                    getQueryIndicatorsOption([]);
                  }
                  changecontrolApiQueryIndicators(false);
                  // syncCallbackFn();
                }}
                // @ts-ignore
                value={
                  currentSaveData?.strengthType && currentSaveData?.strengthYear
                    ? [
                        `${currentSaveData?.strengthType || ''}`,
                        `${currentSaveData?.strengthType || ''}-${
                          currentSaveData?.strengthYear || ''
                        }`,
                      ]
                    : []
                }
              />
            </Col>
            <Col
              style={{ marginLeft: '20px' }}
              xs={6}
              sm={6}
              md={6}
              lg={6}
              xl={5}
            >
              <ComstomSelect
                placeholder={
                  I18N.carbonDataManagemen.productionAndOperationRefersTo
                }
                options={queryIndicatorsOption || []}
                // dropdownClassName='costomCascader'
                // dropdownMatchSelectWidth={true}
                value={currentSaveData?.strengthNorm}
                style={{ width: '100%' }}
                onMouseDown={e => e.preventDefault()}
                onChange={(e, option) => {
                  // getUnit(e)
                  const { unitValue, isAdd } = option as unknown as {
                    unitValue: string;
                    isAdd: number;
                  };
                  getUnit?.(unitValue);
                  changeSaveSearchData({
                    ...saveSearchData,
                    strengthNorm: e,
                    isAdd,
                  });
                  changeCurrentSaveData({
                    ...currentSaveData,
                    strengthNorm: e,
                    isAdd,
                  });
                  // syncCallbackFn();
                }}
              />
            </Col>
          </Row>
        )}
      {ecuteMenData.xaxis.length > 0 ||
      ecuteMenData.yaxis.length > 0 ||
      ecuteMenData.zaxis.length > 0 ? (
        <EmoChart
          option={firstOption}
          currentSaveData={currentSaveData}
          changeIsFirstFn={changeIsFirst}
          isFirst={isFirst}
          clickFn={clickFn}
          monthOption={monthOption}
          queryIndicatorsOption={queryIndicatorsOption}
          level={level}
          changeLevel={changeLevel}
          className='carbonDataTable'
        />
      ) : (
        <Nodata />
      )}
    </CarbonAudit.Provider>
  );
}
