/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-02 10:07:45
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-16 17:08:16
 */
import EmissionSourceTable from '@src/views/carbonFootprint3/component/EmissionSourceTable';
import { useHistory } from 'react-router-dom';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { EMISSION_SOURCE_TYPE } from '@src/views/carbonFootprint3/component/EmissionSourceTable/constant';
import { EmissionSource } from '@src/views/carbonFootprint3/component/EmissionSourceTable/type';
import {
  PROCESS_LIB_IN_TYPE,
  URL_PARAMS_KEY,
  PROCESS_LIB_PAGE,
  CALC_WAY,
} from '../../constant';
import { getUnitValueByLabel } from '../../utils';

const { PROCESS_LIB_NAME, PROCESS_LIB_ID, FROM_PAGE, IS_EDIT, FORM_VALUES } =
  URL_PARAMS_KEY;

export default () => {
  const history = useHistory();

  const paramsQuery = new URLSearchParams(location.search);

  const processLibName = paramsQuery.get(PROCESS_LIB_NAME);

  const processLibId = Number(paramsQuery.get(PROCESS_LIB_ID));

  const fromPage = paramsQuery.get(FROM_PAGE);

  const getPageRoute = (_fromPage: string) => {
    switch (_fromPage) {
      case PROCESS_LIB_PAGE.IN:
        return RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryInAdd;
      case PROCESS_LIB_PAGE.OUT:
        return RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutAdd;
      default:
        return '';
    }
  };

  const emissionSourceInTypeMap = {
    [EMISSION_SOURCE_TYPE.RAW_MATERIAL]: PROCESS_LIB_IN_TYPE.MAIN_MATERIAL,
    [EMISSION_SOURCE_TYPE.ENERGY]: PROCESS_LIB_IN_TYPE.ENERGY_CONSUMPTION,
    [EMISSION_SOURCE_TYPE.WATER_CONSUMPTION]:
      PROCESS_LIB_IN_TYPE.WATER_CONSUMPTION,
    [EMISSION_SOURCE_TYPE.TRANSPORTATION]: PROCESS_LIB_IN_TYPE.TRANSPORTATION,
  };

  return (
    <EmissionSourceTable
      onConfirm={async (emissionSource: EmissionSource) => {
        const { matchWay, matchObject, name, rate, type, typeExtra } =
          emissionSource;
        const factor = matchObject || {};
        const [numeratorUnit, denominatorUnit] = (factor.unit || '').split('/');
        const [parentDenominatorUnitValue, denominatorUnitValue] =
          await getUnitValueByLabel(denominatorUnit);
        const formValues: Record<string, any> = {
          processId: processLibId,
          processLibName,
          matchWay,
          factorObj: {
            id: factor.id,
            name: factor.name,
            factor: factor.factor,
            numeratorUnit,
            denominatorUnit: [parentDenominatorUnitValue, denominatorUnitValue],
            institution: factor.institution,
            year: factor.year,
            rate,
          },
        };

        if (fromPage === PROCESS_LIB_PAGE.IN) {
          if (type === EMISSION_SOURCE_TYPE.TRANSPORTATION) {
            // 选择的排放源类型为运输
            const { way, unitName } = typeExtra || {};
            const typeExtraInfo: Record<string, any> = { name, way };
            // Object.assign(formValues,  {typeExtra: {name, way}});
            if (way === CALC_WAY.PRODUCT_WEIGHT) {
              // 计算方式为产品重量
              typeExtraInfo.weightUnitCode = unitName;
            }

            if (way === CALC_WAY.ENERGY_CONSUMPTION) {
              // 计算方式为按能耗
              const [parentUnitValue, unitValue] = await getUnitValueByLabel(
                unitName,
              );
              typeExtraInfo.unitCode = [parentUnitValue, unitValue];
            }
            Object.assign(formValues, { typeExtra: typeExtraInfo });
          } else {
            Object.assign(formValues, { name });
          }

          if (emissionSourceInTypeMap[emissionSource.type]) {
            formValues.type = emissionSourceInTypeMap[emissionSource.type];
          }
        } else {
          // 新增过程库输出
          Object.assign(formValues, { name });
        }

        if (fromPage) {
          history.push(
            `${getPageRoute(fromPage)}?${PROCESS_LIB_ID}=${processLibId}` +
              `&${IS_EDIT}=${true}` +
              `&${FROM_PAGE}=${PROCESS_LIB_PAGE.EMISSION}` +
              `&${FORM_VALUES}=${JSON.stringify(formValues)}` +
              `&${PROCESS_LIB_NAME}=${processLibName}`,
          );
        }
      }}
      onCancel={async () => history.goBack()}
    />
  );
};
