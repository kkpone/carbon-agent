import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';

import { LifeCycleDataResponse } from './type';

export const columns = ({
  onJumpToDetail,
}: {
  onJumpToDetail: (processCode: string) => void;
}): ProColumns<LifeCycleDataResponse>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    width: 80,
  },
  {
    title: I18N.carbonFootPrintLCA.processName,
    dataIndex: 'processName',
    ellipsis: true,
    render: (_, { processCode, processName }) => (
      <Button
        type='link'
        onClick={() => {
          onJumpToDetail(processCode);
        }}
      >
        {processName}
      </Button>
    ),
  },
  {
    title: I18N.carbonFootPrintLCA.timeRepresentativeness,
    dataIndex: 'timeRepresent',
    ellipsis: true,
  },
  {
    title: I18N.Factors.geographicalRepresentativeness,
    dataIndex: 'areaRepresent',
    ellipsis: true,
  },
  {
    title: I18N.Factors.technicalRepresentativeness,
    dataIndex: 'techRepresent',
    ellipsis: true,
  },
];
