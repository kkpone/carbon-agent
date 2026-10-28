/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 16:39:03
 * @Date: 2023-06-05 15:04:55
 * @@description:
 */
/** 碳阻迹报表 - 区分快速核算还是过程核算 */
import I18N from '@src/lang/I18N';

export enum DatasTypeValue {
  QUICK,
  PROCESS,
}

export const DATAS_TYPE_LABEL = {
  [DatasTypeValue.QUICK]: I18N.carbonFootprint3.quickAccounting,
  [DatasTypeValue.PROCESS]: I18N.carbonFootprint3.processAccounting,
} as const;

/** 根据排放源的生命周期生成 - 文案和icon */
enum EmissionIconCode {
  MATERIAL,
  PRODUCT,
  DISTRIBUTION,
  USE,
  WASTE_DISPOSAL,
}

export const GET_EMISSION_ICON_BY_CODE = {
  [EmissionIconCode.MATERIAL]: 'icon-icon_yuancailiaohuoqu',
  [EmissionIconCode.PRODUCT]: 'icon-icon_shengchanzhizao_fill',
  [EmissionIconCode.DISTRIBUTION]: 'icon-icon_fenxiaochucun_fill',
  [EmissionIconCode.USE]: 'icon-icon_chanpinshiyong_fill',
  [EmissionIconCode.WASTE_DISPOSAL]: 'icon-icon_feiqichuzhi_fill',
} as const;
