import I18N from '@src/lang/I18N';
import { CaretDownOutlined } from '@ant-design/icons';
import Permission from '@src/components/Permission';
import { Button, Dropdown, Menu } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useHistory } from 'react-router-dom';
import './carbon-greenMeeting.scss';

const status = [I18N.components.notStartedYet, I18N.components.inProgress, I18N.greenMeeting.ended];
const statusClass = ['info', 'waring', 'succsee'];
const actType = [I18N.greenMeeting.free, I18N.greenMeeting.charge];
export const actClassify = [I18N.carbonNeutral.meeting, I18N.carbonNeutral.forum, I18N.carbonNeutral.show, I18N.carbonNeutral.exhibition, I18N.carbonNeutral.match, I18N.carbonFootprint3.other];
const activityColum = ({ deleteItem }): ColumnsType => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const history = useHistory();
  return [
    {
      title: I18N.carbonFootprint.number,
      ellipsis: true,
      fixed: true,
      width: 70,
      render: (text, record, index: number) => index + 1,
    },
    {
      title: I18N.greenMeeting.activityName,
      dataIndex: 'actName',
      fixed: true,
      ellipsis: true,
      width: 300,
    },
    {
      title: I18N.greenMeeting.activityType,
      ellipsis: true,
      dataIndex: 'actType',
      width: 100,
      render: (text: number) => <div>{actType[text]}</div>,
    },
    {
      title: I18N.greenMeeting.activityClassification,
      ellipsis: true,
      dataIndex: 'actClass',
      width: 100,
      render: (text: number) => (
        <div>{(text && actClassify[text]) || '--'}</div>
      ),
    },
    {
      title: I18N.greenMeeting.holdingTime,
      ellipsis: true,
      dataIndex: 'beginTime',
      width: 340,
      render: (text: string, record: any) => (
        <div>
          {text}{I18N.carbonFootprint.to}{record?.endTime}
        </div>
      ),
    },
    {
      title: I18N.greenMeeting.venue,
      dataIndex: 'area',
      width: 150,
      ellipsis: true,
      // render: (text: string) => {
      //   return <div>{text || '--'}</div>;
      // },
    },
    {
      title: I18N.greenMeeting.activityStatus,
      ellipsis: true,
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (text: number) => (
        <div className={statusClass[text]}>{status[text]}</div>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'accessTime',
      fixed: 'right',
      key: 'accessTime',
      width: 180,
      render: (text: string, record: any) => {
        const menu = (
          <Menu className='drop-box'>
            <Menu.Item key='0'>
              <Permission flag='meeting:activity:edit'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    history.push(
                      `/greenMeeting/activity/eidtActivity?id=${record.actId}`,
                    );
                  }}
                >
                  {I18N.carbonFootprint.edit}</p>
              </Permission>
            </Menu.Item>
            <Menu.Item key='1'>
              <Permission flag='meeting:activity:delete'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    deleteItem(record.actId);
                  }}
                >
                  {I18N.carbonFootprint.delete}</p>
              </Permission>
            </Menu.Item>
          </Menu>
        );
        return (
          <>
            <Permission flag='meeting:activity:info'>
              <Button
                style={{ marginRight: '28px' }}
                type='link'
                onClick={() => {
                  history.push(
                    `/greenMeeting/activity/detailActivity?id=${record.actId}`,
                  );
                }}
              >
                {I18N.carbonFootprint.check}</Button>
            </Permission>
            <Permission
              flag={'meeting:activity:delete' || 'meeting:activity:edit'}
            >
              <Dropdown overlay={menu}>
                {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  className='ant-dropdown-link'
                  onClick={e => e.preventDefault()}
                >
                  {I18N.Certification.more}<CaretDownOutlined />
                </a>
              </Dropdown>
            </Permission>
          </>
        );
      },
    },
  ];
};
const adjustColum = ({ deleteItem }): ColumnsType => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const history = useHistory();

  return [
    {
      title: I18N.carbonFootprint.number,
      fixed: true,
      width: 70,
      render: (text, record, index: number) => index + 1,
    },
    {
      title: I18N.greenMeeting.carbonAccountingName2,
      fixed: true,
      ellipsis: true,
      dataIndex: 'accountingName',
      width: 300,
    },
    {
      title: I18N.greenMeeting.activityName,
      dataIndex: 'actName',
      ellipsis: true,
      width: 200,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: I18N.greenMeeting.activityClassification,
      dataIndex: 'actClass',
      ellipsis: true,
      width: 100,
      render: (text: string) => (
        <div>{(text && actClassify[text]) || '--'}</div>
      ),
    },
    {
      title: I18N.carbonFootprint.accountingModel,
      dataIndex: 'modelName',
      ellipsis: true,
      width: 150,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.greenMeeting.totalEmissionsT,
      dataIndex: 'emissionTotal',
      ellipsis: true,
      width: 170,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.updatedBy,
      dataIndex: 'updateBy',
      width: 100,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.greenMeeting.atTheFinalUpdate,
      dataIndex: 'updateTime',
      width: 190,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'accessTime',
      fixed: 'right',
      key: 'accessTime',
      width: 200,
      render: (text: string, record: any) => {
        const menu = (
          <Menu className='drop-box'>
            <Menu.Item key='0'>
              <Permission flag='meeting:carbonAccounting:statistics'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    history.push(
                      `/greenMeeting/adjust/addAdjustData?id=${record.accountingId}`,
                    );
                  }}
                >
                  {I18N.ModelManagement.dataStatistics2}</p>
              </Permission>
            </Menu.Item>
            <Menu.Item key='1'>
              <Permission flag='meeting:carbonAccounting:info'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    history.push(
                      `/greenMeeting/adjust/adjustDetail?id=${record.accountingId}`,
                    );
                  }}
                >
                  {I18N.greenMeeting.viewData}</p>
              </Permission>
            </Menu.Item>
            <Menu.Item key='2'>
              <Permission flag='meeting:carbonAccounting:edit'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    history.push(
                      `/greenMeeting/adjust/eidtAdjustOne?id=${record.accountingId}`,
                    );
                  }}
                >
                  {I18N.carbonFootprint.edit}</p>
              </Permission>
            </Menu.Item>
            <Menu.Item key='3'>
              <Permission flag='meeting:carbonAccounting:delete'>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    deleteItem(record.accountingId);
                  }}
                >
                  {I18N.carbonFootprint.delete}</p>
              </Permission>
            </Menu.Item>
          </Menu>
        );
        return (
          <>
            <Permission flag='meeting:carbonAccounting:saveData'>
              <Button
                style={{ marginRight: '28px' }}
                type='link'
                onClick={() => {
                  history.push(
                    `/greenMeeting/adjust/dataManage?id=${record.accountingId}`,
                  );
                }}
              >
                {I18N.greenMeeting.dataManagement}</Button>
            </Permission>
            <Permission
              flag={
                'meeting:carbonAccounting:statistics' ||
                'meeting:carbonAccounting:info' ||
                'meeting:carbonAccounting:edit' ||
                'meeting:carbonAccounting:delete'
              }
            >
              <Dropdown overlay={menu}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  className='ant-dropdown-link'
                  onClick={e => e.preventDefault()}
                >
                  {I18N.Certification.more}<CaretDownOutlined />
                </a>
              </Dropdown>
            </Permission>
          </>
        );
      },
    },
  ];
};
const reportColum = ({ deleteItem, creatReport }): ColumnsType => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const history = useHistory();

  return [
    {
      title: I18N.carbonFootprint.number,
      fixed: true,
      width: 70,
      ellipsis: true,
      render: (text, record, index: number) => index + 1,
    },
    {
      title: I18N.carbonFootprint.reportName,
      fixed: true,
      ellipsis: true,
      dataIndex: 'reportName',
      width: 300,
    },
    {
      title: I18N.greenMeeting.activityName,
      ellipsis: true,
      dataIndex: 'actName',
      width: 200,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: I18N.greenMeeting.activityClassification,
      ellipsis: true,
      dataIndex: 'actClass',
      width: 100,
      render: (text: string) => (
        <div>{(text && actClassify[text]) || '--'}</div>
      ),
    },
    {
      title: I18N.carbonFootprint.accountingModel,
      ellipsis: true,
      dataIndex: 'accountingName',
      width: 150,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.greenMeeting.totalEmissionsT,
      ellipsis: true,
      dataIndex: 'emissionTotal',
      width: 170,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.greenMeeting.reportManagement,
      dataIndex: 'report',
      ellipsis: true,
      align: 'center',
      width: 100,
      render: (text: string, record: any) => (
        <Permission flag='meeting:accountingReport:generate'>
          <Button
            type='link'
            onClick={() => {
              creatReport(record.reportId);
            }}
          >
            {I18N.carbonFootprint.generateReport}</Button>
        </Permission>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'opr',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (text: string, record: any) => {
        const menu = (
          <Menu className='drop-box'>
            <Menu.Item key='0'>
              <Permission flag='meeting:accountingReport:info'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    history.push(
                      `/greenMeeting/report/reportDetail?id=${record.reportId}`,
                    );
                  }}
                >
                  {I18N.carbonFootprint.check}</p>
              </Permission>
            </Menu.Item>
            <Menu.Item key='1'>
              <Permission flag='meeting:accountingReport:edit'>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    history.push(
                      `/greenMeeting/report/eidtReport?id=${record.reportId}`,
                    );
                  }}
                >
                  {I18N.carbonFootprint.edit}</p>
              </Permission>
            </Menu.Item>
            <Menu.Item key='2'>
              <Permission flag='meeting:accountingReport:delete'>
                {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <p
                  onClick={() => {
                    deleteItem(record.reportId);
                  }}
                >
                  {I18N.carbonFootprint.delete}</p>
              </Permission>
            </Menu.Item>
          </Menu>
        );
        return (
          <Permission
            flag={
              'meeting:accountingReport:delete' ||
              'meeting:accountingReport:edit' ||
              'meeting:accountingReport:info'
            }
          >
            <Dropdown overlay={menu}>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className='ant-dropdown-link'
                onClick={e => e.preventDefault()}
              >
                {I18N.Certification.more}<CaretDownOutlined />
              </a>
            </Dropdown>
          </Permission>
        );
      },
    },
  ];
};

export const creatColumns = (type: string, { deleteItem, creatReport }) => {
  switch (type) {
    case I18N.greenMeeting.activityList:
      return activityColum({ deleteItem });
    case I18N.greenMeeting.carbonEmissionAccounting:
      return adjustColum({ deleteItem });
    case I18N.carbonNeutral.carbonAccountingReport:
      return reportColum({ deleteItem, creatReport });
    default:
      return undefined;
  }
};
