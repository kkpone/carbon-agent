/* eslint-disable no-nested-ternary */
import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  Input,
  Segmented,
  Select,
  Table,
  TableColumnsType,
} from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMapsSupplyChain2 } from '@/router/route-paths/supplyChain2';
import { Toast } from '@/utils';

import InitiateFillModal from './InitiateFillModal';
import styles from './index.module.less';
import { getFillList, getOverviewInfo, initiateFill } from './service';
import {
  CARBON_DATA_REQ_TYPE,
  CARBON_DATA_REQ_TYPE_LABEL,
  CARBON_DATA_STATUS,
} from '../constant';

const FillList: FC = () => {
  const history = useHistory();

  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    pageNum: 1,
    pageSize: 10,
    status: 'all',
  });
  const [overviewInfo, setOverviewInfo] = useState<Record<string, number>>({});

  const [fillList, setFillList] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);

  const { pageNum, pageSize } = searchParams;

  const [loading, setLoading] = useState(false);

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
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'companyName',
      width: 124,
      render: text => text || '-',
    },
    {
      title: I18N.supplyChain.typeOfFilling,
      dataIndex: 'reqTypeDesc',
      width: 110,
      render: text => text || '-',
    },
    {
      title: I18N.supplyChain.initiateTheFillingProcess,
      dataIndex: 'reqDataTypeDesc',
      width: 124,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'statusDesc',
      width: 140,
      render: (text, { status }) => (
        <div
          className={classNames(styles.status, {
            [styles.waitFillStatus]:
              status === CARBON_DATA_STATUS.NOT_FILL ||
              status === CARBON_DATA_STATUS.FILLING,
            [styles.waitAuditStatus]: status === CARBON_DATA_STATUS.PENDING,
            [styles.rejectStatus]: status === CARBON_DATA_STATUS.DISAPPROVED,
            [styles.approvedStatus]: status === CARBON_DATA_STATUS.APPROVED,
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
      title: I18N.carbonFootprint.updatedBy,
      dataIndex: 'updateBy',
      width: 100,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 160,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.operateColumn}>
          {checkPermissions(
            <Button
              type='link'
              onClick={() => {
                history.push({
                  pathname:
                    RouteMapsSupplyChain2.supplyChainCarbonDataFillInfo.replace(
                      ':id',
                      `${record.id}`,
                    ),
                });
              }}
            >
              {record.status === CARBON_DATA_STATUS.PENDING &&
              !!checkPermissions(true, 'supplier:data:audit')
                ? I18N.carbonDataManagemen.goForReview
                : I18N.carbonFootprint.check}
            </Button>,
            'supplier:data:info:v1',
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    setLoading(true);
    getFillList({
      ...searchParams,
      status: searchParams.status === 'all' ? undefined : searchParams.status,
    })
      .then(({ data }) => {
        setTotal(data.total);
        setFillList(data.rows);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    getOverviewInfo().then(({ data }) => {
      setOverviewInfo(data.data);
    });
  }, []);

  return (
    <div className={styles.fillList}>
      <InitiateFillModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={async data => {
          await initiateFill(data);
          Toast('success', I18N.supplyChain.successfullyInitiated);
          setModalOpen(false);
          setSearchParams({ ...searchParams, pageNum: 1 });
          getOverviewInfo().then(resp => {
            setOverviewInfo(resp.data.data);
          });
        }}
      />
      <div className={styles.header}>
        <div className={styles.title}>
          {I18N.supplyChain.carbonDataCollection}
        </div>
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
            style={{ background: '#E8F6FF' }}
          >
            <div>{I18N.enterpriseCarbonAccount2.toBeFilledOutSec}</div>
            <div className={styles.overviewValue}>{overviewInfo.unFill}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#FFF5E6' }}
          >
            <div>{I18N.carbonFootprint3.pendingReview}</div>
            <div className={styles.overviewValue}>{overviewInfo.unAudit}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#FFF1EE' }}
          >
            <div>{I18N.components.rejected}</div>
            <div className={styles.overviewValue}>{overviewInfo.refuse}</div>
          </div>
          <div
            className={styles.overviewItem}
            style={{ background: '#DDF4F2' }}
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
                label: I18N.enterpriseCarbonAccount2.toBeFilledOutSec,
              },
              {
                value: CARBON_DATA_STATUS.PENDING,
                label: I18N.carbonFootprint3.pendingReview,
              },
              {
                value: CARBON_DATA_STATUS.DISAPPROVED,
                label: I18N.components.rejected,
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
            <Select
              style={{ width: 152 }}
              placeholder={I18N.supplyChain.typeOfFilling}
              options={Object.values(CARBON_DATA_REQ_TYPE).map(value => ({
                value,
                label: CARBON_DATA_REQ_TYPE_LABEL[value],
              }))}
              allowClear
              onChange={val =>
                setSearchParams({
                  ...searchParams,
                  pageNum: 1,
                  reqType: val,
                })
              }
            />
            <Input
              style={{ width: 240 }}
              placeholder={I18N.supplyChain.fillInTheNameFor}
              suffix={<SearchOutlined style={{ color: '#999EA4' }} />}
              onChange={e => onSearchNameInput(e.target.value)}
            />
            <Button
              type='primary'
              icon={<IconAlibabaNew type='icon-icon-faqitianbao' />}
              onClick={() => setModalOpen(true)}
            >
              {I18N.esg.initiateTheFillingProcess2}
            </Button>
          </div>
        </div>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={fillList}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total,
            pageSize,
            current: pageNum,
            showSizeChanger: true,
            showTotal: count =>
              I18N.template(I18N.supplyChain.coCoun2, { val1: count }),
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

export default FillList;
