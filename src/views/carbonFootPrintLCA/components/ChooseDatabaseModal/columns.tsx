import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { LcaFactor } from './type';

export const columns = (): TableRenderProps<LcaFactor>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 68,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootPrintLCA.activityName,
      dataIndex: 'factorName',
      width: 200,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootPrintLCA.associatedProductName,
      dataIndex: 'productName',
      width: 200,
    },
    {
      title: I18N.Factors.yearOfPublication,
      dataIndex: 'year',
      width: 120,
    },
    {
      title: I18N.Factors.geographicalRepresentativeness,
      dataIndex: 'areaRepresent',
      width: 150,
      render: (_v, row) => {
        /** 地理代表性 */
        const areaRepresent = `${row.areaRepresent || ''}${
          row.areaRepresentDetail ? `-${row.areaRepresentDetail}` : ''
        }`;
        return areaRepresent || '-';
      },
    },
    {
      title: I18N.carbonFootPrintLCA.databaseName,
      dataIndex: 'dbName',
      width: 150,
    },
    {
      title: I18N.carbonFootPrintLCA.applicableScope,
      dataIndex: 'scene',
    },
  ]);
