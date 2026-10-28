/**
 * @description CBAM报表详情
 */
import { Tabs, TabsProps } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { CBAMRouteMaps } from '@/router/utils/cbam';
import { getSearchParams, updateUrl } from '@/utils';
import { toNavigate } from '../../router';

import CarbonTaxCalc from './CarbonTaxCalc';
import DataQuality from './DataQuality';
import GeneralInfo from './GeneralInfo';
import { INCLUDE_EL_ENUM } from './GeneralInfo/constant';
import HeatPower from './HeatPower';
import IndustryProcess from './IndustryProcess';
import ProductData from './ProductData';
import ProductSaleInfo from './ProductSaleInfo';
import ResultsSummary from './ResultsSummary';
import { INFO_SOURCE, TAB_OPTIONS, TAB_TYPE } from './constant';
import { useCbamPageInfo, useCbamReportPreviewContext } from './context';
import style from './index.module.less';
import { getGeneralInfoDetail } from '../service';

const {
  GENERAL_INFO,
  INDUSTRY_PROCESS,
  HEAT_POWER,
  PRODUCT_DATA,
  PRODUCT_SALE_INFO,
  CARBON_TAX_CALC,
  DATA_QUALITY_OTHER,
  RESULT_SUMMARY,
} = TAB_TYPE;

const ReportFormInfo = () => {
  const history = useHistory();
  const location = useLocation();
  const navigate = toNavigate(history);
  const { embedded, onBack: onPreviewBack } = useCbamReportPreviewContext();

  const { id } = useCbamPageInfo();

  /** URL 携带的参数 */
  const search = embedded
    ? Object.fromEntries(new URLSearchParams(location.search))
    : { ...getSearchParams()[0] };
  /** 是否是CBAM跳转过来的详情 是则展示返回 */
  const isCbamInfo = search?.source === INFO_SOURCE.CBAM;

  const updateReportUrl = (nextSearch: Record<string, unknown>) => {
    if (!embedded) {
      updateUrl(nextSearch);
      return;
    }

    const searchParams = new URLSearchParams(location.search);

    Object.entries(nextSearch).forEach(([key, value]) => {
      searchParams.set(
        key,
        typeof value === 'string' || typeof value === 'number'
          ? String(value)
          : JSON.stringify(value),
      );
    });
    history.replace({ ...location, search: searchParams.toString() });
  };

  /** 默认tab */
  const defaultTab = TAB_OPTIONS()?.filter(item => !item?.hidden);

  /** 步骤枚举 tab items */
  const [tabOptions, setTabOptions] = useState<TabsProps['items']>(defaultTab);

  /** 当前激活的Tab */
  const [currentTab, setCurrentTab] = useState<string>(
    search?.currentStep || GENERAL_INFO,
  );

  /** 控制热点联产tab是否显示的方法 */
  const onShowHeatPowerTab = async () => {
    if (!id) return;

    const { data } = await getGeneralInfoDetail({ id });

    const isShow = data?.data?.include === INCLUDE_EL_ENUM.TRUE;

    const newTabOptions =
      TAB_OPTIONS()
        ?.map(item => {
          if (item?.key === HEAT_POWER) {
            return {
              ...item,
              hidden: !isShow,
              disabled: !id,
            };
          }
          return {
            ...item,
            disabled: !id,
          };
        })
        ?.filter(item => !item?.hidden) || [];

    setTabOptions(newTabOptions);
  };

  /** 返回到列表页的方法 */
  const onBack = () => {
    if (embedded) {
      onPreviewBack?.();
      return;
    }

    navigate(CBAMRouteMaps.cbamReport);
  };

  /** Tab状态 当没有id时，除一般信息外的tab都禁用 */
  useEffect(() => {
    const arr =
      tabOptions?.map(item => ({
        ...item,
        disabled: !id,
      })) || [];
    setTabOptions([...arr] as TabsProps['items']);

    // 控制热点联产tab是否显示的方法
    onShowHeatPowerTab();
  }, [currentTab]);

  return (
    <div
      className={classNames(style.reportInfoWrapper, {
        [style.embedded]: embedded,
      })}
    >
      <div className={style.leftWrapper}>
        <Tabs
          className={style.tabs}
          tabPosition='left'
          activeKey={currentTab}
          items={tabOptions}
          onChange={currentTabValue => {
            updateReportUrl({
              ...search,
              currentStep: currentTabValue,
            });
            setCurrentTab(currentTabValue);
          }}
        />
      </div>

      <div key={currentTab} className={style.rightWrapper}>
        {/* 一般信息 */}
        {currentTab === GENERAL_INFO && (
          <GeneralInfo
            isCbamInfo={isCbamInfo}
            key={GENERAL_INFO}
            onClickNextStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: INDUSTRY_PROCESS,
              });
              setCurrentTab(INDUSTRY_PROCESS);
            }}
            onClickBack={onBack}
          />
        )}

        {/* 工业过程 */}
        {currentTab === INDUSTRY_PROCESS && (
          <IndustryProcess
            isCbamInfo={isCbamInfo}
            key={INDUSTRY_PROCESS}
            onClickNextStep={({ reportId }) => {
              // 判断tabOptions中是否存在热电联产，如果存在则跳到热点联产，否则跳到产品数据
              const hasHeatPower = tabOptions?.some(
                item => item?.key === HEAT_POWER,
              );

              if (hasHeatPower) {
                updateReportUrl({
                  id: reportId,
                  currentStep: HEAT_POWER,
                });
                setCurrentTab(HEAT_POWER);
              } else {
                updateReportUrl({
                  id: reportId,
                  currentStep: PRODUCT_DATA,
                });
                setCurrentTab(PRODUCT_DATA);
              }
            }}
            onClickBack={onBack}
          />
        )}

        {/* 热电联产 */}
        {currentTab === HEAT_POWER && (
          <HeatPower
            isCbamInfo={isCbamInfo}
            key={HEAT_POWER}
            onClickNextStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: PRODUCT_DATA,
              });
              setCurrentTab(PRODUCT_DATA);
            }}
            onClickBack={onBack}
          />
        )}

        {/* 产品数据 */}
        {currentTab === PRODUCT_DATA && (
          <ProductData
            isCbamInfo={isCbamInfo}
            key={PRODUCT_DATA}
            onClickNextStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: PRODUCT_SALE_INFO,
              });
              setCurrentTab(PRODUCT_SALE_INFO);
            }}
            onClickBack={onBack}
          />
        )}

        {/* 外售产品信息 */}
        {currentTab === PRODUCT_SALE_INFO && (
          <ProductSaleInfo
            isCbamInfo={isCbamInfo}
            key={PRODUCT_SALE_INFO}
            onClickNextStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: CARBON_TAX_CALC,
              });
              setCurrentTab(CARBON_TAX_CALC);
            }}
            onClickBack={onBack}
          />
        )}

        {/* 碳税计算 */}
        {currentTab === CARBON_TAX_CALC && (
          <CarbonTaxCalc
            isCbamInfo={isCbamInfo}
            key={CARBON_TAX_CALC}
            onClickPreStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: PRODUCT_SALE_INFO,
              });
              setCurrentTab(PRODUCT_SALE_INFO);
            }}
            onClickNextStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: DATA_QUALITY_OTHER,
              });
              setCurrentTab(DATA_QUALITY_OTHER);
            }}
            onClickBack={onBack}
          />
        )}

        {/* 数据质量及其他 */}
        {currentTab === DATA_QUALITY_OTHER && (
          <DataQuality
            isCbamInfo={isCbamInfo}
            key={DATA_QUALITY_OTHER}
            onClickNextStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: RESULT_SUMMARY,
              });
              setCurrentTab(RESULT_SUMMARY);
            }}
            onClickBack={onBack}
          />
        )}

        {/* 结果汇总 */}
        {currentTab === RESULT_SUMMARY && (
          <ResultsSummary
            onClickPreStep={({ reportId }) => {
              updateReportUrl({
                id: reportId,
                currentStep: DATA_QUALITY_OTHER,
              });
              setCurrentTab(DATA_QUALITY_OTHER);
            }}
            isCbamInfo={isCbamInfo}
            key={RESULT_SUMMARY}
            cbamId={id}
            onClickBack={onBack}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFormInfo;
