import { connect, FormConsumer, mapReadPretty } from '@formily/react';
import I18N, { LocaleType } from '@src/lang/I18N';
import { AutoComplete, Select, Space, type SelectProps } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { omit, throttle } from 'lodash-es';
import React, { useContext, useRef, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { associationalFactor } from '@/components/SearchFactor/service';
import type { FactorSourceId } from '@/views/carbonFootprint3/FootprintAccount/component/GlobalFactorPreference/type';

interface SearchInputProps extends SelectProps<string> {
  placeholder: string;
  onChange: (value: string) => void;
  handleSelect?: (value?: DefaultOptionType) => void;
  style: React.CSSProperties;
  fetch: (value: string, callback: (data: any[]) => void) => void;
  dataSource?: SelectProps['options'];
  emissionClassify?: string;
  enableFactorSourceRange?: boolean;
  factorSourceOptions?: { label: string; value: FactorSourceId }[];
}

const EMISSION_FACTOR_LIBRARY_TYPE = '1';

type FactorSourceOption = {
  label: string;
  value: FactorSourceId;
};

const getUniqueValidSourceIds = (
  sourceIds: Array<FactorSourceId | null | undefined> = [],
  factorSourceOptions: FactorSourceOption[],
) => {
  const selectedSourceIds = new Map<string, FactorSourceId>();

  sourceIds.forEach(sourceId => {
    if (sourceId === undefined || sourceId === null || sourceId === '') {
      return;
    }

    const matchedOption = factorSourceOptions.find(
      option => String(option.value) === String(sourceId),
    );

    if (matchedOption) {
      selectedSourceIds.set(String(matchedOption.value), matchedOption.value);
    }
  });

  return Array.from(selectedSourceIds.values());
};

const getFactorSourceSelectValue = (
  sourceIds: FactorSourceId[] | undefined,
  factorSourceOptions: FactorSourceOption[],
) => getUniqueValidSourceIds(sourceIds, factorSourceOptions);

const normalizeFactorSourceValue = (
  value: Array<FactorSourceId | null | undefined> | undefined,
  factorSourceOptions: FactorSourceOption[],
) => getUniqueValidSourceIds(value, factorSourceOptions);

const getFactorLibrarySelectOptions = () => [
  {
    value: '3',
    label: I18N.components.all,
  },
  {
    value: EMISSION_FACTOR_LIBRARY_TYPE,
    label: I18N.carbonFootprint.emissionFactorLibrary,
  },
  {
    value: '2',
    label: I18N.carbonFootprint.organizationalFactorLibrary,
  },
  {
    value: '4',
    label: I18N.emission.collectionFactor,
  },
];

const SelectInputComponent = (props: SearchInputProps) => {
  const {
    onChange,
    value,
    handleSelect,
    emissionClassify,
    enableFactorSourceRange,
    factorSourceOptions = [],
  } = props;
  const [data, setData] = useState<SelectProps['options']>([]);
  const currentName = useRef<string>('');

  const { locale } = useContext(LocaleContext);

  // 获取 URL 参数
  const searchParams = new URLSearchParams(window.location.search);
  const computationId = searchParams.get('computationId') || undefined;
  const accountId = searchParams.get('accountId') || undefined;

  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;

  const fetch = async (name: string, callback: Function) => {
    currentName.current = name;
    const result = await associationalFactor({
      name,
      isEnterprise: !!computationId,
      computationId: computationId ? Number(computationId) : undefined,
      accountId: accountId ? Number(accountId) : undefined,
      emissionClassify,
    });
    if (currentName.current === name) {
      const transData = result.data.data.map((item: string) => ({
        value: item,
        text: item,
      }));
      callback(transData);
    }
  };

  const handleSearch = throttle((newValue: string) => {
    if (newValue) {
      fetch(newValue, setData);
    } else {
      setData([]);
    }
  }, 500);

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <FormConsumer>
        {form => {
          const sourceIds = form.values.sourceIds as
            | FactorSourceId[]
            | undefined;
          const showFactorSourceRange = !!enableFactorSourceRange;

          return (
            <>
              <Select
                options={getFactorLibrarySelectOptions()}
                style={{
                  width: showFactorSourceRange
                    ? isEn
                      ? '32%'
                      : '25%'
                    : isEn
                    ? '40%'
                    : '26%',
                }}
                value={form.values.factorType}
                onChange={value => {
                  form.setValuesIn('factorType', value);
                }}
              />
              {showFactorSourceRange && (
                <Select
                  mode='multiple'
                  allowClear
                  maxTagCount='responsive'
                  optionFilterProp='label'
                  options={factorSourceOptions}
                  placeholder={I18N.carbonFootprint3.whole}
                  aria-label={I18N.carbonFootprint3.dataSourceRange}
                  style={{ width: isEn ? '32%' : '31%' }}
                  value={getFactorSourceSelectValue(
                    sourceIds,
                    factorSourceOptions,
                  )}
                  onChange={newValue => {
                    form.setValuesIn(
                      'sourceIds',
                      normalizeFactorSourceValue(newValue, factorSourceOptions),
                    );
                  }}
                />
              )}
              <AutoComplete
                value={value}
                allowClear
                {...omit(props, [
                  'dataSource',
                  'enableFactorSourceRange',
                  'factorSourceOptions',
                ])}
                style={{
                  width: showFactorSourceRange
                    ? isEn
                      ? '36%'
                      : '44%'
                    : isEn
                    ? '60%'
                    : '77%',
                }}
                aria-placeholder={props.placeholder}
                onSelect={e => {
                  if (data?.find(d => d.value === e)) {
                    handleSelect?.(data?.find(d => d.value === e));
                  }
                }}
                onSearch={e => handleSearch(e)}
                onChange={handleChange}
                options={(data || []).map(d => ({
                  value: d.value,
                  label: d.text,
                }))}
              />
            </>
          );
        }}
      </FormConsumer>
    </Space.Compact>
  );
};

export const SelectInput = connect(
  SelectInputComponent,
  mapReadPretty(SelectInputComponent),
);
