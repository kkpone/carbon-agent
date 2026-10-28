/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-19 10:15:18
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-13 17:05:17
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-28 18:05:07
 * @Date: 2023-01-05 15:28:01
 * @@description:
 */
import { IG6GraphEvent, IGraph } from '@antv/g6';
import I18N from '@src/lang/I18N';
import { regexpDecimalsNum, REGEXP_MORE_ZERO_DECIMALS } from '@src/utils/regs';
import { DictsAndChildren } from '@src/views/emission/Show/type';
import BigNumber from 'bignumber.js';

/**
 * @description: 类别的显示
 * @return {*}
 */
export const classesLeiBie = () => {
  const data = [
    { label: I18N.carbonFootprint3.rawMaterial, value: 1 },
    { label: I18N.carbonFootprint3.energy, value: 2 },
    { label: I18N.carbonFootprint3.waterConsumption, value: 3 },
    { label: I18N.carbonFootprint.transport, value: 4 },
    { label: I18N.carbonFootprint3.machining, value: 5 },
    { label: I18N.carbonFootprint3.distributionAndStorage2, value: 6 },
    { label: I18N.carbonFootprint3.apply, value: 7 },
    { label: I18N.carbonFootprint.abandonedDisposal, value: 8 },
  ];
  return data;
};

/**
 * @description: 类别的显示
 * @return {*}
 */
export const addEmissionSourceClasses = (stage: number) => {
  const data = [
    { label: I18N.carbonFootprint.mainMaterials, value: 1 },
    { label: I18N.carbonFootprint.accessories, value: 2 },
    { label: I18N.carbonFootprint3.packingMaterial, value: 3 },
    { label: I18N.carbonFootprint3.recycledMaterials, value: 4 },
    { label: I18N.carbonFootprint.energyConsumption2, value: 5 },
    { label: I18N.carbonFootprint3.waterConsumption, value: 6 },
    { label: I18N.carbonFootprint.transport, value: 7 },
  ];
  // 生产制造
  if (stage === 1) {
    data.push({ label: I18N.carbonFootprint3.machining, value: 8 });
  }
  // 分销和储存
  if (stage === 2) {
    data.push({
      label: I18N.carbonFootprint3.distributionAndStorage,
      value: 9,
    });
  }

  // 产品使用
  if (stage === 3) {
    data.push({ label: I18N.carbonFootprint3.apply, value: 10 });
  }

  // 废弃处置
  if (stage === 4) {
    data.push({ label: I18N.carbonFootprint.abandonedDisposal, value: 11 });
  }
  return data;
};

/**
 * @description: 状态按钮的通用样式
 */
export const styleBtnStatus: React.CSSProperties = {
  width: 60,
  height: '28px',
  lineHeight: '30px',
  textAlign: 'center',
  borderRadius: '15px',
};

/**
 * @description: 获取对应下拉的label
 * @param {DictsAndChildren} arr 当前的数据源
 * @param {string} val 选中的值
 * @return {undefined | string} 查找到的label
 */
export const getDicChildLabel = (arr: DictsAndChildren[], val: string[]) => {
  if (!val || !arr) return undefined;

  const parentOptions = arr.find(dic => dic.sourceType === val[0]);
  if (parentOptions) {
    const childInfo = parentOptions.children?.find(
      dic => dic.dictValue === val[1],
    );
    if (childInfo) {
      return childInfo.label;
    }
  }
  return undefined;
};

/**
 * @description: 获取对应下拉的Value
 * @param {DictsAndChildren} arr 当前的数据源
 * @param {string} val 选中的值
 * @return {undefined | string} 查找到的Value
 */
export const getDicChildValue = (arr: DictsAndChildren[], val: string[]) => {
  if (!val || !arr) return undefined;

  const parentOptions = arr.find(dic => dic.sourceType === val[0]);
  if (parentOptions) {
    const childInfo = parentOptions.children?.find(
      dic => dic.dictValue === val[1],
    );
    if (childInfo) {
      return childInfo.dictValue;
    }
  }
  return undefined;
};

/**
 * @description: 单位换算比例
 * @param {string} value 当前输入的值
 */
export const RegFActorObjRate = (value: string) => {
  if (!value) return '';

  /** 正数 大于0 包含小数 */
  if (!REGEXP_MORE_ZERO_DECIMALS.test(value) || Number(value) < 0) {
    return I18N.carbonFootprint3.theValueNeedsToBeLarge;
  }

  // if (!regexpDecimalsNum(13).test(value)) {
  //   return I18N.carbonFootprint3.maximumDecimalPlaces5;
  // }

  const num = new BigNumber(value);
  const max = new BigNumber('9999999999.9999999999999');
  const min = new BigNumber('0');

  if (num.isLessThan(min)) {
    return I18N.carbonFootprint3.valueRange2;
  }

  if (num.isGreaterThan(max)) {
    return I18N.carbonFootprint3.valueRange2;
  }

  return '';
};

/**
 * @description: 数量的值的判断
 * @param {string} value 当前输入的值
 */
export const RegAccountValue = (value: string, decimalPlace = 6) => {
  if (!value) return '';

  /** 正数 大于0 包含小数 */
  if (!REGEXP_MORE_ZERO_DECIMALS.test(value) || Number(value) <= 0) {
    return I18N.carbonFootprint3.theValueNeedsToBeLarge;
  }

  // 高精度输入直接按十进制字符串比较，避免转为 Number 后被舍入到上限。
  const reachesMax =
    decimalPlace > 6
      ? new BigNumber(value).isGreaterThanOrEqualTo(10000000000)
      : Number(value) >= 10000000000;
  if (reachesMax) return I18N.carbonFootprint3.mustBeLessThan;

  if (!regexpDecimalsNum(decimalPlace).test(value)) {
    if (decimalPlace === 6) return I18N.carbonFootprint3.maximumDecimalPlaces2;
    return I18N.template(I18N.carbonFootprint3.maximumDecimalPlaces, {
      val1: decimalPlace,
    });
  }

  return '';
};

export const genNumberValidator =
  (options?: { max?: number; decimalPlace?: number; includeMax?: boolean }) =>
  (value: string) => {
    if (!value) return '';
    const { max, decimalPlace, includeMax } = options || {};

    if (!REGEXP_MORE_ZERO_DECIMALS.test(value) || Number(value) < 0) {
      return I18N.carbonFootprint3.greaterThanOrEqualTo;
    }

    if (max !== undefined) {
      const preciseValue =
        decimalPlace !== undefined && decimalPlace > 6
          ? new BigNumber(value)
          : undefined;
      if (includeMax) {
        if (
          preciseValue ? preciseValue.isGreaterThan(max) : Number(value) > max
        ) {
          return I18N.template(I18N.carbonFootprint3.mustBeLessThanOrEqualTo, {
            val1: max,
          });
        }
      } else if (
        preciseValue
          ? preciseValue.isGreaterThanOrEqualTo(max)
          : Number(value) >= max
      ) {
        return I18N.template(I18N.carbonFootprint3.mustBeLessThanM, {
          val1: max,
        });
      }
    }

    if (
      decimalPlace !== undefined &&
      !regexpDecimalsNum(decimalPlace).test(value)
    ) {
      return I18N.template(I18N.carbonFootprint3.maximumDecimalPlaces, {
        val1: decimalPlace,
      });
    }

    return '';
  };

/** antv wheel 事件处理：双指移动、双指放大 */
export const graphWheelEvent = (ev: IG6GraphEvent, graph: IGraph) => {
  const sensitivity = 0.6;
  const { ctrlKey } = ev;
  if (ctrlKey) {
    // zoom
    const sensitivity = 3;
    const canvas = graph.get('canvas');
    const point = canvas.getPointByClient(ev.clientX, ev.clientY);
    let ratio = graph.getZoom();

    if (ev.wheelDelta > 0) {
      ratio *= 1 + 0.1 * sensitivity;
    } else {
      ratio *= 1 - 0.1 * sensitivity;
    }
    if (ratio < 0.2) {
      ratio = 0.2;
    }
    graph.zoomTo(
      ratio,
      {
        x: point.x,
        y: point.y,
      },
      true,
      {
        duration: 50,
      },
    );
  } else {
    // move
    const safetyNum = (num: any) => Number(num) || 0;

    graph.translate(
      safetyNum(ev.wheelDeltaX) * sensitivity,
      safetyNum(ev.wheelDeltaY) * sensitivity,
    );
  }

  ev.preventDefault();
  ev.stopPropagation();
};
