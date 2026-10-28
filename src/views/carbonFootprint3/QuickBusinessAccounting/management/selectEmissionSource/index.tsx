/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-17 16:48:10
 * @Date: 2023-02-03 10:06:14
 * @@description: 选择排放源
 */
import I18N from '@src/lang/I18N';
import EmissionSourceTable from '@src/views/carbonFootprint3/component/EmissionSourceTable';
import { useHistory, useParams } from 'react-router-dom';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { URL_QUICK_MODEL_KEY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { EmissionSourceSetType } from '@src/views/carbonFootprint3/component/EmissionSourceTable/type';
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
      onConfirm={async (emissionSource: EmissionSourceSetType) => {
        const { matchWay, matchObject, name, rate, unitCode, typeExtra } =
          emissionSource;
        const factor = matchObject || {};

        // 获取数量单位的code
        const child = cascaderOptions.find(op => op.dictValue === unitCode);
        const parent = cascaderOptions.find(
          op => op.dictValue === child?.sourceType,
        );
        const unitData =
          parent && child ? [parent.dictValue, child.dictValue] : undefined;

        // 如果不是 原料 能源 水耗 运输 就设置为空
        if (
          emissionSource.type &&
          ![1, 2, 3, 4].includes(emissionSource.type)
        ) {
          emissionSource.type = undefined;
        }

        // 选择排放源的类型和快速核算新增排放源的类型不一致，所以要进行特殊处理
        if (emissionSource.type === 3) {
          emissionSource.type = 6;
        }
        // 能耗 - 能源
        if (emissionSource.type === 2) {
          emissionSource.type = 5;
        }

        // 运输
        if (emissionSource.type === 4) {
          emissionSource.type = 7;
          emissionSource.amount = typeExtra.amount;

          // 按里程 - 产品重量
          if (typeExtra.way === 1) {
            typeExtra.distUnitName = I18N.carbonFootprint3.kilometre;
            emissionSource.specificationWay2Numerator = typeExtra.unitName;
            emissionSource.amount2 = `${emissionSource.amount || ''}`;
            emissionSource.selectName = emissionSource.name;
          }

          // 按里程 - 载重比
          if (typeExtra.way === 2) {
            typeExtra.distUnitName = I18N.carbonFootprint3.kilometre;
          }

          emissionSource.typeExtraWay = typeExtra.way;
        }

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
        history.push(
          `${
            RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementAddSource
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
