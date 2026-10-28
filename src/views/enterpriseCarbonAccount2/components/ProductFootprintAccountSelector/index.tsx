import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  Modal,
  Pagination,
  Select,
  Table,
  type TableColumnsType,
  type TableProps,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import NumberInputTableCell from '@/components/NumberInputTableCell';
import { isNumberInputWithinDigitLimits } from '@/utils/limitNumberInputDigits';

import styles from './index.module.less';
import { getAccountReferList, getProductReferList } from './service';
import {
  ProductReferResp,
  ProductFootprintAccountId,
  ProductFootprintAccountRow,
  ProductFootprintAccountSelection,
  ProductFootprintAccountSelectorProps,
} from './types';

export type {
  ProductFootprintAccountRow,
  ProductFootprintAccountSelection,
  ProductFootprintAccountSelectorProps,
} from './types';

const PAGE_SIZE = 8;
const PRODUCT_PAGE_SIZE = 10000000;

export const getFactorUnitDenominator = (factorUnit?: string) => {
  const unitParts = factorUnit?.split('/') || [];
  return unitParts[unitParts.length - 1]?.trim() || '';
};
const ACTIVITY_DATA_DIGIT_LIMITS = {
  maxDecimals: 10,
  maxIntegerDigits: 9,
} as const;

const ProductFootprintAccountSelector = ({
  open,
  selectionMode,
  onCancel,
  onConfirm,
}: ProductFootprintAccountSelectorProps) => {
  const [productId, setProductId] = useState<number>();
  const [products, setProducts] = useState<ProductReferResp[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [rows, setRows] = useState<ProductFootprintAccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<
    ProductFootprintAccountId[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<
    ProductFootprintAccountSelection[]
  >([]);

  useEffect(() => {
    if (open) return;
    setProductId(undefined);
    setProducts([]);
    setProductLoading(false);
    setPageNum(1);
    setRows([]);
    setTotal(0);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setConfirming(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();
    let cancelled = false;
    setProductLoading(true);
    getProductReferList(
      {
        pageNum: 1,
        pageSize: PRODUCT_PAGE_SIZE,
      },
      controller.signal,
    )
      .then(({ data }) => {
        if (!cancelled) setProducts(data.data?.rows || []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setProductLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    getAccountReferList(
      {
        pageNum,
        pageSize: PAGE_SIZE,
        productId,
      },
      controller.signal,
    )
      .then(({ data }) => {
        if (cancelled) return;
        const nextRows = data.data?.rows || [];
        setRows(nextRows);
        setTotal(data.data?.total || 0);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, pageNum, productId]);

  const productOptions = useMemo(
    () =>
      products.map(product => ({
        label: product.productName || '-',
        productName: product.productName,
        value: product.id as number,
      })),
    [products],
  );

  const selectedKeySet = useMemo(
    () => new Set(selectedRowKeys),
    [selectedRowKeys],
  );
  const hasInvalidActivityData = useMemo(
    () =>
      selectedRows.some(
        row =>
          !isNumberInputWithinDigitLimits(
            row.activityData,
            ACTIVITY_DATA_DIGIT_LIMITS,
          ),
      ),
    [selectedRows],
  );

  const tableRows = useMemo(
    () =>
      rows.map(
        row =>
          selectedRows.find(selectedRow => selectedRow.id === row.id) || row,
      ),
    [rows, selectedRows],
  );

  const columns = useMemo<TableColumnsType<ProductFootprintAccountRow>>(
    () => [
      {
        title: I18N.enterpriseCarbonAccount2.productName,
        dataIndex: 'productName',
        ellipsis: true,
        render: value => value || '-',
      },
      {
        title: I18N.enterpriseCarbonAccount2.functionalUnit,
        dataIndex: 'accountName',
        ellipsis: true,
        render: value => value || '-',
      },
      {
        title: I18N.enterpriseCarbonAccount2.unitEmission,
        dataIndex: 'factor',
        ellipsis: true,
        render: value => value ?? '-',
      },
      {
        title: I18N.enterpriseCarbonAccount2.accountingResultUnit,
        dataIndex: 'factorUnit',
        ellipsis: true,
        render: value => value || '-',
      },
      {
        title: I18N.enterpriseCarbonAccount2.productQuantity,
        key: 'activityData',
        width: 190,
        render: (_value, record) => (
          <div className={styles.quantityCell}>
            <NumberInputTableCell
              stringMode
              controls={false}
              min={0}
              maxDecimals={ACTIVITY_DATA_DIGIT_LIMITS.maxDecimals}
              maxIntegerDigits={ACTIVITY_DATA_DIGIT_LIMITS.maxIntegerDigits}
              digitLimitMode='validate'
              digitLimitMessage={
                I18N.carbonAgent.enterpriseCarbonActivityDataDigitLimit
              }
              disabled={
                record.id === undefined || !selectedKeySet.has(record.id)
              }
              placeholder={I18N.enterpriseCarbonAccount2.pleaseEnter}
              value={record.activityData}
              onChange={value => {
                if (record.id === undefined) return;
                setRows(previous =>
                  previous.map(row =>
                    row.id === record.id
                      ? { ...row, activityData: value }
                      : row,
                  ),
                );
                setSelectedRows(previous =>
                  previous.map(row =>
                    row.id === record.id
                      ? { ...row, activityData: value }
                      : row,
                  ),
                );
              }}
            />
            <span className={styles.quantityUnit}>
              {getFactorUnitDenominator(record.factorUnit)}
            </span>
          </div>
        ),
      },
    ],
    [selectedKeySet],
  );

  const rowSelection: TableProps<ProductFootprintAccountRow>['rowSelection'] = {
    type: selectionMode === 'single' ? 'radio' : 'checkbox',
    preserveSelectedRowKeys: true,
    selectedRowKeys,
    onChange: (keys, selected) => {
      const nextKeys = keys as ProductFootprintAccountId[];
      setSelectedRowKeys(nextKeys);
      setSelectedRows(previous =>
        nextKeys.flatMap(key => {
          const row =
            selected.find(item => item.id === key) ||
            previous.find(item => item.id === key);
          return row
            ? [{ ...row, activityData: row.activityData ?? null }]
            : [];
        }),
      );
    },
  };

  const handleConfirm = async () => {
    if (!selectedRows.length || hasInvalidActivityData) return;
    setConfirming(true);
    try {
      await onConfirm(selectedRows);
      onCancel();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      className={styles.modal}
      open={open}
      width={1120}
      footer={null}
      closable={false}
      destroyOnClose
      maskClosable={false}
      onCancel={confirming ? undefined : onCancel}
    >
      <div className={styles.header}>
        <h2>{I18N.enterpriseCarbonAccount2.selectProductFootprintResult}</h2>
        <div className={styles.headerActions}>
          <Select<number>
            allowClear
            showSearch
            value={productId}
            loading={productLoading}
            placeholder={I18N.components.search}
            suffixIcon={<SearchOutlined />}
            optionLabelProp='productName'
            options={productOptions}
            filterOption={(input, option) =>
              String(option?.productName || '')
                .toLocaleLowerCase()
                .includes(input.trim().toLocaleLowerCase())
            }
            onChange={value => {
              setProductId(value);
              setPageNum(1);
            }}
          />
          <CloseOutlined
            className={styles.closeIcon}
            onClick={confirming ? undefined : onCancel}
          />
        </div>
      </div>
      <div className={styles.referenceModeCard}>
        <div className={styles.referenceModeTitle}>
          {I18N.carbonFootprint3.referenceResult}
        </div>
        <div className={styles.referenceModeDesc}>
          {I18N.carbonFootprint3.referenceResultDesc}
        </div>
        <div className={styles.referenceModeCheck} aria-hidden='true'>
          <CheckOutlined />
        </div>
      </div>
      <Table<ProductFootprintAccountRow>
        className={styles.table}
        rowKey='id'
        loading={loading}
        columns={columns}
        dataSource={tableRows}
        rowSelection={rowSelection}
        pagination={false}
      />
      <div className={styles.footer}>
        <Pagination
          current={pageNum}
          pageSize={PAGE_SIZE}
          total={total}
          showSizeChanger={false}
          showTotal={value =>
            I18N.template(I18N.enterpriseCarbonAccount2.totalRecords, {
              val1: value,
            })
          }
          onChange={setPageNum}
        />
        <div className={styles.footerActions}>
          <Button disabled={confirming} onClick={onCancel}>
            {I18N.carbonFootprint.cancel}
          </Button>
          <Button
            type='primary'
            loading={confirming}
            disabled={!selectedRows.length || hasInvalidActivityData}
            onClick={handleConfirm}
          >
            {selectionMode === 'multiple'
              ? I18N.carbonproduct.confirmAssociation
              : I18N.carbonFootprint.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductFootprintAccountSelector;
