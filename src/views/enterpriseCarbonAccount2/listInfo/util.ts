/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-25 10:39:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-04 14:18:23
 */

import I18N from '@src/lang/I18N';

import { ISOTreeWithChildren, ScopeTree } from './types';

export const GWPinfo = [
  {
    label: I18N.enterpriseCarbonAccount2.ipccSection3,
    value: '2',
  },
  {
    label: I18N.enterpriseCarbonAccount2.ipccSection2,
    value: '1',
  },
  {
    label: I18N.enterpriseCarbonAccount2.ipccSection,
    value: '0',
  },
];
export const factorType = [
  {
    value: '1',
    label: I18N.enterpriseCarbonAccount2.internationalEmissionsSystem,
  },
  { value: '2', label: I18N.enterpriseCarbonAccount2.nationalEmissionSystem },
  { value: '3', label: I18N.enterpriseCarbonAccount2.regionalEmissionSystem },
  {
    value: '4',
    label: I18N.enterpriseCarbonAccount2.providedByTheManufacturer,
  },
  { value: '5', label: I18N.enterpriseCarbonAccount2.processEquipment },
  { value: '6', label: I18N.enterpriseCarbonAccount2.measureMaterialLevel },
];
const listToTree = (
  parent: ScopeTree[],
  children: ScopeTree[],
): ISOTreeWithChildren[] => {
  const map: Record<number, ISOTreeWithChildren> = {};

  children.forEach(item => {
    const targetFromMap = map[item.pCatId];
    const child: ISOTreeWithChildren = {
      ...item,
      label: item.category,
      value: item.id,
      children: [],
      disabled: false,
    };
    if (targetFromMap) {
      targetFromMap.children = targetFromMap.children.concat(child);
    } else {
      const findParent = parent.find(c => c.catId === item.pCatId);

      if (findParent) {
        map[item.pCatId] = {
          ...findParent,
          label: findParent.category,
          value: findParent.id,
          disabled: false,
          children: [child],
        };
      }
    }
  });

  return Object.values(map).flat();
};

// ghg 分类
export const GHGFirstSelect: ScopeTree[] = [
  {
    category: I18N.enterpriseCarbonAccount2.scopeOne,
    id: '0',
    catId: 1,
    pCatId: 0,
    disabled: true,
    commId: 1,
  },
  {
    category: I18N.enterpriseCarbonAccount2.scope2,
    id: '1',
    catId: 2,
    pCatId: 0,
    disabled: true,
    commId: 2,
  },
  {
    category: I18N.enterpriseCarbonAccount2.fanWeisan,
    id: '2',
    catId: 3,
    pCatId: 0,
    disabled: true,
    commId: 3,
  },
];
// ghg 类别
export const GHGSecondSelect: ScopeTree[] = [
  {
    category: I18N.enterpriseCarbonAccount2.fixedCombustion,
    id: '0',
    catId: 4,
    pCatId: 1,
    pid: '0',
    commId: 4,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.mobileCombustion,
    id: '1',
    catId: 5,
    pCatId: 1,
    pid: '0',
    commId: 5,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.process,
    id: '2',
    catId: 6,
    pCatId: 1,
    pid: '0',
    commId: 6,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.unorganizedEmissions,
    id: '3',
    catId: 7,
    pCatId: 1,
    pid: '0',
    commId: 7,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.carbonSequestration,
    id: '4',
    catId: 8,
    pCatId: 1,
    pid: '0',
    commId: 8,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.power,
    id: '5',
    catId: 9,
    pCatId: 2,
    pid: '1',
    commId: 9,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.steam,
    id: '6',
    catId: 10,
    pCatId: 2,
    pid: '1',
    commId: 10,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.compressedAir,
    id: '7',
    catId: 11,
    pCatId: 2,
    pid: '1',
    commId: 11,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.cold,
    id: '8',
    catId: 12,
    pCatId: 2,
    pid: '1',
    commId: 12,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.heat,
    id: '9',
    catId: 18,
    pCatId: 2,
    pid: '1',
    commId: 13,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryOutsourcer,
    id: '10',
    catId: 19,
    pCatId: 3,
    pid: '2',
    commId: 14,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryCapitalQuotient,
    id: '11',
    catId: 20,
    pCatId: 3,
    pid: '2',
    commId: 15,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryFuelAnd,
    catId: 21,
    pCatId: 3,
    id: '12',
    pid: '2',
    commId: 50,
    disabled: true,
  },

  {
    category: I18N.enterpriseCarbonAccount2.categoryUpstreamTransport,
    catId: 22,
    pCatId: 3,
    id: '13',
    pid: '2',
    commId: 17,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryOperation,
    catId: 23,
    pCatId: 3,
    id: '14',
    pid: '2',
    disabled: true,
    commId: 18,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryBusinessTravel,
    catId: 24,
    pCatId: 3,
    id: '15',
    pid: '2',
    disabled: true,
    commId: 19,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryEmployeeCommunication,
    catId: 25,
    pCatId: 3,
    id: '16',
    pid: '2',
    commId: 20,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryUpstreamRent,
    catId: 26,
    pCatId: 3,
    id: '17',
    pid: '2',
    commId: 21,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categorySalesProduction3,
    catId: 27,
    pCatId: 3,
    id: '18',
    pid: '2',
    commId: 22,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categorySalesProduction2,
    catId: 28,
    pCatId: 3,
    id: '19',
    pid: '2',
    commId: 23,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categorySalesProduction,
    catId: 29,
    pCatId: 3,
    id: '20',
    pid: '2',
    commId: 24,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryProcessingLifespan,
    catId: 30,
    pCatId: 3,
    id: '21',
    pid: '2',
    commId: 25,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryDownstreamRent,
    catId: 31,
    pCatId: 3,
    id: '22',
    pid: '2',
    commId: 26,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryFranchise,
    catId: 32,
    pCatId: 3,
    id: '23',
    pid: '2',
    commId: 27,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.categoryInvestment,
    catId: 33,
    pCatId: 3,
    id: '24',
    pid: '2',
    commId: 28,
    disabled: true,
  },
];
// iso 分类
export const ISOFirstSelect: ScopeTree[] = [
  {
    category: I18N.enterpriseCarbonAccount2.directDischargeOr,
    id: '0',
    catId: 1,
    pCatId: 0,
    commId: 1,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
    id: '1',
    catId: 2,
    pCatId: 0,
    commId: 2,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
    id: '2',
    catId: 3,
    pCatId: 0,
    commId: 3,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.outsourcedProductsOr,
    id: '3',
    catId: 4,
    pCatId: 0,
    commId: 3,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain3,
    id: '4',
    catId: 5,
    pCatId: 0,
    disabled: true,
    commId: 3,
  },
  {
    category: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
    id: '5',
    catId: 6,
    pCatId: 0,
    commId: 3,
    disabled: true,
  },
];
// iso 类别
export const ISOSecondSelect: ScopeTree[] = [
  {
    category: I18N.enterpriseCarbonAccount2.fixedCombustion,
    pid: '0',
    id: '0',
    catId: 7,
    pCatId: 1,
    commId: 4,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.mobileCombustion,
    pid: '0',
    id: '1',
    catId: 8,
    pCatId: 1,
    commId: 5,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.process,
    pid: '0',
    id: '2',
    catId: 9,
    pCatId: 1,
    commId: 6,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.fugitiveEmissions,
    pid: '0',
    id: '3',
    catId: 10,
    pCatId: 1,
    commId: 7,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.landUseSoil,
    pid: '0',
    id: '4',
    catId: 11,
    pCatId: 1,
    commId: 8,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.power,
    pid: '1',
    id: '5',
    catId: 12,
    pCatId: 2,
    commId: 9,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.steam,
    pid: '1',
    id: '6',
    catId: 13,
    pCatId: 2,
    commId: 10,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.compressedAir,
    pid: '1',
    id: '7',
    catId: 14,
    pCatId: 2,
    commId: 11,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.cold,
    pid: '1',
    id: '8',
    catId: 15,
    pCatId: 2,
    commId: 12,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.heat,
    pid: '1',
    id: '9',
    catId: 16,
    pCatId: 2,
    commId: 13,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.employeeTravel,
    pid: '2',
    id: '10',
    catId: 17,
    pCatId: 3,
    commId: 19,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.employeeCommuting,
    pid: '2',
    id: '11',
    catId: 18,
    pCatId: 3,
    commId: 20,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.upstreamTransportation,
    pid: '2',
    id: '12',
    catId: 19,
    pCatId: 3,
    commId: 17,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.downstreamTransportation,
    pid: '2',
    id: '13',
    catId: 20,
    pCatId: 3,
    commId: 22,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.customerVisits,
    pid: '2',
    id: '14',
    catId: 21,
    pCatId: 3,
    commId: 19,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.wasteDisposal,
    pid: '3',
    id: '15',
    catId: 22,
    pCatId: 4,
    commId: 18,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.purchaseOfCapitalGoods,
    pid: '3',
    id: '16',
    catId: 23,
    pCatId: 4,
    commId: 15,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.procurementOfRawMaterials,
    pid: '3',
    id: '17',
    catId: 24,
    pCatId: 4,
    commId: 14,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.operatingLeaseFunds,
    pid: '3',
    id: '18',
    catId: 25,
    pCatId: 4,
    commId: 21,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.applicableToOtherClothing,
    pid: '3',
    id: '19',
    catId: 26,
    pCatId: 4,
    commId: 14,
    disabled: true,
  },
  {
    category: I18N.carbonFootprint.productUsage,
    pid: '4',
    id: '20',
    catId: 27,
    pCatId: 5,
    commId: 24,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.productProcessing,
    pid: '4',
    id: '21',
    catId: 28,
    pCatId: 5,
    commId: 23,
    disabled: true,
  },
  {
    category: I18N.carbonFootprint.abandonedDisposal,
    pid: '4',
    id: '22',
    catId: 29,
    pCatId: 5,
    commId: 25,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.investmentInOtherAssets,
    pid: '4',
    id: '23',
    catId: 30,
    pCatId: 5,
    commId: 28,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.rentingAssets,
    pid: '4',
    id: '24',
    catId: 31,
    pCatId: 5,
    commId: 26,
    disabled: true,
  },
  {
    category: I18N.carbonFootprint3.other,
    pid: '5',
    id: '25',
    catId: 33,
    pCatId: 6,
    commId: 27,
    disabled: true,
  },
  {
    category: I18N.enterpriseCarbonAccount2.fuelAndEnergy,
    pid: '3',
    id: '26',
    catId: 26,
    pCatId: 4,
    commId: 50,
    disabled: true,
  },
];

// GHG树形分类
export const GHGTree = listToTree(GHGFirstSelect, GHGSecondSelect);

export const ISOTree = listToTree(ISOFirstSelect, ISOSecondSelect);

interface IsoGhgCategoryType {
  ghgCategory: null | undefined | string;
  ghgClassify: null | undefined | string;
  isoCategory: null | undefined | string;
  isoClassify: null | undefined | string;
  type: 'ghgCategory' | 'ghgClassify' | 'isoCategory' | 'isoClassify';
}
export const isoGhgCategory = ({
  ghgCategory,
  ghgClassify,
  isoCategory,
  isoClassify,
  type,
}: IsoGhgCategoryType): any[] => {
  let ghgCaId;
  let ghgClId;
  let isoCaId;
  let isoClId;
  switch (type) {
    case 'ghgCategory':
      const ghgCaCommId = GHGFirstSelect.find(
        item => item.id === ghgCategory,
      )?.commId;
      isoCaId = ISOFirstSelect.find(item => item.commId === ghgCaCommId)?.id;
      break;
    case 'ghgClassify':
      const ghgClCommId = GHGSecondSelect.find(
        item => item.id === ghgClassify,
      )?.commId;
      const isoClObj = ISOSecondSelect.find(
        item => item.commId === ghgClCommId,
      );
      isoClId = isoClObj?.id;
      isoCaId = isoClObj?.pid;
      break;
    case 'isoCategory':
      const isoCaCommId = ISOFirstSelect.find(
        item => item.id === isoCategory,
      )?.commId;
      ghgCaId = GHGFirstSelect.find(item => item.commId === isoCaCommId)?.id;
      break;
    case 'isoClassify':
      const isoClCommId = ISOSecondSelect.find(
        item => item.id === isoClassify,
      )?.commId;
      const ghgClObj = GHGSecondSelect.find(
        item => item.commId === isoClCommId,
      );
      ghgClId = ghgClObj?.id;
      ghgCaId = ghgClObj?.pid;
      break;

    default:
      break;
  }
  ghgCategory = ghgCaId || ghgCategory;
  ghgClassify = ghgClId || ghgClassify;
  isoCategory = isoCaId || isoCategory;
  isoClassify = isoClId || isoClassify;
  return [ghgCategory, ghgClassify, isoCategory, isoClassify];
};
export const lessUnit = [
  { value: '0', label: 'tCO₂e' },
  { value: '1', label: 'kgCO₂e' },
  { value: '2', label: 'gCO₂e' },
  { value: '3', label: 'tCO₂' },
  { value: '4', label: 'kgCO₂' },
  { value: '5', label: 'gCO₂' },
];
