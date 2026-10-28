/**
 * 选择产品
 */

import I18N from '@src/lang/I18N';
import { formItemInitType, formPropsInit } from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import { Button, Form, Table } from 'antd';
import { ReactNode, VFC, useEffect, useRef, useState } from 'react';

import style from './index.module.less';
import { ProductAccountingList } from '../../FootprintAccount/component/ProductSelectAccount/type';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountStatusType,
} from '../../FootprintAccount/constant';
import { getAccountProductData } from '../../FootprintAccount/service';
import { AccountProductData } from '../../FootprintAccount/type';
import { getCommonAccountListData } from '../../service';
import TextWidthOverflow from '../TextOverflowTable/byWidth';
import './index.less';

type SelectProductAccountProps = {
  // 核算类型
  accountType?: number;
  // 禁止选中的核算id
  accountIds?: number[];
  subSelect: (items: ProductAccountingList[]) => void;
  cancel: () => void;
};

type SelectProductAccountParams = {
  productId?: number;
  accountId?: number;
};

const commonFormItemProps = {
  style: { width: 300 },
};

const { QUICK } = FootprintAccountStatusType;

export const SelectProductAccount: VFC<SelectProductAccountProps> = ({
  subSelect,
  cancel,
  accountType,
  accountIds,
}) => {
  const [searchForm] = Form.useForm<SelectProductAccountParams>();

  const [searchParams, setSearchParams] =
    useState<SelectProductAccountParams>();

  /** 表格分页信息 */
  const [pageParams, setPageParams] = useState<{
    pageNum: number;
    pageSize: number;
    total: number;
  }>({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * 获取接口的产品列表
   */
  const [productOptions, setProductOptions] = useState<AccountProductData[]>();

  /** 表格产品列表 */
  const [tableData, setTableData] = useState<ProductAccountingList[]>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);

  /** 切换分页保存选中数据 */
  const prevSelectedRowsRef = useRef<ProductAccountingList[]>([]);

  const [, setSelectTableRows] = useState<ProductAccountingList[]>([]);

  /**
   * 功能单位的列表
   */
  const [accountOptions, setAccountOptions] =
    useState<ProductAccountingList[]>();

  const searchFormProps = {
    ...formPropsInit(),
    layout: 'inline' as const,
    form: searchForm,
    // initialValues: {
    //   name: searchParams?.name || null,
    // },
  };

  /**
   * 产品名称的自定下拉
   * @param listInfo 产品的信息
   */
  const listProductNode = (listInfo: AccountProductData): ReactNode => (
    <div className='selectProductAccountMain'>
      <div>
        <TextWidthOverflow width={260} value={listInfo.productName} />
      </div>

      <div className='optionNodeDate'>{listInfo.specification || '-'}</div>
    </div>
  );

  /**
   * 功能单位的设置
   * @param listInfo 功能单位信息
   * @returns
   */
  const listAccountNode = (listInfo: ProductAccountingList): ReactNode => (
    <div className='selectProductAccountMain'>
      <div>
        <TextWidthOverflow width={230} value={listInfo.accountName} />
      </div>

      <div className='optionNodeDate'>
        {listInfo.startTime}
        {I18N.carbonFootprint.to}
        {listInfo.endTime}
      </div>
      <div
        className={`optionNodeType ${
          String(listInfo.type) === String(QUICK)
            ? 'optionNodeTypeQuick'
            : 'optionNodeTypeProcess'
        }`}
      >
        {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[listInfo.type]}
      </div>
    </div>
  );

  /**
   * 选中产品
   * @param selectProductId 选中的产品id
   */
  const selectProductName = async (selectProductId: number) => {
    const { data } = await getCommonAccountListData({
      productId: selectProductId,
      pageNum: 1,
      pageSize: 9999,
      type: accountType,
    });
    searchForm.setFieldsValue({
      accountId: undefined,
    });
    setAccountOptions(data.data.rows);
  };

  /**
   * 选中的核算
   * @param item 核算信息
   */
  // const handleSelectChange = (item: ProductAccountingList) => {
  //   console.log(item);
  // };

  useEffect(() => {
    setTableLoading(true);
    getAccountProductData({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;
      setProductOptions(enumData);
    });

    getCommonAccountListData({
      pageNum: 1,
      pageSize: 9999,
      type: accountType,
    }).then(back => {
      setPageParams({
        ...pageParams,
        total: back.data.data.total,
      });
      setAccountOptions(back.data.data.rows);
      setTableData(
        back.data.data.rows.filter((res, resIndex) => resIndex < 10),
      );

      setTableLoading(false);
    });
  }, []);

  const sub = () => {
    subSelect(prevSelectedRowsRef.current);
  };

  useEffect(() => {
    setTableLoading(true);
    getCommonAccountListData({
      pageNum: 1,
      pageSize: 10,
      type: accountType,
      id: searchParams?.accountId,
      productId: searchParams?.productId,
    }).then(back => {
      setPageParams({
        ...pageParams,
        total: back.data.data.total,
      });
      setTableData(back.data.data.rows);

      setTableLoading(false);
    });
  }, [searchParams]);

  return (
    <div className={style.selectProductAccount}>
      <div className='m-t-16'>
        <SearchFormUtil
          useSearch={false}
          antdFormProps={searchFormProps}
          searchSub={() => {
            setSearchParams({
              ...searchParams,
              ...searchForm.getFieldsValue(),
            });
          }}
          resetBack={() => setSearchParams({})}
          formItems={[
            {
              ...formItemInitType('select', '', 'productId', false),
              props: {
                ...commonFormItemProps,
                placeholder: I18N.carbonFootprint.productName,
                options: productOptions?.map(opt => ({
                  label: opt.productName,
                  value: opt.id,
                  productNodeName: listProductNode(opt),
                  productName: opt.productName,
                })),
                allowClear: true,
                showSearch: true,
                optionLabelProp: 'productName',
                fieldNames: {
                  label: 'productNodeName',
                },
                filterOption: (input, option) =>
                  (option?.productName ?? '').includes(input),
                onSelect: async (val: number) => selectProductName(val),
              },
            },
            {
              ...formItemInitType('select', '', 'accountId', false),
              props: {
                ...commonFormItemProps,
                placeholder: I18N.carbonFootprint3.functionalUnits,
                options: accountOptions?.map(opt => ({
                  label: opt.accountName,
                  value: opt.id,
                  accountNodeName: listAccountNode(opt),
                  accountName: opt.accountName,
                })),
                allowClear: true,
                showSearch: true,
                optionLabelProp: 'accountName',
                fieldNames: {
                  label: 'accountNodeName',
                },
                filterOption: (input, option) =>
                  (option?.label ?? '').includes(input),
              },
            },
          ]}
        />
      </div>
      <div className='m-t-16'>
        <Table<ProductAccountingList>
          rowSelection={{
            type: 'checkbox',
            hideSelectAll: true,
            selectedRowKeys: prevSelectedRowsRef.current.map(row => row.id),
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectTableRows(selectedRows);
            },
            onSelect: (record, selected) => {
              // 取消选中
              if (selected === false) {
                prevSelectedRowsRef.current =
                  prevSelectedRowsRef.current.filter(
                    refRow => refRow.id !== record.id,
                  );
              } else {
                prevSelectedRowsRef.current.push(record);
              }
            },
            getCheckboxProps: record => ({
              disabled: accountIds?.includes(record.id),
            }),
          }}
          columns={[
            {
              title: I18N.carbonFootprint3.productNameSpecification,
              width: 250,
              dataIndex: 'productName',
              render: (val, item) => (
                <div>
                  <TextWidthOverflow width={260} value={item.productName} />
                  <div className={style.tableSpec}>
                    <TextWidthOverflow width={260} value={item.specification} />
                  </div>
                </div>
              ),
            },
            {
              title: I18N.carbonFootprint3.functionalUnitCore2,
              width: 300,
              dataIndex: 'accountName',
              render: (val, item) => (
                <div>
                  <TextWidthOverflow width={260} value={item.accountName} />
                  <div className={style.tableSpec}>
                    <TextWidthOverflow
                      width={260}
                      value={I18N.template(I18N.carbonFootprint3.items5, {
                        val1: item.startTime,
                        val2: item.endTime,
                      })}
                    />
                  </div>
                </div>
              ),
            },
            {
              title: I18N.carbonFootprint3.accountingMethod,
              width: 120,
              dataIndex: 'type',
              render: (val: number) => {
                const commCss: React.CSSProperties = {
                  width: 64,
                  height: 24,
                  fontSize: 12,
                  borderRadius: 4,
                  marginRight: 8,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                };
                const typeCustomStyle: React.CSSProperties =
                  val === QUICK
                    ? {
                        ...commCss,
                        color: '#3491FA',
                        background: '#F0F9FF',
                        border: '1px solid #B0DDFF',
                      }
                    : {
                        ...commCss,
                        color: '#0CBF9F',
                        background: '#E6FFF6',
                        border: '1px solid #AAF2DB',
                      };
                return (
                  <div style={typeCustomStyle}>
                    {FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[val]}
                  </div>
                );
              },
            },

            {
              title: I18N.carbonFootprint3.unitEmissions,
              width: 200,
              dataIndex: 'factor',
              render: (val, item) => (
                <div>
                  <div
                    style={{
                      color: '#0CBF9F',
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {item.factor}
                  </div>
                  <div
                    style={{
                      color: '#999EA4',
                      fontSize: 12,
                    }}
                  >
                    {item.factorUnit}
                  </div>
                </div>
              ),
            },
          ]}
          dataSource={tableData}
          pagination={{
            position: ['bottomLeft'],
            total: pageParams.total,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize,
            onChange: (page, pageSize) => {
              setPageParams({
                ...pageParams,
                pageNum: page,
                pageSize,
              });

              setTableLoading(true);
              getCommonAccountListData({
                pageNum: page,
                pageSize,
                type: accountType,
                id: searchParams?.accountId,
                productId: searchParams?.productId,
              }).then(back => {
                setTableData(back.data.data.rows);

                setTableLoading(false);
              });
            },
          }}
          rowKey='id'
          loading={tableLoading}
          scroll={{ y: 500 }}
        />
      </div>
      <div className={style.footerBtns}>
        <Button onClick={cancel}>{I18N.carbonFootprint.cancel}</Button>
        <Button type='primary' className='m-l-8' onClick={sub}>
          {I18N.carbonFootprint3.confirmSelection}
        </Button>
      </div>
    </div>
  );
};
