import I18N from '@src/lang/I18N';
import Permission from '@src/components/Permission';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/lib/table';
// import { useHistory } from 'react-router-dom';
import './carbon-greenMeeting.scss';

const AccountingList = ({
  ShowInterger,
  downLoadINterger,
  TablePage,
}): ColumnsType =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const history = useHistory();

  [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => (
        <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
      ),
    },
    {
      title: I18N.carbonNeutral.productName,
      dataIndex: 'goodsName',
    },
    {
      title: I18N.carbonNeutral.productType,
      dataIndex: 'type',
    },
    {
      title: I18N.carbonNeutral.quantityTon,
      dataIndex: 'buyAmount',
    },
    {
      title: I18N.carbonNeutral.totalPriceYuan,
      dataIndex: 'payMoney',
    },
    {
      title: I18N.carbonNeutral.transactionTime,
      dataIndex: 'createTime',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'accessTime',
      fixed: 'right',
      key: 'accessTime',
      width: 180,
      render: (text: string, record: any) =>
        record.certFlag === '0' ? (
          <Space size={28}>
            <Permission flag='neutral:cert:info'>
              <Button type='text' style={{ padding: '0', color: '#ccc' }}>
                {I18N.carbonNeutral.viewCertificate}
              </Button>
            </Permission>
            <Permission flag='neutral:cert:down'>
              <Button type='text' style={{ paddingLeft: '0', color: '#ccc' }}>
                {I18N.carbonNeutral.downloadCertificate}
              </Button>
            </Permission>
          </Space>
        ) : (
          <Space size={28}>
            <Permission flag='neutral:cert:info'>
              <Button
                type='link'
                onClick={() => {
                  ShowInterger(record);
                }}
                style={{ paddingLeft: '0' }}
              >
                {I18N.carbonNeutral.viewCertificate}
              </Button>
            </Permission>
            <Permission flag='neutral:cert:down'>
              <Button
                type='link'
                onClick={() => {
                  downLoadINterger(record);
                }}
                style={{ paddingLeft: '0' }}
              >
                {I18N.carbonNeutral.downloadCertificate}
              </Button>
            </Permission>
          </Space>
        ),
    },
  ];
export const creatColumns = (
  type: string,
  { ShowInterger, downLoadINterger, TablePage },
) => {
  switch (type) {
    case I18N.carbonNeutral.purchaseRecords:
      return AccountingList({ ShowInterger, downLoadINterger, TablePage });
    default:
      return null;
  }
};
