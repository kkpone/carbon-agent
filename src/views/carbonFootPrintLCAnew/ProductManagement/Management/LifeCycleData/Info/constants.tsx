import I18N from '@src/lang/I18N';

export const PROCESS_INFO_TYPE = {
  /** 过程信息 */
  PROCESS_INFO: 0,
  /** 产品 */
  PRODUCT: 1,
  /** 材料输入 */
  MATERIAL_INPUT: 2,
  /** 运输输入 */
  TRANSPORT_INPUT: 3,
  /** 能源和水输入 */
  ENERGY_WATER_INPUT: 4,
  /** 三废输出 */
  THREE_WASTE_OUTPUT: 5,
};

const {
  PROCESS_INFO,
  PRODUCT,
  MATERIAL_INPUT,
  TRANSPORT_INPUT,
  ENERGY_WATER_INPUT,
  THREE_WASTE_OUTPUT,
} = PROCESS_INFO_TYPE;

export const PROCESS_INFO_TYPE_LABEL = {
  [PROCESS_INFO]: I18N.carbonFootPrintLCA.processInformation,
  [PRODUCT]: I18N.carbonFootPrintLCA.product,
  [MATERIAL_INPUT]: I18N.carbonFootPrintLCA.materialInput,
  [TRANSPORT_INPUT]: I18N.carbonFootPrintLCA.transportationInput,
  [ENERGY_WATER_INPUT]: I18N.carbonFootPrintLCA.energyAndWaterTransportation,
  [THREE_WASTE_OUTPUT]: I18N.carbonFootPrintLCA.threeWasteOutput,
};
