/**
 * AI 数据填写的消耗数量自定义组件
 */
import { ObjectField, onFieldValidateStart } from '@formily/core';
import { connect, mapProps, useField, useForm } from '@formily/react';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import {
  // CALC_WAY,
  EMISSION_TYPE_OPTIONS,
  // TRANS_EMISSION_UNIT_LABEL,
} from '@src/views/carbonFootprint3/constant';
import { Cascader, InputNumber } from 'antd';
import { useEffect, useState } from 'react';

import styles from './index.module.less';
import { FormAiDataAmountValue } from '../../../../type';

type FormAiDataAmountProps = {
  value: FormAiDataAmountValue;
  unitCascader: Dicts[];
  disabled: boolean;
};

const { TRANS } = EMISSION_TYPE_OPTIONS;

// 消耗数量最小值
const minAmountNum = 0.000001;

const FormAiDataAmount = ({
  value,
  unitCascader,
  disabled,
}: FormAiDataAmountProps) => {
  const field = useField<ObjectField>();
  const form = useForm();
  const type = field.query('.type').get('value');

  const [showError, setShowError] = useState(false);

  form.addEffects(`${field.path.pop()}.amountObj`, () => {
    onFieldValidateStart(`${field.path.pop()}.amountObj`, () => {
      if (
        (!field.value?.amountObj?.amount ||
          !(field.value?.amountObj?.unitCodeArr?.length > 0)) &&
        type !== 7
      ) {
        setShowError(true);
      }
    });
  });

  const tempListSet = () => field.query('.set').get('value');

  const getSetPath = () => field.query('.set').take()?.path;

  const setSetEditStataus = () => {
    // 如果编辑状态已经为true 就不需要后面的处理了
    if (tempListSet()?.editStatus) return;

    const path = getSetPath();
    if (path) {
      form.setValuesIn(path, {
        ...tempListSet(),
        editStatus: true,
      });
    }
  };

  // 是否是运输
  const isTrans = Number(type) === TRANS;

  useEffect(() => {
    if (Number(type) === TRANS) {
      field.setRequired(false);
    } else {
      field.setRequired(true);
    }
  }, [type]);

  /**
   * 输入数量
   */
  const blurInput = (val: number, way?: number) => {
    setSetEditStataus();
    const amount = isTrans
      ? {
          ...value,
          amount: val,
          transObj: {
            ...value?.transObj,
            amount: val,
            way,
          },
        }
      : {
          ...value,
          amount: val,
        };
    form.setValuesIn(field.path, amount);
    field.selfModified = true;
  };

  /**
   * 手动输入的时候禁止出发编辑接口
   * @param val 改变的值
   */
  const changeInput = (val: number, way?: number) => {
    const path = getSetPath();
    if (path) {
      form.setValuesIn(path, {
        ...tempListSet(),
        editStatus: false,
      });
    }

    const amount = isTrans
      ? {
          ...value,
          amount: val,
          amountRequire: !val,
          transObj: {
            ...value?.transObj,
            amount: val,
            way,
          },
        }
      : {
          ...value,
          amount: val,
          amountRequire: !val,
        };
    form.setValuesIn(field.path, amount);
    field.selfModified = true;
    field.validate();
    setShowError(false);
    field.setSelfErrors(undefined);
    // field.sete
  };

  /**
   * 选择单位
   */
  const changeCascader = (cascaderValue: string[], unitNameString: string) => {
    setSetEditStataus();
    form.setValuesIn(field.path, {
      ...value,
      unitCode: cascaderValue[1],
      unitName: unitNameString,
      unitCodeArr: cascaderValue,
      unitCodeRequire: false,
    });
    field.selfModified = true;
    field.validate();
  };
  return (
    <div className={styles.aiDataForm}>
      {
        <>
          <InputNumber
            value={value?.amount}
            disabled={disabled}
            className={styles.aiDataAmountInput}
            placeholder={I18N.carbonFootprint.pleaseEnter}
            min={minAmountNum}
            onChange={val => {
              if (val) {
                // 校验小数位数
                const formattedVal = val.toFixed(6);
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
          <Cascader
            allowClear={false}
            disabled={disabled}
            value={value?.unitCodeArr}
            placeholder={I18N.carbonFootprint.pleaseSelect}
            displayRender={(labels: string[]) => labels?.[1]}
            className={
              value?.unitCodeRequire ||
              (showError && value?.unitCodeArr?.length === 0)
                ? styles.aiDataAmountCascaderRequire
                : styles.aiDataAmountCascader
            }
            options={unitCascader}
            onChange={(cascaderValue, opt) => {
              changeCascader(cascaderValue as string[], opt[1].label as string);
            }}
          />
        </>
      }
    </div>
  );
};

export default connect(
  FormAiDataAmount,
  mapProps({ value: true, validateStatus: true }, props => ({
    ...props,
  })),
);
