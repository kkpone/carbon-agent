import I18N from '@src/lang/I18N';
import {
  formPropsInit,
  formItemInitType,
  formItemInitInput,
} from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Form, FormProps, TableColumnsType } from 'antd';
import classNames from 'classnames';
import { VFC, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { AUDIT_STATUS, AUDIT_STATUS_LABEL } from './constant';
import styles from './index.module.less';
import { getAuditData } from './service';
import { AuditData, SearchParams } from './type';

const statusClassNameMap = {
  [AUDIT_STATUS.NOT_FILLED]: styles.statusNotFilled,
  [AUDIT_STATUS.FILLING]: styles.statusFilling,
  [AUDIT_STATUS.BE_AUDITED]: styles.statusBeAudited,
  [AUDIT_STATUS.PASSED]: styles.statusPassed,
  [AUDIT_STATUS.NOT_PASSED]: styles.statusNotPassed,
};

const SupplierCarbonData: VFC = () => {
  const history = useHistory();

  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const [form] = Form.useForm<SearchParams>();

  const tableRef = useRef<TableRef>();

  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form,
  };

  const formItemProps = {
    style: {
      width: 208,
    },
  };

  const tableColumns: TableColumnsType<AuditData> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__index__',
      width: 70,
      fixed: 'left',
      render: (_, auditData, index) => index + 1,
    },
    {
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'companyName',
      width: 260,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.greenhouseGasEmissions,
      dataIndex: 'emissionDesc',
      width: 256,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewStatus,
      dataIndex: 'status',
      width: 144,
      render: (_, { status }) => (
        <div
          className={classNames(styles.statusText, statusClassNameMap[status])}
        >
          {AUDIT_STATUS_LABEL[status]}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint3.submissionTime,
      dataIndex: 'submitTime',
      width: 192,
    },
    {
      title: I18N.carbonFootprint3.reviewer,
      dataIndex: 'auditUser',
      width: 112,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewTime,
      dataIndex: 'auditTime',
      width: 176,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewRemarks,
      dataIndex: 'content',
      width: 256,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 116,
      fixed: 'right',
      render: (_, data) => (
        <TableActions
          buttonProps={[
            {
              disabled: data.status !== AUDIT_STATUS.BE_AUDITED,
            },
          ]}
          menus={[
            ...(checkPermissions(true, 'supplier:data:audit')
              ? [
                  {
                    label: I18N.carbonFootprint3.auditing,
                    key: 'audit',
                    onClick: () => {
                      history.push(
                        `${RouteMapsCorbonFootprint3.carbonFootprint3SupplierCarbonDataAudit}?id=${data.id}`,
                      );
                    },
                  },
                ]
              : []),
            ...(checkPermissions(true, 'supplier:data:info')
              ? [
                  {
                    label: I18N.carbonFootprint.check,
                    key: 'view',
                    onClick: () => {
                      history.push(
                        `${RouteMapsCorbonFootprint3.carbonFootprint3SupplierCarbonDataDetail}?id=${data.id}`,
                      );
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];
  return (
    <div className={styles.supplierCarbonData}>
      <div className={styles.supplierCarbonDataHeader}>
        {I18N.carbonFootprint3.supplierCarbonCount}
      </div>
      <div className='m-t-16'>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          formItems={[
            {
              ...formItemInitInput('', 'companyName', false),
              props: {
                ...formItemProps,
                placeholder: I18N.carbonFootprint3.pleaseEnterTheSupply,
              },
            },
            {
              ...formItemInitType('select', '', 'status', false),
              props: {
                ...formItemProps,
                placeholder: I18N.carbonFootprint.state,
                options: Object.values(AUDIT_STATUS).map(status => ({
                  value: status,
                  label: AUDIT_STATUS_LABEL[status],
                })),
              },
            },
          ]}
          searchSub={() => setSearchParams(form.getFieldsValue())}
          resetBack={() => setSearchParams({})}
        />
      </div>
      <div className={styles.tableContent}>
        <CommonTable<AuditData, { rows: AuditData[]; total: number }>
          searchParams={searchParams}
          columns={tableColumns}
          cRef={tableRef}
          pageSize={10}
          rowKey='id'
          scroll={{ x: 1200 }}
          pagePosition={false}
          fetchApi={params =>
            getAuditData({
              ...params,
              pageSize: params.size,
              pageNum: params.page,
            })
          }
          returnFetchApi={back => ({
            data: back?.data?.rows || [],
            count: back?.data?.total || 0,
          })}
        />
      </div>
    </div>
  );
};

export default SupplierCarbonData;
