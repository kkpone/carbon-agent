import I18N from '@src/lang/I18N';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import { useRequest } from 'ahooks';
import { Table, TableColumnsType } from 'antd';

import { EMISSION_TYPE_LABEL } from '../constant';
import { getProcessMatchProducts } from '../service';
import { ProcessIn } from '../type';

const TableExpandRow: React.VFC<{ processIn: ProcessIn; flag?: boolean }> = ({
  processIn,
  flag,
}) => {
  const { matchTypeId } = processIn;

  const { loading, data: dataSource } = useRequest(
    () => getProcessMatchProducts({ id: matchTypeId, flag }),
    {
      refreshDeps: [],
      loadingDelay: 100,
    },
  );

  /** 输入 - 过程展开表格 */
  const genInProcessTableColumns = (): TableColumnsType<any> => {
    const data: TableColumnsType = [
      {
        title: I18N.carbonFootprint3.nameOfOutput,
        dataIndex: 'name',
        width: 200,
        render: text => (
          <TextOverflowTable maxWidth={200} value={text || ''} maxLength={10} />
        ),
      },
      {
        title: I18N.carbonFootprint3.outputType,
        dataIndex: 'type',
        width: 150,
        render: type => EMISSION_TYPE_LABEL[type as number] || '-',
      },
      {
        title: I18N.carbonFootprint3.actualUsage,
        dataIndex: 'useAmount',
        width: 150,
        render: (text, record) =>
          text ? `${text}${(record as { unitName: string }).unitName}` : '-',
      },
      {
        title: I18N.carbonFootprint.emissions,
        dataIndex: 'emissionTotal',
        width: 200,
        render: text => (text ? `${text}kgCO₂e` : '-'),
      },
    ];
    return data;
  };

  return (
    <Table
      loading={loading}
      rowKey='id'
      columns={genInProcessTableColumns()}
      dataSource={dataSource?.data.data || []}
      pagination={false}
    />
  );
};

export default TableExpandRow;
