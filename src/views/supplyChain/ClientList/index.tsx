import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Modal, Segmented, Table, TableColumnsType } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import { checkPermissions } from '@/components/Permission/utils';
import { Toast } from '@/utils';

import styles from './index.module.less';
import { getClientList, replayInvite } from './service';
import { CLIENT_STATUS } from '../constant';

const ClientList: FC = () => {
  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    result?: string;
    applyCompanyName?: string;
  }>({ pageNum: 1, pageSize: 10 });

  const [clientList, setClientList] = useState<Record<string, any>[]>([]);

  const [currClient, setCurrClient] = useState<Record<string, any> | null>(
    null,
  );

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [replayLoading, setReplayLoading] = useState(false);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const { pageNum, pageSize } = searchParams;

  const onSearchNameInput = useMemo(
    () =>
      debounce((applyCompanyName: string) => {
        setSearchParams({
          ...searchParams,
          pageNum: 1,
          applyCompanyName,
        });
      }, 300),
    [searchParams],
  );

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__no__',
      fixed: 'left',
      width: 68,
      render: (_, record, index) => (pageNum - 1) * pageSize + 1 + index,
    },
    {
      title: I18N.becomeSupplierOrPurchasing.customerName,
      dataIndex: 'applyCompanyName',
      fixed: 'left',
      width: 124,
    },
    {
      title: I18N.supplyChain.fillInTheNumberOfTasks,
      dataIndex: 'count',
      width: 110,
      render: (_, { finishCount, total: totalCount }) => (
        <>
          {finishCount}/{totalCount}
        </>
      ),
    },
    {
      title: I18N.supplyChain.invitationStatus,
      dataIndex: 'resultDesc',
      width: 98,
      render: (text, { result }) => (
        <div
          className={classNames(styles.status, {
            [styles.pendingStatus]: result === CLIENT_STATUS.PENDING,
            [styles.rejectedStatus]: result === CLIENT_STATUS.REJECTED,
            [styles.resolvedStatus]: result === CLIENT_STATUS.RESOLVED,
          })}
        >
          {text}
        </div>
      ),
    },
    {
      title: I18N.supplyChain.inviter,
      dataIndex: 'contacts',
      width: 82,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint3.contactInformation,
      dataIndex: 'phone',
      width: 144,
      render: text => text || '-',
    },
    {
      title: I18N.ccdb.contactEmail,
      dataIndex: 'email',
      width: 188,
      render: text => text || '-',
    },
    {
      title: I18N.supplyChain.invitationTime,
      dataIndex: 'createTime',
      width: 160,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 166,
      fixed: 'right',
      render: (_, record) =>
        record.result === CLIENT_STATUS.PENDING
          ? checkPermissions(
              <div className={styles.operateColumn}>
                <Button
                  type='link'
                  onClick={() => {
                    setCurrClient(record);
                    setAcceptModalOpen(true);
                  }}
                >
                  {I18N.supplyChain.agreeToInvitation}
                </Button>
                <Button
                  type='link'
                  onClick={() => {
                    setCurrClient(record);
                    setRejectModalOpen(true);
                  }}
                >
                  {I18N.supplyChain.refuseInvitation}
                </Button>
              </div>,
              'audit:reply',
            )
          : '-',
    },
  ];

  useEffect(() => {
    setLoading(true);
    getClientList({
      ...searchParams,
      result: searchParams.result === 'all' ? undefined : searchParams.result,
    })
      .then(({ data }) => {
        setTotal(data.total);
        setClientList(data.rows);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className={styles.clientList}>
      <Modal
        width={460}
        title={I18N.supplyChain.dataAuthorizationIsAccurate}
        open={acceptModalOpen}
        okButtonProps={{ loading: replayLoading }}
        onOk={async () => {
          if (currClient) {
            try {
              setReplayLoading(true);
              await replayInvite({
                id: currClient.id,
                inviteStatus: CLIENT_STATUS.RESOLVED,
              });
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              setSearchParams({ ...searchParams });
              setCurrClient(null);
              setAcceptModalOpen(false);
            } finally {
              setReplayLoading(false);
            }
          }
        }}
        onCancel={() => {
          setCurrClient(null);
          setAcceptModalOpen(false);
        }}
      >
        <div>
          <span>{I18N.supplyChain.authorizeThisRequest}</span>
          <span>{currClient?.applyCompanyName}</span>
          <span>{I18N.supplyChain.willBeAbleToViewAnd}</span>
        </div>
      </Modal>
      <Modal
        width={460}
        title={I18N.supplyChain.dataAuthorizationIsAccurate}
        open={rejectModalOpen}
        okButtonProps={{ loading: replayLoading }}
        onOk={async () => {
          if (currClient) {
            try {
              setReplayLoading(true);
              await replayInvite({
                id: currClient.id,
                inviteStatus: CLIENT_STATUS.REJECTED,
              });
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              setSearchParams({ ...searchParams });
              setCurrClient(null);
              setRejectModalOpen(false);
            } finally {
              setReplayLoading(false);
            }
          }
        }}
        onCancel={() => {
          setCurrClient(null);
          setRejectModalOpen(false);
        }}
      >
        <div>{I18N.supplyChain.confirmRejection}</div>
      </Modal>
      <div className={styles.header}>
        <div className={styles.title}>{I18N.router.customerManagement}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <Segmented
            value={searchParams.result}
            options={[
              { value: 'all', label: I18N.carbonFootprint3.whole },
              {
                value: `${CLIENT_STATUS.RESOLVED}`,
                label: I18N.carbonproduct.associated,
              },
              {
                value: `${CLIENT_STATUS.PENDING}`,
                label: I18N.supplyChain.pendingProcessing,
              },
              {
                value: `${CLIENT_STATUS.REJECTED}`,
                label: I18N.carbonDataManagemen.rejected,
              },
            ]}
            onChange={val =>
              setSearchParams({
                ...searchParams,
                pageNum: 1,
                result: val,
              })
            }
          />
          <Input
            style={{ width: 200 }}
            placeholder={I18N.becomeSupplierOrPurchasing.customerName}
            suffix={<SearchOutlined style={{ color: '#999EA4' }} />}
            onChange={e => onSearchNameInput(e.target.value)}
          />
        </div>
        <Table
          rowKey='id'
          columns={columns}
          loading={loading}
          pagination={{
            total,
            pageSize,
            current: pageNum,
            showSizeChanger: true,
            showTotal: count =>
              I18N.template(I18N.supplyChain.coCoun, { val1: count }),
          }}
          scroll={{ x: 1200 }}
          dataSource={clientList}
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

export default ClientList;
