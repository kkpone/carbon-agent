import {
  CloudUploadOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Upload,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import { baseUrl } from '@/api/request';
import { IconFont } from '@/components/LcaIconFont';
import I18N from '@/lang/I18N';
import { PageTypeInfo } from '@/router/utils/enums';
import type { Dicts } from '@/utils';
import { Toast } from '@/utils';
import { UPLOAD_FILES_RANDOM_NAME_URL } from '@/utils/const';
import { getToken } from '@/utils/cookie';
import PrecursorDefaultValuePicker from '@/views/cbam/ReportForm/Info/ProductData/OutsourcedPrecursor/Info/components/PrecursorEmissionTable/PrecursorDefaultValuePicker';
import { useCbamEnums } from '@/views/cbam/hook';

import { PrecursorBenchmarkModal } from './PrecursorBenchmarkModal';
import {
  PrecursorEditorModal,
  PrecursorEditorValue,
} from './PrecursorEditorModal';
import style from './index.module.less';
import {
  getAuthCarbonTaxDetail,
  getCarbonTaxDetail,
  getCarbonTaxEmissionOptions,
  getCarbonTaxPrecursorOptions,
  getCarbonTaxProductOptions,
  postCarbonTaxAdd,
  putCarbonTaxEdit,
} from '../../../service';
import {
  CarbonTaxEmissionOption,
  CarbonTaxPrecursorOption,
  CarbonTaxProductOption,
  CarbonTaxResp,
} from '../../../type';

const { add, edit, show } = PageTypeInfo;
const ACTUAL_VALUE = 1;
const DEFAULT_VALUE = 2;
const DEFAULT_LIBRARY = 3;
const BMG_STAR = 1;
const BMG = 2;
const UNKNOWN_ORIGIN_VALUE = 'UNKNOWN_ORIGIN';
const UNKNOWN_ORIGIN_LABELS = new Set([
  '无法确认产地',
  'Unable to confirm origin',
]);
const MAX_FILE_COUNT = 5;
const FILE_ACCEPT =
  '.png,.PNG,.jpg,.JPG,.JPEG,.jpeg,.xls,.xlsx,.XLS,.XLSX,.doc,.DOC,.docx,.DOCX,.pdf,.PDF,.rar,.RAR,.zip,.ZIP';
const PRODUCT_BENCHMARK_TIP = I18N.cbam.productBenchmarkTip;
const CBAM_ADJUSTMENT_FACTOR_TIP = I18N.cbam.cbamAdjustmentFactorTip;
const CSCFY_TIP = I18N.cbam.crossSectoralCorrectionFactorTip;
const CBAM_CERTIFICATE_PRICE_TIP = I18N.cbam.eurCbamCertificatePriceTip;
const PAID_CARBON_PRICE_TIP = I18N.cbam.paidCarbonPriceTip;

const formatDecimal = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || value === '') return '';
  const decimal = new BigNumber(value);
  if (!decimal.isFinite()) return String(value);
  const formatted = decimal.toFixed();
  return formatted.includes('.') ? formatted.replace(/\.?0+$/, '') : formatted;
};

const inputNumberFormatter = (
  value: string | number | undefined,
  info: { userTyping: boolean; input: string },
) => (info.userTyping ? info.input : formatDecimal(value));

const renderFieldLabel = (label: string, tip: string) => (
  <span>
    {label}
    <Tooltip title={tip}>
      <QuestionCircleOutlined className='iconTip' />
    </Tooltip>
  </span>
);

type PrecursorRow = PrecursorEditorValue;

const buildPrecursorKey = (row: { sourceKind?: number; sourceId?: number }) =>
  `${row.sourceKind}-${row.sourceId}`;

const buildEmissionKey = (option: CarbonTaxEmissionOption) =>
  `${option.sourceType}-${option.saleProductId || option.defaultCnId}-${
    option.year || ''
  }`;

const parseSupportFiles = (supportFile?: string): UploadFile[] => {
  if (!supportFile) return [];
  try {
    const files = JSON.parse(supportFile);
    return Array.isArray(files)
      ? files.map(file => ({
          uid: file.fileId || file.uid,
          name: file.fileName || file.name,
          url: file.fileUrl || file.url,
          status: 'done',
        }))
      : [];
  } catch (error) {
    return [];
  }
};

const serializeSupportFiles = (files: UploadFile[]) =>
  JSON.stringify(
    files
      .filter(file => file.url)
      .map(file => ({
        fileId: file.uid,
        fileName: file.name,
        fileUrl: file.url,
      })),
  );

interface CarbonTaxInfoProps {
  open: boolean;
  actionBtnType?: string;
  taxId?: number;
  cbamId?: number;
  currencyTypeEnum: Dicts[];
  countryTypeEnum: Dicts[];
  authReview?: boolean;
  onOk: () => void;
  onClose: () => void;
}

interface ValueTypeDraft {
  emissionSelection?: string;
  emissionSourceType?: number;
  emissionSourceSaleProductId?: number;
  emissionSourceDefaultCnId?: number;
  emissionSourceYear?: number;
  seeg?: number;
  productBenchmarkType?: number;
  productBenchmarkId?: number;
  productBenchmarkValue?: number;
  productRouteCode?: string;
  productRouteIndicator?: string;
}

export const CarbonTaxInfo = ({
  open,
  actionBtnType,
  taxId,
  cbamId,
  currencyTypeEnum,
  countryTypeEnum,
  authReview,
  onOk,
  onClose,
}: CarbonTaxInfoProps) => {
  const [form] = Form.useForm<CarbonTaxResp & { emissionSelection?: string }>();
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show || authReview;
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState<
    CarbonTaxProductOption[]
  >([]);
  const [emissionOptions, setEmissionOptions] = useState<
    CarbonTaxEmissionOption[]
  >([]);
  const [precursorOptions, setPrecursorOptions] = useState<
    CarbonTaxPrecursorOption[]
  >([]);
  const [precursorRows, setPrecursorRows] = useState<PrecursorRow[]>([]);
  const [precursorEditorOpen, setPrecursorEditorOpen] = useState(false);
  const [productBenchmarkSelectOpen, setProductBenchmarkSelectOpen] =
    useState(false);
  const [precursorEditorMode, setPrecursorEditorMode] = useState<
    'add' | 'edit' | 'show'
  >('add');
  const [editingPrecursor, setEditingPrecursor] = useState<PrecursorRow>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [renderVersion, setRenderVersion] = useState(0);
  const valueTypeDrafts = useRef<Partial<Record<number, ValueTypeDraft>>>({});
  const previousEmissionValueType = useRef<number>(ACTUAL_VALUE);

  const taxTypeEnum = useCbamEnums('TaxType');
  const offsetMethodEnum = useCbamEnums('OffsetMethod');

  const emissionValueType = Form.useWatch('emissionValueType', form);
  const currentProductId = Form.useWatch('saleProductId', form);
  const productCnCode = Form.useWatch('cnCode', form) as string | undefined;
  const productCountryValue = Form.useWatch('countryValue', form);
  const productCountryName = Form.useWatch('countryName', form);
  const isUnknownOrigin =
    productCountryValue === UNKNOWN_ORIGIN_VALUE ||
    (productCountryName &&
      UNKNOWN_ORIGIN_LABELS.has(productCountryName.trim()));
  const localizedProductCountryName =
    (isUnknownOrigin
      ? I18N.cbam.unknownOrigin
      : countryTypeEnum.find(item => item.dictValue === productCountryValue)
          ?.dictLabel || productCountryName) || '-';
  const productBenchmarkId = Form.useWatch('productBenchmarkId', form);
  const productBenchmarkType = Form.useWatch('productBenchmarkType', form);
  const productBenchmarkValue = Form.useWatch('productBenchmarkValue', form);
  const productRouteCode = Form.useWatch('productRouteCode', form);
  const productRouteIndicator = Form.useWatch('productRouteIndicator', form);
  const currencyType = Form.useWatch('currencyType', form);
  const emissionSourceDefaultCnId = Form.useWatch(
    'emissionSourceDefaultCnId',
    form,
  );
  const emissionSourceYear = Form.useWatch('emissionSourceYear', form);
  const currentProduct = productOptions.find(
    item => item.saleProductId === currentProductId,
  );
  const currencyUnit =
    currencyTypeEnum.find(item => item.dictValue === currencyType)
      ?.relatedValue || '-';

  useEffect(() => {
    if (!open || !isAdd || currencyType || currencyTypeEnum.length === 0) {
      return;
    }
    const euro = currencyTypeEnum.find(
      item => item.relatedValue?.trim().toUpperCase() === 'EUR',
    );
    if (euro) {
      form.setFieldValue('currencyType', euro.dictValue);
    }
  }, [currencyType, currencyTypeEnum, form, isAdd, open]);

  useEffect(() => {
    if (!currentProductId || form.getFieldValue('countryValue')) return;
    const product = productOptions.find(
      item => item.saleProductId === currentProductId,
    );
    if (!product) return;
    form.setFieldsValue({
      countryValue: product.countryValue,
      countryCode: product.countryCode,
      countryName: product.countryName,
    });
  }, [currentProductId, form, productOptions]);

  let title = I18N.cbam.viewProductCarbonTax;
  if (actionBtnType === add) title = I18N.cbam.addProductCarbonTax;
  if (actionBtnType === edit) title = I18N.cbam.editProductCarbonTax;
  let productBenchmarkLabel = I18N.cbam.productBenchmark;
  if (productBenchmarkType === BMG) {
    productBenchmarkLabel = I18N.cbam.defaultProductBenchmark;
  } else if (productBenchmarkType === BMG_STAR) {
    productBenchmarkLabel = I18N.cbam.actualProductBenchmark;
  }
  const productBenchmarkSelectionLabel = productBenchmarkId
    ? `${
        productBenchmarkType === BMG
          ? I18N.cbam.defaultValue
          : I18N.cbam.actualValue
      }=${formatDecimal(productBenchmarkValue) || '-'} / ${
        [productRouteCode, productRouteIndicator].filter(Boolean).join(' / ') ||
        '-'
      }`
    : '';
  const productBenchmarkSelectionDetail = productBenchmarkId ? (
    <div>
      <div>
        {I18N.cbam.benchmarkValueType}:
        {productBenchmarkType === BMG
          ? I18N.cbam.defaultValue
          : I18N.cbam.actualValue}
      </div>
      <div>
        {I18N.cbam.benchmarkValue}:{' '}
        {formatDecimal(productBenchmarkValue) || '-'}
      </div>
      <div>
        {I18N.cbam.productionRouteCode}: {productRouteCode || '-'}
      </div>
      <div>
        {I18N.cbam.productionRouteDescription}:{productRouteIndicator || '-'}
      </div>
    </div>
  ) : undefined;

  const loadEmissionOptions = async (
    saleProductId: number,
    valueType: number,
    selectCurrent = false,
  ) => {
    if (!cbamId) return;
    const { data } = await getCarbonTaxEmissionOptions({
      cbamId,
      saleProductId,
      emissionValueType: valueType,
    });
    const rows = data?.data || [];
    setEmissionOptions(rows);
    if (selectCurrent) {
      const preferred =
        rows.find(item => item.saleProductId === saleProductId) || rows[0];
      if (preferred) {
        form.setFieldsValue({
          emissionSelection: buildEmissionKey(preferred),
          emissionSourceType: preferred.sourceType,
          emissionSourceSaleProductId: preferred.saleProductId,
          emissionSourceDefaultCnId: preferred.defaultCnId,
          emissionSourceYear: preferred.year,
          seeg: preferred.emissionValue,
        });
      }
    }
  };

  const loadPrecursorOptions = async (saleProductId: number) => {
    if (!cbamId) return [];
    const { data } = await getCarbonTaxPrecursorOptions({
      cbamId,
      saleProductId,
    });
    const rows = (data?.data || []).map(item => ({
      ...item,
      precursorNameSnapshot: item.precursorName,
      rowKey: buildPrecursorKey(item),
    }));
    setPrecursorOptions(rows);
    return rows;
  };

  const handleEmissionValueTypeChange = async (valueType: number) => {
    const previousValueType = previousEmissionValueType.current;
    const currentValues = form.getFieldsValue();
    valueTypeDrafts.current[previousValueType] = {
      emissionSelection: currentValues.emissionSelection,
      emissionSourceType: currentValues.emissionSourceType,
      emissionSourceSaleProductId: currentValues.emissionSourceSaleProductId,
      emissionSourceDefaultCnId: currentValues.emissionSourceDefaultCnId,
      emissionSourceYear: currentValues.emissionSourceYear,
      seeg: currentValues.seeg,
      productBenchmarkType: currentValues.productBenchmarkType,
      productBenchmarkId: currentValues.productBenchmarkId,
      productBenchmarkValue: currentValues.productBenchmarkValue,
      productRouteCode: currentValues.productRouteCode,
      productRouteIndicator: currentValues.productRouteIndicator,
    };

    const draft = valueTypeDrafts.current[valueType];
    const benchmarkType =
      valueType === ACTUAL_VALUE
        ? BMG_STAR
        : draft?.productBenchmarkType || BMG;
    form.setFieldsValue({
      emissionSelection: draft?.emissionSelection,
      emissionSourceType: draft?.emissionSourceType,
      emissionSourceSaleProductId: draft?.emissionSourceSaleProductId,
      emissionSourceDefaultCnId: draft?.emissionSourceDefaultCnId,
      emissionSourceYear: draft?.emissionSourceYear,
      seeg: draft?.seeg,
      productBenchmarkType: benchmarkType,
      productBenchmarkId: draft?.productBenchmarkId,
      productBenchmarkValue: draft?.productBenchmarkValue,
      productRouteCode: draft?.productRouteCode,
      productRouteIndicator: draft?.productRouteIndicator,
    });
    previousEmissionValueType.current = valueType;
    if (valueType === DEFAULT_VALUE) {
      setEmissionOptions([]);
      return;
    }
    if (currentProductId) {
      await Promise.all([
        loadEmissionOptions(
          currentProductId,
          ACTUAL_VALUE,
          !draft?.emissionSelection,
        ),
        loadPrecursorOptions(currentProductId),
      ]);
    }
  };

  const handleProductBenchmarkTypeChange = async (benchmarkType: number) => {
    form.setFieldsValue({
      productBenchmarkType: benchmarkType,
      productBenchmarkId: undefined,
      productBenchmarkValue: undefined,
      productRouteCode: undefined,
      productRouteIndicator: undefined,
    });
    if (currentProductId && benchmarkType === BMG_STAR) {
      await loadPrecursorOptions(currentProductId);
    }
  };

  const resetState = () => {
    form.resetFields();
    valueTypeDrafts.current = {};
    previousEmissionValueType.current = ACTUAL_VALUE;
    setProductOptions([]);
    setEmissionOptions([]);
    setPrecursorOptions([]);
    setPrecursorRows([]);
    setPrecursorEditorOpen(false);
    setProductBenchmarkSelectOpen(false);
    setEditingPrecursor(undefined);
    setFileList([]);
  };

  const closeDrawer = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    if (isAdd) {
      valueTypeDrafts.current = {};
      previousEmissionValueType.current = ACTUAL_VALUE;
      form.setFieldsValue({
        cbamId,
        emissionValueType: ACTUAL_VALUE,
        productBenchmarkType: BMG_STAR,
        cbamAdjustmentFactor: 97.5,
        cscfy: 1,
        exchangeRate: 1,
        certificatePriceEur: 0,
        paidCarbonPrice: 0,
      });
    }
    if (!authReview && cbamId) {
      getCarbonTaxProductOptions(cbamId).then(({ data }) => {
        const rows = data?.data || [];
        const selectedProduct = rows.find(
          item => item.saleProductId === form.getFieldValue('saleProductId'),
        );
        if (selectedProduct && !form.getFieldValue('countryValue')) {
          form.setFieldsValue({
            countryValue: selectedProduct.countryValue,
            countryCode: selectedProduct.countryCode,
            countryName: selectedProduct.countryName,
          });
        }
        setProductOptions(old => {
          const snapshot = old.find(
            item => item.saleProductId === form.getFieldValue('saleProductId'),
          );
          if (
            snapshot &&
            !rows.some(item => item.saleProductId === snapshot.saleProductId)
          ) {
            return [snapshot, ...rows];
          }
          return rows;
        });
      });
    }
    if (!isAdd && taxId) {
      const detailApi = authReview
        ? getAuthCarbonTaxDetail
        : getCarbonTaxDetail;
      setLoading(true);
      detailApi(taxId)
        .then(async ({ data }) => {
          const detail = data?.data || {};
          const detailValueType = detail.emissionValueType || ACTUAL_VALUE;
          const defaultBenchmarkType =
            detailValueType === ACTUAL_VALUE ? BMG_STAR : BMG;
          const benchmarkTypeAllowed =
            detail.productBenchmarkType === BMG_STAR ||
            (detailValueType === DEFAULT_VALUE &&
              detail.productBenchmarkType === BMG);
          const detailBenchmarkType = benchmarkTypeAllowed
            ? detail.productBenchmarkType
            : defaultBenchmarkType;
          const savedPrecursors = (detail.precursorList || []).map(item => ({
            ...item,
            precursorName: item.precursorNameSnapshot,
            rowKey: buildPrecursorKey(item),
          }));
          form.setFieldsValue({
            ...detail,
            productBenchmarkType: detailBenchmarkType,
            productBenchmarkId: benchmarkTypeAllowed
              ? detail.productBenchmarkId
              : undefined,
            productBenchmarkValue: benchmarkTypeAllowed
              ? detail.productBenchmarkValue
              : undefined,
            productRouteCode: benchmarkTypeAllowed
              ? detail.productRouteCode
              : undefined,
            productRouteIndicator: benchmarkTypeAllowed
              ? detail.productRouteIndicator
              : undefined,
            emissionSelection: `${detail.emissionSourceType}-${
              detail.emissionSourceSaleProductId ||
              detail.emissionSourceDefaultCnId
            }-${detail.emissionSourceYear || ''}`,
          });
          previousEmissionValueType.current = detailValueType;
          valueTypeDrafts.current = {
            [detailValueType]: {
              emissionSelection: `${detail.emissionSourceType}-${
                detail.emissionSourceSaleProductId ||
                detail.emissionSourceDefaultCnId
              }-${detail.emissionSourceYear || ''}`,
              emissionSourceType: detail.emissionSourceType,
              emissionSourceSaleProductId: detail.emissionSourceSaleProductId,
              emissionSourceDefaultCnId: detail.emissionSourceDefaultCnId,
              emissionSourceYear: detail.emissionSourceYear,
              seeg: detail.seeg,
              productBenchmarkType: detailBenchmarkType,
              productBenchmarkId: benchmarkTypeAllowed
                ? detail.productBenchmarkId
                : undefined,
              productBenchmarkValue: benchmarkTypeAllowed
                ? detail.productBenchmarkValue
                : undefined,
              productRouteCode: benchmarkTypeAllowed
                ? detail.productRouteCode
                : undefined,
              productRouteIndicator: benchmarkTypeAllowed
                ? detail.productRouteIndicator
                : undefined,
            },
          };
          const { saleProductId } = detail;
          if (saleProductId) {
            setProductOptions(old => {
              if (old.some(item => item.saleProductId === saleProductId)) {
                return old;
              }
              return [
                {
                  saleProductId,
                  productName:
                    detail.productNameSnapshot ||
                    detail.saleProductName ||
                    `${I18N.cbam.productFallback}${detail.saleProductId}`,
                  cnCode: detail.cnCode,
                  countryValue: detail.countryValue,
                  countryCode: detail.countryCode,
                  countryName: detail.countryName,
                  productOutput: detail.productOutput,
                },
                ...old,
              ];
            });
          }
          setFileList(parseSupportFiles(detail.supportFile));
          setPrecursorRows(savedPrecursors);
          if (!authReview && detail.saleProductId) {
            const [, loadedPrecursorOptions] = await Promise.all([
              detail.emissionValueType === ACTUAL_VALUE
                ? loadEmissionOptions(
                    detail.saleProductId,
                    detail.emissionValueType,
                  )
                : Promise.resolve(),
              detail.productBenchmarkType === BMG_STAR
                ? loadPrecursorOptions(detail.saleProductId)
                : Promise.resolve([]),
            ]);
            const optionMap = new Map(
              loadedPrecursorOptions.map(item => [item.rowKey, item] as const),
            );
            setPrecursorRows(
              savedPrecursors.map(item => {
                const option = optionMap.get(item.rowKey);
                return {
                  ...option,
                  ...item,
                  defaultCnId: item.defaultCnId || option?.defaultCnId,
                  cnName: item.cnName || option?.cnName,
                  countryValue: item.countryValue || option?.countryValue,
                  countryCode: item.countryCode || option?.countryCode,
                  countryName: item.countryName || option?.countryName,
                };
              }),
            );
          }
          if (
            detail.emissionSourceType &&
            detail.emissionValueType === ACTUAL_VALUE
          ) {
            const savedEmission: CarbonTaxEmissionOption = {
              sourceType: detail.emissionSourceType,
              saleProductId: detail.emissionSourceSaleProductId,
              defaultCnId: detail.emissionSourceDefaultCnId,
              year: detail.emissionSourceYear,
              productName: detail.productNameSnapshot || detail.saleProductName,
              cnCode: detail.cnCode,
              emissionValue: detail.seeg,
              label: `${
                detail.emissionSourceType === 1
                  ? I18N.cbam.currentReport
                  : I18N.cbam.historicalReport
              } - ${
                detail.productNameSnapshot || detail.saleProductName || '-'
              }${
                detail.emissionSourceYear
                  ? ` - ${detail.emissionSourceYear}`
                  : ''
              }`,
            };
            setEmissionOptions(old =>
              old.some(
                item =>
                  buildEmissionKey(item) === buildEmissionKey(savedEmission),
              )
                ? old
                : [savedEmission, ...old],
            );
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, taxId, actionBtnType]);

  const openPrecursorEditor = (
    row: PrecursorRow | undefined,
    mode: 'add' | 'edit' | 'show',
  ) => {
    setEditingPrecursor(row);
    setPrecursorEditorMode(mode);
    setPrecursorEditorOpen(true);
  };

  const selectedPrecursors =
    productBenchmarkType === BMG_STAR ? precursorRows : [];
  const preview = useMemo(() => {
    const values = form.getFieldsValue();
    const precursorTotal = selectedPrecursors.reduce(
      (sum, item) =>
        sum.plus(
          new BigNumber(item.benchmarkValue || 0).times(
            item.unitConsumption || 0,
          ),
        ),
      new BigNumber(0),
    );
    const base = new BigNumber(values.productBenchmarkValue || 0).plus(
      precursorTotal,
    );
    const sefa = base
      .times(values.cbamAdjustmentFactor || 0)
      .div(100)
      .times(values.cscfy || 0);
    const seeg = new BigNumber(values.seeg || 0);
    const certificatePrice = new BigNumber(
      values.certificatePriceEur || 0,
    ).times(values.exchangeRate || 0);
    const coverage = seeg.isZero()
      ? undefined
      : seeg.minus(sefa).div(seeg).times(100);
    const offsetPrice = new BigNumber(values.paidCarbonPrice || 0).times(seeg);
    const cost = seeg.minus(sefa).times(certificatePrice).minus(offsetPrice);
    return {
      precursorTotal: formatDecimal(precursorTotal.toFixed(6)),
      sefa: formatDecimal(sefa.toFixed(6)),
      coverage: coverage ? formatDecimal(coverage.toFixed(6)) : undefined,
      certificatePrice: formatDecimal(certificatePrice.toFixed(6)),
      offsetPrice: formatDecimal(offsetPrice.toFixed(6)),
      cost: formatDecimal(cost.toFixed(6)),
    };
  }, [precursorRows, form, productBenchmarkType, renderVersion]);

  const uploadProps: UploadProps = {
    action: `${baseUrl}${UPLOAD_FILES_RANDOM_NAME_URL}`,
    name: 'file',
    accept: FILE_ACCEPT,
    disabled: isDetail,
    maxCount: MAX_FILE_COUNT,
    headers: { Authorization: getToken() },
    fileList,
    beforeUpload: file => {
      if (fileList.length >= MAX_FILE_COUNT) {
        Toast('error', I18N.cbam.evidenceMaterialsMaxFiveError);
        return Upload.LIST_IGNORE;
      }
      if (file.size > 10 * 1024 * 1024) {
        Toast('error', I18N.components.fileSizeNotAppropriate);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: ({ fileList: nextFiles }) => {
      const normalized = nextFiles.map(file => {
        if (file.status === 'done' && file.response?.code === 200) {
          return { ...file, url: file.response.data.url };
        }
        return file;
      });
      setFileList(normalized);
    },
    onRemove: file => {
      setFileList(old => old.filter(item => item.uid !== file.uid));
      return true;
    },
  };

  const precursorColumns = [
    {
      title: I18N.cbam.type,
      dataIndex: 'sourceTypeName',
      width: 90,
      render: (_value: string, row: PrecursorRow) =>
        row.sourceKind === 1 ? I18N.cbam.otherProcess : I18N.cbam.precursor,
    },
    {
      title: I18N.cbam.precursorName,
      dataIndex: 'precursorNameSnapshot',
      width: 160,
      render: (value: string, row: PrecursorRow) =>
        value || row.precursorName || '-',
    },
    {
      title: I18N.cbam.precursorCn,
      dataIndex: 'cnCode',
      width: 130,
      render: (value: string) => value || '-',
    },
    {
      title: I18N.cbam.cnName3,
      dataIndex: 'cnName',
      width: 200,
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: I18N.cbam.totalConsumption,
      dataIndex: 'totalConsumption',
      width: 100,
      render: (value: number) => formatDecimal(value) || '-',
    },
    {
      title: I18N.cbam.unitConsumption,
      dataIndex: 'unitConsumption',
      width: 100,
      render: (value: number) => formatDecimal(value) || '-',
    },
    {
      title: I18N.cbam.benchmarkType,
      dataIndex: 'benchmarkType',
      width: 90,
      render: (value: number) =>
        value === BMG ? I18N.cbam.defaultValue : I18N.cbam.actualValue,
    },
    {
      title: I18N.cbam.benchmarkValue,
      dataIndex: 'benchmarkValue',
      width: 110,
      render: (value: number) => formatDecimal(value) || '-',
    },
    {
      title: I18N.cbam.productionRoute,
      dataIndex: 'productionRouteIndicator',
      width: 240,
      render: (value: string, row: PrecursorRow) =>
        [row.productionRouteCode, value].filter(Boolean).join(' / ') || '-',
    },
    {
      title: I18N.cbam.benchmarkContribution,
      dataIndex: 'benchmarkContribution',
      width: 110,
      render: (_: number, row: PrecursorRow) =>
        formatDecimal(
          new BigNumber(row.benchmarkValue || 0)
            .times(row.unitConsumption || 0)
            .toFixed(6),
        ),
    },
    {
      title: I18N.Factors.operation,
      fixed: 'right' as const,
      width: isDetail ? 70 : 170,
      render: (_: unknown, row: PrecursorRow) => (
        <Space size={0}>
          {!isDetail && (
            <>
              <Button
                type='link'
                onClick={() => openPrecursorEditor(row, 'edit')}
              >
                {I18N.Factors.edit}
              </Button>
              <Popconfirm
                title={I18N.cbam.confirmDeletePrecursor}
                onConfirm={() =>
                  setPrecursorRows(old =>
                    old.filter(item => item.rowKey !== row.rowKey),
                  )
                }
              >
                <Button type='link' danger>
                  {I18N.Factors.delete}
                </Button>
              </Popconfirm>
            </>
          )}
          <Button type='link' onClick={() => openPrecursorEditor(row, 'show')}>
            {I18N.Factors.check}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      className={style.wrapper}
      title={title}
      open={open}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose
      placement='right'
      width={1120}
      extra={
        <div className={style.closeIcon} onClick={closeDrawer}>
          <IconFont icon='icon-icon-guanbi' />
        </div>
      }
      onClose={closeDrawer}
      footer={[
        <Button key='cancel' onClick={closeDrawer}>
          {isDetail ? I18N.carbonFootPrintLCA.close : I18N.Factors.cancel}
        </Button>,
        !isDetail && (
          <Button
            key='save'
            type='primary'
            loading={loading}
            onClick={async () => {
              const values = await form.validateFields();
              const precursorList =
                values.productBenchmarkType === BMG_STAR
                  ? selectedPrecursors.map((item, index) => ({
                      ...item,
                      orderNum: index + 1,
                    }))
                  : [];
              if (precursorList.some(item => !item.benchmarkId)) {
                Toast('error', I18N.cbam.selectBenchmarksForAllPrecursors);
                return;
              }
              const requestData: CarbonTaxResp = {
                ...values,
                id: taxId,
                cbamId,
                supportFile: serializeSupportFiles(fileList),
                precursorList,
              };
              setLoading(true);
              try {
                if (isAdd) {
                  await postCarbonTaxAdd(requestData);
                } else {
                  await putCarbonTaxEdit(requestData);
                }
                Toast('success', I18N.Factors.saveSuccessful);
                resetState();
                onOk();
              } finally {
                setLoading(false);
              }
            }}
          >
            {I18N.Factors.preserve}
          </Button>
        ),
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        disabled={isDetail}
        onValuesChange={() => setRenderVersion(version => version + 1)}
      >
        <Divider orientation='left' orientationMargin={0}>
          {I18N.cbam.productInformation}
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.product}
              name='saleProductId'
              rules={[{ required: true, message: I18N.cbam.selectSoldProduct }]}
            >
              <Select
                showSearch
                optionFilterProp='label'
                disabled={!isAdd || isDetail}
                options={productOptions.map(item => ({
                  value: item.saleProductId,
                  label: item.productName,
                }))}
                onChange={async saleProductId => {
                  const product = productOptions.find(
                    item => item.saleProductId === saleProductId,
                  );
                  valueTypeDrafts.current = {};
                  previousEmissionValueType.current =
                    form.getFieldValue('emissionValueType') || ACTUAL_VALUE;
                  form.setFieldsValue({
                    cnCode: product?.cnCode,
                    countryValue: product?.countryValue,
                    countryCode: product?.countryCode,
                    countryName: product?.countryName,
                    productOutput: product?.productOutput,
                    productNameSnapshot: product?.productName,
                    productName: product?.productName,
                    emissionSelection: undefined,
                    emissionSourceType: undefined,
                    emissionSourceSaleProductId: undefined,
                    emissionSourceDefaultCnId: undefined,
                    emissionSourceYear: undefined,
                    seeg: undefined,
                    productBenchmarkId: undefined,
                    productBenchmarkType:
                      (form.getFieldValue('emissionValueType') ||
                        ACTUAL_VALUE) === ACTUAL_VALUE
                        ? BMG_STAR
                        : BMG,
                    productBenchmarkValue: undefined,
                    productRouteCode: undefined,
                    productRouteIndicator: undefined,
                  });
                  setPrecursorRows([]);
                  await Promise.all([
                    (form.getFieldValue('emissionValueType') ||
                      ACTUAL_VALUE) === ACTUAL_VALUE
                      ? loadEmissionOptions(saleProductId, ACTUAL_VALUE, true)
                      : Promise.resolve(),
                    loadPrecursorOptions(saleProductId),
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.Factors.productName}
              name='productName'
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: I18N.cbam.enterProductName,
                },
              ]}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={I18N.cbam.cnClassificationName} name='cnCode'>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.countryOrRegion}
              name='countryName'
              getValueProps={() => ({ value: localizedProductCountryName })}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={`${I18N.cbam.productOutput} (t)`}
              name='productOutput'
            >
              <InputNumber
                disabled
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation='left' orientationMargin={0}>
          {I18N.cbam.productCarbonEmissionIntensity}
        </Divider>
        <Row gutter={16} className={style.valueSectionRow}>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.valueType}
              name='emissionValueType'
              rules={[{ required: true, message: I18N.cbam.selectValueType }]}
            >
              <Radio.Group
                onChange={event =>
                  handleEmissionValueTypeChange(event.target.value)
                }
              >
                <Radio value={ACTUAL_VALUE}>{I18N.cbam.actualValue}</Radio>
                <Radio value={DEFAULT_VALUE}>{I18N.cbam.defaultValue}</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            {emissionValueType === DEFAULT_VALUE ? (
              <Form.Item label={I18N.cbam.defaultValueAndYear} required>
                <PrecursorDefaultValuePicker
                  selectionOnly
                  useDefault
                  readOnly={isDetail}
                  cnCode={productCnCode}
                  countryName={productCountryName}
                  countryValue={productCountryValue}
                  defaultCnId={emissionSourceDefaultCnId}
                  fixedCnCode={productCnCode}
                  productCategoryId={currentProduct?.productCategoryId}
                  productCategoryName={currentProduct?.productCategoryName}
                  selectedYear={emissionSourceYear}
                  onSelectionChange={selection => {
                    form.setFieldsValue({
                      emissionSelection: selection
                        ? `${DEFAULT_LIBRARY}-${selection.defaultCnId}-${
                            selection.year || ''
                          }`
                        : undefined,
                      emissionSourceType: selection
                        ? DEFAULT_LIBRARY
                        : undefined,
                      emissionSourceSaleProductId: undefined,
                      emissionSourceDefaultCnId: selection?.defaultCnId,
                      emissionSourceYear: selection?.year,
                      seeg: selection
                        ? new BigNumber(selection.directEmission || 0)
                            .plus(selection.indirectEmission || 0)
                            .toNumber()
                        : undefined,
                    });
                    setRenderVersion(version => version + 1);
                  }}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label={I18N.cbam.actualValueSource}
                name='emissionSelection'
                rules={[
                  { required: true, message: I18N.cbam.selectEmissionSource },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp='label'
                  options={emissionOptions.map(item => ({
                    value: buildEmissionKey(item),
                    label: `${item.label || '-'} (${
                      item.emissionValue ?? '-'
                    })`,
                  }))}
                  onChange={value => {
                    const option = emissionOptions.find(
                      item => buildEmissionKey(item) === value,
                    );
                    form.setFieldsValue({
                      emissionSourceType: option?.sourceType,
                      emissionSourceSaleProductId: option?.saleProductId,
                      emissionSourceDefaultCnId: undefined,
                      emissionSourceYear: option?.year,
                      seeg: option?.emissionValue,
                    });
                  }}
                />
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item
              label={`${I18N.cbam.productCarbonEmissionIntensity} (tCO2e/t)`}
              name='seeg'
            >
              <InputNumber
                disabled
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='emissionSourceType' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='emissionSourceSaleProductId' hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name='emissionSourceDefaultCnId'
          hidden
          rules={[
            {
              required: emissionValueType === DEFAULT_VALUE,
              message: I18N.cbam.selectDefaultValue2,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='emissionSourceYear'
          hidden
          rules={[
            {
              required: emissionValueType === DEFAULT_VALUE,
              message: I18N.cbam.selectDefaultValueYear,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Divider orientation='left' orientationMargin={0}>
          {I18N.cbam.productBenchmarkSection}
        </Divider>
        <Row gutter={16} className={style.valueSectionRow}>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.benchmarkValueType}
              name='productBenchmarkType'
              rules={[
                {
                  required: true,
                  message: I18N.cbam.selectBenchmarkValueType,
                },
              ]}
            >
              <Radio.Group
                disabled={Number(emissionValueType) !== DEFAULT_VALUE}
                onChange={event =>
                  handleProductBenchmarkTypeChange(event.target.value)
                }
              >
                <Radio value={BMG_STAR}>{I18N.cbam.actualValue}</Radio>
                <Radio value={BMG}>{I18N.cbam.defaultValue}</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='productBenchmarkId'
              hidden
              rules={[
                { required: true, message: I18N.cbam.selectProductBenchmark },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={renderFieldLabel(
                productBenchmarkLabel,
                PRODUCT_BENCHMARK_TIP,
              )}
              required
            >
              <Space.Compact className={style.selectionWrapper}>
                <Tooltip
                  placement='topLeft'
                  title={productBenchmarkSelectionDetail}
                >
                  <Input
                    readOnly
                    value={productBenchmarkSelectionLabel}
                    placeholder={I18N.cbam.findBenchmarkValue}
                  />
                </Tooltip>
                {!isDetail && (
                  <Button
                    type='primary'
                    onClick={() => setProductBenchmarkSelectOpen(true)}
                  >
                    {I18N.cbam.select}
                  </Button>
                )}
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.benchmarkValue}
              name='productBenchmarkValue'
            >
              <InputNumber
                disabled
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.productionRouteCode}
              name='productRouteCode'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.productionRouteDescription}
              name='productRouteIndicator'
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>
        {productBenchmarkType === BMG_STAR && (
          <>
            <Divider orientation='left' orientationMargin={0}>
              {I18N.cbam.precursorBenchmarkSection}
            </Divider>
            <Table<PrecursorRow>
              className={style.precursorTable}
              rowKey='rowKey'
              size='small'
              pagination={false}
              scroll={{ x: 1450 }}
              columns={precursorColumns}
              dataSource={precursorRows}
              locale={{ emptyText: I18N.cbam.noPrecursorsAdded }}
            />
            {!isDetail && (
              <Button
                block
                type='dashed'
                icon={<PlusOutlined />}
                className={style.addPrecursorButton}
                onClick={() => openPrecursorEditor(undefined, 'add')}
              >
                {I18N.cbam.addPrecursor}
              </Button>
            )}
          </>
        )}

        <Divider orientation='left' orientationMargin={0}>
          {I18N.cbam.carbonPriceAndAdjustmentParameters}
        </Divider>
        <Row gutter={20} className={style.parameterRow}>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.carbonTaxType}
              name='taxType'
              rules={[
                { required: true, message: I18N.cbam.selectCarbonTaxType },
              ]}
            >
              <Select
                options={taxTypeEnum}
                fieldNames={{ label: 'name', value: 'code' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.carbonTaxDeductionMethod}
              name='offsetMethod'
              rules={[
                {
                  required: true,
                  message: I18N.cbam.selectCarbonTaxDeductionMethod,
                },
              ]}
            >
              <Select
                options={offsetMethodEnum}
                fieldNames={{ label: 'name', value: 'code' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={renderFieldLabel(
                I18N.cbam.cbamAdjustmentFactor,
                CBAM_ADJUSTMENT_FACTOR_TIP,
              )}
              name='cbamAdjustmentFactor'
              rules={[
                {
                  required: true,
                  message: I18N.cbam.enterCbamAdjustmentFactor,
                },
              ]}
            >
              <InputNumber
                min={0}
                precision={6}
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={renderFieldLabel(
                I18N.cbam.crossSectoralCorrectionFactor,
                CSCFY_TIP,
              )}
              name='cscfy'
              rules={[
                {
                  required: true,
                  message: I18N.cbam.enterCrossSectoralCorrectionFactor,
                },
              ]}
            >
              <InputNumber
                min={0}
                precision={6}
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.cbam.targetCurrency}
              name='currencyType'
              rules={[
                { required: true, message: I18N.cbam.selectTargetCurrency },
              ]}
            >
              <Select
                showSearch
                optionFilterProp='dictLabel'
                options={currencyTypeEnum}
                fieldNames={{ label: 'dictLabel', value: 'dictValue' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.template(I18N.cbam.exchangeRateTargetCurrency, {
                val1: currencyUnit,
              })}
              name='exchangeRate'
              rules={[{ required: true, message: I18N.cbam.enterExchangeRate }]}
            >
              <InputNumber
                min={0}
                precision={8}
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={renderFieldLabel(
                I18N.cbam.eurCbamCertificatePrice,
                CBAM_CERTIFICATE_PRICE_TIP,
              )}
              name='certificatePriceEur'
              rules={[
                { required: true, message: I18N.cbam.enterCertificatePrice },
              ]}
            >
              <InputNumber
                min={0}
                precision={6}
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={I18N.template(I18N.cbam.targetCurrencyCertificatePrice, {
                val1: currencyUnit,
              })}
            >
              <Input value={preview.certificatePrice} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={renderFieldLabel(
                I18N.template(I18N.cbam.paidCarbonPrice, {
                  val1: currencyUnit,
                }),
                PAID_CARBON_PRICE_TIP,
              )}
              name='paidCarbonPrice'
              rules={[
                { required: true, message: I18N.cbam.enterPaidCarbonPrice },
              ]}
            >
              <InputNumber
                min={0}
                precision={6}
                formatter={inputNumberFormatter}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation='left' orientationMargin={0}>
          {I18N.cbam.calculationResultsAndEvidence}
        </Divider>
        <Row gutter={16} align='bottom'>
          <Col span={6}>
            <Form.Item label={I18N.cbam.adjustedFreeAllocation}>
              <Input value={preview.sefa} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={I18N.cbam.carbonTaxCoverageRatio}>
              <Input value={preview.coverage ?? '-'} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={I18N.template(I18N.cbam.offsetPriceSelectedCurrency, {
                val1: currencyUnit,
              })}
            >
              <Input value={preview.offsetPrice} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={I18N.template(I18N.cbam.carbonTaxCostSelectedCurrency, {
                val1: currencyUnit,
              })}
            >
              <Input value={preview.cost} disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={I18N.cbam.evidenceMaterialsMaxFive}>
              <Upload {...uploadProps}>
                {!isDetail && fileList.length < MAX_FILE_COUNT && (
                  <Button icon={<CloudUploadOutlined />}>
                    {I18N.carbonFootprint.uploadFiles}
                  </Button>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <PrecursorBenchmarkModal
        open={productBenchmarkSelectOpen}
        allowedBenchmarkType={productBenchmarkType}
        initialCnCode={productCnCode}
        onCancel={() => setProductBenchmarkSelectOpen(false)}
        onSelect={async selection => {
          form.setFieldsValue({
            productBenchmarkId: selection.id,
            productBenchmarkType: selection.benchmarkType,
            productBenchmarkValue: selection.benchmarkValue,
            productRouteCode: selection.productionRouteCode,
            productRouteIndicator: selection.productionRouteIndicator,
          });
          if (currentProductId && selection.benchmarkType === BMG_STAR) {
            await loadPrecursorOptions(currentProductId);
          }
          setProductBenchmarkSelectOpen(false);
        }}
      />
      <PrecursorEditorModal
        open={precursorEditorOpen}
        mode={precursorEditorMode}
        value={editingPrecursor}
        precursorOptions={precursorOptions}
        excludedKeys={precursorRows.map(item => item.rowKey)}
        onCancel={() => {
          setPrecursorEditorOpen(false);
          setEditingPrecursor(undefined);
        }}
        onOk={value => {
          setPrecursorRows(old =>
            precursorEditorMode === 'add'
              ? [...old, value]
              : old.map(item => (item.rowKey === value.rowKey ? value : item)),
          );
          setPrecursorEditorOpen(false);
          setEditingPrecursor(undefined);
          setRenderVersion(version => version + 1);
        }}
      />
    </Drawer>
  );
};
