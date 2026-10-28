/**
 * @file 企业碳核算数据看板
 * @auth ljh
 *
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState, createContext, useLayoutEffect } from 'react';
import { AppState } from '@src/store/module/app';
import { initCarbonDataSearch, initCarbonEmployData } from '@src/router/utils';
import { connect } from 'react-redux';
import { RootState } from '@src/store';
import './style.less';
import RGL, { WidthProvider } from 'react-grid-layout';
import useSyncCallback from '@utils/useSyncCallback';
import IconFont from '@src/components/iconfont';
import { ApiDragSave, ApiDragQuery } from './service';
import 'react-grid-layout/css/styles.css';
import ComanalysisLastDischargeData from './component/OverView/ComanalysisLastDischargeData';
import ComanalysisLastStrengthData from './component/OverView/ComanalysisLastStrengthData';
import ComAuditData from './component/OverView/ComauditData';
import ComAuditDeayData from './component/OverView/ComauditDelayData';
import ComexecuteMenData from './component/OverView/ComexecuteMenData';
import ComexecuteCount from './component/OverView/ComexecuteCount';
import ComTargetPublish from './component/OverView/ComTargetPublish';
import ComSubmissionTrend from './component/OverView/ComSubmissionTrend';
import { ComEffect } from './component/OverView/ComEffect';
import ComSeniorityRank from './component/OverView/ComSeniorityRank';
import ComCompanyByYear from './component/OverView/ComCompanyByYear'; // 对比基准年碳排放变化趋势图
import { ComAudit } from './component/OverView/ComAudit'; // 碳数据审核预览
import { ComProportionByDept } from './component/OverView/ComProportionByDept'; // 各部门排放占比图
import { ComCompanyByStrength } from './component/OverView/ComCompanyByStrength'; // 排放强度
import { LayoutType, SearchDataType } from './component/Typings/type';

export const EchartContext = createContext({});
const ReactGridLayout = WidthProvider(RGL);
type LayoutProps = AppState;
/** 此页面代码为产品碳足迹、企业碳核查产品介绍页通用*/
const CertificationProductIndex = (props: LayoutProps) => {
  const [layout, chanegLayout] = useState<LayoutType[]>(initCarbonEmployData);
  const [saveSearchData, changeSaveSearchData] = useState<
    SearchDataType & {
      strengthType: string | number | null;
      strengthYear: string | number | null;
      strengthNorm: string | null;
      isAdd: number;
    }
  >(initCarbonDataSearch);
  /**
   * 组织名称
   * **/
  const [companyName, getCompanyName] = useState('');
  const [isLoading, changeIsLoading] = useState(false);
  const ApiDragSaveFn = async () => {
    const svaeDragDataObj = {
      layoutData1: layout,
      saveSearchData,
    };
    await ApiDragSave({
      dragData: JSON.stringify(svaeDragDataObj),
      type: 1,
    });
  };
  const ApiDragQueryFn = () => {
    ApiDragQuery().then(({ data }) => {
      if (data.code === 200) {
        if (data?.data?.dragData) {
          const getObj = JSON.parse(data.data.dragData);
          changeSaveSearchData({ ...getObj.saveSearchData });
          chanegLayout([...getObj.layoutData1]); // bug：测试 新增桑葚图
          getCompanyName(data.data.companyName || I18N.carbonDataManagemen.carbonBlockingTechnology);
        }

        // chanegLayout();
      }
      changeIsLoading(true);
    });
  };
  const syncCallbackFn = useSyncCallback(ApiDragSaveFn);
  useEffect(() => {
    if (isLoading) {
      syncCallbackFn();
    }
  }, [layout, saveSearchData, isLoading]);

  useEffect(() => {
    ApiDragQueryFn();
  }, []);

  useLayoutEffect(() => {
    // chanegLayout(s => [...s]);
    // eslint-disable-next-line no-debugger
    // debugger;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    // console.log(window.dispatchEvent(new Event('resize')));
  }, [props.sidebar]);
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

  return (
    <>
      {/* {JSON.stringify(layout)}=isLoading */}
      {isLoading && (
        <EchartContext.Provider value={layout}>
          <ReactGridLayout
            className='carbonData'
            layout={layout}
            cols={12}
            rowHeight={158}
            onLayoutChange={layout => {
              const newlayout = layout.map(item => ({
                ...item,
              }));
              // @ts-ignore
              chanegLayout([...newlayout]);
            }}
            onResize={(_, __, layoutItem, placeholder) => {
              const culIsChange = [
                '0-1',
                '0-2',
                '5-1',
                '5-2',
                '5-3',
                '7-1',
                '7-2',
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
            <section key='0-1' style={{ paddingLeft: '0', paddingRight: '0' }}>
              {chontrolMove()}
              {/* 上月碳排放量 数据看板 */}
              <ComanalysisLastDischargeData />
            </section>
            <section key='0-2' style={{ paddingLeft: '0', paddingRight: '0' }}>
              {chontrolMove()}

              {/* 上月碳排放强度 */}
              <ComanalysisLastStrengthData />
            </section>
            <section key='1-1' id='div1'>
              {chontrolMove()}
              {/* 排放量&强度变化趋势图 */}
              {isLoading && (
                <ComCompanyByStrength
                  changeSaveSearchData={changeSaveSearchData}
                  saveSearchData={saveSearchData}
                  companyName={companyName}
                />
              )}
            </section>
            <section key='2-1' id='ComCompanyByYear'>
              {chontrolMove()}
              {/* 对比基准年碳排放变化趋势图 */}
              <ComCompanyByYear
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
              />
            </section>
            <section key='3-1' id='ComProportionByDept'>
              {chontrolMove()}

              {/* 各部门排放占比图 */}
              <ComProportionByDept
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
              />
            </section>
            <section key='3-2' id='ComSeniorityRank'>
              {chontrolMove()}
              {/* 部门排行榜 */}
              <ComSeniorityRank
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
                layout={layout}
              />
            </section>
            <section key='4-1'>
              {chontrolMove()}
              {/* 报送趋势图 */}
              <ComSubmissionTrend
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
              />
            </section>
            <section key='5-1'>
              {chontrolMove()}

              {/* 本月待审核数据 */}
              <ComAuditDeayData />
            </section>
            <section key='5-2'>
              {chontrolMove()}

              {/* 本月审核通过数据 */}
              <ComAuditData />
            </section>
            <section key='5-3'>
              {chontrolMove()}

              {/* 目标分配人数 */}
              <ComexecuteMenData
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
              />
            </section>
            <section key='7-1'>
              {chontrolMove()}

              {/* 目标分配次数 */}
              <ComexecuteCount
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
              />
            </section>
            <section key='7-2'>
              {chontrolMove()}

              <ComTargetPublish
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
              />
            </section>
            <section key='8-1' id='ComAudit'>
              {chontrolMove()}
              {/* 碳数据审核 */}
              <ComAudit
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
              />
            </section>
            <section key='8-2' id='ComEffect'>
              {chontrolMove()}
              {/* 碳数据概览 */}
              <ComEffect
                changeSaveSearchData={changeSaveSearchData}
                saveSearchData={saveSearchData}
                companyName={companyName}
              />
            </section>
          </ReactGridLayout>
        </EchartContext.Provider>
      )}{' '}
    </>
  );
};
export default connect(({ app, settings: { layout, theme } }: RootState) => ({
  ...app,
  layout,
  theme,
}))(CertificationProductIndex);
