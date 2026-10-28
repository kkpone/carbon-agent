/**
 * @file 全局消息系统
 */
import {
  GlobalModalProps,
  specialCode,
} from '@src/api/components/ComfirmModal';
import store from '..';
import {
  CACHE_GLOBAL_MESSAGE,
  CLEAR,
  DROP_SHOWED_MESSAGE,
} from '../actionTypes';

const defaultState: GlobalModalMsg = {
  cacheMsg: [],
};

type GlobalModalMsg = {
  cacheMsg: GlobalModalProps[];
};

type GlobalModalMsgAction =
  | {
      type: typeof CACHE_GLOBAL_MESSAGE;
      payload: GlobalModalProps;
    }
  | {
      type: typeof CLEAR;
    }
  | {
      type: typeof DROP_SHOWED_MESSAGE;
    };

export const globalCacheMsg = (
  state: GlobalModalMsg = defaultState,
  action: GlobalModalMsgAction,
): GlobalModalMsg => {
  switch (action.type) {
    case CACHE_GLOBAL_MESSAGE:
      // eslint-disable-next-line no-case-declarations
      let newMsg = [...state.cacheMsg, action.payload];
      /** 特殊code码，清除历史弹窗信息 */
      if (
        [...specialCode.exitCode, ...specialCode.jump2AccountCode].includes(
          action.payload.code,
        )
      ) {
        newMsg = [action.payload];
      }
      return { ...state, cacheMsg: newMsg };
    case DROP_SHOWED_MESSAGE:
      return { ...state, cacheMsg: state.cacheMsg.slice(1) };
    case CLEAR:
      return { ...defaultState };
    default:
      return { ...state };
  }
};

/** 缓存全局通知 */
export const addCacheMsg = (payload: GlobalModalProps) =>
  store.dispatch<GlobalModalMsgAction>({
    type: CACHE_GLOBAL_MESSAGE,
    payload,
  });

/** 获取缓存的全局通知 */
export const getCacheMsg = () => store.getState().globalCacheMsg.cacheMsg;

/** 删除显示过的消息 */
export const dropShowedMsg = () =>
  store.dispatch<GlobalModalMsgAction>({ type: DROP_SHOWED_MESSAGE });
