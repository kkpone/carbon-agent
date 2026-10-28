import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';

import { PROCESS_INFO_TYPE } from './constants';

const {
  PRODUCT,
  MATERIAL_INPUT,
  TRANSPORT_INPUT,
  ENERGY_WATER_INPUT,
  THREE_WASTE_OUTPUT,
} = PROCESS_INFO_TYPE;

/**
 * 产品
 */
export const productColumns = (): ProColumns<any>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    fixed: 'left',
    width: 80,
  },
  {
    title: I18N.Factors.productName,
    dataIndex: 'ioName',
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type,
    dataIndex: 'dataType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.quantity,
    dataIndex: 'ioValue',
    ellipsis: true,
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'ioUnit',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.flowDirection,
    dataIndex: 'ioType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.allocationMethod,
    dataIndex: 'allocMethod',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.allocationBasis,
    dataIndex: 'allocBase',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.distributionRatio,
    dataIndex: 'allocFactor',
    ellipsis: true,
  },
  {
    title: I18N.dashborad.remarks,
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: 'errMsg',
    ellipsis: true,
  },
];

/**
 * 材料输入
 */
export const materialInputColumns = (): ProColumns<any>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    fixed: 'left',
    width: 80,
  },
  {
    title: I18N.eca.name,
    dataIndex: 'ioName',
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type,
    dataIndex: 'dataType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.quantity,
    dataIndex: 'ioValue',
    ellipsis: true,
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'ioUnit',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.typeOfShipping,
    dataIndex: 'transMethod',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportationTools,
    dataIndex: 'transVehicle',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportationDistanceK,
    dataIndex: 'transDistance',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.origin,
    dataIndex: 'originCity',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.destination,
    dataIndex: 'destinationCity',
    ellipsis: true,
  },
  {
    title: I18N.dashborad.remarks,
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: 'errMsg',
    ellipsis: true,
  },
];

/**
 * 运输输入
 */
export const transportInputColumns = (): ProColumns<any>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    fixed: 'left',
    width: 80,
  },
  {
    title: I18N.eca.name,
    dataIndex: 'ioName',
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type,
    dataIndex: 'dataType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.quantity,
    dataIndex: 'ioValue',
    ellipsis: true,
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'ioUnit',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.typeOfShipping,
    dataIndex: 'transMethod',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportationTools,
    dataIndex: 'transVehicle',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportationDistanceK,
    dataIndex: 'transDistance',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.origin,
    dataIndex: 'originCity',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.destination,
    dataIndex: 'destinationCity',
    ellipsis: true,
  },
  {
    title: I18N.dashborad.remarks,
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: 'errMsg',
    ellipsis: true,
  },
];

/**
 * 能源和水输入
 */
export const energyAndWaterInputColumns = (): ProColumns<any>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    width: 80,
  },
  {
    title: I18N.eca.name,
    dataIndex: 'ioName',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type,
    dataIndex: 'dataType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.quantity,
    dataIndex: 'ioValue',
    ellipsis: true,
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'ioUnit',
    ellipsis: true,
  },
  {
    title: I18N.dashborad.remarks,
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: 'errMsg',
    ellipsis: true,
  },
];

/**
 * 三废输出
 */
export const threeWastesOutputColumns = (): ProColumns<any>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    width: 80,
  },
  {
    title: I18N.eca.name,
    dataIndex: 'ioName',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type,
    dataIndex: 'dataType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.quantity,
    dataIndex: 'ioValue',
    ellipsis: true,
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'ioUnit',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.disposalMethod,
    dataIndex: 'disposalMethod',
    ellipsis: true,
  },
  {
    title: I18N.dashborad.remarks,
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: 'errMsg',
    ellipsis: true,
  },
];

export const processDetailTabelList = [
  {
    key: PRODUCT,
    columns: productColumns(),
    scroll: true,
  },
  {
    key: MATERIAL_INPUT,
    columns: materialInputColumns(),
    scroll: true,
  },
  {
    key: TRANSPORT_INPUT,
    columns: transportInputColumns(),
    scroll: true,
  },
  {
    key: ENERGY_WATER_INPUT,
    columns: energyAndWaterInputColumns(),
    scroll: false,
  },
  {
    key: THREE_WASTE_OUTPUT,
    columns: threeWastesOutputColumns(),
    scroll: false,
  },
];
