import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import defaultProductImage from '@src/assets/svg/accountProductImg.svg';
import { message as antdMessage } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { AGENT_ACCOUNT_SEARCH_MAX_LENGTH } from '../constants';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import MobileAccountingCards from './MobileAccountingCards';
import {
  createAgentSession,
  fetchAgentAccountList,
  fetchLatestAgentSessionByBusiness,
} from '../service';
import type { AgentAccountItem, AgentConversation } from '../service';

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGE_COUNT = 5;
const ACCOUNT_AGENT_BINDING = {
  bizType: 'account',
  module: 'footprint3',
};

const formatAccountTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const matched = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/);

  if (!matched) {
    return value.replace(/-/g, '/');
  }

  return `${matched[1]}/${Number(matched[2])}/${Number(matched[3])}${
    matched[4]
  }`;
};

const formatEmission = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  return numberValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 6,
  });
};

const getStatusTone = (status?: string | null) => {
  const normalizedStatus = (status || '').trim().toLowerCase();

  if (!normalizedStatus || normalizedStatus === 'not_submitted') {
    return 'muted';
  }

  if (
    /completed|success|approved|certified|passed|finish|done/.test(
      normalizedStatus,
    )
  ) {
    return 'success';
  }

  if (
    /pending|reviewing|submitted|applying|processing|waiting|audit|progress/.test(
      normalizedStatus,
    )
  ) {
    return 'pending';
  }

  if (/fail|reject|cancel|retract|error|invalid/.test(normalizedStatus)) {
    return 'danger';
  }

  return 'muted';
};

const getStatusBadgeClassName = (status?: string | null) => {
  const statusTone = getStatusTone(status);

  if (statusTone === 'success') {
    return style.accountingStatusBadgeSuccess;
  }

  if (statusTone === 'pending') {
    return style.accountingStatusBadgePending;
  }

  if (statusTone === 'danger') {
    return style.accountingStatusBadgeDanger;
  }

  return style.accountingStatusBadgeMuted;
};

const getStatusText = (statusName?: string | null) => statusName?.trim() || '-';

const getVisiblePages = (page: number, totalPages: number) => {
  const pageCount = Math.min(totalPages, MAX_VISIBLE_PAGE_COUNT);
  const half = Math.floor(pageCount / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - pageCount + 1));

  return Array.from({ length: pageCount }, (_, index) => start + index);
};

const getAccountTitle = (account: AgentAccountItem) =>
  account.productName ||
  account.accountName ||
  I18N.template(I18N.carbonAgent.accountWithId, { val1: account.id });

const getAccountCode = (account: AgentAccountItem) =>
  String(account.id) || account.accountName || '-';

type AccountPreviewTarget = {
  accountId: string;
  certificationStatus?: string | null;
  certificationStatusName?: string | null;
  expertReviewId?: number | string | null;
  expertReviewNo?: string | null;
  expertReviewStatus?: string | null;
  expertReviewStatusName?: string | null;
  productId?: string;
  type: 'account';
};

const getAccountBusinessBinding = (account: AgentAccountItem) => ({
  ...ACCOUNT_AGENT_BINDING,
  bizId: account.id,
});

const getAccountProductId = (account: AgentAccountItem) =>
  account.productId === undefined || account.productId === null
    ? undefined
    : String(account.productId);

type FootprintAccountingHomeProps = {
  isMobile?: boolean;
  onOpenAccountPreview?: (target: AccountPreviewTarget) => void;
  onOpenConversation: (conversation: AgentConversation) => void;
};

const mergeAccountRows = (
  currentRows: AgentAccountItem[],
  nextRows: AgentAccountItem[],
) => {
  const rowMap = new Map<number, AgentAccountItem>();

  currentRows.forEach(row => rowMap.set(row.id, row));
  nextRows.forEach(row => rowMap.set(row.id, row));

  return Array.from(rowMap.values());
};

const FootprintAccountingHome = ({
  isMobile = false,
  onOpenAccountPreview,
  onOpenConversation,
}: FootprintAccountingHomeProps) => {
  const [accountName, setAccountName] = useState('');
  const [committedAccountName, setCommittedAccountName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [rows, setRows] = useState<AgentAccountItem[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const [total, setTotal] = useState(0);
  const [viewingAccountId, setViewingAccountId] = useState('');
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visiblePages = useMemo(
    () => getVisiblePages(pageNum, totalPages),
    [pageNum, totalPages],
  );

  useEffect(() => {
    setPageNum(1);
  }, [committedAccountName]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);
    setError('');

    fetchAgentAccountList(
      {
        accountName: committedAccountName || undefined,
        pageNum,
        pageSize: PAGE_SIZE,
      },
      abortController.signal,
    )
      .then(response => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        const responseData = response.data.data;
        const nextRows = responseData?.rows || [];

        setRows(prevRows =>
          isMobile && pageNum > 1
            ? mergeAccountRows(prevRows, nextRows)
            : nextRows,
        );
        setTotal(Number(responseData?.total || 0));
      })
      .catch(() => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        setRows([]);
        setTotal(0);
        setError(I18N.carbonAgent.productDataLoadFailed);
      })
      .finally(() => {
        if (!cancelled && !abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [committedAccountName, isMobile, pageNum, retryKey]);

  const commitAccountSearch = () => {
    setCommittedAccountName(accountName.trim());
    setPageNum(1);
  };

  const handleViewAccount = async (account: AgentAccountItem) => {
    if (loading || viewingAccountId) {
      return;
    }

    const accountId = String(account.id);
    const accountPreviewTarget: AccountPreviewTarget = {
      accountId,
      certificationStatus: account.certificationStatus,
      certificationStatusName: account.certificationStatusName,
      expertReviewId: account.expertReviewId,
      expertReviewNo: account.expertReviewNo,
      expertReviewStatus: account.expertReviewStatus,
      expertReviewStatusName: account.expertReviewStatusName,
      productId: getAccountProductId(account),
      type: 'account',
    };

    if (isMobile && onOpenAccountPreview) {
      onOpenAccountPreview(accountPreviewTarget);
      return;
    }

    const businessBinding = getAccountBusinessBinding(account);

    setViewingAccountId(accountId);

    try {
      const latestSession = await fetchLatestAgentSessionByBusiness(
        businessBinding,
      );
      const session =
        latestSession ||
        (await createAgentSession({
          bizRef: businessBinding,
          quickSkill: 'data_analysis',
        }));
      const sessionId = session.sessionId || session.id;

      if (!sessionId) {
        throw new Error('Missing sessionId');
      }

      onOpenConversation(session);
    } catch {
      antdMessage.error(I18N.carbonAgent.openConversationFailed);
    } finally {
      setViewingAccountId('');
    }
  };

  const goToPage = (nextPage: number) => {
    if (loading || viewingAccountId) {
      return;
    }

    setPageNum(Math.max(1, Math.min(nextPage, totalPages)));
  };
  const hasMore = pageNum < totalPages && rows.length < total;

  return (
    <div className={style.accountingManagementPage}>
      <div className={style.accountingManagementHeader}>
        <h1>{I18N.carbonAgent.accountingManagement}</h1>
        <form
          className={style.accountingSearch}
          onSubmit={event => {
            event.preventDefault();
            commitAccountSearch();
          }}
        >
          <SearchOutlined className={style.accountingSearchIcon} />
          <input
            aria-label={I18N.carbonAgent.searchProduct}
            maxLength={AGENT_ACCOUNT_SEARCH_MAX_LENGTH}
            placeholder={I18N.carbonAgent.searchPlaceholder}
            value={accountName}
            disabled={loading || Boolean(viewingAccountId)}
            onChange={event =>
              setAccountName(
                event.target.value.slice(0, AGENT_ACCOUNT_SEARCH_MAX_LENGTH),
              )
            }
            onBlur={commitAccountSearch}
          />
        </form>
      </div>

      {isMobile ? (
        <MobileAccountingCards
          error={error}
          hasMore={hasMore}
          loading={loading}
          rows={rows}
          total={total}
          viewingAccountId={viewingAccountId}
          onLoadMore={() => goToPage(pageNum + 1)}
          onRetry={() => setRetryKey(prevKey => prevKey + 1)}
          onViewAccount={handleViewAccount}
        />
      ) : (
        <div className={style.accountingTableArea}>
          <div className={style.accountingTableScroll}>
            <table className={style.accountingTable}>
              <colgroup>
                <col className={style.accountingNameColumn} />
                <col />
                <col />
                <col />
                <col className={style.accountingStatusColumn} />
                <col className={style.accountingStatusColumn} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.name}</th>
                  <th>{I18N.carbonAgent.accountingId}</th>
                  <th>{I18N.carbonAgent.accountingLifeCycle}</th>
                  <th>{I18N.carbonAgent.emissionAmount}</th>
                  <th>{I18N.carbonAgent.expertReview}</th>
                  <th>{I18N.carbonAgent.thirdPartyCertification}</th>
                  <th>{I18N.carbonAgent.operation}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className={style.accountingTableStateCell} colSpan={7}>
                      <div className={style.accountingTableState}>
                        {I18N.carbonAgent.loadingProductData}
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading && error ? (
                  <tr>
                    <td className={style.accountingTableStateCell} colSpan={7}>
                      <div className={style.accountingTableState}>
                        <span>{error}</span>
                        <button
                          type='button'
                          onClick={() => setRetryKey(prevKey => prevKey + 1)}
                        >
                          {I18N.carbonAgent.reload}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading && !error && !rows.length ? (
                  <tr>
                    <td className={style.accountingTableStateCell} colSpan={7}>
                      <div className={style.accountingTableState}>
                        {I18N.carbonAgent.noProductData}
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading && !error
                  ? rows.map(account => {
                      const accountViewing =
                        viewingAccountId === String(account.id);

                      return (
                        <tr key={account.id}>
                          <td>
                            <div className={style.accountingProductCell}>
                              <img
                                src={account.productPic || defaultProductImage}
                                alt=''
                                onError={event => {
                                  event.currentTarget.src = defaultProductImage;
                                }}
                              />
                              <div className={style.accountingProductInfo}>
                                <strong title={getAccountTitle(account)}>
                                  {getAccountTitle(account)}
                                </strong>
                                <span>
                                  {formatAccountTime(
                                    account.updateTime || account.createTime,
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td title={getAccountCode(account)}>
                            {getAccountCode(account)}
                          </td>
                          <td title={account.scopeName || '-'}>
                            {account.scopeName || '-'}
                          </td>
                          <td
                            title={`${formatEmission(account.emissionTotal)} ${
                              account.unit || ''
                            }`}
                          >
                            {formatEmission(account.emissionTotal)}{' '}
                            {account.unit || ''}
                          </td>
                          <td
                            title={getStatusText(
                              account.expertReviewStatusName,
                            )}
                          >
                            <span
                              className={getStatusBadgeClassName(
                                account.expertReviewStatus,
                              )}
                            >
                              {getStatusText(account.expertReviewStatusName)}
                            </span>
                          </td>
                          <td
                            title={getStatusText(
                              account.certificationStatusName,
                            )}
                          >
                            <span
                              className={getStatusBadgeClassName(
                                account.certificationStatus,
                              )}
                            >
                              {getStatusText(account.certificationStatusName)}
                            </span>
                          </td>
                          <td>
                            <button
                              className={style.accountingViewButton}
                              type='button'
                              aria-busy={accountViewing}
                              disabled={loading || Boolean(viewingAccountId)}
                              onClick={() => handleViewAccount(account)}
                            >
                              {accountViewing
                                ? I18N.carbonAgent.opening
                                : I18N.carbonAgent.view}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>

          <div className={style.accountingPagination}>
            <button
              className={style.accountingPageArrow}
              type='button'
              aria-label={I18N.carbonAgent.prevPage}
              disabled={loading || Boolean(viewingAccountId) || pageNum <= 1}
              onClick={() => goToPage(pageNum - 1)}
            >
              <LeftOutlined />
            </button>
            {visiblePages.map(page => (
              <button
                className={
                  page === pageNum
                    ? style.accountingPageCurrent
                    : style.accountingPageButton
                }
                key={page}
                type='button'
                aria-current={page === pageNum ? 'page' : undefined}
                disabled={loading || Boolean(viewingAccountId)}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={style.accountingPageArrow}
              type='button'
              aria-label={I18N.carbonAgent.nextPage}
              disabled={
                loading || Boolean(viewingAccountId) || pageNum >= totalPages
              }
              onClick={() => goToPage(pageNum + 1)}
            >
              <RightOutlined />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FootprintAccountingHome;
