import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Middleware,
} from 'redux';
import reduxThunk from 'redux-thunk';
// import reduxLogger from 'redux-logger';
import appReducer from './module/app';
import settingsReducer from './module/settings';
import noticeReducer from './module/notice';
import menuReducer from './module/menu';
import products from './module/currentIndex';
import NavReducer from './module/nav';
import { carbonproductReducer } from './national';
import { carbonNationals } from './carbon-national';
import { carbonStep } from './carbon-step';
import { companyUserInfo } from './module/user';
import { globalCacheMsg } from './global-modal';
import { messageAndNotices } from './notices-and-messages';
import { globalCarbonDataEchertOption } from './carbon-data-echert/index';

const reducers = combineReducers({
  app: appReducer,
  settings: settingsReducer,
  notices: noticeReducer,
  menu: menuReducer,
  companyUserInfo,
  products,
  Nav: NavReducer,
  national: carbonproductReducer,
  carbonNationals,
  carbonStep,
  globalCacheMsg,
  messageAndNotices,
  globalCarbonDataEchertOption,
});

export type RootDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
const middleware: Middleware[] = [reduxThunk];

// if (process.env.NODE_ENV === 'development') {
//   middleware.push(reduxLogger);
// }

function createMyStore() {
  /* eslint-disable no-underscore-dangle */
  const store = window.__REDUX_DEVTOOLS_EXTENSION__
    ? createStore(
        reducers,
        compose(
          applyMiddleware(...middleware),
          window.__REDUX_DEVTOOLS_EXTENSION__({}),
        ),
      )
    : createStore(reducers, applyMiddleware(...middleware));

  return store;
}

const store = createMyStore();

export default store;
