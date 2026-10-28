/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-21 10:43:05
 * @Date: 2022-12-23 15:45:59
 * @@description: 产品库
 */

import { PlusOutlined } from '@ant-design/icons';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  carbonFootprintProductLibrarySearchForm,
  carbonFootprintProductLibraryTableCol,
} from './model';
import styleCarbonFootprint3 from '../../index.module.less';
import { BackTableData } from '../../type';
import {
  checkProductLibraryEditPermissions,
  checkProductLibraryInfoPermissions,
} from '../../util/permissions';
import {
  getProductLibraryTableData,
  postProductLibraryDeleteData,
} from '../service';
import { ProductLibraryTableData, ProductLibraryTableParams } from '../type';

const { confirm } = Modal;

const CarbonFootprint3ProductLibrary = () => {
  const history = useHistory();
  const [searchForm] = Form.useForm();
  const childRef = useRef<TableRef>();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<ProductLibraryTableParams>();

  /**
   * @description: 删除列表数据
   * @param {ProductLibraryTableData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: ProductLibraryTableData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis8, {
        val1: deleteItem.productName,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postProductLibraryDeleteData({
            id: deleteItem.id,
          });
          if (back.data.code === 200) {
            childRef.current?.reset();
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /**
   * @description: 新增产品
   */
  const goAdd = () => {
    history.push(RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryAdd);
  };
  /** 表头 */
  const columns: ColumnsType<ProductLibraryTableData> = [
    ...carbonFootprintProductLibraryTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: ProductLibraryTableData) => (
        <div>
          {checkPermissions(
            <span
              onClick={() => {
                if (checkProductLibraryEditPermissions()) {
                  history.push(
                    `${RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryEdit}/${item.id}`,
                  );
                } else if (checkProductLibraryInfoPermissions()) {
                  history.push(
                    `${RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryDetail}/${item.id}`,
                  );
                }
              }}
              className={`${styleCarbonFootprint3.primaryColorFont} ${styleCarbonFootprint3.cursorPointerFont} m-r-10`}
            >
              {I18N.carbonFootprint3.details}
            </span>,
            'footprint3:product:info',
          )}

          {checkPermissions(
            <span
              onClick={() => deleteTable(item)}
              className={`${styleCarbonFootprint3.primaryColorFont} ${styleCarbonFootprint3.cursorPointerFont} m-r-10`}
            >
              {I18N.carbonFootprint.delete}
            </span>,
            'footprint3:product:delete',
          )}
        </div>
      ),
    },
  ];
  /** 搜索提交 */
  const searchSub = () => {
    const val: ProductLibraryTableParams = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };
  /** 搜索重置 */
  const resetBack = () => {
    setSearchParamsData(undefined);
  };
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<BackTableData<ProductLibraryTableData>>>,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  return (
    <div className={`${styleCarbonFootprint3.carbonFootprint3} m-b-60`}>
      <div className={styleCarbonFootprint3.main}>
        <div className={styleCarbonFootprint3.mainHeader}>
          <div className={styleCarbonFootprint3.productTitle}>
            {I18N.carbonFootprint3.productLibrary}
          </div>
          <div className={styleCarbonFootprint3.setBtn}>
            {checkPermissions(
              <Button
                icon={<PlusOutlined />}
                onClick={goAdd}
                style={{ width: 110 }}
                className={`${styleCarbonFootprint3.btn}`}
                type='primary'
              >
                {I18N.carbonFootprint3.newProductsAdded}
              </Button>,
              'footprint3:product:add',
            )}
            {checkPermissions(
              <Button
                onClick={() => {
                  history.push(
                    RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryImport,
                  );
                }}
                style={{ marginLeft: 10 }}
              >
                {I18N.carbonFootprint.import}
              </Button>,
              'footprint3:product:upload',
            )}
          </div>
        </div>
        <div className='m-t-16'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonFootprintProductLibrarySearchForm()}
          />
        </div>
        <div>
          <CommonTable<ProductLibraryTableData, any, ProductLibraryTableParams>
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getProductLibraryTableData({
                ...params,
                pageNum: params.page,
                pageSize: params.size,
              })
            }
            returnFetchApi={returnFetchApi}
            columns={columns}
            rowKey='id'
            pagePosition
          />
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprint3ProductLibrary;
