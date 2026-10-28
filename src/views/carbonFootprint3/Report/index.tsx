/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-06 23:58:51
 * @Date: 2023-03-07 15:05:10
 * @@description: 碳足迹报告
 */

import { Button } from '@src/components/Button';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { virtualLinkTransform } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { PageInfoType } from '@src/router/type';
import {
  GETc4a05d10319b2a78008d2f1bbb0677aa,
  POST5827ce9c386d794601e7650d253aeac2,
} from '@src/sdks_v2/footprint3V2ApiDocs';
import { Toast } from '@src/utils/Toast';
import { Form, Modal, Spin, Table, message } from 'antd';
import saveAs from 'file-saver';
import { compact } from 'lodash-es';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getProductsOfReport, getReportFile } from './Info/service';
import { columns } from './columns';
import { searchTableFormItem } from './formItems';
import styles from './index.module.less';
import { TableRow } from './types';
import TextWidthOverflow from '../component/TextOverflowTable/byWidth';
import { COMPARISON_REPORT_TYPE, REPORT_TYPE } from '../constant';

const { confirm } = Modal;

const CarbonFootPrint3Report = () => {
  const isEdit = checkPermissions(true, 'footprint3:report:edit');
  const isAdd = checkPermissions(true, 'footprint3:report:add');
  const tableRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState<any>();

  /** 展开的数据 */
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  /** 下载管理的Loading */
  const [downLoading, setDownLoading] = useState(false);
  const history = useHistory();

  /**
   * @description: 删除列表数据
   * @param {ProductLibraryTableData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: any) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis12, {
        val1: deleteItem.reportName,
      }),
      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await POST5827ce9c386d794601e7650d253aeac2({
            report: deleteItem,
          });
          if (back.data.code === 200) {
            tableRef.current?.reset();
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /**
   * 展开收起表格
   * @param expanded 是否展开
   * @param record 展开收起的信息
   */
  const handleExpand = async (expanded: boolean, record: TableRow) => {
    setDownLoading(true);
    if (expanded) {
      const { data } = await getProductsOfReport({ id: record.id });
      record.expandedList = data.data;
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(item => item !== record.id));
    }
    setDownLoading(false);
  };

  /**
   * 展开表格
   * @param record 报告信息
   */
  const expandedRowRender = (record: TableRow) => (
    <Table
      columns={[
        {
          title: I18N.carbonFootprint.productName,
          width: 260,
          dataIndex: 'productName',
          render: (val, item) => {
            if (
              record.type === REPORT_TYPE.COMPARE ||
              record.type === REPORT_TYPE.REDUCTION
            ) {
              const targetLabel =
                record.type === REPORT_TYPE.REDUCTION
                  ? I18N.carbonFootprint3.projectScenario
                  : I18N.carbonFootprint3.targetProduct;
              const benchmarkLabel =
                record.type === REPORT_TYPE.REDUCTION
                  ? I18N.carbonFootprint3.benchmarkScenario
                  : I18N.carbonFootprint3.benchmarkProduct;
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.baseType === COMPARISON_REPORT_TYPE.TARGET && (
                    <div
                      style={{
                        width: 124,
                        height: 24,
                        fontSize: 12,
                        color: '#fff',
                        borderRadius: 4,
                        background: '#3491FA',
                        marginRight: 8,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {targetLabel}
                    </div>
                  )}
                  {item.baseType === COMPARISON_REPORT_TYPE.STANDARD && (
                    <div
                      style={{
                        width: 124,
                        height: 24,
                        fontSize: 12,
                        color: '#fff',
                        borderRadius: 4,
                        background: '#0CBF9F',
                        marginRight: 8,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {benchmarkLabel}
                    </div>
                  )}
                  <TextWidthOverflow value={val} width={100} />
                </div>
              );
            }
            return <TextWidthOverflow value={val} width={180} />;
          },
        },
        {
          title: I18N.carbonFootprint3.specificationAndModel,
          width: 150,
          dataIndex: 'specification',
          render: val => <TextWidthOverflow value={val} width={120} />,
        },
        {
          title: I18N.carbonFootprint3.functionalUnits,
          width: 200,
          dataIndex: 'accountName',
          render: val => <TextWidthOverflow value={val} width={180} />,
        },
        {
          title: I18N.carbonFootprint.accountingCycle,
          width: 200,
          dataIndex: 'startTime',
          render: (val, item) => (
            <TextWidthOverflow
              value={I18N.template(I18N.carbonFootprint3.items4, {
                val1: item.startTime,
                val2: item.endTime,
              })}
              width={180}
            />
          ),
        },
        {
          title: I18N.carbonFootprint3.unitEmissions,
          width: 200,
          dataIndex: 'factor',
          render: (val, item) => (
            <TextWidthOverflow
              value={`${item?.factor}${item?.factorUnit}`}
              width={180}
            />
          ),
        },
      ]}
      dataSource={record.expandedList || []}
      rowKey='id'
      size='small'
      pagination={false}
    />
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          {I18N.carbonFootprint.carbonFootprintReport}
        </div>
      </div>
      <div className={styles.searchContent}>
        <SearchFormUtil
          antdFormProps={{
            ...formPropsInit(),
            layout: 'inline',
            form: searchForm,
          }}
          searchSub={() => {
            const val = searchForm.getFieldsValue();
            setSearchParamsData({
              ...searchParamsData,
              ...val,
            });
            setExpandedRowKeys([]);
          }}
          resetBack={() => {
            setSearchParamsData(undefined);
            setExpandedRowKeys([]);
          }}
          formItems={searchTableFormItem()}
        />
        {isAdd && (
          <Button
            type='primary'
            onClick={async () => {
              history.push(
                virtualLinkTransform(
                  RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
                  [':pageInfoType', ':id', ':comparisonId'],
                  [PageInfoType.add, 'null', 'null'],
                ),
              );
            }}
          >
            {I18N.carbonFootprint.newReportAdded}
          </Button>
        )}
      </div>
      <div className={styles.tableContent}>
        <Spin spinning={downLoading}>
          <CommonTable<TableRow, { data: { rows: TableRow[]; total?: number } }>
            bordered={false}
            searchParams={searchParamsData}
            cRef={tableRef}
            pageSize={10}
            fetchApi={params =>
              // @ts-ignore
              GETc4a05d10319b2a78008d2f1bbb0677aa({
                ...params,
                pageNum: params.page,
                pageSize: params.size,
              })
            }
            returnFetchApi={({ data }) => ({
              data: data?.data?.rows,
              count: data?.data?.total || 0,
            })}
            expandable={{
              expandedRowKeys,
              expandedRowRender,
              onExpand: (expanded, record) => handleExpand(expanded, record),
            }}
            columns={[
              ...columns(),
              {
                title: I18N.carbonFootprint.operation,
                width: 220,
                dataIndex: 'action',
                fixed: 'right',
                render(_, row) {
                  return (
                    <TableActions
                      menus={compact([
                        checkPermissions(
                          {
                            label: I18N.carbonFootprint.generateReport,
                            key: I18N.carbonFootprint.generateReport,
                            onClick: async () => {
                              setDownLoading(true);
                              message.loading({
                                content: I18N.carbonFootprint3.generatingReport,
                                key: 'load',
                              });
                              getReportFile({
                                reportId: row.id,
                              }).then(({ data }) => {
                                setDownLoading(false);
                                if (data.data) {
                                  message.success({
                                    content:
                                      I18N.carbonFootprint3
                                        .successfullyGenerated,
                                    key: 'load',
                                  });
                                  saveAs(data.data.url, data.data.name);
                                }
                              });
                            },
                          },
                          'footprint3:report:create',
                        ),
                        checkPermissions(
                          {
                            label: I18N.carbonFootprint3.details,
                            key: I18N.carbonFootprint3.details,
                            onClick: async () => {
                              if (isEdit) {
                                history.push(
                                  virtualLinkTransform(
                                    RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
                                    [':pageInfoType', ':id', ':comparisonId'],
                                    [PageInfoType.edit, row.id, 'null'],
                                  ),
                                );
                              } else {
                                history.push(
                                  virtualLinkTransform(
                                    RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
                                    [':pageInfoType', ':id', ':comparisonId'],
                                    [PageInfoType.show, row.id, 'null'],
                                  ),
                                );
                              }
                            },
                          },
                          'footprint3:report:info',
                        ),
                        checkPermissions(
                          {
                            label: I18N.carbonFootprint.delete,
                            key: I18N.carbonFootprint.delete,
                            onClick: async () => {
                              await deleteTable(row);
                            },
                          },
                          'footprint3:report:delete',
                        ),
                      ])}
                    />
                  );
                },
              },
            ]}
            rowKey='id'
            scroll={{
              x: 1400,
            }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default CarbonFootPrint3Report;
