import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Segmented, Table, TableColumnsType } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { RouteMapsSupplyChain2 } from '@/router/route-paths/supplyChain2';

import styles from './index.module.less';
import { getOverviewInfo, getTaskList } from './service';
import { CARBON_DATA_STATUS } from '../constant';

const TaskList: FC = () => {
  const [overviewInfo, setOverviewInfo] = useState<Record<string, number>>({});

  const history = useHistory();

  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    pageNum: 1,
    pageSize: 10,
  });
  const { pageNum, pageSize } = searchParams;

  const [taskList, setTaskList] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const onSearchNameInput = useMemo(
    () =>
      debounce((search: string) => {
        setSearchParams({
          ...searchParams,
          pageNum: 1,
          search,
        });
      }, 300),
    [searchParams],
  );

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__no__',
      width: 68,
      fixed: 'left',
      render: (_, record, index) => (pageNum - 1) * pageSize + 1 + index,
    },
    {
      title: I18N.supplyChain.fillInTheName,
      dataIndex: 'name',
      width: 196,
      fixed: 'left',
      render: text => text || '-',
    },
    {
      title: I18N.supplyChain.typeOfFilling,
      dataIndex: 'reqTypeDesc',
      width: 120,
      render: text => text || '-',
    },
    {
      title: I18N.becomeSupplierOrPurchasing.customerName,
      dataIndex: 'companyName',
      width: 164,
      render: text => text || '-',
    },
    {
      title: I18N.supplyChainCarbonManagement.fillingRequirements,
      dataIndex: 'demand',
      width: 164,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'statusDesc',
      width: 140,
      render: (text, { status }) => (
        <div
          className={classNames(styles.status, {
            [styles.notFillStatus]: status === CARBON_DATA_STATUS.NOT_FILL,
            [styles.fillingStatus]: status === CARBON_DATA_STATUS.FILLING,
            [styles.submittedStatus]: status === CARBON_DATA_STATUS.PENDING,
            [styles.rejectStatus]: status === CARBON_DATA_STATUS.DISAPPROVED,
            [styles.approveStatus]: status === CARBON_DATA_STATUS.APPROVED,
          })}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: I18N.supplyChain.fillingDeadline,
      dataIndex: 'expireTime',
      width: 124,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.contacts,
      dataIndex: 'createBy',
      width: 144,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint3.contactInformation,
      dataIndex: 'phone',
      width: 144,
      render: text => text || '-',
    },
    {
      title: I18N.supplyChainCarbonManagement.applicationTime,
      dataIndex: 'createTime',
      width: 196,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 96,
      fixed: 'right',
      render: (_, { id, status }) => {
        const hasFillPermission = !!checkPermissions(
          true,
          'supplier:data:submit',
        );
        const notSubmit =
          status === CARBON_DATA_STATUS.FILLING ||
          status === CARBON_DATA_STATUS.NOT_FILL ||
          status === CARBON_DATA_STATUS.DISAPPROVED;

        return (
          <div className={styles.operateColumn}>
            <Button
              type='link'
              onClick={() => {
                history.push(
                  RouteMapsSupplyChain2.supplyChainCarbonDataTaskInfo.replace(
                    ':id',
                    id,
                  ),
                );
              }}
            >
              {hasFillPermission && notSubmit
                ? I18N.supplyChain.goFillInTheForm
                : I18N.carbonFootprint.check}
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getOverviewInfo().then(({ data }) => {
      setOverviewInfo(data.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getTaskList({
      ...searchParams,
      status: searchParams.status === 'all' ? undefined : searchParams.status,
    })
      .then(({ data }) => {
        setTaskList(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className={styles.taskList}>
      <div className={styles.header}>
        <div className={styles.title}>{I18N.supplyChain.fillInTheTask}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.overview}>
          <div
            className={styles.overviewItem}
            style={{ background: '#E5E5FB' }}
          >
            <div>{I18N.supplyChain.totalNumberOfTasks}</div>
            <div className={styles.overviewValue}>{overviewInfo.all}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#F5F5F5' }}
          >
            <div>{I18N.supplyChain.toBeFilledOut}</div>
            <div className={styles.overviewValue}>{overviewInfo.unFill}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#E8F6FF' }}
          >
            <div>{I18N.carbonFootprint3.fillingIn}</div>
            <div className={styles.overviewValue}>{overviewInfo.filling}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#DDF4F2' }}
          >
            <div>{I18N.supplyChain.submitted}</div>
            <div className={styles.overviewValue}>{overviewInfo.submit}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#FFF5E6' }}
          >
            <div>{I18N.supplyChain.toBeModified}</div>
            <div className={styles.overviewValue}>{overviewInfo.needEdit}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#E8F4E5' }}
          >
            <div>{I18N.supplyChain.approved}</div>
            <div className={styles.overviewValue}>{overviewInfo.passed}</div>
          </div>
        </div>
        <div className={styles.operate}>
          <Segmented
            value={searchParams.status}
            options={[
              { value: 'all', label: I18N.carbonFootprint3.whole },
              {
                value: CARBON_DATA_STATUS.NOT_FILL,
                label: I18N.supplyChain.toBeFilledOut,
              },
              {
                value: CARBON_DATA_STATUS.FILLING,
                label: I18N.carbonFootprint3.fillingIn,
              },
              {
                value: CARBON_DATA_STATUS.PENDING,
                label: I18N.supplyChain.submitted,
              },
              {
                value: CARBON_DATA_STATUS.DISAPPROVED,
                label: I18N.supplyChain.toBeModified,
              },
              {
                value: CARBON_DATA_STATUS.APPROVED,
                label: I18N.supplyChain.approved,
              },
            ]}
            onChange={val =>
              setSearchParams({
                ...searchParams,
                pageNum: 1,
                status: val,
              })
            }
          />
          <div className={styles.operateRight}>
            <Input
              style={{ width: 240 }}
              placeholder={
                I18N.supplyChain.fillInTheRegistrationAndCallForCustomers
              }
              suffix={<SearchOutlined style={{ color: '#999EA4' }} />}
              onChange={e => onSearchNameInput(e.target.value)}
            />
          </div>
        </div>
        <Table
          dataSource={taskList}
          rowKey='id'
          loading={loading}
          scroll={{ x: 1200 }}
          columns={columns}
          pagination={{
            total,
            pageSize,
            current: pageNum,
            showSizeChanger: true,
            showTotal: count =>
              I18N.template(I18N.supplyChain.coCoun5, { val1: count }),
          }}
          onChange={pager => {
            setSearchParams({
              ...searchParams,
              pageNum: pager.current || 1,
              pageSize: pager.pageSize,
            });
          }}
        />
      </div>
    </div>
  );
};

export default TaskList;
