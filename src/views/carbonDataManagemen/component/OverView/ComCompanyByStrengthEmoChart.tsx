/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-29 11:14:54
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:33:02
 */
/** *
 * @file 碳数据审核 echert
 * @author ljh
 * @description echert 支持数据下钻功能 在该页面请求二级数据 同是具有返回功能
 * * */
import I18N from '@src/lang/I18N';
import { Button, Row, Col } from 'antd';
import * as echarts from 'echarts';
import { delay } from 'lodash-es';
import { useRef, useEffect, useContext, useState } from 'react';

import { EchertPieOption } from './ComAudit';
import { CarbonAudit } from './ComCompanyByStrength';
import { EchartPerLabel } from './ComProportionByDept';
import { ApiCategory, ApiSubclass } from '../../service';
import { ComstomCascader, ComstomSelect } from '../Basic';
/** 获取store方法**/
// EChartOption// 被注释掉了

type EchartProp = {
  option: echarts.EChartsCoreOption;
  key?: string;
  style?: {
    width: string;
    height: string;
  };
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
  currentSaveData?: {
    strengthType: string | null;
    strengthYear: string | null;
    strengthNorm: string | null;
    isAdd: number;
  };
  changeIsFirstFn?: React.Dispatch<React.SetStateAction<boolean>>;
  isFirst?: boolean;
  clickFn?: (params) => void;
  monthOption?: { label: string; value: string }[];
  queryIndicatorsOption?: { label: string; value: string }[];
  changeLevel?: React.Dispatch<React.SetStateAction<number>>;
  level?: number;
};

const removeUndefined = (obj: object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (obj[key as keyof typeof obj] === undefined) {
      delete obj[key as keyof typeof obj];
    }
  }
  return obj;
};
// let deptId = ''; // 用于存储部门id
const EmoChart: React.FC<EchartProp> = ({
  option,
  key,
  className,
  style = { width: '100%', height: '80%' },
  currentSaveData,
  changeIsFirstFn,
  monthOption,
  queryIndicatorsOption,
  level,
  changeLevel,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const [paramsData, getParams] = useState<{
    name: string;
    deptId: string;
    strengthTime: string;
  }>({
    name: '',
    deptId: '',
    strengthTime: '',
  });
  const [paramsData2, getParams2] = useState<{
    name: string;
    deptId: string;
    strengthTime: string;
  }>({
    name: '',
    deptId: '',
    strengthTime: '',
  });
  const [saveOption, getSaveOtion] = useState<{ [x: string]: any }>({});

  // @ts-ignore
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
  // @ts-ignore   // fixme 待补充类型
  const {
    // @ts-ignore   // fixme 待补充类型
    changeSaveSearchData,
    // @ts-ignore   // fixme 待补充类型
    changeCurrentSaveData,
    // @ts-ignore   // fixme 待补充类型
    syncCallbackFn,
    // @ts-ignore   // fixme 待补充类型
    saveSearchData,
    // @ts-ignore   // fixme 待补充类型
    getUnit,
    // @ts-ignore   // fixme 待补充类型
    companyName,
    // @ts-ignore   // fixme 待补充类型
    changecontrolApiQueryIndicators,
    // @ts-ignore   // fixme 待补充类型
    getQueryIndicatorsOption,
    // @ts-ignore
  } = useContext(CarbonAudit);

  useEffect(() => {
    echartsInstance.current = echarts.init(chartRef.current as HTMLDivElement);
    const handleResize = () => {
      echartsInstance.current?.resize();
    };
    if (document) {
      // @ts-ignore
      document?.querySelector('#div1').addEventListener('resize', handleResize);
    }
    window.addEventListener('resize', handleResize);
    // 选择需要观察变动的节点
    const targetNode = document.getElementById('div1');
    // 观察器的配置（需要观察什么变动）
    const config = { attributes: true, childList: true, subtree: true };
    // 当观察到变动时执行的回调函数
    // @ts-ignore
    const callback = function () {
      delay(handleResize, 1000);
    };
    // 创建一个观察器实例并传入回调函数
    const observer = new MutationObserver(callback);
    // 以上述配置开始观察目标节点
    // @ts-ignore
    observer.observe(targetNode, config);

    return () => {
      window.removeEventListener('resize', handleResize);
      echartsInstance.current?.dispose();
    };
  }, []);
  useEffect(() => {
    echartsInstance.current?.off('click');
    echartsInstance.current?.on('click', params => {
      changeIsFirstFn?.(false);
      if (Number(level) === 0) {
        changeLevel?.(1);
        const nameStr = params.name as unknown as string;
        getParams({ ...paramsData, name: nameStr });
        ApiCategory({
          strengthNorm: saveSearchData?.strengthNorm || '', // 1,上月;2,近三个月;3,今年以来
          strengthType: saveSearchData?.strengthType || '',
          strengthYear: saveSearchData?.strengthYear || '',
          strengthTime: `${params?.name}`?.match(/[0-9]*/g)?.[0] || '',
          // @ts-ignore
          isAdd: currentSaveData.isAdd,
        }).then(({ data }) => {
          echartsInstance.current?.clear();
          const newOption = {
            legend: {
              top: '5%',
              left: 'center',
            },
            series: [
              {
                name: I18N.template(I18N.carbonDataManagemen.param11, {
                  val1: params?.name,
                }),
                type: 'pie',
                top: 50,
                hoverAnimation: false,
                radius: '70%',
                data: [...data.data],
              },
            ],
            ...EchertPieOption,
            grid: {
              top: 1000,
            },
          };
          // addCarbonDataEchertOption({ '4-1': newOption });
          echartsInstance.current?.setOption(newOption);
          // @ts-ignore
          getSaveOtion({
            ...saveOption,
            1: newOption,
          });
          echartsInstance.current?.setOption(newOption);
        });
      }
      if (Number(level) === 1) {
        const nameStr = params.name as unknown as string;
        getParams2({ ...paramsData2, name: nameStr });
        changeLevel?.(2);
        ApiSubclass({
          strengthType: saveSearchData?.strengthType || '', // 1,上月;2,近三个月;3,今年以来
          strengthYear: saveSearchData?.strengthYear || '',
          scopeType:
            params.name === I18N.enterpriseCarbonAccount2.scopeOne
              ? '1'
              : params.name === I18N.enterpriseCarbonAccount2.scope2
              ? '2'
              : '3',
          isAdd: saveSearchData?.isAdd || 0,
          strengthTime: `${paramsData.name}`.match(/[0-9]*/g)?.[0] || '',
        }).then(({ data }) => {
          echartsInstance.current?.clear();
          const newOption = {
            legend: {
              type: 'plain',
              top: '5%',
              left: 'center',
            },
            series: [
              {
                name: I18N.template(I18N.carbonDataManagemen.param10, {
                  val1: params?.name,
                }),
                type: 'pie',
                hoverAnimation: false,
                radius: '70%',
                top: 50,
                data: [...data.data],
                ...EchartPerLabel,
              },
            ],
            ...EchertPieOption,
          };
          echartsInstance.current?.setOption(newOption);
          // @ts-ignore
          getSaveOtion({
            ...saveOption,
            2: newOption,
          });
          echartsInstance.current?.setOption(newOption);
        });
      }
    });
    echartsInstance.current?.on('mouseout', () => {
      const dom = document.querySelector('.ComCompanyByStrength_tooltip');
      if (dom) {
        // @ts-ignore
        dom.style.display = 'none';
      }

      // }, 0.001);
      echartsInstance.current?.dispatchAction(
        {
          type: 'hideTip',
        },
        {
          silent: true,
          flush: true,
        },
      );
    });
    echartsInstance.current?.on('globalout', () => {
      const dom = document.querySelector('.ComCompanyByStrength_tooltip');
      if (dom) {
        // @ts-ignore
        dom.style.display = 'none';
      }

      // }, 0.001);
      echartsInstance.current?.dispatchAction(
        {
          type: 'hideTip',
        },
        {
          silent: true,
          flush: true,
        },
      );
    });
    return () => {
      if (echartsInstance.current) {
        echartsInstance.current?.off('click');
        echartsInstance.current?.off('mouseout');
        echartsInstance.current?.off('globalout');
      }
    };
  }, [level, saveOption, currentSaveData, paramsData]);

  useEffect(() => {
    // @ts-ignore
    const currentOption = level === 0 ? option : saveOption[level];
    echartsInstance.current?.setOption(currentOption || option);
  }, [option, saveOption, level]);
  return (
    <>
      {/* {JSON.stringify(saveSearchData)}=saveSearchData */}
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {Number(level) === 0
          ? I18N.template(I18N.carbonDataManagemen.compa14, {
              val1: companyName,
            })
          : Number(level) === 1
          ? I18N.template(I18N.carbonDataManagemen.compa13, {
              val1: companyName,
            })
          : I18N.template(I18N.carbonDataManagemen.param9, {
              val1: paramsData2.name,
            })}
      </h6>
      {Number(level) === 0 && (
        <Row gutter={12} justify='start' style={{ marginBottom: '10px' }}>
          <Col xs={6} sm={6} md={6} lg={6} xl={5} style={{ padding: '0' }}>
            <ComstomCascader
              placeholder={I18N.carbonDataManagemen.dataRangeSelection}
              options={[...sublevelArr]}
              // dropdownClassName='costomCascader'
              // dropdownMatchSelectWidth={true}
              style={{ width: '100%' }}
              onClick={e => e.preventDefault()}
              onChange={e => {
                // debugger;
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
                syncCallbackFn();
                changecontrolApiQueryIndicators(false);
              }}
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
            style={{ marginLeft: '10px', padding: '0' }}
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
              dropdownMatchSelectWidth
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
                syncCallbackFn();
              }}
            />
          </Col>
        </Row>
      )}
      {Number(level) > 0 && (
        <Button
          type='link'
          onClick={() => {
            // @ts-ignore
            changeLevel?.(--level);
            echartsInstance.current?.clear();
          }}
          style={{
            position: 'absolute',
            right: '10px',
            top: '60px',
            zIndex: '99',
          }}
        >
          {I18N.carbonDataManagemen.returnToThePreviousLevel}
        </Button>
      )}
      <div
        ref={chartRef}
        {...removeUndefined({ key, className, style, option })}
      />
    </>
  );
};

export default EmoChart;
