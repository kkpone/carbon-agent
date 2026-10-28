import I18N from '@src/lang/I18N';
import { useMobile } from '@/hooks/use-mobile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Checkbox, Select, Tooltip } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';

import addComparison from './assets/add-comparison.svg';
import analysisAssistant from './assets/analysis-assistant.svg';
import analysisMark from './assets/analysis-mark.svg';
import chevron from './assets/chevron-down.svg';
import compareCompany from './assets/compare-company.svg';
import removeIcon from './assets/remove-company.svg';
import { PageComparisonTable } from './CarbonTables';
import { CompareCompanyPicker } from './CompareCompanyPicker';
import { CompanyAvatar, stockCodes } from './FollowCompany';
import { ErrorState, Loading } from './components';
import { comparisonYears, isComparisonCountAllowed } from './data';
import { AnalysisButton, PageHeader } from './PageLayout';
import {
  analyzeComparison,
  createComparison,
  enterpriseError,
  fetchCarbonData,
  fetchResult,
} from './service';
import { useEnterpriseData } from './state';
import type { Analysis, Company, ComparisonResult } from './types';
import style from './Pages.module.less';

const ComparisonCompanies = ({
  companies,
  disabled,
  onChoose,
  onRemove,
}: {
  companies: Company[];
  disabled: boolean;
  onChoose: () => void;
  onRemove: (id: string) => void;
}) => (
  <div className={style.companyStrip}>
    {companies.map(company => (
      <div className={style.compareCompany} key={company.companyId}>
        <CompanyAvatar company={company} small />
        <div>
          <strong title={company.name}>
            {company.shortName || company.name}
          </strong>
          <small>{stockCodes(company)}</small>
        </div>
        <Button
          type='text'
          disabled={disabled}
          aria-label={`${I18N.enterpriseData.removeComparison} ${company.name}`}
          icon={<img src={removeIcon} alt='' />}
          onClick={() => onRemove(company.companyId)}
        />
      </div>
    ))}
    <Button
      type='dashed'
      className={style.addComparison}
      disabled={disabled}
      icon={<img src={addComparison} alt='' />}
      onClick={onChoose}
    >
      {companies.length >= 2
        ? I18N.enterpriseData.changeCompanies
        : I18N.enterpriseData.addComparison}
    </Button>
  </div>
);

const ComparisonCount = ({ count }: { count: number }) => (
  <div className={style.comparisonCount}>
    <img src={compareCompany} alt='' />
    <span>
      {I18N.enterpriseData.compareCount.replace('{count}', String(count))}
    </span>
  </div>
);

const ComparisonResultView = ({
  result,
  years,
  eligible,
  canSelect,
  onRefresh,
  onYear,
  onBack,
  onChoose,
  onRemove,
}: {
  result: ComparisonResult;
  years: string[];
  eligible: boolean;
  canSelect: boolean;
  onRefresh: () => void;
  onYear: (year: string) => void;
  onBack: () => void;
  onChoose: () => void;
  onRemove: (id: string) => void;
}) => {
  const state = useEnterpriseData();
  const mobile = useMobile();
  const [shortViewport, setShortViewport] = useState(false);
  useEffect(() => {
    // 与 Pages.module.less 的低高度窗口断点保持一致。
    const query = window.matchMedia('(max-height: 900px)');
    const update = () => setShortViewport(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const pageScroll = mobile || shortViewport;
  const analysisContentId = useId();
  const [collapsed, setCollapsed] = useState(false);
  const [showMedian, setShowMedian] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis>();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController>();
  useEffect(() => () => controller.current?.abort(), []);
  const analyze = async () => {
    setVisible(true);
    setCollapsed(false);
    if (analysis || controller.current || !eligible) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError('');
    try {
      const response = await analyzeComparison(result.resultId, abort.signal);
      if (!abort.signal.aborted) setAnalysis(response);
    } catch (reason) {
      if (!abort.signal.aborted) {
        setError(enterpriseError(reason));
        state.refresh();
      }
    } finally {
      if (!abort.signal.aborted) {
        controller.current = undefined;
        setBusy(false);
      }
    }
  };
  const t = I18N.enterpriseData;
  return (
    <>
      <PageHeader
        title={t.comparisonTitle}
        onBack={onBack}
        actions={
          <Tooltip
            title={!eligible && !analysis ? t.compareUnavailable : undefined}
          >
            <span>
              <AnalysisButton
                disabled={!eligible && !analysis}
                busy={busy}
                onClick={analyze}
              />
            </span>
          </Tooltip>
        }
      />
      <div className={style.compareBody}>
        <div className={style.comparisonToolbar}>
          <ComparisonCount count={result.data.companies.length} />
          <div className={style.comparisonFilters}>
            {result.data.sameIndustry ? (
              <Checkbox
                checked={showMedian}
                onChange={event => setShowMedian(event.target.checked)}
              >
                {t.showMedian}
              </Checkbox>
            ) : null}
            <Select
              className={style.compareYear}
              aria-label={t.year}
              value={result.data.year}
              disabled={!eligible}
              suffixIcon={<img src={chevron} alt='' />}
              options={years.map(year => ({ value: year, label: year }))}
              onChange={onYear}
            />
          </div>
        </div>
        <ComparisonCompanies
          companies={result.data.companies.map(item => item.company)}
          disabled={!canSelect}
          onChoose={onChoose}
          onRemove={onRemove}
        />
        {visible ? (
          <section
            className={style.analysisPanel}
            aria-label={t.analysisResult}
            data-collapsed={pageScroll && collapsed ? 'true' : undefined}
          >
            <div className={style.analysisHeader}>
              <h2>
                <img src={analysisMark} alt='' />
                {t.analysisResult}
              </h2>
              <Button
                className={pageScroll ? style.analysisToggle : undefined}
                aria-label={
                  pageScroll
                    ? collapsed
                      ? t.expandAnalysis
                      : t.collapseAnalysis
                    : t.close
                }
                aria-expanded={pageScroll ? !collapsed : undefined}
                aria-controls={pageScroll ? analysisContentId : undefined}
                onClick={() =>
                  pageScroll ? setCollapsed(value => !value) : setVisible(false)
                }
                icon={pageScroll ? undefined : <img src={removeIcon} alt='' />}
              >
                {pageScroll
                  ? collapsed
                    ? t.expandAnalysis
                    : t.collapseAnalysis
                  : null}
              </Button>
            </div>
            <div
              id={analysisContentId}
              className={style.analysisContent}
              hidden={pageScroll && collapsed}
            >
              {busy ? <Loading /> : null}
              {error ? (
                <div className={style.analysisError}>
                  <ErrorState
                    error={error}
                    onRetry={eligible ? analyze : undefined}
                  />
                  <Alert type='info' message={t.analysisUnconfirmed} />
                  <Button disabled={!eligible} onClick={onRefresh}>
                    {t.refreshComparison}
                  </Button>
                </div>
              ) : null}
              {analysis ? (
                <>
                  <div className={style.analysisIntro}>
                    <h3>{t.scale}</h3>
                    <p>{analysis.emissionScale}</p>
                  </div>
                  <div className={style.analysisInsights}>
                    <div className={style.insightHeading}>
                      <img src={analysisAssistant} alt='' />
                      <strong>{t.analysisInsights}</strong>
                    </div>
                    <div className={style.insightBody}>
                      {[
                        [t.efficiency, analysis.emissionEfficiency],
                        [t.findings, analysis.keyFindings],
                      ].map(([title, text]) => (
                        <section key={title}>
                          <h3>{title}</h3>
                          <p>{text}</p>
                        </section>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        ) : null}
        <PageComparisonTable
          comparison={result.data}
          showMedian={showMedian}
          mobile={mobile}
          pageScroll={pageScroll}
        />
        <footer className={style.snapshotFooter}>
          <span>
            {t.snapshot}
            {result.queriedAt
              ? ` · ${t.queryTime} ${new Date(
                  result.queriedAt,
                ).toLocaleString()}`
              : ''}
          </span>
          <Button type='link' disabled={!eligible} onClick={onRefresh}>
            {t.refreshComparison}
          </Button>
        </footer>
      </div>
    </>
  );
};

export const ComparePage = ({
  resultId,
  onResult,
  onSelect,
  onBack,
}: {
  resultId: string;
  onResult: (resultId: string) => void;
  onSelect: () => void;
  onBack: () => void;
}) => {
  const state = useEnterpriseData();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestedComparison, setRequestedComparison] = useState<{
    companies: Company[];
    year?: string;
  }>();
  const requestRef = useRef<AbortController>();
  const generation = useRef(0);
  const t = I18N.enterpriseData;
  const query = useQuery({
    queryKey: ['enterpriseData', state.scope, 'result', resultId],
    queryFn: ({ signal }) => fetchResult(resultId, signal),
    enabled: state.enabled && Boolean(resultId),
    retry: false,
    staleTime: Infinity,
  });
  useEffect(() => {
    setError('');
    setRequestedComparison(undefined);
    setBusy(false);
    return () => {
      generation.current += 1;
      requestRef.current?.abort();
    };
  }, [resultId]);
  const result =
    query.data?.resultType === 'enterprise_comparison' ? query.data : undefined;
  const limit = state.entitlement.data?.compareLimit ?? 0;
  const canCreate =
    state.enabled &&
    state.entitlement.isSuccess &&
    !state.entitlement.isError &&
    limit >= 2 &&
    state.follows.isSuccess &&
    !state.follows.isError;
  const canCompareCompanies = (items: Company[]) =>
    canCreate &&
    isComparisonCountAllowed(items.length, limit) &&
    new Set(items.map(company => company.companyId)).size === items.length &&
    items.every(company =>
      state.follows.data?.some(
        follow => follow.enterpriseId === company.companyId,
      ),
    );
  const eligible =
    canCreate &&
    (!result ||
      canCompareCompanies(result.data.companies.map(item => item.company)));

  const compare = async (companies: Company[], year?: string) => {
    if (!canCompareCompanies(companies)) return;
    requestRef.current?.abort();
    const abort = new AbortController();
    requestRef.current = abort;
    generation.current += 1;
    const currentGeneration = generation.current;
    const current = () =>
      !abort.signal.aborted && currentGeneration === generation.current;
    setBusy(true);
    setError('');
    setRequestedComparison({ companies, year });
    try {
      let nextYear = year;
      if (!nextYear) {
        const data = await Promise.all(
          companies.map(company =>
            fetchCarbonData(company.companyId, undefined, abort.signal),
          ),
        );
        if (!current()) return;
        nextYear = comparisonYears(data).defaultYear;
        if (!nextYear) throw new Error(t.noYears);
        setRequestedComparison({ companies, year: nextYear });
      }
      const response = await createComparison(
        companies.map(company => company.companyId),
        nextYear,
        abort.signal,
      );
      if (!current()) return;
      client.setQueryData(
        ['enterpriseData', state.scope, 'result', response.resultId],
        response,
      );
      onResult(response.resultId);
    } catch (reason) {
      if (current()) {
        setError(enterpriseError(reason));
        state.refresh();
      }
    } finally {
      if (current()) setBusy(false);
    }
  };
  const years = result ? comparisonYears(result.data.companies).years : [];
  if (result && !years.includes(result.data.year)) years.push(result.data.year);
  const repeat = () => {
    if (result)
      compare(
        result.data.companies.map(item => item.company),
        result.data.year,
      );
  };
  const [selecting, setSelecting] = useState(false);
  const selectedCompanies = state.selectedCompanyIds.flatMap(id => {
    const follow = state.follows.data?.find(item => item.enterpriseId === id);
    return follow?.company ? [follow.company] : [];
  });
  const companies =
    requestedComparison?.companies ||
    result?.data.companies.map(item => item.company) ||
    selectedCompanies;
  const choose = () => setSelecting(true);
  const remove = (id: string) => {
    setRequestedComparison(undefined);
    setError('');
    state.setSelectedCompanyIds(
      companies
        .filter(company => company.companyId !== id)
        .map(company => company.companyId),
    );
    onSelect();
  };
  return (
    <div className={`${style.page} ${style.comparePage}`}>
      {result && !busy && !error && !query.isError ? (
        <ComparisonResultView
          key={result.resultId}
          result={result}
          years={years.sort().reverse()}
          eligible={eligible}
          canSelect={canCreate}
          onBack={onBack}
          onRefresh={repeat}
          onYear={year =>
            compare(
              result.data.companies.map(item => item.company),
              year,
            )
          }
          onChoose={choose}
          onRemove={remove}
        />
      ) : (
        <>
          <PageHeader
            title={t.comparisonTitle}
            onBack={onBack}
            actions={
              <AnalysisButton disabled busy={false} onClick={() => undefined} />
            }
          />
          <div className={style.compareBody}>
            <ComparisonCount count={companies.length} />
            <ComparisonCompanies
              companies={companies}
              disabled={!canCreate || busy}
              onChoose={choose}
              onRemove={remove}
            />
            {error ? (
              <ErrorState
                error={error}
                onRetry={
                  requestedComparison &&
                  canCompareCompanies(requestedComparison.companies)
                    ? () =>
                        compare(
                          requestedComparison.companies,
                          requestedComparison.year,
                        )
                    : undefined
                }
              />
            ) : null}
            {state.follows.isError || state.entitlement.isError ? (
              <ErrorState
                error={t.limitsFailed}
                onRetry={() => state.refresh()}
              />
            ) : null}
            {query.isError && resultId ? (
              <ErrorState error={query.error} onRetry={() => query.refetch()} />
            ) : null}
            {busy || (resultId && query.isLoading) ? (
              <Loading />
            ) : resultId && !result && !query.isError ? (
              <ErrorState error={t.invalidResult} />
            ) : !resultId ? (
              <div className={style.selectionEmpty}>
                <p>{t.selectCompanies}</p>
                <Button
                  type='primary'
                  disabled={!canCompareCompanies(companies)}
                  onClick={() => compare(companies)}
                >
                  {t.startCompare}
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
      {selecting ? (
        <CompareCompanyPicker
          initial={companies.map(company => company.companyId)}
          onClose={() => setSelecting(false)}
          onConfirm={next => {
            state.setSelectedCompanyIds(next.map(company => company.companyId));
            setSelecting(false);
            compare(next);
          }}
        />
      ) : null}
    </div>
  );
};
