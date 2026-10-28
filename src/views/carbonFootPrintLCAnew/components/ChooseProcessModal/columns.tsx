import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { ChooseProcessLibrary } from './type';

export const columns = (): TableRenderProps<ChooseProcessLibrary>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 80,
    },
    {
      title: I18N.carbonFootPrintLCA.processSetName,
      dataIndex: 'processLibName',
      width: 180,
    },
    {
      title: I18N.carbonData.affiliatedOrganization,
      dataIndex: 'orgName',
      width: 120,
    },
    {
      title: I18N.carbonFootPrintLCA.lifeCycleStage,
      dataIndex: 'lifeCycleName',
    },
  ]);
