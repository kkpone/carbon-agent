/**
 * @file 温室气体排放清单
 */
import I18N from '@src/lang/I18N';
import '../organizationalManagement.less';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'antd';
import { fixTableColumnsText, sliceNumberEnd } from '@utils/index';
import { getGreenHouseable } from '@api/carbon-international';
import { Dictionary } from '@typings/index';
import { getEditionType } from '../../utils';

const TableSix = () => {
  const [editionTypeNum, editionStr] = getEditionType();
  const infoId = useParams() as { id?: number };

  const [emissionRange, setEmissionrange] = useState({
    indirect_emission: '',
    direct_emission: '',
    indirect_emission_percentage: '',
    direct_emission_percentage: '',
  });
  const [emissionType, setEmissiontype] = useState<any>({
    direct_emission: [],
    direct_emission_sum: '',
    indirect_energy_emissions: [],
    indirect_energy_emissions_sum: '',
    transport_emissions: [],
    transport_emissions_sum: '',
    outsourcing_emissions: [],
    outsourcing_emissions_sum: '',
    supply_chain_emissions: [],
    supply_chain_emissions_sum: '',
    else_emissions: [],
    else_emissions_sum: '',
  });
  const [tableData, setDataSource] = useState({
    carbon_emission_sum: 0,
  });
  const [direct_emission_produce_gas, setdirectEmissionproducegas] = useState({
    'CO₂': null,
    'CH₄': null,
    'N₂O': null,
    HFCs: null,
    PFCs: null,
    'NF₃': null,
    'SF₆': null,
  });
  useEffect(() => {
    if (infoId?.id) getTable();
  }, []);

  const getTable = async () => {
    await getGreenHouseable({
      carbon_emission_info_id: infoId.id,
      edition: editionTypeNum,
    }).then(({ data }) => {
      const d = data?.results?.[0];
      if (d) {
        setEmissiontype(d?.emission_type);
        setEmissionrange(d?.emission_range);
        setdirectEmissionproducegas(d?.direct_emission_produce_gas);
        setDataSource(d);
      }
    });
  };
  // 计算总排放量百分比
  const getdata = (value: string) =>
    `${parseFloat(
      (
        (Number(value || 0) / Number(tableData.carbon_emission_sum)) *
        100
      ).toFixed(2),
    )}%`;

  const dataSource = [
    {
      key: '1',
      name: I18N.enterpriseCarbonAccount2.emissionsTC,
      // 间接排放
      indirect: emissionRange?.indirect_emission,
      // 直接排放
      direct: emissionRange?.direct_emission,
      sum: tableData?.carbon_emission_sum,
    },
    {
      key: '2',
      name: I18N.carbonInternational.shareInTotalEmissions,
      indirect: `${sliceNumberEnd(
        emissionRange?.indirect_emission_percentage,
      )}%`,
      direct: `${sliceNumberEnd(emissionRange?.direct_emission_percentage)}%`,
      sum: '100%',
    },
  ];
  const columns = fixTableColumnsText([
    {
      title: I18N.enterpriseCarbonAccount2.range,
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: I18N.enterpriseCarbonAccount2.directGreenhouseGas,
      dataIndex: 'direct',
      key: 'direct',
    },
    {
      title: I18N.enterpriseCarbonAccount2.indirectGreenhouseGas,
      dataIndex: 'indirect',
      key: 'indirect',
    },
    {
      title: I18N.greenMeeting.total,
      dataIndex: 'sum',
      key: 'sum',
    },
  ]);

  const addScope2Obj = (
    obj: Dictionary<any>,
    fn: (key: string) => string | number,
  ) => {
    const res = { ...obj };
    const scope = 'scope';
    [1, 2, 3].forEach(key => {
      const k = `${scope}${key}`;
      res[k] = fn(k);
    });
    return res;
  };
  const GHGData2 = [
    addScope2Obj(
      {
        name: I18N.enterpriseCarbonAccount2.emissionsTC,
        sum: tableData.carbon_emission_sum,
      },
      key => emissionType?.[`${key}_sum`],
    ),
    addScope2Obj(
      {
        name: I18N.carbonInternational.ofEmissions,
        sum: '100%',
      },
      key => getdata(emissionType?.[`${key}_sum`]),
    ),
  ];
  const renderISODatas = (
    column: Dictionary<any>,
    renderValueFn: (key: string) => any,
  ) => {
    const res = { ...column };
    const keys = [
      'direct_emission',
      'indirect_energy_emissions',
      'transport_emissions',
      'outsourcing_emissions',
      'supply_chain_emissions',
      'else_emissions',
    ];
    keys.forEach(key => {
      res[key] = renderValueFn(key);
    });
    return res;
  };
  let dataSource2 = [
    // renderISODatas(
    //   {
    //     key: '1',
    //     name: '气体种类',
    //     sum: '-',
    //   },
    //   key => splitGas(emissionType?.[key]),
    // ),
    renderISODatas(
      {
        key: '2',
        name: I18N.enterpriseCarbonAccount2.emissionsTC,
        sum: tableData.carbon_emission_sum,
      },
      key => emissionType?.[`${key}_sum`],
    ),
    renderISODatas(
      {
        key: '3',
        name: I18N.carbonInternational.ofEmissions,
        sum: '100%',
      },
      key => getdata(emissionType?.[`${key}_sum`]),
    ),
  ];
  if (editionStr === 'GHG') {
    // @ts-ignore
    dataSource2 = GHGData2;
  }
  const columnType = {
    GHG: [
      {
        title: I18N.enterpriseCarbonAccount2.scopeOne,
        dataIndex: 'scope1',
      },
      {
        title: I18N.enterpriseCarbonAccount2.scope2,
        dataIndex: 'scope2',
      },
      {
        title: I18N.enterpriseCarbonAccount2.fanWeisan,
        dataIndex: 'scope3',
      },
    ],
    ISO: [
      {
        title: I18N.enterpriseCarbonAccount2.directDischargeOr,
        dataIndex: 'direct_emission',
      },
      {
        title: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
        dataIndex: 'indirect_energy_emissions',
      },
      {
        title: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
        dataIndex: 'transport_emissions',
      },
      {
        title: I18N.enterpriseCarbonAccount2.outsourcedProductsOr,
        dataIndex: 'outsourcing_emissions',
      },
      {
        title: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain,
        dataIndex: 'supply_chain_emissions',
      },
      {
        title: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
        dataIndex: 'else_emissions',
      },
    ],
  };
  const columns2 = fixTableColumnsText([
    {
      title: I18N.enterpriseCarbonAccount2.emissionCategories,
      dataIndex: 'name',
    },
    // @ts-ignore
    ...columnType[editionStr],
    {
      title: I18N.greenMeeting.total,
      dataIndex: 'sum',
    },
  ]);

  const dataSource3 = [
    {
      key: '1',
      name: I18N.enterpriseCarbonAccount2.emissionsTC,
      co: direct_emission_produce_gas?.['CO₂'],
      ch: direct_emission_produce_gas?.['CH₄'],
      no: direct_emission_produce_gas?.['N₂O'],
      hfcs: direct_emission_produce_gas?.HFCs,
      pfcs: direct_emission_produce_gas?.PFCs,
      nf: direct_emission_produce_gas?.['NF₃'],
      sf: direct_emission_produce_gas?.['SF₆'],
      mix: direct_emission_produce_gas?.[I18N.enterpriseCarbonAccount2.blend],
      sum: emissionRange?.direct_emission,
    },
  ];
  const columns3 = [
    {
      title: I18N.carbonInternational.gasType,
      dataIndex: 'name',
    },
    {
      title: 'CO₂',
      dataIndex: 'co',
    },
    {
      title: 'CH₄',
      dataIndex: 'ch',
    },
    {
      title: 'N₂O',
      dataIndex: 'no',
    },
    {
      title: 'HFCs',
      dataIndex: 'hfcs',
    },
    {
      title: 'PFCs',
      dataIndex: 'pfcs',
    },
    {
      title: 'SF₆',
      dataIndex: 'sf',
    },
    {
      title: 'NF₃',
      dataIndex: 'nf',
    },
    {
      title: I18N.enterpriseCarbonAccount2.blend,
      dataIndex: 'mix',
    },
    {
      title: I18N.greenMeeting.total,
      dataIndex: 'sum',
    },
  ];

  const TableContent = [
    {
      title: I18N.carbonInternational.greenhouseGases,
      key: 1,
      dataSource,
      columns,
    },
    {
      title: I18N.carbonInternational.twoGreenhouseGases,
      key: 2,
      dataSource: dataSource2,
      columns: columns2,
    },
    {
      title: I18N.carbonInternational.threeTypesOfGreenhouses,
      key: 3,
      dataSource: dataSource3,
      columns: columns3,
    },
  ];
  return (
    <div>
      {TableContent.map(item => (
        <>
          <div key={item.key} className='tablesix_title'>
            {item.title}
          </div>
          <Table
            dataSource={
              tableData.carbon_emission_sum
                ? item.dataSource
                : ([] as unknown as any[])
            }
            columns={item.columns}
            pagination={false}
          />
        </>
      ))}
    </div>
  );
};
export default TableSix;
