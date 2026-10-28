/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-26 16:00:46
 */
/**
 * 库存变更记录
 * @returns
 */
import { useRef, useState } from 'react';
import { Form, FormProps } from 'antd';
import '../../index.less';
import SearchFormUtil from '@src/components/SearchForm';
import { formPropsInit } from '@src/components/FormUtil/util';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { AxiosResponse } from 'axios';
import { TableRef } from '@src/components/TableUtil/types/common';
import {
  ApiGetInventoryRecord,
  CarbonAccountInventoryRecordTable,
  CarbonAccountInventoryRecordTableGetParams,
} from './type';
import { ApiInventoryRecordListGet } from './service';
import {
  carbonAccountInventoryRecordSearchForm,
  carbonAccountInventoryRecordTableCol,
} from './model';

const CarbonAccountAwardConversionInventoryRecord = () => {
  const childRef = useRef<TableRef>();
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<
      Pick<
        CarbonAccountInventoryRecordTableGetParams,
        'goodsName' | 'createBy' | 'changeType'
      >
    >();
  const [searchForm] = Form.useForm();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /** 搜索回调 */
  const searchSub = () => {
    const res = searchForm.getFieldsValue();
    setSearchParamsData(res);
  };
  const resetBack = () => {
    setSearchParamsData(undefined);
  };
  const returnFetchApi = (back: AxiosResponse<ApiGetInventoryRecord, any>) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  return (
    <div className=' border-bottom-global-actions autoHeight'>
      <div className='main'>
        <div>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonAccountInventoryRecordSearchForm()}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <CommonTable<CarbonAccountInventoryRecordTable, any>
            bordered={false}
            cRef={childRef}
            pageSize={10}
            searchParams={searchParamsData}
            returnFetchApi={returnFetchApi}
            fetchApi={parmas => {
              const { goodsName, changeType, page, size } = parmas;
              return ApiInventoryRecordListGet({
                goodsName,
                changeType,
                page,
                size,
              });
            }}
            columns={carbonAccountInventoryRecordTableCol()}
            rowKey='id'
            pagePosition
          />
        </div>
      </div>
    </div>
  );
};

export default CarbonAccountAwardConversionInventoryRecord;
