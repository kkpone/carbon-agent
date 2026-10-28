import { EVersionType } from '../accounting/fillData/service';
import { FdType } from '../carbonDischarge/components/AccountAddEmission/types';

type ProductFootprintAssociationCondition = {
  versionType?: EVersionType | string;
  ghgCategory?: string | number | null;
  ghgClassify?: string | number | null;
};

export const GHG_CATEGORY = {
  SCOPE_THREE: '2',
} as const;

export const GHG_SCOPE_THREE_CLASSIFY = {
  PURCHASED_GOODS_AND_SERVICES: '10',
  CAPITAL_GOODS: '11',
} as const;

const PRODUCT_FOOTPRINT_CLASSIFIES = new Set<string>(
  Object.values(GHG_SCOPE_THREE_CLASSIFY),
);

export const canAssociateProductFootprint = ({
  versionType,
  ghgCategory,
  ghgClassify,
}: ProductFootprintAssociationCondition) =>
  versionType === EVersionType.ghg &&
  String(ghgCategory) === GHG_CATEGORY.SCOPE_THREE &&
  PRODUCT_FOOTPRINT_CLASSIFIES.has(String(ghgClassify));

export const isProductCarbonSource = (fdType?: number | string | null) =>
  Number(fdType) === FdType.accountReference;
