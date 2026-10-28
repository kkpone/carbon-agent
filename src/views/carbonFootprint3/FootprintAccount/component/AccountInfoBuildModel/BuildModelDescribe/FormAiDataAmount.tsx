/**
 * AI 数据填写的消耗数量自定义组件
 */
import { connect, mapProps, useField, useForm } from '@formily/react';
import { toJS } from '@formily/reactive';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import {
  // CALC_WAY,
  EMISSION_TYPE_OPTIONS,
  // TRANS_EMISSION_UNIT_LABEL,
} from '@src/views/carbonFootprint3/constant';
import { Cascader, InputNumber } from 'antd';

import styles from './index.module.less';
import { FormAiDataAmountValue } from './type';

type FormAiDataAmountProps = {
  value: FormAiDataAmountValue;
  unitCascader: Dicts[];
  disabled: boolean;
};

const { TRANS } = EMISSION_TYPE_OPTIONS;
// const { PRODUCT_WEIGHT, BEARING_RATIO, ENERGY_CONSUMPTION } = CALC_WAY;

/** 运输的单位 */
// const emissionUnit = Object.keys(TRANS_EMISSION_UNIT_LABEL).map(trans => ({
//   label: TRANS_EMISSION_UNIT_LABEL[trans],
//   value: Number(trans),
// }));

// 消耗数量最小值
const minAmountNum = 0.000001;

const FormAiDataAmount = ({
  value,
  unitCascader,
  disabled,
}: FormAiDataAmountProps) => {
  const field = useField();
  const form = useForm();
  const type = field.query('.type').get('value');

  /** 运输的三种方式  */
  // const valueWay = type === TRANS ? value.transObj?.way : undefined;

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
  };

  /**
   * 选择单位 - 运输能耗
   */
  // const changeEnergyCascader = (
  //   cascaderValue: string[],
  //   unitName: string,
  //   way?: number,
  // ) => {
  //   setSetEditStataus();
  //   form.setValuesIn(field.path, {
  //     ...value,
  //     transObj: {
  //       ...value?.transObj,
  //       way,
  //       unitCodeArr: cascaderValue,
  //       unitCode: cascaderValue[1],
  //       unitName,
  //     },
  //     unitCodeRequire: false,
  //     unitCode: cascaderValue[1],
  //     unitName,
  //   });
  // };

  /**
   * 选择运输单位
   */
  // const changeSelect = (val: string, unitName: string, way?: number) => {
  //   setSetEditStataus();
  //   form.setValuesIn(field.path, {
  //     ...value,
  //     unitCodeRequire: false,
  //     transObj: {
  //       ...value?.transObj,
  //       distUnitCode: val,
  //       distUnitName: I18N.carbonFootprint3.kilometre,
  //       way,
  //       unitCode: val,
  //       unitName,
  //     },
  //     unitCode: val,
  //     unitName,
  //   });
  // };

  /**
   * 改变运输的里程
   */
  // const chanegeInputNumber = (val: number, way?: number) => {
  //   const path = getSetPath();
  //   if (path) {
  //     form.setValuesIn(path, {
  //       ...tempListSet(),
  //       editStatus: false,
  //     });
  //   }
  //   form.setValuesIn(field.path, {
  //     ...value,
  //     distanceRequire: !val,
  //     transObj: {
  //       ...value?.transObj,
  //       distance: val,
  //       way,
  //     },
  //   });
  // };

  // /**
  //  * 运输里程输入框
  //  */
  // const changeTransInput = (val: string, way?: number) => {
  //   setSetEditStataus();
  //   form.setValuesIn(field.path, {
  //     ...value,
  //     distanceRequire: !val,
  //     transObj: {
  //       ...value?.transObj,
  //       distance: val,
  //       way,
  //     },
  //   });
  // };

  // const valueShow = (num?: string | number | null) => {
  //   if (num === null) return undefined;
  //   if (Number(num) >= 0) return num;
  //   return undefined;
  // };

  // const getTransNode = () => {
  //   // 运输方式 - 产品重量
  //   if (valueWay === PRODUCT_WEIGHT) {
  //     return (
  //       <div className={styles.aiDataAmountTrans}>
  //         <InputNumber
  //           disabled={disabled}
  //           value={valueShow(value?.transObj?.amount)}
  //           style={value?.amountRequire ? { borderColor: 'red' } : {}}
  //           className={styles.aiDataAmountTransInputNumber}
  //           placeholder={I18N.carbonFootprint.pleaseEnter}
  //           min={minAmountNum}
  //           onChange={val => {
  //             if (val && Number.isFinite(val)) {
  //               // 校验小数位数
  //               const formattedVal = Number(val).toFixed(6);
  //               const parsedVal = parseFloat(formattedVal);
  //               if (parsedVal !== val) {
  //                 // 如果原始值的小数位数超过6位，则仅保留前6位并更新
  //                 changeInput(parsedVal, PRODUCT_WEIGHT);
  //               } else {
  //                 changeInput(val, PRODUCT_WEIGHT);
  //               }
  //             }
  //           }}
  //           onBlur={e => {
  //             const inputValue = e.target.value;
  //             const parsedValue = parseFloat(inputValue);

  //             if (!isNaN(parsedValue)) {
  //               // 同样在校验阶段限制小数位数
  //               const limitedValue = parsedValue.toFixed(6);
  //               blurInput(parseFloat(limitedValue), PRODUCT_WEIGHT);
  //             }
  //           }}
  //         />
  //         <Select
  //           placeholder={I18N.carbonFootprint.pleaseSelect}
  //           className={
  //             value?.unitCodeRequire
  //               ? styles.aiDataAmountTransSelectRequire
  //               : styles.aiDataAmountTransSelect
  //           }
  //           disabled={disabled}
  //           options={emissionUnit}
  //           value={value?.transObj?.unitCode}
  //           onChange={(val, opt) => {
  //             const optObj = opt as { label: string; value: number };
  //             changeSelect(val, optObj.label, PRODUCT_WEIGHT);
  //           }}
  //         />
  //         <div className={styles.aiDataAmountTransKm}>
  //           <InputNumber
  //             placeholder={I18N.carbonFootprint3.mileage}
  //             addonAfter='km'
  //             min={0}
  //             disabled={disabled}
  //             className={
  //               value?.distanceRequire
  //                 ? styles.aiDataDistanceRequire
  //                 : undefined
  //             }
  //             value={valueShow(value?.transObj?.distance)}
  //             onChange={val => {
  //               if (val && val !== value?.transObj?.distance) {
  //                 chanegeInputNumber(val as number, PRODUCT_WEIGHT);
  //               }
  //             }}
  //             onBlur={e => {
  //               if (e.target.value !== value?.transObj?.distance) {
  //                 changeTransInput(e.target.value, PRODUCT_WEIGHT);
  //               }
  //             }}
  //           />
  //         </div>
  //       </div>
  //     );
  //   }

  //   // 运输方式 - 载重比
  //   if (valueWay === BEARING_RATIO) {
  //     return (
  //       <div className={styles.aiDataAmountTransRatio}>
  //         <div className={styles.aiDataAmountTransKm}>
  //           <InputNumber
  //             disabled={disabled}
  //             value={valueShow(value?.transObj?.amount)}
  //             style={value?.amountRequire ? { borderColor: 'red' } : {}}
  //             className={styles.aiDataAmountTransInputNumber}
  //             placeholder={I18N.carbonFootprint.pleaseEnter}
  //             min={minAmountNum}
  //             addonAfter='%'
  //             onChange={val => {
  //               if (val) {
  //                 changeInput(val as number, BEARING_RATIO);
  //               }
  //             }}
  //             onBlur={e => {
  //               blurInput(Number(e.target.value), BEARING_RATIO);
  //             }}
  //           />
  //         </div>

  //         <div className={styles.aiDataAmountTransKm}>
  //           <InputNumber
  //             disabled={disabled}
  //             placeholder={I18N.carbonFootprint3.mileage}
  //             addonAfter='km'
  //             min={0}
  //             style={value?.distanceRequire ? { borderColor: 'red' } : {}}
  //             value={valueShow(value?.transObj?.distance)}
  //             onChange={val => {
  //               if (val && val !== value?.transObj?.distance) {
  //                 chanegeInputNumber(val as number, BEARING_RATIO);
  //               }
  //             }}
  //             onBlur={e => {
  //               if (
  //                 e.target.value &&
  //                 e.target.value !== value?.transObj?.distance
  //               ) {
  //                 changeTransInput(e.target.value, BEARING_RATIO);
  //               }
  //             }}
  //           />
  //         </div>
  //       </div>
  //     );
  //   }

  //   // 运输方式 - 能耗
  //   if (valueWay === ENERGY_CONSUMPTION) {
  //     return (
  //       <div className={styles.aiDataAmountTransEnergy}>
  //         <InputNumber
  //           disabled={disabled}
  //           value={valueShow(value?.transObj?.amount)}
  //           style={value?.amountRequire ? { borderColor: 'red' } : {}}
  //           className={styles.aiDataAmountInput}
  //           placeholder={I18N.carbonFootprint.pleaseEnter}
  //           min={minAmountNum}
  //           onChange={val => {
  //             if (val) {
  //               changeInput(val as number, ENERGY_CONSUMPTION);
  //             }
  //           }}
  //           onBlur={e => {
  //             blurInput(Number(e.target.value), ENERGY_CONSUMPTION);
  //           }}
  //         />
  //         <Cascader
  //           allowClear={false}
  //           disabled={disabled}
  //           value={value?.transObj?.unitCodeArr}
  //           placeholder={I18N.carbonFootprint.pleaseSelect}
  //           displayRender={(labels: string[]) => labels?.[1]}
  //           className={
  //             value?.unitCodeRequire
  //               ? styles.aiDataAmountCascaderRequire
  //               : styles.aiDataAmountCascader
  //           }
  //           options={unitCascader}
  //           onChange={(cascaderValue, opt) => {
  //             changeEnergyCascader(
  //               cascaderValue as string[],
  //               opt[1].label as string,
  //               ENERGY_CONSUMPTION,
  //             );
  //           }}
  //         />
  //       </div>
  //     );
  //   }

  //   return undefined;
  // };

  return (
    <div className={styles.aiDataForm}>
      {
        <>
          <InputNumber
            value={value?.amount}
            disabled={disabled}
            className={styles.aiDataAmountInput}
            style={value?.amountRequire ? { borderColor: 'red' } : {}}
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
            value={toJS(value?.unitCodeArr)}
            placeholder={I18N.carbonFootprint.pleaseSelect}
            displayRender={(labels: string[]) => labels?.[1]}
            className={
              value?.unitCodeRequire
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
