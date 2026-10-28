import adjustIcon from '@src/assets/images/carbonAgent/icons/project-comparison-adjust.svg';
import backIcon from '@src/assets/images/carbonAgent/icons/project-comparison-back.svg';
import sparkleIcon from '@src/assets/images/carbonAgent/icons/project-comparison-sparkle.svg';
import I18N from '@src/lang/I18N';
import ReactECharts from 'echarts-for-react';
import { message as antdMessage, Spin } from 'antd';
import classNames from 'classnames';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { useMobile } from '@/hooks/use-mobile';

import style from '../index.module.less';
import mobileStyle from './ProjectCalculationComparison.mobile.module.less';
import {
  type AgentProjectCalculation,
  type AgentProjectCalculationComparison,
  type AgentProjectCalculationComparisonAccount,
  type AgentProjectCalculationComparisonDimension,
  compareAgentProjectCalculations,
  fetchAgentProjectCalculations,
} from '../service';
import ProjectCalculationCompareDialog from './ProjectCalculationCompareDialog';
import ProjectTaskCreateDialog from './ProjectTaskCreateDialog';

type ProjectCalculationComparisonProps = {
  calculations?: AgentProjectCalculation[];
  initialAccountIds?: Array<number | string>;
  initialComparison?: AgentProjectCalculationComparison;
  onBack: () => void;
  projectId: string;
};

const COMPARISON_COLORS = ['#0cbf9f', '#026961', '#04252b', '#718b88'];

const getComparisonColor = (index: number) =>
  COMPARISON_COLORS[index % COMPARISON_COLORS.length];

const loadProjectCalculations = (projectId: string, signal: AbortSignal) =>
  fetchAgentProjectCalculations(projectId, signal);

const formatEmission = (value?: string | number | null) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return value || '--';
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 5,
  }).format(parsedValue);
};

const getDeltaLabel = (account: AgentProjectCalculationComparisonAccount) => {
  if (account.baseline) {
    return I18N.carbonAgent.projectComparisonBaseline;
  }

  const delta = Number(account.deltaPercent);

  if (!Number.isFinite(delta) || delta === 0) {
    return I18N.carbonAgent.projectComparisonComparedEqual;
  }

  return I18N.template(
    delta > 0
      ? I18N.carbonAgent.projectComparisonComparedIncrease
      : I18N.carbonAgent.projectComparisonComparedDecrease,
    {
      val1: formatEmission(Math.abs(delta)),
    },
  );
};

const getComparisonFocusCategory = (
  comparison: AgentProjectCalculationComparison,
) => {
  let focusCategory = comparison.categories[0];
  let largestSpread = -1;

  comparison.categories.forEach(category => {
    let minimum = Number.POSITIVE_INFINITY;
    let maximum = Number.NEGATIVE_INFINITY;

    comparison.accounts.forEach(account => {
      const value = Number(account.values[String(category.code)]);

      if (Number.isFinite(value)) {
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
      }
    });

    const spread =
      Number.isFinite(minimum) && Number.isFinite(maximum)
        ? maximum - minimum
        : -1;

    if (spread > largestSpread) {
      focusCategory = category;
      largestSpread = spread;
    }
  });

  return focusCategory;
};

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const requestError = error as {
    data?: { msg?: unknown };
    message?: unknown;
    response?: { data?: { msg?: unknown } };
  };
  const responseData = requestError.response?.data || requestError.data;

  if (typeof responseData?.msg === 'string' && responseData.msg.trim()) {
    return responseData.msg;
  }

  return typeof requestError.message === 'string' && requestError.message.trim()
    ? requestError.message
    : fallback;
};

const ProjectCalculationComparison = ({
  calculations,
  initialAccountIds,
  initialComparison,
  onBack,
  projectId,
}: ProjectCalculationComparisonProps) => {
  const { locale } = useContext(LocaleContext);
  const isMobile = useMobile();
  const [availableCalculations, setAvailableCalculations] = useState<
    AgentProjectCalculation[]
  >(calculations || []);
  const [accountIds, setAccountIds] = useState<Array<number | string>>(
    initialAccountIds || [],
  );
  const [comparison, setComparison] = useState(initialComparison);
  const [dialogOpen, setDialogOpen] = useState(!initialComparison);
  const [calculationsLoading, setCalculationsLoading] = useState(
    !calculations?.length,
  );
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const comparisonRequestIdRef = useRef(0);
  const comparisonAbortRef = useRef<AbortController>();

  useEffect(() => {
    setAvailableCalculations(calculations || []);
    setAccountIds(initialAccountIds || []);
    setComparison(initialComparison);
    setDialogOpen(!initialComparison);
    setComparisonError('');
  }, [calculations, initialAccountIds, initialComparison, projectId]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setCalculationsLoading(true);

    loadProjectCalculations(projectId, abortController.signal)
      .then(nextCalculations => {
        if (!cancelled) {
          setAvailableCalculations(
            nextCalculations.filter(calculation => calculation.available),
          );
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setCalculationsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [projectId]);

  useEffect(
    () => () => {
      comparisonAbortRef.current?.abort();
    },
    [],
  );

  const chartOption = useMemo(() => {
    if (!comparison) {
      return {};
    }

    return {
      animationDuration: 450,
      color: COMPARISON_COLORS,
      grid: {
        bottom: 16,
        containLabel: true,
        left: isMobile ? 4 : 24,
        right: isMobile ? 4 : 24,
        top: isMobile ? 16 : 56,
      },
      legend: {
        icon: 'roundRect',
        itemGap: 32,
        itemHeight: 3,
        itemWidth: 20,
        textStyle: {
          color: '#34464b',
          fontFamily: 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
          fontSize: 14,
        },
        show: !isMobile,
        top: 0,
      },
      series: comparison.accounts.map((account, index) => ({
        barMaxWidth: 38,
        data: comparison.categories.map(category =>
          Number(account.values[String(category.code)] || 0),
        ),
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: getComparisonColor(index),
        },
        name: account.accountName,
        type: 'bar',
      })),
      tooltip: {
        appendToBody: true,
        axisPointer: {
          type: 'shadow',
        },
        trigger: 'axis',
        valueFormatter: (value: number) => formatEmission(value),
      },
      xAxis: {
        axisLabel: {
          color: '#727b7f',
          fontSize: isMobile ? 10 : 13,
          interval: 0,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
        data: comparison.categories.map(category => category.name),
        type: 'category',
      },
      yAxis: {
        axisLabel: {
          color: '#999ea4',
          fontSize: 12,
          formatter: (value: number) => formatEmission(value),
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#eceeef',
            type: 'dashed',
          },
        },
        type: 'value',
      },
    };
  }, [comparison, isMobile]);

  const handleDimensionChange = async (
    dimension: AgentProjectCalculationComparisonDimension,
  ) => {
    if (
      !comparison ||
      comparison.dimension === dimension ||
      accountIds.length < 2 ||
      comparisonLoading
    ) {
      return;
    }

    comparisonAbortRef.current?.abort();
    const abortController = new AbortController();
    const requestId = comparisonRequestIdRef.current + 1;

    comparisonAbortRef.current = abortController;
    comparisonRequestIdRef.current = requestId;
    setComparisonLoading(true);
    setComparisonError('');

    try {
      const nextComparison = await compareAgentProjectCalculations(
        projectId,
        {
          accountIds,
          dimension,
        },
        abortController.signal,
      );

      if (comparisonRequestIdRef.current === requestId) {
        setComparison(nextComparison);
      }
    } catch (error) {
      if (
        comparisonRequestIdRef.current === requestId &&
        !abortController.signal.aborted
      ) {
        setComparisonError(
          getRequestErrorMessage(
            error,
            I18N.carbonAgent.projectComparisonLoadFailed,
          ),
        );
      }
    } finally {
      if (comparisonRequestIdRef.current === requestId) {
        setComparisonLoading(false);
      }
    }
  };

  const handleCompared = (
    nextComparison: AgentProjectCalculationComparison,
    nextAccountIds: Array<number | string>,
  ) => {
    setAccountIds(nextAccountIds);
    setComparison(nextComparison);
    setComparisonError('');
    setDialogOpen(false);
  };
  const focusCategory = comparison
    ? getComparisonFocusCategory(comparison)
    : undefined;

  return (
    <section
      className={classNames(style.projectComparisonPage, mobileStyle.root)}
    >
      <header
        className={classNames(
          style.projectComparisonHeader,
          mobileStyle.header,
        )}
      >
        <button
          className={style.projectComparisonBack}
          type='button'
          onClick={onBack}
        >
          <img src={backIcon} alt='' aria-hidden='true' />
          <strong>{I18N.carbonAgent.multiCalculationComparison}</strong>
        </button>
        <button
          className={style.projectComparisonAdjust}
          type='button'
          disabled={calculationsLoading || availableCalculations.length < 2}
          onClick={() => setDialogOpen(true)}
        >
          <img src={adjustIcon} alt='' aria-hidden='true' />
          <span>{I18N.carbonAgent.projectComparisonAdjust}</span>
        </button>
      </header>

      <div
        className={classNames(style.projectComparisonBody, mobileStyle.body)}
      >
        {!comparison ? (
          <div className={style.projectComparisonEmpty}>
            {calculationsLoading ? (
              <>
                <Spin />
                <span>{I18N.carbonAgent.projectCalculationsLoading}</span>
              </>
            ) : (
              <>
                <span>{I18N.carbonAgent.projectComparisonEmpty}</span>
                <button type='button' onClick={() => setDialogOpen(true)}>
                  {I18N.carbonAgent.projectComparisonAdjust}
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className={classNames(
              style.projectComparisonContent,
              mobileStyle.content,
            )}
            aria-busy={comparisonLoading}
          >
            <div
              className={classNames(
                style.projectComparisonTitleRow,
                mobileStyle.titleRow,
              )}
            >
              <h1>
                {I18N.template(
                  I18N.carbonAgent.projectComparisonDimensionTitle,
                  {
                    val1:
                      comparison.dimension === 'lifecycle_stage'
                        ? I18N.carbonAgent.projectComparisonLifecycleStage
                        : I18N.carbonAgent.projectComparisonEmissionType,
                  },
                )}
              </h1>
              <div
                className={classNames(
                  style.projectComparisonDimensionTabs,
                  mobileStyle.dimensionTabs,
                )}
                role='tablist'
                aria-label={I18N.carbonAgent.multiCalculationComparison}
              >
                {(
                  [
                    [
                      'lifecycle_stage',
                      I18N.carbonAgent.projectComparisonLifecycleStage,
                    ],
                    [
                      'emission_type',
                      I18N.carbonAgent.projectComparisonEmissionType,
                    ],
                  ] as const
                ).map(([dimension, label]) => (
                  <button
                    className={
                      comparison.dimension === dimension
                        ? style.projectComparisonDimensionActive
                        : undefined
                    }
                    type='button'
                    role='tab'
                    aria-selected={comparison.dimension === dimension}
                    disabled={comparisonLoading}
                    key={dimension}
                    onClick={() => handleDimensionChange(dimension)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {comparisonError ? (
              <div className={style.projectComparisonError} role='alert'>
                {comparisonError}
              </div>
            ) : null}

            <div
              className={classNames(
                style.projectComparisonSummary,
                mobileStyle.summary,
              )}
            >
              {comparison.accounts.map((account, index) => (
                <article
                  className={classNames(
                    style.projectComparisonSummaryCard,
                    mobileStyle.summaryCard,
                  )}
                  key={String(account.accountId)}
                  style={
                    {
                      '--comparison-color': getComparisonColor(index),
                    } as CSSProperties
                  }
                >
                  <div>
                    <strong>{account.accountName}</strong>
                    <span
                      className={
                        account.baseline
                          ? style.projectComparisonBaselineTag
                          : style.projectComparisonDeltaTag
                      }
                    >
                      {getDeltaLabel(account)}
                    </span>
                  </div>
                  <b>
                    {formatEmission(account.totalEmission)}{' '}
                    <small>{account.emissionUnit}</small>
                  </b>
                </article>
              ))}
            </div>

            <div
              className={classNames(
                style.projectComparisonChart,
                mobileStyle.chart,
              )}
            >
              <ReactECharts
                option={chartOption}
                notMerge
                style={{ height: 335, width: '100%' }}
              />
            </div>

            <div
              className={mobileStyle.accountLegend}
              aria-label={I18N.carbonAgent.multiCalculationComparison}
            >
              {comparison.accounts.map((account, index) => (
                <span
                  key={String(account.accountId)}
                  style={
                    {
                      '--comparison-color': getComparisonColor(index),
                    } as CSSProperties
                  }
                  title={account.accountName}
                >
                  {account.accountName}
                </span>
              ))}
            </div>

            <div
              className={classNames(
                style.projectComparisonTableWrap,
                mobileStyle.tableWrap,
              )}
            >
              <table
                className={classNames(
                  style.projectComparisonTable,
                  mobileStyle.table,
                )}
              >
                <thead>
                  <tr>
                    <th>
                      {comparison.dimension === 'lifecycle_stage'
                        ? I18N.carbonAgent.projectComparisonLifecycleStage
                        : I18N.carbonAgent.projectComparisonEmissionType}
                    </th>
                    {comparison.accounts.map(account => (
                      <th key={String(account.accountId)}>
                        {account.accountName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.categories.map(category => (
                    <tr key={String(category.code)}>
                      <th>{category.name}</th>
                      {comparison.accounts.map(account => (
                        <td key={String(account.accountId)}>
                          {formatEmission(
                            account.values[String(category.code)],
                          )}{' '}
                          {account.emissionUnit}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {comparison.conclusion ? (
              <section
                className={classNames(
                  style.projectComparisonConclusion,
                  mobileStyle.conclusion,
                )}
              >
                <header>
                  <div>
                    <img src={sparkleIcon} alt='' aria-hidden='true' />
                    <strong>
                      {I18N.carbonAgent.projectComparisonConclusion}
                    </strong>
                  </div>
                  <button type='button' onClick={() => setTaskDialogOpen(true)}>
                    {I18N.carbonAgent.projectComparisonCreateTask}
                  </button>
                </header>
                <div>
                  <h2>
                    {I18N.template(
                      I18N.carbonAgent.projectComparisonMainChanges,
                      {
                        val1: comparison.dimensionName,
                      },
                    )}
                  </h2>
                  <p>{comparison.conclusion}</p>
                </div>
              </section>
            ) : null}

            {comparisonLoading ? (
              <div className={style.projectComparisonLoading}>
                <Spin />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {comparison ? (
        <footer className={mobileStyle.mobileFooter}>
          <button
            type='button'
            disabled={calculationsLoading || availableCalculations.length < 2}
            onClick={() => setDialogOpen(true)}
          >
            <img src={adjustIcon} alt='' aria-hidden='true' />
            <span>{I18N.carbonAgent.projectComparisonAdjust}</span>
          </button>
        </footer>
      ) : null}

      <ProjectCalculationCompareDialog
        calculations={availableCalculations}
        initialAccountIds={accountIds}
        open={dialogOpen}
        projectId={projectId}
        onCancel={() => {
          if (comparison) {
            setDialogOpen(false);
          } else {
            onBack();
          }
        }}
        onCompared={handleCompared}
      />
      <ProjectTaskCreateDialog
        context={
          comparison
            ? {
                initialTaskDescription: comparison.conclusion,
                initialTaskTitle: I18N.template(
                  I18N.carbonAgent.projectTaskComparisonDefaultTitle,
                  { val1: comparison.dimensionName },
                ),
                relatedObjectLabel: I18N.template(
                  I18N.carbonAgent.projectTaskComparisonObject,
                  { val1: comparison.dimensionName },
                ),
                ...(focusCategory
                  ? {
                      compareContext: {
                        accountIds: comparison.accounts.map(
                          account => account.accountId,
                        ),
                        dimension: comparison.dimension,
                        focusCategoryCode: focusCategory.code,
                      },
                    }
                  : {}),
                sourceObjectType: comparison.dimension,
                sourceType: 'compare_difference',
              }
            : undefined
        }
        locale={locale}
        open={taskDialogOpen && Boolean(comparison)}
        projectId={projectId}
        onCancel={() => setTaskDialogOpen(false)}
        onCreated={() => {
          setTaskDialogOpen(false);
          antdMessage.success(I18N.carbonAgent.projectTaskCreateSuccess);
        }}
      />
    </section>
  );
};

export default ProjectCalculationComparison;
