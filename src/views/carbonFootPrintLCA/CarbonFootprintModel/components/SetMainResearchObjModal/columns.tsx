import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

export const impactAssessmentColumns = (): ColumnsType<{
  index: number;
  label: string;
}> => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'index',
    width: '68px',
    render: (_v: any, _r: any, index: number) => index + 1,
  },
  {
    title: I18N.prodManagement.indicatorName,
    dataIndex: 'label',
  },
];
