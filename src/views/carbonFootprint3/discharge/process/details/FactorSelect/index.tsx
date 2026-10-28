/* eslint-disable no-restricted-syntax */
/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-11 15:45:13
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-16 17:12:14
 */
import { useLocation, useHistory, useParams } from 'react-router-dom';
import SearchFactor from '@src/components/SearchFactor';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Factor } from '../../type';
import {
  URL_PARAMS_KEY,
  PROCESS_LIB_PAGE,
  DYNAMICS_ROUTE_ID,
} from '../../constant';
import { getUnitValueByLabel } from '../../utils';

const {
  PROCESS_LIB_ID,
  PROCESS_LIB_NAME,
  FORM_VALUES,
  FROM_PAGE,
  IS_EDIT,
  IS_CANCEL,
} = URL_PARAMS_KEY;

export default () => {
  const location = useLocation();

  const history = useHistory();

  const paramsQuery = new URLSearchParams(location.search);

  const processLibName = paramsQuery.get(PROCESS_LIB_NAME);

  const processLibId = Number(paramsQuery.get(PROCESS_LIB_ID));

  const urlFormValuesString = paramsQuery.get(FORM_VALUES);

  const fromPage = paramsQuery.get(FROM_PAGE);

  const { id } = useParams<{ id?: string }>();

  const getPageRoute = (_fromPage: string | null) => {
    switch (_fromPage) {
      case PROCESS_LIB_PAGE.PRODUCT:
        return id
          ? RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProductEdit.replace(
              DYNAMICS_ROUTE_ID,
              String(id),
            )
          : RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProductAdd;
      case PROCESS_LIB_PAGE.IN:
        return id
          ? RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryInEdit.replace(
              DYNAMICS_ROUTE_ID,
              String(id),
            )
          : RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryInAdd;
      case PROCESS_LIB_PAGE.OUT:
        return id
          ? RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutEdit.replace(
              DYNAMICS_ROUTE_ID,
              String(id),
            )
          : RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutAdd;
      default:
        return '';
    }
  };

  const submit = async (factor: Factor) => {
    const formValuesString = urlFormValuesString || '{}';

    const [numeratorUnit, denominatorUnit] = (factor.unit || '').split('/');

    const [parentDenominatorUnitValue, denominatorUnitValue] =
      await getUnitValueByLabel(denominatorUnit);

    let formValues: Record<string, any> = {};

    try {
      formValues = JSON.parse(formValuesString);
    } catch {}

    formValues.factorObj = {
      ...(formValues.factorObj || {}),
      id: factor.id,
      name: factor.name,
      factor: factor.factor,
      numeratorUnit,
      denominatorUnit: [parentDenominatorUnitValue, denominatorUnitValue],
      institution: factor.institution,
      year: factor.year,
    };

    if (fromPage) {
      history.push(
        `${getPageRoute(fromPage)}?${PROCESS_LIB_ID}=${processLibId}` +
          `&${IS_EDIT}=${true}` +
          `&${FORM_VALUES}=${JSON.stringify(formValues)}` +
          `&${PROCESS_LIB_NAME}=${processLibName}`,
      );
    }
  };

  const cancel = async () => {
    if (fromPage) {
      history.push(
        `${getPageRoute(fromPage)}?${PROCESS_LIB_ID}=${processLibId}` +
          `&${IS_EDIT}=${true}` +
          `&${IS_CANCEL}=${true}` +
          `&${FORM_VALUES}=${urlFormValuesString}` +
          `&${PROCESS_LIB_NAME}=${processLibName}`,
      );
    }
  };

  return <SearchFactor subClick={submit} onCancel={cancel} />;
};
