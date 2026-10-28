/**
 * @description 数据列组件
 */
import I18N from '@src/lang/I18N';
import { Button, InputNumber, Radio, Select } from 'antd';
import { useEffect } from 'react';

import { Dicts, returnInputNumberLimitFormatValue } from '@/utils';
import { EleCalculator } from '@/views/cbam/ReportForm/type';

import style from './index.module.less';
import { numberPropsData } from './until';
import { EL_SOURCE_ENUM, EL_SOURCE_OPTION } from '../../constant';

const emissionInputStyle = { width: '190px' };

/** 数据列基本输入组件 */
export const DataInput: React.FC<{
  label: string;
  value?: number | null;
  onChange?: (value: any) => void;
  disabled?: boolean;
}> = props => {
  const { label, value, onChange, disabled } = props;
  return (
    <div>
      <div>{label}</div>
      <InputNumber
        key={label}
        placeholder={I18N.base.pleaseEnter}
        {...props}
        value={value}
        onBlur={e => {
          const emission = returnInputNumberLimitFormatValue({
            value: e.target.value,
            ...numberPropsData,
          });
          onChange?.(emission);
        }}
        disabled={disabled}
        style={emissionInputStyle}
      />
    </div>
  );
};

/** 多个输入组件 */
export const DataInputGroup: React.FC<{
  options?: {
    filedName: string;
    label: string;
    dataValue?: number | null;
  }[];
  onChangeData?: (fieldName: string, emission?: number) => void;
  disabled?: boolean;
  key?: string;
  hiddenData?: boolean;
}> = ({ options, onChangeData, disabled, key, hiddenData }) => (
  <div className={style.emissionWrapper} key={key} hidden={hiddenData}>
    {options?.map(({ filedName, label, dataValue }) => (
      <DataInput
        key={`${filedName}${label}${key}`}
        label={label}
        value={dataValue}
        onChange={emission => {
          onChangeData?.(filedName, emission);
        }}
        disabled={disabled}
        {...numberPropsData}
      />
    ))}
  </div>
);

/** 数据列基本下拉框组件 */
export const DataSelect: React.FC<{
  label: string;
  value?: string;
  onSelect?: (value?: string) => void;
  disabled?: boolean;
  options?: Dicts[];
}> = props => {
  const { label, value, onSelect, disabled, options } = props;
  return (
    <div>
      <div>{label}</div>
      <Select
        {...props}
        value={value}
        onSelect={onSelect}
        options={options}
        fieldNames={{ label: 'dictLabel', value: 'dictValue' }}
        disabled={disabled}
        key={label}
        placeholder={I18N.Factors.pleaseSelect}
        style={{ width: '410px' }}
        showSearch
        optionFilterProp='dictLabel'
      />
    </div>
  );
};

/** 多个电力来源组 */
export const PowerGroup: React.FC<{
  /** 数据 */
  eleCalculatorList: EleCalculator[];
  /** 更新数据的方法 */
  onUpdateData: (
    valueIndex: number,
    fieldName: string,
    emission?: number,
  ) => void;
  /** 是否禁用 */
  disabled?: boolean;
}> = ({ eleCalculatorList, onUpdateData, disabled }) => {
  const list = [
    { title: I18N.cbam.powerSource5, valueIndex: 0 },
    { title: I18N.cbam.powerSource4, valueIndex: 1 },
    { title: I18N.cbam.powerSource3, valueIndex: 2 },
    { title: I18N.cbam.powerSource2, valueIndex: 3 },
    { title: I18N.cbam.powerSource, valueIndex: 4 },
  ];

  return (
    <div>
      {list?.map(({ title, valueIndex }) => (
        <div className={style.powerGroupWrapper}>
          <h4>
            {valueIndex === 0 && (
              <span className='ant-formily-item-asterisk'>*</span>
            )}
            {title}
          </h4>
          <DataInputGroup
            disabled={disabled}
            onChangeData={(fieldName, emission) => {
              onUpdateData?.(valueIndex, fieldName, emission);
            }}
            key={`${valueIndex}${title}`}
            options={[
              {
                filedName: 'eleValue',
                label: I18N.cbam.electricityUsageM,
                dataValue: eleCalculatorList?.[valueIndex]?.eleValue,
              },
              {
                filedName: 'coefficient',
                label: I18N.cbam.useElectricPowerBank,
                dataValue: eleCalculatorList?.[valueIndex]?.coefficient,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

/** 电力使用数据列 */
export const PowerData: React.FC<{
  /** 电力计算配置数据 */
  eleCalculatorList: EleCalculator[];
  /** 电力计算配置数据改变方法 */
  onEleCalculatorChange: (
    valueIndex: number,
    fieldName: string,
    emission?: number,
  ) => void;
  /** 重置电力计算配置数据数据 */
  onEleCalculatorReset?: () => void;
  /** 电力使用来源 */
  eleChoose?: number;
  /** 电力使用来源为多个来源时禁用方法 */
  onDisabledEleChoose?: () => void;
  /** 排放系数来源 */
  eleSource?: string;
  /** 排放系数来源options */
  elSourceOption?: Dicts[];
  /** 点击计算的方法 */
  onClickCalc?: () => void;
  /** DataInputGroup组件的onChangeData方法 */
  onChangeData?: (fieldName: string, fieldNameValue?: number | string) => void;
  /** DataInputGroup组件的options方法 */
  dataInputOptions?: {
    filedName: string;
    label: string;
    dataValue?: number;
  }[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hiddenData?: boolean;
  /** 重置电力使用和使用电力排放系数数据 */
  onResetElData?: (newEleChoose?: number) => void;
}> = ({
  eleChoose,
  onDisabledEleChoose,
  onEleCalculatorReset,
  eleSource,
  elSourceOption,
  onClickCalc,
  onChangeData,
  dataInputOptions,
  eleCalculatorList,
  onEleCalculatorChange,
  disabled,
  hiddenData,
  onResetElData,
}) => {
  /** 选择多个电力来源时 禁用 */
  const disabledEleChoose = eleChoose !== EL_SOURCE_ENUM?.EXISTS;

  useEffect(() => {
    if (disabledEleChoose) {
      onDisabledEleChoose?.();
    } else {
      /** 选择单一来源时 清空电力配置数据 */
      onEleCalculatorReset?.();
    }
  }, [disabledEleChoose]);

  return (
    <div hidden={hiddenData}>
      <Radio.Group
        disabled={disabled}
        key='eleChoose'
        value={eleChoose}
        options={EL_SOURCE_OPTION}
        defaultValue={EL_SOURCE_ENUM?.EXISTS}
        onChange={e => {
          /** 切换单个/多个电力来源 重置电力使用和使用电力排放系数数据 */
          onResetElData?.(e.target?.value);
        }}
      />
      <DataSelect
        disabled={disabledEleChoose || disabled}
        key='eleSource'
        label={I18N.cbam.emissionCoefficient2}
        value={eleSource}
        options={elSourceOption}
        onSelect={val => {
          onChangeData?.('eleSource', val);
        }}
      />
      {disabledEleChoose && (
        <div>
          <PowerGroup
            disabled={disabled}
            eleCalculatorList={eleCalculatorList}
            onUpdateData={onEleCalculatorChange}
          />
          <div className={style.calcWrapper}>
            <span>{I18N.cbam.revisedElectricity}</span>
            {!disabled && (
              <Button
                size='small'
                type='primary'
                onClick={() => {
                  onClickCalc?.();
                }}
              >
                {I18N.cbam.clickToCalculate}
              </Button>
            )}
          </div>
        </div>
      )}
      <DataInputGroup
        disabled={disabledEleChoose || disabled}
        onChangeData={onChangeData}
        options={dataInputOptions}
      />
    </div>
  );
};
