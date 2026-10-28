import { Reducer } from 'redux';
import { IAction } from '../types';
import LocalStore from '../../utils/store';
import { PageResponseData } from '../../typings';

interface Menu {
  id?: number;

  name: string;

  url: string;

  icon: string;

  desc?: string;

  sort: number;

  parentId: number;

  level: number;

  parent?: Menu;

  children?: Menu[];

  parentIds?: number[];
}

interface MenuState {
  list: Menu[];
  page: PageResponseData;
}
// 默认的菜单数据
const defaultMenu: MenuState = {
  list: [
    {
      id: 1,
      desc: '描述',
      icon: '1图标',
      level: 1,
      name: '1名称',
      parentId: 0,
      parentIds: [],
      sort: 1,
      url: '路径',
    },
    {
      id: 2,
      desc: '2描述',
      icon: '2图标',
      level: 1,
      name: '2名称',
      parentId: 0,
      parentIds: [],
      sort: 1,
      url: '2路径',
    },
  ],
  page: {},
};
// 设置菜单权限
const SET_MENU_ROUTER_LIST_AUTH = 'SET_MENU_ROUTER_LIST_AUTH';
// 获取菜单权限
const GET_MENU_ROUTER_LIST_AUTH = 'GET_MENU_ROUTER_LIST_AUTH';

// 添加菜单权限
const setMenuAuth: (data: Menu) => IAction<Menu> = (data: Menu) => ({
  type: SET_MENU_ROUTER_LIST_AUTH,
  payload: data,
});

// 获取菜单权限
const getMenuAuth: () => IAction<null> = () => ({
  type: GET_MENU_ROUTER_LIST_AUTH,
  payload: null,
});

const menuReducer: Reducer<MenuState, IAction<any>> = (
  state = defaultMenu,
  action: IAction<any>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { type, payload } = action;

  switch (type) {
    case SET_MENU_ROUTER_LIST_AUTH:
      setMenuAuth(payload);
      state.list.push(payload);
      LocalStore.setValue(SET_MENU_ROUTER_LIST_AUTH, state);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...payload,
      };
    case GET_MENU_ROUTER_LIST_AUTH: {
      getMenuAuth();
      const menList: Menu[] | null = LocalStore.getValue(
        GET_MENU_ROUTER_LIST_AUTH,
      );
      return {
        menList: menList || defaultMenu,
      };
    }
    default:
      return state;
  }
};

export default menuReducer;
