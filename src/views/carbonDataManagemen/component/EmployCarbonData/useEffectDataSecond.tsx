/** *
 * @file 碳数据审核 echert
 * @author ljh
 * @description echert 支持数据下钻功能 在该页面请求二级数据 同是具有返回功能
 * * */
import I18N from '@src/lang/I18N';
import { hotAnalysisSubclassUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import { Button } from 'antd';
import * as echarts from 'echarts';
import { delay } from 'lodash-es';
import moment from 'moment';
import { useRef, useEffect, useState, useMemo, useContext } from 'react';

import { EchartContext } from '../../employeeCarbonData';
import { EchartPerLabel } from '../OverView/ComProportionByDept';

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
  currentSaveData: {
    '9-0': string;
  };
  changeIsFirstFn?: React.Dispatch<React.SetStateAction<boolean>>;
  isFirst?: boolean;
  clickFn?: (params) => void;
  changeLevel?: React.Dispatch<React.SetStateAction<number>>;
  level?: number;
  timeRange?: string[];
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
  changeIsFirstFn,
  clickFn,
  level,
  changeLevel,
  timeRange,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const [titleData, getParams] = useState<{ name: string }>({ name: '' });
  const [saveOption, getSaveOtion] = useState([]);
  const content = useContext(EchartContext);
  useMemo(() => {
    echartsInstance.current?.resize();
  }, [content]);
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
        const paramsData = params.data as {
          key: string;
          name: string;
          tplId: number;
          tplIds: number[];
        };
        getParams({ ...paramsData });
        changeIsFirstFn?.(false);
        clickFn?.(params);
        changeLevel?.(1);
        const beginTime =
          (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
        const endTime =
          (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
        const type = currentSaveData['9-0']
          ? Number(currentSaveData['9-0'])
          : 0;
        const { tplId, tplIds } = paramsData;
        hotAnalysisSubclassUsingPOSTAccountControllerApi({
          beginTime,
          endTime,
          type,
          tplId,
          tplIds,
        }).then(({ data }) => {
          const firstData = data.data as {
            countNum: string;
            orgName: string;
          }[];
          const dataArr = firstData.map(item => ({
            value: item.countNum,
            name: item.orgName,
          })) as [];
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
                name: I18N.template(I18N.carbonDataManagemen.param4, {
                  val1: params.name,
                }),
                type: 'pie',
                top: 50,
                hoverAnimation: false,
                radius: '70%',
                data: [...dataArr],
                ...EchartPerLabel,
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
  }, [level, saveOption, timeRange]);
  useEffect(() => {
    // @ts-ignore
    const currentOption = level === 0 ? option : saveOption[level - 1];
    echartsInstance.current?.setOption(currentOption || option);
  }, [option, saveOption]);
  return (
    <>
      <p className='title'>
        {level === 0
          ? I18N.carbonDataManagemen.scenarioUsageRatio
          : I18N.template(I18N.carbonDataManagemen.title, {
              val1: titleData.name,
            })}
      </p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
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
            top: '30px',
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
