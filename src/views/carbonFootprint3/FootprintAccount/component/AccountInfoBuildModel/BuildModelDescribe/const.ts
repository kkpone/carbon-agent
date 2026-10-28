import I18N from '@src/lang/I18N';
import type { TabsProps } from 'antd';

/**
 * 生命周期阶段 0 原材料获取 1 生产制造 2 分销和储存 3 产品使用 4 废弃处置
 */
const StageEnum = {
  /** 原材料获取 */
  RawMaterial: {
    value: '0',
    label: I18N.carbonFootprint.rawMaterialAcquisition,
  },
  /** 生产制造 */
  Manufacture: {
    value: '1',
    label: I18N.carbonFootprint.productionAndManufacturing,
  },
  /** 分销和储存 */
  DistributionAndStorage: {
    value: '2',
    label: I18N.carbonFootprint3.distributionAndStorage,
  },
  /** 产品使用 */
  ProductUse: {
    value: '3',
    label: I18N.carbonFootprint.productUsage,
  },
  /** 废弃处置 */
  DiscardDisposal: {
    value: '4',
    label: I18N.carbonFootprint.abandonedDisposal,
  },
} as const;

type GetValue<
  T extends {
    [key: string]: {
      value: any;
    };
  },
> = T[keyof T]['value'];

const keyMap = {
  0: StageEnum.RawMaterial.label,
  1: StageEnum.Manufacture.label,
  2: StageEnum.DistributionAndStorage.label,
  3: StageEnum.ProductUse.label,
  4: StageEnum.DiscardDisposal.label,
};

export type StageEnumType = GetValue<typeof StageEnum>;

export const getStageItems: (
  scopeValue: string,
) => TabsProps['items'] = scopeValue =>
  scopeValue.split(',').map(item => ({
    key: item,
    label: keyMap[item],
  }));
