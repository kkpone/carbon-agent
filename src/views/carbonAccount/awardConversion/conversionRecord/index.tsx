/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-12 17:13:34
 */
/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-08 18:04:44
 */
/**
 * 兑换记录
 * @returns
 */

import I18N from '@src/lang/I18N';
import { Button, Col, Form, FormProps, Modal, Row, Table } from 'antd';
import { compact } from 'lodash-es';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';

import '../../index.less';
import SearchFormUtil from '@src/components/SearchForm';
import { formPropsInit } from '@src/components/FormUtil/util';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { AxiosResponse } from 'axios';
import { TableRef } from '@src/components/TableUtil/types/common';
import { Toast } from '@src/utils/Toast';
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import { useHistory } from 'react-router-dom';
import { RouteMaps } from '@src/router/route-paths';
import Permission from '@src/components/Permission';

import {
  carbonAccountConversionRecordSearchForm,
  carbonAccountConversionRecordTableCol,
} from './model';
import {
  ApiConversionRecordListGet,
  ApiConversionRecordListUInfo,
  ApiConversionRecordListUpdateStatus,
  ApiOrdersExportExcel,
} from './service';
import {
  ApiGetConversionRecord,
  CarbonAccountConversionRecordTable,
  CarbonAccountConversionRecordTableGetParams,
} from './type';
import ExportModel from '../../component/exportModel';
import { UserListItemDetailLoaction } from '../../userManagement/userList/type';

const CarbonAccountAwardConversionConversionRecord = () => {
  const history = useHistory<UserListItemDetailLoaction>();
  const childRef = useRef<TableRef>();
  /** table的loading */
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  /** 当前列表数据的明细信息 */
  const [listInfo, setListInfo] =
    useState<CarbonAccountConversionRecordTable>();
  /** 兑换明细Model */
  const [conversionRecordModel, setConversionRecordModel] =
    useState<boolean>(false);

  /** 导出弹窗 */
  const [showExport, setShowExport] = useState<boolean>(false);
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<
      Pick<
        CarbonAccountConversionRecordTableGetParams,
        'orderStatus' | 'realName' | 'begTime' | 'endTime'
      >
    >();
  const [searchForm] = Form.useForm();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  const returnFetchApi = (
    back: AxiosResponse<ApiGetConversionRecord, any>,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /** 搜索回调 */
  const searchSub = () => {
    const res = searchForm.getFieldsValue();
    setSearchParamsData(res);
  };
  const resetBack = () => {
    setSearchParamsData({
      begTime: moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    setTimeout(() => {
      searchForm.setFieldsValue({
        time: [moment().subtract(1, 'month'), moment()],
      });
    }, 100);
  };
  /** 完成兑换 */
  const conversionRecordUpdateStatus = async (
    info: CarbonAccountConversionRecordTable,
  ) => {
    setTableLoading(true);

    const res = await ApiConversionRecordListUpdateStatus({
      id: info.id,
      orderStatus: 1,
    });
    if (res.data.code === 200) {
      Toast('success', I18N.carbonAccount.successfullyCompletedRedemption);
      childRef.current?.reset();
    }

    setTableLoading(false);
  };
  /** 查看明细 */
  const conversionRecordListInfo = async (
    info: CarbonAccountConversionRecordTable,
  ) => {
    const res = await ApiConversionRecordListUInfo({ id: info.id });
    if (res.data.code === 200) {
      setListInfo(res.data.data);
      setConversionRecordModel(true);
    }
  };
  /** 表头 */
  const columns = [
    ...carbonAccountConversionRecordTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'set',
      render: (val: string, item: CarbonAccountConversionRecordTable) => (
        <TableActions
          menus={compact([
            checkPermissions(
              {
                key: I18N.enterpriseCarbonAccount2.viewDetails,
                label: I18N.enterpriseCarbonAccount2.viewDetails,
                onClick: async () => {
                  conversionRecordListInfo(item);
                },
              },
              'carbonAccount:orders:info',
            ),
            item.orderStatus === 0 &&
              checkPermissions(
                {
                  key: I18N.carbonAccount.completeRedemption,
                  label: I18N.carbonAccount.completeRedemption,
                  onClick: async () => {
                    conversionRecordUpdateStatus(item);
                  },
                },
                'carbonAccount:orders:updateStatus',
              ),
          ])}
        />
      ),
    },
  ];
  useEffect(() => {
    searchForm.setFieldsValue({
      time: [moment().subtract(1, 'month'), moment()],
    });
  }, []);
  return (
    <div className=' border-bottom-global-actions autoHeight'>
      <div className='main'>
        <div className='searchWrapper'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            resetBack={resetBack}
            searchSub={searchSub}
            formItems={carbonAccountConversionRecordSearchForm()}
          />
          <Permission flag='carbonAccount:orders:excel'>
            <Button
              className='exportBtn'
              type='primary'
              onClick={() => setShowExport(true)}
            >
              {I18N.carbonFootprint3.export}
            </Button>
          </Permission>
        </div>
        <div style={{ marginTop: 20 }}>
          <CommonTable<CarbonAccountConversionRecordTable, any>
            bordered={false}
            loading={tableLoading}
            cRef={childRef}
            searchParams={searchParamsData}
            pageSize={10}
            fetchApi={params => {
              let [begTime, endTime] = params.time || [];

              begTime ||= moment().subtract(1, 'month');
              endTime ||= moment();
              return ApiConversionRecordListGet({
                page: params.page,
                size: params.size,
                begTime: moment(begTime).format('YYYY-MM-DD HH:mm:ss'),
                endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
                orderStatus: params?.orderStatus, // 用户姓名
                realName: params?.realName,
              });
            }}
            returnFetchApi={returnFetchApi}
            columns={columns}
            rowKey='id'
            pagePosition
          />
        </div>
        <div>
          <Modal
            width={600}
            title={I18N.carbonAccount.exchangeDetails}
            maskClosable={false}
            className='userListModelClass'
            open={conversionRecordModel}
            footer={null}
            onCancel={() => setConversionRecordModel(false)}
          >
            <div>
              <div className='conversionRecordTitle'>
                <Row>
                  <Col span={16}>
                    <div>
                      {I18N.system.orderNumber}
                      {listInfo?.orderNo}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      {I18N.carbonAccount.exchangePerson}
                      {listInfo?.realName}
                    </div>
                  </Col>
                </Row>
                <Row style={{ marginTop: 15 }}>
                  <Col span={16}>
                    <div>
                      {I18N.carbonAccount.redemptionTime}
                      {listInfo?.createTime}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      {I18N.carbonAccount.redemptionStatus}
                      {listInfo?.orderStatus === 0 ? (
                        <div
                          style={{
                            color: '#6C757D',
                            background: 'rgba(108,117,125,0.06)',
                            display: 'inline-block',
                            padding: '5px 10px',
                            borderRadius: '15px',
                          }}
                          className='conversionRecordStatus'
                        >
                          {I18N.carbonAccount.notRedeemed}
                        </div>
                      ) : (
                        <div
                          style={{
                            color: '#3491FA',
                            background: 'rgba(52,145,250,0.06)',
                            display: 'inline-block',
                            padding: '5px 10px',
                            borderRadius: '15px',
                          }}
                          className='conversionRecordStatus'
                        >
                          {I18N.carbonAccount.redeemed}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
              <div style={{ marginTop: 20 }} className='conversionRecordTable'>
                <Table
                  dataSource={listInfo?.ordersDetails}
                  pagination={false}
                  columns={[
                    {
                      title: I18N.carbonFootprint.number,
                      dataIndex: 'index',
                      key: 'index',
                      render: (val: string, item: any, index: number) =>
                        index + 1,
                    },
                    {
                      title: I18N.carbonAccount.prizeName,
                      dataIndex: 'goodsName',
                      key: 'goodsName',
                    },
                    {
                      title: I18N.carbonFootprint.quantity,
                      dataIndex: 'buyCount',
                      key: 'buyCount',
                    },
                    {
                      title: I18N.carbonAccount.consumptionOfCarbonCoins2,
                      dataIndex: 'payScore',
                      key: 'payScore',
                    },
                  ]}
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <ExportModel
        showModel={showExport}
        title={I18N.carbonAccount.exchangeRecordGuide}
        handelOk={(value: any) => {
          const searchData: any = searchForm.getFieldsValue();
          const data = {
            ...searchData,
            excelName: value?.fileName,
            begTime: moment(searchData?.time[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTime: moment(searchData?.time[1]).format('YYYY-MM-DD HH:mm:ss'),
          };
          delete data.time;
          ApiOrdersExportExcel(data).then(() => {
            history.push(RouteMaps.CarbonAccountDownload);
          });
        }}
        handelCancel={() => setShowExport(false)}
      />
    </div>
  );
};

export default CarbonAccountAwardConversionConversionRecord;
