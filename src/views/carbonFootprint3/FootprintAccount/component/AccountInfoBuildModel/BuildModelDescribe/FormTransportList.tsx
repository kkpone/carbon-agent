/**
 * AI 数据填写的消耗数量自定义组件
 */
import { Field, onFormValidateEnd } from '@formily/core';
import { connect, mapProps, useField, useForm } from '@formily/react';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { CALC_WAY } from '@src/views/carbonFootprint3/constant';
import { useLocalStorageState } from 'ahooks';
import { Cascader, InputNumber, Select, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';
import { ETransportType } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import styles from './index.module.less';
import { FormAiDataAmountValue } from './type';

type FormAiDataAmountProps = {
  value: FormAiDataAmountValue;
  unitCascader: Dicts[];
  disabled: boolean;
};

// const { TRANS } = EMISSION_TYPE_OPTIONS;
const { PRODUCT_WEIGHT, BEARING_RATIO, ENERGY_CONSUMPTION } = CALC_WAY;

// 消耗数量最小值
const minAmountNum = 0.000001;

const FormAiDataAmount = ({
  value,
  unitCascader,
  disabled,
}: FormAiDataAmountProps) => {
  const field = useField<Field>();
  const form = useForm();

  const [setShowError, setShowErrorMsg] = useState(false);

  useEffect(() => {
    form.addEffects(`${field.path.toString()}validate`, () => {
      onFormValidateEnd(() => {
        setShowErrorMsg(true);
      });
    });
    return () => {
      form.removeEffects(`${field.path.toString()}validate`);
    };
  }, []);

  const currentValue = value?.[0] || {};

  const [showMessage, setShowMessage] = useLocalStorageState<
    boolean | undefined
  >('showTransportTypeTip', {
    defaultValue: !currentValue?.transportType,
  });

  const unitCodeArr = useMemo(() => {
    if (!currentValue?.unitCode) return [];
    let result: any[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const dict of unitCascader) {
      // eslint-disable-next-line no-restricted-syntax
      for (const childDict of dict.children || []) {
        if (childDict.value === currentValue?.unitCode) {
          result = [dict.value, childDict.value];
          break;
        }
      }
    }
    return result;
  }, [currentValue.unitCode]);

  /** 运输的三种方式  */
  const valueWay = currentValue?.way || PRODUCT_WEIGHT;

  const tempListSet = () => field.query('.set').get('value');

  const getSetPath = () => field.query('.set').take()?.path;

  const setSetEditStataus = (editStatus: boolean = true) => {
    // 如果编辑状态已经为true 就不需要后面的处理了
    // if (tempListSet()?.editStatus) return;

    const path = getSetPath();
    if (path) {
      form.setValuesIn(path, {
        ...tempListSet(),
        editStatus,
      });
    }
  };

  // 是否是运输
  // const isTrans = Number(type) === TRANS;

  const changeValueByKey = (key: string, val: string, update: boolean) => {
    setSetEditStataus(update);
    field.setValue([
      {
        ...field.value[0],
        [key]: val,
      },
      ...(field.value.slice(1) || []),
    ]);
  };
  /**
   * 输入数量
   */
  const blurInput = (val: number) => {
    changeValueByKey('amount', val.toString(), true);
  };

  /**
   * 手动输入的时候禁止出发编辑接口
   * @param val 改变的值
   */
  const changeInput = (val: number) => {
    changeValueByKey('amount', val.toString(), false);
  };

  /**
   * 选择单位 - 运输能耗
   */
  const changeEnergyCascader = (cascaderValue: string[]) => {
    changeValueByKey('unitCode', cascaderValue[1], true);
  };

  /**
   * 改变运输的里程
   */
  const changeDistance = (val: string) => {
    changeValueByKey('distance', val, false);
  };

  /**
   * 运输里程输入框
   */
  const changeTransInput = (val: string) => {
    changeValueByKey('distance', val, true);
  };

  const valueShow = (num?: string | number | null) => {
    if (num === null) return undefined;
    if (Number(num) >= 0) return num;
    return undefined;
  };

  const transportType = currentValue?.transportType || ETransportType.road;
  const getTransNode = () => {
    if (transportType === ETransportType.road) {
      // 运输方式 - 产品重量
      if (valueWay === PRODUCT_WEIGHT) {
        return (
          <div className={styles.aiDataAmountTransInner}>
            <InputNumber
              disabled={disabled}
              value={valueShow(currentValue?.amount)}
              style={
                setShowError && !currentValue?.amount
                  ? { borderColor: 'red', width: 136 }
                  : { width: 136 }
              }
              precision={6}
              className={styles.aiDataAmountTransInnerInputNumber}
              placeholder={I18N.carbonFootprint.pleaseEnter}
              min={minAmountNum}
              onChange={val => {
                if (val && Number.isFinite(val)) {
                  // 校验小数位数
                  const formattedVal = Number(val).toFixed(6);
                  const parsedVal = parseFloat(formattedVal);
                  if (parsedVal !== val) {
                    // 如果原始值的小数位数超过6位，则仅保留前6位并更新
                    changeInput(parsedVal);
                  } else {
                    changeInput(val);
                  }
                }
              }}
              onBlur={e => {
                const inputValue = e.target.value;
                const parsedValue = parseFloat(inputValue);

                if (!isNaN(parsedValue)) {
                  // 同样在校验阶段限制小数位数
                  const limitedValue = parsedValue.toFixed(6);
                  blurInput(parseFloat(limitedValue));
                }
              }}
            />
            <Select
              placeholder={I18N.carbonFootprint.unit}
              className={
                setShowError && !currentValue?.unitCode
                  ? styles.aiDataAmountTransInnerSelectRequire
                  : styles.aiDataAmountTransInnerSelect
              }
              style={{
                width: 136,
              }}
              disabled={disabled}
              fieldNames={{
                label: 'dictLabel',
                value: 'dictValue',
              }}
              options={
                unitCascader.find(item => item.dictValue === '1')?.children
              }
              value={
                currentValue?.unitCode === ''
                  ? undefined
                  : currentValue?.unitCode
              }
              onChange={val => {
                changeValueByKey('unitCode', val, true);
              }}
            />
            <div className={styles.aiDataAmountTransInnerKm}>
              <InputNumber
                placeholder={I18N.carbonFootprint3.mileage}
                addonAfter={I18N.carbonFootprint3.kilometre}
                min={0}
                precision={6}
                disabled={disabled}
                className={
                  setShowError && !currentValue?.distance
                    ? styles.aiDataDistanceRequire
                    : undefined
                }
                style={{
                  width: 136,
                }}
                value={valueShow(currentValue?.distance)}
                onChange={val => {
                  if (val && val !== currentValue?.distance) {
                    changeDistance(val as string);
                  }
                }}
                onBlur={e => {
                  if (e.target.value !== currentValue?.distance) {
                    changeTransInput(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        );
      }

      // 运输方式 - 载重比
      if (valueWay === BEARING_RATIO) {
        return (
          <div className={styles.aiDataAmountTransInnerRatio}>
            <div className={styles.aiDataAmountTransInnerKm}>
              <InputNumber
                disabled={disabled}
                value={valueShow(currentValue?.amount)}
                style={
                  setShowError && !currentValue?.amount
                    ? { borderColor: 'red' }
                    : {}
                }
                precision={6}
                className={styles.aiDataAmountTransInnerInputNumber}
                placeholder={I18N.carbonFootprint.pleaseEnter}
                min={minAmountNum}
                addonAfter='%'
                width={100}
                onChange={val => {
                  if (val) {
                    changeInput(val as number);
                  }
                }}
                onBlur={e => {
                  blurInput(Number(e.target.value));
                }}
              />
            </div>

            <div className={styles.aiDataAmountTransInnerKm}>
              <InputNumber
                disabled={disabled}
                placeholder={I18N.carbonFootprint3.mileage}
                addonAfter={I18N.carbonFootprint3.kilometre}
                min={0}
                width={100}
                style={
                  setShowError && !currentValue?.distance
                    ? { borderColor: 'red' }
                    : {}
                }
                precision={6}
                value={valueShow(currentValue?.distance)}
                onChange={val => {
                  if (val && val !== currentValue?.distance) {
                    changeDistance(val.toString());
                  }
                }}
                onBlur={e => {
                  if (
                    e.target.value &&
                    e.target.value !== currentValue?.distance
                  ) {
                    changeTransInput(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        );
      }

      // 运输方式 - 能耗
      if (valueWay === ENERGY_CONSUMPTION) {
        return (
          <div className={styles.aiDataAmountTransInnerEnergy}>
            <InputNumber
              disabled={disabled}
              value={valueShow(currentValue?.amount)}
              style={
                setShowError && !currentValue?.amount
                  ? { borderColor: 'red' }
                  : {}
              }
              className={styles.aiDataAmountInput}
              placeholder={I18N.carbonFootprint.pleaseEnter}
              min={minAmountNum}
              onChange={val => {
                if (val) {
                  changeInput(val as number);
                }
              }}
              onBlur={e => {
                blurInput(Number(e.target.value));
              }}
            />
            <Cascader
              allowClear={false}
              disabled={disabled}
              value={unitCodeArr}
              placeholder={I18N.carbonFootprint.pleaseSelect}
              // displayRender={(labels: string[]) => labels?.[1]}
              className={
                setShowError && !currentValue?.unitCode
                  ? styles.aiDataAmountCascaderRequire
                  : styles.aiDataAmountCascader
              }
              options={unitCascader}
              onChange={cascaderValue => {
                changeEnergyCascader(cascaderValue as string[]);
              }}
            />
          </div>
        );
      }
    } else if (
      transportType === ETransportType.railway ||
      transportType === ETransportType.air ||
      transportType === ETransportType.sea
    ) {
      return (
        <div className={styles.aiDataAmountTransInner}>
          <InputNumber
            disabled={disabled}
            value={valueShow(currentValue?.amount)}
            style={
              setShowError && !currentValue?.amount
                ? { borderColor: 'red', width: 136 }
                : { width: 136 }
            }
            precision={6}
            className={styles.aiDataAmountTransInnerInputNumber}
            placeholder={I18N.carbonFootprint.pleaseEnter}
            min={minAmountNum}
            onChange={val => {
              if (val && Number.isFinite(val)) {
                // 校验小数位数
                const formattedVal = Number(val).toFixed(6);
                const parsedVal = parseFloat(formattedVal);
                if (parsedVal !== val) {
                  // 如果原始值的小数位数超过6位，则仅保留前6位并更新
                  changeInput(parsedVal);
                } else {
                  changeInput(val);
                }
              }
            }}
            onBlur={e => {
              const inputValue = e.target.value;
              const parsedValue = parseFloat(inputValue);

              if (!isNaN(parsedValue)) {
                // 同样在校验阶段限制小数位数
                const limitedValue = parsedValue.toFixed(6);
                blurInput(parseFloat(limitedValue));
              }
            }}
          />
          <Select
            placeholder={I18N.carbonFootprint.unit}
            className={
              setShowError && !currentValue?.unitCode
                ? styles.aiDataAmountTransInnerSelectRequire
                : styles.aiDataAmountTransInnerSelect
            }
            style={{
              width: 136,
            }}
            disabled={disabled}
            fieldNames={{
              label: 'dictLabel',
              value: 'dictValue',
            }}
            options={
              unitCascader.find(item => item.dictValue === '1')?.children
            }
            value={currentValue?.unitCode}
            onChange={val => {
              changeValueByKey('unitCode', val, true);
            }}
          />
          <div className={styles.aiDataAmountTransInnerKm}>
            <InputNumber
              precision={6}
              placeholder={I18N.carbonFootprint3.mileage}
              addonAfter={I18N.carbonFootprint3.kilometre}
              min={0}
              disabled={disabled}
              className={
                setShowError && !currentValue?.distance
                  ? styles.aiDataDistanceRequire
                  : undefined
              }
              style={{
                width: 136,
              }}
              value={valueShow(currentValue?.distance)}
              onChange={val => {
                if (val && val !== currentValue?.distance) {
                  changeDistance(val as string);
                }
              }}
              onBlur={e => {
                if (e.target.value !== currentValue?.distance) {
                  changeTransInput(e.target.value);
                }
              }}
            />
          </div>
        </div>
      );
    }

    return undefined;
  };

  return (
    <Tooltip
      overlayInnerStyle={{
        width: 320,
      }}
      title={
        showMessage ? (
          <div className={styles.aiDataAmountTransTip}>
            {I18N.carbonFootprint3.defaultTransportationCategory}
            <IconAlibabaNew
              type='icon-icon-guanbi'
              onClick={() => setShowMessage(false)}
            />
          </div>
        ) : undefined
      }
    >
      <div className={styles.aiDataForm}>
        {getTransNode()}
        {value?.length > 1 ? '...' : ''}
      </div>
    </Tooltip>
  );
};

export default connect(
  FormAiDataAmount,
  mapProps({ value: true, validateStatus: true }, props => ({
    ...props,
  })),
);
