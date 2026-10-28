import { Routes } from '../../router/config';
import { flattenRoute } from '../../router/utils';
import LocalStore from '../../utils/store';
import { IAction } from '../types';

export interface AppState {
  sidebar: {
    opened: boolean;
  };
  routes: Routes[];

  flattenRoutes: Routes[];

  init: boolean;
}

const SIDEBAR_KEY = 'React-ant-Admin-SideBar-Opened';

const opened = LocalStore.getValue<boolean>(SIDEBAR_KEY, true);

const defaultApp: AppState = {
  sidebar: {
    opened: typeof opened === 'boolean' ? opened : true,
  },
  routes: [],
  flattenRoutes: [],
  init: false,
};

const SET_SIDE_BAR_OPENED = 'SET_SIDE_BAR_OPENED';
const SET_SIDE_BAR_ROUTES = 'SET_SIDE_BAR_ROUTES';
const RMOVE_SIDE_BAR_ROUTES = 'RMOVE_SIDE_BAR_ROUTES';

export const updateSideBar = (sidebar: AppState['sidebar']) => ({
  type: SET_SIDE_BAR_OPENED,
  payload: sidebar,
});

export const clearSideBarRoutes = () => ({
  type: RMOVE_SIDE_BAR_ROUTES,
  payload: null,
});

const appReducer = (state = defaultApp, action: IAction<any>): AppState => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { type, payload } = action;

  switch (type) {
    case SET_SIDE_BAR_OPENED:
      LocalStore.setValue(SIDEBAR_KEY, true);

      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sidebar: payload,
      };

    case SET_SIDE_BAR_ROUTES:
      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        routes: payload,
        flattenRoutes: flattenRoute(payload, true, false),
        init: true,
      };
    case RMOVE_SIDE_BAR_ROUTES:
      return {
        ...state,
        routes: [],
        flattenRoutes: [],
        init: false,
      };

    default:
      return {
        ...state,
      };
  }
};

export default appReducer;
