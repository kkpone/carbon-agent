/**
 * @file 指定组织下的用户信息
 */

import { SwitchoverCompanyData, User, UserInfo } from '@src/api/types';
import { getLoginStorage } from '@src/utils/feishuSession';

import {
  CLEAR,
  DROP_COMPANY_ID,
  SET_COMPANY_USER_INFO,
  UPDATE_INFO,
  UPDATE_USER,
} from '../actionTypes';

const defaultState = {
  access_token: '',
  userInfo: {},
  expires_in: 0,
} as SwitchoverCompanyData;

export type CompanyUserInfoAction =
  | { type: 'agent/replaceWorkspaceLogin'; payload: SwitchoverCompanyData }
  | {
      type: typeof SET_COMPANY_USER_INFO;
      payload: SwitchoverCompanyData;
    }
  | {
      type: typeof CLEAR;
    }
  | {
      type: typeof DROP_COMPANY_ID;
    }
  | {
      type: typeof UPDATE_USER;
      payload: User;
    }
  | {
      type: typeof UPDATE_INFO;
      payload: SwitchoverCompanyData['userInfo'];
    };

export const companyUserInfo = (
  state: SwitchoverCompanyData = defaultState,
  action: CompanyUserInfoAction,
): SwitchoverCompanyData => {
  switch (action.type) {
    case 'agent/replaceWorkspaceLogin':
      getLoginStorage().setItem(
        SET_COMPANY_USER_INFO,
        JSON.stringify(action.payload),
      );
      return action.payload;
    case SET_COMPANY_USER_INFO:
      // eslint-disable-next-line no-case-declarations
      const result = { ...state, ...action.payload };
      getLoginStorage().setItem(SET_COMPANY_USER_INFO, JSON.stringify(result));
      return result;
    case UPDATE_INFO:
      const update = {
        ...state,
        userInfo: { ...(state?.userInfo || {}), ...action.payload },
      };
      getLoginStorage().setItem(SET_COMPANY_USER_INFO, JSON.stringify(update));
      return update;
    case UPDATE_USER:
      const updateUser = {
        ...state,
        userInfo: { ...(state?.userInfo || {}), user: action.payload },
      };
      getLoginStorage().setItem(
        SET_COMPANY_USER_INFO,
        JSON.stringify(updateUser),
      );
      return updateUser;
    case DROP_COMPANY_ID:
      const newState = {
        ...state,
        userInfo: { ...(state?.userInfo || {}) },
      };
      newState.userInfo.companyId = undefined;
      getLoginStorage().setItem(
        SET_COMPANY_USER_INFO,
        JSON.stringify(newState),
      );
      return newState;
    case CLEAR:
      getLoginStorage().setItem(SET_COMPANY_USER_INFO, '');
      return {
        access_token: '',
        userInfo: {} as UserInfo,
        expires_in: 0,
      };
    default:
      const storage = getLoginStorage().getItem(SET_COMPANY_USER_INFO) || '{}';
      const parsed = JSON.parse(storage);
      return { ...state, ...parsed };
  }
};
