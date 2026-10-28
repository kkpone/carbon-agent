import { Reducer } from 'redux';
import { BlockProps } from 'antd/lib/typography/Base';
import { IAction } from '../types';

interface NoticeMessageModule {
  count: number;
  title: string;
  list: NoticeMessageItem[];
}

interface NoticeMessageItem {
  title: string;
  message: string;
  route: string;
  time: string;
  read: number;
  extra: {
    text: string;
    level: BlockProps['type'];
  };
}

interface NoticeState {
  notice: NoticeMessageModule;
  message: NoticeMessageModule;
  pending: NoticeMessageModule;
}

const defaultUser: NoticeState = {
  notice: {
    count: 2,
    title: '通知',
    list: [
      {
        title: '版本发布通知',
        message: 'xxx 提交新的版本发布，需要你去处理',
        route: '/',
        time: '2019-10-10 20:30:10',
        read: 0,
        extra: {
          text: '加急',
          level: 'danger',
        },
      },
      {
        title: '版本发布通知',
        message: 'xxx 提交新的版本发布，需要你去处理',
        route: '/',
        time: '2019-10-10 20:30:10',
        read: 0,
        extra: {
          text: '加急',
          level: 'warning',
        },
      },
    ],
  },
  message: {
    count: 2,
    title: '消息',
    list: [
      {
        title: '版本发布通知',
        message: 'xxx 提交新的版本发布，需要你去处理',
        route: '/',
        time: '2019-10-10 20:30:10',
        read: 0,
        extra: {
          text: '加急',
          level: 'danger',
        },
      },
      {
        title: '版本发布通知',
        message: 'xxx 提交新的版本发布，需要你去处理',
        route: '/',
        time: '2019-10-10 20:30:10',
        read: 0,
        extra: {
          text: '加急',
          level: 'warning',
        },
      },
    ],
  },
  pending: {
    count: 2,
    title: '进行中',
    list: [
      {
        title: '版本发布通知',
        message: 'xxx 提交新的版本发布，需要你去处理',
        route: '/',
        time: '2019-10-10 20:30:10',
        read: 0,
        extra: {
          text: '加急',
          level: 'danger',
        },
      },
      {
        title: '版本发布通知',
        message: 'xxx 提交新的版本发布，需要你去处理',
        route: '/',
        time: '2019-10-10 20:30:10',
        read: 0,
        extra: {
          text: '加急',
          level: 'warning',
        },
      },
    ],
  },
};

const CLEAR_NOTICE_BY_KEY = 'CLEAR_NOTICE_BY_KEY';

const READ_NOTICE_BY_KEY_ABD_INDEX = 'READ_NOTICE_BY_KEY_ABD_INDEX';

interface NoticeKeyAndIndexAndCount {
  key: keyof NoticeState;
  index: number;
  count: number;
}

const noticeReducer: Reducer<NoticeState, IAction<any>> = (
  state = defaultUser,
  action: IAction<any>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { type, payload } = action;

  switch (type) {
    case CLEAR_NOTICE_BY_KEY:
      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        [`${payload}`]: {
          ...state[payload as keyof NoticeState],
          count: 0,
          list: [],
        },
      };
    case READ_NOTICE_BY_KEY_ABD_INDEX:
      return {
        ...state,
        [`${(payload as NoticeKeyAndIndexAndCount).key}`]: {
          ...state[(payload as NoticeKeyAndIndexAndCount).key],
          read: 1,
          count: (payload as NoticeKeyAndIndexAndCount).count,
        },
      };
    default:
      return {
        ...state,
      };
  }
};

export default noticeReducer;
