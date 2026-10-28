/**
 * @file 全局 消息 通知 系统
 */
import { NoticeRedDot, SaasNotices } from '@src/api/types';
import {
  CLEAR,
  DROP_SHOWED_MODAL_NOTICE,
  DROP_SHOWED_SCROLL_NOTICE,
  UPDATE_MESSAGE_COUNT,
  UPDATE_MODAL_NOTICES,
  UPDATE_SCROLL_NOTICES,
} from '../actionTypes';

const defaultState: GlobalNoticesAndMessage = {
  /** 滚动通知 */
  scrollNotices: [],
  /** 弹窗通知 */
  modalNotices: [],
  unReadCounts: 0,
  messageCounts: 0,
  noticeCounts: 0,
};

type GlobalNoticesAndMessage = {
  /** 滚动通知 */
  scrollNotices: SaasNotices[];
  /** 弹窗通知 */
  modalNotices: SaasNotices[];
  /* 未读消息总数数 */
  // unReadCounts: number;
  // /** 未读消息数 */
  // messageCounts: number;
  // /** 未读通知数 */
  // noticeCounts: number;
} & Omit<NoticeRedDot, 'userId'>;

export type GlobalNoticesAndMessageAction =
  | {
      type:
        | typeof CLEAR
        | typeof DROP_SHOWED_MODAL_NOTICE
        | typeof DROP_SHOWED_SCROLL_NOTICE;
    }
  | {
      type: typeof UPDATE_SCROLL_NOTICES | typeof UPDATE_MODAL_NOTICES;
      payload: SaasNotices[];
    }
  | {
      type: typeof UPDATE_MESSAGE_COUNT;
      payload: NoticeRedDot;
    };

export const messageAndNotices = (
  state: GlobalNoticesAndMessage = defaultState,
  action: GlobalNoticesAndMessageAction,
): GlobalNoticesAndMessage => {
  switch (action.type) {
    case DROP_SHOWED_MODAL_NOTICE:
      return { ...state, modalNotices: state.modalNotices.slice(1) };
    case DROP_SHOWED_SCROLL_NOTICE:
      return { ...state, scrollNotices: state.scrollNotices.slice(1) };
    case UPDATE_MODAL_NOTICES:
      return { ...state, modalNotices: action.payload };
    case UPDATE_SCROLL_NOTICES:
      return { ...state, scrollNotices: action.payload };
    case UPDATE_MESSAGE_COUNT:
      return { ...state, ...action.payload };
    case CLEAR:
      return { ...defaultState };
    default:
      return { ...state };
  }
};
