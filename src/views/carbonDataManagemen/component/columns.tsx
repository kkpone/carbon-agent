import I18N from '@src/lang/I18N';
import {
  Button,
  Space,
  Tag,
  Tooltip,
  Dropdown,
  Menu,
  Modal,
  Badge,
} from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useHistory } from 'react-router-dom';
import IconFont from '@components/iconfont';
import Permission, { DataPermission } from '@components/Permission';
import { exStatusObj, exStatusObjColor } from '../detail/addActivity';

const TypeObj = {
  1: I18N.carbonFootprint3.enterpriseCarbonAccounting,
  2: I18N.carbonFootprint.carbonFootprintVerification2,
};
const subStatusObj = {
  0: I18N.carbonFootprint3.pendingReview,
  1: I18N.carbonFootprint3.approved,
  2: I18N.emission.reviewRejection,
};
const subStatusObjColor = {
  0: 'orange',
  1: 'blue',
  2: 'red',
};
const AccountingList = ({
  TablePage,
  TargetArchive,
  TargetDeleteFn,
  TargetAllowFn,
}): ColumnsType<{
  targetName: string;
  type: string;
  status: string;
  achieveDischarge: string;
}> => {
  const history = useHistory();
  const statusObj = {
    0: I18N.carbonDataManagemen.unallocated,
    1: I18N.components.inProgress,
    2: I18N.carbonDataManagemen.archived,
  };
  const statusColor = {
    1: 'orange',
    2: 'blue',
  };

  return [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => (
        <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
      ),
    },
    {
      title: I18N.carbonFootprint.name,
      dataIndex: 'targetName',
    },

    {
      title: I18N.carbonDataManagemen.targetAllocation,
      dataIndex: 'type',
      render: (text: string, record) => (
        <Space size={28}>
          <Permission flag='goalSetting:targetAllocation'>
            {
              // @ts-ignore
              Number(record.status === 2) ? (
                ''
              ) : (
                <Button
                  type='link'
                  onClick={() => {
                    history.push(
                      // @ts-ignore
                      `/carbonDataManagemen/goalSetting/editAllocation?targetId=${record.targetId}`,
                    );
                  }}
                  style={{ paddingLeft: '0' }}
                >
                  {I18N.carbonFootprint.edit}</Button>
              )
            }
          </Permission>

          <Permission flag='goalSetting:targetAllocationShow'>
            <Button
              type='link'
              onClick={() => {
                history.push(
                  // @ts-ignore
                  `/carbonDataManagemen/goalSetting/showAllocation?targetId=${record.targetId}`,
                );
              }}
              style={{ paddingLeft: '0' }}
            >
              {I18N.carbonFootprint3.details}</Button>
          </Permission>
        </Space>
      ),
    },
    {
      title: I18N.carbonDataManagemen.targetStatus,
      dataIndex: 'status',
      render: (text: string) => (
        <Tag
          className={`customTag customTag-${statusColor[text]}`}
          color={statusColor[text] || ''}
        >
          {statusObj[text]}
        </Tag>
      ),
    },
    {
      title: I18N.carbonDataManagemen.targetMargin,
      dataIndex: 'achieveDischarge',
      render: (text: string, record) => (
        <span>
          {
            // @ts-ignore
            `${text || 0}/${record.discharge || 0}`
          }
          <Permission flag='goalSetting:viewTargetMargin'>
            <Tooltip
              title={I18N.carbonFootprint.check}
              color='white'
              overlayClassName='costomTooltip'
            >
              <Button
                style={{
                  margin: '0',
                  padding: '0',
                  border: 'none',
                }}
                icon={
                  <IconFont
                    type='icon-icon-zhakanxiangqing'
                    style={{ fontSize: '16px' }}
                  />
                }
                onClick={() => {
                  TargetAllowFn?.(record);
                }}
              />
            </Tooltip>
          </Permission>
        </span>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'targetId',
      fixed: 'right',
      key: 'targetId',
      width: 180,
      render: (text: string, record) => {
        const menu = (
          <Menu className='drop-box'>
            <Menu.Item
              key='0'
              onClick={() => {
                history.push(
                  `/carbonDataManagemen/goalSetting/show?targetId=${text}`,
                );
              }}
            >
              <Permission flag='goalSetting:showTarget'>
                <Button type='link' style={{ paddingLeft: '0', color: '#000' }}>
                  {I18N.carbonFootprint3.details}</Button>
              </Permission>
            </Menu.Item>
            <Menu.Item
              key='1'
              onClick={() => {
                TargetArchive?.(record);
              }}
            >
              {
                // @ts-ignore
                Number(record.status) === 1 && (
                  <Permission flag='goalSetting:archiveTarget'>
                    <Button
                      type='link'
                      style={{ paddingLeft: '0', color: '#000' }}
                    >
                      {I18N.carbonDataManagemen.file}</Button>
                  </Permission>
                )
              }
            </Menu.Item>
            <Permission flag='goalSetting:delTarget'>
              <Menu.Item
                key='2'
                onClick={() => {
                  Modal.confirm({
                    title: '',
                    // icon: <ExclamationCircleOutlined />,
                    content: I18N.carbonDataManagemen.afterDeletingTheTarget,
                    wrapClassName: 'cumstomModal_confirm',
                    okText: I18N.carbonFootprint.confirm,
                    cancelText: I18N.carbonFootprint.cancel,
                    closable: true,
                    onOk: () => {
                      TargetDeleteFn?.(record);
                    },
                  });
                }}
              >
                {
                  // @ts-ignore
                  Number(record.status) === 0 && (
                    <Button
                      type='link'
                      style={{ paddingLeft: '0', color: '#000' }}
                    >
                      {I18N.carbonFootprint.delete}</Button>
                  )
                }
              </Menu.Item>
            </Permission>
          </Menu>
        );
        return (
          // @ts-ignore
          Number(record.status) === 2 ? (
            <Permission flag='goalSetting:showTarget'>
              <Button
                type='link'
                onClick={() => {
                  history.push(
                    `/carbonDataManagemen/goalSetting/show?targetId=${text}`,
                  );
                }}
                style={{ paddingLeft: '0' }}
              >
                {I18N.carbonFootprint3.details}</Button>
            </Permission>
          ) : (
            <Space size={28}>
              <Permission flag='goalSetting:editTarget'>
                <Button
                  type='link'
                  onClick={() => {
                    history.push(
                      `/carbonDataManagemen/goalSetting/edit?targetId=${text}`,
                    );
                  }}
                  style={{ paddingLeft: '0' }}
                >
                  {I18N.carbonFootprint.edit}</Button>
              </Permission>
              <Dropdown overlay={menu}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  className='ant-dropdown-link'
                  onClick={e => e.preventDefault()}
                >
                  {I18N.Certification.more}<CaretDownOutlined />
                </a>
              </Dropdown>
            </Space>
          )
        );
      },
    },
  ];
};
// 目标执行
const GoalObjectiveList = ({
  TablePage,
  TargetAllowFn,
  comfireFn,
  rejectFn,
}): ColumnsType => {
  const history = useHistory();
  return [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => (
        <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
      ),
    },
    {
      title: I18N.carbonFootprint.name,
      dataIndex: 'targetName',
    },
    {
      title: I18N.carbonDataManagemen.executor,
      dataIndex: 'userName',
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'exStatus',
      render: (text: string) => (
        <Tag
          className={`customTag customTag-${exStatusObjColor[text]}`}
          color={exStatusObjColor[text]}
        >
          {exStatusObj[text] || '-'}
        </Tag>
      ),
    },
    {
      title: I18N.carbonDataManagemen.targetMargin,
      dataIndex: 'achieveDischarge',
      render: (text: string, record) => (
        <span>
          {
            // @ts-ignore
            `${text || 0}/${record.allotDischarge || 0}`
          }
          <Permission flag='goalObjective:targetMain'>
            <Tooltip
              title={I18N.carbonFootprint.check}
              color='white'
              overlayClassName='costomTooltip'
            >
              <Button
                style={{
                  margin: '0',
                  padding: '0',
                  border: 'none',
                }}
                icon={
                  <IconFont
                    type='icon-icon-zhakanxiangqing'
                    style={{ fontSize: '16px' }}
                  />
                }
                onClick={() => {
                  TargetAllowFn?.(record);
                }}
              />
            </Tooltip>
          </Permission>
        </span>
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
            <Menu.Item
              key='0'
              onClick={() => {
                Modal.confirm({
                  title: I18N.carbonDataManagemen.refuse,
                  // icon: <ExclamationCircleOutlined />,
                  content: I18N.carbonDataManagemen.unableToReject,
                  wrapClassName: 'cumstomModal_confirm',
                  okText: I18N.carbonFootprint.confirm,
                  cancelText: I18N.carbonFootprint.cancel,
                  closable: true,
                  onOk: () => {
                    rejectFn?.(record);
                  },
                });
              }}
            >
              <Permission flag='goalObjective:rejectTarget'>
                {Number(record.exStatus) === 0 && (
                  <DataPermission editPermission={record.editPermission}>
                    <Button
                      type='link'
                      style={{ paddingLeft: '0', color: '#000' }}
                    >
                      {I18N.carbonDataManagemen.refuse}</Button>
                  </DataPermission>
                )}
              </Permission>
            </Menu.Item>
            <Menu.Item
              key='1'
              onClick={() => {
                // downLoadINterger(record);
                history.push(
                  // @ts-ignore
                  `/carbonDataManagemen/goalObjective/show?targetId=${record.targetId}`,
                );
              }}
            >
              <Permission flag='goalObjective:targetDetail'>
                <Button type='link' style={{ paddingLeft: '0', color: '#000' }}>
                  {I18N.carbonFootprint3.details}</Button>
              </Permission>
            </Menu.Item>
          </Menu>
        );
        return (
          <Space size={28}>
            <Permission flag='goalObjective:confirmTarget'>
              {Number(record.exStatus) === 0 && (
                <DataPermission editPermission={record.editPermission}>
                  <Button
                    type='link'
                    onClick={() => {
                      comfireFn?.(record);
                    }}
                    style={{ paddingLeft: '0' }}
                  >
                    {I18N.carbonFootprint.confirm}</Button>
                </DataPermission>
              )}
            </Permission>
            {Number(record.exStatus) === 0 && (
              <Dropdown overlay={menu}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  className='ant-dropdown-link'
                  onClick={e => e.preventDefault()}
                >
                  {I18N.Certification.more}<CaretDownOutlined />
                </a>
              </Dropdown>
            )}
            {Number(record.exStatus) > 0 && (
              <Button
                type='link'
                onClick={() => {
                  // downLoadINterger(record);
                  history.push(
                    // @ts-ignore
                    `/carbonDataManagemen/goalObjective/show?targetId=${record.targetId}`,
                  );
                }}
              >
                {I18N.carbonFootprint3.details}</Button>
            )}
          </Space>
        );
      },
    },
  ];
};
// 报送数据
const DataToSubmitList = ({
  TablePage,
  riskFn,
  dataToSubmitFn,
}): ColumnsType => {
  const history = useHistory();
  return [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => (
        <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
      ),
    },
    {
      title: I18N.carbonInternational.dataName,
      dataIndex: 'subName',
      width: 220,
    },
    {
      title: I18N.carbonFootprint3.reviewStatus,
      width: 180,
      dataIndex: 'subStatus',
      render: (text: string) =>
        Number(text) === 0 ? (
          <Tag
            className={`customTag customTag-${subStatusObjColor[text]}`}
            color={subStatusObjColor[text]}
          >
            {I18N.carbonFootprint3.pendingReview}</Tag>
        ) : (
          <Tag
            className={`customTag customTag-${subStatusObjColor[text]}`}
            color={subStatusObjColor[text]}
          >
            {subStatusObj[text] || '-'}
          </Tag>
        ),
    },
    {
      title: I18N.carbonNeutral.carbonEmissionsT,
      dataIndex: 'discharge',
      width: 180,
    },
    {
      title: I18N.DomesticVersion.dataSources,
      dataIndex: 'type',
      width: 180,
      render: (text: string) => TypeObj[text],
    },
    {
      title: I18N.carbonInternational.associatedTargets,
      dataIndex: 'targetName',
      width: 300,
      render: (text, record) =>
        // @ts-ignore
        record.targetId ? (
          <Permission flag='dataToSubmit:showAssociatedRa'>
            <a
              type='link'
              // eslint-disable-next-line
              // @ts-ignore
              href={`/carbonDataManagemen/dataToSubmit/datashow?targetId=${record.targetId}`}
            >
              {text || '-'}
            </a>
          </Permission>
        ) : (
          '-'
        ),
    },
    {
      title: I18N.carbonDataManagemen.submittedBy,
      dataIndex: 'userName',
      width: 180,
    },
    {
      title: I18N.carbonInternational.riskReminder,
      dataIndex: 'risk',
      width: 180,
      render: (text, record) =>
        Number(text) === 0 ? (
          <Badge
            status='success'
            text={
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a style={{ color: '#0CBF9F', padding: '0', border: 'none' }}>
                {I18N.carbonDataManagemen.noRisk}</a>
            }
          />
        ) : (
          <Badge
            status='error'
            text={
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                style={{ color: '#ED5555', padding: '0', border: 'none' }}
                onClick={() => {
                  riskFn?.(record);
                }}
              >
                {I18N.carbonDataManagemen.atRisk}</a>
            }
          />
        ),
    },

    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'accessTime',
      fixed: 'right',
      key: 'accessTime',
      width: 180,
      render: (text: string, record: any) => (
        <Space size={28}>
          <Permission flag='dataToSubmit:audit'>
            {Number(record.subStatus) === 0 && (
              <DataPermission editPermission={record.editPermission}>
                <Button
                  type='link'
                  style={{ paddingLeft: '0' }}
                  onClick={() => {
                    dataToSubmitFn?.(record);
                  }}
                >
                  {I18N.carbonFootprint3.auditing}</Button>
              </DataPermission>
            )}
          </Permission>
          <Permission flag='dataToSubmit:show'>
            <Button
              type='link'
              onClick={() => {
                history.push(
                  // @ts-ignore
                  `/carbonDataManagemen/dataToSubmit/show?submissionId=${record.submissionId}`,
                );
              }}
            >
              {I18N.carbonFootprint3.details}</Button>
          </Permission>
        </Space>
      ),
    },
  ];
};
const PerformanceManagementList = ({ scoreFn, TablePage }): ColumnsType => {
  const history = useHistory();
  return [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => (
        <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
      ),
    },
    {
      title: I18N.carbonDataManagemen.targetName,
      dataIndex: 'targetName',
      render: (text: string, record) => (
        <Permission flag='performanceManagement:showTarget'>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            type='link'
            onClick={() => {
              history.push(
                // @ts-ignore
                `/carbonDataManagemen/performanceManagement/show?targetId=${record.targetId}`,
              );
            }}
            // @ts-ignore
            // href={}
          >
            {text}
          </a>
        </Permission>
      ),
    },
    {
      title: I18N.carbonDataManagemen.responsiblePerson,
      dataIndex: 'userName',
    },
    {
      title: I18N.carbonDataManagemen.whetherToRate,
      dataIndex: 'isScored',
      render: (text: string) => (Number(text) ? I18N.carbonNeutral.yes : I18N.carbonNeutral.no),
    },
    {
      title: I18N.carbonDataManagemen.actualEmissions,
      width: 180,
      dataIndex: 'achieveDischarge',
      render: (text: string, record) =>
        // @ts-ignore
        `${text || 0}/${record.allotDischarge}`,
    },
    {
      title: I18N.carbonDataManagemen.fullScore,
      dataIndex: 'score',
      render: (text: string | null) => (text === null ? '-' : text),
    },
    {
      title: I18N.carbonDataManagemen.evaluationDescription,
      dataIndex: 'evaluate',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'accessTime',
      fixed: 'right',
      key: 'accessTime',
      width: 180,
      render: (text: string, record: any) => (
        <Space size={28}>
          {!record.isScored ? (
            <Permission flag='performanceManagement:scoreTarget'>
              <DataPermission editPermission={record.editPermission}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  onClick={() => {
                    scoreFn?.(record);
                  }}
                  // style={{ paddingLeft: '0', padding: '0' }}
                >
                  {I18N.carbonDataManagemen.evaluate}</a>
              </DataPermission>
            </Permission>
          ) : (
            '-'
          )}
        </Space>
      ),
    },
  ];
};
const DownLoadManagementList = ({ ShowInterger, TablePage }): ColumnsType => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    render: (text, record, index: number) => (
      <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
    ),
  },
  {
    title: I18N.carbonFootprint.fileName,
    dataIndex: 'goodsName',
  },
  {
    title: I18N.carbonFootprint3.dataType,
    dataIndex: 'buyAmount',
  },
  {
    title: I18N.carbonFootprint.fileStatus,
    dataIndex: 'payMoney',
  },
  {
    title: I18N.carbonFootprint.operator2,
    dataIndex: 'payMoney',
  },
  {
    title: I18N.carbonFootprint.creationTime,
    dataIndex: 'payMoney',
  },
  {
    title: I18N.carbonDataManagemen.numberOfDownloads,
    dataIndex: 'payMoney',
  },
  {
    title: I18N.carbonFootprint.operation,
    dataIndex: 'accessTime',
    fixed: 'right',
    key: 'accessTime',
    width: 180,
    render: (text: string, record: any) => (
      <Space size={28}>
        <Button
          type='link'
          onClick={() => {
            ShowInterger(record);
          }}
          style={{ paddingLeft: '0' }}
        >
          {I18N.carbonDataManagemen.downloadReport}</Button>
        <Button
          type='link'
          onClick={() => {
            ShowInterger(record);
          }}
          style={{ paddingLeft: '0' }}
        >
          {I18N.Certification.downloadReport}</Button>
      </Space>
    ),
  },
];
const BaseYearSet = (): ColumnsType => {
  const history = useHistory();

  return [
    {
      title: I18N.enterpriseCarbonAccount2.baseYear,
      dataIndex: 'fixedYear',
      render: (text, record) => (
        <span>
          {
            // @ts-ignore
            Number(record.yearType) === 0
              ? text || '-'
              : // @ts-ignore
              record.beginYear // @ts-ignore
              ? `${record.beginYear}-${record.endYear}`
              : '-'
          }
        </span>
      ),
    },
    {
      title: I18N.carbonDataManagemen.settingMethod,
      dataIndex: 'type',
      render: (text: string) => (Number(text) === 0 ? I18N.carbonDataManagemen.fixed : I18N.carbonDataManagemen.rolling),
    },
    {
      title: I18N.carbonDataManagemen.baseYearType,
      dataIndex: 'yearType',
      render: (text: string) =>
        Number(text) === 0 ? I18N.enterpriseCarbonAccount2.singleYear : Number(text) === 1 ? I18N.enterpriseCarbonAccount2.annualAverage : '-',
    },
    {
      title: I18N.enterpriseCarbonAccount2.emissionsTC2,
      dataIndex: 'discharge',
      render: (text: string) => text || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'standaId',
      fixed: 'right',
      key: 'standaId',
      width: 180,
      render: (text: string) => (
        <Space size={28}>
          <Permission flag='baseYearSet:edit'>
            <Button
              type='link'
              onClick={() => {
                // ShowInterger(record);
                history.push(
                  `/carbonDataManagemen/enterPriceBasicData/baseYearSet/edit?id=${text}`,
                );
              }}
              style={{ paddingLeft: '0' }}
            >
              {I18N.carbonFootprint.edit}</Button>
          </Permission>

          <Permission flag='baseYearSet:show'>
            <Button
              type='link'
              onClick={() => {
                // ShowInterger(record);
                history.push(
                  `/carbonDataManagemen/enterPriceBasicData/baseYearSet/show?id=${text}`,
                );
              }}
              style={{ paddingLeft: '0' }}
            >
              {I18N.carbonFootprint3.details}</Button>
          </Permission>
        </Space>
      ),
    },
  ];
};
const ProductionAndOperationIndexList = ({
  editOperationIndex,
  editOperationShow,
  disableOperationIndex,
  TablePage,
}): ColumnsType => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    render: (text, record, index: number) => (
      <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
    ),
  },
  {
    title: I18N.carbonDataManagemen.productionAndOperationRefersTo2,
    dataIndex: 'indicatorName',
  },
  {
    title: I18N.carbonFootprint.unit,
    dataIndex: 'unitValue',
  },
  {
    title: I18N.carbonDataManagemen.canItBeAccumulated,
    dataIndex: 'isAdd',
    render: text => (Number(text) === 0 ? I18N.carbonNeutral.yes : I18N.carbonNeutral.no),
  },
  {
    title: I18N.carbonFootprint3.sort,
    dataIndex: 'orderNum',
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'delFlag',
    render: (text: string) => (Number(text) === 0 ? I18N.carbonFootprint.enable : I18N.carbonFootprint.disabled),
  },
  {
    title: I18N.carbonFootprint.operation,
    dataIndex: 'accessTime',
    fixed: 'right',
    key: 'accessTime',
    width: 180,
    render: (text: string, record: any) => (
      <Space size={28}>
        <Permission flag='productionAndOperationIndex:edit'>
          {Number(record.preset) !== 0 && (
            <Button
              type='link'
              onClick={() => {
                editOperationIndex(record);
              }}
              style={{ paddingLeft: '0' }}
              disabled={Number(record.preset) === 0}
            >
              {I18N.carbonFootprint.edit}</Button>
          )}
        </Permission>
        <Permission flag='productionAndOperationIndex:disable'>
          {Number(record.preset) !== 0 && (
            <Button
              type='link'
              onClick={() => {
                disableOperationIndex(record);
              }}
              style={{ paddingLeft: '0' }}
              disabled={Number(record.preset) === 0}
            >
              {Number(record.delFlag) === 0 ? I18N.carbonFootprint.disabled : I18N.carbonFootprint.enable}
            </Button>
          )}
        </Permission>
        <Permission flag='productionAndOperationIndex:show'>
          <Button
            type='link'
            onClick={() => {
              editOperationShow(record, true);
            }}
            style={{ paddingLeft: '0' }}
          >
            {I18N.carbonFootprint3.details}</Button>
        </Permission>
      </Space>
    ),
  },
];
const ProductionOperationDataList = ({
  operateDel,
  TablePage,
}): ColumnsType => {
  const history = useHistory();

  return [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => (
        <span>{(TablePage.current - 1) * TablePage.pageSize + index + 1}</span>
      ),
    },
    {
      title: I18N.carbonFootprint.year,
      dataIndex: 'operationYear',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operateId',
      fixed: 'right',
      key: 'operateId',
      width: 180,
      render: (text: string, record: any) => (
        <Space size={28}>
          <Permission flag='productionOperationData:edit'>
            <Button
              type='link'
              onClick={() => {
                history.push(
                  `/carbonDataManagemen/enterPriceBasicData/productionOperationData/edit?id=${text}`,
                );
              }}
              style={{ paddingLeft: '0' }}
            >
              {I18N.carbonFootprint.edit}</Button>
          </Permission>

          <Permission flag='productionOperationData:del'>
            <Button
              type='link'
              onClick={() => {
                Modal.confirm({
                  title: '',
                  // icon: <ExclamationCircleOutlined />,
                  content: I18N.enterpriseCarbonAccount2.operationsDataDeletion,
                  wrapClassName: 'cumstomModal_confirm',
                  okText: I18N.carbonFootprint.confirm,
                  cancelText: I18N.carbonFootprint.cancel,
                  closable: true,
                  onOk: () => {
                    operateDel?.(record);
                  },
                });
              }}
              style={{ paddingLeft: '0' }}
            >
              {I18N.carbonFootprint.delete}</Button>
          </Permission>
          <Permission flag='productionOperationData:show'>
            <Button
              type='link'
              onClick={() => {
                history.push(
                  `/carbonDataManagemen/enterPriceBasicData/productionOperationData/show?id=${text}`,
                );
              }}
              style={{ paddingLeft: '0' }}
            >
              {I18N.carbonFootprint3.details}</Button>
          </Permission>
        </Space>
      ),
    },
  ];
};
export const creatColumns = (
  type: string,
  {
    editOperationIndex,
    disableOperationIndex,
    editOperationShow,
    ShowInterger,
    TablePage,
    TargetArchive,
    TargetDeleteFn,
    TargetAllowFn,
    comfireFn,
    rejectFn,
    scoreFn,
    riskFn,
    dataToSubmitFn,
    operateDel,
  },
) => {
  switch (type) {
    case I18N.carbonDataManagemen.goalSetting:
      return AccountingList({
        TablePage,
        TargetArchive,
        TargetDeleteFn,
        TargetAllowFn,
      });
    case I18N.carbonDataManagemen.targetExecution:
      return GoalObjectiveList({
        TablePage,
        TargetAllowFn,
        comfireFn,
        rejectFn,
      });
    case I18N.carbonDataManagemen.submitData:
      return DataToSubmitList({
        TablePage,
        riskFn,
        dataToSubmitFn,
      });
    case I18N.carbonDataManagemen.performanceManagement:
      return PerformanceManagementList({
        scoreFn,
        TablePage,
      });
    case I18N.carbonFootprint.downloadManagement:
      return DownLoadManagementList({
        ShowInterger,
        TablePage,
      });
    case I18N.carbonDataManagemen.benchmarkYearSetting:
      return BaseYearSet();
    case I18N.carbonDataManagemen.productionAndOperationReferTo:
      return ProductionAndOperationIndexList({
        editOperationIndex,
        disableOperationIndex,
        editOperationShow,
        TablePage,
      });
    case I18N.carbonDataManagemen.productionOperations:
      return ProductionOperationDataList({
        operateDel,
        TablePage,
      });
    default:
      return null;
  }
};
