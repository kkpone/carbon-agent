/**
 * @description 管理产品信息
 */
import { Tabs } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { getSearchParams, lcaUpdateUrl } from '@/utils';
import { useNavigate } from '@/utils/polyfill';

import BasicInfo from './BasicInfo';
import BomList from './Bom';
import LifeCycleData from './LifeCycleData';
import SupplyData from './SupplyData';
import { TAB_OPTIONS, TAB_TYPE } from './constant';
import style from './index.module.less';

const { BASIC_INFO, PRODUCT_BOM, SUPPLY_DATA, LIFECYCLE_DATA } = TAB_TYPE;

const ReportFormInfo = () => {
  const navigate = useNavigate();

  /** 产品id */
  const { productId } = useParams<{ productId: string }>();

  /** URL 携带的参数 */
  const search = { ...getSearchParams()[0] };

  /** 当前激活的Tab */
  const [currentTab, setCurrentTab] = useState<string>(
    search?.currentStep || BASIC_INFO,
  );

  /** 返回到列表页的方法 */
  const onBack = () => {
    navigate(LCARouteMaps.lcaProduction);
  };

  return (
    <div className={style.reportInfoWrapper}>
      <div className={style.leftWrapper}>
        <Tabs
          className={style.tabs}
          tabPosition='left'
          activeKey={currentTab}
          items={TAB_OPTIONS()}
          onChange={currentTabValue => {
            lcaUpdateUrl({
              ...search,
              currentStep: currentTabValue,
            });
            setCurrentTab(currentTabValue);
          }}
        />
      </div>

      <div key={currentTab} className={style.rightWrapper}>
        {/* 产品基本信息 */}
        {currentTab === BASIC_INFO && (
          <BasicInfo productId={Number(productId)} onClickBack={onBack} />
        )}

        {/* 产品BOM */}
        {currentTab === PRODUCT_BOM && (
          <BomList productId={Number(productId)} onClickBack={onBack} />
        )}

        {/* 供应商数据 */}
        {currentTab === SUPPLY_DATA && (
          <SupplyData productId={Number(productId)} onClickBack={onBack} />
        )}

        {/* 生命周期数据 */}
        {currentTab === LIFECYCLE_DATA && (
          <LifeCycleData productId={Number(productId)} onClickBack={onBack} />
        )}
      </div>
    </div>
  );
};

export default ReportFormInfo;
