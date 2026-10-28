/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-11 18:03:44
 * @Date: 2023-01-05 11:01:31
 * @@description: 快速核算 - 选择模型
 */
import I18N from '@src/lang/I18N';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Input, Menu } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getBusinessAccountingModelTableData } from '../../BusinessAccountingModel/service';
import {
  BusinessAccountingModelTableData,
  BusinessAccountingModelTableParams,
} from '../../BusinessAccountingModel/type';
import businessAccount from '../../businessAccount.module.less';
import styleCarbonFootprint3 from '../../index.module.less';
import {
  PROCESS_MODEL_MENU,
  PROCESS_MODEL_MENU_KEY,
} from '../../util/constant';

const QuickBusinessAccountingSelectModel = () => {
  const history = useHistory();
  /** 查询的条件 */
  const [searchParamsData] = useState<
    Partial<BusinessAccountingModelTableParams> & {
      pageNum: number;
      pageSize: number;
    }
  >({
    pageNum: 1,
    pageSize: 10,
  });

  /** 默认选中的菜单 */
  const [defaultMenu] = useState<string[]>(() => [
    PROCESS_MODEL_MENU_KEY.MY_MODEL,
  ]);

  /** 查询的条件 */
  const [modelList, setModelList] = useState<
    BusinessAccountingModelTableData[]
  >([]);
  /** 搜索模型的输入框 */
  const [, setSearchInput] = useState<string>();

  /** 当前选中的菜单信息 */
  const [selectMenuInfo, setSelectMenuInfo] = useState<{
    label: string;
    key: string;
  }>({
    label: I18N.carbonFootprint3.myModel,
    key: PROCESS_MODEL_MENU_KEY.MY_MODEL,
  });

  /**
   * @description: 获取模型的菜单
   */
  const getModelList = async () => {
    const back = await getBusinessAccountingModelTableData(searchParamsData);
    setModelList(back.data.data.rows);
  };

  /**
   * @description: 点击菜单,将点击的菜单详情临时记录
   * @param {string} key 当前选中的key
   */
  const clickMenus = (key: string) => {
    const backInfo = PROCESS_MODEL_MENU.find(info => info?.key === key);
    if (backInfo) {
      setSelectMenuInfo(backInfo);
    }
  };

  useEffect(() => {
    getModelList();
  }, []);
  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain}`}
    >
      <div className={businessAccount.searchTitleMain}>
        <div className={businessAccount.searchTitle}>
          {I18N.carbonFootprint3.modelBase}
        </div>
        <div>
          <Input
            suffix={<SearchOutlined />}
            onChange={event => setSearchInput(event.target.value)}
            style={{ width: 300 }}
            placeholder={I18N.carbonFootprint3.searchModel}
          />
        </div>
      </div>

      <div
        className={classNames(
          styleCarbonFootprint3.main,
          businessAccount.businessAccountMain,
        )}
      >
        <div className={businessAccount.businessAccountLeft}>
          <Menu
            mode='inline'
            style={{ width: '100%', borderRight: 0, fontSize: 14 }}
            defaultSelectedKeys={defaultMenu}
            items={PROCESS_MODEL_MENU}
            onClick={back => {
              clickMenus(back.key);
            }}
          />
        </div>
        <div className={businessAccount.businessAccountRight}>
          <div className='font-weight600'>{selectMenuInfo.label}</div>
          <div className={businessAccount.modelRightMain}>
            <div
              onClick={() => {
                history.push(
                  RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingAddBasic,
                );
              }}
              className={classNames(
                businessAccount.modelRightList,
                businessAccount.modelRightListAdd,
              )}
            >
              <div>
                <PlusOutlined
                  style={{ color: '#999EA4', fontSize: 35, display: 'block' }}
                />
                <div className='m-t-20' style={{ color: '#6C757D' }}>
                  {I18N.carbonFootprint3.addAccounting}
                </div>
              </div>
            </div>
            {modelList.map(data => (
              <div
                className={classNames(
                  businessAccount.modelRightList,
                  businessAccount.modelRightEvery,
                )}
              >
                <div className='font-weight600 m-b-16'>{data.modelName}</div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: '#999EA4' }}>
                    {I18N.carbonFootprint3.functionalUnits}
                  </span>
                  <span className='m-l-8'>{data.accountName}</span>
                </div>
                <div style={{ fontSize: 12, marginTop: 8 }}>
                  <span style={{ color: '#999EA4' }}>
                    {I18N.carbonFootprint.systemBoundary}
                  </span>
                  <span className='m-l-8'>
                    {data.scope === 0
                      ? I18N.carbonFootprint3.fullLifecycle
                      : I18N.carbonFootprint3.halfLifeCycle}
                  </span>
                </div>
                <div className='m-t-16' style={{ color: '#999EA4' }}>
                  {data.description}
                </div>
                <div
                  onClick={() => {}}
                  className={businessAccount.modelRightEveryActive}
                >
                  {I18N.carbonFootprint3.apply}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBusinessAccountingSelectModel;
