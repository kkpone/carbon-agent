import I18N from '@src/lang/I18N';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Input, Modal, Pagination, Table, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import addIcon from './assets/add.svg';
import closeIcon from './assets/close.svg';
import compareIcon from './assets/compare.svg';
import gridIcon from './assets/grid.svg';
import listIcon from './assets/list.svg';
import previousIcon from './assets/page-prev.svg';
import nextIcon from './assets/page-next.svg';
import searchIcon from './assets/search.svg';
import emptyImage from './assets/search-empty.svg';
import {
  CompanyAvatar,
  CompanyTags,
  FollowCompanyCard,
  stockCodes,
  stockTypes,
} from './FollowCompany';
import followStyle from './FollowPage.module.less';
import {
  CompanySummary,
  ErrorState,
  FollowButton,
  Loading,
  securitiesText,
} from './components';
import { isComparisonCountAllowed } from './data';
import { fetchCandidates } from './service';
import { useEnterpriseData } from './state';
import type { Company, EnterpriseFollow } from './types';
import style from './index.module.less';

const Icon = ({ src }: { src: string }) => (
  <img className={followStyle.icon} src={src} alt='' />
);
const pageItem: NonNullable<ComponentProps<typeof Pagination>['itemRender']> = (
  _,
  type,
  original,
) => {
  if (type === 'prev' || type === 'next')
    return (
      <img
        className={type === 'prev' ? followStyle.previous : followStyle.next}
        src={type === 'prev' ? previousIcon : nextIcon}
        alt=''
      />
    );
  return original;
};
const EmptyCompanies = ({ searching = false }: { searching?: boolean }) => (
  <div className={followStyle.empty}>
    <img src={emptyImage} alt='' />
    <p>
      {searching
        ? I18N.enterpriseData.noResults
        : I18N.enterpriseData.findCompanies}
    </p>
    <small>{I18N.enterpriseData.searchHint}</small>
  </div>
);

export const AddEnterprise = ({ onClose }: { onClose: () => void }) => {
  const state = useEnterpriseData();
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(input.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [input]);
  const query = useQuery({
    queryKey: ['enterpriseData', state.scope, 'candidates', keyword, page],
    queryFn: ({ signal }) => fetchCandidates(keyword, page, signal),
    enabled: state.enabled && Boolean(keyword) && input.trim() === keyword,
    retry: false,
  });
  const t = I18N.enterpriseData;
  const searching = Boolean(keyword) && input.trim() === keyword;
  return (
    <Modal
      className={followStyle.modal}
      title={t.add}
      open
      centered
      destroyOnClose
      width={1044}
      closeIcon={<Icon src={closeIcon} />}
      onCancel={onClose}
      footer={
        <div className={followStyle.modalFooter}>
          {searching ? (
            <div className={followStyle.footerMeta}>
              <Pagination
                current={page}
                total={query.data?.total || 0}
                pageSize={20}
                showSizeChanger={false}
                hideOnSinglePage
                onChange={setPage}
                itemRender={pageItem}
              />
              <span className={followStyle.count}>
                {t.followCount}
                <strong>
                  {state.follows.data?.length ?? '—'}/
                  {state.entitlement.data?.followLimit ?? '—'}
                </strong>
                {t.companyCountUnit}
              </span>
            </div>
          ) : null}
          <div className={followStyle.footerButtons}>
            <Button onClick={onClose}>{t.cancel}</Button>
            <Button type='primary' onClick={onClose}>
              {t.done}
            </Button>
          </div>
        </div>
      }
    >
      <Input
        autoFocus
        allowClear
        maxLength={200}
        prefix={<Icon src={searchIcon} />}
        placeholder={t.search}
        aria-label={t.search}
        value={input}
        onChange={event => setInput(event.target.value)}
      />
      <div className={followStyle.modalResults}>
        {!searching ? (
          <EmptyCompanies />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.isLoading ? (
          <Loading />
        ) : query.data?.records.length ? (
          <div className={followStyle.candidateGrid}>
            {query.data.records.map(company => {
              const subtitle =
                [
                  stockCodes(company) === '—' ? '' : stockCodes(company),
                  company.industryCategory,
                  company.registeredRegion,
                ]
                  .filter(Boolean)
                  .join(' · ') ||
                company.unifiedSocialCreditCode ||
                '—';
              return (
                <div key={company.companyId} className={followStyle.candidate}>
                  <CompanyAvatar company={company} small />
                  <button
                    className={followStyle.candidateText}
                    type='button'
                    onClick={() => state.onOpen(company.companyId)}
                    title={`${company.name} · ${subtitle}`}
                  >
                    <strong>{company.name}</strong>
                    <span>{subtitle}</span>
                  </button>
                  <FollowButton
                    companyId={company.companyId}
                    appearance='add'
                    className={followStyle.followAction}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyCompanies searching />
        )}
      </div>
    </Modal>
  );
};

export const FollowPage = ({ onCompare }: { onCompare: () => void }) => {
  const state = useEnterpriseData();
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);
  const t = I18N.enterpriseData;
  const keyword = state.filter.trim().toLowerCase();
  const filtered = (state.follows.data || []).filter(
    ({ company }) =>
      !keyword ||
      (company &&
        [
          company.name,
          company.shortName,
          company.unifiedSocialCreditCode,
          company.industryCategory,
          securitiesText(company),
        ].some(value => value?.toLowerCase().includes(keyword))),
  );
  const selected = state.selectedCompanyIds;
  const canCompare =
    state.entitlement.isSuccess &&
    !state.entitlement.isError &&
    state.entitlement.data.compareLimit >= 2 &&
    state.follows.isSuccess &&
    !state.follows.isError;
  const limit = state.entitlement.data?.compareLimit ?? 0;
  const toggle = (id: string) =>
    state.setSelectedCompanyIds(current =>
      current.includes(id)
        ? current.filter(value => value !== id)
        : canCompare && current.length < limit
        ? [...current, id]
        : current,
    );
  useEffect(() => {
    setPage(1);
  }, [keyword]);
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 9)),
  );
  return (
    <div className={followStyle.page}>
      <header className={followStyle.header}>
        <h1>{t.title}</h1>
        <div className={followStyle.headerActions}>
          <Button icon={<Icon src={addIcon} />} onClick={() => setAdding(true)}>
            {t.add}
          </Button>
          <Tooltip title={!canCompare ? t.compareUnavailable : undefined}>
            <Button
              type='primary'
              icon={<Icon src={compareIcon} />}
              disabled={!canCompare}
              onClick={onCompare}
            >
              {t.compare}
            </Button>
          </Tooltip>
        </div>
      </header>
      <div className={followStyle.body}>
        {state.entitlement.isError || state.follows.isError ? (
          <div className={followStyle.notices}>
            <ErrorState
              error={t.limitsFailed}
              onRetry={() => state.refresh()}
            />
          </div>
        ) : null}
        <div className={followStyle.toolbar}>
          <Input
            className={followStyle.search}
            allowClear
            prefix={<Icon src={searchIcon} />}
            placeholder={t.followSearch}
            aria-label={t.followSearch}
            value={state.filter}
            onChange={event => state.setFilter(event.target.value)}
          />
          <div className={followStyle.toolbarRight}>
            {selected.length > 0 ? (
              <span className={followStyle.count}>
                {t.selected}
                <strong>
                  {selected.length}/{limit}
                </strong>
                {t.companyCountUnit}
              </span>
            ) : null}
            <div
              className={followStyle.viewSwitch}
              role='group'
              aria-label={t.viewMode}
            >
              {[
                { value: 'cards', label: t.cards, icon: gridIcon },
                { value: 'list', label: t.list, icon: listIcon },
              ].map(item => (
                <Tooltip key={item.value} title={item.label}>
                  <button
                    type='button'
                    aria-label={item.label}
                    aria-pressed={state.view === item.value}
                    onClick={() => state.setView(item.value)}
                  >
                    <Icon src={item.icon} />
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
        {state.follows.isLoading ? (
          <Loading />
        ) : state.follows.isError ? null : !filtered.length ? (
          <EmptyCompanies searching={Boolean(keyword)} />
        ) : state.view === 'cards' ? (
          <div className={followStyle.grid}>
            {filtered.map(follow =>
              follow.company ? (
                <FollowCompanyCard
                  key={follow.enterpriseId}
                  company={follow.company}
                  selected={selected.includes(follow.enterpriseId)}
                  disabled={
                    !canCompare ||
                    (!selected.includes(follow.enterpriseId) &&
                      selected.length >= limit)
                  }
                  onSelect={() => toggle(follow.enterpriseId)}
                  onOpen={() => state.onOpen(follow.enterpriseId)}
                />
              ) : (
                <article
                  className={followStyle.companyCard}
                  key={follow.enterpriseId}
                >
                  <Alert type='warning' message={t.invalidFollow} />
                  <FollowButton companyId={follow.enterpriseId} menu />
                </article>
              ),
            )}
          </div>
        ) : (
          <>
            <Table<EnterpriseFollow>
              className={followStyle.table}
              tableLayout='fixed'
              rowKey='enterpriseId'
              dataSource={filtered.slice(
                (currentPage - 1) * 9,
                currentPage * 9,
              )}
              pagination={false}
              scroll={{ x: 1196 }}
              rowSelection={{
                selectedRowKeys: selected,
                hideSelectAll: true,
                columnWidth: 56,
                onSelect: follow => toggle(follow.enterpriseId),
                getCheckboxProps: follow => ({
                  disabled:
                    !follow.company ||
                    !canCompare ||
                    (!selected.includes(follow.enterpriseId) &&
                      selected.length >= limit),
                  'aria-label': `${t.addToCompare} ${
                    follow.company?.name || follow.enterpriseId
                  }`,
                }),
              }}
              columns={[
                {
                  title: t.company,
                  key: 'company',
                  width: 180,
                  render: (_, follow) =>
                    follow.company ? (
                      <button
                        className={followStyle.tableCompany}
                        type='button'
                        title={follow.company.name}
                        onClick={() => state.onOpen(follow.enterpriseId)}
                      >
                        <CompanyAvatar company={follow.company} small />
                        <span>
                          {follow.company.shortName || follow.company.name}
                        </span>
                      </button>
                    ) : (
                      t.invalidFollow
                    ),
                },
                {
                  title: t.labels,
                  key: 'labels',
                  width: 200,
                  render: (_, follow) =>
                    follow.company ? (
                      <CompanyTags company={follow.company} compact />
                    ) : (
                      '—'
                    ),
                },
                {
                  title: t.creditCode,
                  key: 'credit',
                  width: 190,
                  render: (_, follow) =>
                    follow.company?.unifiedSocialCreditCode || '—',
                },
                {
                  title: t.industry,
                  key: 'industry',
                  width: 130,
                  render: (_, follow) =>
                    follow.company?.industryCategory || '—',
                },
                {
                  title: t.stockType,
                  key: 'stockType',
                  width: 100,
                  render: (_, follow) =>
                    follow.company ? stockTypes(follow.company) : '—',
                },
                {
                  title: t.stockCode,
                  key: 'stockCode',
                  width: 160,
                  render: (_, follow) =>
                    follow.company ? stockCodes(follow.company) : '—',
                },
                {
                  title: t.actions,
                  key: 'actions',
                  width: 180,
                  render: (_, follow) => (
                    <div className={followStyle.tableActions}>
                      <Button
                        type='link'
                        disabled={!follow.company}
                        onClick={() => state.onOpen(follow.enterpriseId)}
                      >
                        {t.viewShort}
                      </Button>
                      <FollowButton
                        companyId={follow.enterpriseId}
                        appearance='link'
                      />
                    </div>
                  ),
                },
              ]}
            />
            <Pagination
              className={followStyle.pagination}
              current={currentPage}
              pageSize={9}
              total={filtered.length}
              hideOnSinglePage
              showSizeChanger={false}
              itemRender={pageItem}
              onChange={setPage}
            />
          </>
        )}
      </div>
      {adding ? <AddEnterprise onClose={() => setAdding(false)} /> : null}
    </div>
  );
};

export const CompanySelection = ({
  onStart,
  busy,
}: {
  onStart: (companies: Company[]) => void;
  busy: boolean;
}) => {
  const state = useEnterpriseData();
  const limit = state.entitlement.data?.compareLimit ?? 0;
  const selected = state.selectedCompanyIds;
  const setSelected = state.setSelectedCompanyIds;
  const companies = (state.follows.data || []).flatMap(item =>
    item.company ? [item.company] : [],
  );
  const validSelected = selected.filter(id =>
    companies.some(company => company.companyId === id),
  );
  const t = I18N.enterpriseData;
  useEffect(() => {
    if (state.follows.isSuccess) {
      setSelected(current =>
        current.filter(id =>
          state.follows.data?.some(item => item.enterpriseId === id),
        ),
      );
    }
  }, [state.follows.data, state.follows.isSuccess]);
  if (state.follows.isError || state.entitlement.isError)
    return (
      <ErrorState error={t.limitsFailed} onRetry={() => state.refresh()} />
    );
  return (
    <section>
      <div className={style.toolbar}>
        <span>
          {t.selected} {validSelected.length} / {limit}
        </span>
        <Button
          type='primary'
          loading={busy}
          disabled={
            busy || !isComparisonCountAllowed(validSelected.length, limit)
          }
          onClick={() =>
            onStart(
              companies.filter(company =>
                validSelected.includes(company.companyId),
              ),
            )
          }
        >
          {t.startCompare}
        </Button>
      </div>
      {limit < 2 ? <Alert type='info' message={t.compareUnavailable} /> : null}
      <Table<Company>
        rowKey='companyId'
        dataSource={companies}
        pagination={false}
        loading={state.follows.isLoading}
        scroll={{ x: 700 }}
        rowSelection={{
          selectedRowKeys: validSelected,
          hideSelectAll: true,
          onChange: keys => setSelected(keys.map(String).slice(0, limit)),
          getCheckboxProps: company => ({
            disabled:
              busy ||
              limit < 2 ||
              (!validSelected.includes(company.companyId) &&
                validSelected.length >= limit),
          }),
        }}
        columns={[
          {
            title: t.company,
            key: 'company',
            render: (_, company) => <CompanySummary company={company} />,
          },
        ]}
      />
    </section>
  );
};
