import {
  FormItem,
  Input,
  ArrayTable,
  Editable,
  ArrayItems,
  Space,
  PreviewText,
} from '@formily/antd-v5';
import {
  createForm,
  onFieldValueChange,
  onFormValuesChange,
} from '@formily/core';
import {
  connect,
  useFieldSchema,
  createSchemaField,
  ISchema,
  useField,
  useForm,
} from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { FormItemStatus } from '@src/views/enterpriseCarbonAccount2/CdpAiAssistant/detail/components/type';
import { debounce, uniq } from 'lodash-es';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './index.module.less';
import { CheckboxGroup } from '../AiCheckboxGroup';
import { AiDatePicker } from '../AiDatePicker';
import { RadioGroup } from '../AiRadioGroup';
import { AiTextArea } from '../AiTextarea';
import { createReportData } from '../AiTextarea/service';
import { CollapseField } from '../CollapseField';
import './index.css';
import { AiNumberPicker } from '../AiNumberPicker';
import { ArrayRemove } from '../ArrayRemove';
import { getDisableReactions } from '../utils';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Editable,
    Input,
    ArrayTable,
    AiTextArea,
    TextArea: AiTextArea,
    NumberPicker: AiNumberPicker,
    DatePicker: AiDatePicker,
    Radio: RadioGroup,
    Checkbox: CheckboxGroup,
    CollapseField,
    ArrayItems,
    Space,
    PreviewText,
    ArrayRemove,
  },
});

interface AiFixedTableProps {
  // define your props here
  value: string;
  title: string;
  initialValue?: { content: string };
  questionCode: string;
  renderType: string;
  onChange?: (value: any) => void;
  refreshHeader?: () => void;
}

const AiFixedTableComponent: React.FC<AiFixedTableProps> = props => {
  // use your props here

  const [schema, setSchema] = useState<ISchema>();
  const FieldSchema = useFieldSchema();
  const [initialValues, setInitialValues] = useState<{ array: any[] }>({
    array: [],
  });

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  const {
    value,
    title,
    initialValue,
    questionCode,
    renderType,
    onChange,
    refreshHeader,
  } = props;

  const [rowEffectData, setRowEffectData] = useState<any>([]);

  const initd = useRef(false);

  const field = useField();

  const rootForm = useForm();

  const [effectColumns, setEffectColumns] = useState<any[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const updateForm = debounce(async data => {
    await createReportData(data);
  }, 300);

  const Form = useMemo(
    () =>
      createForm<{
        formDisplay: string;
        array: any[];
      }>({
        initialValues: {
          formDisplay: 'AiFixedTable',
          array: [],
        },
        effects() {
          onFormValuesChange(async form => {
            setTimeout(() => {
              onChange(form.values);
              refreshHeader?.();
            }, 32);
            if (!initd.current) {
              return;
            }
            field.setDecoratorProps({
              questionStatus: FormItemStatus.filled,
            });
            await updateForm({
              questionId: field.props.name.toString(),
              questionCode,
              title,
              reportId,
              content: JSON.stringify(form.values),
            });
          });
        },
      }),
    [schema],
  );

  useEffect(() => {
    const columns = FieldSchema['x-component-props'].columns as any[];
    const rows = FieldSchema['x-component-props'].rows as any[];
    const result = {};
    const logic: any[] = [];
    columns.forEach((column, index) => {
      const reactions = column.schema.xRDeactions
        ? JSON.parse(column.schema.xRDeactions)
        : '';
      if (column?.logic?.question) {
        logic.push({
          ...column?.logic?.question,
          target: `columns${index}`,
        });
      }
      if (hiddenColumns.includes(`columns${index}`)) {
        return;
      }
      const disableReactions = getDisableReactions(column);

      result[`columns${index}`] = {
        type: 'void',
        'x-component': 'ArrayTable.Column',
        'x-component-props': { width: 200, title: column.title },
        properties: {
          [column.id]: {
            type: 'string',
            ...column.schema,
            'x-reactions': column.schema.xRDeactions
              ? [
                  {
                    dependencies: reactions.dependencies.map(dep => `.${dep}`),
                    fulfill: {
                      state: {
                        value: (reactions.fulfill.schema.value as string)
                          .replace(/（/g, '(')
                          .replace(/）/g, ')'),
                      },
                    },
                  },
                  ...disableReactions,
                ]
              : [...disableReactions],
          },
        },
      };
    });

    const rowResult = {};
    columns.forEach(column => {
      const reactions = column.schema.xRDeactions
        ? JSON.parse(column.schema.xRDeactions)
        : '';
      const disableReactions = getDisableReactions(column);
      rowResult[column.id] = {
        type: 'string',
        ...column.schema,
        'x-decorator': 'CollapseField',
        'x-decorator-props': {
          showTag: false,
          canCollapse: false,
          hideScore: true,
        },
        title: column.title,
        'x-reactions': column.schema.xRDeactions
          ? [
              {
                dependencies: reactions.dependencies.map(dep => `.${dep}`),
                fulfill: {
                  state: {
                    value: (reactions.fulfill.schema.value as string)
                      .replace(/（/g, '(')
                      .replace(/）/g, ')'),
                  },
                },
              },
              ...disableReactions,
            ]
          : [...disableReactions],
      };
    });
    let InitSchema: ISchema = {};
    if (renderType === 'row') {
      const showRowTitle = rows?.some(row => row.title.length > 0);
      const titleColumn = showRowTitle
        ? {
            rowTitle: {
              type: 'string',
              'x-component': 'PreviewText.Input',
              'x-component-props': { width: 20, title: '' },
            },
          }
        : {};
      InitSchema = {
        type: 'object',
        properties: {
          array: {
            type: 'array',
            'x-component': 'ArrayItems',
            'x-decorator': 'FormItem',
            // title: '对象数组',
            items: {
              type: 'object',
              properties: {
                space: {
                  type: 'void',
                  'x-component': 'ArrayRemove',
                  'x-component-props': {
                    canMove: false,
                  },
                  properties: {
                    ...titleColumn,
                    ...rowResult,
                  },
                },
              },
            },
          },
        },
      };
    } else {
      const showRowTitle = rows?.some(row => row.title.length > 0);
      const titleColumn = showRowTitle
        ? {
            columns: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { width: 20, title: '' },
              properties: {
                rowTitle: {
                  type: 'string',
                  'x-component': 'PreviewText.Input',
                  'x-component-props': {
                    disabled: true,
                    width: 20,
                  },
                },
              },
            },
          }
        : {};
      InitSchema = {
        type: 'object',
        properties: {
          array: {
            type: 'array',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayTable',
            'x-component-props': {
              pagination: false,
              scroll: { x: '100%' },
            },
            items: {
              type: 'object',
              properties: {
                ...titleColumn,
                ...result,
              },
            },
          },
        },
      };
    }

    if (effectColumns.length === 0) {
      setEffectColumns(logic);
    }

    setSchema(InitSchema);
    if (!value) {
      const rowValue = rows.map(row => ({
        rowTitle: row.title,
        rowId: row.id,
      }));
      setRowEffectData(rows);

      setInitialValues({ array: rowValue });
    }
  }, [FieldSchema, hiddenColumns]);

  useEffect(() => {
    setTimeout(() => {
      Form.setValues(value);
    }, 360);
  }, [Form, hiddenColumns]);

  useEffect(() => {
    rowEffectData.forEach(row => {
      if (row.logic?.question) {
        rootForm.addEffects(row.id, () => {
          onFieldValueChange(
            `.${row.logic?.question?.path.join('.')}`,
            field => {
              if (row.logic?.question.value.includes(field.value)) {
                Form.setValues({
                  array: [
                    ...Form.values.array,
                    {
                      rowTitle: row.title,
                      rowId: row.id,
                    },
                  ],
                });
              } else {
                const filterArray = [...Form.values.array].filter(
                  item => item.rowId !== row.id,
                );
                Form.setValues({
                  array: [...filterArray],
                });
              }
            },
          );
        });
      }
    });
  }, [rowEffectData, Form]);

  useEffect(() => {
    const initValue = initialValue?.content;
    if (
      initValue &&
      initValue !== '{"formDisplay":"AiFixedTable","array":[]}'
    ) {
      const rows = FieldSchema['x-component-props'].rows as any[];
      const initValueObj = JSON.parse(initialValue.content);
      rows.forEach((row, index) => {
        initValueObj.array[index].rowTitle = row.title;
        initValueObj.array[index].rowId = row.id;
      });
      Form.setValues(initValueObj);
      (field as any).setInitialValue?.(initValue);
    } else {
      Form.setInitialValues(initialValues);
      Form.setValues(JSON.parse(initialValue?.content || '{}'));
    }
    setTimeout(() => {
      initd.current = true;
    }, 400);
  }, [initialValue, Form, initialValues]);

  useEffect(() => {
    effectColumns.forEach((column, index) => {
      rootForm.addEffects(`${column.id}${index}`, () => {
        onFieldValueChange(`.${column?.path.join('.')}`, field => {
          if (Array.isArray(field.value)) {
            if ([...field.value]?.some(item => column.value.includes(item))) {
              setHiddenColumns(pre =>
                pre.filter(item => item !== column.target),
              );
            } else {
              setHiddenColumns(pre => uniq([...pre, column.target]));
            }
          } else if (column.value.includes(field.value)) {
            setHiddenColumns(pre => pre.filter(item => item !== column.target));
          } else {
            setHiddenColumns(pre => uniq([...pre, column.target]));
          }
        });
      });
    });
  }, [effectColumns, Form, rootForm]);

  useEffect(() => {
    effectColumns.forEach(column => {
      const value = rootForm.getValuesIn(`.${column?.path.join('.')}`);
      if (Array.isArray(value)) {
        if ([...value]?.some(item => column.value.includes(item))) {
          setHiddenColumns(pre => pre.filter(item => item !== column.target));
        } else {
          setHiddenColumns(pre => uniq([...pre, column.target]));
        }
      } else if (column.value.includes(value)) {
        setHiddenColumns(pre => pre.filter(item => item !== column.target));
      } else {
        setHiddenColumns(pre => uniq([...pre, column.target]));
      }
    });
  }, [effectColumns]);

  return (
    <div>
      <FormilyCommon form={Form} className={styles.formCommon}>
        <SchemaField schema={schema} />
      </FormilyCommon>
    </div>
  );
};

export const AiFixedTable = connect(AiFixedTableComponent);
