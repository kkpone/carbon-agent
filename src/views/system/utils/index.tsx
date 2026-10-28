import I18N from '@src/lang/I18N';
import { ListNotice } from '@src/api/types';
import { addEllipsisToColumn } from '@src/utils';
import { ColumnType } from 'antd/es/table';
import classNames from 'classnames';
import style from '../Broadcast/list/index.module.less';

const renderUnreadColumn = (text: string, record: ListNotice) => (
  <div className={style.firstCell}>
    <span
      className={classNames(style.unReadDot, {
        [style.active]: +record.readStatus === 0,
      })}
    />
    {text}
  </div>
);

export const useBroadcastColumns = <T extends ListNotice>(): ColumnType<T>[] =>
  addEllipsisToColumn<T>([
    {
      title: I18N.system.notificationTitle,
      dataIndex: 'title',
      render(text, record) {
        return renderUnreadColumn(text, record);
      },
    },
    {
      title: I18N.system.notificationType2,
      dataIndex: 'type',
    },
    {
      title: I18N.system.publisher2,
      dataIndex: 'publish',
    },
    {
      title: I18N.system.releaseTime2,
      dataIndex: 'publishTime',
    },
  ]);
/** 消息类型 1文本、2链接 */
export const messageType = {
  1: I18N.system.text,
  2: I18N.system.link,
};
/**
 * 消息
 */
export const useMessageColumns = <T extends ListNotice>(): ColumnType<T>[] =>
  addEllipsisToColumn<T>([
    {
      title: I18N.system.messageTitle,
      dataIndex: 'title',
      render(text, record) {
        return renderUnreadColumn(text, record);
      },
    },
    {
      title: I18N.system.messageType2,
      dataIndex: 'type',
      render(t: string) {
        return messageType[t];
      },
    },
    {
      title: I18N.system.notifier,
      dataIndex: 'publish',
    },
    {
      title: I18N.system.notificationTime,
      dataIndex: 'publishTime',
    },
  ]);

export enum BroadcastMessageType {
  'unreadMessages',
  'allMessages',
}

export const broadcastMessageTypeOptionsMap = () => [
  {
    label: I18N.system.unreadMessages,
    value: 0,
  },
  {
    label: I18N.system.allMessages,
    value: 1,
  },
];
