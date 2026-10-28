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
import {
  Form,
  createForm,
  onFieldChange,
  onFormMount,
  onFormUnmount,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { useDataSource } from '@src/hooks/useDataSource';
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

import { baseInfoSchema } from './schema';
import {
  IReportForm,
  getReportYears,
  normalizeReportYears,
} from '../../../service';
import { FormilyRadioCard } from '../RadioCard';

interface IStepOneFormProps {
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
    FormilyRadioCard,
  },
});

const StepOneFormComponents: ForwardRefRenderFunction<
  Form,
  IStepOneFormProps
> = (props, ref) => {
  const [orgTree] = useOrgTreeData();
  // const [reOriginOtherContentList] = useDataSource('cdp_other_content');

  const { data: resultData } = useQuery(
    ['key'],
    async () =>
      getDictList<string>({
        dictTypes: 'cdp_other_content',
      }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const originList = useMemo(
    () =>
      resultData?.data.data.cdp_other_content.map(item => ({
        ...item,
        value: item.dictValue,
        label: item.dictLabel,
      })) || [],
    [resultData],
  );

  const originOtherContentList = useMemo(
    () => originList.filter(item => item.sourceType === '2024'),
    [originList],
  );

  const SMEOtherContentList = useMemo(
    () => originOtherContentList.slice(0, 2),
    [originOtherContentList],
  );

  const [originQuestionModuleList] = useDataSource('cdp_question_module');
  // originQuestionModuleList = originQuestionModuleList.map(item => ({
  //   ...item,
  //   disabled: true,
  // }));
  const SMEQuestionModule = useMemo(
    () => originQuestionModuleList.slice(0, 3),
    [originQuestionModuleList],
  );

  const form = useMemo(
    () =>
      createForm<IReportForm>({
        initialValues: {
          reportVersion: '2',
        },
        effects: () => {
          onFieldChange(
            'reportVersion',
            (field, newForm: Form<IReportForm>) => {
              // @ts-ignore    // 类型缺失
              const val = field.value;
              // 完整版
              if (val === '1') {
                newForm.setFieldState('.otherContent', {
                  dataSource: originOtherContentList,
                });
                newForm.setFieldState('.question_module', {
                  dataSource: originQuestionModuleList.map(item => ({
                    ...item,
                    disabled: item.value === '1',
                  })),
                });
              } else {
                newForm.setFieldState('.otherContent', {
                  dataSource: SMEOtherContentList,
                });
                newForm.setFieldState('.question_module', {
                  dataSource: SMEQuestionModule.map(item => ({
                    ...item,
                    disabled: item.value === '1',
                  })),
                });
              }
              newForm.setValuesIn('otherContent', []);
              newForm.setValuesIn('question_module', ['1']);
            },
          );
          onFormMount(currentForm => {
            props.onMount?.(currentForm);
          });
          onFormUnmount(currentForm => {
            props.onUnmount?.(currentForm);
          });
        },
      }),
    [originOtherContentList, SMEOtherContentList, originQuestionModuleList],
  );

  useImperativeHandle(ref, () => form, [form]);

  const { data: reportYears } = useQuery(
    ['cdpScoreRuleYears'],
    getReportYears,
    {
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
    if (yearList.length && !yearList.includes(form.values.year)) {
      form.setValuesIn('year', yearList[0]);
    }
  }, [yearList, form]);

  useEffect(() => {
    form.setFieldState('.orgId', {
      dataSource: orgTree,
    });
    form.setInitialValuesIn('orgId', [orgTree?.[0]?.value]);
  }, [orgTree, form]);

  return (
    <FormilyCommon form={form}>
      <SchemaField
        schema={baseInfoSchema()}
        scope={{
          useFieldFlattenUnitDictSource,
        }}
      />
    </FormilyCommon>
  );
};

export const StepOneForm = forwardRef(StepOneFormComponents);
