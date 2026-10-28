/**
 * @file 通知列表
 */
import { allNoticeRead, getMessages, getNotices } from '@src/api/api';
import { JavaPageResponseRowInData, ListNotice } from '@src/api/types';
import {
  SearchTable,
  SearchTableRef,
  SearchTableProps,
} from '@src/components/SearchTable';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { RootState } from '@src/store';
import { getNoticesAndMessagesCount } from '@src/store/notices-and-messages/actions';
import { useUpdate } from 'ahooks';
import { Button, Select } from 'antd';
import { AxiosResponse } from 'axios';
import { debounce } from 'lodash-es';
import { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { PageWrapper } from '@/components/PageWrapper';

import style from './index.module.less';
import {
  BroadcastMessageType,
  broadcastMessageTypeOptionsMap,
  useBroadcastColumns,
  useMessageColumns,
} from '../../utils';
import { PostMessageType } from '../../utils/constant';
import {
  BroadcastDetailType,
  BroadcastTabType,
  NoticeReadAllOnPostMessage,
} from '../../utils/type';
import { BroadcastTab } from '../components/Tabs';

export const broadcastType = 'broadcastType';

const Broadcasts = () => {
  const history = useHistory();
  const broadcastColumns = useBroadcastColumns();
  const messageColumns = useMessageColumns();
  // 0 未读 1 已读
  const [readStatus, setReadStatus] = useState<BroadcastMessageType>(
    BroadcastMessageType.allMessages,
  );

  const searchObj = new URLSearchParams(history.location.search);
  let tabType = BroadcastTabType.notice;
  const broadcast = searchObj.get(broadcastType);
  if (broadcast) {
    tabType = +broadcast as BroadcastTabType;
  }

  const tableRef = useRef<SearchTableRef<any>>();

  useEffect(() => {
    tableRef.current?.reload?.({ tabType, readStatus });
  }, [tabType, readStatus]);
  // 顶部铃铛处点击标记所有已读时，更新table数据
  const receiveMessage = (ev: MessageEvent<NoticeReadAllOnPostMessage>) => {
    const { data } = ev;
    if (data?.type === PostMessageType.NoticeAndMessageReadAll) {
      const { readAllTab } = data;
      if (readAllTab === tabType) {
        tableRef.current?.reload();
      }
    }
  };
  useEffect(() => {
    window.addEventListener('message', receiveMessage);
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, [tabType]);

  const getDateSource = debounce(async ({ setDataSource, setTotal, page }) => {
    const payload = {
      pageNum: page.current,
      pageSize: page.pageSize,
      readStatus:
        readStatus === BroadcastMessageType.allMessages ? '' : `${readStatus}`,
    };
    const dealFn = ({
      data,
    }: AxiosResponse<JavaPageResponseRowInData<ListNotice>, any>) => {
      setDataSource(data?.data?.rows);
      setTotal(data?.data?.total);
    };

    if (tabType === BroadcastTabType.notice) {
      return getNotices(payload).then(dealFn);
    }
    return getMessages(payload).then(dealFn);
  }, 200) as SearchTableProps<ListNotice, any>['tableProps']['getDateSource'];
  const messageAndNotices = useSelector<
    RootState,
    RootState['messageAndNotices']
  >(s => s.messageAndNotices);

  const noticeCount = messageAndNotices.noticeCounts;
  const messageCount = messageAndNotices.messageCounts;

  const { locale } = useContext(LocaleContext);

  const update = useUpdate();

  useEffect(update, [locale, update]);

  return (
    <PageWrapper title={I18N.system.notice}>
      <div className={style.wrapper}>
        <div className={style.fixRight}>
          <Button
            type='link'
            onClick={() => {
              allNoticeRead(tabType + 1).finally(() => {
                tableRef.current?.reload();
                getNoticesAndMessagesCount();
              });
            }}
          >
            {I18N.system.markAllAsCompleted}
          </Button>
          <Select<
            BroadcastMessageType,
            { label: string; value: BroadcastMessageType }
          >
            style={{
              width: '120px',
            }}
            options={broadcastMessageTypeOptionsMap()}
            onChange={k => setReadStatus(k)}
            defaultValue={BroadcastMessageType.allMessages}
          />
        </div>
        <BroadcastTab
          onChange={type => {
            searchObj.set(broadcastType, `${type}`);
            history.replace(
              `${history.location.pathname}?${searchObj.toString()}`,
            );
          }}
          activeTabs={tabType}
          showCount
          message={{
            [BroadcastTabType.notice]: noticeCount,
            [BroadcastTabType.message]: messageCount,
          }}
        />
        <SearchTable<ListNotice, any>
          ref={tableRef}
          key={`${tabType}${readStatus}`}
          tableProps={{
            getDateSource,
            onRow: record => ({
              onClick: () =>
                history.push(
                  virtualLinkTransform(
                    RouteMaps.broadcastDetail,
                    [':id', ':type'],
                    [
                      record.id,
                      tabType === BroadcastTabType.message
                        ? BroadcastDetailType.message
                        : BroadcastDetailType.notice,
                    ],
                  ),
                ),
            }),
            pagination: {},
            rowKey: 'id',
            columns:
              tabType === BroadcastTabType.notice
                ? broadcastColumns
                : messageColumns,
          }}
        />
      </div>
    </PageWrapper>
  );
};

export default Broadcasts;
