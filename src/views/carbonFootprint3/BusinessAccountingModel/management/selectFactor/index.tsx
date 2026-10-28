/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-14 10:49:11
 * @Date: 2023-01-10 11:28:19
 * @@description: 核算模型 - 选择因子
 */

import SearchFactor from '@src/components/SearchFactor';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { useHistory, useParams } from 'react-router-dom';

import { URL_QUICK_MODEL_KEY } from '../../constant';

const CarbonFootprint3SelectFactor = () => {
  const { id, stage } = useParams<{ id: string; stage: string }>();

  const history = useHistory();

  const { pathname } = history.location;

  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');

  const paramsQuery = new URLSearchParams(location.search);

  const urlFormValuesString = paramsQuery.get(URL_QUICK_MODEL_KEY.FORM_VALUES);

  const urlMenuActive = paramsQuery.get(URL_QUICK_MODEL_KEY.MENU_ACTIVE);

  const detailId = paramsQuery.get(URL_QUICK_MODEL_KEY.DETAIL_ID);

  const BaseUrl = isEdit
    ? RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementEditSource
    : RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementAddSource;

  const getSearchParams = (factorObj?: SerachCarbonFactorResult) => {
    const formValuesString = urlFormValuesString || '{}';

    let formValues: Record<string, any> = {};

    formValues = JSON.parse(formValuesString);

    if (factorObj) {
      formValues.factorObj = factorObj;
    }

    return `?${URL_QUICK_MODEL_KEY.FORM_VALUES}=${JSON.stringify(formValues)}`;
  };
  const sub = (data: SerachCarbonFactorResult) => {
    history.push(
      `${BaseUrl}/${id}/${stage}${getSearchParams(data)}&${
        URL_QUICK_MODEL_KEY.MENU_ACTIVE
      }=${urlMenuActive}&${URL_QUICK_MODEL_KEY.DETAIL_ID}=${detailId}`,
    );
  };

  const cancel = async () => {
    // 增加编辑状态下第一次不自动调用单位换算比例开关
    localStorage.setItem('RateAutoStatus', 'false');

    history.push(
      `${BaseUrl}/${id}/${stage}${getSearchParams()}&${
        URL_QUICK_MODEL_KEY.MENU_ACTIVE
      }=${urlMenuActive}&${URL_QUICK_MODEL_KEY.DETAIL_ID}=${detailId}`,
    );
  };
  return (
    <div className='m-b-60'>
      <SearchFactor onCancel={cancel} subClick={sub} />
    </div>
  );
};

export default CarbonFootprint3SelectFactor;
