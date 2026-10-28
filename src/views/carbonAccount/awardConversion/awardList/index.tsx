/*
 * @@description:奖品列表
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-21 18:51:40
 */

import { formPropsInit } from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { queryByPageUsingGETGoodsControllerApi } from '@src/sdks/java/carbonAccount';
import { addEllipsisToColumn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Modal } from 'antd';
import { useRef, useState } from 'react';
import '../../index.less';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { useHistory } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { checkPermissions } from '@src/components/Permission/utils';
import { compact } from 'lodash-es';

import styles from './index.module.less';
import {
  carbonAccountawardListlStockRemovalItem,
  carbonAccountAwardListSearchForm,
  carbonAccountAwardListTableCol,
} from './model';
import {
  ApicarbonAwardListListGoodsUpdateStatus,
  ApicarbonAwardListListInStock,
  ApicarbonAwardListListOutStock,
} from './srvice';
import {
  ApiGetAwardList,
  AwardListDetailLoaction,
  CarbonAccountAwardListTable,
  GoodsSearchParams,
} from './type';
import { useFlattedOrganizations, useOrganizations } from '../../utils';

const CarbonAccountAwardConversionAwardList = () => {
  const history = useHistory<AwardListDetailLoaction>();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();
  const [stockRemovalForm] = Form.useForm();
  /** table的loading */
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  /** 出库、入库的model */
  const [stockRemovalModel, setStockRemovalModel] = useState<boolean>(false);
  /** 出库入库的区分 fasle 入库 true 出库 */
  const [stockRemovalStatus, setStockRemovalStatus] = useState<boolean>(false);
  /** 出库入库的info*/
  const [stockInInfo, setStockInInfo] = useState<CarbonAccountAwardListTable>();
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState<GoodsSearchParams>(
    {},
  );
  /** 组织架构 */
  const organizations = useOrganizations();
  const flatOrganizations = useFlattedOrganizations(organizations);

  /** 出库弹框表单 */
  const stockRemovalFormProps: FormProps = {
    ...formPropsInit(),
    form: stockRemovalForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  /** 上架、下架商品 */
  const groundingGood = async (
    info: CarbonAccountAwardListTable,
    goodsStatus: 0 | 1,
  ) => {
    const { id } = info;
    const text: string =
      goodsStatus === 0
        ? I18N.carbonAccount.removeFromShelves
        : I18N.carbonAccount.listing;
    setTableLoading(true);

    const res = await ApicarbonAwardListListGoodsUpdateStatus({
      id,
      goodsStatus,
    });
    if (res.data.code === 200) {
      childRef.current?.reset();
      Toast(
        'success',
        I18N.template(I18N.carbonAccount.textCompleted, { val1: text }),
      );
    } else {
      Toast(
        'error',
        I18N.template(I18N.carbonAccount.textLoss, { val1: text }),
      );
    }

    setTableLoading(false);
  };
  const StockOrInRemovalEnd = (
    data: AxiosResponse<
      {
        code: number;
        msg: string;
      },
      any
    >,
  ) => {
    const text = stockRemovalStatus
      ? I18N.carbonAccount.outbound
      : I18N.carbonAccount.warehousing;
    if (data.data.code === 200) {
      Toast(
        'success',
        I18N.template(I18N.carbonAccount.textCompleted, { val1: text }),
      );
      childRef.current?.reset();
      setStockRemovalModel(false);
    } else {
      Toast(
        'error',
        I18N.template(I18N.carbonAccount.textLoss, { val1: text }),
      );
    }
  };
  /** 出库、入库点击事件 */
  const StockOrInRemoval = () => {
    if (!stockInInfo) return;
    stockRemovalForm.validateFields().then(async () => {
      const { id } = stockInInfo;
      const amount = stockRemovalForm.getFieldValue('amount');
      setTableLoading(true);
      if (stockRemovalStatus) {
        const resOut = await ApicarbonAwardListListOutStock({
          goodsId: id,
          amount,
        });
        StockOrInRemovalEnd(resOut);
      } else {
        const resIn = await ApicarbonAwardListListInStock({
          goodsId: id,
          amount,
        });
        StockOrInRemovalEnd(resIn);
      }
      setTableLoading(false);
    });
  };

  /** 查看用户 */
  const editChange = (status: 0 | 1, info: CarbonAccountAwardListTable) => {
    history.push(RouteMaps.CarbonAccountAwardConversionAwardListEdit, {
      status: 'edit',
      id: info.id,
    });
  };
  /** 表头 */
  const columns = addEllipsisToColumn([
    ...carbonAccountAwardListTableCol({ flatOrganizations }),
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'set',
      width: 210,
      render: (val: string, item: CarbonAccountAwardListTable) => (
        <TableActions
          menus={compact([
            checkPermissions(
              {
                label:
                  item.goodsStatus === 0
                    ? I18N.carbonFootprint.edit
                    : I18N.carbonAccount.removeFromShelves,
                key:
                  item.goodsStatus === 0
                    ? I18N.carbonFootprint.edit
                    : I18N.carbonAccount.removeFromShelves,
                onClick: () =>
                  item.goodsStatus === 0
                    ? editChange(item.goodsStatus, item)
                    : groundingGood(item, 0),
              },
              item.goodsStatus === 0
                ? 'carbonAccount:goods:edit'
                : 'carbonAccount:goods:updateStatus',
            ),
            checkPermissions(
              item.goodsStatus !== 1 && {
                label: I18N.carbonAccount.listing,
                key: I18N.carbonAccount.listing,
                onClick: () => groundingGood(item, 1),
              },
              'carbonAccount:goods:updateStatus',
            ),
            checkPermissions(
              item.goodsStatus !== 0 && {
                label: I18N.carbonAccount.warehousing,
                key: I18N.carbonAccount.warehousing,
                onClick: () => {
                  setStockRemovalStatus(false);
                  setStockInInfo(item);
                  stockRemovalForm.setFieldsValue({
                    goodsName: item.goodsName,
                    score: item.score,
                    saleAmount: item.amount,
                  });
                  setStockRemovalModel(true);
                },
              },
              'carbonAccount:goods:inStock',
            ),
            checkPermissions(
              item.goodsStatus !== 0 && {
                label: I18N.carbonAccount.outbound,
                key: I18N.carbonAccount.outbound,
                onClick: () => {
                  setStockRemovalStatus(true);
                  setStockInInfo(item);
                  stockRemovalForm.setFieldsValue({
                    goodsName: item.goodsName,
                    score: item.score,
                    saleAmount: item.amount,
                  });
                  setStockRemovalModel(true);
                },
              },
              'carbonAccount:goods:outStock',
            ),
          ])}
        />
      ),
    },
  ]);
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
    setSearchParamsData({});
  };
  const returnFetchApi = (back: AxiosResponse<ApiGetAwardList, any>) => {
    setTableLoading(false);
    return {
      data: back.data.data.rows,
      count: back.data.data.total,
    };
  };

  return (
    <div
      className={classNames(
        ' border-bottom-global-actions autoHeight',
        styles.awards,
      )}
    >
      <div className={styles.searchWrapper}>
        <h3>{I18N.carbonAccount.listOfPrizes}</h3>
        {checkPermissions(
          <Button
            onClick={() => {
              history.push(RouteMaps.CarbonAccountAwardConversionAwardListAdd, {
                status: 'add',
              });
            }}
            type='primary'
          >
            {I18N.carbonFootprint.newAddition}
          </Button>,
          'carbonAccount:goods:add',
        )}
      </div>
      <SearchFormUtil
        antdFormProps={searchFormProps}
        searchSub={searchSub}
        resetBack={resetBack}
        formItems={carbonAccountAwardListSearchForm({ organizations })}
      />
      <div style={{ marginTop: 20 }}>
        <CommonTable<CarbonAccountAwardListTable, any, GoodsSearchParams>
          bordered={false}
          searchParams={searchParamsData}
          cRef={childRef}
          pageSize={10}
          loading={tableLoading}
          fetchApi={params =>
            queryByPageUsingGETGoodsControllerApi(
              0,
              0,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              params.goodsName,
              params.goodsStatus,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              params.orgIds?.join(','),
              undefined,
              params.page,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              params.size,
            )
          }
          returnFetchApi={returnFetchApi}
          columns={columns}
          rowKey='id'
          pagePosition
        />
      </div>
      <Modal
        title={
          stockRemovalStatus
            ? I18N.carbonAccount.outbound
            : I18N.carbonAccount.warehousing
        }
        width={600}
        maskClosable={false}
        className='userListModelClass'
        open={stockRemovalModel}
        onOk={StockOrInRemoval}
        onCancel={() => {
          stockRemovalForm.resetFields();
          setStockRemovalModel(false);
        }}
      >
        <div>
          <FormItemUtil
            paddRight={10}
            antdFormProps={stockRemovalFormProps}
            formItems={carbonAccountawardListlStockRemovalItem(
              stockRemovalStatus,
              stockInInfo,
            )}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CarbonAccountAwardConversionAwardList;
