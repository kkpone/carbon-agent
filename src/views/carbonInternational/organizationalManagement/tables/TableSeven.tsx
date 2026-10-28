/**
 * @file 数据分类评分等级
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useParams } from 'react-router-dom';
import { getGradetable } from '@api/carbon-international';
import { getEditionType } from '../../utils';
import { twoDecimal } from '../utils';

const TableSeven = () => {
  const [editionTypeNum] = getEditionType();
  const infoId = useParams() as { id?: number | undefined };
  const [dataSource, setDataSource] = useState([]);
  const getTable = async () => {
    await getGradetable({
      carbon_emission_info_id: infoId.id,
      edition: editionTypeNum,
    }).then(({ data }) => {
      if (data?.data?.length > 0) {
        const onj_old = data.data[data.data.length - 1];
        data.data.pop();
        const obj = {
          active_data_grade: 0,
          emission_factor_grade: 0,
          emission_load: null,
          emission_load_average: 0,
          emission_load_percentage: 0,
          emission_load_weighted_score: 0,
          facility: '',
        };
        if (data.data.length >= 1) {
          data.data.push(
            {
              ...obj,
              emission_load: onj_old.produce_gas_sum,
              emission_load_percentage: '100',
              emission_load_weighted_score:
                onj_old.emission_load_weighted_score_sum,
            },
            {
              ...obj,
              active_data_grade: onj_old.emission_load_weighted_score_sum,
            },
            {
              ...obj,
              active_data_grade: onj_old.emission_load_weighted_score_explain,
            },
          );
        }
      }
      setDataSource(data.data);
    });
  };
  useEffect(() => {
    if (infoId?.id) getTable();
  }, []);

  const columns = [
    {
      title: I18N.dashborad.number,
      dataIndex: 'name',
      render: (text: any, row: any, index: any) => {
        if (index < dataSource.length - 3) {
          return <span>{index + 1}</span>;
        }
        if (index === dataSource.length - 3) {
          return {
            children: I18N.carbonFootprint.total, //* ** 2：可编辑关键就是这个
            props: { colSpan: 5 }, // *** 3：合并行列关键
          };
        }
        if (index === dataSource.length - 2) {
          return {
            children: I18N.carbonInternational.weightedAverage2, //* ** 2：可编辑关键就是这个
            props: { colSpan: 3 }, // *** 3：合并行列关键
          };
        }
        if (index === dataSource.length - 1) {
          return {
            children: I18N.carbonInternational.weightedAverage, //* ** 2：可编辑关键就是这个
            props: { colSpan: 3 }, // *** 3：合并行列关键
          };
        }
        return null;
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.facilityActivities,
      dataIndex: 'facility',
      key: 'facility',
      render: (text: any, row: any, index: any) => {
        if (index < dataSource.length - 3) {
          return <span>{text}</span>;
        }
        if (index === dataSource.length - 3) {
          return {
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            //* ** 2：可编辑关键就是这个
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        return null;
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
      dataIndex: 'emission_factor_grade',
      render: (text: any, row: any, index: any) => {
        if (index < dataSource.length - 3) {
          return <span>{text}</span>;
        }
        if (index === dataSource.length - 3) {
          return {
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            //* ** 2：可编辑关键就是这个
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        return null;
      },
    },
    {
      title: I18N.carbonInternational.activityDataAcquisition2,
      dataIndex: 'active_data_grade',
      render: (text: any, row: any, index: any) => {
        if (index < dataSource.length - 3) {
          return <span>{text}</span>;
        }
        if (index === dataSource.length - 3) {
          return {
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            children: text, //* ** 2：可编辑关键就是这个
            props: { colSpan: 5 }, // *** 3：合并行列关键             	 // *** 3：合并行列关键
          };
        }
        return null;
      },
    },
    {
      title: I18N.carbonInternational.averageScore,
      dataIndex: 'emission_load_average',
      render: (text: any, row: any, index: any) => {
        if (index < dataSource.length - 3) {
          return <span>{text}</span>;
        }
        if (index === dataSource.length - 3) {
          return {
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            //* ** 2：可编辑关键就是这个
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        return null;
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.emissionsTC2,
      dataIndex: 'emission_load',
      render: (text: any, row: any, index: any) => {
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            //* ** 2：可编辑关键就是这个
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        return <span>{parseFloat(Number(text).toFixed(4))}</span>;
      },
    },
    {
      title: I18N.carbonInternational.emissionsAsAPercentageOfTotal,
      dataIndex: 'emission_load_percentage',
      render: (text: any, row: any, index: any) => {
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            //* ** 2：可编辑关键就是这个
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        return <span>{twoDecimal(text)}</span>;
      },
    },
    {
      title: I18N.carbonInternational.weightedAverageScore,
      dataIndex: 'emission_load_weighted_score',
      render: (text: any, row: any, index: any) => {
        if (
          index === dataSource.length - 2 ||
          index === dataSource.length - 1
        ) {
          return {
            //* ** 2：可编辑关键就是这个
            props: { colSpan: 0 }, // *** 3：合并行列关键
          };
        }
        return <span>{text}</span>;
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        bordered
        pagination={false}
      />
    </div>
  );
};
export default TableSeven;
