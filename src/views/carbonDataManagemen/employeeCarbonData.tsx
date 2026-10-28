/**
 *@file 员工碳数据
 * @auth ljh
 **/
import I18N from '@src/lang/I18N';
import { useEffect, useState, createContext, useLayoutEffect } from 'react';
import { Button, DatePicker, Form } from 'antd';
import './style.less';
// import { Settings } from '@store/module/settings';
// import { debounce } from 'lodash-es';
import IconFont from '@src/components/iconfont';
import { initCarbonData, initCarbonEmploySearchData } from '@src/router/utils';
import {
  greetActivityUsingPOSTAccountControllerApi,
  hotActivityUsingPOSTAccountControllerApi,
  linkUvUsingPOSTAccountControllerApi,
  getBeginTimeUsingGETAccountControllerApi,
  linkPvUsingPOSTAccountControllerApi,
} from '@src/sdks/java/data';
import { RootState } from '@src/store';
import { AppState } from '@store/module/app';
import moment, { Moment } from 'moment';
import RGL, { WidthProvider } from 'react-grid-layout';
import { connect } from 'react-redux';

import { ApiDragQuery, ApiDragSave } from './service';
import 'react-grid-layout/css/styles.css';
import ActivityData from './component/EmployCarbonData/ActivityData'; // 活跃度趋势图
import CarbonDataTop from './component/EmployCarbonData/CarbonDataTop'; // 场景减排量排行榜
import DataView from './component/EmployCarbonData/DataView'; // 引用数据看板
import GropData from './component/EmployCarbonData/GropData'; // 分组减排量 排行榜
import HeatStaticData from './component/EmployCarbonData/HeatStaticData'; // 场景热度统计
import PeopleNumberData from './component/EmployCarbonData/PeopleNumberData'; // 各时间段活跃人数统计
import PrizeTopData from './component/EmployCarbonData/PrizeTopData'; // 奖品排行榜
import ReductionData from './component/EmployCarbonData/ReductionData'; // 减排量趋势图
import RegisterData from './component/EmployCarbonData/RegisterData'; // 注册人数
import { UseEffectData } from './component/EmployCarbonData/UseEffectData'; // 使用场景比例
import ComanalysisLastStrengthData from './component/EmployCarbonData/employeeCarbonData';
import BubbleChart from './component/OverView/BubbleChart';
import CoMulberryChart from './component/OverView/ComMulberryChart'; // 桑葚图
import {
  CartDataType,
  LayoutType,
  LinkDataType,
  SearchDataType,
} from './component/Typings/type';

// 气泡图
export const EchartContext = createContext({});
const ReactGridLayout = WidthProvider(RGL);
const { RangePicker } = DatePicker;
type LayoutProps = AppState;
/** 此页面代码为产品碳足迹、企业碳核查产品介绍页通用*/
const CertificationProductIndex = (props: LayoutProps) => {
  const [layout, chanegLayout] = useState<LayoutType[]>(initCarbonData);
  const [isLoading, changeIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saveSearchData, changeSaveSearchData] = useState<
    SearchDataType & {
      strengthType: string | number | null;
      strengthYear: string | number | null;
      strengthNorm: string | null;
      isAdd: number;
    }
  >(initCarbonEmploySearchData);
  /**
   * 组织名称
   * **/
  // const [companyName] = useState('');
  /** *
   * 时间选择
   * **/
  const [timeRange, changeTimeRange] = useState<[Moment, Moment] | null>(null);
  /**
   * linkUvUsData
   * **/
  const [linkUvUsData, getLinkUvUsData] = useState<LinkDataType>({
    uv: null,
    uvPercent: null,
  });
  const [linkPvUsData, getLinkPvUsData] = useState<LinkDataType>({
    pv: null,
    linkPer: null,
  });
  /**
   * 最受欢迎的数据
   *
   */
  const [greetActivityData, getGreetActivityData] = useState<CartDataType>({
    linkPer: null,
    tplName: null,
    countNum: null,
  });
  /** *
   * 热度最高的数据
   *
   */
  const [hotActivityData, getHotActivityData] = useState<CartDataType>({
    linkPer: null,
    tplName: null,
    countNum: null,
  });
  /**
   *  历史以来 初始时间
   * **/
  const [historyStartTime, getHistoryStartTime] = useState('');

  // 获取 热度最高活动/参与次数的接口
  const linkUvFn = async () => {
    const beginTime = timeRange && moment(timeRange[0]).format('YYYY-MM-DD');
    const endTime = timeRange && moment(timeRange[1]).format('YYYY-MM-DD');
    if (beginTime && endTime) {
      await linkUvUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
        type: 1,
      }).then(({ data }) => {
        if (Number(data.code) === 200 && data.data) {
          const linkData = data.data as LinkDataType;
          getLinkUvUsData({ ...linkData });
        } else {
          getLinkUvUsData({
            uv: null,
            uvPercent: null,
          });
        }
      });
    }
  };
  const linkPvFn = async () => {
    const beginTime = timeRange && moment(timeRange[0]).format('YYYY-MM-DD');
    const endTime = timeRange && moment(timeRange[1]).format('YYYY-MM-DD');
    if (beginTime && endTime) {
      await linkPvUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
        type: 2,
      }).then(({ data }) => {
        if (Number(data.code) === 200 && data.data) {
          const linkData = data.data as LinkDataType;
          getLinkPvUsData({ ...linkData });
        } else {
          getLinkPvUsData({
            pv: null,
            linkPer: null,
          });
        }
      });
    }
  };
  const greetActivity = async () => {
    const beginTime = timeRange && moment(timeRange[0]).format('YYYY-MM-DD');
    const endTime = timeRange && moment(timeRange[1]).format('YYYY-MM-DD');
    if (beginTime && endTime) {
      await greetActivityUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
      }).then(({ data }) => {
        if (Number(data.code) === 200 && data.data) {
          const activityData = data.data as {
            countNum?: string;
            linkPer?: string;
          };
          getGreetActivityData({ ...activityData });
        } else {
          getGreetActivityData({
            linkPer: null,
            tplName: null,
            countNum: null,
          });
        }
      });
    }
  };
  const hotActivity = async () => {
    const beginTime = timeRange && moment(timeRange[0]).format('YYYY-MM-DD');
    const endTime = timeRange && moment(timeRange[1]).format('YYYY-MM-DD');
    if (beginTime && endTime) {
      await hotActivityUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
      }).then(({ data }) => {
        if (Number(data.code) === 200 && data.data) {
          const hotyData = data.data as {
            countNum?: string;
            linkPer?: string;
          };
          getHotActivityData({ ...hotyData });
        } else {
          getHotActivityData({
            linkPer: null,
            tplName: null,
            countNum: null,
          });
        }
      });
    }
  };
  const getTime = async () => {
    await getBeginTimeUsingGETAccountControllerApi().then(({ data }) => {
      if (Number(data.code) === 200) {
        const time = data.data as unknown as string;
        getHistoryStartTime(time);
      }
    });
  };
  useEffect(() => {
    // 时间选择 默认选择昨天

    getTime();
  }, []);
  useEffect(() => {
    linkUvFn();
    linkPvFn();
    greetActivity();
    hotActivity();
  }, [timeRange]);
  const ApiDragQueryFn = () => {
    ApiDragQuery({ type: 2 }).then(({ data }) => {
      if (data.code === 200) {
        if (data?.data?.dragData) {
          const getObj = JSON.parse(data.data.dragData);
          // console.log(getObj, 'getObj=getObj');
          chanegLayout([...getObj.layoutData1]);
          changeSaveSearchData({ ...getObj.saveSearchData });
          // @ts-ignore
          // changeTimeRange([...getObj.timeRange]);
          if (getObj.timeRange) {
            changeTimeRange([
              moment(getObj.timeRange[0]),
              moment(getObj.timeRange[1]),
            ]);
          } else {
            changeTimeRange([
              moment().subtract(1, 'days'),
              moment().subtract(1, 'days').endOf('day'),
            ]);
          }
        } else {
          changeTimeRange([
            moment().subtract(1, 'days'),
            moment().subtract(1, 'days').endOf('day'),
          ]);
        }

        // chanegLayout();
      }
      changeIsLoading(true);
    });
  };

  const ApiDragSaveFn = async () => {
    const svaeDragDataObj = {
      layoutData1: layout,
      saveSearchData,
      timeRange,
    };
    await ApiDragSave({
      dragData: JSON.stringify(svaeDragDataObj),
      type: 2,
    });
  };
  useEffect(() => {
    ApiDragQueryFn();
  }, []);
  useEffect(() => {
    if (isLoading) {
      ApiDragSaveFn();
    }
  }, [layout, saveSearchData, isLoading, timeRange]);
  const chontrolMove = () => (
    // eslint-disable-next-line
    <a
      className='dragIcon'
      onMouseEnter={() => {
        const newArr: { isDraggable: boolean }[] = layout.map(item => ({
          // @ts-ignore
          ...item,
          isDraggable: true,
        }));
        // @ts-ignore
        chanegLayout([...newArr]);
      }}
      onMouseLeave={() => {
        // @ts-ignore
        const newArr: { isDraggable: boolean }[] = layout.map(item => ({
          // @ts-ignore
          ...item,
          isDraggable: false,
        }));
        // @ts-ignore
        chanegLayout([...newArr]);
        // syncCallbackFn();
      }}
    >
      <IconFont
        style={{ marginRight: '10px', color: '#999EA4' }}
        type='icon-icon-tuozhuai-1'
      />
    </a>
  );
  const onlanguagechangeFn = layout => {
    const newlayout = layout.map(item => ({
      ...item,
    }));
    // @ts-ignore
    chanegLayout([...newlayout]);
  };
  useLayoutEffect(() => {
    // chanegLayout(s => [...s]);
    // eslint-disable-next-line no-debugger
    // debugger;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    // console.log(window.dispatchEvent(new Event('resize')));
  }, [props.sidebar]);

  return (
    <div
      style={{
        height: 'calc(100vh - 20px)',
        overflowY: 'auto',
        // padding: '10px',
      }}
    >
      {isLoading && (
        <EchartContext.Provider value={layout}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              // height: 'calc(100vh - 20px)',
              // overflowY: 'auto',
            }}
          >
            <h4>{I18N.carbonDataManagemen.employeeCarbonData}</h4>
            <Form.Item
              label={I18N.carbonDataManagemen.timeSelection}
              className='comsRangePicker'
            >
              <RangePicker
                open={open}
                onOpenChange={setOpen}
                allowClear={false}
                // @ts-ignore
                getPopupContainer={(trigger: HTMLElement) =>
                  (trigger && trigger.parentNode) || ''
                }
                disabledDate={current =>
                  current && current > moment().subtract(1, 'days').endOf('day')
                }
                className='Date-Ranager'
                // @ts-ignore
                value={timeRange}
                onChange={moment => {
                  // @ts-ignore
                  changeTimeRange(moment);
                }}
                renderExtraFooter={() => (
                  <>
                    <Button
                      onClick={() => {
                        changeTimeRange([
                          moment().subtract(1, 'days'),
                          moment().subtract(1, 'days').endOf('day'),
                        ]);
                        setOpen(false);
                      }}
                    >
                      {I18N.carbonDataManagemen.yesterday}
                    </Button>

                    <Button
                      onClick={() => {
                        changeTimeRange([
                          moment().subtract(7, 'days'),
                          moment().subtract(1, 'days').endOf('day'),
                        ]);
                        setOpen(false);
                      }}
                    >
                      {I18N.carbonDataManagemen.lastWeek2}
                    </Button>
                    <Button
                      onClick={() => {
                        changeTimeRange([
                          moment().subtract(30, 'days'),
                          moment().subtract(1, 'days').endOf('day'),
                        ]);
                        setOpen(false);
                      }}
                    >
                      {I18N.carbonDataManagemen.lastMonth2}
                    </Button>
                    <Button
                      onClick={() => {
                        changeTimeRange([
                          moment().subtract(91, 'days'),
                          moment().subtract(1, 'days').endOf('day'),
                        ]);
                        setOpen(false);
                      }}
                    >
                      {I18N.carbonDataManagemen.lastThreeMonths}
                    </Button>
                    <Button
                      onClick={() => {
                        changeTimeRange([
                          moment().subtract(181, 'days'),
                          moment().subtract(1, 'days').endOf('day'),
                        ]);
                        setOpen(false);
                      }}
                    >
                      {I18N.carbonDataManagemen.inThePastSixMonths}
                    </Button>
                    <Button
                      onClick={() => {
                        changeTimeRange([
                          moment(historyStartTime),
                          moment().subtract(1, 'days').endOf('day'),
                        ]);
                        setOpen(false);
                      }}
                    >
                      {I18N.carbonDataManagemen.throughoutHistory}
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </div>
          <ReactGridLayout
            autoSize
            className='carbonData'
            layout={layout}
            cols={12}
            rowHeight={158}
            onLayoutChange={onlanguagechangeFn}
            onResize={(_, __, layoutItem, placeholder) => {
              const culIsChange = [
                '7-1',
                '7-2',
                '5-1',
                '5-2',
                '4-1',
                '4-2',
              ].some(it => it === layoutItem.i);
              if (layoutItem.w <= 2 && culIsChange) {
                layoutItem.w = 2;
                placeholder.w = 2;
              }
              if (layoutItem.w <= 4 && !culIsChange) {
                layoutItem.w = 4;
                placeholder.w = 4;
              }
              if (layoutItem.h <= 1 && culIsChange) {
                layoutItem.h = 1;
                placeholder.h = 1;
              }
              if (layoutItem.h <= 4 && !culIsChange) {
                layoutItem.h = 3;
                placeholder.h = 3;
              }
            }}
          >
            <section className='carbonDataItem' key='0-1'>
              {chontrolMove()}
              {/* 分组热度统计 数据看板 */}
              <GropData
                timeRange={timeRange}
                saveSearchData={saveSearchData}
                changeSaveSearchData={changeSaveSearchData}
              />
            </section>
            <section
              className='carbonDataItem'
              key='0-2'
              id='comanalysisLastStrengthData'
            >
              {chontrolMove()}
              {/* 分组减排排行榜 */}
              <ComanalysisLastStrengthData
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                layout={layout}
                timeRange={timeRange}
              />
            </section>
            <section className='carbonDataItem' key='1-1' id='div1'>
              {chontrolMove()}
              {/* 活跃度趋势图 */}
              <ActivityData
                timeRange={timeRange}
                saveSearchData={saveSearchData}
              />
            </section>
            <section className='carbonDataItem' key='2-1' id='ComCompanyByYear'>
              {chontrolMove()}
              {/* 注册趋势图 */}
              <RegisterData
                timeRange={timeRange}
                saveSearchData={saveSearchData}
              />
            </section>
            <section
              className='carbonDataItem'
              key='3-1'
              id='ComProportionByDept'
            >
              {chontrolMove()}
              {/* 减排量趋势图 */}
              <ReductionData
                timeRange={timeRange}
                saveSearchData={saveSearchData}
              />
            </section>
            <section className='carbonDataItem' key='4-1'>
              {chontrolMove()}
              {/* 参与人数  */}
              <DataView
                title={I18N.carbonDataManagemen.numberOfParticipants2}
                value={linkUvUsData.uv}
                percent={linkUvUsData.uvPercent}
              />
            </section>
            <section className='carbonDataItem' key='4-2'>
              {/* 参与次数 */}
              {chontrolMove()}
              <DataView
                title={I18N.carbonDataManagemen.participationTimes}
                value={linkPvUsData.pv}
                percent={linkPvUsData.linkPer}
              />
            </section>
            <section className='carbonDataItem' key='5-1'>
              {chontrolMove()}
              {/* 总减排量 */}
              <DataView
                title={I18N.carbonDataManagemen.totalEmissionReductionK}
                value={
                  linkUvUsData.cers
                    ? (Number(linkUvUsData.cers) / 1000).toFixed(2)
                    : null
                }
                percent={linkUvUsData.cersPercent || linkUvUsData.cersPercent}
              />
            </section>
            <section className='carbonDataItem' key='5-2'>
              {chontrolMove()}
              {/* 人均减排量 */}
              <DataView
                title={I18N.carbonDataManagemen.perCapitaEmissionReduction}
                value={
                  linkUvUsData.avgCers
                    ? Number(linkUvUsData.avgCers).toFixed(2)
                    : null
                }
                percent={linkUvUsData.avgPercent || linkUvUsData.avgPercent}
              />
            </section>
            <section className='carbonDataItem' key='7-1'>
              {chontrolMove()}

              {/* 答题参与人数 */}
              <DataView
                title={I18N.carbonDataManagemen.theMostPopular}
                value={`${greetActivityData?.tplName || '-'}/${
                  greetActivityData?.countNum || '-'
                }`}
                percent={greetActivityData?.linkPer}
              />
            </section>
            <section className='carbonDataItem' key='7-2'>
              {chontrolMove()}
              <DataView
                title={I18N.carbonDataManagemen.theHottest}
                value={`${hotActivityData?.tplName || '-'}/${
                  hotActivityData?.countNum || '-'
                }`}
                percent={hotActivityData?.linkPer}
              />
            </section>
            <section className='carbonDataItem' key='8-1' id='ComAudit'>
              {chontrolMove()}
              {/* 场景热度统计 */}
              <HeatStaticData
                timeRange={timeRange}
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
              />
            </section>
            <section className='carbonDataItem' key='8-2' id='ComEffect'>
              {chontrolMove()}
              {/* 场景减排量排行榜 */}
              {/* <ComEffect
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
              /> */}
              <CarbonDataTop
                timeRange={timeRange}
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                layout={layout}
              />
            </section>
            <section className='carbonDataItem' key='9-0'>
              {chontrolMove()}
              <UseEffectData
                timeRange={timeRange}
                saveSearchData={saveSearchData}
              />
            </section>
            <section className='carbonDataItem' key='10-1'>
              {chontrolMove()}
              <CoMulberryChart timeRange={timeRange} />
            </section>
            <section className='carbonDataItem' key='10-2' id='prizeTopData'>
              {chontrolMove()}
              <PrizeTopData
                timeRange={timeRange}
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                layout={layout}
              />
            </section>
            <section className='carbonDataItem' key='11-0'>
              {chontrolMove()}
              <PeopleNumberData
                timeRange={timeRange}
                saveSearchData={saveSearchData}
              />
            </section>
            <section className='carbonDataItem' key='12-0'>
              {chontrolMove()}
              <BubbleChart timeRange={timeRange} />
            </section>
          </ReactGridLayout>
        </EchartContext.Provider>
      )}{' '}
    </div>
  );
};
export default connect(({ app, settings: { layout, theme } }: RootState) => ({
  ...app,
  layout,
  theme,
}))(CertificationProductIndex);
