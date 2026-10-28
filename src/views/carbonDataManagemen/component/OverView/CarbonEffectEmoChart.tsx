/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-29 11:14:54
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:34:30
 */
/** *
 * @file 碳数据审核 echert
 * @author ljh
 * @description echert 支持数据下钻功能 在该页面请求二级数据 同是具有返回功能
 * * */
import I18N from '@src/lang/I18N';
import { Button, Row, Radio } from 'antd';
import * as echarts from 'echarts';
import { delay } from 'lodash-es';
import { useRef, useEffect, useContext, useState } from 'react';

import { CarbonEffect } from './ComEffect';
import { ApiEffectSubclass } from '../../service';

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
    '8-2': string;
  };
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
      // eslint-disable-next-line no-param-reassign
      delete obj[key as keyof typeof obj];
    }
  }
  return obj;
};

const EmoChart: React.FC<EchartProp> = ({
  option,
  key,
  className,
  style = { width: '100%', height: '80%' },
  currentSaveData,
  // @ts-ignore   // fixme 待补充类型
  changeIsFirstFn,
  // @ts-ignore   // fixme 待补充类型
  clickFn,
  // @ts-ignore   // fixme 待补充类型
  level,
  // @ts-ignore   // fixme 待补充类型
  changeLevel,
}) => {
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
  } = useContext(CarbonEffect);

  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const [titleData, getParams] = useState<{ name: string }>({ name: '' });
  const [saveOption, getSaveOtion] = useState([]);

  useEffect(() => {
    echartsInstance.current = echarts.init(chartRef.current as HTMLDivElement);
  }, []);
  useEffect(() => {
    const handleResize = () => {
      echartsInstance.current?.resize();
    };
    if (document) {
      // @ts-ignore
      document
        ?.querySelector('#ComEffect')
        .addEventListener('resize', handleResize);
    }

    window.addEventListener('resize', handleResize);

    // 选择需要观察变动的节点
    const targetNode = document.getElementById('ComEffect');

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
    echartsInstance.current?.setOption(option);
    echartsInstance.current?.off('click');
    echartsInstance.current?.on('click', params => {
      // 数据下钻 接口
      if (Number(level) === 0) {
        const paramsData = params.data as { key: string; name: string };
        getParams({ ...paramsData });
        changeIsFirstFn?.(false);
        clickFn?.(params);
        changeLevel?.(1);
        ApiEffectSubclass({
          audit: currentSaveData?.['8-2'] || '', // 1 近一周、2 近一月、3 近一年
          score: paramsData?.key || '1',
        }).then(({ data }) => {
          echartsInstance.current?.clear();
          const newOption = {
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/> {b} : {c} ({d}%)',
            },
            legend: {
              top: '5%',
              left: 'center',
            },
            series: [
              {
                name: I18N.template(I18N.carbonDataManagemen.param6, {
                  val1: paramsData?.name,
                }),
                type: 'pie',
                top: 50,
                hoverAnimation: false,
                radius: '70%',
                data: [...data.data],
              },
            ],
          };
          echartsInstance.current?.setOption(newOption);
          // @ts-ignore
          getSaveOtion([{ ...newOption }]);
        });
      }
    });
    echartsInstance.current?.on('mouseout', () => {
      // _.delay(() => {
      const dom = document.querySelector('.ComCompanyByStrength_tooltip');
      //
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
  }, [level, saveOption]);
  useEffect(() => {
    // @ts-ignore
    const currentOption = level === 0 ? option : saveOption[level - 1];
    echartsInstance.current?.setOption(currentOption || option);
  }, [option, saveOption]);
  return (
    <>
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {Number(level) === 0
          ? I18N.template(I18N.carbonDataManagemen.compa9, {
              val1: companyName,
            })
          : I18N.template(I18N.carbonDataManagemen.title3, {
              val1: titleData.name,
            })}
      </h6>
      <Row justify='start' style={{ marginBottom: '10px' }}>
        {Number(level) === 0 && (
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
            <Radio.Button value='1'>
              {I18N.carbonDataManagemen.lastWeek}
            </Radio.Button>
            <Radio.Button value='2'>
              {I18N.carbonDataManagemen.inThePastMonth}
            </Radio.Button>
            <Radio.Button value='3'>
              {I18N.workbench.inThePastYear}
            </Radio.Button>
          </Radio.Group>
        )}
      </Row>
      {Number(level) > 0 && (
        <Button
          type='link'
          onClick={() => {
            changeLevel?.(0);
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
