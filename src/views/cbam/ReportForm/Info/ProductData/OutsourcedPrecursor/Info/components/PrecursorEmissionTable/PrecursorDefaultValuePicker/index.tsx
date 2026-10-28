import { Button, Input, InputNumber, Space, Tooltip } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

import I18N from '@/lang/I18N';
import { getCNDetail, getCNList } from '@/views/cbam/ReportForm/service';

import PrecursorDefaultValueDetailDialog from '../PrecursorDefaultValueDetailDialog';
import PrecursorDefaultValueSelectDialog from '../PrecursorDefaultValueSelectDialog';
import { DefaultCnSelection, SelectedDefaultValue } from '../defaultValueTypes';
import style from './index.module.less';
import { numberPropsData } from '../until';

interface PrecursorDefaultValuePickerProps {
  cnCode?: string | null;
  cnName?: string | null;
  countryName?: string;
  countryValue?: string;
  defaultCnId?: number;
  fixedCnCode?: string;
  productCategoryId?: number;
  productCategoryName?: string;
  readOnly?: boolean;
  selectedYear?: number;
  selectionOnly?: boolean;
  useDefault?: boolean;
  value?: number;
  onChange?: (value: number | null) => void;
  onSelectionChange?: (value?: SelectedDefaultValue) => void;
}

const UNKNOWN_ORIGIN_VALUE = 'UNKNOWN_ORIGIN';
const UNKNOWN_ORIGIN_LABELS = new Set([
  '无法确认产地',
  'Unable to confirm origin',
]);

const PrecursorDefaultValuePicker: FC<PrecursorDefaultValuePickerProps> = ({
  cnCode,
  cnName,
  countryName,
  countryValue,
  defaultCnId,
  fixedCnCode,
  productCategoryId,
  productCategoryName,
  readOnly,
  selectedYear,
  selectionOnly,
  useDefault,
  value,
  onChange,
  onSelectionChange,
}) => {
  const [selectOpen, setSelectOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDefault, setSelectedDefault] = useState<DefaultCnSelection>();
  const previousUseDefault = useRef(useDefault);
  const effectiveCountryValue =
    countryValue ||
    (countryName && UNKNOWN_ORIGIN_LABELS.has(countryName.trim())
      ? UNKNOWN_ORIGIN_VALUE
      : undefined);

  useEffect(() => {
    if (previousUseDefault.current === useDefault) return;
    const wasUsingDefault = previousUseDefault.current;
    previousUseDefault.current = useDefault;
    if (!wasUsingDefault || useDefault) return;
    setSelectedDefault(undefined);
    onChange?.(null);
    onSelectionChange?.(undefined);
  }, [onChange, onSelectionChange, useDefault]);

  useEffect(() => {
    let cancelled = false;
    if (!defaultCnId) {
      setSelectedDefault(undefined);
      return () => {
        cancelled = true;
      };
    }
    setSelectedDefault(current =>
      current?.id === defaultCnId ? current : undefined,
    );
    getCNDetail({
      id: defaultCnId,
      originCountryValue: effectiveCountryValue,
    })
      .then(({ data }) => {
        if (!cancelled && data?.data) {
          setSelectedDefault(data.data as DefaultCnSelection);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [defaultCnId, effectiveCountryValue]);

  let selectedYearLabel = '';
  if (selectedYear) {
    selectedYearLabel = selectedYear >= 2028 ? '2028+' : String(selectedYear);
  }
  const selectedLabel = [
    selectedDefault?.defaultCode || cnCode,
    selectedDefault?.defaultName || cnName,
    selectedYearLabel,
  ]
    .filter(Boolean)
    .join(' ');

  const loadDetail = async () => {
    if (selectedDefault) {
      setDetailOpen(true);
      return;
    }
    setDetailLoading(true);
    try {
      if (defaultCnId) {
        const { data } = await getCNDetail({
          id: defaultCnId,
          originCountryValue: effectiveCountryValue,
        });
        setSelectedDefault(data?.data as DefaultCnSelection);
        setDetailOpen(true);
        return;
      }
      if (cnCode) {
        const { data } = await getCNList({
          pageNum: 1,
          pageSize: 1,
          cnCode: cnCode.trim(),
        });
        const records = (data?.data?.records || []) as DefaultCnSelection[];
        const firstRecord = records[0];
        if (firstRecord) {
          setSelectedDefault(firstRecord);
          setDetailOpen(true);
        }
      }
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className={style.wrapper}>
      {useDefault && (
        <Space.Compact className={style.selectionWrapper}>
          <Tooltip title={selectedLabel}>
            <Input
              className={selectedLabel ? style.selectedInput : undefined}
              placeholder={I18N.cbam.pleaseSelectPrecursor}
              readOnly
              value={selectedLabel}
              onClick={() => {
                if (selectedLabel) loadDetail();
              }}
            />
          </Tooltip>
          {!readOnly && (
            <Button type='primary' onClick={() => setSelectOpen(true)}>
              {I18N.cbam.select}
            </Button>
          )}
        </Space.Compact>
      )}
      {!selectionOnly && (
        <InputNumber
          {...numberPropsData}
          disabled={useDefault || readOnly}
          placeholder={I18N.base.pleaseEnter}
          value={value}
          onChange={onChange}
        />
      )}
      <PrecursorDefaultValueSelectDialog
        countryName={countryName}
        countryValue={effectiveCountryValue}
        fixedCnCode={fixedCnCode}
        open={selectOpen}
        productCategoryId={productCategoryId}
        productCategoryName={productCategoryName}
        onCancel={() => setSelectOpen(false)}
        onOk={(record, selectedValue) => {
          setSelectedDefault(record);
          onChange?.(selectedValue.directEmission ?? null);
          onSelectionChange?.({
            cnCode: record.defaultCode,
            cnName: record.defaultName,
            defaultCnId: record.id,
            ...selectedValue,
          });
          setSelectOpen(false);
        }}
      />
      <PrecursorDefaultValueDetailDialog
        open={detailOpen}
        selectedEmission={value}
        value={selectedDefault}
        onCancel={() => setDetailOpen(false)}
      />
      {detailLoading && <span className={style.loadingText}>...</span>}
    </div>
  );
};

export default PrecursorDefaultValuePicker;
