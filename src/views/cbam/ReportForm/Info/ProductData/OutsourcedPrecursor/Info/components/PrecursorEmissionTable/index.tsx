/**
 * @description formily 前体排放数据
 */
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { onFieldValueChange } from '@formily/core';
import { connect, mapProps, useField, useForm } from '@formily/react';
import { InputNumber, Select, TableProps } from 'antd';
import { compact, isArray, isNumber } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import I18N from '@/lang/I18N';
import { ProductAttribution } from '@/views/cbam/ReportForm/type';
import { useCbamEnums } from '@/views/cbam/hook';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import PrecursorDefaultValuePicker from './PrecursorDefaultValuePicker';
import {
  DefaultSelect,
  EmissionSourceSelect,
  ImpliedEmissionInput,
} from './components';
import { SelectedDefaultValue } from './defaultValueTypes';
import style from './index.module.less';
import { generateUnit, numberPropsData, sharedOnCell } from './until';
import { DEFAULT_ENUM } from '../../../../constant';
import {
  FACTORY_LEVEL_ENUM,
  FACTORY_LEVEL_NAME,
  SOURCE_ENUM,
  USE_DEFAULT_ENUM,
} from '../../constant';

const { DEFAULT } = SOURCE_ENUM;
/** 电力排放系数来源：基于其他公开数据。 */
const PUBLIC_DATA_ELE_SOURCE = 2;

export interface UpdatePrecursorTotalEmissionProps {
  emission?: number | string;
  row: ProductAttribution;
}

export interface UpdatePrecursorSourceProps {
  emissionSource: number | string;
  row: ProductAttribution;
}

const { NOT } = DEFAULT_ENUM;

const {
  IMPLIED_EMISSION_DIRECT,
  EL_USAGE,
  EL_EMISSION_COEFFICIENT,
  IMPLIED_EMISSION_INDIRECT,
  REASON_USE_DEFAULT,
} = FACTORY_LEVEL_ENUM;

type PrecursorEmissionTableProps = TableProps<Record<string, any>> & {
  value: ProductAttribution[];
  onChange: (value: ProductAttribution[]) => void;
  /** 报表id */
  cbamId?: number;
};

const PrecursorEmissionTable: FC<PrecursorEmissionTableProps> = props => {
  const { value, onChange, cbamId } = props;

  const editableFormRef = useRef<EditableFormInstance<ProductAttribution>>();

  const form = useForm();

  const field = useField();

  /** 来源枚举 */
  const sourceOption = useCbamEnums('EleSource');

  /** 使用默认值的原因枚举 */
  const defaultReasonOption = useCbamEnums('DefaultReason');

  const enumOptions = useAllEnumsBatch('CBAMElecsource,CBAMcountryinfo');
  /** 来源枚举-电力排放系数 */
  const elSourceOption =
    enumOptions?.CBAMElecsource?.map(item => ({
      name: item.dictLabel,
      code: item.dictValue,
    })) || [];

  /** 是否是详情 */
  const isDetail = field.readPretty || field.disabled;

  /** 公共单位，默认按吨显示 */
  const formUnit = form.getValuesIn('unit');
  const unit = !formUnit || formUnit === I18N.Factors.unit ? 't' : formUnit;

  /** 产品类别 */
  const productCategoryId = form.getValuesIn('productCategoryId');

  /** 前体来源国家或地区，从前体基本信息带入 */
  const countryValue = form.getValuesIn('countryCode');

  const countryName =
    form.getValuesIn('countryName') ||
    enumOptions?.CBAMcountryinfo?.find(item => item.dictValue === countryValue)
      ?.dictLabel;

  const productCategoryName = form.getValuesIn('productCategoryName');

  /** 当前是否使用默认值计算 */
  const [currentIsDefault, setCurrentIsDefault] = useState<number>();

  const isUsingDefault =
    (currentIsDefault ?? form.getValuesIn('isDefault')) ===
    USE_DEFAULT_ENUM.USE_DEFAULT;

  /** 初始dataSource */
  const initProductAttributionList = [
    {
      emissionElement: IMPLIED_EMISSION_DIRECT,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: EL_USAGE,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: EL_EMISSION_COEFFICIENT,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: IMPLIED_EMISSION_INDIRECT,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: REASON_USE_DEFAULT,
      cbamId,
      isProcess: NOT,
    },
  ];

  /** 表格数据 */
  const [dataSource, setDataSource] = useState<ProductAttribution[]>(
    initProductAttributionList,
  );

  /** 同步接口反显值到表格数据及 EditableProTable 内部编辑表单。 */
  useEffect(() => {
    if (!isArray(value) || !value.length) return;

    setDataSource(value);
    value.forEach(item => {
      if (item.emissionElement !== undefined) {
        editableFormRef.current?.setRowData?.(
          String(item.emissionElement),
          item,
        );
      }
    });
  }, [value]);

  /** 表格编辑态key */
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  /** 控制表格编辑态 */
  useEffect(() => {
    if (isDetail) {
      setEditableRowKeys([]);
    } else {
      setEditableRowKeys(
        compact(
          dataSource
            ?.filter(
              item =>
                !isUsingDefault ||
                ![EL_USAGE, EL_EMISSION_COEFFICIENT].includes(
                  item.emissionElement as number,
                ),
            )
            .map(item => item.emissionElement),
        ),
      );
    }
  }, [dataSource, isDetail, isUsingDefault]);

  /** 监听是否使用默认值 */
  useEffect(() => {
    if (isDetail) return undefined;
    form.addEffects('isDefault', () => {
      onFieldValueChange('isDefault', isDefaultField => {
        setCurrentIsDefault(isDefaultField.value);
      });
    });

    return () => {
      form.removeEffects('isDefault');
    };
  }, [form, isDetail]);

  const currentData = isArray(value) && value.length ? value : dataSource || [];

  const directEmissionRecord = currentData.find(
    item => item.emissionElement === IMPLIED_EMISSION_DIRECT,
  );

  const visibleDataSource = isUsingDefault
    ? currentData.filter(
        item =>
          ![EL_USAGE, EL_EMISSION_COEFFICIENT].includes(
            item.emissionElement as number,
          ),
      )
    : currentData;

  const updateSelectedDefaultValue = (selection?: SelectedDefaultValue) => {
    const newData = currentData?.map(item => {
      switch (item.emissionElement) {
        case IMPLIED_EMISSION_DIRECT:
          return {
            ...item,
            cnCode: selection?.cnCode,
            cnName: selection?.cnName,
            defaultCnId: selection?.defaultCnId,
            emission: selection?.directEmission,
            emissionSource: selection ? DEFAULT : undefined,
          };
        case EL_USAGE:
          return {
            ...item,
            emission: selection?.indirectEmission,
            emissionSource: selection ? DEFAULT : undefined,
          };
        case EL_EMISSION_COEFFICIENT:
          return {
            ...item,
            emission: selection ? 1 : undefined,
            emissionSource: selection ? PUBLIC_DATA_ELE_SOURCE : undefined,
          };
        case IMPLIED_EMISSION_INDIRECT:
          return {
            ...item,
            emission: selection?.indirectEmission,
          };
        default:
          return { ...item };
      }
    });
    setDataSource(newData);
    newData.forEach(item => {
      if (item.emissionElement !== undefined) {
        editableFormRef.current?.setRowData?.(
          String(item.emissionElement),
          item,
        );
      }
    });
    onChange(newData);
  };

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
        render: (_value, record) => record.emission ?? '-',
        renderFormItem: (_, config) => {
          const { emissionElement } = config?.record || {};
          if (emissionElement === IMPLIED_EMISSION_DIRECT) {
            return (
              <InputNumber
                {...numberPropsData}
                disabled={isUsingDefault}
                placeholder={I18N.base.pleaseEnter}
              />
            );
          }

          if (emissionElement === IMPLIED_EMISSION_INDIRECT) {
            if (isUsingDefault) {
              return (
                <InputNumber
                  {...numberPropsData}
                  disabled
                  placeholder={I18N.base.pleaseEnter}
                />
              );
            }
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
        onCell: sharedOnCell,
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
        onCell: sharedOnCell,
      },
      {
        title: I18N.cbam.source,
        dataIndex: 'emissionSource',
        ellipsis: true,
        width: 130,
        valueType: 'select',
        fieldProps: (_, { entity }) => {
          const { emissionElement } = entity || {};

          let options = sourceOption;
          if (emissionElement === EL_EMISSION_COEFFICIENT) {
            options = elSourceOption;
          }
          if (emissionElement === REASON_USE_DEFAULT) {
            options = defaultReasonOption;
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

          let options = sourceOption;
          if (emissionElement === EL_EMISSION_COEFFICIENT) {
            options = elSourceOption;
          }
          if (emissionElement === REASON_USE_DEFAULT) {
            /** 检查默认值原因-若电力使用或隐含排放（直接）中任意来源均未选择为默认值，则置灰不可编辑 */
            const disabledDefaultReason = () => {
              // 隐含排放（直接）的来源
              const directEmissionSource = value?.find(
                item => item.emissionElement === IMPLIED_EMISSION_DIRECT,
              )?.emissionSource;
              // 电力使用的来源
              const elUsageSource = value?.find(
                item => item.emissionElement === EL_USAGE,
              )?.emissionSource;

              return !(
                directEmissionSource === DEFAULT || elUsageSource === DEFAULT
              );
            };

            return (
              <DefaultSelect
                disabled={disabledDefaultReason()}
                options={defaultReasonOption}
              />
            );
          }

          if (emissionElement === IMPLIED_EMISSION_DIRECT) {
            return (
              <EmissionSourceSelect
                disabled={isUsingDefault}
                options={sourceOption}
              />
            );
          }

          return (
            <Select
              options={options}
              fieldNames={{
                label: 'name',
                value: 'code',
              }}
              placeholder={I18N.Factors.pleaseSelect}
            />
          );
        },
        onCell: record => {
          if (record.emissionElement === IMPLIED_EMISSION_INDIRECT) {
            return {
              rowSpan: 0,
            };
          }
          return {
            colSpan: record.emissionElement === REASON_USE_DEFAULT ? 3 : 1,
          };
        },
      },
    ]);

  return (
    <>
      <div className={isUsingDefault ? style.selectWithCNWrapper : undefined}>
        <PrecursorDefaultValuePicker
          cnCode={directEmissionRecord?.cnCode}
          cnName={directEmissionRecord?.cnName}
          countryName={countryName}
          countryValue={countryValue}
          defaultCnId={directEmissionRecord?.defaultCnId}
          productCategoryId={productCategoryId}
          productCategoryName={productCategoryName}
          readOnly={isDetail}
          selectionOnly
          useDefault={isUsingDefault}
          value={
            directEmissionRecord?.emission ?? directEmissionRecord?.outPower
          }
          onSelectionChange={updateSelectedDefaultValue}
        />
      </div>
      <EditableProTable<ProductAttribution>
        key={`precursorEmission${cbamId}`}
        columns={columns()}
        editableFormRef={editableFormRef}
        rowKey='emissionElement'
        value={visibleDataSource}
        bordered
        recordCreatorProps={false}
        toolBarRender={false}
        editable={{
          type: 'multiple',
          editableKeys,
          onValuesChange: (_record, recordList) => {
            const recordMap = new Map(
              recordList.map(item => [item.emissionElement, item]),
            );
            const newData = currentData.map(
              item => recordMap.get(item.emissionElement) || item,
            );
            setDataSource(newData);
            onChange(newData);
          },
        }}
      />
    </>
  );
};

export const FormilyPrecursorEmissionTable = connect(
  PrecursorEmissionTable,
  mapProps({ dataSource: true }, props => ({
    ...props,
  })),
);
