import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';

import { SupplierData } from './type';

export const columns = (): ProColumns<SupplierData>[] => [
  {
    title: I18N.carbonFootPrintLCA.stage,
    dataIndex: 'stage',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.inputOutputClass,
    dataIndex: 'ioType_name',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.dataType,
    dataIndex: 'dataType_name',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.materialCode,
    dataIndex: 'hwCode',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.materialDescription,
    dataIndex: 'materialDesc',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.manufacturersMaterials,
    dataIndex: 'manufacturerMaterialNo',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.chineseNameOfMaterial,
    dataIndex: 'materialName',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.englishNameAnd,
    dataIndex: 'materialNameEn',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.procurementMethod,
    dataIndex: 'purchasingEntity',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.madeOfHomogeneousMaterials,
    dataIndex: 'specification',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.materialInputQuantity,
    dataIndex: 'materialInputQuantity',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.feedingUnit,
    dataIndex: 'feedingUnit',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.eachUnitOfProduct,
    dataIndex: 'weightOfMaterialInput',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.dataSources,
    dataIndex: 'dataSource',
    ellipsis: true,
  },
  // {
  //   title: I18N.carbonFootPrintLCA.sourceDepartmentIndustry,
  //   dataIndex: 'bu',
  //   ellipsis: true,
  // },
  {
    title: I18N.carbonFootPrintLCA.carbonFootprintFactor,
    dataIndex: 'factorValue',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.factorSource,
    dataIndex: 'factorSource',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.carbonFootprintAttachment,
    dataIndex: 'footprintAttachment',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.mainTransportationProvider,
    dataIndex: 'transMethod',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportationVehiclesCarrying,
    dataIndex: 'vehiclePayload',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.fuelType,
    dataIndex: 'fuelType',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.cityOfShipment,
    dataIndex: 'originCity',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.cityOfReceivingLocation,
    dataIndex: 'destinationCity',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportationDistance,
    dataIndex: 'transDistance',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.transportData,
    dataIndex: 'transDataSource',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type4,
    dataIndex: 'type3',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.inputOutputCount,
    dataIndex: 'ioDataType_name',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.value,
    dataIndex: 'ioValue',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.supplementaryDescription,
    dataIndex: 'suppDesc',
    ellipsis: true,
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'ioUnit',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.activityData,
    dataIndex: 'ioDataSource',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type2,
    dataIndex: 'type1',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootPrintLCA.type3,
    dataIndex: 'type2',
    ellipsis: true,
  },
];
