/**
 * @file 导航 reducer
 */
import { uniqBy } from 'lodash-es';
import { Reducer } from 'redux';
import { getLoginStorage } from '@src/utils/feishuSession';
import { IAction } from '../types';

export interface NavState {
  id: string;
  name: string;
  isFloat: string;
  web_path: string;
  children?: NavState[];
}

export const USER_KEY = 'nav';

const defaulNav: NavState[] = [];

export const GRT_NAV = 'GRT_NAV';

export const getNav = () => {
  const navRaw = getLoginStorage().getItem(USER_KEY);
  let navs;
  if (!navRaw) return navs;
  try {
    navs = JSON.parse(navRaw);
    // eslint-disable-next-line no-empty
  } catch {}
  return navs;
};

const NavReducer: Reducer<NavState[], IAction<any>> = (
  state = defaulNav,
  action: IAction<any>,
) => {
  const { type, payload } = action;
  switch (type) {
    case GRT_NAV:
      getLoginStorage().setItem(USER_KEY, JSON.stringify(payload));
      return payload;
    default:
      const nav = getLoginStorage().getItem(USER_KEY) || '[]';
      const navs = JSON.parse(nav);
      return uniqBy([...state, ...navs], it => it.id);
  }
};

export default NavReducer;
