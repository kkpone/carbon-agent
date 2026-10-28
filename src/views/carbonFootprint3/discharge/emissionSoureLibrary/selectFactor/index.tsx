/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-14 15:13:41
 * @Date: 2023-01-10 11:28:19
 * @@description: 排放源库 - 选择因子
 */

import SearchFactor from '@src/components/SearchFactor';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { URL_QUICK_MODEL_KEY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { useHistory, useParams } from 'react-router-dom';

const CarbonFootprint3SelectFactor = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const { pathname } = history.location;

  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');

  const paramsQuery = new URLSearchParams(location.search);

  const urlFormValuesString = paramsQuery.get(URL_QUICK_MODEL_KEY.FORM_VALUES);

  const BaseUrl = isEdit
    ? `${RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryEdit}/${id}`
    : RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryAdd;

  const getSearchParams = (factorObj?: SerachCarbonFactorResult) => {
    const formValuesString = urlFormValuesString || '{}';

    let formValues: Record<string, any> = {};

    formValues = JSON.parse(formValuesString);

    if (factorObj) {
      formValues.factorObj = factorObj;
    }

    /** 对参数特殊符号加密 */
    const enFormValues = encodeURIComponent(JSON.stringify(formValues));

    return `?${URL_QUICK_MODEL_KEY.FORM_VALUES}=${enFormValues}`;
  };
  const sub = (data: SerachCarbonFactorResult) => {
    localStorage.setItem('RateAutoStatus', 'true');

    history.push(`${BaseUrl}${getSearchParams(data)}`);
  };

  const cancel = async () => {
    // 增加编辑状态下第一次不自动调用单位换算比例开关
    localStorage.setItem('RateAutoStatus', 'false');

    history.push(`${BaseUrl}${getSearchParams()}`);
  };

  return (
    <div className='m-b-60'>
      <SearchFactor onCancel={cancel} subClick={sub} />
    </div>
  );
};

export default CarbonFootprint3SelectFactor;
