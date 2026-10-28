/* eslint-disable @typescript-eslint/no-unused-vars */

import I18N from '@src/lang/I18N';
import { Button, Form, FormProps } from 'antd';
import React, { FC, useRef, useState } from 'react';
import '../carbon-greenMeeting.scss';
import '../style.less';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { useHistory } from 'react-router-dom';
import { useIndexColumn } from '@src/views/emission/utils';
import { ColumnsType } from 'antd/es/table';
import { FromItemProps } from '@src/components/FormUtil/type';
import { ApiOrdersRecords } from '../service';

export const TableContact: any = React.createContext({});
const AddActivity: FC = () => {
  // const history = useHistory();
  const [searchSupplyForm] = Form.useForm();
  const searchFormProps: FormProps = {
    layout: 'inline',
    form: searchSupplyForm,
  };
  const history = useHistory();
  const childRef = useRef<TableRef>();
  const [searchParamsData, setSearchParamsData] = useState<any>();
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });
  const searchSupplySub = () => {
    const res = searchSupplyForm.getFieldsValue();
    setSearchParamsData(res);
  };
  /**  订单表格数据  */
  const returnFetchApi = back => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  const formList: FromItemProps<any>[] = [
    {
      label: '',
      name: 'userNick',
      type: 'input',
      rules: true,
      placeholder: I18N.carbonNeutral.userName,
      props: {
        maxLength: 50,
      },
    },
    {
      label: '',
      name: 'thirdCode',
      type: 'input',
      rules: true,
      placeholder: I18N.carbonNeutral.businessDataI,
      props: {
        maxLength: 50,
      },
    },
    {
      label: '',
      name: 'orderId',
      type: 'input',
      rules: true,
      placeholder: I18N.carbonNeutral.orderNumber2,
      props: {},
    },
    {
      label: '',
      name: 'certFlag',
      type: 'select',
      rules: true,
      placeholder: I18N.carbonNeutral.generateCertificate,
      props: {
        style: {
          width: 160,
        },
        options: [
          { value: 1, label: I18N.carbonNeutral.yes },
          { value: 0, label: I18N.carbonNeutral.no },
        ],
      },
    },
    {
      label: '',
      name: 'status',
      type: 'select',
      rules: true,
      placeholder: I18N.carbonNeutral.orderStatus,
      props: {
        style: {
          width: 160,
        },
        options: [
          { value: 1, label: I18N.carbonNeutral.paymentSuccessful2 },
          { value: 0, label: I18N.carbonNeutral.inPayment },
          { value: 2, label: I18N.carbonNeutral.paymentFailed2 },
        ],
      },
    },
  ];
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);
  const payState = [
    { name: I18N.carbonNeutral.inPayment, class: 'warning' },
    { name: I18N.carbonNeutral.paymentSuccessful2, class: 'success' },
    { name: I18N.carbonNeutral.paymentFailed2, class: 'error' },
  ];
  const tableColumns: ColumnsType<any> = [
    { title: I18N.carbonNeutral.userName, dataIndex: 'userNick' },
    { title: I18N.carbonNeutral.businessDataI, dataIndex: 'thirdCode' },
    { title: I18N.carbonNeutral.orderNumber2, dataIndex: 'orderId' },
    { title: I18N.carbonNeutral.carbonEmissionsT, dataIndex: 'buyAmount' },
    { title: I18N.carbonNeutral.totalOrderPriceInYuan, dataIndex: 'payMoney' },
    {
      title: I18N.carbonNeutral.orderStatus,
      dataIndex: 'status',
      render: text => (
        <p className='btnStatus'>
          <span className={payState[text].class}>
            {text ? payState[text].name : '--'}
          </span>{' '}
        </p>
      ),
    },
    {
      title: I18N.carbonNeutral.generateCertificateOrNot,
      dataIndex: 'certFlag',
      render: text =>
        text === '1'
          ? I18N.carbonNeutral.generate
          : I18N.carbonNeutral.notGenerated,
    },
    {
      title: I18N.carbonNeutral.orderDetails,
      dataIndex: 'supplyQuantity',
      render: (txt, record) => (
        <Button
          type='link'
          onClick={() => {
            history.push(`/carbonNeutral/orderList/detail?id=${record.id}`);
          }}
        >
          {I18N.carbonFootprint.check}
        </Button>
      ),
    },
  ];
  return (
    <div className='computation'>
      <div style={{ background: '#fff', marginBottom: 16 }}>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          formItems={formList}
          searchSub={searchSupplySub}
          resetBack={() => {
            setSearchParamsData(undefined);
          }}
        />
      </div>
      <CommonTable
        columns={[...indexColumn, ...tableColumns]}
        cRef={childRef}
        fetchApi={params => {
          setPage({ current: params.page, pageSize: params.size });
          return ApiOrdersRecords({
            page: params.page,
            size: params.size,
            ...searchParamsData,
            channel: null,
          });
        }}
        returnFetchApi={returnFetchApi}
        searchParams={searchParamsData}
        pagePosition
      />
    </div>
  );
};

export default AddActivity;
