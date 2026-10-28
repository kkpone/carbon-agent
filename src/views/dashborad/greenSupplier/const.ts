import I18N from '@src/lang/I18N';

export enum REDUCTIONCATEGORYTYPE {
  MATERIAL = '0',
  GOODS = '1',
  TECHNOLOGY = '2',
}
export const REDUCTIONCATEGORYTYPE_LABLE = {
  [REDUCTIONCATEGORYTYPE.MATERIAL]:
    I18N.dashborad.supplyOfEmissionReducingMaterials2,
  [REDUCTIONCATEGORYTYPE.GOODS]: I18N.dashborad.supplyOfEmissionReducingGoods2,
  [REDUCTIONCATEGORYTYPE.TECHNOLOGY]:
    I18N.dashborad.emissionReductionTechnologySupply2,
};
export const REDUCTIONCATEGORYTYPE_DESC = {
  [REDUCTIONCATEGORYTYPE.MATERIAL]:
    I18N.dashborad.supplyOfEmissionReducingMaterials,
  [REDUCTIONCATEGORYTYPE.GOODS]: I18N.dashborad.supplyOfEmissionReducingGoods,
  [REDUCTIONCATEGORYTYPE.TECHNOLOGY]:
    I18N.dashborad.emissionReductionTechnologySupply,
};
