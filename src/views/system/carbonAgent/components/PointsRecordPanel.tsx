import { SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import { fetchAgentPointRecordsPage, type AgentPointRecord } from '../service';

type PointsRecordFilter = 'all' | 'consumed' | 'obtained';
type PaginationItem = { key: string; type: 'ellipsis' } | number;

type PointsRecordPanelProps = {
  active: boolean;
  mobile?: boolean;
  showTitle?: boolean;
};

const POINTS_RECORD_PAGE_SIZE = 10;

const getPointsRecordTabs = (): Array<{
  key: PointsRecordFilter;
  label: string;
}> => [
  {
    key: 'all',
    label: I18N.carbonAgent.tabAll,
  },
  {
    key: 'obtained',
    label: I18N.carbonAgent.pointsObtained,
  },
  {
    key: 'consumed',
    label: I18N.carbonAgent.pointsConsumed,
  },
];

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

const isPointsPageSuccess = (code?: number) => code === 1 || code === 200;

const normalizeText = (value?: string | null) =>
  String(value || '')
    .trim()
    .toLowerCase();

const getPointsRecordDirection = (
  record: AgentPointRecord,
): 'negative' | 'neutral' | 'positive' => {
  const directionText = [
    record.direction,
    record.recordType,
    record.recordTypeName,
    record.pointsDisplay,
  ]
    .map(normalizeText)
    .join(' ');
  const points = getOptionalNumber(record.points);

  if (
    directionText.includes('-') ||
    directionText.includes('consume') ||
    directionText.includes('cost') ||
    directionText.includes('deduct') ||
    directionText.includes('expense') ||
    directionText.includes('minus') ||
    directionText.includes('out') ||
    directionText.includes('spend') ||
    directionText.includes('use') ||
    directionText.includes('已消耗') ||
    directionText.includes('扣减') ||
    directionText.includes('消耗')
  ) {
    return 'negative';
  }

  if (
    directionText.includes('+') ||
    directionText.includes('add') ||
    directionText.includes('credit') ||
    directionText.includes('gain') ||
    directionText.includes('in') ||
    directionText.includes('obtain') ||
    directionText.includes('plus') ||
    directionText.includes('recharge') ||
    directionText.includes('已获取') ||
    directionText.includes('充值') ||
    directionText.includes('获得') ||
    directionText.includes('获取')
  ) {
    return 'positive';
  }

  if (points !== undefined && points < 0) {
    return 'negative';
  }

  if (points !== undefined && points > 0) {
    return 'positive';
  }

  return 'neutral';
};

const getPointsRecordDetail = (record: AgentPointRecord) =>
  toDisplayText(record.content, '') ||
  toDisplayText(record.toolName, '') ||
  toDisplayText(record.nodeName, '') ||
  toDisplayText(record.recordTypeName);

const getSignedPointsAmount = (record: AgentPointRecord) => {
  const points = getOptionalNumber(record.points) ?? 0;
  const direction = getPointsRecordDirection(record);

  if (points < 0 || direction === 'negative') {
    return -Math.abs(points);
  }

  if (points > 0 || direction === 'positive') {
    return Math.abs(points);
  }

  return 0;
};

const getPointsRecordType = (record: AgentPointRecord) => {
  const explicitType =
    toDisplayText(record.recordTypeName, '') ||
    toDisplayText(record.recordType, '');

  if (explicitType) {
    return explicitType;
  }

  const direction = getPointsRecordDirection(record);

  if (direction === 'negative') {
    return I18N.carbonAgent.pointsConsumed;
  }

  if (direction === 'positive') {
    return I18N.carbonAgent.pointsObtained;
  }

  return '--';
};

const getPointsRecordTime = (record: AgentPointRecord) =>
  toDisplayText(record.createTime, '');

const formatPointsAmount = (record: AgentPointRecord) => {
  const pointsDisplay = toDisplayText(record.pointsDisplay, '');

  if (pointsDisplay) {
    return pointsDisplay;
  }

  const amount = getSignedPointsAmount(record);
  const formattedAmount = Math.abs(amount).toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  if (amount > 0) {
    return `+${formattedAmount}`;
  }

  if (amount < 0) {
    return `-${formattedAmount}`;
  }

  return '0';
};

const getPointsRecordKey = (
  record: AgentPointRecord,
  index: number,
  pageNum: number,
) => String(record.id ?? record.messageId ?? `${pageNum}-${index}`);

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

const PointsRecordPanel = ({
  active,
  mobile = false,
  showTitle = true,
}: PointsRecordPanelProps) => {
  const [activeStatus, setActiveStatus] = useState<PointsRecordFilter>('all');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [records, setRecords] = useState<AgentPointRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / POINTS_RECORD_PAGE_SIZE));
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

    fetchAgentPointRecordsPage(
      {
        category: activeStatus,
        keyword,
        pageNum: String(pageNum),
        pageSize: String(POINTS_RECORD_PAGE_SIZE),
        recordType: '',
      },
      controller.signal,
    )
      .then(response => {
        const responseData = response.data;

        if (!isPointsPageSuccess(responseData.code)) {
          throw new Error(
            responseData.msg || I18N.carbonAgent.pointsRecordLoadFailed,
          );
        }

        const pageData = responseData.data;
        const rows = pageData?.rows;
        const nextRows = Array.isArray(rows) ? rows : [];
        const nextTotal = toNumber(pageData?.total);
        const nextPage = toNumber(pageData?.pageNum, pageNum);

        setRecords(nextRows);
        setTotal(nextTotal);

        if (nextPage !== pageNum && nextPage > 0) {
          setPageNum(nextPage);
        }
      })
      .catch(requestError => {
        if (controller.signal.aborted) {
          return;
        }

        setRecords([]);
        setTotal(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : I18N.carbonAgent.pointsRecordLoadFailed,
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

  const handleStatusChange = (status: PointsRecordFilter) => {
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

  const renderMobileRecords = () => {
    if (loading) {
      return (
        <div className={style.mobileRecordState} role='status'>
          {I18N.carbonAgent.pointsRecordLoading}
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

    if (!records.length) {
      return (
        <div className={style.mobileRecordState}>
          {I18N.carbonAgent.noPointsRecord}
        </div>
      );
    }

    return records.map((record, index) => {
      const recordKey = getPointsRecordKey(record, index, pageNum);
      const pointsAmount = getSignedPointsAmount(record);

      return (
        <article
          className={classNames(
            style.mobileRecordCard,
            style.mobilePointsRecordCard,
          )}
          key={recordKey}
        >
          <div className={style.mobilePointsRecordInfo}>
            <strong>{getPointsRecordDetail(record)}</strong>
            <span>{getPointsRecordTime(record) || '--'}</span>
          </div>
          <span
            className={classNames(style.mobilePointsRecordAmount, {
              [style.pointsRecordAmountNegative]: pointsAmount < 0,
              [style.pointsRecordAmountPositive]: pointsAmount > 0,
            })}
          >
            {formatPointsAmount(record)}
          </span>
        </article>
      );
    });
  };

  return (
    <section
      className={classNames(style.orderManagementPanel, {
        [style.mobileRecordPanel]: mobile,
      })}
      aria-label={showTitle ? undefined : I18N.carbonAgent.profilePoints}
      aria-labelledby={
        showTitle ? 'carbon-agent-points-record-title' : undefined
      }
    >
      {showTitle ? (
        <h2
          className={style.orderManagementTitle}
          id='carbon-agent-points-record-title'
        >
          {I18N.carbonAgent.profilePoints}
        </h2>
      ) : null}

      <div className={style.orderManagementToolbar}>
        <div className={style.orderStatusTabs} role='tablist'>
          {getPointsRecordTabs().map(tab => (
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
              {tab.label}
            </button>
          ))}
        </div>

        <div className={style.orderToolbarActions}>
          <label
            className={style.orderSearch}
            htmlFor='carbon-agent-points-record-search'
          >
            <SearchOutlined className={style.orderSearchIcon} />
            <input
              id='carbon-agent-points-record-search'
              value={keywordInput}
              placeholder={I18N.carbonAgent.searchDetail}
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
        <div className={style.mobileRecordList}>{renderMobileRecords()}</div>
      ) : (
        <>
          <div className={style.orderTableWrap}>
            <table
              className={classNames(style.orderTable, style.pointsRecordTable)}
            >
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.detail}</th>
                  <th>{I18N.carbonAgent.type}</th>
                  <th>{I18N.carbonAgent.date}</th>
                  <th>{I18N.carbonAgent.pointsConsumption}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4}>
                      <div className={style.orderTableState}>
                        {I18N.carbonAgent.pointsRecordLoading}
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4}>
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
                ) : records.length ? (
                  records.map((record, index) => {
                    const recordKey = getPointsRecordKey(
                      record,
                      index,
                      pageNum,
                    );
                    const pointsAmount = getSignedPointsAmount(record);

                    return (
                      <tr key={recordKey}>
                        <td>{getPointsRecordDetail(record)}</td>
                        <td>{getPointsRecordType(record)}</td>
                        <td>{getPointsRecordTime(record) || '--'}</td>
                        <td>
                          <span
                            className={classNames(style.pointsRecordAmount, {
                              [style.pointsRecordAmountNegative]:
                                pointsAmount < 0,
                              [style.pointsRecordAmountPositive]:
                                pointsAmount > 0,
                            })}
                          >
                            {formatPointsAmount(record)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <div className={style.orderTableState}>
                        {I18N.carbonAgent.noPointsRecord}
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
              aria-label={I18N.carbonAgent.pointsRecordPagination}
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

export default PointsRecordPanel;
