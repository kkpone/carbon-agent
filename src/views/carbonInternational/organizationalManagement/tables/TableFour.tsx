/**
 * @file 排放因子选择表
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addEllipsisToColumn, fixTableText } from '@utils/index';
import DataEmptyStatus from '@components/DataEmptyStatus';
import { getFactortable } from '@api/carbon-international';
import { getEditionType } from '../../utils';

const TableFour = () => {
  const [editionTypeNum] = getEditionType();
  const [all_total, setTotal] = useState<number>();
  const [page, setPage] = useState(1);
  const [pagesize, setPagesize] = useState(10);
  const infoId = useParams() as { id?: number | undefined };
  const [tableData, setDataSource] = useState<any[]>([]);
  // 将后台返回因子数据与表头对应起来
  const getColumnsContent = (record: any, type: string) => {
    const r = record?.produce_gas_list?.find(
      ({ prpduce_gas_name }: { prpduce_gas_name: string }) =>
        prpduce_gas_name === type,
    );
    if (!r) return null;
    return `${r.prpduce_gas_emission_factor || ''} ${r.prpduce_gas_unit || ''}`;
  };
  const columns: any = addEllipsisToColumn([
    {
      title: I18N.dashborad.number,
      key: 'index',
      fixed: 'left',
      render: (text: any, record: any, index: any) => (
        <span className='text-14'>{index + 1}</span>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.facilityActivities,
      dataIndex: 'facility',
      fixed: 'left',
    },
    {
      title: I18N.carbonFootprint.emissionSources,
      dataIndex: 'emission_source',
      fixed: 'left',
    },
    {
      title: I18N.carbonInternational.generatingGas,
      dataIndex: 'address',
      fixed: 'left',
      render: (text: any, record: any) => {
        const arr: any[] = [];
        for (let i = 0; i < record.produce_gas_list.length; i++) {
          arr.push(record.produce_gas_list[i].prpduce_gas_name);
        }
        return arr.join('、');
      },
    },
    ...['CO₂e', 'CO₂', 'CH₄', 'N₂O', 'HFCs', 'PFCs', 'SF₆', 'NF₃'].map(gas => ({
      title: I18N.template(I18N.carbonInternational.gasEmissions2, { val1: gas }),
      dataIndex: gas,
      render: (text: any, record: any) =>
        fixTableText(getColumnsContent(record, gas)),
    })),
    {
      title: I18N.carbonFootprint.emissionFactors2,
      dataIndex: 'emission_factor_source',
      fixed: 'right',
    },
    {
      title: I18N.carbonInternational.emissionFactors6,
      dataIndex: 'age',
      fixed: 'right',
      render: (text: any, record: any) => (
        <span>
          {record.emission_factor} / {record.emission_factor_grade}
        </span>
      ),
    },
  ]);
  const getTable = async (page: number, page_size: number) => {
    await getFactortable({
      page,
      page_size,
      carbon_emission_info_id: infoId.id,
      edition: editionTypeNum,
    }).then(res => {
      if (res.data) {
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
        scroll={{ x: 'auto' }}
        pagination={{
          total: all_total,
          showSizeChanger: true,
          pageSize: pagesize,
          onChange(page: number, pageSize?: number) {
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
export default TableFour;
