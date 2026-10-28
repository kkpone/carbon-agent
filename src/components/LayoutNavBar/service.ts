import { request } from '@src/api/request';
import { RootState } from '@src/store';

export const getCompanyProductInfo = () =>
  request<{
    data: Pick<
      RootState['companyUserInfo']['userInfo'],
      'productType' | 'companyProductList' | 'openProductCount' | 'residueDay'
    >;
  }>({
    method: 'get',
    url: '/management/company/getCompanyProducts',
  });

export enum SwitchState {
  show = '1',
  hide = '0',
}

export const getShowLanguageSwitch = () =>
  request<{
    data: {
      multi_switchCompany: SwitchState;
    };
  }>({
    method: 'get',
    url: '/management/system/language/multiSwitchCompany',
  });
