import I18N from '@src/lang/I18N';
import { Empty, Select, Spin } from 'antd';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import {
  getProductEmissionCompare,
  getProductEmissionCompareProducts,
} from '../../service';
import {
  ProductEmissionCompareProduct,
  ProductEmissionCompareRecord,
  ProductEmissionCompareResult,
  ProductEmissionCompareStage,
} from '../../type';
import { formatPlainNumber } from '../../utils';

type ProductEmissionCompareProps = {
  supplierId: number;
};

type TooltipParam = {
  dataIndex?: number;
  marker?: string;
  seriesName?: string;
  value?: number | string;
};

const STAGE_COLORS: Record<string, string> = {
  rawMaterial: '#00A889',
  manufacturing: '#5AC8BC',
  distribution: '#83D4DE',
  employ: '#C9CDD1',
  abandon: '#E1E4E8',
};

const FALLBACK_STAGE_COLORS = [
  '#00A889',
  '#5AC8BC',
  '#83D4DE',
  '#C9CDD1',
  '#E1E4E8',
];

const MAX_AXIS_LABEL_LENGTH = 14;

const escapeHtml = (value?: string | number | null) =>
  `${value ?? '-'}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toNumber = (value?: number | string | null) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatEmission = (value?: number | string | null) =>
  formatPlainNumber(toNumber(value));

const getStageColor = (stage: ProductEmissionCompareStage, index: number) =>
  STAGE_COLORS[stage.key] ||
  FALLBACK_STAGE_COLORS[index % FALLBACK_STAGE_COLORS.length];

const getProductLabel = (product: ProductEmissionCompareProduct) =>
  [product.purchaseGoodsName, product.specification]
    .filter(Boolean)
    .join(' / ');

const getAxisLabel = (record: ProductEmissionCompareRecord) =>
  [record.fillName, record.compareTime].filter(Boolean).join('&') || '-';

const getTooltipTitleHtml = (record: ProductEmissionCompareRecord) => {
  const title = record.fillName
    ? `<div>${escapeHtml(record.fillName)}</div>`
    : '';
  const time = record.compareTime
    ? `<div class="product-emission-compare-tooltip-time">${escapeHtml(
        record.compareTime,
      )}</div>`
    : '';

  return title || time ? `${title}${time}` : '-';
};

const ellipsisLabel = (value: string) =>
  value.length > MAX_AXIS_LABEL_LENGTH
    ? `${value.slice(0, MAX_AXIS_LABEL_LENGTH)}...`
    : value;

const ProductEmissionCompare: FC<ProductEmissionCompareProps> = ({
  supplierId,
}) => {
  const [products, setProducts] = useState<ProductEmissionCompareProduct[]>([]);

  const [selectedPurchaseGoodsId, setSelectedPurchaseGoodsId] =
    useState<number>();

  const [compareData, setCompareData] =
    useState<ProductEmissionCompareResult>();

  const [productsLoading, setProductsLoading] = useState(false);

  const [compareLoading, setCompareLoading] = useState(false);

  const records = compareData?.records || [];

  const stages =
    (compareData?.stages?.length || 0) > 0
      ? compareData?.stages || []
      : records[0]?.stages || [];

  const unit = compareData?.unit || 'kgCO₂e';

  const productOptions = useMemo(
    () =>
      products.map(product => ({
        value: product.purchaseGoodsId,
        label: getProductLabel(product) || '-',
      })),
    [products],
  );

  const chartOption = useMemo<EChartsOption>(() => {
    const axisLabels = records.map(record => getAxisLabel(record));

    return {
      color: stages.map(getStageColor),
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: params => {
          const paramList = Array.isArray(params)
            ? (params as TooltipParam[])
            : [params as TooltipParam];
          const firstParam = paramList[0];
          const record = records[Number(firstParam?.dataIndex)];

          if (!record) {
            return '';
          }

          const rows = stages
            .map((stage, index) => {
              const recordStage = record.stages?.find(
                item => item.key === stage.key,
              );
              const value = formatEmission(recordStage?.emission);
              const color = getStageColor(stage, index);

              return `<div class="product-emission-compare-tooltip-row">
                <span>
                  <span style="display:inline-block;margin-right:4px;border-radius:50%;width:8px;height:8px;background:${color};"></span>
                  ${escapeHtml(stage.name)}
                </span>
                <span class="product-emission-compare-tooltip-value">${value}${escapeHtml(
                unit,
              )}</span>
              </div>`;
            })
            .join('');

          return `<div class="product-emission-compare-tooltip">
            <div class="product-emission-compare-tooltip-title">
              ${getTooltipTitleHtml(record)}
              ${
                record.compareTimeTypeDesc
                  ? `<div class="product-emission-compare-tooltip-time">${escapeHtml(
                      record.compareTimeTypeDesc,
                    )}</div>`
                  : ''
              }
            </div>
            ${rows}
          </div>`;
        },
      },
      legend: {
        top: 8,
        left: 'center',
        itemWidth: 14,
        itemHeight: 8,
        textStyle: {
          color: '#343A40',
          fontSize: 12,
        },
        selected: stages.reduce<Record<string, boolean>>((selected, stage) => {
          selected[stage.name] = stage.defaultShow !== false;
          return selected;
        }, {}),
      },
      grid: {
        top: 56,
        left: 24,
        right: 24,
        bottom: 36,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: axisLabels,
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: '#D2D6DA',
          },
        },
        axisLabel: {
          color: '#666F77',
          fontSize: 12,
          interval: 0,
          hideOverlap: true,
          formatter: value => ellipsisLabel(String(value)),
        },
      },
      yAxis: {
        type: 'value',
        name: I18N.template(I18N.supplyChain2.emissionsUnit, { val1: unit }),
        nameTextStyle: {
          color: '#666F77',
          fontSize: 12,
          align: 'left',
        },
        axisLabel: {
          color: '#666F77',
          fontSize: 12,
          formatter: value => formatEmission(value),
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#DDE5EA',
          },
        },
      },
      series: stages.map((stage: ProductEmissionCompareStage, index) => ({
        name: stage.name,
        type: 'bar',
        stack: 'emission',
        barWidth: 16,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: getStageColor(stage, index),
        },
        data: records.map(record => {
          const recordStage = record.stages?.find(
            item => item.key === stage.key,
          );
          return toNumber(recordStage?.emission);
        }),
      })),
    };
  }, [records, stages, unit]);

  useEffect(() => {
    let ignore = false;

    setProductsLoading(true);
    setProducts([]);
    setSelectedPurchaseGoodsId(undefined);
    setCompareData(undefined);

    getProductEmissionCompareProducts({ supplierId })
      .then(({ data }) => {
        if (ignore) {
          return;
        }

        const nextProducts = data.data || [];
        setProducts(nextProducts);
        setSelectedPurchaseGoodsId(nextProducts[0]?.purchaseGoodsId);
      })
      .finally(() => {
        if (!ignore) {
          setProductsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [supplierId]);

  useEffect(() => {
    if (isNil(selectedPurchaseGoodsId)) {
      setCompareData(undefined);
      return;
    }

    let ignore = false;

    setCompareData(undefined);
    setCompareLoading(true);
    getProductEmissionCompare({
      supplierId,
      purchaseGoodsId: selectedPurchaseGoodsId,
    })
      .then(({ data }) => {
        if (!ignore) {
          setCompareData(data.data);
        }
      })
      .finally(() => {
        if (!ignore) {
          setCompareLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [supplierId, selectedPurchaseGoodsId]);

  const hasProducts = products.length > 0;

  const hasRecords = records.length > 0;

  return (
    <div className={styles.comparePanel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          {I18N.supplyChain2.productEmissionCompareAnalysis}
        </div>
        <Select
          className={styles.productSelect}
          loading={productsLoading}
          disabled={!hasProducts}
          placeholder={I18N.supplyChain2.pleaseSelectProcurementProduct}
          options={productOptions}
          value={selectedPurchaseGoodsId}
          showSearch
          optionFilterProp='label'
          onChange={(value: number) => setSelectedPurchaseGoodsId(value)}
        />
      </div>
      <Spin spinning={productsLoading || compareLoading}>
        {!hasProducts && !productsLoading ? (
          <div className={styles.empty}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={I18N.supplyChain2.noComparableProcurementProduct}
            />
          </div>
        ) : hasRecords ? (
          <ReactECharts
            className={styles.chart}
            option={chartOption}
            notMerge
          />
        ) : (
          <div className={styles.empty}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={I18N.supplyChain2.noProductEmissionCompareData}
            />
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ProductEmissionCompare;
