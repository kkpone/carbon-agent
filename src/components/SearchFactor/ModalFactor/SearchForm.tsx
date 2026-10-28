import {
  ArrayTable,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  Cascader,
  Radio,
  Submit,
  Reset,
  Form,
  Checkbox,
} from '@formily/antd-v5';
import {
  createForm,
  Form as FormilyForm,
  ObjectField,
  onFieldChange,
  onFieldInputValueChange,
  onFormMount,
  onFormReset,
  onFormSubmit,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import { toJS } from '@formily/reactive';
import I18N from '@src/lang/I18N';
import { Dicts } from '@src/views/emission/Show/type';
import { useEventListener } from 'ahooks';
import { CascaderProps, Tooltip } from 'antd';
import { uniqBy } from 'lodash-es';
import { FC, useEffect, useMemo, useRef } from 'react';

import { request } from '@/api/request';
import { SelectInput } from '@/components/formily/SelectInput';
import { useAllEnumsBatch } from '@/hooks';
import useFieldSetValueByLabel from '@/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';
import type { FactorSourceId } from '@/views/carbonFootprint3/FootprintAccount/component/GlobalFactorPreference/type';
import { changeDicts2Options } from '@/views/utils';

import styles from './index.module.less';
import {
  EcoinventGeographyOption,
  FactorInstitutionOption,
  syncEcoinventGeography,
} from './ecoinvent';
import { CheckboxWithTooltip, schema } from './schema';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    FormGrid,
    ArrayTable,
    Input,
    Select,
    Radio,
    Cascader,
    SelectInput,
    Submit,
    Reset,
    Checkbox,
    CheckboxWithTooltip,
    Tooltip,
  },
});

interface ISearchFormProps {
  submit?: (values: any) => void;
  loading: boolean;
  initialValues?: any;
  reset?: (values?: any) => void;
  institutionsList?: FactorInstitutionOption[];
  enableEcoinventGeography?: boolean;
  emissionClassify?: string;
  enableFactorSourceRange?: boolean;
  factorSourceOptions?: { label: string; value: FactorSourceId }[];
  defaultFactorSourceIds?: FactorSourceId[];
}

const normalizeFactorSourceIds = (
  sourceIds: FactorSourceId[] = [],
  factorSourceOptions: { label: string; value: FactorSourceId }[] = [],
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

export const SearchForm: FC<ISearchFormProps> = props => {
  const {
    submit,
    loading,
    reset,
    institutionsList,
    enableEcoinventGeography = false,
    emissionClassify,
    enableFactorSourceRange,
    factorSourceOptions = [],
    defaultFactorSourceIds = [],
  } = props;
  const geographyEnums = useAllEnumsBatch<{
    ecoinventGeography: EcoinventGeographyOption[];
  }>(enableEcoinventGeography ? 'ecoinventGeography' : undefined);
  const normalizedDefaultFactorSourceIds = useMemo(
    () => normalizeFactorSourceIds(defaultFactorSourceIds, factorSourceOptions),
    [defaultFactorSourceIds, factorSourceOptions],
  );
  const defaultFactorSourceIdsRef = useRef<FactorSourceId[]>(
    normalizedDefaultFactorSourceIds,
  );
  const submitRef = useRef(submit);
  const resetRef = useRef(reset);
  const enableFactorSourceRangeRef = useRef(enableFactorSourceRange);
  const resettingRef = useRef(false);
  const institutionsRef = useRef(institutionsList);
  const enableEcoinventGeographyRef = useRef(enableEcoinventGeography);

  submitRef.current = submit;
  resetRef.current = reset;
  enableFactorSourceRangeRef.current = enableFactorSourceRange;
  institutionsRef.current = institutionsList;
  enableEcoinventGeographyRef.current = enableEcoinventGeography;

  const getUnitData = async (form: FormilyForm<any>) => {
    const field = form.query('factorUnitM').take() as ObjectField;
    const dictTypes = 'factorUnitM';
    try {
      field?.setState({ loading: true });
      const { data: defaultData } = await request<{
        data: { factorUnitM: Dicts[] };
      }>({
        url: `/management/system/enum/getUnitDefault`,
        method: 'GET',
      });

      const { data } = await request<{ data: { factorUnitM: Dicts[] } }>({
        url: `/management/system/enum/listALLByDictTypeBatch`,
        method: 'GET',
        params: { dictTypes },
        debounced: true,
      });

      const defaultDicts = defaultData.data[dictTypes] as Dicts[];
      const defaultOptions: CascaderProps['options'] = [
        {
          dictLabel: I18N.components.inCommonUse,
          label: I18N.components.inCommonUse,
          value: '10000',
          children: defaultDicts.map(
            u =>
              ({
                ...u,
                label: u.dictLabel,
                value: u.dictValue,
                sourceType: u.sourceType,
              } as Dicts),
          ),
        },
      ];

      const unitDicts = data.data[dictTypes] as Dicts[];

      const unitOptions: CascaderProps['options'] = uniqBy(
        unitDicts.map(u => ({
          ...u,
          label: u.sourceName,
          value: u.sourceType,
          sourceType: u.sourceType,
          children: changeDicts2Options(
            unitDicts.filter(d => d.sourceType === u.sourceType),
          ) as CascaderProps['options'] | undefined,
        })),
        'value',
      );

      if (dictTypes === 'factorUnitM') {
        localStorage.setItem('FactorUnitDict', JSON.stringify(unitDicts));
        localStorage.setItem(
          'FactorUnitOptionsDict',
          JSON.stringify(defaultOptions.concat(unitOptions)),
        );
      }
      field?.setDataSource(defaultOptions.concat(unitOptions));
    } catch (e) {
      field?.setState({ loading: false });
    } finally {
      field?.setState({ loading: false });
    }
  };

  const getCountriesData = async (form: FormilyForm<any>) => {
    const field = form.query('countries').take() as ObjectField;
    try {
      field?.setState({ loading: true });
      const { data: defaultData } = await request<{
        data: { factorUnitM: Dicts[] };
      }>({
        url: `/management/system/enum/getCountriesDefault`,
        method: 'GET',
      });

      const { data } = await request<{
        data: { contryList: { groupName: string; data: Dicts[] }[] };
      }>({
        url: `/management/system/enum/getCountriesData`,
        method: 'GET',
        debounced: true,
      });
      const defaultDicts = defaultData.data.reportCountries as Dicts[];
      const defaultOptions: CascaderProps['options'] = [
        {
          label: I18N.components.inCommonUse,
          value: '10000',
          children: defaultDicts.map(
            u =>
              ({
                ...u,
                label: u.dictLabel,
                value: u.dictValue,
                sourceType: u.sourceType,
              } as Dicts),
          ),
        },
      ];
      const { contryList } = data.data;

      const unitOptions: CascaderProps['options'] = contryList.map(contry => {
        const unitDict = contry.data;
        return {
          label: contry.groupName,
          value: contry.groupName,
          children: unitDict.map(
            u =>
              ({
                ...u,
                label: u.dictLabel,
                value: u.dictValue,
                sourceType: contry.groupName,
              } as Dicts),
          ),
        };
      });
      field?.setDataSource(defaultOptions.concat(unitOptions));
    } catch (e) {
      field?.setState({ loading: false });
    } finally {
      field?.setState({ loading: false });
    }
  };
  const form = useMemo(
    () =>
      createForm({
        values: {
          ...props.initialValues,
          factorUnitM: props.initialValues.factorUnitM ?? ['10000'],
          factorType: '3',
          sourceIds:
            props.initialValues.sourceIds ?? normalizedDefaultFactorSourceIds,
        },
        initialValues: {
          factorType: '3',
          factorUnitM: ['10000'],
          countries: ['10000'],
          sourceIds: normalizedDefaultFactorSourceIds,
        },
        effects: () => {
          onFormSubmit(form => {
            submitRef.current?.(toJS(form.values));
          });
          onFormMount(async form => {
            getUnitData(form);
            getCountriesData(form);
          });
          onFormReset(() => {
            resettingRef.current = true;
            setTimeout(() => {
              syncEcoinventGeography(
                form,
                institutionsRef.current,
                enableEcoinventGeographyRef.current,
              );
              if (enableFactorSourceRangeRef.current) {
                form.setValuesIn(
                  'sourceIds',
                  defaultFactorSourceIdsRef.current,
                );
              }
              resetRef.current?.(toJS(form.values));
              setTimeout(() => {
                resettingRef.current = false;
              }, 0);
            }, 0);
          });
          onFieldChange(
            '*(year,factorUnitM,institution,countries,useAi)',
            (field, form) => {
              if (field.path.toString() === 'institution') {
                syncEcoinventGeography(
                  form,
                  institutionsRef.current,
                  enableEcoinventGeographyRef.current,
                );
              }
              setTimeout(() => {
                if (resettingRef.current) return;

                submitRef.current?.(toJS(form.values));
              }, 0);
            },
          );
          onFieldInputValueChange('ecoinventGeographies', (_, form) => {
            if (resettingRef.current || !enableEcoinventGeographyRef.current)
              return;
            submitRef.current?.(toJS(form.values));
          });
        },
      }),
    [],
  );

  useEffect(() => {
    if (!enableEcoinventGeography) return;
    form.setFieldState('ecoinventGeographies', {
      dataSource: (geographyEnums?.ecoinventGeography || []).map(option => ({
        ...option,
        dictLabel: `${option.dictLabel}（${option.dictValue}）`,
      })),
    });
  }, [form, geographyEnums, enableEcoinventGeography]);

  useEffect(() => {
    form.setFieldState('institution', state => {
      state.dataSource = institutionsList?.map(item => ({
        label: item.institution,
        value: item.id,
      }));
    });
    syncEcoinventGeography(form, institutionsList, enableEcoinventGeography);
  }, [institutionsList, form, enableEcoinventGeography]);

  useEffect(() => {
    if (!enableFactorSourceRange) return;

    defaultFactorSourceIdsRef.current = normalizedDefaultFactorSourceIds;
    form.query('name').take()?.setComponentProps({
      factorSourceOptions,
    });
    form.setValuesIn('sourceIds', normalizedDefaultFactorSourceIds);
  }, [
    enableFactorSourceRange,
    factorSourceOptions,
    form,
    normalizedDefaultFactorSourceIds,
  ]);

  useEventListener('keydown', ev => {
    if (ev.code === 'Enter') {
      ev.preventDefault();
      submitRef.current?.(toJS(form.values));
    }
  });

  useEffect(() => {
    form.setSubmitting(loading);
  }, [loading]);
  return (
    <div className={styles.searchForm}>
      <Form form={form}>
        <SchemaField
          schema={schema({
            emissionClassify,
            enableFactorSourceRange,
            factorSourceOptions,
            enableEcoinventGeography,
          })}
          scope={{
            useFieldUnitDictSource,
            useFieldSetValueByLabel,
          }}
        />
      </Form>
    </div>
  );
};
