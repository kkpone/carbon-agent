import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { BuildModelList } from '@src/components/CarbonFootprintAccount/BuildModelMainData/BuildModelList';
import I18N from '@src/lang/I18N';
import { CARBON_DATA_BORDER_TYPE } from '@src/views/supplyChain/constant';
import commonStyles from '@src/views/supplyChain/index.module.less';
import { getAccountInfoData } from '@src/views/supplyChain/service';
import { AccountInfo, CarbonData } from '@src/views/supplyChain/type';
import { Button, Input, Modal, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import styles from './index.module.less';
import { getAccountProductEmission, getAccountProductList } from './service';
import { AccountProduct } from './type';

type AccountProductModalProps = {
  visible: boolean;
  scope?: number;
  unitCode?: string;
  unitDesc: string;
  footBorderTypeDisabled?: boolean;
  onCancel: () => void;
  onConfirm: (
    data: {
      accountId: number;
      year: string;
      startTime: string;
      endTime: string;
      accountType: number;
      footBorderType: number;
    } & CarbonData['result'],
  ) => void | Promise<void>;
};

const AccountProductModal: FC<AccountProductModalProps> = ({
  visible,
  unitCode,
  unitDesc,
  scope,
  footBorderTypeDisabled = true,
  onCancel,
  onConfirm,
}) => {
  const [total, setTotal] = useState(0);

  const [list, setList] = useState<AccountProduct[]>([]);

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    productName?: string;
    productCode?: string;
    unitCode?: string;
    scope?: number;
  }>({
    pageNum: 1,
    pageSize: 10,
    unitCode,
    scope,
  });

  const [selectedAccount, setSelectedAccount] = useState<AccountProduct[]>([]);

  const [loading, setLoading] = useState(false);

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

  const openAccountInfo = async (id: number) => {
    const { data } = await getAccountInfoData({ id });
    setAccountInfo(data.data);
  };

  const closeAccountInfo = () => {
    setAccountInfo(null);
  };

  const columns: ColumnsType<AccountProduct> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 94,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) =>
        searchParams.pageSize * (searchParams.pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint3.functionalUnits,
      dataIndex: 'accountName',
      width: 192,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootprint.productName,
      dataIndex: 'productName',
      width: 160,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.accountingMethod,
      dataIndex: 'type',
      width: 182,
      ellipsis: true,
      render: (_, { type }) =>
        type === 0
          ? I18N.carbonFootprint3.quickAccounting
          : I18N.carbonFootprint3.processAccounting,
    },
    {
      title: I18N.carbonFootprint.accountingQuantity,
      dataIndex: 'amount',
      width: 182,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.totalEmissionsK,
      dataIndex: 'emissionTotal',
      width: 206,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.unitProductScheduling,
      dataIndex: 'factor',
      width: 206,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.accountingCycle,
      dataIndex: 'time',
      width: 256,
      ellipsis: true,
      render: (_, { startTime, endTime }) =>
        I18N.template(I18N.supplyChain.start, {
          val1: startTime,
          val2: endTime,
        }),
    },
    {
      title: I18N.carbonFootprint.productCode,
      dataIndex: 'productCode',
      width: 146,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 206,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 110,
      fixed: 'right',
      render: (_, { id }) => (
        <Button
          className={commonStyles.operateBtn}
          type='link'
          onClick={() => openAccountInfo(id)}
        >
          {I18N.carbonFootprint.check}
        </Button>
      ),
    },
  ];

  const onOk = async ({
    accountId,
    accountType,
    startTime,
    endTime,
    footBorderType,
  }: {
    accountId: number;
    accountType: number;
    startTime: string;
    endTime: string;
    footBorderType: number;
  }) => {
    try {
      setLoading(true);
      const resp = await getAccountProductEmission({ accountId });
      await onConfirm({
        ...resp.data.data,
        startTime,
        endTime,
        accountId,
        accountType,
        footBorderType,
      });
    } finally {
      setLoading(false);
    }
  };

  const getList = params => {
    getAccountProductList(params).then(({ data }) => {
      setList(data.data.rows);
      setTotal(data.data.total);
    });
  };

  useEffect(() => {
    if (!visible) {
      setSearchParams({ pageNum: 1, pageSize: 10, unitCode, scope });
      setSelectedAccount([]);
      setAccountInfo(null);
      setList([]);
      setTotal(0);
    }
  }, [visible, unitCode, scope]);

  useEffect(() => {
    setSelectedAccount([]);

    if (visible) {
      getList(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      className={classNames(styles.accountProductListModal, {
        [styles.emptyModal]: total === 0,
      })}
      title={I18N.router.selectAccountingAssets}
      open={visible}
      width={1100}
      destroyOnClose
      okText={I18N.carbonFootprint3.confirmSelection}
      cancelText={I18N.carbonFootprint.return}
      footer={
        accountInfo ? undefined : (
          <>
            <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
            <Button
              className={styles.confirmButton}
              loading={loading}
              type='primary'
              disabled={selectedAccount.length === 0}
              onClick={() =>
                onOk({
                  accountId: selectedAccount[0].id,
                  accountType: selectedAccount[0].type,
                  startTime: selectedAccount[0].startTime,
                  endTime: selectedAccount[0].endTime,
                  footBorderType: selectedAccount[0].scope,
                })
              }
            >
              {I18N.carbonFootprint3.confirmSelection}
            </Button>
          </>
        )
      }
      okButtonProps={{ className: styles.confirmButton, loading }}
      cancelButtonProps={{ onClick: closeAccountInfo }}
      onCancel={onCancel}
      onOk={() =>
        onOk({
          accountId: accountInfo!.id,
          accountType: accountInfo!.type,
          startTime: accountInfo!.startTime,
          endTime: accountInfo!.endTime,
          footBorderType: accountInfo!.scope,
        })
      }
    >
      {accountInfo ? (
        <div className={styles.accountInfo}>
          <div className={styles.accountInfoHeader}>
            <div className={styles.headerInfoItem}>
              <span className={styles.caption}>
                {I18N.carbonFootprint3.functionalUnits2}
              </span>
              <span>{accountInfo.accountName}</span>
            </div>
            <div className={styles.headerInfoItem}>
              <span className={styles.caption}>
                {I18N.carbonFootprint.accountingCycle2}
              </span>
              <span>{`${accountInfo.startTime}-${accountInfo.endTime}`}</span>
            </div>
            <div className={styles.headerInfoItem}>
              <span className={styles.caption}>
                {I18N.supplyChain.totalEmissions}
              </span>
              <span>{accountInfo.emissionTotal}</span>
            </div>
          </div>
          <div className={styles.accountInfoContent}>
            <BuildModelList
              isDetail
              isInSupplyChain
              onlyCreateFactor
              accountInfo={accountInfo}
              apiExtraParams={{}}
              updateAccountInfo={() => {}}
            />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.searchContent}>
            <div className={styles.searchContentItem}>
              <Input
                style={{ width: 180 }}
                placeholder={I18N.carbonFootprint.productName}
                value={searchParams.productName}
                onChange={e =>
                  setSearchParams({
                    ...searchParams,
                    productName: e.target.value,
                  })
                }
              />
              <Input
                style={{ width: 180 }}
                placeholder={I18N.carbonFootprint.productCode}
                value={searchParams.productCode}
                onChange={e =>
                  setSearchParams({
                    ...searchParams,
                    productCode: e.target.value,
                  })
                }
              />
              <Input
                style={{ width: 180 }}
                placeholder={I18N.carbonFootprint.unit}
                value={unitDesc}
                disabled
              />
              <Select
                style={{ width: 180 }}
                placeholder={I18N.carbonFootprint3.lifeCycle}
                value={searchParams.scope}
                disabled={footBorderTypeDisabled}
                options={[
                  {
                    value: CARBON_DATA_BORDER_TYPE.FULL,
                    label: I18N.carbonFootprint3.fullLifecycle,
                  },
                  {
                    value: CARBON_DATA_BORDER_TYPE.HALF,
                    label: I18N.carbonFootprint3.halfLifeCycle,
                  },
                ]}
                onChange={val =>
                  setSearchParams({
                    ...searchParams,
                    scope: val,
                  })
                }
              />
            </div>
            <div className={styles.searchContentItem}>
              <Button
                type='primary'
                icon={<SearchOutlined />}
                onClick={() => {
                  const newSearchParams = {
                    ...searchParams,
                    pageNum: 1,
                  };
                  setSearchParams(newSearchParams);
                  getList(searchParams);
                }}
              >
                {I18N.carbonNeutral.query}
              </Button>
              <Button
                icon={<RedoOutlined />}
                onClick={() => {
                  const newSearchParams = {
                    pageNum: 1,
                    pageSize: 10,
                    unitCode,
                    scope,
                  };
                  setSearchParams(newSearchParams);
                  getList(newSearchParams);
                }}
              >
                {I18N.carbonFootprint3.reset}
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            rowKey='id'
            dataSource={list}
            scroll={{ x: 800, y: 380 }}
            pagination={{
              current: searchParams.pageNum,
              pageSize: searchParams.pageSize,
              position: ['bottomLeft'],
              total,
            }}
            rowSelection={{
              type: 'radio',
              fixed: true,
              columnWidth: 50,
              selectedRowKeys: selectedAccount.map(({ id }) => id),
              onChange: (_, selectedRows) => {
                setSelectedAccount(selectedRows);
              },
            }}
            onChange={({ pageSize, current }) => {
              const newSearchParams = {
                ...searchParams,
                pageNum: current ?? 1,
                pageSize: pageSize ?? 10,
              };
              setSearchParams(newSearchParams);
              getList(newSearchParams);
            }}
          />
        </>
      )}
    </Modal>
  );
};

export default AccountProductModal;
