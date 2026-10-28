/*
 * @@description:碳数据审核 echert  echert 支持数据下钻功能 在该页面请求二级数据 同是具有返回功能
 * @Author: ljh qifeng@carbonstop.net
 * @Date: 2022-07-18 09:40:39
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:42:06
 */

import I18N from '@src/lang/I18N';
import { Button, Row, Radio } from 'antd';
import * as echarts from 'echarts';
import { delay } from 'lodash-es';
import { useRef, useEffect, useContext, useState } from 'react';

import { CarbonAudit } from './ComAudit';
import { ApiAuditSubclass } from '../../service';

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
    '8-1': string;
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
  changeIsFirstFn,
  clickFn,
  level,
  changeLevel,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const [titleData, getParams] = useState<{ name: string }>({ name: '' });
  const [saveOption, getSaveOtion] = useState([]);

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
    const handleResize = () => {
      echartsInstance.current?.resize();
    };
    if (document) {
      // @ts-ignore
      document
        ?.querySelector('#ComAudit')
        .addEventListener('resize', handleResize);
    }

    window.addEventListener('resize', handleResize);

    // 选择需要观察变动的节点
    const targetNode = document.getElementById('ComAudit');

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
        // @ts-ignore
        changeLevel?.(1);
        ApiAuditSubclass({
          audit: currentSaveData?.['8-1'] || '', // 1 近一周、2 近一月、3 近一年
          subStatus: paramsData?.key || '1',
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
                name: I18N.template(I18N.carbonDataManagemen.param5, {
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
          // @ts-ignore
          getSaveOtion([{ ...newOption }]);
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
  }, [level, saveOption, currentSaveData]);
  useEffect(() => {
    // @ts-ignore
    const currentOption = level === 0 ? option : saveOption[level - 1];
    echartsInstance.current?.setOption(currentOption || option);
  }, [option, saveOption]);

  return (
    <>
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {Number(level) === 0
          ? I18N.template(I18N.carbonDataManagemen.compa8, {
              val1: companyName,
            })
          : I18N.template(I18N.carbonDataManagemen.title2, {
              val1: titleData.name,
            })}
      </h6>
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
            // @ts-ignore
            changeLevel(0);
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
