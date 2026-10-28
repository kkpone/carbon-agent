import { useMemo } from 'react';

import I18N from '@src/lang/I18N';
import style from '../../index.module.less';
import { asRecord, getOptionalScalarString, getOptionalString } from './utils';

type ProductCarbonModelFactor = {
  applyYear?: string;
  applyYearEnd?: string;
  cValue?: string;
  countries?: string;
  description?: string;
  id?: string;
  institution?: string;
  name?: string;
  source?: string;
  sourceLevel?: string;
  specification?: string;
  unit?: string;
  year?: string;
};

type ProductCarbonModelResultData = {
  factors: ProductCarbonModelFactor[];
  total: number;
};

const parseNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const parseJsonRecord = (result: string) => {
  try {
    return asRecord(JSON.parse(result));
  } catch {
    return {};
  }
};

const normalizeProductCarbonModelFactor = (
  item: unknown,
): ProductCarbonModelFactor | undefined => {
  const itemRecord = asRecord(item);
  const name = getOptionalString(itemRecord.name);
  const cValue = getOptionalScalarString(itemRecord.cValue);
  const unit = getOptionalScalarString(itemRecord.unit);

  if (!name && !cValue && !unit) {
    return undefined;
  }

  return {
    applyYear: getOptionalScalarString(itemRecord.applyYear),
    applyYearEnd: getOptionalScalarString(itemRecord.applyYearEnd),
    cValue,
    countries: getOptionalScalarString(itemRecord.countries),
    description: getOptionalString(itemRecord.description),
    id: getOptionalScalarString(itemRecord.id),
    institution: getOptionalString(itemRecord.institution),
    name,
    source: getOptionalString(itemRecord.source),
    sourceLevel: getOptionalString(itemRecord.sourceLevel),
    specification: getOptionalString(itemRecord.specification),
    unit,
    year: getOptionalScalarString(itemRecord.year),
  };
};

export const parseProductCarbonModelAgentResult = (
  result: string,
): ProductCarbonModelResultData | null => {
  const root = parseJsonRecord(result);
  const rows = Array.isArray(root.rows) ? root.rows : [];
  const factors = rows
    .map(normalizeProductCarbonModelFactor)
    .filter(Boolean) as ProductCarbonModelFactor[];

  if (!factors.length) {
    return null;
  }

  return {
    factors,
    total: parseNumber(root.total) || factors.length,
  };
};

const getFactorValue = (factor: ProductCarbonModelFactor) => {
  const value = [factor.cValue, factor.unit].filter(Boolean).join(' ');

  return value || I18N.carbonAgent.noFactorValue;
};

const getApplyYearText = (factor: ProductCarbonModelFactor) => {
  const startYear = factor.applyYear || factor.year;
  const endYear = factor.applyYearEnd;

  if (startYear && endYear && startYear !== endYear) {
    return `${startYear} - ${endYear}`;
  }

  return startYear || endYear;
};

const getFactorMetaItems = (factor: ProductCarbonModelFactor) => {
  const applyYearText = getApplyYearText(factor);

  return [
    factor.countries
      ? `${I18N.carbonAgent.regionPrefix}${factor.countries}`
      : undefined,
    factor.sourceLevel
      ? `${I18N.carbonAgent.levelPrefix}${factor.sourceLevel}`
      : undefined,
    applyYearText
      ? `${I18N.carbonAgent.yearPrefix}${applyYearText}`
      : undefined,
    factor.institution
      ? `${I18N.carbonAgent.orgPrefix}${factor.institution}`
      : undefined,
    factor.source
      ? `${I18N.carbonAgent.sourcePrefix}${factor.source}`
      : undefined,
    factor.specification
      ? `${I18N.carbonAgent.specPrefix}${factor.specification}`
      : undefined,
    factor.id ? `${I18N.carbonAgent.factorIdPrefix}${factor.id}` : undefined,
  ].filter(Boolean) as string[];
};

const getFactorKey = (factor: ProductCarbonModelFactor, index: number) =>
  factor.id || `${factor.name || 'factor'}-${index}`;

const ProductCarbonModelAgentResult = ({ result }: { result: string }) => {
  const modelResult = useMemo(
    () => parseProductCarbonModelAgentResult(result),
    [result],
  );

  if (!modelResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  return (
    <div className={style.normalFactorResult}>
      <div className={style.normalFactorResultHead}>
        <span>{I18N.carbonAgent.productCarbonModelFactorResult}</span>
        <b>
          {I18N.template(I18N.carbonAgent.totalCountItems, {
            val1: modelResult.total,
          })}
          {modelResult.total > modelResult.factors.length
            ? I18N.template(I18N.carbonAgent.showTopItems, {
                val1: modelResult.factors.length,
              })
            : ''}
        </b>
      </div>
      <div className={style.normalFactorList}>
        {modelResult.factors.map((factor, index) => (
          <article
            className={style.normalFactorItem}
            key={getFactorKey(factor, index)}
          >
            <div className={style.normalFactorMain}>
              <div className={style.normalFactorTitleBlock}>
                <h4>{factor.name || I18N.carbonAgent.unnamedFactor}</h4>
              </div>
              <strong
                className={
                  factor.cValue
                    ? style.normalFactorValue
                    : style.normalFactorValueMuted
                }
              >
                {getFactorValue(factor)}
              </strong>
            </div>
            <div className={style.normalFactorMetaLine}>
              {getFactorMetaItems(factor).map(meta => (
                <span key={meta}>{meta}</span>
              ))}
            </div>
            {factor.description ? (
              <p className={style.normalFactorDescription}>
                {I18N.carbonAgent.descPrefix}
                {factor.description}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProductCarbonModelAgentResult;
