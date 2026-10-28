/**
 * @file 排放量计算表
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addEllipsisToColumn, fixTableText } from '@utils/index';
import DataEmptyStatus from '@components/DataEmptyStatus';
import { getCalculationtable } from '@api/carbon-international';
import { getEditionType } from '../../utils';

const TableFive = () => {
  const [editionTypeNum] = getEditionType();
  const [all_total, setTotal] = useState<number>();
  const [page, setPage] = useState(1);
  const [pagesize, setPagesize] = useState(10);
  const infoId = useParams() as { id?: number | undefined };
  const [tableData, setDataSource] = useState<any[]>([]);
  // 排放系数
  const getEmissionCoefficient = (record: any, type: string, title: string) => {
    const r = record?.produce_gas_list.find(
      ({ prpduce_gas_name }: { prpduce_gas_name: string }) =>
        prpduce_gas_name === type,
    );
    if (!r) return '-';
    switch (title) {
      case I18N.carbonFootprint.emissionCoefficient:
        return fixTableText(r.prpduce_gas_emission_factor + r.prpduce_gas_unit);
      case I18N.enterpriseCarbonAccount2.annualEmissions2:
        return fixTableText(r.year_carbon_emission);
      case 'GWP':
        return fixTableText(r.potential_energy_numeric);
      case I18N.carbonFootprint.emissions:
        return fixTableText(r.carbon_emission);
      case I18N.carbonInternational.speciesSelection:
        return fixTableText(r.greenhouse_gases);
      default:
        return null;
    }
  };
  const columns: any = [
    {
      title: I18N.carbonFootprint3.basicInformation,
      fixed: 'left',
      width: 400,
      children: addEllipsisToColumn([
        {
          title: I18N.dashborad.number,
          dataIndex: 'building',
          width: 100,
          fixed: 'left',
          render: (text: any, record: any, index: any) => (
            <span className='text-14'>{index + 1}</span>
          ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.facilityActivities,
          dataIndex: 'facility',
          fixed: 'left',
          width: 100,
        },
        {
          title: I18N.carbonFootprint.emissionSources,
          dataIndex: 'emission_source',
          fixed: 'left',
          width: 100,
        },
        {
          title: I18N.enterpriseCarbonAccount2.emissionCategories,
          dataIndex: 'emissions_category',
          fixed: 'left',
          width: 100,
        },
      ]),
    },
    {
      title: I18N.carbonFootprint3.activityData,
      dataIndex: 'active_data',
      key: 'active_data',
      width: 120,
      fixed: 'left',
      render: (t: string, record: any) => t + (record?.unit || ''),
    },
    ...['CO₂e', 'CO₂', 'CH₄', 'N₂O', 'HFCs', 'PFCs', 'SF₆', 'NF₃'].map(gas => ({
      title: gas,
      children: [
        {
          title: I18N.carbonFootprint.emissionCoefficient,
          key: gas,
          width: 120,
          render: (text: string, record: any) =>
            getEmissionCoefficient(record, gas, I18N.carbonFootprint.emissionCoefficient),
        },
        {
          title: I18N.template(I18N.carbonInternational.annualEmissionsT, { val1: gas }),
          dataIndex: 'companyName',
          key: 'companyName',
          width: 120,
          render: (text: string, record: any) =>
            getEmissionCoefficient(record, gas, I18N.enterpriseCarbonAccount2.annualEmissions2),
        },
        {
          title: I18N.enterpriseCarbonAccount2.gwpPotential,
          dataIndex: 'companyAddress',
          key: 'companyAddress',
          width: 120,
          render: (text: string, record: any) =>
            getEmissionCoefficient(record, gas, 'GWP'),
        },
        {
          title: I18N.enterpriseCarbonAccount2.emissionsTC2,
          dataIndex: 'companyName',
          width: 120,
          render: (text: string, record: any) =>
            getEmissionCoefficient(record, gas, I18N.carbonFootprint.emissions),
        },
      ],
    })),
    {
      title: I18N.carbonInternational.yearOfEachEmissionSource,
      dataIndex: 'emissions_total',
      width: 120,
      fixed: 'right',
    },
    {
      title: I18N.carbonInternational.accountingFor100OfTotalEmissions,
      dataIndex: 'carbon_emission_percentage',
      width: 160,
      fixed: 'right',
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const getTable = (page: number, page_size: number) => {
    getCalculationtable({
      page,
      page_size,
      carbon_emission_info_id: infoId.id,
      edition: editionTypeNum,
    }).then(res => {
      if (res?.data) {
        setTotal(res?.data?.count || 0);
        setDataSource(res?.data?.results || []);
      }
    });
  };
  useEffect(() => {
    getTable(page, pagesize);
  }, []);
  return (
    <div>
      <DataEmptyStatus
        columns={columns}
        dataSource={tableData}
        scroll={{ x: 1500 }}
        bordered
        pagination={{
          total: all_total,
          pageSize: pagesize,
          showSizeChanger: true,
          // eslint-disable-next-line @typescript-eslint/no-shadow
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
export default TableFive;
