/**
 * @file 通知 消息 列表
 */
import InfiniteScrollTrigger from '@mountainpass/react-infinite-scroll-trigger';
import {
  allNoticeRead,
  getMessagesWithTime,
  getNoticesWithTime,
} from '@src/api/api';
import {
  JavaPagePayload,
  JavaPageResponseRowInData,
  NoticesCenter,
} from '@src/api/types';
import { EmptyLoading } from '@src/components/EmptyLoading';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import {
  getNoticesAndMessagesCount,
  readOneMessage,
} from '@src/store/notices-and-messages/actions';
import { Button, Radio } from 'antd';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { BroadcastTab } from './components/Tabs';
import style from './index.module.less';
import { broadcastType } from './list';
import { PostMessageType } from '../utils/constant';
import { BroadcastDetailType, BroadcastTabType } from '../utils/type';

type BroadcastProps = {
  AllMessage: Record<BroadcastTabType, number>;
};

export const Broadcast = ({ AllMessage }: BroadcastProps) => {
  const defaultPage = {
    pageNum: 1,
    pageSize: 10,
  };
  const defaultActiveTab = BroadcastTabType.notice;
  const history = useHistory();
  const lastTab = useRef<BroadcastTabType>();

  const [message, setMessage] = useState<NoticesCenter[]>([]);
  const page = useRef({ ...defaultPage });

  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const getMessages = async (newPage?: JavaPagePayload) => {
    const usedPage = { ...page.current, ...newPage };
    const setMsg = (
      data: AxiosResponse<JavaPageResponseRowInData<NoticesCenter>, any>,
    ) => {
      const result = data?.data?.data;
      if (result) {
        page.current = usedPage;
      }
      const total = result?.total;
      let messageCount = 0;
      setMessage(s => {
        const newMsg = [...s, ...(result?.rows || [])];
        messageCount = newMsg.length;
        return newMsg;
      });

      /** 总数大于 现有数量时，返回 TRUE，表示还能加载更多数据 */
      return total > messageCount;
    };

    if (activeTab === BroadcastTabType.notice) {
      return getNoticesWithTime(usedPage).then(setMsg);
    }
    return getMessagesWithTime(usedPage).then(setMsg);
  };
  useEffect(() => {
    setMessage([]);
  }, [activeTab]);

  const jumpListPath = useMemo(
    () => `${RouteMaps.broadcast}?${broadcastType}=${activeTab}`,
    [history, activeTab],
  );
  const [isDisabledShowAll, setIsDisabledShowAll] = useState(false);
  useEffect(() => {
    setIsDisabledShowAll(window.location.href.includes(jumpListPath));
  });

  return (
    <div className={style.wrapper}>
      <BroadcastTab
        message={{
          [BroadcastTabType.message]: AllMessage[BroadcastTabType.message],
          [BroadcastTabType.notice]: AllMessage[BroadcastTabType.notice],
        }}
        activeTabs={activeTab}
        onChange={k => setActiveTab(+k)}
        showCount
      />

      <main>
        {!message.length && (
          <div className={style.noData}>
            <IconFont type='icon-icon-zanmoneiyong' className={style.icon} />
            <span className={style.tip}>{I18N.system.noNewsYet}</span>
          </div>
        )}
        {message.map(item => (
          <div
            className={classNames(style.messageCard, {
              [style.readed]: +item.readStatus === 1,
            })}
            onClick={() => {
              history.push(
                virtualLinkTransform(
                  RouteMaps.broadcastDetail,
                  [':id', ':type'],
                  [
                    item.id,
                    activeTab === BroadcastTabType.message
                      ? BroadcastDetailType.message
                      : BroadcastDetailType.notice,
                  ],
                ),
              );
            }}
          >
            <div className={style.title}>{item.title}</div>
            <div className={style.time}>{item.publishTimeStr}</div>
            {+item.readStatus !== 1 && (
              <Button
                size='small'
                className={style.viewed}
                onClick={ev => {
                  ev.stopPropagation();
                  readOneMessage(item.id, activeTab).then(() => {
                    // eslint-disable-next-line no-param-reassign
                    item.readStatus = '1';
                    setMessage(s => [...s]);
                  });
                }}
              >
                {I18N.system.markAsRead}
              </Button>
            )}
          </div>
        ))}

        <InfiniteScrollTrigger
          key={`${activeTab}`}
          loadMore={async () => {
            let { pageNum } = page.current;
            if (lastTab.current === activeTab) {
              pageNum += 1;
            } else {
              lastTab.current = activeTab;
              pageNum = 1;
            }
            return getMessages({ ...page.current, pageNum });
          }}
          renderLoading={() => (
            <EmptyLoading size='small' className={style.loadmore} />
          )}
          renderNoMoreData={() => null}
          inViewConfig={{}}
          reloadDelayMs={1000}
        />
      </main>
      <Radio.Group value='1'>
        <Radio.Button
          value='large'
          onClick={() => {
            allNoticeRead(activeTab + 1).finally(() => {
              setMessage(s => s.map(m => ({ ...m, readStatus: '1' })));
              // 通知消息列表页更新数据
              window.postMessage(
                {
                  type: PostMessageType.NoticeAndMessageReadAll,
                  readAllTab: activeTab,
                },
                window.location.origin,
              );
              getNoticesAndMessagesCount();
            });
          }}
        >
          {I18N.system.allRead}
        </Radio.Button>
        <Radio.Button
          disabled={isDisabledShowAll}
          value='default'
          onClick={() => {
            setIsDisabledShowAll(true);
            history.push(jumpListPath);
          }}
        >
          {I18N.components.viewMore}
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};
