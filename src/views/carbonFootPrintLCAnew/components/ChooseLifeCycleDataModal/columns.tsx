import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { LifeCycleDataResponse } from '../../ProductManagement/Management/LifeCycleData/type';

export const columns = (): TableRenderProps<LifeCycleDataResponse>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 80,
    },
    {
      title: I18N.carbonFootPrintLCA.processName,
      dataIndex: 'processName',
      width: 180,
    },
    {
      title: I18N.carbonFootPrintLCA.timeRepresentativeness,
      dataIndex: 'timeRepresent',
      width: 120,
    },
    {
      title: I18N.Factors.geographicalRepresentativeness,
      dataIndex: 'areaRepresent',
    },
    {
      title: I18N.Factors.technicalRepresentativeness,
      dataIndex: 'techRepresent',
    },
    {
      title: I18N.carbonFootPrintLCA.processDescription,
      dataIndex: 'processDesc',
    },
  ]);
