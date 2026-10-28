/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-29 11:14:54
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:33:59
 */
/** *
 * @file 部门占比图echert
 * @author ljh
 * @description echert 支持数据下钻功能 在该页面请求二级数据 同是具有返回功能
 * * */
import I18N from '@src/lang/I18N';
import { useRef, useEffect, useContext, useState } from 'react';
import * as echarts from 'echarts';
import { Button, Row, Radio } from 'antd';
import { delay } from 'lodash-es';
import { ApiCategory, ApiSubclass } from '../../service';
import { CarbonAudit, EchartPerLabel } from './ComProportionByDept';
import { EchertPieOption } from './ComAudit';
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
  currentSaveData?: { '3-1': string };
  changeIsFirstFn?: React.Dispatch<React.SetStateAction<boolean>>;
  isFirst?: boolean;
  clickFn?: (params) => void;
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
// let level = 0; // 用于判断 点击的级别
let deptId = ''; // 用于存储部门id
const EmoChart: React.FC<EchartProp> = ({
  option,
  key,
  className,
  style = { width: '100%', height: '80%' },
  currentSaveData,
  changeIsFirstFn,
  // isFirst,
  level,
  changeLevel,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const [titleData, getParams] = useState<{ name: string; deptId: string }>({
    name: '',
    deptId: '',
  });
  const [titleData2, getParams2] = useState<{ name: string; deptId: string }>({
    name: '',
    deptId: '',
  });
  const [saveOption, getSaveOtion] = useState<{ [x: string]: any }>({});
  // @ts-ignore
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
    companyName,
    // @ts-ignore
  } = useContext(CarbonAudit);

  useEffect(() => {
    echartsInstance.current = echarts.init(chartRef.current as HTMLDivElement);
  }, []);
  useEffect(() => {
    echartsInstance.current?.off('click');
    echartsInstance.current?.on('click', params => {
      // @ts-ignore

      changeIsFirstFn?.(false);
      if (Number(level) === 0) {
        changeLevel?.(1);
        const paramsData = params.data as {
          key: string;
          name: string;
          deptId: string;
        };
        getParams({ ...paramsData });
        deptId = paramsData.deptId;
        ApiCategory({
          deptMonth: currentSaveData?.['3-1'] || '', // 1,上月;2,近三个月;3,今年以来
          deptId: paramsData?.deptId || '1',
        }).then(({ data }) => {
          echartsInstance.current?.clear();
          const newOption = {
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
                name: I18N.template(I18N.carbonDataManagemen.param8, {
                  val1: paramsData?.name,
                }),
                type: 'pie',
                top: 50,
                hoverAnimation: false,
                radius: '70%',
                data: [...data.data],
                ...EchartPerLabel,
              },
            ],
            ...EchertPieOption,
          };
          // @ts-ignore
          getSaveOtion({
            ...saveOption,
            1: newOption,
          });
          echartsInstance.current?.setOption(newOption);
        });
      }
      if (Number(level) === 1) {
        changeLevel?.(2);

        const paramsData = params.data as {
          key: string;
          name: string;
          deptId: string;
        };
        getParams2({ ...paramsData });
        ApiSubclass({
          deptMonth: currentSaveData?.['3-1'] || '', // 1,上月;2,近三个月;3,今年以来
          deptId,
          scopeType:
            params.name === I18N.enterpriseCarbonAccount2.scopeOne
              ? '1'
              : params.name === I18N.enterpriseCarbonAccount2.scope2
              ? '2'
              : '3',
        }).then(({ data }) => {
          echartsInstance.current?.clear();
          const newOption = {
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
                name: I18N.template(I18N.carbonDataManagemen.param7, {
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
      // _.delay(() => {
      const dom = document.querySelector('.ComCompanyByStrength_tooltip');
      if (dom) {
        // @ts-ignore
        dom.style.display = 'none';
      }

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
      // _.delay(() => {
      const dom = document.querySelector('.ComCompanyByStrength_tooltip');
      if (dom) {
        // @ts-ignore
        dom.style.display = 'none';
      }

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
  }, [level, saveOption, currentSaveData]);
  useEffect(() => {
    const handleResize = () => {
      echartsInstance.current?.resize();
    };
    if (document) {
      // @ts-ignore
      document
        ?.querySelector('#ComProportionByDept')
        .addEventListener('resize', handleResize);
    }

    window.addEventListener('resize', handleResize);
    // 选择需要观察变动的节点
    const targetNode = document.getElementById('ComProportionByDept');

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
    // @ts-ignore
    const currentOption = level === 0 ? option : saveOption[level];
    echartsInstance.current?.setOption(currentOption || option);
  }, [option, saveOption, level]);

  return (
    <>
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {Number(level) === 0
          ? I18N.template(I18N.carbonDataManagemen.compa10, {
              val1: companyName,
            })
          : Number(level) === 1
          ? I18N.template(I18N.carbonDataManagemen.title5, {
              val1: titleData.name,
            })
          : I18N.template(I18N.carbonDataManagemen.title4, {
              val1: titleData2.name,
            })}
      </h6>
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
            <Radio.Button value='1'>
              {I18N.carbonDataManagemen.lastMonth}
            </Radio.Button>
            <Radio.Button value='2'>
              {I18N.workbench.inThePastThreeMonths}
            </Radio.Button>
            <Radio.Button value='3'>
              {I18N.carbonDataManagemen.sinceThisYearOn}
            </Radio.Button>
          </Radio.Group>
        )}
      </Row>
      {Number(level) > 0 && (
        <Button
          type='link'
          onClick={() => {
            // @ts-ignore
            changeLevel(--level);
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
