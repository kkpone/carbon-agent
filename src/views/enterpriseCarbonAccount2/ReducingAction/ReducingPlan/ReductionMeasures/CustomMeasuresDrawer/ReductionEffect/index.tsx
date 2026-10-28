/* eslint-disable react/no-array-index-key */
import I18N from '@src/lang/I18N';
import { PlusCircleFilled } from '@ant-design/icons';
import {
  FormItem,
  FormGrid,
  FormLayout,
  Cascader,
  Radio,
  NumberPicker,
} from '@formily/antd-v5';
import { ArrayField as ArrayFieldType } from '@formily/core';
import {
  observer,
  useField,
  Field,
  ObjectField,
  FormConsumer,
  useForm,
} from '@formily/react';
import { Button } from 'antd';
import { useEffect } from 'react';

import { IconAlibaba } from '@/components/iconfont';
import { useScope } from '@/hooks/useScope';

import styles from './index.module.less';
import { PARAM_TYPE, PARAM_TYPE_LABEL } from '../../constant';
import { MeasuresType } from '../../type';

const ReductionEffect = observer<{ disabled: boolean }>(({ disabled }) => {
  const scope = useScope();

  const field = useField<ArrayFieldType>();

  const form = useForm();

  const remove = (index: number) => {
    field.remove(index);
  };

  useEffect(() => {
    form.query('reduceResult.*.scope').forEach(scopeField => {
      scopeField.setComponentProps({
        options: scope.map(scopeItem => ({
          value: scopeItem.value,
          label: scopeItem.name,
          children: scopeItem.classifyList.map(classify => ({
            value: classify.value,
            label: classify.name,
          })),
        })),
      });
    });
  }, [scope, form]);

  return (
    <>
      {field.value?.map((_, index) => (
        <div className={styles.effectItem} key={index}>
          {!disabled && (
            <FormConsumer>
              {formIns =>
                (
                  (
                    formIns.values as {
                      reduceResult: MeasuresType['reduceResult'];
                    }
                  ).reduceResult || []
                ).length > 1 ? (
                  <div
                    className={styles.deleteIcon}
                    onClick={() => remove(index)}
                  >
                    <IconAlibaba type='icon-icon_delete' />
                  </div>
                ) : (
                  <div />
                )
              }
            </FormConsumer>
          )}
          <ObjectField name={index}>
            <FormLayout layout='vertical' colon={false}>
              <FormGrid maxColumns={2} columnGap={32} rowGap={20}>
                <Field
                  required
                  name='scope'
                  title={
                    <span className={styles.baseFormLabel}>
                      {I18N.enterpriseCarbonAccount2.scopeOfInfluence}
                    </span>
                  }
                  decorator={[
                    FormItem,
                    { className: styles.baseFormItem, gridSpan: 1 },
                  ]}
                  component={[
                    Cascader,
                    {
                      options: scope.map(scopeItem => ({
                        value: scopeItem.value,
                        label: scopeItem.name,
                        children: scopeItem.classifyList.map(classify => ({
                          value: classify.value,
                          label: classify.name,
                        })),
                      })),
                      placeholder:
                        I18N.enterpriseCarbonAccount2.scopeOfInfluence,
                    },
                  ]}
                />
                <Field
                  required
                  name='type'
                  title={
                    <span className={styles.baseFormLabel}>
                      {I18N.enterpriseCarbonAccount2.emissionReductionType}
                    </span>
                  }
                  decorator={[
                    FormItem,
                    { className: styles.baseFormItem, gridSpan: 1 },
                  ]}
                  component={[
                    Radio.Group,
                    {
                      options: Object.values(PARAM_TYPE).map(paramType => ({
                        value: paramType,
                        label: PARAM_TYPE_LABEL[paramType],
                      })),
                    },
                  ]}
                />
                <Field
                  required
                  name='formula'
                  title={
                    <span className={styles.baseFormLabel}>
                      {I18N.enterpriseCarbonAccount2.reducedDisplacement}
                    </span>
                  }
                  decorator={[
                    FormItem,
                    { className: styles.baseFormItem, gridSpan: 2 },
                  ]}
                  component={[
                    NumberPicker,
                    {
                      className: styles.numberPicker,
                      placeholder:
                        I18N.enterpriseCarbonAccount2.reducedDisplacement,
                      controls: false,
                      stringMode: true,
                      precision: 3,
                    },
                  ]}
                />
              </FormGrid>
            </FormLayout>
          </ObjectField>
        </div>
      ))}
      {!disabled && (
        <Button
          className={styles.addBtn}
          icon={<PlusCircleFilled />}
          type='dashed'
          onClick={() =>
            field.push({
              type: PARAM_TYPE.ABSOLUTE,
            })
          }
        >
          {I18N.enterpriseCarbonAccount2.addImpact}
        </Button>
      )}
    </>
  );
});

export default ReductionEffect;
