import {
  FormItem,
  Input,
  ArrayTable,
  Editable,
  ArrayItems,
  Space,
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
import I18N from '@src/lang/I18N';
import { FormItemStatus } from '@src/views/enterpriseCarbonAccount2/CdpAiAssistant/detail/components/type';
import { useMount } from 'ahooks';
import { debounce, uniq } from 'lodash-es';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './index.module.less';
import { CheckboxGroup } from '../AiCheckboxGroup';
import { AiDatePicker } from '../AiDatePicker';
import { AiNumberPicker } from '../AiNumberPicker';
import { RadioGroup } from '../AiRadioGroup';
import { AiTextArea } from '../AiTextarea';
import { createReportData } from '../AiTextarea/service';
import { ArrayRemove } from '../ArrayRemove';
import { CollapseField } from '../CollapseField';
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
    ArrayItems,
    Space,
    CollapseField,
    ArrayRemove,
  },
});

interface AiArrayTableProps {
  // define your props here
  // value: string;
  onChange?: (value: any) => string;
  title: string;
  initialValue?: { content: string };
  questionCode: string;
  renderType: string;
  refreshHeader?: () => void;
}

const AiArrayTableComponent: React.FC<AiArrayTableProps> = props => {
  // use your props here

  // const field = useField();

  const [schema, setSchema] = useState<ISchema>();
  const FieldSchema = useFieldSchema();
  const initd = useRef(false);

  const {
    title,
    initialValue,
    questionCode,
    renderType,
    onChange,
    refreshHeader,
  } = props;

  useMount(() => {
    onChange({});
  });

  const rootForm = useForm();

  const [effectColumns, setEffectColumns] = useState<any[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  useEffect(() => {
    const columns = FieldSchema['x-component-props'].columns as any[];
    const maxRows = FieldSchema['x-component-props'].maxRows as number;
    const result = {};
    const logic: any[] = [];
    columns.forEach((column, index) => {
      const reactions = column.schema.xRDeactions
        ? JSON.parse(column.schema.xRDeactions)
        : '';
      const disableReactions = getDisableReactions(column);
      if (column?.logic?.question) {
        logic.push({
          ...column?.logic?.question,
          target: `columns${index}`,
        });
      }
      if (hiddenColumns.includes(`columns${index}`)) {
        return;
      }
      result[`columns${index}`] = {
        type: 'void',
        'x-component': 'ArrayTable.Column',
        'x-visible': !hiddenColumns.includes(`columns${index}`),
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
                          .replace(/）/g, ')')
                          .replace(/×/g, '*'),
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
                      .replace(/）/g, ')')
                      .replace(/×/g, '*'),
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
                  properties: {
                    ...rowResult,
                  },
                },
              },
            },
            properties: {
              add: {
                type: 'void',
                title: I18N.components.addEntry,
                'x-component': 'ArrayItems.Addition',
                'x-reactions': {
                  dependencies: ['..array'],
                  fulfill: {
                    state: {
                      display: `{{$deps[0]?.length >= ${maxRows} ? "hidden": "visible"}}`,
                    },
                  },
                },
              },
            },
          },
        },
      };
    } else {
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
                ...result,
                column6: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.carbonFootprint.operation,
                    dataIndex: 'operations',
                    width: '60px',
                    fixed: 'right',
                  },
                  properties: {
                    item: {
                      type: 'void',
                      'x-component': 'FormItem',
                      properties: {
                        remove: {
                          type: 'void',
                          'x-component': 'ArrayTable.Remove',
                        },
                      },
                    },
                  },
                },
              },
            },
            properties: {
              add: {
                type: 'void',
                'x-component': 'ArrayTable.Addition',
                title: I18N.components.addEntry,
                'x-reactions': {
                  dependencies: ['..array'],
                  fulfill: {
                    state: {
                      display: `{{$deps[0]?.length >= ${maxRows} ? "hidden": "visible"}}`,
                    },
                  },
                },
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
  }, [FieldSchema, hiddenColumns]);

  const field = useField();

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  const updateForm = debounce(async data => {
    await createReportData(data);
  }, 300);

  const Form = useMemo(
    () =>
      createForm({
        initialValues: {
          formDisplay: 'AiArrayTable',
        },
        effects() {
          onFormValuesChange(async form => {
            setTimeout(() => {
              onChange(form.values);
              refreshHeader?.();
            }, 32);
            if (!form.values.array?.[0]) {
              return;
            }
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
    const initValue = initialValue?.content;
    if (initValue) {
      const formValue = JSON.parse(initialValue?.content || '{}');
      if (formValue.array && formValue.array.length > 0) {
        formValue.array = formValue.array.filter(item => !!item);
        Form.setValues(formValue);
      }
      (field as any).setInitialValue(initValue);
    } else {
      Form.setInitialValues({
        formDisplay: 'AiArrayTable',
        array: [{}],
      });
      Form.setValues(JSON.parse(initialValue?.content || '[]'));
    }
    setTimeout(() => {
      initd.current = true;
    }, 300);
  }, [initialValue, Form]);

  useEffect(() => {
    effectColumns.forEach((column, index) => {
      rootForm.addEffects(`${column.id}${index}`, () => {
        onFieldValueChange(`.${column?.path.join('.')}`, field => {
          if (Array.isArray(field.value)) {
            if ([...field.value].some(item => column.value.includes(item))) {
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
        if ([...value].some(item => column.value.includes(item))) {
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

export const AiArrayTable = connect(AiArrayTableComponent);
