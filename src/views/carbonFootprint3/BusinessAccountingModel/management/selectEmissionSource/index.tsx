/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-08 11:31:23
 * @Date: 2023-02-03 10:06:14
 * @@description: 选择排放源
 */
import EmissionSourceTable from '@src/views/carbonFootprint3/component/EmissionSourceTable';
import { useHistory, useParams } from 'react-router-dom';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { URL_QUICK_MODEL_KEY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { EmissionSource } from '@src/views/carbonFootprint3/component/EmissionSourceTable/type';
import { listALLByDictTypeBatch } from '@src/api/api';
import { Dicts } from '@src/views/emission/Show/type';
import { useEffect, useState } from 'react';

export default () => {
  const { id, stage } = useParams<{ id: string; stage: string }>();
  const history = useHistory();

  const paramsQuery = new URLSearchParams(location.search);

  const urlMenuActive = paramsQuery.get(URL_QUICK_MODEL_KEY.MENU_ACTIVE);

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

  /**
   * @description: 初始化
   */
  const init = async () => {
    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });
    setCascaderOptions(dic.data.data.factorUnitM);
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <EmissionSourceTable
      onConfirm={async (emissionSource: EmissionSource) => {
        const { matchWay, matchObject, name, rate, unitCode } = emissionSource;
        const factor = matchObject || {};

        // 获取数量单位的code
        const child = cascaderOptions.find(op => op.dictValue === unitCode);
        const parent = cascaderOptions.find(
          op => op.dictValue === child?.sourceType,
        );
        const unitData =
          parent && child ? [parent.dictValue, child.dictValue] : undefined;

        const formValues: Record<string, any> = {
          ...emissionSource,
          matchWay,
          unitData,
          factorObj: {
            id: factor.id,
            name: factor.name,
            factor: factor.factor,
            unit: factor.unit,
            institution: factor.institution,
            year: factor.year,
            rate,
          },
        };

        Object.assign(formValues, { name });
        delete formValues.id;
        history.push(
          `${
            RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementAddSource
          }/${id}/${stage}?${
            URL_QUICK_MODEL_KEY.MENU_ACTIVE
          }=${urlMenuActive}&${URL_QUICK_MODEL_KEY.DETAIL_ID}=${
            emissionSource.id
          }&${URL_QUICK_MODEL_KEY.FORM_VALUES}=${JSON.stringify(formValues)}`,
        );
      }}
      onCancel={async () => history.goBack()}
    />
  );
};
