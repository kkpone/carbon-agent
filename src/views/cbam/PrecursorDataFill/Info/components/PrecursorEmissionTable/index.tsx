/**
 * @description formily 前体隐含排放
 */
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { connect, mapProps, useField } from '@formily/react';
import { InputNumber, Select, TableProps } from 'antd';
import { compact, isArray, isNumber } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import I18N from '@/lang/I18N';
import {
  FACTORY_LEVEL_ENUM,
  FACTORY_LEVEL_NAME,
} from '@/views/cbam/ReportForm/Info/ProductData/OutsourcedPrecursor/Info/constant';
import { ConfigCNResp, ProductAttribution } from '@/views/cbam/ReportForm/type';
import { useCbamEnums } from '@/views/cbam/hook';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import { ImpliedEmissionInput } from './components';
import {
  generateUnit,
  initProductAttributionList,
  numberPropsData,
} from './until';

export interface UpdatePrecursorTotalEmissionProps {
  emission?: number | string;
  row: ProductAttribution;
}

export interface UpdatePrecursorSourceProps {
  emissionSource: number | string;
  row: ProductAttribution;
}

const { EL_USAGE, EL_EMISSION_COEFFICIENT, IMPLIED_EMISSION_INDIRECT } =
  FACTORY_LEVEL_ENUM;

type PrecursorEmissionTableProps = TableProps<Record<string, any>> & {
  value: ProductAttribution[];
  onChange: (value: ProductAttribution[]) => void;
  unit: string;
};

const PrecursorEmissionTable: FC<PrecursorEmissionTableProps> = props => {
  const { value, onChange, unit } = props;

  const editableFormRef = useRef<EditableFormInstance<ConfigCNResp>>();

  const field = useField();

  /** 来源枚举 */
  const sourceOption = useCbamEnums('EleSource');

  const enumOptions = useAllEnumsBatch('CBAMElecsource');
  /** 来源枚举-电力排放系数 */
  const elSourceOption =
    enumOptions?.CBAMElecsource?.map(item => ({
      name: item.dictLabel,
      code: item.dictValue,
    })) || [];

  /** 是否是详情 */
  const isDetail = field.readPretty || field.disabled;

  /** 表格数据 */
  const [dataSource, setDataSource] = useState<ProductAttribution[]>(
    initProductAttributionList,
  );

  /** 上一次的值 */
  const [preValue, setPreValue] = useState(value);
  if (isArray(value) && value?.length && value !== preValue) {
    setPreValue(value);
    setDataSource(value);
  }

  /** 表格编辑态key */
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  /** 控制表格编辑态 */
  useEffect(() => {
    if (isDetail) {
      setEditableRowKeys([]);
    } else {
      setEditableRowKeys(
        compact(dataSource?.map(item => item.emissionElement)),
      );
    }
  }, [isDetail]);

  const columns = (): ProColumns<ProductAttribution>[] =>
    compact([
      {
        title: I18N.cbam.numberOfFactoryLevels,
        dataIndex: 'emissionElement_name',
        readonly: true,
        width: 100,
        renderText(_, record) {
          const { emissionElement } = record || {};
          return emissionElement
            ? FACTORY_LEVEL_NAME?.[emissionElement] || '-'
            : '-';
        },
        renderFormItem: (_, config) => {
          const { emissionElement } = config?.record || {};
          return emissionElement
            ? FACTORY_LEVEL_NAME?.[emissionElement] || '-'
            : '-';
        },
      },
      {
        title: I18N.cbam.carbonDioxideEmissions,
        dataIndex: 'emission',
        ellipsis: true,
        width: 150,
        valueType: 'digit',
        renderFormItem: (_, config) => {
          const { emissionElement } = config?.record || {};

          if (emissionElement === IMPLIED_EMISSION_INDIRECT) {
            /** 电力使用 */
            const elUsage = value?.find(
              item => item.emissionElement === EL_USAGE,
            )?.emission;

            /** 电力排放系数 */
            const elEmissionCoefficient = value?.find(
              item => item.emissionElement === EL_EMISSION_COEFFICIENT,
            )?.emission;

            /** 隐含排放 */
            const impliedEmission =
              isNumber(elUsage) && isNumber(elEmissionCoefficient)
                ? elUsage * elEmissionCoefficient
                : undefined;

            return <ImpliedEmissionInput impliedEmission={impliedEmission} />;
          }

          return (
            <InputNumber
              {...numberPropsData}
              placeholder={I18N.base.pleaseEnter}
            />
          );
        },
      },
      {
        title: I18N.Factors.unit,
        dataIndex: 'unit',
        readonly: true,
        width: 130,
        renderText: (_, record) => {
          const { emissionElement } = record || {};
          return generateUnit(unit, emissionElement);
        },
      },
      {
        title: I18N.cbam.source,
        dataIndex: 'emissionSource',
        ellipsis: true,
        width: 230,
        valueType: 'select',
        fieldProps: (_, { entity }) => {
          const { emissionElement } = entity || {};

          let options = sourceOption;
          if (emissionElement === EL_EMISSION_COEFFICIENT) {
            options = elSourceOption;
          }

          return {
            options,
            fieldNames: {
              label: 'name',
              value: 'code',
            },
          };
        },
        renderFormItem(_, config) {
          const { emissionElement } = config?.record || {};

          /** 是否是电力排放系数 */
          const isElEmissionCoefficient =
            emissionElement === EL_EMISSION_COEFFICIENT;

          const options = isElEmissionCoefficient
            ? elSourceOption
            : sourceOption;

          if (emissionElement === IMPLIED_EMISSION_INDIRECT) {
            return <div />;
          }

          return (
            <Select
              disabled={!isElEmissionCoefficient}
              options={options}
              fieldNames={{
                label: 'name',
                value: 'code',
              }}
              placeholder={I18N.Factors.pleaseSelect}
            />
          );
        },
      },
    ]);

  return (
    <EditableProTable<ProductAttribution>
      key='precursorEmission'
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

export const FormilyPrecursorEmissionTable = connect(
  PrecursorEmissionTable,
  mapProps({ dataSource: true }, props => ({
    ...props,
  })),
);
