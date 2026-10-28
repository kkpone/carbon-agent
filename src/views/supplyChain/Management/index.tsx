import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { checkPermissions } from '@src/components/Permission/utils';
import { IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import {
  INVITE_STATUS,
  INVITE_STATUS_LABEL,
  SUPPLIER_STATUS,
  SUPPLIER_STATUS_LABEL,
} from '@src/views/supplyChain/constant';
import {
  Popover,
  Button,
  Segmented,
  Select,
  Input,
  Table,
  TableColumnsType,
  Switch,
  Modal,
} from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from '@/utils';

import styles from './index.module.less';
import {
  editSupplierStatus,
  getOverviewInfo,
  getSupplierList,
  inviteSupplier,
} from './service';
import type { OverviewInfo } from './type';
import { Supplier } from '../type';

const OVERVIEW_CATEGORY = {
  notJoin: {
    label: I18N.supplyChain.notJoined,
    color: '#E2D1F9',
  },
  sentInvitation: {
    label: I18N.supplyChain.sendInvitation,
    color: '#8AAAE5',
  },
  createAccount: {
    label: I18N.supplyChain.createAnAccount,
    color: '#F2BB69',
  },
  joinFill: {
    label: I18N.supplyChain.participateInFillingOut,
    color: '#0CBF9F',
  },
  completeFill: {
    label: I18N.supplyChain.completeTheFillingProcess,
    color: '#048677',
  },
};
const SupplyChainManagement: FC = () => {
  const history = useHistory();

  const [currSupplier, setCurrSupplier] = useState<Supplier | null>(null);

  const [inviteLoading, setInviteLoading] = useState(false);

  const [overViewInfo, setOverviewInfo] = useState<OverviewInfo>({});

  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    companyName?: string;
    inviteStatus?: number | string;
    status?: number;
  }>({
    pageNum: 1,
    pageSize: 10,
  });

  const columns: TableColumnsType<Supplier> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__no__',
      fixed: 'left',
      width: 68,
      render: (_, record, index) =>
        (searchParams.pageNum - 1) * searchParams.pageSize + 1 + index,
    },
    {
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'companyName',
      fixed: 'left',
      width: 180,
    },
    {
      title: I18N.supplyChain2.supplierCode,
      dataIndex: 'companyNumber',
      width: 110,
    },
    {
      title: I18N.supplyChain.area,
      dataIndex: 'areaDesc',
      width: 96,
    },
    {
      title: I18N.carbonFootprint.contacts,
      dataIndex: 'contacts',
      width: 146,
    },
    {
      title: I18N.supplyChain.invitationStatus,
      dataIndex: 'inviteStatus',
      width: 140,
      render: (_, { inviteStatus }) => (
        <div
          className={classNames(styles.inviteStatus, {
            [styles.notInviteStatus]: inviteStatus === INVITE_STATUS.NOT_INVITE,
            [styles.invitingStatus]: inviteStatus === INVITE_STATUS.INVITING,
            [styles.rejectInviteStatus]: inviteStatus === INVITE_STATUS.REJECT,
            [styles.completeInviteStatus]:
              inviteStatus === INVITE_STATUS.COMPLETE,
          })}
        >
          {INVITE_STATUS_LABEL[inviteStatus]}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.updatedBy,
      dataIndex: 'updateBy',
      width: 106,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 160,
    },
    {
      title: I18N.supplyChain.isItEnabled,
      dataIndex: 'status',
      width: 96,
      render: (_, record) => {
        const { status, inviteStatus, supplierId, statusLoading } = record;
        const editStatusPermission = !!checkPermissions(
          true,
          'supplier:status',
        );
        return (
          <Switch
            value={!!status}
            disabled={
              inviteStatus !== INVITE_STATUS.COMPLETE || !editStatusPermission
            }
            loading={statusLoading}
            onChange={async val => {
              Object.assign(record, { statusLoading: true });
              setSupplierList([...supplierList]);
              await editSupplierStatus({ supplierId, status: Number(val) });
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              setSearchParams({ ...searchParams });
            }}
          />
        );
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 124,
      fixed: 'right',
      render: (_, record) => {
        const { inviteStatus } = record;
        return (
          <div className={styles.operateColumn}>
            {checkPermissions(
              <Button
                type='link'
                onClick={() => {
                  history.push({
                    pathname:
                      RouteMapsSupplyChain2.supplyChainSupplierDetails.replace(
                        ':id',
                        `${record.supplierId}`,
                      ),
                  });
                }}
              >
                {I18N.carbonFootprint.check}
              </Button>,
              'supplier:info',
            )}
            {[INVITE_STATUS.NOT_INVITE, INVITE_STATUS.REJECT].includes(
              inviteStatus,
            ) && (
              <Button type='link' onClick={() => setCurrSupplier(record)}>
                {I18N.supplyChain.invite}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const onSearchNameInput = useMemo(
    () =>
      debounce((companyName: string) => {
        setSearchParams({
          ...searchParams,
          pageNum: 1,
          companyName,
        });
      }, 300),
    [searchParams],
  );

  useEffect(() => {
    getOverviewInfo().then(({ data }) => {
      setOverviewInfo(data.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getSupplierList({
      ...searchParams,
      inviteStatus:
        searchParams.inviteStatus === 'all'
          ? undefined
          : searchParams.inviteStatus,
    })
      .then(({ data }) => {
        setSupplierList(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className={styles.supplyChainManage}>
      <Modal
        title={I18N.router.invitingSuppliers}
        open={!!currSupplier}
        width={460}
        okButtonProps={{ loading: inviteLoading }}
        onOk={async () => {
          if (currSupplier) {
            try {
              setInviteLoading(true);
              await inviteSupplier({ supplierId: currSupplier.supplierId });
              Toast('success', I18N.supplyChain.invitationSuccessful);
              setSearchParams({ ...searchParams });
              getOverviewInfo().then(({ data }) => {
                setOverviewInfo(data.data);
              });
              setCurrSupplier(null);
            } finally {
              setInviteLoading(false);
            }
          }
        }}
        onCancel={() => setCurrSupplier(null)}
      >
        <>
          <span>{I18N.supplyChain.confirmInvitation}</span>
          <span className={styles.supplierName}>
            {currSupplier?.companyName}
          </span>
          <span>？</span>
        </>
      </Modal>
      <div className={styles.header}>
        <div className={styles.title}>
          {I18N.supplyChain2.supplierManagement}
        </div>
      </div>
      <div className={styles.content}>
        {overViewInfo.all > 0 && (
          <div className={styles.overview}>
            <div className={styles.overviewTitle}>
              {I18N.supplyChain.supplierInvolvement}
            </div>
            <div className={styles.overviewBar}>
              {Object.entries(OVERVIEW_CATEGORY).map(([key, value]) => (
                <Popover
                  content={
                    <>
                      <div>
                        <span className={styles.overviewLabel}>
                          {value.label}
                          {I18N.supplyChain.supplier}
                        </span>
                        <span className={styles.overviewValue}>
                          {overViewInfo[key]}
                        </span>
                      </div>
                      <div>
                        <span className={styles.overviewLabel}>
                          {I18N.supplyChain.totalNumberOfSuppliers}
                        </span>
                        <span className={styles.overviewValue}>
                          {overViewInfo.all}
                        </span>
                      </div>
                    </>
                  }
                  key={key}
                  placement='bottom'
                  arrow={false}
                >
                  <div
                    className={classNames(
                      styles.overviewBarItem,
                      styles[`${key}BarItem`],
                    )}
                    style={{
                      width: `${(overViewInfo[key] / overViewInfo.all) * 100}%`,
                    }}
                  />
                </Popover>
              ))}
            </div>
            <div className={styles.overviewLegend}>
              {Object.entries(OVERVIEW_CATEGORY).map(([key, value]) => (
                <div key={key} className={styles.overviewLegendItem}>
                  <div
                    className={styles.overviewLegendItemIcon}
                    style={{ background: value.color }}
                  />
                  <div>{value.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={styles.contentHeader}>
          <Segmented
            value={searchParams.inviteStatus}
            options={[
              { value: 'all', label: I18N.carbonFootprint3.whole },
              ...Object.values(INVITE_STATUS).map(status => ({
                value: `${status}`,
                label: INVITE_STATUS_LABEL[status],
              })),
            ]}
            onChange={val =>
              setSearchParams({
                ...searchParams,
                pageNum: 1,
                inviteStatus: val,
              })
            }
          />
          <div className={styles.contentHeaderActions}>
            <Select
              style={{ width: 152 }}
              value={searchParams.status}
              placeholder={I18N.supplyChain.enableStatus}
              allowClear
              options={Object.values(SUPPLIER_STATUS).map(status => ({
                value: status,
                label: SUPPLIER_STATUS_LABEL[status],
              }))}
              onChange={val =>
                setSearchParams({ ...searchParams, pageNum: 1, status: val })
              }
            />
            <Input
              style={{ width: 200 }}
              placeholder={I18N.carbonFootprint3.supplierName}
              suffix={<SearchOutlined style={{ color: '#999EA4' }} />}
              onChange={e => onSearchNameInput(e.target.value)}
            />
            {checkPermissions(
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() =>
                  history.push(
                    RouteMapsSupplyChain2.supplyChainSupplierAddition,
                  )
                }
              >
                {I18N.carbonFootprint.newAddition}
              </Button>,
              'supplier:add',
            )}
            {checkPermissions(
              <Button
                onClick={() =>
                  history.push(RouteMapsSupplyChain2.supplyChainSupplierImport)
                }
                icon={<IconAlibabaNew type='icon-icon-daoru' />}
              >
                {I18N.carbonFootprint.batchImport}
              </Button>,
              'supplier:import',
            )}
          </div>
        </div>
        <Table
          columns={columns}
          rowKey='supplierId'
          loading={loading}
          pagination={{
            total,
            pageSize: searchParams.pageSize,
            current: searchParams.pageNum,
            showSizeChanger: true,
            showTotal: count =>
              I18N.template(I18N.supplyChain.coCoun3, { val1: count }),
          }}
          scroll={{ x: 1200 }}
          dataSource={supplierList}
          onChange={pager => {
            setSearchParams({
              ...searchParams,
              pageNum: pager.current || 1,
              pageSize: pager.pageSize || 1,
            });
          }}
        />
      </div>
    </div>
  );
};

export default SupplyChainManagement;
