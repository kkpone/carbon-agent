/**
 * @description formily 工序排放数据
 */
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { connect, mapProps, useField, useForm } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Radio, TableProps } from 'antd';
import { compact, isArray } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';
import { postProductDataProcessElCalc } from '@/views/cbam/ReportForm/service';
import {
  ConfigCNResp,
  EleCalculator,
  ProductAttribution,
} from '@/views/cbam/ReportForm/type';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import { DataInput, DataInputGroup, PowerData } from './components';
import styles from './index.module.less';
import { initEleCalculatorList, initProductAttributionList } from './until';
import {
  EL_SOURCE_DISABLED,
  ELEMENT_ENUM,
  ELEMENT_NAME,
  EXISTS_ENUM,
  EXISTS_OPTION,
} from '../../constant';

const {
  DIRECT_EMISSION,
  THERMAL_INPUT_OUTPUT,
  INPUT_RECOVERY_GAS,
  EL_USAGE,
  POWER_OUTPUT,
} = ELEMENT_ENUM;

export interface UpdateProcedureTotalEmissionProps {
  emission?: number | string;
  row: ProductAttribution;
}

export interface UpdateProcedureSourceProps {
  emissionSource: number | string;
  row: ProductAttribution;
}

type ProcedureEmissionTableProps = TableProps<Record<string, any>> & {
  value: ProductAttribution[];
  onChange: (value: ProductAttribution[]) => void;
};

const ProcedureEmissionTable: FC<ProcedureEmissionTableProps> = props => {
  const { value, onChange } = props;

  const { id: cbamId } = useCbamPageInfo();

  const editableFormRef = useRef<EditableFormInstance<ConfigCNResp>>();

  const enumOptions = useAllEnumsBatch('CBAMElecsource');
  /** 来源枚举-电力排放系数 */
  const elSourceOption = enumOptions?.CBAMElecsource || [];

  const form = useForm();

  const field = useField();

  /** 工序id */
  const productProcessId = form.getValuesIn('productProcessId');

  /** 电力配置 */
  const initElList = form.getValuesIn('eleCalculatorList');

  /** 是否是详情 */
  const isDetail = field.readPretty || field.disabled;

  /** 电力计算配置数据 */
  const [eleCalculatorList, setEleCalculatorList] = useState<EleCalculator[]>(
    initEleCalculatorList(cbamId, productProcessId),
  );

  /** 电力计算配置数据改变方法 */
  const onEleCalculatorChange = (
    valueIndex: number,
    fieldName: string,
    emission?: number,
  ) => {
    const newElData = eleCalculatorList?.map((item, index) => {
      if (valueIndex === index) {
        return {
          ...item,
          [fieldName]: emission,
        };
      }
      return {
        ...item,
      };
    });
    setEleCalculatorList(newElData);
  };

  /** 重置电力计算器配置数据 */
  const onEleCalculatorReset = () => {
    const newElData = eleCalculatorList?.map(item => ({
      ...item,
      eleValue: null,
      coefficient: null,
    }));
    setEleCalculatorList(newElData);
  };

  useEffect(() => {
    /** 赋值电力计算器配置数据 */
    form?.setValuesIn('eleCalculatorList', eleCalculatorList);
  }, [eleCalculatorList]);

  /** 表格数据 */
  const [dataSource, setDataSource] = useState<ProductAttribution[]>(
    initProductAttributionList(cbamId),
  );

  /** 更新数据方法 */
  const updateData = (
    emissionElement: number,
    fieldName: string,
    fieldValue?: number | string,
  ) => {
    /** 更新数据 */
    const newData = value?.map(item => {
      if (item.emissionElement === emissionElement) {
        return {
          ...item,
          [fieldName]: fieldValue,
        };
      }
      return { ...item };
    });
    setDataSource(newData);
    onChange(newData);
  };

  /** 上一次的值 */
  const [preValue, setPreValue] = useState(value);
  if (isArray(value) && value?.length && value !== preValue) {
    setPreValue(value);
    setDataSource(value);
    setEleCalculatorList(initElList);
  }

  /** 表格编辑态key */
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  /** 控制表格编辑态 */
  useEffect(() => {
    if (isDetail) {
      setEditableRowKeys([]);
    } else {
      setEditableRowKeys(
        compact(
          dataSource?.map(item => {
            if (item.emissionElement === DIRECT_EMISSION) {
              return undefined;
            }
            return item.emissionElement;
          }),
        ),
      );
    }
  }, [isDetail]);

  const columns = (): ProColumns<ProductAttribution>[] =>
    compact([
      {
        title: I18N.cbam.element,
        dataIndex: 'emissionElement_name',
        readonly: true,
        width: 90,
        renderText(_, record) {
          const { emissionElement } = record || {};
          return emissionElement ? ELEMENT_NAME?.[emissionElement] || '-' : '-';
        },
      },
      {
        title: I18N.cbam.doesItExist,
        dataIndex: 'isExists',
        width: 90,
        valueType: 'radio',
        fieldProps: {
          options: EXISTS_OPTION,
        },
        editable: (_, record) => record?.emissionElement !== EL_USAGE,
        render(_, entity) {
          const { emissionElement, isExists } = entity;
          if (emissionElement === DIRECT_EMISSION) {
            return <div>-</div>;
          }
          return (
            <Radio.Group
              key={`${emissionElement}isExists`}
              disabled
              value={isExists}
              options={EXISTS_OPTION}
            />
          );
        },
      },
      {
        title: I18N.certificationReviewCenter.data,
        dataIndex: 'data',
        width: 320,
        renderFormItem: (_, config) => {
          const {
            emissionElement,
            inputPower,
            inputFactor,
            outPower,
            outFactor,
            eleChoose,
            eleSource,
            isExists,
          } = config?.record || {};

          /** 不存在=>清空并隐藏数据 */
          const hiddenData = isExists === EXISTS_ENUM.NOT_EXISTS;

          switch (emissionElement) {
            case DIRECT_EMISSION:
              return (
                <DataInput
                  label={I18N.cbam.directEmissions}
                  disabled
                  value={outPower}
                />
              );
            case THERMAL_INPUT_OUTPUT:
              return (
                <DataInputGroup
                  hiddenData={hiddenData}
                  onChangeData={(fieldName, emission) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, emission);
                  }}
                  options={[
                    {
                      filedName: 'inputPower',
                      label: I18N.cbam.thermalInputT,
                      dataValue: inputPower,
                    },
                    {
                      filedName: 'inputFactor',
                      label: I18N.cbam.inputThermalExhaust,
                      dataValue: inputFactor,
                    },
                    {
                      filedName: 'outPower',
                      label: I18N.cbam.thermalOutputT,
                      dataValue: outPower,
                    },
                    {
                      filedName: 'outFactor',
                      label: I18N.cbam.outputHeatDissipation2,
                      dataValue: outFactor,
                    },
                  ]}
                />
              );
            case INPUT_RECOVERY_GAS:
              return (
                <DataInputGroup
                  hiddenData={hiddenData}
                  onChangeData={(fieldName, emission) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, emission);
                  }}
                  options={[
                    {
                      filedName: 'inputPower',
                      label: I18N.cbam.exhaustGasInputT,
                      dataValue: inputPower,
                    },
                    {
                      filedName: 'inputFactor',
                      label: I18N.cbam.inputExhaustEmissions,
                      dataValue: inputFactor,
                    },
                    {
                      filedName: 'outPower',
                      label: I18N.cbam.exhaustGasRecoveryT,
                      dataValue: outPower,
                    },
                    {
                      filedName: 'outFactor',
                      label: I18N.cbam.recyclingExhaustEmissions,
                      dataValue: outFactor,
                    },
                  ]}
                />
              );
            case EL_USAGE:
              return (
                <PowerData
                  hiddenData={hiddenData}
                  eleCalculatorList={eleCalculatorList}
                  onEleCalculatorChange={onEleCalculatorChange}
                  onEleCalculatorReset={onEleCalculatorReset}
                  elSourceOption={elSourceOption}
                  eleChoose={eleChoose}
                  onDisabledEleChoose={() => {
                    /** 更新数据 */
                    const newData = value?.map(item => {
                      if (item.emissionElement === emissionElement) {
                        return {
                          ...item,
                          eleSource: EL_SOURCE_DISABLED,
                        };
                      }
                      return { ...item };
                    });
                    setDataSource(newData);
                    onChange(newData);
                  }}
                  onResetElData={newEleChoose => {
                    /** 更新数据 */
                    const newData = value?.map(item => {
                      if (item.emissionElement === emissionElement) {
                        return {
                          ...item,
                          eleChoose: newEleChoose,
                          inputPower: null,
                          inputFactor: null,
                        };
                      }
                      return { ...item };
                    }) as ProductAttribution[];
                    setDataSource(newData);
                    onChange(newData);
                  }}
                  eleSource={eleSource}
                  onClickCalc={async () => {
                    const { data } = await postProductDataProcessElCalc({
                      cbamId,
                      eleCalculatorList,
                      productProcessId,
                    });
                    const { eleUse, elePer } = data?.data || {};

                    /** 更新数据 */
                    const newData = value?.map(item => {
                      if (item.emissionElement === emissionElement) {
                        return {
                          ...item,
                          inputPower: eleUse,
                          inputFactor: elePer,
                        };
                      }
                      return { ...item };
                    });
                    setDataSource(newData);
                    onChange(newData);
                  }}
                  onChangeData={(fieldName, fieldNameValue) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, fieldNameValue);
                  }}
                  dataInputOptions={[
                    {
                      filedName: 'inputPower',
                      label: I18N.cbam.electricityUsageM,
                      dataValue: inputPower,
                    },
                    {
                      filedName: 'inputFactor',
                      label: I18N.cbam.useElectricPowerBank,
                      dataValue: inputFactor,
                    },
                  ]}
                />
              );
            case POWER_OUTPUT:
              return (
                <DataInputGroup
                  hiddenData={hiddenData}
                  onChangeData={(fieldName, emission) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, emission);
                  }}
                  options={[
                    {
                      filedName: 'outPower',
                      label: I18N.cbam.powerOutputT2,
                      dataValue: outPower,
                    },
                    {
                      filedName: 'outFactor',
                      label: I18N.cbam.outputPowerGrid2,
                      dataValue: outFactor,
                    },
                  ]}
                />
              );
            default:
              return <div>-</div>;
          }
        },
        render: (_, row) => {
          const {
            emissionElement,
            inputPower,
            inputFactor,
            outPower,
            outFactor,
            eleChoose,
            eleSource,
            isExists,
          } = row || {};

          /** 不存在=>清空并隐藏数据 */
          const hiddenData = isExists === EXISTS_ENUM.NOT_EXISTS;

          switch (emissionElement) {
            case DIRECT_EMISSION:
              return (
                <DataInput
                  label={I18N.cbam.directEmissions}
                  disabled
                  value={outPower}
                />
              );
            case THERMAL_INPUT_OUTPUT:
              return (
                <DataInputGroup
                  hiddenData={hiddenData}
                  disabled
                  onChangeData={(fieldName, emission) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, emission);
                  }}
                  options={[
                    {
                      filedName: 'inputPower',
                      label: I18N.cbam.thermalInputT,
                      dataValue: inputPower,
                    },
                    {
                      filedName: 'inputFactor',
                      label: I18N.cbam.inputThermalExhaust,
                      dataValue: inputFactor,
                    },
                    {
                      filedName: 'outPower',
                      label: I18N.cbam.thermalOutputT,
                      dataValue: outPower,
                    },
                    {
                      filedName: 'outFactor',
                      label: I18N.cbam.outputHeatDissipation2,
                      dataValue: outFactor,
                    },
                  ]}
                />
              );
            case INPUT_RECOVERY_GAS:
              return (
                <DataInputGroup
                  hiddenData={hiddenData}
                  disabled
                  onChangeData={(fieldName, emission) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, emission);
                  }}
                  options={[
                    {
                      filedName: 'inputPower',
                      label: I18N.cbam.exhaustGasInputT,
                      dataValue: inputPower,
                    },
                    {
                      filedName: 'inputFactor',
                      label: I18N.cbam.inputExhaustEmissions,
                      dataValue: inputFactor,
                    },
                    {
                      filedName: 'outPower',
                      label: I18N.cbam.exhaustGasRecoveryT,
                      dataValue: outPower,
                    },
                    {
                      filedName: 'outFactor',
                      label: I18N.cbam.recyclingExhaustEmissions,
                      dataValue: outFactor,
                    },
                  ]}
                />
              );
            case EL_USAGE:
              return (
                <PowerData
                  hiddenData={hiddenData}
                  disabled
                  eleCalculatorList={eleCalculatorList}
                  onEleCalculatorChange={onEleCalculatorChange}
                  onEleCalculatorReset={onEleCalculatorReset}
                  elSourceOption={elSourceOption}
                  eleChoose={eleChoose}
                  onDisabledEleChoose={() => {
                    /** 更新数据 */
                    const newData = value?.map(item => {
                      if (item.emissionElement === emissionElement) {
                        return {
                          ...item,
                          eleSource: EL_SOURCE_DISABLED,
                        };
                      }
                      return { ...item };
                    });
                    setDataSource(newData);
                    onChange(newData);
                  }}
                  onResetElData={newEleChoose => {
                    /** 更新数据 */
                    const newData = value?.map(item => {
                      if (item.emissionElement === emissionElement) {
                        return {
                          ...item,
                          eleChoose: newEleChoose,
                          inputPower: null,
                          inputFactor: null,
                        };
                      }
                      return { ...item };
                    }) as ProductAttribution[];
                    setDataSource(newData);
                    onChange(newData);
                  }}
                  eleSource={eleSource}
                  onClickCalc={async () => {
                    const { data } = await postProductDataProcessElCalc({
                      cbamId,
                      eleCalculatorList,
                      productProcessId,
                    });
                    const { eleUse, elePer } = data?.data || {};

                    /** 更新数据 */
                    const newData = value?.map(item => {
                      if (item.emissionElement === emissionElement) {
                        return {
                          ...item,
                          inputPower: eleUse,
                          inputFactor: elePer,
                        };
                      }
                      return { ...item };
                    });
                    setDataSource(newData);
                    onChange(newData);
                  }}
                  onChangeData={(fieldName, fieldNameValue) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, fieldNameValue);
                  }}
                  dataInputOptions={[
                    {
                      filedName: 'inputPower',
                      label: I18N.cbam.electricityUsageM,
                      dataValue: inputPower,
                    },
                    {
                      filedName: 'inputFactor',
                      label: I18N.cbam.useElectricPowerBank,
                      dataValue: inputFactor,
                    },
                  ]}
                />
              );
            case POWER_OUTPUT:
              return (
                <DataInputGroup
                  hiddenData={hiddenData}
                  disabled
                  onChangeData={(fieldName, emission) => {
                    /** 更新数据 */
                    updateData(emissionElement, fieldName, emission);
                  }}
                  options={[
                    {
                      filedName: 'outPower',
                      label: I18N.cbam.powerOutputT2,
                      dataValue: outPower,
                    },
                    {
                      filedName: 'outFactor',
                      label: I18N.cbam.outputPowerGrid2,
                      dataValue: outFactor,
                    },
                  ]}
                />
              );
            default:
              return <div>-</div>;
          }
        },
      },
    ]);

  return (
    <EditableProTable<ProductAttribution>
      key={`ProcedureEmission${cbamId}`}
      className={styles.emissionWrapper}
      columns={columns()}
      editableFormRef={editableFormRef}
      rowKey='emissionElement'
      value={value}
      bordered
      recordCreatorProps={false}
      toolBarRender={false}
      editable={{
        type: 'multiple',
        editableKeys,
        onValuesChange: (_record, recordList) => {
          setDataSource(recordList);
          onChange(recordList);
        },
      }}
    />
  );
};

export const FormilyProcedureEmissionTable = connect(
  ProcedureEmissionTable,
  mapProps({ dataSource: true }, props => ({
    ...props,
  })),
);
