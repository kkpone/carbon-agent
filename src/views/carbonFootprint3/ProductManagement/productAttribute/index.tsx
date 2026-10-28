/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-13 18:01:22
 * @Date: 2022-12-23 15:45:59
 * @@description: 产品属性
 */
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
  carbonFootprintProductAttributeSearchForm,
  carbonFootprintProductAttributeTableCol,
} from './model';
import styleCarbonFootprint3 from '../../index.module.less';
import { BackTableData } from '../../type';
import {
  getProductAttributeTableData,
  postProductAttributeUpadate,
} from '../service';
import {
  ProductAttributeTableData,
  ProductAttributeTableParams,
} from '../type';

const CarbonFootprint3ProductAttribute = () => {
  const history = useHistory();
  const [searchForm] = Form.useForm();
  const childRef = useRef<TableRef>();
  /** 是否显示禁用弹框 */
  const [showforbiddenModal, setForbiddenModal] = useState<boolean>(false);
  /** 当前选中的值 */
  const [changeInfo, setChangeInfo] = useState<ProductAttributeTableData>();
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<ProductAttributeTableParams>();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /**
   * @description: 禁用或者启用弹框提示
   */
  const upadteStatus = async () => {
    if (changeInfo) {
      const status = changeInfo.status === 0 ? 1 : 0;
      const back = await postProductAttributeUpadate({
        id: changeInfo.id,
        status,
      });
      if (back.data.code === 200) {
        Toast(
          'success',
          status === 0
            ? I18N.carbonFootprint3.successfullyEnabled
            : I18N.carbonFootprint3.successfullyDisabled,
        );
        setForbiddenModal(false);
        childRef.current?.reset();
      }
    }
  };
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<ProductAttributeTableData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /**
   * @description: 枚举值管理
   * @param {ProductAttributeTableData} item 当前选中的枚举值
   */
  const enumManagementCallback = (item: ProductAttributeTableData) => {
    history.push(
      `${RouteMapsCorbonFootprint3.carbonFootprint3ProductAttributeAddEnum}/${item.id}`,
    );
  };
  /** 表头 */
  const columns: ColumnsType<ProductAttributeTableData> = [
    ...carbonFootprintProductAttributeTableCol(enumManagementCallback),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: ProductAttributeTableData) => (
        <div>
          {checkPermissions(
            <span
              onClick={() => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3ProductAttributeEdit}/${item.id}`,
                );
              }}
              className={`${styleCarbonFootprint3.primaryColorFont} ${styleCarbonFootprint3.cursorPointerFont} m-r-10`}
            >
              {I18N.carbonFootprint.edit}
            </span>,
            'footprint3:sysExtra:edit',
          )}

          {checkPermissions(
            <span
              onClick={async () => {
                setChangeInfo(item);
                setForbiddenModal(true);
              }}
              className={`${styleCarbonFootprint3.primaryColorFont} ${styleCarbonFootprint3.cursorPointerFont}`}
            >
              {item.status === 0
                ? I18N.carbonFootprint.disabled
                : I18N.carbonFootprint.enable}
            </span>,
            'footprint3:sysExtra:updateStatus',
          )}
        </div>
      ),
    },
  ];
  /**
   * @description: 新增属性
   */
  const goAdd = () => {
    history.push(RouteMapsCorbonFootprint3.carbonFootprint3ProductAttributeAdd);
  };
  /** 搜索提交 */
  const searchSub = () => {
    const val: ProductAttributeTableParams = searchForm.getFieldsValue();

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
            {I18N.carbonFootprint3.productAttributes}
          </div>
          <div className={styleCarbonFootprint3.setBtn}>
            {checkPermissions(
              <Button
                onClick={goAdd}
                className={`${styleCarbonFootprint3.btn}`}
                type='primary'
              >
                {I18N.carbonFootprint.newAddition}
              </Button>,
              'footprint3:sysExtra:add',
            )}
          </div>
        </div>
        <div className='m-t-16'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonFootprintProductAttributeSearchForm()}
          />
        </div>
        <div>
          <CommonTable<
            ProductAttributeTableData,
            any,
            ProductAttributeTableParams
          >
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getProductAttributeTableData({
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
        <Modal
          width={448}
          title={I18N.carbonFootprint.prompt}
          maskClosable={false}
          getContainer={false}
          open={showforbiddenModal}
          onOk={upadteStatus}
          okButtonProps={{
            style: {
              color: '#fff',
              background: '#ED5555',
              borderColor: '#ED5555',
            },
          }}
          onCancel={() => setForbiddenModal(false)}
        >
          <div>
            {I18N.carbonFootprint.confirm}
            {changeInfo?.status === 0
              ? I18N.carbonFootprint.disabled
              : I18N.carbonFootprint.enable}
            {I18N.carbonFootprint3.thisAttribute}
            {changeInfo?.name}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CarbonFootprint3ProductAttribute;
