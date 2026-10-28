/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-09 18:27:07
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-16 17:11:48
 */

import { useLocation, useHistory, useParams } from 'react-router-dom';
import ProcessLibProductSelect from '@src/views/carbonFootprint3/component/ProcessLibProductSelect';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { ProcessProduct } from '@src/views/carbonFootprint3/component/ProcessLibProductSelect/type';
import { getCheckProcessProduct } from '../../service';
import {
  URL_PARAMS_KEY,
  PROCESS_LIB_PAGE,
  DYNAMICS_ROUTE_ID,
} from '../../constant';

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

  /**
   * 过程库产品，输入，输出的id
   * 新增过程库产品，输入，输出时没有此id
   */
  const { id } = useParams<{ id?: string }>();

  const getPageRoute = (_fromPage: string) => {
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

  const onSubmit = async (product: ProcessProduct) => {
    try {
      await getCheckProcessProduct({
        oldProcessId: processLibId,
        id: product.id,
      });
      const formValuesString = urlFormValuesString || '{}';

      let formValues: Record<string, any> = {};

      try {
        formValues = JSON.parse(formValuesString);
      } catch {}

      formValues.processProduct = {
        ...(formValues.processProduct || {}),
        processName: product.processName,
        productName: product.productName,
        accountYear: product.accountYear,
        unitName: product.unitName,
        unitCode: product.unitCode,
        type: product.type,
        id: product.id,
        processId: product.processId,
      };

      if (fromPage) {
        history.push(
          `${getPageRoute(fromPage)}?${PROCESS_LIB_ID}=${processLibId}` +
            `&${IS_EDIT}=${true}` +
            `&${FORM_VALUES}=${JSON.stringify(formValues)}` +
            `&${PROCESS_LIB_NAME}=${processLibName}`,
        );
      }
    } catch {}
  };

  const onCancel = () => {
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
  return <ProcessLibProductSelect onCancel={onCancel} onConfirm={onSubmit} />;
};
