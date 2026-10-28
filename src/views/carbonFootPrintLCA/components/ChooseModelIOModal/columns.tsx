import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { AssociationIo } from '@/views/carbonFootPrintLCA/components/ProcessManageDrawer/type';

import { PROCESS_CATEGORY } from '../ProcessManageTable/constant';

export const columns = ({
  categoryType,
}: {
  /** 类别:1 输入; 2 输出; 3 产品 */
  categoryType?: number;
}): TableRenderProps<AssociationIo>['columns'] => {
  const ioNameTitle =
    categoryType === PROCESS_CATEGORY.INPUT
      ? I18N.carbonFootPrintLCA.outputName
      : I18N.carbonFootPrintLCA.enterName;

  return compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 68,
    },
    {
      title: I18N.carbonFootPrintLCA.lifeCycleStage,
      dataIndex: 'lifeCycle',
      width: 240,
    },
    {
      title: I18N.carbonFootPrintLCA.processName,
      dataIndex: 'processName',
    },
    {
      title: ioNameTitle,
      dataIndex: 'ioName',
    },
    {
      title: I18N.carbonFootPrintLCA.researchObject2,
      dataIndex: 'researchObject_name',
    },
    {
      title: I18N.carbonFootPrintLCA.numericalValue,
      dataIndex: 'dataValue',
    },
    {
      title: I18N.Factors.unit,
      dataIndex: 'unitName',
    },
  ]);
};
