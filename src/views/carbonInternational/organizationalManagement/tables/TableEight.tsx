/**
 * @file 组织运营边界调查表
 */
import I18N from '@src/lang/I18N';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fixTableColumnsText } from '@utils/index';
import { getBoundarytable } from '@api/carbon-international';
import { tableMergeCellsRender } from '@utils/TableMerge';
import { getEditionType } from '../../utils';

const TableEight = () => {
  const [editionTypeNum] = getEditionType();
  const infoId = useParams() as { id?: number | undefined };
  const [dataSource, setDataSource] = useState([]);
  const columns = fixTableColumnsText([
    {
      title: I18N.enterpriseCarbonAccount2.reportBoundaries,
      dataIndex: 'type',
      render: (text: any, record: any, index: any) =>
        tableMergeCellsRender({
          tableData: dataSource,
          record,
          index,
          objname: 'type',
          text,
        }),
    },
    {
      title: I18N.enterpriseCarbonAccount2.emissionCategories,
      dataIndex: 'emissions_category',
      render: (text: any, record: any, index: any) =>
        tableMergeCellsRender({
          tableData: dataSource,
          record,
          index,
          objname: 'emissions_category',
          text,
        }),
    },
    {
      title: I18N.carbonInternational.emissionSubcategories,
      dataIndex: 'emissions_subcategory',
    },
    {
      title: I18N.carbonFootprint.emissionSources,
      dataIndex: 'emission_source',
    },
    {
      title: I18N.enterpriseCarbonAccount2.facilityActivities,
      dataIndex: 'facility',
    },
  ]);
  // 合并数据
  const getTable = async () => {
    await getBoundarytable({
      carbon_emission_info_id: infoId.id,
      edition: editionTypeNum,
    }).then(({ data }) => {
      const r = data.results?.[0]?.emission_source_data_detail;
      if (r) {
        const arr = Object.values(r).flat();

        for (let i = 0; i < arr.length; i++) {
          if (
            arr[i].emissions_category === I18N.enterpriseCarbonAccount2.directDischargeOr ||
            arr[i].emissions_category === I18N.enterpriseCarbonAccount2.scopeOne
          ) {
            // @ts-ignore
            arr[i].type = I18N.enterpriseCarbonAccount2.directEmissions;
          } else {
            // @ts-ignore
            arr[i].type = I18N.enterpriseCarbonAccount2.indirectEmissions;
          }
        }

        // @ts-ignore
        setDataSource(arr);
      }
    });
  };
  useEffect(() => {
    getTable();
  }, []);
  return (
    <div>
      <Table
        dataSource={dataSource}
        columns={columns}
        bordered
        pagination={false}
      />
    </div>
  );
};
export default TableEight;
