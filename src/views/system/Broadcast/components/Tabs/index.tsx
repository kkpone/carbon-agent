/**
 * @file 通知 tab
 */

import {
  BroadcastTabType,
  BroadcastTabTypeTEXTMap,
} from '@src/views/system/utils/type';
import { useUpdate } from 'ahooks';
import { Tabs } from 'antd';
import { useContext, useEffect, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

type BroadcastTabProps = {
  message: Record<BroadcastTabType, number>;
  onChange: (t: BroadcastTabType) => void;
  showCount?: boolean;
  /**
   * 默认选中的key
   */
  defaultValue?: BroadcastTabType;
  activeTabs?: BroadcastTabType;
};

export const BroadcastTab = ({
  onChange,
  message,
  showCount,
  defaultValue,
  activeTabs,
}: BroadcastTabProps) => {
  const [activeTab, setActiveTab] = useState(
    defaultValue || BroadcastTabType.notice,
  );
  const { locale } = useContext(LocaleContext);
  const formatCount = (num: number) => (num > 99 ? '99+' : num);
  const messageCount = message[BroadcastTabType.message];
  const broadcastCount = message[BroadcastTabType.notice];
  const broadcastCountShow =
    showCount && broadcastCount > 0 ? `（${formatCount(broadcastCount)}）` : '';
  const messageCountShow =
    showCount && messageCount > 0 ? `（${formatCount(messageCount)}）` : '';

  const update = useUpdate();

  useEffect(update, [locale, update]);

  const tabDatas = Object.entries(BroadcastTabTypeTEXTMap()).map(([k, v]) => ({
    tab: `${v}${
      Number(k) === BroadcastTabType.notice
        ? broadcastCountShow
        : messageCountShow
    }`,
    key: k.toString(),
  }));
  return (
    <Tabs
      type='line'
      onChange={k => {
        setActiveTab(+k);
        onChange(+k);
      }}
      style={{
        marginBottom: 8,
      }}
      activeKey={`${activeTabs || activeTab}`}
    >
      {tabDatas?.map(t => (
        <Tabs.TabPane {...t} />
      ))}
    </Tabs>
  );
};
