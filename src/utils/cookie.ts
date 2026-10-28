import store from '@src/store';
import { isFeishuVerified } from './feishuSession';

export const getToken: () => string = () =>
  isFeishuVerified()
    ? store.getState().companyUserInfo?.access_token || ''
    : '';
