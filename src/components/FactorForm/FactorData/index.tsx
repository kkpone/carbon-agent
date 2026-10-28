/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  FormItem,
  Input,
  Select,
  Form,
  NumberPicker,
  Cascader,
} from '@formily/antd-v5';
import { Form as FormType } from '@formily/core';
import { Field, FormConsumer, VoidField } from '@formily/react';
import I18N from '@src/lang/I18N';
import {
  Col,
  Row,
  Table,
  Select as AntdSelect,
  InputNumber,
  Cascader as AntdCascader,
} from 'antd';
import { cloneDeep, isNil } from 'lodash-es';
import { FC, MutableRefObject, useEffect, useState } from 'react';

import { listALLByDictTypeBatch } from '@/api/api';
import useFieldFlattenUnitDictSource from '@/hooks/useFieldFlattenUnitDataSource';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';
import { useUnit } from '@/hooks/useScope';

import styles from './index.module.less';
import {
  NUMBER_FACTOR_TYPE,
  GAS_TYPE_TO_ENUM_KEY,
  FORMULA_VALUE_TO_ENUM_KEY,
  FORMULA_VALUE_TO_UNIT_ENUM,
  FOSSIL_FORMULA_VAL,
  VALUE_TYPE_CO2E_TYPE,
  FORMULA_TYPE_CO2E_TYPE,
  FOREST_FORMULA_VAL,
  TRANSPORT_FORMULA_VAL,
  TRANSPORT_TKM_FORMULA_VAL,
  FORMULA_DESC,
} from '../constant';

const FactorData: FC<{
  form: FormType;
  formula: {
    carbonFactorGas: Record<string, any>[];
    carbonFactorFormula: Record<string, any>[];
  };
  gasList: Record<string, any>[];
  disabled?: boolean;
  co2eColumnShow?: boolean;
  formulaTempRef?: MutableRefObject<
    | Record<
        string,
        {
          carbonFactorGas: Record<string, any>[];
          carbonFactorFormula: Record<string, any>[];
        }
      >
    | undefined
  >;
  setGasList?: (val: Record<string, any>[]) => void;
  setFormula?: (val: {
    carbonFactorGas: Record<string, any>[];
    carbonFactorFormula: Record<string, any>[];
  }) => void;
}> = props => {
  const {
    form,
    gasList,
    disabled,
    co2eColumnShow = true,
    formulaTempRef,
    formula,
    setFormula,
    setGasList,
  } = props;

  const [dictEnums, setDictEnums] = useState<Record<string, any>>({});

  const unitDicts = useUnit();

  const calcFactorValue = (formulaValue: string) => {
    if (formula.carbonFactorFormula.some(item => !item.paraValue)) {
      return '';
    }

    let factorValue: string | number = '';
    const values = formula.carbonFactorFormula.map(item => item.paraValue);

    if (formulaValue === FOSSIL_FORMULA_VAL) {
      factorValue =
        Number(values[0]) *
        Number(values[1]) *
        (Number(values[2]) / 100) *
        (44 / 12);
    } else if (formulaValue === FOREST_FORMULA_VAL) {
      factorValue =
        Number(values[0]) *
        Number(values[1]) *
        (1 + Number(values[2])) *
        Number(values[3]) *
        (44 / 12);
    } else if (formulaValue === TRANSPORT_FORMULA_VAL) {
      factorValue = Number(values[0]) / Number(values[1]);
    } else if (formulaValue === TRANSPORT_TKM_FORMULA_VAL) {
      factorValue = Number(values[0]) * Number(values[1]);
    }

    return Number.isNaN(factorValue) ? '' : `${Number(factorValue).toFixed(5)}`;
  };

  useEffect(() => {
    listALLByDictTypeBatch({
      dictTypes: [
        'HFCsEnum',
        'PFCseNUM',
        'cequivalentUnitZ',
        'factorUnitZ',
        'methaneUnitZ',
        'nitrousUnitZ',
        'hydrofluorocarbonUnitZ',
        'perfluorocarbonUnitZ',
        'sulfurUnitZ',
        'nitrogenUnitZ',
        'formulaUnitZ',
        'formulaUnitM',
        'co2eFormulaUnitZ',
        'forestryUnitZ',
        'forestryUnitM',
        'co2eForestryUnitZ',
        'transportationKMZ',
        'transportationKMM',
        'co2eTransportationKMZ',
        'transportationTKMZ',
        'transportationTKMM',
        'co2eTransportationTKMZ',
      ].join(','),
    }).then(({ data }) => {
      setDictEnums(data.data);
    });
  }, []);

  return (
    <Form
      className={styles.factorData}
      layout='vertical'
      form={form}
      colon={false}
      previewTextPlaceholder='-'
    >
      <VoidField name='dataGrid'>
        <Row gutter={24}>
          <Col span={6}>
            <Field
              name='factorType'
              required={!disabled}
              title={I18N.components.valueType}
              decorator={[FormItem]}
              component={[
                Select,
                {
                  placeholder: disabled ? '' : I18N.components.valueType,
                  disabled: true,
                  onChange: val => {
                    if (val !== NUMBER_FACTOR_TYPE) {
                      form.setValues({ formula: FOSSIL_FORMULA_VAL });
                      if (formulaTempRef && formulaTempRef.current) {
                        setFormula?.(
                          cloneDeep(
                            formulaTempRef.current[
                              FORMULA_VALUE_TO_ENUM_KEY[FOSSIL_FORMULA_VAL]
                            ],
                          ),
                        );
                      }
                    }
                  },
                },
              ]}
              reactions={[
                useFieldFlattenUnitDictSource('factorDataType'),
                field => {
                  const { value } = field;

                  if (isNil(value)) {
                    return;
                  }

                  const isNumberType = value === NUMBER_FACTOR_TYPE;

                  const factorValueField = form
                    .query('dataGrid.factorValue')
                    .take();
                  const factorUnitField = form
                    .query('dataGrid.factorUnit')
                    .take();
                  const formulaField = form.query('dataGrid.formula').take();
                  const formulaDescField = form
                    .query('dataGrid.formulaDesc')
                    .take();
                  const unitField = form.query('dataGrid.unit').take();

                  factorValueField?.setState({ visible: isNumberType });
                  factorUnitField?.setState({ visible: isNumberType });
                  unitField?.setState({ visible: isNumberType });
                  formulaField?.setState({ visible: !isNumberType });
                  formulaDescField?.setState({ visible: !isNumberType });
                },
              ]}
            />
          </Col>
          <Col span={18}>
            <div className={styles.factorNumberContent}>
              <Field
                name='factorValue'
                title={I18N.carbonFootprint.factorValue}
                visible={false}
                decorator={[FormItem, { className: styles.factorNumberItem }]}
                component={[
                  NumberPicker,
                  {
                    disabled,
                    min: 0,
                    stringMode: true,
                    controls: false,
                    placeholder: disabled
                      ? ''
                      : I18N.components.factorValueList,
                  },
                ]}
              />
              <Field
                name='factorUnit'
                title=' '
                visible={false}
                decorator={[
                  FormItem,
                  { className: styles.factorNumberItem, asterisk: false },
                ]}
                component={[
                  Select,
                  {
                    placeholder: disabled
                      ? ''
                      : I18N.carbonFootprint.pleaseSelect,
                    disabled,
                    allowClear: true,
                  },
                ]}
                reactions={[useFieldFlattenUnitDictSource('cequivalentUnitZ')]}
              />
              <FormConsumer>
                {formIns => {
                  const { factorType } = formIns.values;
                  const isNumberType = factorType === NUMBER_FACTOR_TYPE;
                  return isNumberType ? (
                    <div className={styles.factorNumberItemSplit}>/</div>
                  ) : (
                    ''
                  );
                }}
              </FormConsumer>
              <Field
                name='unit'
                title=' '
                visible={false}
                decorator={[
                  FormItem,
                  {
                    className: styles.factorNumberItem,
                    asterisk: false,
                  },
                ]}
                component={[
                  Cascader,
                  {
                    disabled: true,
                    displayRender: (label: string[]) =>
                      [...(label || [])].pop(),
                  },
                ]}
                reactions={[useFieldUnitDictSource('factorUnitM')]}
              />
            </div>
          </Col>
        </Row>
        <FormConsumer>
          {formIns => {
            const { factorType } = formIns.values;
            const isNumberType = factorType === NUMBER_FACTOR_TYPE;

            return isNumberType ? (
              <div className={styles.tableContent}>
                <div className={styles.tableTitle}>
                  {I18N.components.greenhouseGasEmissions}
                </div>
                <Table
                  rowKey='type'
                  pagination={false}
                  scroll={{ x: 1320 }}
                  dataSource={gasList.filter(
                    gas => gas.type !== VALUE_TYPE_CO2E_TYPE,
                  )}
                  columns={[
                    {
                      title: I18N.components.gasType,
                      dataIndex: 'greenhouseGasesType',
                    },
                    {
                      title: I18N.components.gasName,
                      dataIndex: 'greenhouseGases',
                      render: (_, record) => {
                        const { type, greenhouseGases } = record;
                        if (['g4', 'g5'].includes(type)) {
                          return (
                            <AntdSelect
                              className={styles.gasSelect}
                              disabled={disabled}
                              value={greenhouseGases}
                              allowClear
                              placeholder={
                                disabled
                                  ? ''
                                  : I18N.carbonFootprint.pleaseSelect
                              }
                              options={
                                type === 'g4'
                                  ? dictEnums.HFCsEnum
                                  : dictEnums.PFCseNUM
                              }
                              fieldNames={{
                                value: 'dictValue',
                                label: 'dictLabel',
                              }}
                              onChange={val => {
                                Object.assign(record, { greenhouseGases: val });
                                setGasList?.([...gasList]);
                              }}
                            />
                          );
                        }
                        return greenhouseGases;
                      },
                    },
                    {
                      title: I18N.components.gasEmissions,
                      dataIndex: 'factorValue',
                      render: (_, record) => {
                        const { factorValue, factorUnit, type, factorUnitM } =
                          record;
                        const enumKey = GAS_TYPE_TO_ENUM_KEY[type];
                        return (
                          <div className={styles.tableRow}>
                            <InputNumber
                              min={0}
                              stringMode
                              value={factorValue}
                              disabled={disabled}
                              placeholder={
                                disabled ? '' : I18N.base.pleaseEnter
                              }
                              controls={false}
                              onChange={val => {
                                Object.assign(record, { factorValue: val });
                                setGasList?.([...gasList]);
                              }}
                            />
                            <AntdSelect
                              value={factorUnit}
                              placeholder={
                                disabled
                                  ? ''
                                  : I18N.carbonFootprint.pleaseSelect
                              }
                              disabled={disabled}
                              allowClear
                              fieldNames={{
                                value: 'dictValue',
                                label: 'dictLabel',
                              }}
                              options={dictEnums[enumKey]}
                              onChange={val => {
                                Object.assign(record, { factorUnit: val });
                                setGasList?.([...gasList]);
                              }}
                            />
                            <div>/</div>
                            <AntdCascader
                              disabled
                              value={factorUnitM?.split(',')}
                              options={unitDicts}
                              fieldNames={{
                                value: 'dictValue',
                                label: 'dictLabel',
                              }}
                              displayRender={(label: string[]) =>
                                [...(label || [])].pop()
                              }
                            />
                          </div>
                        );
                      },
                    },
                    ...(co2eColumnShow
                      ? [
                          {
                            title: I18N.components.carbonDioxideEmissions,
                            dataIndex: 'factorValue',
                            render: (_, record) => {
                              const {
                                type,
                                co2eValue,
                                co2eFactorUnit,
                                factorUnitM,
                              } = record;
                              if (['g2', 'g3'].includes(type)) {
                                return (
                                  <div className={styles.tableRow}>
                                    <InputNumber
                                      min={0}
                                      stringMode
                                      value={co2eValue}
                                      disabled={disabled}
                                      placeholder={
                                        disabled ? '' : I18N.base.pleaseEnter
                                      }
                                      controls={false}
                                      onChange={val => {
                                        Object.assign(record, {
                                          co2eValue: val,
                                        });
                                        setGasList?.([...gasList]);
                                      }}
                                    />
                                    <AntdSelect
                                      value={co2eFactorUnit}
                                      disabled={disabled}
                                      placeholder={
                                        disabled
                                          ? ''
                                          : I18N.carbonFootprint.pleaseSelect
                                      }
                                      fieldNames={{
                                        value: 'dictValue',
                                        label: 'dictLabel',
                                      }}
                                      allowClear
                                      options={dictEnums.cequivalentUnitZ}
                                      onChange={val => {
                                        Object.assign(record, {
                                          co2eFactorUnit: val,
                                        });
                                        setGasList?.([...gasList]);
                                      }}
                                    />
                                    <div>/</div>
                                    <AntdCascader
                                      disabled
                                      value={factorUnitM?.split(',')}
                                      options={unitDicts}
                                      fieldNames={{
                                        value: 'dictValue',
                                        label: 'dictLabel',
                                      }}
                                      displayRender={(label: string[]) =>
                                        [...(label || [])].pop()
                                      }
                                    />
                                  </div>
                                );
                              }
                              return null;
                            },
                          },
                        ]
                      : []),
                    {
                      title: I18N.components.carbonDioxideIs,
                      dataIndex: 'total',
                      onCell: (_, index) => ({
                        rowSpan: index === 0 ? 7 : 0,
                      }),
                      render: () =>
                        gasList.find(gas => gas.type === VALUE_TYPE_CO2E_TYPE)
                          ?.calValue,
                    },
                  ]}
                />
              </div>
            ) : (
              ''
            );
          }}
        </FormConsumer>
        <Row gutter={24}>
          <Col span={6}>
            <Field
              name='formula'
              title={I18N.emission.selectFormula}
              required={!disabled}
              decorator={[FormItem]}
              component={[
                Select,
                {
                  placeholder: disabled
                    ? ''
                    : I18N.carbonFootprint.pleaseSelect,
                  disabled,
                  onChange: (val: string) => {
                    if (formulaTempRef && formulaTempRef.current) {
                      setFormula?.(
                        cloneDeep(
                          formulaTempRef.current[
                            FORMULA_VALUE_TO_ENUM_KEY[val]
                          ],
                        ),
                      );
                    }
                  },
                },
              ]}
              reactions={[
                useFieldFlattenUnitDictSource('formulaChance'),
                field => {
                  form.setValues({
                    formulaDesc: FORMULA_DESC[field.value],
                  });
                },
              ]}
            />
          </Col>
          <Col span={18}>
            <Field
              name='formulaDesc'
              title=' '
              visible={false}
              decorator={[FormItem]}
              component={[
                Input,
                { placeholder: disabled ? '' : '', disabled, readOnly: true },
              ]}
            />
          </Col>
        </Row>
        <FormConsumer>
          {formIns => {
            const { factorType, formula: formulaValue } = formIns.values;
            const isNumberType = factorType === NUMBER_FACTOR_TYPE;
            const unitEnums = FORMULA_VALUE_TO_UNIT_ENUM[formulaValue];

            return !isNumberType ? (
              <>
                <div className={styles.tableContent}>
                  <div className={styles.tableTitle}>
                    {I18N.components.calculationResults}
                  </div>
                  <Table
                    rowKey='id'
                    dataSource={formula.carbonFactorGas}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    columns={[
                      {
                        title: I18N.components.greenhouseGases,
                        dataIndex: 'greenhouseGases',
                      },
                      {
                        title: I18N.carbonFootprint.factorValue,
                        dataIndex: 'factorValue',
                      },
                      {
                        title: I18N.components.factorUnit,
                        dataIndex: 'factorUnit',
                        render: (_, record) => {
                          const { factorUnit, factorUnitM, type } = record;

                          return (
                            <div className={styles.tableRow}>
                              <AntdSelect
                                value={factorUnit}
                                placeholder={
                                  disabled
                                    ? ''
                                    : I18N.carbonFootprint.pleaseSelect
                                }
                                disabled={disabled}
                                fieldNames={{
                                  value: 'dictValue',
                                  label: 'dictLabel',
                                }}
                                allowClear
                                options={
                                  dictEnums[
                                    unitEnums[
                                      type === FORMULA_TYPE_CO2E_TYPE ? 2 : 0
                                    ]
                                  ]
                                }
                                onChange={val => {
                                  Object.assign(record, { factorUnit: val });
                                  setFormula?.({ ...formula });
                                }}
                              />
                              <div>/</div>
                              <AntdSelect
                                value={factorUnitM}
                                placeholder={
                                  disabled
                                    ? ''
                                    : I18N.carbonFootprint.pleaseSelect
                                }
                                disabled={disabled}
                                fieldNames={{
                                  value: 'dictValue',
                                  label: 'dictLabel',
                                }}
                                allowClear
                                options={dictEnums[unitEnums[1]]}
                                onChange={(val, opt) => {
                                  const activeUnit =
                                    (opt as { dictLabel: string })?.dictLabel ||
                                    '';

                                  formula.carbonFactorGas.forEach(gas => {
                                    Object.assign(gas, {
                                      factorUnitM: val,
                                      activeUnit,
                                    });
                                  });

                                  if (formulaValue === FOSSIL_FORMULA_VAL) {
                                    Object.assign(
                                      formula.carbonFactorFormula[0],
                                      { paraUnit: `GJ/${activeUnit}` },
                                    );
                                  }
                                  setFormula?.({ ...formula });
                                }}
                              />
                            </div>
                          );
                        },
                      },
                      {
                        title: I18N.components.activityDataSheet3,
                        dataIndex: 'activeUnit',
                      },
                    ]}
                  />
                </div>
                <div className={styles.tableContent}>
                  <div className={styles.tableTitle}>
                    {I18N.components.calculateParameters}
                  </div>
                  <Table
                    rowKey='id'
                    dataSource={formula.carbonFactorFormula}
                    scroll={{ x: 1200 }}
                    pagination={false}
                    columns={[
                      {
                        title: I18N.emission.parameterName,
                        dataIndex: 'paraName',
                      },
                      {
                        title: I18N.emission.parameterValues,
                        dataIndex: 'paraValue',
                        render: (_, record, index) => {
                          const { paraValue } = record;
                          return (
                            <div className={styles.tableRow}>
                              <InputNumber
                                min={0}
                                stringMode
                                value={paraValue}
                                disabled={
                                  index ===
                                    formula.carbonFactorFormula.length - 1 &&
                                  [
                                    FOSSIL_FORMULA_VAL,
                                    FOREST_FORMULA_VAL,
                                  ].includes(formulaValue)
                                    ? true
                                    : disabled
                                }
                                placeholder={
                                  disabled ? '' : I18N.base.pleaseEnter
                                }
                                controls={false}
                                onChange={val => {
                                  Object.assign(record, { paraValue: val });

                                  const factorValue =
                                    calcFactorValue(formulaValue);
                                  formula.carbonFactorGas.forEach(gas => {
                                    Object.assign(gas, { factorValue });
                                  });

                                  setFormula?.({ ...formula });
                                }}
                              />
                            </div>
                          );
                        },
                      },
                      {
                        title: I18N.emission.parameterUnits,
                        dataIndex: 'paraUnit',
                      },
                    ]}
                  />
                </div>
              </>
            ) : (
              ''
            );
          }}
        </FormConsumer>
      </VoidField>
    </Form>
  );
};

export default FactorData;
