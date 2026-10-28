import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { Factor } from './type';

export const columns = (): TableRenderProps<Factor>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 80,
    },
    {
      title: I18N.Factors.factorName,
      dataIndex: 'name',
    },
    {
      title: I18N.Factors.productName,
      dataIndex: 'productName',
    },
    {
      title: I18N.carbonFootPrintLCA.productUnit,
      dataIndex: 'unit',
    },
    {
      title: I18N.carbonFootPrintLCA.timeRepresentativeness,
      dataIndex: 'year',
    },
    {
      title: I18N.Factors.geographicalRepresentativeness,
      dataIndex: 'areaRepresentName',
    },
    {
      title: I18N.Factors.technicalRepresentativeness,
      dataIndex: 'techRepresent',
    },
    {
      title: I18N.carbonFootPrintLCA.dataSources,
      dataIndex: 'institution',
    },
  ]);
