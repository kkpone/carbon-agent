import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';

import { BomResp } from './type';

export const columns = (): ProColumns<BomResp>[] => [
  {
    title: I18N.carbonFootPrintLCA.materialHierarchy,
    dataIndex: 'level',
    fixed: 'left',
    width: 80,
  },
  {
    title: I18N.carbonFootPrintLCA.materialCode,
    dataIndex: 'bomCode',
    fixed: 'left',
    width: 120,
  },
  {
    title: I18N.carbonFootPrintLCA.materialName,
    dataIndex: 'bomName',
    fixed: 'left',
    width: 160,
  },
  {
    title: I18N.carbonFootPrintLCA.englishName,
    dataIndex: 'bomEnDesc',
  },
  {
    title: I18N.carbonFootPrintLCA.latestVersion,
    dataIndex: 'lastVersion',
  },
  {
    title: I18N.carbonFootPrintLCA.superiorMaterialEditor,
    dataIndex: 'pcode',
  },
  {
    title: I18N.carbonFootPrintLCA.quantity,
    dataIndex: 'amount',
  },
  {
    title: I18N.carbonFootPrintLCA.quantityUnit,
    dataIndex: 'amountUnitDesc',
  },
  {
    title: I18N.carbonFootPrintLCA.weight,
    dataIndex: 'weight',
  },
  {
    title: I18N.carbonFootPrintLCA.weightUnit,
    dataIndex: 'weightUnitDesc',
  },
  {
    title: I18N.carbonFootPrintLCA.numberOfOtherUnits,
    dataIndex: 'otherAmount',
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'otherAmountUnitDesc',
  },
  {
    title: I18N.carbonFootPrintLCA.mainMaterials,
    dataIndex: 'material',
  },
];
