import {
  FormLayout,
  FormGrid,
  Input,
  Cascader,
  Select,
  TreeSelect,
  // NumberPicker,
} from '@formily/antd-v5';
import { createForm, onFormValuesChange } from '@formily/core';
import { ISchema, createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { AiArrayTable } from '@src/components/formily/components/AiArrayTable';
import { CheckboxGroup } from '@src/components/formily/components/AiCheckboxGroup';
import { AiDatePicker } from '@src/components/formily/components/AiDatePicker';
import { AiFixedTable } from '@src/components/formily/components/AiFixedTable';
import { AiNumberPicker } from '@src/components/formily/components/AiNumberPicker';
import { RadioGroup } from '@src/components/formily/components/AiRadioGroup';
import { AiTextArea } from '@src/components/formily/components/AiTextarea';
import { CollapseField } from '@src/components/formily/components/CollapseField';
import classNames from 'classnames';
import { intersection, omit } from 'lodash-es';
import React, {
  useState,
  useMemo,
  useEffect,
  memo,
  startTransition,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';

import { LoadingWrapper, LoadingWrapperRef } from './LoadingWrapper';
import styles from './index.module.less';
import { getReportDataInfo, getReportDetail, IReport } from '../../service';
import { Menu } from '../menus/Menu';
import { FormItemStatus } from '../type';

interface MenuNode {
  title: string;
  key: string;
  children?: MenuNode[];
}

interface FormValues {
  orgName: string;
  pid: number;
  superiorsShares: number;
  orgArea: string[];
  orgIndustry: string;
  orgClassify: string;
  linkmanUserid: string;
}

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem: CollapseField,
    Radio: RadioGroup,
    Input,
    Cascader,
    Select,
    DatePicker: AiDatePicker,
    TreeSelect,
    NumberPicker: AiNumberPicker,
    AiTextArea,
    TextArea: AiTextArea,
    Checkbox: CheckboxGroup,
    ArrayTable: AiArrayTable,
    FixedTable: AiFixedTable,
  },
});

const tablesPath: string[] = [];

const transformSchema = (
  params: {
    properties: any[];
    'x-designable-id': string;
    title?: string;
    description?: string;
    questionStatus: FormItemStatus;
    logic: {
      question: {
        value: string[];
        path: string[];
      };
      business: string[];
      otherContent: string[];
      reportModule: number[];
      reportVersion: number[];
    };
  }[],
  reportData: Object = {},
  filter: FormItemStatus[] = [],
  depth: number = 0,
  baseInfo: IReport,
  parentPath: string = '',
  refreshHeader?: () => void,
) => {
  const result = {};

  params?.forEach(item => {
    if (
      item['x-component'] === 'FixedTable' ||
      item['x-component'] === 'ArrayTable'
    ) {
      tablesPath.push(
        `${parentPath}${parentPath.length > 0 ? '.' : ''}${
          item['x-designable-id']
        }`,
      );
    }
    let reaction = {};
    if (item.logic?.question?.value) {
      const index = tablesPath.findIndex(path =>
        item.logic?.question?.path.join('.').includes(path),
      );
      if (index > -1 && item.logic.question?.path.length > 2) {
        const values = JSON.stringify(item.logic.question?.value);
        const rowId =
          item.logic.question.path[item.logic.question.path.length - 2];
        const targetColumn =
          item.logic.question.path[item.logic.question.path.length - 1];
        reaction = {
          dependencies: [tablesPath[index]],
          fulfill: {
            state: {
              visible: `{{${values}.some(item => {let deps = $deps[0];if (typeof($deps[0]) === 'string') {deps = JSON.parse($deps[0]);}return deps?.array?.find(item => item.rowId==='${rowId}')?.['${targetColumn}']?.includes(item)})}}`,
            },
          },
        };
      } else {
        const values = JSON.stringify(item.logic.question?.value);
        reaction = {
          dependencies: [`${item.logic.question.path.join('.')}`],
          fulfill: {
            state: {
              visible: `{{${values}.some(item => (($deps || [])?.[0] || [])?.includes(item))}}`,
            },
          },
        };
      }
    }

    let visible = false;

    if (reportData[item['x-designable-id']] === undefined) {
      visible = filter.includes(FormItemStatus.unfilled);
    } else {
      visible = filter.includes(FormItemStatus.filled);
    }
    if (item?.properties) {
      visible = true;
    }

    let versionVisible = true;
    let businessVisible = true;
    let otherContentVisible = true;
    let questionModuleVisible = true;

    if (item.logic?.reportVersion) {
      versionVisible = item.logic.reportVersion.includes(
        Number(baseInfo.reportVersion),
      );
    }

    if (item.logic?.reportModule) {
      // visible = item.logic.reportModule.includes(Number(baseInfo.reportModule));
    }

    if (item.logic?.business) {
      const baseBusiness = baseInfo.business?.split(',');
      businessVisible =
        intersection(item.logic.business, baseBusiness).length > 0;
    }

    if (item.logic?.otherContent) {
      const baseOtherContent = baseInfo.otherContent?.split(',');
      otherContentVisible =
        intersection(item.logic.otherContent, baseOtherContent).length > 0;
    }

    if (item.logic?.reportModule) {
      const baseQuestionModule = baseInfo.questionModule
        ?.split(',')
        .map(Number);
      questionModuleVisible =
        intersection(item.logic.reportModule, baseQuestionModule).length > 0;
    }

    const infoVisible =
      versionVisible &&
      businessVisible &&
      otherContentVisible &&
      questionModuleVisible;

    if (!(visible && infoVisible)) {
      return;
    }

    if (item['x-reactions']) {
      item['x-reactions'].fulfill = {
        state: {
          value: item['x-reactions'].fulfill.schema.value,
        },
      };
    }

    let xReactions: any[] = [];
    if (item['x-reactions']) {
      xReactions = Array.isArray(item['x-reactions'])
        ? item['x-reactions']
        : [item['x-reactions']];
    }

    const itemS = {
      ...item,
      title: `${item['x-num']} ${item?.title}`,
      'x-component-props': {
        questionStatus: item.questionStatus,
        showTag: depth !== 0,
        // hideScore: item?.['x-component-props']?.renderType === 'row',
        ...item?.['x-component-props'],
        title: item?.['x-component-props']?.title || item.title,
        initialValue: reportData[item['x-designable-id']],
        questionCode: item?.['x-num'],
        refreshHeader,
        description: item?.description,
        columns: item?.['x-component-props']?.columns?.map(column => ({
          ...column,
          schema: {
            ...omit(column.schema, ['x-reactions']),
            xRDeactions: JSON.stringify(column.schema['x-reactions']),
          },
        })),
      },
      'x-decorator-props': {
        questionStatus: item.questionStatus,
        showTag: depth !== 0,
        // hideScore: item?.['x-component-props']?.renderType === 'row',
      },
      'x-reactions': [...xReactions, reaction],
      'x-visible': visible && infoVisible,
      properties: transformSchema(
        item.properties,
        reportData,
        filter,
        1,
        baseInfo,
        `${parentPath}${parentPath.length > 0 ? '.' : ''}${
          item['x-designable-id']
        }`,
        refreshHeader,
      ),
    };
    if (!itemS['x-component']) {
      itemS['x-component'] = 'FormItem';
    } else {
      itemS['x-decorator'] = 'FormItem';
    }
    result[item['x-designable-id']] = itemS;
  });
  return result;
};

interface InfoFormProps {
  filter: FormItemStatus[];
  refreshHeader?: () => void;
  drawOpen: boolean;
}

const flatMenu = (params: ISchema, depth: number): MenuNode[] => {
  const result: MenuNode[] = [];
  if (params.properties) {
    Object.keys(params.properties).forEach(key => {
      const item = params.properties?.[key] as {
        properties: any;
        title: string;
        'x-designable-id': string;
      };
      if (typeof item === 'object' && item !== null && item['x-visible']) {
        const innerMap: MenuNode = {
          title: `${item?.title}`,
          key: item['x-designable-id'],
        };
        if (item?.properties && depth < 1) {
          innerMap.children = flatMenu(item, depth + 1);
        }
        result.push(innerMap);
      }
    });
  }
  return result;
};
export const InfoForm: React.FC<InfoFormProps> = memo(props => {
  const { filter, refreshHeader, drawOpen } = props;
  // use your props here
  const [schema, setSchema] = useState<ISchema>({});
  const loadingRef = useRef<LoadingWrapperRef>(null);
  const menu = useMemo(() => flatMenu(schema, 0), [schema]);

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  const Form = useMemo(
    () =>
      createForm<FormValues>({
        effects() {
          onFormValuesChange(() => {
            refreshHeader?.();
          });
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      document.body.style.cursor = 'default';
    },
    [],
  );

  const getInfo = async () => {
    loadingRef.current?.setLoading(true);
    const info = await getReportDataInfo({ reportId });
    const CDPInfo = await getReportDetail({ id: reportId });
    const baseInfo = CDPInfo.data.data;
    const reportData = {};
    (info.data.data.reportData || []).forEach(item => {
      reportData[item.questionId] = item;
    });
    const target = transformSchema(
      info.data.data.model,
      reportData,
      filter,
      0,
      baseInfo,
      '',
      refreshHeader,
    );
    startTransition(() => {
      setSchema({
        type: 'object',
        properties: target,
      });
    });
    setTimeout(() => {
      loadingRef.current?.setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    getInfo();
  }, [filter]);

  return (
    <div className={styles.formWrapper}>
      <div className={styles.left}>
        <div className={styles.menu}>
          <Menu menu={menu} />
        </div>
      </div>
      <div
        className={classNames(styles.right, { [styles.drawOpen]: drawOpen })}
      >
        <LoadingWrapper ref={loadingRef} />
        <div className={styles.form} id='CDPFormFormilyContent'>
          <FormilyCommon form={Form} className={styles.formCommon}>
            <SchemaField schema={schema} />
          </FormilyCommon>
        </div>
      </div>
      <div className={styles.placeholder} />
    </div>
  );
});
