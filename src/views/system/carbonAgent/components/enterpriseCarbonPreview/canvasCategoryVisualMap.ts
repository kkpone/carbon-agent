import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import {
  GHGFirstSelect,
  GHGSecondSelect,
  ISOFirstSelect,
  ISOSecondSelect,
} from '@/views/enterpriseCarbonAccount2/listInfo/util';

import businessTravelIsoIcon from './assets/canvas-icons/business-travel-iso.svg';
import businessTravelIcon from './assets/canvas-icons/business-travel.svg';
import capitalGoodsIcon from './assets/canvas-icons/capital-goods.svg';
import carbonSequestrationIcon from './assets/canvas-icons/carbon-sequestration.svg';
import coldIcon from './assets/canvas-icons/cold.svg';
import compressedAirIcon from './assets/canvas-icons/compressed-air.svg';
import customerVisitIcon from './assets/canvas-icons/customer-visit.svg';
import downstreamLeasedAssetIcon from './assets/canvas-icons/downstream-leased-asset.svg';
import downstreamTransportIsoIcon from './assets/canvas-icons/downstream-transport-iso.svg';
import downstreamTransportIcon from './assets/canvas-icons/downstream-transport.svg';
import electricityIcon from './assets/canvas-icons/electricity.svg';
import employeeCommuteIsoIcon from './assets/canvas-icons/employee-commute-iso.svg';
import employeeCommuteIcon from './assets/canvas-icons/employee-commute.svg';
import endOfLifeTreatmentIcon from './assets/canvas-icons/end-of-life-treatment.svg';
import fixedCombustionIcon from './assets/canvas-icons/fixed-combustion.svg';
import franchiseIcon from './assets/canvas-icons/franchise.svg';
import fuelEnergyIsoIcon from './assets/canvas-icons/fuel-energy-iso.svg';
import fuelEnergyIcon from './assets/canvas-icons/fuel-energy.svg';
import fugitiveIsoIcon from './assets/canvas-icons/fugitive-iso.svg';
import fugitiveIcon from './assets/canvas-icons/fugitive.svg';
import heatIcon from './assets/canvas-icons/heat.svg';
import investmentOtherAssetsIcon from './assets/canvas-icons/investment-other-assets.svg';
import investmentIcon from './assets/canvas-icons/investment.svg';
import isoDownstreamSupplyChainIcon from './assets/canvas-icons/iso-downstream-supply-chain.svg';
import isoOtherIndirectIcon from './assets/canvas-icons/iso-other-indirect.svg';
import isoOutsourcedProductsIcon from './assets/canvas-icons/iso-outsourced-products.svg';
import isoTransportIndirectIcon from './assets/canvas-icons/iso-transport-indirect.svg';
import leasedAssetIcon from './assets/canvas-icons/leased-asset.svg';
import mobileCombustionIcon from './assets/canvas-icons/mobile-combustion.svg';
import operatingLeasedAssetIcon from './assets/canvas-icons/operating-leased-asset.svg';
import otherServiceIcon from './assets/canvas-icons/other-service.svg';
import otherIcon from './assets/canvas-icons/other.svg';
import processIcon from './assets/canvas-icons/process.svg';
import productDisposalIcon from './assets/canvas-icons/product-disposal.svg';
import productProcessingIcon from './assets/canvas-icons/product-processing.svg';
import productUseIcon from './assets/canvas-icons/product-use.svg';
import purchasedGoodsIcon from './assets/canvas-icons/purchased-goods.svg';
import rawMaterialsIcon from './assets/canvas-icons/raw-materials.svg';
import rentingAssetsIcon from './assets/canvas-icons/renting-assets.svg';
import scopeOneIcon from './assets/canvas-icons/scope-one.svg';
import scopeThreeIcon from './assets/canvas-icons/scope-three.svg';
import scopeTwoIcon from './assets/canvas-icons/scope-two.svg';
import soldProductProcessingIcon from './assets/canvas-icons/sold-product-processing.svg';
import soldProductUseIcon from './assets/canvas-icons/sold-product-use.svg';
import steamIcon from './assets/canvas-icons/steam.svg';
import upstreamTransportIsoIcon from './assets/canvas-icons/upstream-transport-iso.svg';
import upstreamTransportIcon from './assets/canvas-icons/upstream-transport.svg';
import wasteOperationIsoIcon from './assets/canvas-icons/waste-operation-iso.svg';
import wasteOperationIcon from './assets/canvas-icons/waste-operation.svg';

export type CanvasClassifyVisual = {
  color: string;
  icon: string;
  iconFlipX?: boolean;
};

const BLUE = '#0167db';
const INDIGO = '#646fea';
const YELLOW = '#fec732';
const GREEN = '#0cbf9f';
const RED = '#e14656';
const CYAN = '#19a6d2';
const ORANGE = '#fa734a';
const DEEP_GREEN = '#048677';
const AMBER = '#f3983e';
const ROYAL_BLUE = '#3361d7';
const BROWN = '#bb6f44';
const STEEL_BLUE = '#2b6fbf';
const DARK = '#04252b';
const GRAY = '#6c757d';
const BLUE_GRAY = '#89a0ac';
const SCOPE_ONE_GREEN = '#0cbf9f';
const SCOPE_TWO_GREEN = '#048677';
const SCOPE_THREE_GREEN = '#004541';

const commonCombustionVisuals = {
  '0': { color: BLUE, icon: fixedCombustionIcon },
  '1': { color: INDIGO, icon: mobileCombustionIcon },
  '2': { color: YELLOW, icon: processIcon },
  '3': { color: GREEN, icon: fugitiveIcon },
  '4': { color: RED, icon: carbonSequestrationIcon },
  '5': { color: BLUE, icon: electricityIcon },
  '6': { color: INDIGO, icon: steamIcon },
  '7': { color: YELLOW, icon: compressedAirIcon },
  '8': { color: GREEN, icon: coldIcon },
  '9': { color: RED, icon: heatIcon },
};

const isoDirectAndEnergyVisuals = {
  '0': { color: BLUE, icon: fixedCombustionIcon },
  '1': { color: INDIGO, icon: mobileCombustionIcon },
  '2': { color: YELLOW, icon: processIcon },
  '3': { color: GREEN, icon: fugitiveIsoIcon },
  '4': { color: RED, icon: carbonSequestrationIcon },
  '5': { color: BLUE, icon: electricityIcon },
  '6': { color: INDIGO, icon: steamIcon },
  '7': { color: YELLOW, icon: compressedAirIcon },
  '8': { color: GREEN, icon: coldIcon },
  '9': { color: RED, icon: heatIcon },
};

const scopeThreeVisuals = {
  '10': { color: BLUE, icon: purchasedGoodsIcon },
  '11': { color: INDIGO, icon: capitalGoodsIcon },
  '12': { color: YELLOW, icon: fuelEnergyIcon },
  '13': { color: GREEN, icon: upstreamTransportIcon },
  '14': { color: RED, icon: wasteOperationIcon },
  '15': { color: CYAN, icon: businessTravelIcon },
  '16': { color: ORANGE, icon: employeeCommuteIcon },
  '17': { color: DEEP_GREEN, icon: leasedAssetIcon },
  '18': { color: AMBER, icon: downstreamTransportIcon },
  '19': { color: ROYAL_BLUE, icon: soldProductProcessingIcon },
  '20': { color: BROWN, icon: soldProductUseIcon },
  '21': { color: STEEL_BLUE, icon: endOfLifeTreatmentIcon },
  '22': { color: DARK, icon: downstreamLeasedAssetIcon },
  '23': { color: GRAY, icon: franchiseIcon },
  '24': { color: BLUE_GRAY, icon: investmentIcon },
};

const ghgCategoryVisuals: Record<string, CanvasClassifyVisual> = {
  '0': { color: SCOPE_ONE_GREEN, icon: scopeOneIcon },
  '1': { color: SCOPE_TWO_GREEN, icon: scopeTwoIcon },
  '2': { color: SCOPE_THREE_GREEN, icon: scopeThreeIcon },
};

const isoCategoryVisuals: Record<string, CanvasClassifyVisual> = {
  '0': { color: SCOPE_ONE_GREEN, icon: scopeOneIcon },
  '1': { color: SCOPE_TWO_GREEN, icon: scopeTwoIcon },
  '2': { color: SCOPE_THREE_GREEN, icon: isoTransportIndirectIcon },
  '3': { color: SCOPE_ONE_GREEN, icon: isoOutsourcedProductsIcon },
  '4': { color: SCOPE_TWO_GREEN, icon: isoDownstreamSupplyChainIcon },
  '5': { color: SCOPE_THREE_GREEN, icon: isoOtherIndirectIcon },
};

export const CANVAS_CLASSIFY_VISUAL_MAP: Record<
  EVersionType,
  Record<string, CanvasClassifyVisual>
> = {
  [EVersionType.ghg]: {
    ...commonCombustionVisuals,
    ...scopeThreeVisuals,
  },
  [EVersionType.iso]: {
    ...isoDirectAndEnergyVisuals,
    '10': { color: BLUE, icon: businessTravelIsoIcon },
    '11': { color: INDIGO, icon: employeeCommuteIsoIcon },
    '12': { color: YELLOW, icon: upstreamTransportIsoIcon, iconFlipX: true },
    '13': { color: GREEN, icon: downstreamTransportIsoIcon },
    '14': { color: RED, icon: customerVisitIcon },
    '15': { color: BLUE, icon: wasteOperationIsoIcon },
    '16': { color: INDIGO, icon: capitalGoodsIcon },
    '17': { color: YELLOW, icon: rawMaterialsIcon },
    '18': { color: GREEN, icon: operatingLeasedAssetIcon },
    '19': { color: RED, icon: otherServiceIcon },
    '20': { color: BLUE, icon: productUseIcon },
    '21': { color: INDIGO, icon: productProcessingIcon },
    '22': { color: YELLOW, icon: productDisposalIcon },
    '23': { color: GREEN, icon: investmentOtherAssetsIcon },
    '24': { color: RED, icon: rentingAssetsIcon },
    '25': { color: BLUE_GRAY, icon: otherIcon },
    '26': { color: CYAN, icon: fuelEnergyIsoIcon },
  },
};

export const CANVAS_CATEGORY_VISUAL_MAP: Record<
  EVersionType,
  Record<string, CanvasClassifyVisual>
> = {
  [EVersionType.ghg]: ghgCategoryVisuals,
  [EVersionType.iso]: isoCategoryVisuals,
};

const normalizeVersionType = (versionType?: EVersionType) =>
  versionType === EVersionType.iso ? EVersionType.iso : EVersionType.ghg;

const normalizeLabel = (value?: string | number | null) =>
  value === undefined || value === null ? '' : String(value).trim();

const buildNameCodeMap = (
  options: Array<{ category?: string; id?: string | number }>,
): Record<string, string> => {
  const result: Record<string, string> = {};

  options.forEach(option => {
    const label = normalizeLabel(option.category);
    const id = normalizeLabel(option.id);

    if (label && id) {
      result[label] = id;
    }
  });

  return result;
};

const CATEGORY_NAME_CODE_MAP: Record<EVersionType, Record<string, string>> = {
  [EVersionType.ghg]: buildNameCodeMap(GHGFirstSelect),
  [EVersionType.iso]: buildNameCodeMap(ISOFirstSelect),
};

const CLASSIFY_NAME_CODE_MAP: Record<EVersionType, Record<string, string>> = {
  [EVersionType.ghg]: buildNameCodeMap(GHGSecondSelect),
  [EVersionType.iso]: buildNameCodeMap(ISOSecondSelect),
};

const getVisualCode = ({
  code,
  label,
  nameCodeMap,
  versionType,
  visualMap,
}: {
  code?: string | number | null;
  label?: string | number | null;
  nameCodeMap: Record<EVersionType, Record<string, string>>;
  versionType: EVersionType;
  visualMap: Record<EVersionType, Record<string, CanvasClassifyVisual>>;
}) => {
  const labelCode = nameCodeMap[versionType][normalizeLabel(label)];
  const normalizedCode = normalizeLabel(code);

  if (labelCode && visualMap[versionType][labelCode]) {
    return labelCode;
  }

  return normalizedCode;
};

export const getCanvasCategoryVisual = (
  versionType?: EVersionType,
  code?: string | number | null,
  label?: string | number | null,
) => {
  const normalizedVersionType = normalizeVersionType(versionType);
  const visualCode = getVisualCode({
    code,
    label,
    nameCodeMap: CATEGORY_NAME_CODE_MAP,
    versionType: normalizedVersionType,
    visualMap: CANVAS_CATEGORY_VISUAL_MAP,
  });

  if (!visualCode) {
    return undefined;
  }

  return CANVAS_CATEGORY_VISUAL_MAP[normalizedVersionType][visualCode];
};

export const getCanvasClassifyVisual = (
  versionType?: EVersionType,
  code?: string | number | null,
  label?: string | number | null,
) => {
  const normalizedVersionType = normalizeVersionType(versionType);
  const visualCode = getVisualCode({
    code,
    label,
    nameCodeMap: CLASSIFY_NAME_CODE_MAP,
    versionType: normalizedVersionType,
    visualMap: CANVAS_CLASSIFY_VISUAL_MAP,
  });

  if (!visualCode) {
    return undefined;
  }

  return CANVAS_CLASSIFY_VISUAL_MAP[normalizedVersionType][visualCode];
};
