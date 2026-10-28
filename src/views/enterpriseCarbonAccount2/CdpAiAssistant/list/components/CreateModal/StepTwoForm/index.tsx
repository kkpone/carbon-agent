import {
  FormLayout,
  FormGrid,
  Radio,
  Input,
  Cascader,
  Select,
  DatePicker,
  TreeSelect,
  NumberPicker,
  FormItem,
  Checkbox,
} from '@formily/antd-v5';
import { Form, createForm, onFormMount, onFormUnmount } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import { getDictList } from '@src/views/carbonFootprint3/discharge/process/service';
import { useOrgTreeData } from '@src/views/dashborad/organization/components/hooks';
import { useQuery } from '@tanstack/react-query';
import {
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from 'react';

import styles from './index.module.less';
import { InputGroup } from './inputGroup';
import { IStepTwoFormValues, baseInfoSchema } from './schema';
import { getReportYears, normalizeReportYears } from '../../../service';

interface IStepTwoFormProps {
  onMount?: (form: Form) => void;
  onUnmount?: (form: Form) => void;
}

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Radio,
    Input,
    Cascader,
    Select,
    DatePicker,
    TreeSelect,
    NumberPicker,
    Checkbox,
    InputGroup,
  },
});

const StepTwoFormComponents: ForwardRefRenderFunction<
  Form,
  IStepTwoFormProps
> = (props, ref) => {
  const [orgTree] = useOrgTreeData();

  const { data: scopeThreeCategoryList } = useQuery(
    ['scope_three_category'],
    () =>
      getDictList<'scope_three_category'>({
        dictTypes: 'scope_three_category',
      }),
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  );

  const schema = useMemo(
    () =>
      baseInfoSchema({
        scopeThreeCategoryList:
          scopeThreeCategoryList?.data.data.scope_three_category || [],
      }),
    [scopeThreeCategoryList?.data.data.scope_three_category],
  );

  const form = useMemo(
    () =>
      createForm<IStepTwoFormValues>({
        initialValues: {
          reportStart: new Date(
            new Date().getFullYear() - 1,
            0,
            1,
          ).toLocaleString(),
          reportEnd: new Date(
            new Date().getFullYear() - 1,
            11,
            31,
          ).toLocaleString(),
          currency: 'CNY',
        },
        effects: () => {
          onFormMount(currentForm => {
            props.onMount?.(currentForm);
          });
          onFormUnmount(currentForm => {
            props.onUnmount?.(currentForm);
          });
        },
      }),
    [schema],
  );

  useImperativeHandle(ref, () => form, [form]);

  const { data: reportYears } = useQuery(
    ['cdpScoreRuleYears'],
    getReportYears,
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  );

  const yearList = useMemo(
    () => normalizeReportYears(reportYears),
    [reportYears],
  );

  useEffect(() => {
    form.setFieldState('.year', {
      dataSource: yearList.map(year => ({
        label: year,
        value: year,
      })),
    });
    const currentYear = (form.values as { year?: string }).year;
    if (yearList.length && !yearList.includes(currentYear || '')) {
      form.setValuesIn('year', yearList[0]);
    }
  }, [yearList, form]);

  useEffect(() => {
    form.setFieldState('.orgId', {
      dataSource: orgTree,
    });
  }, [orgTree, form, schema]);

  return (
    <div className={styles.wrapper}>
      <FormilyCommon form={form}>
        <SchemaField
          schema={schema}
          scope={{
            useFieldFlattenUnitDictSource,
          }}
        />
      </FormilyCommon>
    </div>
  );
};

export const StepTwoForm = forwardRef(StepTwoFormComponents);
