import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';

import { ApplyForAccountStatusLabel, ApplyForLabelTypeText } from './constant';
import { CarbonLabelListData } from './type';
import TextWidthOverflow from '../component/TextOverflowTable/byWidth';

const statusStyles = [
  {
    color: '#6C757D',
    borderColor: '#D2D6DA',
    background: '#F7F8F9',
  },
  {
    color: '#3491FA',
    borderColor: '#B0DDFF',
    background: '#F0F9FF',
  },
  {
    color: '#0CBF9F',
    borderColor: '#AAF2DB',
    background: '#E6FFF6 ',
  },
  {
    color: '#ED5555',
    borderColor: '#FFDAD6',
    background: ' #FFF2F0',
  },
  {
    color: '#3491FA',
    borderColor: '#B0DDFF',
    background: '#F0F9FF',
  },
  {
    color: '#ED5555',
    borderColor: '#FFDAD6',
    background: ' #FFF2F0',
  },
];

export const columnsCarbonLabel = (): ColumnsType<CarbonLabelListData> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
    fixed: 'left',
    width: 70,
    render: (_, processLib, index) => index + 1,
  },
  {
    title: I18N.carbonFootprint.productName,
    width: 300,
    fixed: 'left',
    dataIndex: 'productName',
    render: (val: string) => <TextWidthOverflow value={val} width={260} />,
  },
  {
    title: I18N.carbonFootprint3.specificationAndModel,
    width: 150,
    dataIndex: 'specs',
    render: (val: string) => <TextWidthOverflow value={val} width={110} />,
  },
  {
    title: I18N.carbonFootprint3.unitEmissions,
    width: 200,
    dataIndex: 'accountName',
    render: (val: string, row) => {
      if (val) {
        return (
          <TextWidthOverflow
            value={`${row.accountObj?.perEmission || '-'}${
              row.accountObj?.unitName || '-'
            }${row.unitName ? `/${row.unitName}` : '-'}`}
            width={160}
          />
        );
      }
      return '-';
    },
  },
  {
    dataIndex: 'startTime',
    title: I18N.carbonFootprint.accountingCycle,
    width: 250,
    render(_, row) {
      if (!row.startTime || !row.endTime) return '-';
      return I18N.template(I18N.carbonFootprint3.rowst, {
        val1: row.startTime,
        val2: row.endTime,
      });
    },
  },
  {
    title: I18N.carbonFootprint3.carbonLabelType,
    dataIndex: 'labelType',
    width: 150,
    render(val: number) {
      return ApplyForLabelTypeText[val];
    },
  },

  {
    dataIndex: 'updateByName',
    title: I18N.carbonFootprint.updatedBy,
    width: 100,
  },
  {
    title: I18N.carbonFootprint3.applicationStatus,
    dataIndex: 'status',
    width: 200,
    render: (val: number) => (
      <div
        style={{
          height: 28,
          // width: 120,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid',
          borderRadius: 4,
          ...statusStyles[val],
        }}
      >
        {ApplyForAccountStatusLabel[val]}
      </div>
    ),
  },
  {
    dataIndex: 'updateTime',
    title: I18N.carbonFootprint3.whenEditingAnApplication,
    width: 250,
  },
  {
    title: I18N.carbonFootprint3.applicationNumber,
    dataIndex: 'applyNum',
    width: 150,
  },
];
