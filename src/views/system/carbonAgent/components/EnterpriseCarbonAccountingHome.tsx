import { DownOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { LocaleContext } from '@src/components/LocaleProvider';
import I18N, { LocaleType } from '@src/lang/I18N';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { InputHTMLAttributes } from 'react';

import MobileEnterpriseAccountingCards, {
  formatEnterpriseAccountingEmission,
  formatEnterpriseAccountingYear,
} from './MobileEnterpriseAccountingCards';
import type { AgentConversation } from '../constants';
import style from '../index.module.less';
import {
  createAgentSession,
  fetchAgentEnterpriseComputationList,
  fetchLatestAgentSessionByBusiness,
} from '../service';
import type { AgentEnterpriseComputationItem } from '../service';

const DESKTOP_PAGE_SIZE = 10;
const MOBILE_PAGE_SIZE = 10;
const MAX_VISIBLE_PAGE_COUNT = 5;
const ENTERPRISE_ACCOUNT_BINDING = {
  bizType: 'account',
  module: 'enterprise',
};

const MobileYearPickerInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input {...props} ref={ref} inputMode='none' readOnly type='text' />
));

MobileYearPickerInput.displayName = 'MobileYearPickerInput';

const MOBILE_YEAR_PICKER_COMPONENTS = {
  input: MobileYearPickerInput,
};

const getVisiblePages = (page: number, totalPages: number) => {
  const pageCount = Math.min(totalPages, MAX_VISIBLE_PAGE_COUNT);
  const half = Math.floor(pageCount / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - pageCount + 1));

  return Array.from({ length: pageCount }, (_, index) => start + index);
};

const getBusinessBinding = (row: AgentEnterpriseComputationItem) => ({
  ...ENTERPRISE_ACCOUNT_BINDING,
  bizId: row.year,
});

type EnterpriseCarbonAccountingHomeProps = {
  isMobile?: boolean;
  onOpenAccountingPreview?: (target: {
    enterpriseCarbonBizId: string;
    enterpriseCarbonBizType: 'account';
    type: 'enterpriseCarbonAccounting';
    year: string;
  }) => void;
  onOpenConversation: (conversation: AgentConversation) => void;
};

const mergeEnterpriseAccountingRows = (
  currentRows: AgentEnterpriseComputationItem[],
  nextRows: AgentEnterpriseComputationItem[],
) => {
  const rowMap = new Map<number, AgentEnterpriseComputationItem>();

  currentRows.forEach(row => rowMap.set(row.year, row));
  nextRows.forEach(row => rowMap.set(row.year, row));

  return Array.from(rowMap.values());
};

const EnterpriseCarbonAccountingHome = ({
  isMobile = false,
  onOpenAccountingPreview,
  onOpenConversation,
}: EnterpriseCarbonAccountingHomeProps) => {
  const { locale } = useContext(LocaleContext);
  const mobileYearInitializedRef = useRef(isMobile);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [rows, setRows] = useState<AgentEnterpriseComputationItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(() =>
    isMobile ? dayjs().year() : null,
  );
  const [total, setTotal] = useState(0);
  const [viewingYear, setViewingYear] = useState<number | null>(null);
  const pageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visiblePages = useMemo(
    () => getVisiblePages(pageNum, totalPages),
    [pageNum, totalPages],
  );

  useEffect(() => {
    if (!isMobile || mobileYearInitializedRef.current) {
      return;
    }

    mobileYearInitializedRef.current = true;
    setSelectedYear(dayjs().year());
    setPageNum(1);
  }, [isMobile]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);

    fetchAgentEnterpriseComputationList(
      {
        pageNum,
        pageSize,
        year: selectedYear ?? undefined,
      },
      abortController.signal,
    )
      .then(response => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        const responseData = response.data;
        const nextTotal = Number(responseData.total || 0);

        const nextRows = responseData.rows || [];

        setRows(currentRows =>
          isMobile && pageNum > 1
            ? mergeEnterpriseAccountingRows(currentRows, nextRows)
            : nextRows,
        );
        setTotal(Number.isFinite(nextTotal) ? nextTotal : 0);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled && !abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [isMobile, pageNum, pageSize, selectedYear]);

  const goToPage = (nextPage: number) => {
    if (loading || viewingYear !== null) {
      return;
    }

    const normalizedPage = Math.max(1, Math.min(nextPage, totalPages));

    if (normalizedPage === pageNum) {
      return;
    }

    setLoading(true);
    setPageNum(normalizedPage);
  };

  const handleView = async (row: AgentEnterpriseComputationItem) => {
    if (loading || viewingYear !== null) {
      return;
    }

    if (isMobile && onOpenAccountingPreview) {
      const year = String(row.year);

      onOpenAccountingPreview({
        enterpriseCarbonBizId: year,
        enterpriseCarbonBizType: 'account',
        type: 'enterpriseCarbonAccounting',
        year,
      });
      return;
    }

    const businessBinding = getBusinessBinding(row);
    setViewingYear(row.year);

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

      if (session.sessionId || session.id) {
        onOpenConversation(session);
      }
    } catch {
      // The shared request layer surfaces request errors.
    } finally {
      setViewingYear(null);
    }
  };
  const hasMore = pageNum < totalPages && rows.length < total;

  return (
    <div
      className={`${style.accountingManagementPage} ${style.enterpriseAccountingManagementPage}`}
    >
      <div className={style.accountingManagementHeader}>
        <h1>{I18N.carbonAgent.accountingManagement}</h1>
        <DatePicker
          allowClear
          aria-label={I18N.carbonAgent.enterpriseProjectAccountingYear}
          className={style.enterpriseAccountingYearPicker}
          components={isMobile ? MOBILE_YEAR_PICKER_COMPONENTS : undefined}
          disabled={loading || viewingYear !== null}
          format={locale === LocaleType.enUS ? 'YYYY' : 'YYYY年'}
          inputReadOnly
          picker='year'
          placeholder={I18N.carbonAgent.allYears}
          suffixIcon={<DownOutlined />}
          value={selectedYear === null ? null : dayjs().year(selectedYear)}
          onChange={value => {
            setLoading(true);
            setSelectedYear(value ? value.year() : null);
            setPageNum(1);
          }}
        />
      </div>

      {isMobile ? (
        <MobileEnterpriseAccountingCards
          hasMore={hasMore}
          loading={loading}
          locale={locale}
          rows={rows}
          viewingYear={viewingYear}
          onLoadMore={() => goToPage(pageNum + 1)}
          onView={handleView}
        />
      ) : (
        <div className={style.accountingTableArea}>
          <div className={style.accountingTableScroll}>
            <table className={style.enterpriseAccountingTable}>
              <colgroup>
                <col className={style.enterpriseAccountingYearColumn} />
                <col className={style.enterpriseAccountingPeriodColumn} />
                <col className={style.enterpriseAccountingSubjectColumn} />
                <col className={style.enterpriseAccountingEmissionColumn} />
                <col className={style.enterpriseAccountingOperationColumn} />
              </colgroup>
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.enterpriseProjectAccountingYear}</th>
                  <th>{I18N.carbonAgent.enterpriseProjectAccountingPeriod}</th>
                  <th>{I18N.carbonAgent.enterpriseTaskAccountingSubject}</th>
                  <th>{I18N.carbonAgent.totalEmission}</th>
                  <th>{I18N.carbonAgent.operation}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className={style.enterpriseAccountingTableStateCell}
                      colSpan={5}
                    >
                      <div className={style.enterpriseAccountingTableState}>
                        {I18N.carbonAgent.loadingEnterpriseCarbonData}
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading && !rows.length ? (
                  <tr>
                    <td
                      className={style.enterpriseAccountingTableStateCell}
                      colSpan={5}
                    >
                      <div className={style.enterpriseAccountingTableState}>
                        {I18N.carbonAgent.noEnterpriseCarbonData}
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? rows.map(row => {
                      const rowViewing = viewingYear === row.year;
                      const emission = formatEnterpriseAccountingEmission(row);
                      const formattedYear = formatEnterpriseAccountingYear(
                        row.year,
                        locale,
                      );

                      return (
                        <tr key={row.year}>
                          <td title={formattedYear}>{formattedYear}</td>
                          <td title={row.timeTypeName || '-'}>
                            {row.timeTypeName || '-'}
                          </td>
                          <td title={row.orgNames || '-'}>
                            {row.orgNames || '-'}
                          </td>
                          <td title={emission}>{emission}</td>
                          <td>
                            <button
                              className={style.accountingViewButton}
                              type='button'
                              aria-busy={rowViewing}
                              disabled={loading || viewingYear !== null}
                              onClick={() => handleView(row)}
                            >
                              {rowViewing
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
              disabled={loading || viewingYear !== null || pageNum <= 1}
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
                disabled={loading || viewingYear !== null}
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
                loading || viewingYear !== null || pageNum >= totalPages
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

export default EnterpriseCarbonAccountingHome;
