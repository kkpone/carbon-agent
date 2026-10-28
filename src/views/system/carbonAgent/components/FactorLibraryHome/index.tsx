import I18N from '@src/lang/I18N';
import { Button, Empty, Pagination, Spin, Tabs } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';

import FactorLibraryCard from './components/FactorLibraryCard';
import FactorLibraryDetail from './components/FactorLibraryDetail';
import styles from './index.module.less';
import type { FactorLibraryItem, FactorLibraryTab } from './types';
import useFactorLibraryList from './useFactorLibraryList';

interface FactorLibraryHomeProps {
  composer: ReactNode;
}

export default function FactorLibraryHome({
  composer,
}: FactorLibraryHomeProps) {
  const [tab, setTab] = useState<FactorLibraryTab>('popular');
  const [selected, setSelected] = useState<FactorLibraryItem | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const { popular, recent, loading, failed, refresh } = useFactorLibraryList(
    tab,
    pageNum,
  );
  const empty =
    tab === 'popular' ? popular.length === 0 : recent?.list.length === 0;
  const emptyDescription = {
    popular: I18N.ccdb.libraryPopularEmpty,
    recent: I18N.ccdb.libraryRecentEmpty,
  }[tab];

  const panel = (
    <div aria-busy={loading}>
      {loading && (
        <div className={styles.state} role='status'>
          <Spin />
          <span>{I18N.ccdb.libraryLoading}</span>
        </div>
      )}
      {!loading && failed && (
        <div className={styles.state} role='alert'>
          <span>{I18N.ccdb.libraryLoadFailed}</span>
          <Button onClick={refresh}>{I18N.ccdb.retry}</Button>
        </div>
      )}
      {!loading && !failed && empty && (
        <div className={styles.state}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyDescription}
          />
        </div>
      )}
      {!loading && !failed && (
        <div className={styles.grid}>
          {tab === 'popular'
            ? popular.map(item => (
                <FactorLibraryCard
                  key={`${item.factorId}:${item.factorVersion ?? ''}`}
                  item={item}
                  onOpen={setSelected}
                />
              ))
            : recent?.list.map(record => (
                <FactorLibraryCard
                  key={`${record.factorId}:${record.factorVersion ?? ''}`}
                  record={record}
                  onOpen={setSelected}
                />
              ))}
        </div>
      )}
      {!loading &&
        !failed &&
        tab === 'recent' &&
        recent &&
        recent.total > 0 && (
          <Pagination
            className={styles.pagination}
            current={recent.pageNum}
            pageSize={recent.pageSize}
            total={recent.total}
            showSizeChanger={false}
            size='small'
            onChange={setPageNum}
          />
        )}
    </div>
  );

  return (
    <section className={styles.page} aria-label={I18N.ccdb.libraryMenu}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>{I18N.ccdb.libraryTitle}</h1>
          <p>{I18N.ccdb.libraryDescription}</p>
        </header>
        {composer}
        <section
          className={styles.results}
          aria-label={I18N.ccdb.libraryListLabel}
        >
          <Tabs
            activeKey={tab}
            onChange={key => {
              if (key === 'popular' || key === 'recent') {
                setPageNum(1);
                setTab(key);
              }
            }}
            items={[
              {
                key: 'popular',
                label: I18N.ccdb.libraryPopular,
                children: tab === 'popular' ? panel : null,
              },
              {
                key: 'recent',
                label: I18N.ccdb.libraryRecent,
                children: tab === 'recent' ? panel : null,
              },
            ]}
          />
        </section>
      </div>
      {selected && (
        <FactorLibraryDetail
          key={`${selected.factorId}:${selected.factorVersion ?? ''}`}
          item={selected}
          onClose={() => {
            setSelected(null);
            if (tab === 'recent') refresh();
          }}
        />
      )}
    </section>
  );
}
