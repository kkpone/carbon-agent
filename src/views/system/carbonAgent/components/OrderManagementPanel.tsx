import { SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import AgentInvoiceDialog from './AgentInvoiceDialog';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import { fetchAgentPointOrdersPage, type AgentPointOrder } from '../service';

type OrderStatusFilter = 'all' | 'closed' | 'paid' | 'pending';
type OrderStatusTone = 'failed' | 'pending' | 'success' | 'unknown';
type PaginationItem = { key: string; type: 'ellipsis' } | number;

type OrderManagementPanelProps = {
  active: boolean;
  mobile?: boolean;
  showTitle?: boolean;
};

const ORDER_PAGE_SIZE = 10;

const getOrderStatusTabs = (): Array<{
  key: OrderStatusFilter;
  label: string;
}> => [
  {
    key: 'all',
    label: I18N.carbonAgent.tabAll,
  },
  {
    key: 'pending',
    label: I18N.carbonAgent.pendingPayment,
  },
  {
    key: 'paid',
    label: I18N.carbonAgent.paid,
  },
  {
    key: 'closed',
    label: I18N.carbonAgent.closed,
  },
];

const MOBILE_ORDER_STATUS_LABELS = createI18nLabelMap<
  OrderStatusFilter,
  string
>({
  all: () => I18N.carbonAgent.tabAll,
  closed: () => I18N.carbonAgent.orderFailed,
  paid: () => I18N.carbonAgent.orderCompleted,
  pending: () => I18N.carbonAgent.pendingPayment,
});

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const getOptionalNumber = (value: unknown) => {
  const parsed = toNumber(value, Number.NaN);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDisplayText = (value: unknown, fallback = '--') => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback;
};

const isOrderPageSuccess = (code?: number) => code === 1 || code === 200;

const normalizeStatusText = (order: AgentPointOrder) =>
  [
    order.status,
    order.statusName,
    order.payStatus,
    order.payParams?.payStatus,
    order.tradeStateDesc,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const getOrderStatusTone = (order: AgentPointOrder): OrderStatusTone => {
  const statusText = normalizeStatusText(order);

  if (
    statusText.includes('fail') ||
    statusText.includes('closed') ||
    statusText.includes('close') ||
    statusText.includes('cancel') ||
    statusText.includes('已失败') ||
    statusText.includes('失败') ||
    statusText.includes('已关闭')
  ) {
    return 'failed';
  }

  if (
    statusText.includes('notpay') ||
    statusText.includes('pending') ||
    statusText.includes('待支付') ||
    statusText.includes('未支付')
  ) {
    return 'pending';
  }

  if (
    Boolean(order.payTime) ||
    statusText.includes('paid') ||
    statusText.includes('success') ||
    statusText.includes('trade_success') ||
    statusText.includes('completed') ||
    statusText.includes('已完成') ||
    statusText.includes('支付成功')
  ) {
    return 'success';
  }

  return 'unknown';
};

const getOrderStatusLabel = (order: AgentPointOrder) => {
  const explicitLabel = toDisplayText(order.statusName, '');

  if (explicitLabel) {
    return explicitLabel;
  }

  const tone = getOrderStatusTone(order);

  if (tone === 'success') {
    return I18N.carbonAgent.orderCompleted;
  }

  if (tone === 'pending') {
    return I18N.carbonAgent.pendingPayment;
  }

  if (tone === 'failed') {
    return I18N.carbonAgent.orderFailed;
  }

  return (
    toDisplayText(order.tradeStateDesc, '') ||
    toDisplayText(order.status, '') ||
    '--'
  );
};

const getOrderContent = (order: AgentPointOrder) =>
  toDisplayText(order.orderContent, '') ||
  toDisplayText(order.planName, '') ||
  toDisplayText(order.planCode, '') ||
  '--';

const getOrderTime = (order: AgentPointOrder) =>
  toDisplayText(order.payTime, '') || toDisplayText(order.createTime, '');

const formatOrderAmount = (order: AgentPointOrder) => {
  const amount =
    getOptionalNumber(order.amount) ??
    getOptionalNumber(order.payParams?.payMoney) ??
    getOptionalNumber(order.payParams?.amount);

  if (amount === undefined) {
    return '--';
  }

  const formattedAmount = amount.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const currency = toDisplayText(
    order.currency || order.payParams?.currency,
    'CNY',
  ).toUpperCase();

  return currency === 'CNY'
    ? `¥${formattedAmount}`
    : `${currency} ${formattedAmount}`;
};

const getOrderRowKey = (
  order: AgentPointOrder,
  index: number,
  pageNum: number,
) =>
  toDisplayText(order.orderNo, '') || String(order.id ?? `${pageNum}-${index}`);

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedItems = [...items]
    .filter(item => item >= 1 && item <= totalPages)
    .sort((prev, next) => prev - next);

  return sortedItems.reduce<PaginationItem[]>((result, item, index) => {
    const previousItem = sortedItems[index - 1];

    if (previousItem && item - previousItem > 1) {
      result.push({
        key: `ellipsis-${previousItem}-${item}`,
        type: 'ellipsis',
      });
    }

    result.push(item);

    return result;
  }, []);
};

const OrderManagementPanel = ({
  active,
  mobile = false,
  showTitle = true,
}: OrderManagementPanelProps) => {
  const [activeStatus, setActiveStatus] = useState<OrderStatusFilter>('all');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState<AgentPointOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / ORDER_PAGE_SIZE));
  const paginationItems = useMemo(
    () => getPaginationItems(pageNum, totalPages),
    [pageNum, totalPages],
  );

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const controller = new AbortController();

    setLoading(true);
    setError('');

    fetchAgentPointOrdersPage(
      {
        keyword,
        pageNum: String(pageNum),
        pageSize: String(ORDER_PAGE_SIZE),
        status: activeStatus,
      },
      controller.signal,
    )
      .then(response => {
        const responseData = response.data;

        if (!isOrderPageSuccess(responseData.code)) {
          throw new Error(responseData.msg || I18N.carbonAgent.orderLoadFailed);
        }

        const pageData = responseData.data;
        const rows = pageData?.rows;
        const nextRows = Array.isArray(rows) ? rows : [];
        const nextTotal = toNumber(pageData?.total);
        const nextPage = toNumber(pageData?.pageNum, pageNum);

        setOrders(nextRows);
        setTotal(nextTotal);

        if (nextPage !== pageNum && nextPage > 0) {
          setPageNum(nextPage);
        }
      })
      .catch(requestError => {
        if (controller.signal.aborted) {
          return;
        }

        setOrders([]);
        setTotal(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : I18N.carbonAgent.orderLoadFailed,
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [active, activeStatus, keyword, pageNum, retryKey]);

  const commitSearch = () => {
    const nextKeyword = keywordInput.trim();

    if (nextKeyword === keyword) {
      return;
    }

    setKeyword(nextKeyword);
    setPageNum(1);
  };

  const handleStatusChange = (status: OrderStatusFilter) => {
    if (status === activeStatus) {
      return;
    }

    setActiveStatus(status);
    setPageNum(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === pageNum) {
      return;
    }

    setPageNum(nextPage);
  };

  if (!active) {
    return null;
  }

  const renderMobileOrders = () => {
    if (loading) {
      return (
        <div className={style.mobileRecordState} role='status'>
          {I18N.carbonAgent.orderLoading}
        </div>
      );
    }

    if (error) {
      return (
        <div className={style.mobileRecordState}>
          <span>{error}</span>
          <button
            type='button'
            onClick={() => setRetryKey(prevKey => prevKey + 1)}
          >
            {I18N.carbonAgent.retry}
          </button>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className={style.mobileRecordState}>
          {I18N.carbonAgent.noOrders}
        </div>
      );
    }

    return orders.map((order, index) => {
      const orderKey = getOrderRowKey(order, index, pageNum);
      const statusTone = getOrderStatusTone(order);

      return (
        <article className={style.mobileRecordCard} key={orderKey}>
          <header className={style.mobileRecordCardHeader}>
            <strong className={style.mobileRecordTitle}>
              {I18N.carbonAgent.orderIdColon}
              {toDisplayText(order.orderNo)}
            </strong>
            <span
              className={classNames(style.orderStatusTag, {
                [style.orderStatusTagFailed]: statusTone === 'failed',
                [style.orderStatusTagPending]: statusTone === 'pending',
                [style.orderStatusTagSuccess]: statusTone === 'success',
              })}
            >
              {getOrderStatusLabel(order)}
            </span>
          </header>
          <dl className={style.mobileRecordMeta}>
            <div>
              <dt>{I18N.carbonAgent.transactionTime}</dt>
              <dd>{getOrderTime(order) || '--'}</dd>
            </div>
            <div>
              <dt>{I18N.carbonAgent.orderContentLabel}</dt>
              <dd>{getOrderContent(order)}</dd>
            </div>
            <div>
              <dt>{I18N.carbonAgent.amount}</dt>
              <dd>{formatOrderAmount(order)}</dd>
            </div>
          </dl>
        </article>
      );
    });
  };

  return (
    <section
      className={classNames(style.orderManagementPanel, {
        [style.mobileRecordPanel]: mobile,
      })}
      aria-label={showTitle ? undefined : I18N.carbonAgent.profileOrders}
      aria-labelledby={showTitle ? 'carbon-agent-order-title' : undefined}
    >
      {showTitle ? (
        <h2
          className={style.orderManagementTitle}
          id='carbon-agent-order-title'
        >
          {I18N.carbonAgent.profileOrders}
        </h2>
      ) : null}

      <div className={style.orderManagementToolbar}>
        <div className={style.orderStatusTabs} role='tablist'>
          {getOrderStatusTabs().map(tab => (
            <button
              className={classNames(style.orderStatusTab, {
                [style.orderStatusTabActive]: tab.key === activeStatus,
              })}
              key={tab.key}
              type='button'
              role='tab'
              aria-selected={tab.key === activeStatus}
              onClick={() => handleStatusChange(tab.key)}
            >
              {mobile ? MOBILE_ORDER_STATUS_LABELS[tab.key] : tab.label}
            </button>
          ))}
        </div>

        <div className={style.orderToolbarActions}>
          <label
            className={style.orderSearch}
            htmlFor='carbon-agent-order-search'
          >
            <SearchOutlined className={style.orderSearchIcon} />
            <input
              id='carbon-agent-order-search'
              value={keywordInput}
              placeholder={I18N.carbonAgent.searchOrderId}
              onBlur={commitSearch}
              onChange={event => setKeywordInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  commitSearch();
                }
              }}
            />
          </label>
          {mobile ? null : (
            <button
              className={style.orderInvoiceButton}
              type='button'
              onClick={() => setInvoiceDialogOpen(true)}
            >
              {I18N.carbonAgent.applyInvoice}
            </button>
          )}
        </div>
      </div>

      {mobile ? (
        <>
          <div className={style.mobileRecordList}>{renderMobileOrders()}</div>
          <footer className={style.mobileRecordFooter}>
            <button
              className={style.mobileRecordPrimaryButton}
              type='button'
              onClick={() => setInvoiceDialogOpen(true)}
            >
              {I18N.carbonAgent.applyInvoice}
            </button>
          </footer>
        </>
      ) : (
        <>
          <div className={style.orderTableWrap}>
            <table className={style.orderTable}>
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.orderId}</th>
                  <th>{I18N.carbonAgent.transactionTime}</th>
                  <th>{I18N.carbonAgent.orderContentLabel}</th>
                  <th>{I18N.carbonAgent.amount}</th>
                  <th>{I18N.carbonAgent.status}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className={style.orderTableState}>
                        {I18N.carbonAgent.orderLoading}
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5}>
                      <div className={style.orderTableState}>
                        <span>{error}</span>
                        <button
                          type='button'
                          onClick={() => setRetryKey(prevKey => prevKey + 1)}
                        >
                          {I18N.carbonAgent.retry}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : orders.length ? (
                  orders.map((order, index) => {
                    const orderKey = getOrderRowKey(order, index, pageNum);
                    const statusTone = getOrderStatusTone(order);

                    return (
                      <tr key={orderKey}>
                        <td>{toDisplayText(order.orderNo)}</td>
                        <td>{getOrderTime(order) || '--'}</td>
                        <td>{getOrderContent(order)}</td>
                        <td>{formatOrderAmount(order)}</td>
                        <td>
                          <span
                            className={classNames(style.orderStatusTag, {
                              [style.orderStatusTagFailed]:
                                statusTone === 'failed',
                              [style.orderStatusTagPending]:
                                statusTone === 'pending',
                              [style.orderStatusTagSuccess]:
                                statusTone === 'success',
                            })}
                          >
                            {getOrderStatusLabel(order)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className={style.orderTableState}>
                        {I18N.carbonAgent.noOrders}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer
            className={classNames(style.orderFooter, style.pointsRecordFooter)}
          >
            <div
              className={style.orderPagination}
              aria-label={I18N.carbonAgent.orderPagination}
            >
              <button
                className={style.orderPageButton}
                type='button'
                aria-label={I18N.carbonAgent.prevPage}
                disabled={pageNum <= 1}
                onClick={() => handlePageChange(pageNum - 1)}
              >
                ‹
              </button>
              {paginationItems.map(item => {
                if (typeof item !== 'number') {
                  return (
                    <span className={style.orderPageEllipsis} key={item.key}>
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    className={classNames(style.orderPageButton, {
                      [style.orderPageButtonActive]: item === pageNum,
                    })}
                    key={item}
                    type='button'
                    aria-current={item === pageNum ? 'page' : undefined}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                className={style.orderPageButton}
                type='button'
                aria-label={I18N.carbonAgent.nextPage}
                disabled={pageNum >= totalPages}
                onClick={() => handlePageChange(pageNum + 1)}
              >
                ›
              </button>
            </div>
          </footer>
        </>
      )}
      <AgentInvoiceDialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onSubmitted={() => setRetryKey(prevKey => prevKey + 1)}
      />
    </section>
  );
};

export default OrderManagementPanel;
