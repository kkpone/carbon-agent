/* eslint-disable no-nested-ternary */
import { PlusCircleOutlined } from '@ant-design/icons';
import { Cascader, FormItem, Input, Select } from '@formily/antd-v5';
import {
  createForm,
  Field as FieldType,
  Form as FormType,
  onFieldInputValueChange,
} from '@formily/core';
import { Field, FormConsumer, ReactChild } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Spin } from 'antd';
import { isNil, omit } from 'lodash-es';
import { nanoid } from 'nanoid';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';
import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import FormulaInput, {
  CONSTANT_CHAR_PREFIX,
  FORMULA_TOKEN_TYPE,
  INPUT_CHAR_PREFIX,
  PARAM_CHART_SIGN,
} from '@/components/FormulaInput';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';

import styles from './index.module.less';
import ParamSelectModal from '../ParamSelectModal';
import { EMISSION_TYPE, EMISSION_TYPE_LABEL } from '../constant';
import { getFormulaDetail } from '../service';

type FormulaDrawerProps = {
  open: boolean;
  id?: number;
  isCopy?: boolean;
  readPretty?: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, any>) => void | Promise<void>;
};

const Formula = forwardRef<
  FormType,
  Omit<FormulaDrawerProps, 'open' | 'onClose' | 'onConfirm'>
>(({ id, isCopy, readPretty }, ref) => {
  const form = useMemo(
    () =>
      createForm({
        readPretty,
        effects: () => {
          onFieldInputValueChange('paramItem', field => {
            const paramValues = (
              (field.value as { value: string }[]) || []
            ).map(item => `${item.value}`);

            const formulaValue = (
              form.values as { formula: { value: string; label: string }[] }
            ).formula;

            form.setValues({
              formula: formulaValue?.filter(
                item =>
                  !item.value.includes(PARAM_CHART_SIGN) ||
                  paramValues.includes(item.value.split(PARAM_CHART_SIGN)[0]),
              ),
            });
          });
        },
      }),
    [readPretty],
  );

  const [loading, setLoading] = useState(false);

  const [paramSelectModalOpen, setParamSelectModalOpen] = useState(false);

  useImperativeHandle(ref, () => form, [form]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getFormulaDetail({ id })
      .then(({ data }) => {
        const formulaInfo = data.data;
        form.setValues({
          ...formulaInfo,
          name: isCopy ? `${formulaInfo.name}-copy` : formulaInfo.name,
          paramItem: formulaInfo.paramItem.map(item => ({
            value: item.id,
            label: item.name,
          })),
          formula: formulaInfo.formula.map(item => {
            const t = Number(item.type);
            if (t === FORMULA_TOKEN_TYPE.PARAM) {
              return {
                value: `${item.value}${PARAM_CHART_SIGN}${nanoid()}`,
                label: item.label,
                type: item.type,
              };
            }
            if (t === FORMULA_TOKEN_TYPE.CONSTANT) {
              return {
                value: `${CONSTANT_CHAR_PREFIX}${item.value}`,
                label: item.label,
                type: item.type,
              };
            }
            return {
              value: `${INPUT_CHAR_PREFIX}${item.value}`,
              label: item.label,
              type: item.type,
            };
          }),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isCopy, form]);

  return (
    <Spin spinning={loading}>
      <FormilyCommon form={form} colon={false}>
        <FormConsumer>
          {() => {
            const selectedParams = (
              (
                form.values as {
                  paramItem: { value: number; label: string }[];
                }
              ).paramItem || []
            ).map(item => ({ id: item.value, name: item.label }));
            return (
              <ParamSelectModal
                open={paramSelectModalOpen}
                selectedParams={selectedParams}
                onClose={() => setParamSelectModalOpen(false)}
                onConfirm={paramData => {
                  (form.query('paramItem').take() as FieldType)?.onInput(
                    paramData.map(item => ({
                      value: item.id,
                      label: item.name,
                    })),
                  );
                  setParamSelectModalOpen(false);
                }}
              />
            );
          }}
        </FormConsumer>
        <Field
          name='name'
          title={I18N.enterpriseCarbonAccount2.calculationMethodName}
          required
          decorator={[FormItem]}
          component={[
            Input,
            {
              placeholder:
                I18N.enterpriseCarbonAccount2.pleaseEnterTheCalculation,
              maxLength: 50,
            },
          ]}
        />
        <Field
          name='emissionType'
          title={I18N.carbonFootprint.emissionType}
          required
          decorator={[FormItem]}
          component={[
            Select,
            {
              placeholder: I18N.enterpriseCarbonAccount2.pleaseSelectEmissions2,
              options: Object.values(EMISSION_TYPE).map(emissionType => ({
                value: emissionType,
                label: EMISSION_TYPE_LABEL[emissionType],
              })),
            },
          ]}
        />
        <Field
          name='unit'
          title={I18N.enterpriseCarbonAccount2.totalUnit}
          required
          decorator={[FormItem]}
          component={[
            Cascader,
            {
              placeholder:
                I18N.enterpriseCarbonAccount2.pleaseSelectTheTotalOrder,
            },
          ]}
          reactions={useFieldUnitDictSource('factorUnitM')}
        />
        <div className={styles.paramItemRow}>
          <Field
            name='paramItem'
            title={I18N.enterpriseCarbonAccount2.parameterItems}
            required
            decorator={[FormItem, { className: styles.paramItem }]}
            component={[
              Select,
              {
                mode: 'multiple',
                open: false,
                showSearch: false,
                suffixIcon: null,
                labelInValue: true,
              },
            ]}
          />
          <FormConsumer>
            {() => {
              const field = form.query('paramItem').take();
              return field?.disabled || field?.readPretty ? (
                (null as unknown as ReactChild)
              ) : (
                <Button
                  className={styles.addParamButton}
                  type='primary'
                  icon={<PlusCircleOutlined />}
                  onClick={() => setParamSelectModalOpen(true)}
                >
                  {I18N.enterpriseCarbonAccount2.addParameters}
                </Button>
              );
            }}
          </FormConsumer>
        </div>
        <Field
          name='formula'
          title={I18N.enterpriseCarbonAccount2.formulaConfiguration}
          required
          decorator={[FormItem]}
          component={[
            FormulaInput,
            {
              enableFormulaConstants: true,
            },
          ]}
        />
      </FormilyCommon>
    </Spin>
  );
});

const FormulaDrawer: FC<FormulaDrawerProps> = ({
  id,
  open,
  isCopy,
  readPretty,
  onClose,
  onConfirm,
}) => {
  const formRef = useRef<FormType>(null);

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const form = formRef.current;
    if (!form) return;

    setLoading(true);
    try {
      const data = await form.submit<{
        paramItem: { value: number; label: string }[];
        formula: { value: string; label: string; type: number }[];
      }>();

      const postData = {
        ...data,
        paramItem: data.paramItem.map(item => ({
          id: item.value,
          name: item.label,
        })),
        formula: data.formula.map(item => {
          const t = Number(item.type);
          return {
            ...item,
            value:
              t === FORMULA_TOKEN_TYPE.PARAM
                ? item.value.split(PARAM_CHART_SIGN)[0]
                : t === FORMULA_TOKEN_TYPE.CONSTANT
                ? item.value.replace(CONSTANT_CHAR_PREFIX, '')
                : item.value.replace(INPUT_CHAR_PREFIX, ''),
          };
        }),
      };

      await onConfirm(isCopy ? omit(postData, ['id']) : postData);
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomDrawer
      title={
        isCopy
          ? I18N.enterpriseCarbonAccount2.copyCalculationMethod
          : isNil(id)
          ? I18N.enterpriseCarbonAccount2.addCalculationMethod
          : readPretty
          ? I18N.enterpriseCarbonAccount2.detailedCalculationMethod
          : I18N.enterpriseCarbonAccount2.editCalculationMethod
      }
      width={560}
      destroyOnClose
      open={open}
      footer={
        <div className={styles.drawerFooter}>
          <Button onClick={onClose}>
            {readPretty
              ? I18N.carbonFootprint3.close
              : I18N.carbonFootprint.cancel}
          </Button>
          {!readPretty && (
            <Button type='primary' loading={loading} onClick={submit}>
              {I18N.carbonFootprint.preserve}
            </Button>
          )}
        </div>
      }
      onClose={onClose}
    >
      <Formula ref={formRef} id={id} isCopy={isCopy} readPretty={readPretty} />
    </CustomDrawer>
  );
};

export default FormulaDrawer;
