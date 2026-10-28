/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-03 11:10:29
 * @Date: 2023-01-09 10:32:32
 * @@description: 核算模型
 */

import { PlusOutlined } from '@ant-design/icons';
import { formPropsInit } from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
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
  BusinessAccountingModelSearchForm,
  carbonFootprintProductAttributeAddEnumTableCol,
} from './model';
import {
  getBusinessAccountingModelTableData,
  postBusinessAccountingModelDelete,
} from './service';
import {
  BusinessAccountingModelTableData,
  BusinessAccountingModelTableParams,
} from './type';
import styleCarbonFootprint3 from '../index.module.less';
import { BackTableData } from '../type';

const { confirm } = Modal;

const CarbonFootprint3BusinessAccountingModel = () => {
  const history = useHistory();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<BusinessAccountingModelTableParams>();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  /**
   * @description: 新增模型
   */
  const goAdd = () => {
    history.push(
      RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelAddBasic,
    );
  };

  /**
   * @description: 删除列表数据
   * @param {ProductLibraryTableData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: BusinessAccountingModelTableData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis, {
        val1: deleteItem.modelName,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postBusinessAccountingModelDelete({
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

  /** 表头 */
  const columns: ColumnsType<BusinessAccountingModelTableData> = [
    ...carbonFootprintProductAttributeAddEnumTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: BusinessAccountingModelTableData) => (
        <TableActions
          menus={[
            {
              key: '1',
              label: I18N.carbonFootprint.accountingManagement2,
              onClick: async () => {
                if (Number(item.type) === 0) {
                  history.push(
                    `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagement}/${item.id}`,
                  );
                }
              },
            },
            {
              key: '2',
              label: I18N.carbonFootprint.edit,
              onClick: async () => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelEditBasic}/${item.id}`,
                );
              },
            },
            {
              key: '3',
              label: I18N.carbonFootprint.copy,
              onClick: async () => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelCopyBasic}/${item.id}`,
                );
              },
            },
            {
              key: '4',
              label: I18N.carbonFootprint.delete,
              onClick: async () => {
                deleteTable(item);
              },
            },
            {
              key: '5',
              label: I18N.carbonFootprint.check,
              onClick: async () => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagementDetail}/${item.id}`,
                );
              },
            },
          ]}
        />
      ),
    },
  ];
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<BusinessAccountingModelTableData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /** 搜索提交 */
  const searchSub = () => {
    const val: BusinessAccountingModelTableParams = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };
  /** 搜索重置 */
  const resetBack = () => {
    setSearchParamsData(undefined);
  };
  return (
    <div className={styleCarbonFootprint3.carbonFootprint3}>
      <div className={styleCarbonFootprint3.main}>
        <div className={styleCarbonFootprint3.mainHeader}>
          <div className={styleCarbonFootprint3.productTitle}>
            {I18N.carbonFootprint.accountingModel}
          </div>
          <div className={styleCarbonFootprint3.setBtn}>
            <Button
              icon={<PlusOutlined />}
              onClick={goAdd}
              className={`${styleCarbonFootprint3.btn}`}
              type='primary'
            >
              {I18N.carbonFootprint.newAddition}
            </Button>
          </div>
        </div>
        <div className='m-t-16'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={BusinessAccountingModelSearchForm()}
          />
        </div>
        <div className='m-t-16'>
          <CommonTable<
            BusinessAccountingModelTableData,
            any,
            Partial<BusinessAccountingModelTableParams>
          >
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getBusinessAccountingModelTableData({
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

export default CarbonFootprint3BusinessAccountingModel;
