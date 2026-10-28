/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-15 10:05:45
 * @Date: 2023-01-10 11:32:41
 * @@description: 匹配因子
 */
import { listALLByDictTypeBatch } from '@src/api/api';
import { FeedBackModal } from '@src/components/Factor/FeedBackModal';
import { FeedBackType } from '@src/components/Factor/utils';
import { FormActions } from '@src/components/FormActions';
import { FromItemProps, FromItemTypeBack } from '@src/components/FormUtil/type';
import { formPropsInit } from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { GetLocalStorageProductId } from '@src/utils/store';
import { Dicts } from '@src/views/emission/Show/type';
import { apiCompanyAddCollect } from '@src/views/emission/organization/service';
import { addFactorUse } from '@src/views/emission/utils/service';
import { FactorUse } from '@src/views/utils';
import { Checkbox, Form, FormProps, Popconfirm } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import Modal from 'antd/lib/modal/Modal';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import SearchFactorDetail from './FactorDetail';
import style from './index.module.less';
import {
  carbonFootprintSearchEmission,
  carbonFootprintSearchEmissionCol,
} from './model';
import { getSerachCarbonFactorTable } from './service';
import {
  SearchFactorProps,
  SerachCarbonFactorEmissionParams,
  SerachCarbonFactorResult,
  SerachCarbonFactorResultDataApi,
} from './type';

const SearchFactor = (props: SearchFactorProps) => {
  /** TODO import { searchItems, useCacheQueryKey } from './utils';  该因子组件需要同步的方法 */

  const { subClick, onCancel, factorUnitM, AdditionalParams } = props;
  const history = useHistory();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();
  /** 是否显示因子详情弹框 */
  const [showFactorDetail, setShowFactorDetail] = useState<boolean>(false);

  /** 是否显示因子详情弹框 */
  const [factorData, setFactorData] = useState<SerachCarbonFactorResult>();

  /** 反馈给我们的弹框 */
  const [feedBackModalVisible, setFeedBackModalVisible] = useState(false);

  /** 当前国家的字典值 */
  const [, setReportCountries] = useState<Dicts[]>();

  /** 表格选中的数据 */
  const [selectedRowData, setSelectedRowData] =
    useState<SerachCarbonFactorResult>();

  /** 表格选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 选中的数据库 */
  const [emissionSql, setEmissionSql] = useState<CheckboxValueType[]>([
    '1',
    '2',
  ]);

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<SerachCarbonFactorEmissionParams>({
      pageNum: 1,
      pageSize: 10,
      factorType: '3',
      factorUnitM,
      productId: GetLocalStorageProductId(),
      ...AdditionalParams,
    });
  /** 动态设置表头 */
  const [columns, setColumns] = useState<ColumnsType<SerachCarbonFactorResult>>(
    [],
  );

  /** 当前添加的表单弹框Item */
  const [formItem, setFormItem] = useState<
    FromItemProps<keyof FromItemTypeBack>[]
  >(carbonFootprintSearchEmission());
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /** 搜索 */
  const searchSub = () => {
    const val: SerachCarbonFactorEmissionParams = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };
  /** 重置 */
  const resetBack = () => {
    setSearchParamsData({
      pageNum: 1,
      pageSize: 10,
      factorType: '3',
      productId: GetLocalStorageProductId(),
      ...AdditionalParams,
    });
  };

  /** 确认提交 */
  const subForm = async () => {
    if (selectedRowData) {
      const factor = selectedRowData;
      // 添加因子使用记录
      if (factor?.id && factor?.factorUse) {
        addFactorUse({
          factorSource:
            factor.factorUse === FactorUse.organization
              ? FactorUse.organization
              : FactorUse.carbonstop,
          factorId: factor.id,
          factorName: factor.name || '',
        });
      }

      // 去除掉url 因为url携带特殊字符会阻断JSON
      if (selectedRowData && selectedRowData.url) {
        delete selectedRowData.url;
      }

      await subClick(selectedRowData);
      // sessionStorage.setItem('selectEmission', JSON.stringify(selectedRowData));
    }
    // setTimeout(() => {
    //   setSubLoading(false);
    //   history.goBack();
    // }, 200);
  };
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<SerachCarbonFactorResultDataApi>>,
  ) => {
    const rowData = back.data.data.rows;
    if (rowData && rowData.length > 0) {
      setSelectedRowData(rowData[0]);
      setSelectedRowKeys([rowData[0].id]);
    } else {
      setSelectedRowData(undefined);
      setSelectedRowKeys([]);
    }

    return {
      data: rowData,
      count: back.data.data.total,
    };
  };
  /**
   * 当前选中的表格数据
   * @param newSelectedRowKeys 当前选中的key
   */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: SerachCarbonFactorResult[],
  ) => {
    setSelectedRowData(selectedRows[0]);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  /** 表格选中 */
  const rowSelection: TableRowSelection<SerachCarbonFactorResult> = {
    selectedRowKeys,
    type: 'radio',
    fixed: true,
    columnWidth: 70,
    onChange: onSelectChange,
  };

  /**
   * 初始化表头设置国家信息
   * @param arr 表头
   */
  const initColumns = (
    arr: {
      label: string;
      value: string;
    }[],
  ) => {
    const columnsDefult = carbonFootprintSearchEmissionCol(arr);
    /** 表头 */
    const columnsSet: ColumnsType<SerachCarbonFactorResult> = [
      {
        title: I18N.carbonFootprint.operation,
        width: '150px',
        dataIndex: 'set',
        fixed: 'right',
        render: (val: string, item: SerachCarbonFactorResult) => (
          <div>
            <span
              onClick={() => {
                setFactorData(item);
                setShowFactorDetail(true);
              }}
              className={`${style.primaryColorFont} ${style.cursorPointerFont} m-r-10`}
            >
              {I18N.carbonFootprint.check}
            </span>
            {['3'].includes(item.factorUse) && (
              <Popconfirm
                title={
                  Number(item.isCollectFactor) === 1
                    ? I18N.carbonFootprint.doYouWantToCancelTheCollection
                    : I18N.carbonFootprint.doYouWantToBookmarkThis
                }
                onConfirm={() => {
                  apiCompanyAddCollect({ factorId: item.id }).then(
                    ({ data }) => {
                      if (data.code === 200) {
                        Toast(
                          'success',
                          I18N.carbonFootprint.operationSuccessful,
                        );
                        childRef.current?.reset();
                      }
                    },
                  );
                }}
                okText={I18N.carbonFootprint.confirm2}
                cancelText={I18N.carbonFootprint.cancel}
              >
                <span
                  className={`${style.primaryColorFont} ${style.cursorPointerFont}`}
                >
                  {item.isCollectFactor === '1'
                    ? I18N.carbonFootprint.cancelFavorite
                    : I18N.carbonFootprint.collection}
                </span>
              </Popconfirm>
            )}
          </div>
        ),
      },
    ];

    setColumns([...columnsDefult, ...columnsSet]);
  };

  /**
   * 初始化
   */
  const init = () => {
    listALLByDictTypeBatch<{ reportCountries: Dicts[] }>({
      dictTypes: 'reportCountries',
    }).then(({ data }) => {
      const arr = data.data.reportCountries.map(dic => ({
        label: dic.dictLabel,
        value: dic.dictValue,
      }));
      setFormItem(carbonFootprintSearchEmission());
      setReportCountries(data.data.reportCountries);
      initColumns(arr);
    });
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div className={style.technologySearchEmission}>
      <div>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          searchSub={() => searchSub()}
          resetBack={resetBack}
          formItems={formItem}
        />
      </div>
      <div className='m-t-6'>
        <span>{I18N.carbonFootprint.source}</span>
        <Checkbox.Group
          value={emissionSql}
          onChange={value => {
            if (value.length === 0) {
              Toast('warn', I18N.carbonFootprint.chooseAtLeastOne);
            } else {
              setEmissionSql(value);
              if (value.length === 2) {
                setSearchParamsData({
                  ...searchParamsData,
                  factorType: '3',
                });
              } else {
                setSearchParamsData({
                  ...searchParamsData,
                  factorType: value[0] as string,
                });
              }
            }
          }}
        >
          <Checkbox value='1'>
            {I18N.carbonFootprint.emissionFactorLibrary}
          </Checkbox>
          <Checkbox value='2'>
            {I18N.carbonFootprint.organizationalFactorLibrary}
          </Checkbox>
        </Checkbox.Group>
      </div>
      <div className='m-t-16'>
        <CommonTable<
          SerachCarbonFactorResult,
          any,
          SerachCarbonFactorEmissionParams
        >
          bordered={false}
          rowSelection={rowSelection}
          searchParams={searchParamsData}
          cRef={childRef}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <div>
                {I18N.carbonFootprint.noSearchResultsYet}
                <span
                  style={{ color: '#0CBF9F', cursor: 'pointer' }}
                  aria-label='factor-fallback'
                  onClick={() => setFeedBackModalVisible(true)}
                >
                  {I18N.carbonFootprint.feedbackToUs}
                </span>
              </div>
            ),
          }}
          pageSize={10}
          fetchApi={params => {
            const paramData = {
              ...searchParamsData,
              ...params,
              pageNum: params.page,
              pageSize: params.size,
            };
            return getSerachCarbonFactorTable(paramData);
          }}
          returnFetchApi={returnFetchApi}
          columns={columns}
          rowKey='id'
          pagePosition={false}
        />
      </div>
      <FeedBackModal
        type={FeedBackType.factor}
        visible={feedBackModalVisible}
        onCancel={() => {
          setFeedBackModalVisible(false);
        }}
        onOk={() => {
          setFeedBackModalVisible(false);
        }}
      />
      <Modal
        title={I18N.components.emissionFactorsDetailed}
        width={1200}
        maskClosable={false}
        getContainer={false}
        visible={showFactorDetail}
        cancelText={I18N.carbonFootprint3.close}
        okButtonProps={{
          style: {
            display: 'none',
          },
        }}
        onCancel={() => setShowFactorDetail(false)}
      >
        {factorData && <SearchFactorDetail id={factorData.id} />}
      </Modal>
      <div>
        <FormActions
          place='center'
          buttons={[
            {
              type: 'primary',
              disabled: !selectedRowData,
              title: I18N.carbonFootprint.confirm,
              onClick: async () => subForm(),
            },
            {
              title: I18N.carbonFootprint.cancel,
              onClick:
                typeof onCancel === 'function'
                  ? onCancel
                  : async () => {
                      history.goBack();
                    },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default SearchFactor;
