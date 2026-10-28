/*
 * @@description: 企业碳核算2.0-供应商管理
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 11:22:25
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-28 10:00:36
 */
/**
 * @file 企业碳核算2.0-供应商管理
 */
import I18N from '@src/lang/I18N';
import '@src/views/supplyChain2/style.less';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { useIndexColumn } from '@src/views/emission/utils';
import { Form, FormProps } from 'antd';
import { FC, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { supplyChainSupplierManageCloumn } from './cloumn';
import { formList } from './form';
import { apiInnerEnterpriseList } from './service';
import { InnerEnterpriseListParmas } from './type';

const CarbonAccountSupplierManage: FC = () => {
  /** 搜索数据 */
  const [searchParamsData, setSearchParamsData] =
    useState<InnerEnterpriseListParmas>();
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });
  localStorage.removeItem('productCarbonPrintTab');
  localStorage.removeItem('supplierCarbonDataTab');
  const history = useHistory();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);
  const tableColumns = supplyChainSupplierManageCloumn({
    history,
  });
  const searchFormProps: FormProps = {
    layout: 'inline',
    form: searchForm,
  };

  const returnFetchApi = back => ({
    data: back.data.rows,
    count: back.data.total,
  });
  const searchSupplySub = () => {
    const res = searchForm.getFieldsValue();
    setSearchParamsData(res);
  };

  return (
    <div className='supply-chain-container'>
      <div className='flex-j-b margin-b-20'>
        <span className='title-word'>{I18N.carbonFootprint3.supplierCarbonCount}</span>
      </div>
      <SearchFormUtil
        antdFormProps={searchFormProps}
        formItems={formList}
        searchSub={searchSupplySub}
        resetBack={() => {
          setSearchParamsData(undefined);
        }}
      />
      <CommonTable
        className='margin-t-6'
        columns={[...indexColumn, ...tableColumns]}
        cRef={childRef}
        scroll={{ y: 'calc(100vh - 296px)' }}
        pageSize={10}
        pagination={{
          showTotal: total => I18N.template(I18N.enterpriseCarbonAccount2.totalTota6, { val1: total }),
        }}
        pagePosition={false}
        fetchApi={async params => {
          setPage({ current: params.page, pageSize: params.size });
          return apiInnerEnterpriseList({
            pageNum: params.page,
            pageSize: params.size,
            ...searchParamsData,
            reqType: 4,
          });
        }}
        returnFetchApi={returnFetchApi}
        searchParams={searchParamsData}
      />
    </div>
  );
};

export default CarbonAccountSupplierManage;
