/**
 * @file 排放源识别表
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fixTableColumnsText } from '@utils/index';
import DataEmptyStatus from '@components/DataEmptyStatus';
import { getIdentificationtable } from '@api/carbon-international';
import { getEditionType } from '../../utils';

const TableTwo = () => {
  const [editionTypeNum] = getEditionType();
  const [all_total, setTotal] = useState<number>();
  const [page, setPage] = useState(1);
  const infoId = useParams() as { id?: number | undefined };
  const [pagesize, setPagesize] = useState(10);
  const [tableData, setDataSource] = useState<any[]>([]);
  const columns = fixTableColumnsText([
    {
      title: I18N.dashborad.number,
      key: 'index',
      render: (text: any, record: any, index: any) => (
        <span className='text-14'>{index + 1}</span>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.facilityActivities,
      dataIndex: 'facility',
      key: 'facility',
    },
    {
      title: I18N.carbonFootprint.emissionSources,
      dataIndex: 'emission_source',
      key: 'emission_source',
    },
    {
      title: I18N.carbonInternational.emissionSourceCategory,
      dataIndex: 'emissions_category',
      key: 'emissions_category',
    },
    {
      title: I18N.enterpriseCarbonAccount2.saveDepartment,
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: I18N.carbonInternational.generatingGasSpecies,
      dataIndex: 'produce_gas_list',
      key: 'produce_gas_list',
      render: (text: any) => <span className='text-14'>{text.join('、')}</span>,
    },
  ]);
  const getTable = async (page: number, page_size: number) => {
    await getIdentificationtable({
      page,
      page_size,
      carbon_emission_info_id: infoId.id,
      edition: editionTypeNum,
    }).then(res => {
      if (res?.data) {
        setTotal(res.data?.count || 0);
        setDataSource(res.data?.results || []);
      }
    });
  };
  useEffect(() => {
    getTable(page, pagesize);
  }, []);
  return (
    <div>
      <DataEmptyStatus
        dataSource={tableData}
        columns={columns}
        pagination={{
          total: all_total,
          showSizeChanger: true,
          pageSize: pagesize,
          onChange(page: any, pageSize: any) {
            setPage(page);
            const ps = pageSize || 10;
            setPagesize(ps);
            getTable(page, ps);
          },
        }}
      />
    </div>
  );
};
export default TableTwo;
