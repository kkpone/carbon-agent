/*
 * @@description: 排放源库- 列表搜索
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import { EmissionSoureLibraryTableData } from './type';
import TextOverflowTable from '../../component/TextOverflowTable';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import { ALL_EMISSION_LABEL } from '../../constant';

/**
 * 碳足迹核算3.0 - 排放源库
 */
export const carbonFootprintEmissionSoureLibrarySearchForm =
  (): FromItemProps<any>[] => {
    const data: FromItemProps<any>[] = [
      {
        ...formItemInitInput('', 'name', false),
        props: {
          placeholder: I18N.carbonFootprint3.emissionSourceName,
        },
      },
    ];
    return data.map(item => {
      const back = item;
      back.props = {
        style: { width: '200px' },
        ...back.props,
      };
      return back;
    });
  };

/**
 * 排放源库 - 表格的表头
 */
export const carbonFootprintEmissionSoureLibraryTableCol =
  (): ColumnsType<EmissionSoureLibraryTableData> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.carbonFootprint3.emissionSourceName,
      width: 200,
      fixed: 'left',
      dataIndex: 'name',
      render: (val: string) => {
        if (val) {
          return <TextOverflowTable value={val} maxLength={20} />;
        }
        return '-';
      },
    },
    {
      title: I18N.carbonFootprint.type,
      width: 200,
      dataIndex: 'type',
      render: (VAL: number) => ALL_EMISSION_LABEL()[VAL],
    },
    {
      title: I18N.carbonFootprint.unit,
      width: 100,
      dataIndex: 'unitStr',
      render: (val: string) => <TextWidthOverflow width={90} value={val} />,
    },
    {
      title: I18N.ilcd.emissionSourceDescription,
      width: 200,
      dataIndex: 'emissionSourceDescription',
      render: (val: string) => <TextWidthOverflow width={190} value={val} />,
    },
    {
      title: I18N.carbonFootprint.updatedBy,
      width: 120,
      dataIndex: 'updateByName',
      render: (val: string) => <TextWidthOverflow width={100} value={val} />,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      width: 200,
      dataIndex: 'updateTime',
    },
  ];
