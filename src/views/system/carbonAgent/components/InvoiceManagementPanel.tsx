import { SearchOutlined } from '@ant-design/icons';
import { message as antdMessage } from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import { useEffect, useMemo, useState } from 'react';

import {
  getProductServiceInvoiceList,
  getProductServiceInvoiceTotal,
} from '../../productService/invoiceManagement/service';
import type { InvoiceManagementList } from '../../productService/invoiceManagement/type';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

type InvoiceStatusFilter = 'all' | 'invoiced' | 'invoicing';
type PaginationItem = { key: string; type: 'ellipsis' } | number;

type InvoiceManagementPanelProps = {
  active: boolean;
  mobile?: boolean;
  showTitle?: boolean;
};

type InvoiceFileInfo = {
  name?: string;
  url?: string;
};

const INVOICE_PAGE_SIZE = 10;

const getInvoiceStatusTabs = (): Array<{
  key: InvoiceStatusFilter;
  label: string;
}> => [
  {
    key: 'all',
    label: I18N.carbonAgent.tabAll,
  },
  {
    key: 'invoicing',
    label: I18N.carbonAgent.invoicing,
  },
  {
    key: 'invoiced',
    label: I18N.carbonAgent.invoiced,
  },
];

const MOBILE_INVOICE_STATUS_LABELS = createI18nLabelMap<
  InvoiceStatusFilter,
  string
>({
  all: () => I18N.carbonAgent.tabAll,
  invoiced: () => I18N.carbonAgent.invoiced,
  invoicing: () => I18N.carbonAgent.pendingInvoice,
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

const toDisplayText = (value: unknown, fallback = '--') => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback;
};

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

const getInvoiceStatusValue = (status: InvoiceStatusFilter) => {
  if (status === 'invoicing') {
    return 0;
  }

  if (status === 'invoiced') {
    return 1;
  }

  return undefined;
};

const getInvoiceStatusLabel = (status?: number) =>
  status === 1 ? I18N.carbonAgent.invoiced : I18N.carbonAgent.invoicing;

const getInvoiceStatusTone = (status?: number) =>
  status === 1 ? 'success' : 'pending';

const getInvoiceId = (invoice: InvoiceManagementList) =>
  toDisplayText(invoice.id, '');

const getInvoiceAmount = (invoice: InvoiceManagementList) => {
  const amount = toNumber(invoice.money, Number.NaN);

  if (!Number.isFinite(amount)) {
    return '--';
  }

  return `¥${amount.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
};

const invoiceMatchesKeyword = (
  invoice: InvoiceManagementList,
  keyword: string,
) => {
  if (!keyword) {
    return true;
  }

  const searchText = [
    invoice.id,
    invoice.invoiceTitile,
    invoice.content,
    invoice.createBy,
    invoice.remark,
  ]
    .map(value => String(value || '').toLowerCase())
    .join(' ');

  return searchText.includes(keyword.toLowerCase());
};

const parseInvoiceFile = (filePath?: string): InvoiceFileInfo | undefined => {
  if (!filePath) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(filePath) as
      | InvoiceFileInfo
      | InvoiceFileInfo[]
      | string;

    if (typeof parsed === 'string') {
      return {
        url: parsed,
      };
    }

    if (Array.isArray(parsed)) {
      return parsed.find(item => item?.url);
    }

    return parsed?.url ? parsed : undefined;
  } catch {
    return {
      url: filePath,
    };
  }
};

const getInvoiceRowKey = (
  invoice: InvoiceManagementList,
  index: number,
  pageNum: number,
) => String(invoice.id ?? `${pageNum}-${index}`);

const InvoiceManagementPanel = ({
  active,
  mobile = false,
  showTitle = true,
}: InvoiceManagementPanelProps) => {
  const [activeStatus, setActiveStatus] = useState<InvoiceStatusFilter>('all');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [invoices, setInvoices] = useState<InvoiceManagementList[]>([]);
  const [total, setTotal] = useState(0);
  const [invoiceableAmount, setInvoiceableAmount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / INVOICE_PAGE_SIZE));
  const paginationItems = useMemo(
    () => getPaginationItems(pageNum, totalPages),
    [pageNum, totalPages],
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    getProductServiceInvoiceTotal()
      .then(response => {
        setInvoiceableAmount(toNumber(response.data.data));
      })
      .catch(() => {
        setInvoiceableAmount(0);
      });
  }, [active, retryKey]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;

    setLoading(true);
    setError('');

    const statusValue = getInvoiceStatusValue(activeStatus);
    const requestParams = {
      keyword,
      page: pageNum,
      size: INVOICE_PAGE_SIZE,
      status: statusValue,
    } as unknown as {
      page: number;
      size: number;
    };

    getProductServiceInvoiceList(requestParams)
      .then(response => {
        if (cancelled) {
          return;
        }

        const pageData = response.data.data;
        const rows = Array.isArray(pageData?.rows) ? pageData.rows : [];
        const filteredRows = rows.filter(
          invoice =>
            (statusValue === undefined || invoice.status === statusValue) &&
            invoiceMatchesKeyword(invoice, keyword),
        );

        setInvoices(filteredRows);
        setTotal(
          statusValue === undefined && !keyword
            ? toNumber(pageData?.total)
            : filteredRows.length,
        );
      })
      .catch(requestError => {
        if (cancelled) {
          return;
        }

        setInvoices([]);
        setTotal(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : I18N.carbonAgent.invoiceLoadFailed,
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
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

  const handleStatusChange = (status: InvoiceStatusFilter) => {
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

  const handleDownload = (invoice: InvoiceManagementList) => {
    const fileInfo = parseInvoiceFile(invoice.filePath);

    if (!fileInfo?.url) {
      antdMessage.warning(I18N.carbonAgent.noDownloadableInvoice);
      return;
    }

    saveAs(fileInfo.url, fileInfo.name);
  };

  const renderInvoiceTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5}>
            <div className={style.orderTableState}>
              {I18N.carbonAgent.invoiceLoading}
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
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
      );
    }

    if (!invoices.length) {
      return (
        <tr>
          <td colSpan={5}>
            <div className={style.orderTableState}>
              {I18N.carbonAgent.noInvoiceRecord}
            </div>
          </td>
        </tr>
      );
    }

    return invoices.map((invoice, index) => {
      const statusTone = getInvoiceStatusTone(invoice.status);
      const downloadable = invoice.status === 1 && invoice.filePath;

      return (
        <tr key={getInvoiceRowKey(invoice, index, pageNum)}>
          <td>{getInvoiceId(invoice) || '--'}</td>
          <td>{toDisplayText(invoice.createTime)}</td>
          <td>{getInvoiceAmount(invoice)}</td>
          <td>
            <span
              className={classNames(style.orderStatusTag, {
                [style.orderStatusTagPending]: statusTone === 'pending',
                [style.orderStatusTagSuccess]: statusTone === 'success',
              })}
            >
              {getInvoiceStatusLabel(invoice.status)}
            </span>
          </td>
          <td>
            {downloadable ? (
              <button
                className={style.invoiceDownloadButton}
                type='button'
                onClick={() => handleDownload(invoice)}
              >
                {I18N.carbonAgent.download}
              </button>
            ) : (
              '--'
            )}
          </td>
        </tr>
      );
    });
  };

  const renderMobileInvoices = () => {
    if (loading) {
      return (
        <div className={style.mobileRecordState} role='status'>
          {I18N.carbonAgent.invoiceLoading}
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

    if (!invoices.length) {
      return (
        <div className={style.mobileRecordState}>
          {I18N.carbonAgent.noInvoiceRecord}
        </div>
      );
    }

    return invoices.map((invoice, index) => {
      const statusTone = getInvoiceStatusTone(invoice.status);
      const downloadable = invoice.status === 1 && invoice.filePath;

      return (
        <article
          className={classNames(
            style.mobileRecordCard,
            style.mobileInvoiceRecordCard,
          )}
          key={getInvoiceRowKey(invoice, index, pageNum)}
        >
          <header className={style.mobileRecordCardHeader}>
            <strong className={style.mobileRecordTitle}>
              {I18N.carbonAgent.invoiceIdColon}
              {getInvoiceId(invoice) || '--'}
            </strong>
            <span
              className={classNames(style.orderStatusTag, {
                [style.orderStatusTagPending]: statusTone === 'pending',
                [style.orderStatusTagSuccess]: statusTone === 'success',
              })}
            >
              {getInvoiceStatusLabel(invoice.status)}
            </span>
          </header>
          <dl className={style.mobileRecordMeta}>
            <div>
              <dt>{I18N.carbonAgent.invoiceDate}</dt>
              <dd>{toDisplayText(invoice.createTime)}</dd>
            </div>
            <div>
              <dt>{I18N.carbonAgent.invoiceAmount}</dt>
              <dd>{getInvoiceAmount(invoice)}</dd>
            </div>
            {downloadable ? (
              <div className={style.mobileInvoiceDownloadRow}>
                <dt>{I18N.carbonAgent.downloadInvoice}</dt>
                <dd>
                  <button
                    className={style.mobileInvoiceDownloadButton}
                    type='button'
                    onClick={() => handleDownload(invoice)}
                  >
                    {I18N.carbonAgent.download}
                  </button>
                </dd>
              </div>
            ) : null}
          </dl>
        </article>
      );
    });
  };

  if (!active) {
    return null;
  }

  return (
    <section
      className={classNames(style.orderManagementPanel, {
        [style.mobileRecordPanel]: mobile,
      })}
      aria-label={showTitle ? undefined : I18N.carbonAgent.profileInvoices}
      aria-labelledby={
        showTitle ? 'carbon-agent-invoice-record-title' : undefined
      }
    >
      {showTitle ? (
        <h2
          className={style.orderManagementTitle}
          id='carbon-agent-invoice-record-title'
        >
          {I18N.carbonAgent.profileInvoices}
        </h2>
      ) : null}

      <div className={style.orderManagementToolbar}>
        <div className={style.orderStatusTabs} role='tablist'>
          {getInvoiceStatusTabs().map(tab => (
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
              {mobile ? MOBILE_INVOICE_STATUS_LABELS[tab.key] : tab.label}
            </button>
          ))}
        </div>

        <div className={style.orderToolbarActions}>
          {mobile ? null : (
            <span className={style.invoiceableAmount}>
              {I18N.carbonAgent.invoiceableAmountLabel}¥
              {invoiceableAmount.toLocaleString('zh-CN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
          )}
          <label
            className={style.orderSearch}
            htmlFor='carbon-agent-invoice-record-search'
          >
            <SearchOutlined className={style.orderSearchIcon} />
            <input
              id='carbon-agent-invoice-record-search'
              value={keywordInput}
              placeholder={I18N.carbonAgent.searchInvoiceId}
              onBlur={commitSearch}
              onChange={event => setKeywordInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  commitSearch();
                }
              }}
            />
          </label>
        </div>
      </div>

      {mobile ? (
        <div className={style.mobileRecordList}>{renderMobileInvoices()}</div>
      ) : (
        <>
          <div className={style.orderTableWrap}>
            <table className={classNames(style.orderTable, style.invoiceTable)}>
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.invoiceId}</th>
                  <th>{I18N.carbonAgent.invoiceDate}</th>
                  <th>{I18N.carbonAgent.invoiceAmount}</th>
                  <th>{I18N.carbonAgent.status}</th>
                  <th>{I18N.carbonAgent.operation}</th>
                </tr>
              </thead>
              <tbody>{renderInvoiceTableRows()}</tbody>
            </table>
          </div>

          <footer
            className={classNames(style.orderFooter, style.pointsRecordFooter)}
          >
            <div
              className={style.orderPagination}
              aria-label={I18N.carbonAgent.invoicePagination}
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
    </section>
  );
};

export default InvoiceManagementPanel;
