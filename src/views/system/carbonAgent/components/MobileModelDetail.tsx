import calendarIcon from '@src/assets/images/carbonAgent/model-detail/calendar.svg';
import hintAiIcon from '@src/assets/images/carbonAgent/model-detail/hint-ai.svg';
import lifecycleFullIcon from '@src/assets/images/carbonAgent/model-detail/lifecycle-full.svg';
import quickAccountingIcon from '@src/assets/images/carbonAgent/model-detail/quick-accounting.svg';
import stageDistributionIcon from '@src/assets/images/carbonAgent/model-detail/stage-distribution.svg';
import stageManufacturingIcon from '@src/assets/images/carbonAgent/model-detail/stage-manufacturing.svg';
import stageRawMaterialIcon from '@src/assets/images/carbonAgent/model-detail/stage-raw-material.svg';
import stageUseIcon from '@src/assets/images/carbonAgent/model-detail/stage-use.svg';
import stageWasteIcon from '@src/assets/images/carbonAgent/model-detail/stage-waste.svg';
import typeAuxiliaryMaterialIcon from '@src/assets/images/carbonAgent/model-detail/type-auxiliary-material.svg';
import typeEnergyIcon from '@src/assets/images/carbonAgent/model-detail/type-energy.svg';
import typeExhaustGasIcon from '@src/assets/images/carbonAgent/model-detail/type-exhaust-gas.svg';
import typeMainMaterialIcon from '@src/assets/images/carbonAgent/model-detail/type-main-material.svg';
import typePackagingIcon from '@src/assets/images/carbonAgent/model-detail/type-packaging.svg';
import typeRenewableMaterialIcon from '@src/assets/images/carbonAgent/model-detail/type-renewable-material.svg';
import typeRenewableWasteIcon from '@src/assets/images/carbonAgent/model-detail/type-renewable-waste.svg';
import typeSolidWasteIcon from '@src/assets/images/carbonAgent/model-detail/type-solid-waste.svg';
import typeTransportIcon from '@src/assets/images/carbonAgent/model-detail/type-transport.svg';
import typeWastewaterIcon from '@src/assets/images/carbonAgent/model-detail/type-wastewater.svg';
import typeWaterIcon from '@src/assets/images/carbonAgent/model-detail/type-water.svg';
import defaultProductImage from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import { Spin } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import style from '../index.module.less';
import {
  fetchAgentAccountDetailedList,
  fetchAgentAccountInfo,
  fetchAgentAccountResult,
} from '../service';
import type {
  AgentAccountChartStage,
  AgentAccountEmissionDetail,
  AgentAccountInfo,
  AgentAccountResultData,
} from '../service';

export type MobileEmissionRow = {
  amount: string;
  emissionTotal: string;
  id: string;
  name: string;
  type: string;
  typeIcon?: string;
};

export type MobileLifecycleStage = {
  icon: string;
  key: string;
  name: string;
  rate: string;
  rows: MobileEmissionRow[];
  theme: string;
  total: string;
};

export type MobileAccountDetail = {
  emissionTotal: string;
  emissions: AgentAccountEmissionDetail[];
  info?: AgentAccountInfo;
  result?: AgentAccountResultData;
  unit: string;
};

type MobileModelDetailProps = {
  accountId?: string;
  snapFlag?: number | string;
};

type MobileModelDetailState = {
  detail?: MobileAccountDetail;
  error: string;
  loading: boolean;
};

const getStageDefinitions = () => [
  {
    code: 0,
    icon: stageRawMaterialIcon,
    key: 'raw',
    name: I18N.carbonAgent.stageRawMaterial,
    theme: 'green',
  },
  {
    code: 1,
    icon: stageManufacturingIcon,
    key: 'manufacturing',
    name: I18N.carbonAgent.stageManufacturing,
    theme: 'teal',
  },
  {
    code: 2,
    icon: stageDistributionIcon,
    key: 'distribution',
    name: I18N.carbonAgent.stageDistribution,
    theme: 'orange',
  },
  {
    code: 3,
    icon: stageUseIcon,
    key: 'use',
    name: I18N.carbonAgent.stageUse,
    theme: 'blue',
  },
  {
    code: 4,
    icon: stageWasteIcon,
    key: 'end',
    name: I18N.carbonAgent.stageEnd,
    theme: 'red',
  },
];

const STAGE_CODE_TO_KEY: Record<string, string> = {
  0: 'raw',
  1: 'manufacturing',
  2: 'distribution',
  3: 'use',
  4: 'end',
  101: 'manufacturing',
  102: 'distribution',
  103: 'use',
  104: 'end',
};

const unwrapResponseData = <T,>(response: unknown): T | undefined => {
  const responseRecord =
    response && typeof response === 'object'
      ? (response as Record<string, unknown>)
      : {};
  const body = responseRecord.data as Record<string, unknown> | undefined;
  const data = body?.data;

  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'data' in data
  ) {
    return (data as Record<string, T>).data || (data as T);
  }

  return data as T | undefined;
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return value.split(' ')[0].replace(/-/g, '/');
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

const getFiniteNumber = (value?: string | number | null) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const matchedNumber = value.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);

  if (!matchedNumber) {
    return undefined;
  }

  const numberValue = Number(matchedNumber[0]);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const sumEmissionValues = (emissions: AgentAccountEmissionDetail[]) => {
  let hasValue = false;

  const total = emissions.reduce((sum, emission) => {
    const emissionValue = getFiniteNumber(emission.emissionTotal);

    if (emissionValue === undefined) {
      return sum;
    }

    hasValue = true;

    return sum + emissionValue;
  }, 0);

  return hasValue ? total : undefined;
};

const formatPercent = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const percentValue = Number(value);

  if (!Number.isFinite(percentValue)) {
    return '-';
  }

  return `${percentValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
  })}%`;
};

const formatStagePercent = (
  stageRate?: string | number | null,
  stageTotal?: number,
  emissionTotal?: number,
) => {
  const apiRate = formatPercent(stageRate);

  if (apiRate !== '-') {
    return apiRate;
  }

  if (
    stageTotal === undefined ||
    emissionTotal === undefined ||
    Math.abs(emissionTotal) < Number.EPSILON
  ) {
    return '-';
  }

  const percentValue = (stageTotal / emissionTotal) * 100;

  if (!Number.isFinite(percentValue)) {
    return '-';
  }

  return `${percentValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
  })}%`;
};

const formatEmissionWithUnit = (
  value?: string | number | null,
  unit = 'kgCO₂e',
) => {
  const emission = formatEmission(value);

  return emission === '-' ? '-' : `${emission} ${unit}`;
};

const getStageCodeKey = (code?: string | number | null) => {
  if (code === undefined || code === null || code === '') {
    return '';
  }

  return STAGE_CODE_TO_KEY[String(code)] || '';
};

const getVisibleStageDefinitions = (info?: AgentAccountInfo) => {
  const stageDefinitions = getStageDefinitions();

  if (!info?.scopeValue) {
    return stageDefinitions;
  }

  const visibleStageKeys = new Set(
    info.scopeValue
      .split(',')
      .map(scopeCode => getStageCodeKey(scopeCode.trim()))
      .filter(Boolean),
  );

  return visibleStageKeys.size
    ? stageDefinitions.filter(stageDefinition =>
        visibleStageKeys.has(stageDefinition.key),
      )
    : stageDefinitions;
};

const getTrimmedText = (value?: string | number | null) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const getChartStageKey = (chartStage: AgentAccountChartStage) =>
  getStageCodeKey(chartStage.code);

const getEmissionStageKey = (emission: AgentAccountEmissionDetail) =>
  getStageCodeKey(emission.accountLifeCycleStage) ||
  getStageCodeKey(emission.stageCode) ||
  getStageCodeKey(emission.stage_code) ||
  getStageCodeKey(emission.stage);

const isSameStageName = (emissionStageName: string, chartStageName: string) =>
  Boolean(emissionStageName && chartStageName) &&
  emissionStageName === chartStageName;

const hasStageIdentity = (chartStage: AgentAccountChartStage) => {
  const stageIdentity = chartStage.name ?? chartStage.code;

  if (stageIdentity === undefined || stageIdentity === null) {
    return false;
  }

  return String(stageIdentity).trim().length > 0;
};

const getScopeName = (scope?: string | number, scopeValue?: string) => {
  if (scopeValue && Number(scope) === 2) {
    return I18N.carbonAgent.customLifeCycle;
  }

  const scopeNumber = Number(scope);

  if (scopeNumber === 0) {
    return I18N.carbonAgent.halfLifeCycle;
  }

  if (scopeNumber === 1) {
    return I18N.carbonAgent.fullLifeCycle;
  }

  if (scopeNumber === 2) {
    return I18N.carbonAgent.customLifeCycle;
  }

  return scopeValue || I18N.carbonAgent.lifeCycle;
};

const getAccountTypeName = (type?: string | number) => {
  const typeNumber = Number(type);

  if (typeNumber === 1) {
    return I18N.carbonAgent.processAccounting;
  }

  return I18N.carbonAgent.quickAccounting;
};

const getFunctionalUnit = (info?: AgentAccountInfo) => {
  const amount = info?.amount || 1;
  const unitName =
    info?.unitName || info?.unitCode || I18N.carbonAgent.unitPiece;

  return `${amount}${unitName}`;
};

const EMISSION_TYPE_CODE_ICON_MAP: Record<string, string> = {
  1: typeMainMaterialIcon,
  2: typeAuxiliaryMaterialIcon,
  3: typePackagingIcon,
  4: typeRenewableMaterialIcon,
  5: typeEnergyIcon,
  6: typeWaterIcon,
  7: typeTransportIcon,
  21: typeExhaustGasIcon,
  22: typeWastewaterIcon,
  23: typeSolidWasteIcon,
  24: typeRenewableWasteIcon,
};

const EMISSION_TYPE_CODE_LABEL_MAP = createI18nLabelMap<string, string>({
  1: () => I18N.carbonAgent.emissionTypeMainMaterial,
  2: () => I18N.carbonAgent.emissionTypeAuxiliaryMaterial,
  3: () => I18N.carbonAgent.emissionTypePackaging,
  4: () => I18N.carbonAgent.emissionTypeRenewableMaterial,
  5: () => I18N.carbonAgent.emissionTypeEnergy,
  6: () => I18N.carbonAgent.emissionTypeWater,
  7: () => I18N.carbonAgent.emissionTypeTransport,
  21: () => I18N.carbonAgent.emissionTypeExhaustGas,
  22: () => I18N.carbonAgent.emissionTypeWastewater,
  23: () => I18N.carbonAgent.emissionTypeSolidWaste,
  24: () => I18N.carbonAgent.emissionTypeRenewableWaste,
  41: () => I18N.carbonAgent.emissionTypeOther,
});

const getEmissionTypeLabel = (
  typeName?: string,
  type?: string | number | null,
) => {
  const typeCode = type === undefined || type === null ? '' : String(type);

  return typeName || EMISSION_TYPE_CODE_LABEL_MAP[typeCode] || typeCode || '-';
};

const getEmissionTypeIcon = (type?: string | number | null) => {
  if (type === undefined || type === null || type === '') {
    return undefined;
  }

  const typeText = String(type);
  const codeIcon = EMISSION_TYPE_CODE_ICON_MAP[typeText];

  if (codeIcon) {
    return codeIcon;
  }

  return undefined;
};

const getEmissionTypeCode = (emission: AgentAccountEmissionDetail) =>
  emission.typeCode ?? emission.type_code ?? emission.type;

const getStageChart = (
  chartStages: AgentAccountChartStage[],
  stageKey: string,
  stageName: string,
  fallbackIndex: number,
) => {
  const stageDefinitionName = getTrimmedText(stageName);
  const matchedStage = chartStages.find(chartStage => {
    const key = getChartStageKey(chartStage);

    if (!key) {
      return isSameStageName(
        getTrimmedText(chartStage.name),
        stageDefinitionName,
      );
    }

    return key === stageKey;
  });

  if (matchedStage) {
    return matchedStage;
  }

  return chartStages.find(
    (chartStage, index) =>
      !hasStageIdentity(chartStage) && index === fallbackIndex,
  );
};

const buildLifecycleStages = (
  detail?: MobileAccountDetail,
): MobileLifecycleStage[] => {
  const chartStages = detail?.result?.byStages || [];
  const emissions = detail?.emissions || [];
  const emissionTotal =
    getFiniteNumber(detail?.result?.emissionTotal) ??
    getFiniteNumber(detail?.info?.emissionTotal) ??
    sumEmissionValues(emissions);

  return getVisibleStageDefinitions(detail?.info).map(stageDefinition => {
    const chartStage = getStageChart(
      chartStages,
      stageDefinition.key,
      stageDefinition.name,
      stageDefinition.code,
    );
    const chartStageName = getTrimmedText(chartStage?.name);
    const stageDefinitionName = getTrimmedText(stageDefinition.name);
    const stageEmissions = emissions.filter(emission => {
      const emissionStageKey = getEmissionStageKey(emission);

      if (emissionStageKey) {
        return emissionStageKey === stageDefinition.key;
      }

      const emissionStageName = getTrimmedText(emission.stage);

      return (
        isSameStageName(emissionStageName, chartStageName) ||
        isSameStageName(emissionStageName, stageDefinitionName)
      );
    });
    const stageTotal =
      getFiniteNumber(chartStage?.total) ?? sumEmissionValues(stageEmissions);
    const rows = stageEmissions.map<MobileEmissionRow>((emission, rowIndex) => {
      const typeCode = getEmissionTypeCode(emission);
      const type = getEmissionTypeLabel(emission.typeName, typeCode);

      return {
        amount:
          emission.amount === undefined || emission.amount === null
            ? '-'
            : `${emission.amount}${
                emission.unitName ? ` ${emission.unitName}` : ''
              }`,
        emissionTotal: formatEmission(emission.emissionTotal),
        id: String(emission.id || `${stageDefinition.key}_${rowIndex}`),
        name: emission.name || '-',
        type,
        typeIcon: getEmissionTypeIcon(typeCode),
      };
    });

    return {
      icon: stageDefinition.icon,
      key: stageDefinition.key,
      name: chartStage?.name || stageDefinition.name,
      rate: formatStagePercent(chartStage?.rate, stageTotal, emissionTotal),
      rows,
      theme: stageDefinition.theme,
      total: formatEmissionWithUnit(stageTotal, detail?.unit),
    };
  });
};

const getMobileModelDetailApiExtraParams = (snapFlag?: number | string) =>
  snapFlag === undefined || snapFlag === ''
    ? {}
    : {
        snapFlag,
      };

const MobileModelDetail = ({ accountId, snapFlag }: MobileModelDetailProps) => {
  const [expandedStageKey, setExpandedStageKey] = useState<string | null>('');
  const [state, setState] = useState<MobileModelDetailState>({
    error: '',
    loading: false,
  });

  useEffect(() => {
    if (!accountId) {
      setState({
        error: I18N.carbonAgent.missingModelIdShort,
        loading: false,
      });
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setState(prevState => ({
      detail: prevState.detail,
      error: '',
      loading: true,
    }));
    setExpandedStageKey('');

    const loadDetail = async () => {
      const apiExtraParams = getMobileModelDetailApiExtraParams(snapFlag);
      const [infoResult, resultResult, emissionsResult] =
        await Promise.allSettled([
          fetchAgentAccountInfo(
            { id: accountId, ...apiExtraParams },
            abortController.signal,
          ),
          fetchAgentAccountResult(
            { ...apiExtraParams, id: accountId },
            abortController.signal,
          ),
          fetchAgentAccountDetailedList(
            { ...apiExtraParams, accountId },
            abortController.signal,
          ),
        ]);

      if (cancelled || abortController.signal.aborted) {
        return;
      }

      const info =
        infoResult.status === 'fulfilled'
          ? unwrapResponseData<AgentAccountInfo>(infoResult.value)
          : undefined;
      const result =
        resultResult.status === 'fulfilled'
          ? unwrapResponseData<AgentAccountResultData>(resultResult.value)
          : undefined;
      const detailedList =
        emissionsResult.status === 'fulfilled'
          ? unwrapResponseData<{ accountList?: AgentAccountEmissionDetail[] }>(
              emissionsResult.value,
            )
          : undefined;
      const emissions = detailedList?.accountList || [];

      if (!info && !result && !emissions.length) {
        setState({
          error: I18N.carbonAgent.modelDetailLoadFailed,
          loading: false,
        });
        return;
      }

      setState({
        detail: {
          emissionTotal: formatEmission(
            result?.emissionTotal || info?.emissionTotal,
          ),
          emissions,
          info,
          result,
          unit: info?.factorUnit || 'kgCO₂e',
        },
        error: '',
        loading: false,
      });
    };

    loadDetail().catch(() => {
      if (!cancelled && !abortController.signal.aborted) {
        setState({
          error: I18N.carbonAgent.modelDetailLoadFailed,
          loading: false,
        });
      }
    });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [accountId, snapFlag]);

  const { detail, error, loading } = state;
  const stages = useMemo(() => buildLifecycleStages(detail), [detail]);
  const info = detail?.info;
  const firstStageKey =
    stages.find(stage => stage.rows.length)?.key || stages[0]?.key;
  const activeExpandedStageKey =
    expandedStageKey === null ? '' : expandedStageKey || firstStageKey || '';

  if (loading && !detail) {
    return (
      <div className={style.mobileModelState}>
        <Spin />
      </div>
    );
  }

  if (error && !detail) {
    return <div className={style.mobileModelState}>{error}</div>;
  }

  return (
    <div className={style.mobileModelDetail}>
      <section className={style.mobileModelSummary}>
        <img
          src={info?.productPic || defaultProductImage}
          alt=''
          onError={event => {
            const image = event.currentTarget;

            image.src = defaultProductImage;
          }}
        />
        <div className={style.mobileModelSummaryBody}>
          <h2>
            {info?.accountName ||
              info?.productName ||
              I18N.carbonAgent.productFootprintModel}
          </h2>
          <div className={style.mobileModelTags}>
            <span className={style.mobileModelTagPrimary}>
              <img src={quickAccountingIcon} alt='' />
              {getAccountTypeName(info?.type)}
            </span>
            <span className={style.mobileModelTagSecondary}>
              <img src={lifecycleFullIcon} alt='' />
              {getScopeName(info?.scope, info?.scopeValue)}
            </span>
          </div>
          <p className={style.mobileModelDate}>
            <img src={calendarIcon} alt='' />
            {formatDate(info?.startTime || info?.createTime)} -{' '}
            {formatDate(info?.endTime || info?.updateTime)}
          </p>
          <dl>
            <div>
              <dt>{I18N.carbonAgent.functionalUnit}</dt>
              <dd>{getFunctionalUnit(info)}</dd>
            </div>
            <div>
              <dt>{I18N.carbonAgent.totalEmission}</dt>
              <dd>{detail?.emissionTotal || '-'} kgCO₂e</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className={style.mobileLifecycleList}
        aria-label={I18N.carbonAgent.lifeCycleCoverage}
      >
        <h3>{I18N.carbonAgent.lifeCycleCoverage}</h3>
        {stages.length ? (
          stages.map(stage => {
            const expanded = activeExpandedStageKey === stage.key;

            return (
              <article
                className={classNames(
                  style.mobileLifecycleCard,
                  style[`mobileLifecycleCard-${stage.theme}`],
                  {
                    [style.mobileLifecycleCardExpanded]: expanded,
                  },
                )}
                key={stage.key}
              >
                <button
                  className={style.mobileLifecycleHeader}
                  type='button'
                  aria-expanded={expanded}
                  onClick={() =>
                    setExpandedStageKey(expanded ? null : stage.key)
                  }
                >
                  <span className={style.mobileLifecycleName}>
                    <img src={stage.icon} alt='' />
                    {stage.name}
                  </span>
                  <span className={style.mobileLifecycleRate}>
                    {stage.rate}
                  </span>
                  <span
                    className={style.mobileLifecycleArrow}
                    aria-hidden='true'
                  />
                </button>
                {expanded ? (
                  <div className={style.mobileLifecycleBody}>
                    <div className={style.mobileLifecycleTableHead}>
                      <span>{I18N.carbonAgent.emissionSource}</span>
                      <span>{I18N.carbonAgent.type}</span>
                      <span>
                        {I18N.template(I18N.carbonAgent.emissionWithUnitLabel, {
                          val1: detail?.unit || 'kgCO₂e',
                        })}
                      </span>
                    </div>
                    {stage.rows.length ? (
                      stage.rows.map(row => (
                        <div className={style.mobileLifecycleRow} key={row.id}>
                          <span title={row.name}>{row.name}</span>
                          <span
                            className={style.mobileLifecycleType}
                            title={row.type}
                          >
                            {row.typeIcon ? (
                              <img src={row.typeIcon} alt='' />
                            ) : null}
                            {row.type}
                          </span>
                          <strong title={row.emissionTotal}>
                            {row.emissionTotal}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div className={style.mobileLifecycleEmpty}>
                        {I18N.carbonAgent.noEmissionDetail}
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className={style.mobileLifecycleEmpty}>
            {I18N.carbonAgent.noLifeCycleDetail}
          </div>
        )}
      </section>

      <section className={style.mobileModelDesktopHint}>
        <strong>
          <img src={hintAiIcon} alt='' />
          {I18N.carbonAgent.viewMoreOrEdit}
        </strong>
        <span>{I18N.carbonAgent.desktopOnlyHint}</span>
      </section>
    </div>
  );
};

export default MobileModelDetail;
