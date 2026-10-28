/*
 * @@description:选择因子
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-22 18:14:46
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 18:41:59
 */

import { FormActions } from '@src/components/FormActions';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { PageInfoType, PageInfoTypeName } from '@src/router/type';
import { Toast } from '@src/utils/Toast';
import {
  getFactorRecordData,
  useCacheFactorSearchRecord,
} from '@src/utils/addFactorRecord';
import { SerachCarbonFactorResult } from '@src/views/carbonFootprint/components/searchEmission/type';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import { apiCompanyAddCollect } from '@src/views/emission/organization/service';
import { useIndexColumn } from '@src/views/emission/utils';
import { apiSourceQueryFactor } from '@src/views/enterpriseCarbonAccount2/service';
import { FactorUse } from '@src/views/utils';
import { Button, Form, FormProps, Popconfirm } from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../../style.less';
import { Page } from '@src/components/Page';
import { formPropsInit } from '@src/components/FormUtil/util';
import { addFactorUse } from '@src/views/emission/utils/service';
import { searchKeyInSessionStorage } from '@src/views/enterpriseCarbonAccount2/utils';

const SupplierDashboardPage = () => {
  const history = useHistory();
  const path = history.location.pathname;
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const id = new URLSearchParams(window.location.search)?.get('id') || '';
  const type = new URLSearchParams(window.location.search)?.get('type') || '';

  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });
  const [reportCountries, setReportCountries] = useState<any>([]);

  /** 所属行业 */
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState({});

  /** 货品关联的搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form,
  };

  /** 客户管理 供应货品数量*/
  const columns = [
    { title: I18N.carbonFootprint.factorName, dataIndex: 'name', width: 120 },
    {
      title: I18N.carbonFootprint.specificationAndModel,
      dataIndex: 'specification',
      width: 110,
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.components.applicableScenarios,
      dataIndex: 'description',
      width: 100,
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.carbonFootprint.factorValue,
      width: 100,
      dataIndex: 'cValue',
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.carbonFootprint.unit,
      width: 120,
      dataIndex: 'unit',
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.carbonFootprint.yearOfPublication,
      width: 100,
      dataIndex: 'year',
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.carbonFootprint.publishingInstitution,
      width: 110,
      dataIndex: 'institution',
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.carbonFootprint.publishingCountryGroups,
      width: 140,
      dataIndex: 'countries',
      render: txt => <p>{txt}</p>,
    },
    {
      title: I18N.components.database,
      width: 110,
      dataIndex: 'factorUse',
      render: txt => (
        <p>
          {txt === '1'
            ? I18N.carbonFootprint.organizationalFactorLibrary
            : txt === '3' || txt === '2'
            ? I18N.carbonFootprint.emissionFactorLibrary
            : '--'}
        </p>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 160,
      dataIndex: 'optrtion',
      render: (txt, record) => (
        <>
          <Button
            type='link'
            onClick={() => {
              const computationId = sessionStorage.getItem('computationId');
              history.push(
                `${
                  computationId
                    ? RouteMaps.enterpriseCarbonAccountingcarbonDischargeFactorDetail
                    : RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountDicSelectFactorDetail
                }?id=${record.id}`,
              );
            }}
          >
            {I18N.carbonFootprint.check}
          </Button>
          {['3'].includes(record.factorUse) && (
            <Popconfirm
              title={
                Number(record.isCollectFactor) === 1
                  ? I18N.carbonFootprint.doYouWantToCancelTheCollection
                  : I18N.carbonFootprint.doYouWantToBookmarkThis
              }
              onConfirm={() => {
                apiCompanyAddCollect({ factorId: record.id }).then(
                  ({ data }) => {
                    if (data.code === 200) {
                      Toast(
                        'success',
                        I18N.carbonFootprint.operationSuccessful,
                      );
                      setSearchParamsData({
                        ...searchParamsData,
                        random: Math.random(),
                      });
                    }
                  },
                );
              }}
              okText={I18N.carbonFootprint.confirm2}
              cancelText={I18N.carbonFootprint.cancel}
            >
              <Button type='link' style={{ paddingLeft: 0 }}>
                {record.isCollectFactor === '1'
                  ? I18N.carbonFootprint.cancel
                  : ''}
                {I18N.carbonFootprint.collection}
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];
  const formItems: any = [
    {
      label: '',
      name: 'name',
      type: 'input',
      rules: true,
      placeholder: I18N.carbonFootprint.factorName,
      props: {
        style: { width: '260px', marginBottom: 10 },
      },
    },
    {
      label: '',
      name: 'description',
      type: 'input',
      rules: true,
      placeholder: I18N.components.applicableScenarios,
      props: {
        style: { width: '260px' },
      },
    },
    {
      label: '',
      name: 'year',
      type: 'date',
      rules: true,
      placeholder: I18N.carbonFootprint.yearOfPublication,
      props: {
        picker: 'year',
        style: { width: '260px' },
      },
    },
    {
      label: '',
      name: 'countries',
      type: 'select',
      rules: true,
      placeholder: I18N.carbonFootprint.publishingCountryGroups,
      props: {
        style: { width: '260px' },
        options: reportCountries,
      },
    },
    {
      label: I18N.components.database,
      name: 'factorType',
      type: 'checkbox',
      rules: false,
      placeholder: I18N.components.database,
      props: {
        placeholder: I18N.components.database,
        style: { width: '220px' },
        value: [1, 2],
        options: [
          { value: 1, label: I18N.carbonFootprint.emissionFactorLibrary },
          { value: 2, label: I18N.carbonFootprint.organizationalFactorLibrary },
        ],
      },
    },
  ];

  // 获取下拉框字典项
  const apiMnumListALLByDictTypeBatchFn = async () => {
    await apiMnumListALLByDictTypeBatch({
      dictTypes: `reportCountries`,
    }).then(({ data }) => {
      setReportCountries(
        data.data.reportCountries.map(item => ({
          value: item.dictValue,
          label: item.dictLabel,
        })),
      );
    });
  };
  /** 获取搜索栏中的单位 */
  const cachedFactorUnitM = useMemo(() => {
    // factorUnitM 存储在sessionStorage 中防止刷新后丢失
    let factorM = sessionStorage.getItem(searchKeyInSessionStorage);
    factorM =
      new URLSearchParams(location.search).get('factorUnitM') || factorM || '';
    sessionStorage.setItem(searchKeyInSessionStorage, factorM);
    return factorM;
  }, []);
  useEffect(
    () => () => {
      sessionStorage.removeItem(searchKeyInSessionStorage);
    },
    [],
  );
  /**  */
  const searchSupplySub = () => {
    const res = form.getFieldsValue();
    const factorType =
      res.factorType?.length === 1
        ? res.factorType.join(',')
        : res.factorType?.length === 2
        ? '3'
        : delete res.factorType;
    const data = {
      ...res,
      year: res.year && moment(res.year).format('YYYY'),
      factorType,
    };
    setSearchParamsData(data);
  };
  const resetBack = () => {
    setSearchParamsData({
      pageNum: 1,
      pageSize: 10,
      factorType: '3',
    });
    setTimeout(() => {
      form.setFieldsValue({
        factorType: [1, 2],
      });
    }, 100);
  };
  useEffect(() => {
    let name = new URLSearchParams(window.location.search)?.get('name') || '';

    name && (name = decodeURI(name));
    form.setFieldsValue({
      ...form.getFieldsValue(true),
      factorType: [1, 2],
      name,
    });
    apiMnumListALLByDictTypeBatchFn();
  }, []);

  // 选中的行数据
  const [selectedRow, setSelectedRow] = useState<SerachCarbonFactorResult>();
  const { searchRecord, setRecord } = useCacheFactorSearchRecord();
  const returnFetchApi = back => {
    setRecord({ data: back?.data?.data || [] });
    return {
      data: back.data.rows,
      count: back.data.total,
    };
  };

  return (
    <div className='enterprise-carbon-account2'>
      <Page
        styles={{ paddingLeft: 8 }}
        breadCrumbs={
          path ===
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountDicSelectFactor
            ? [
                {
                  title: I18N.enterpriseCarbonAccount2.carbonEmissionRepository,
                  key: I18N.enterpriseCarbonAccount2.carbonEmissionRepository,
                  href: RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList,
                },
                {
                  title:
                    type === 'edit'
                      ? I18N.carbonFootprint.editEmissionSources2
                      : I18N.carbonFootprint3.copyingEmissionSources,
                  key:
                    type === 'edit'
                      ? I18N.carbonFootprint.editEmissionSources2
                      : I18N.carbonFootprint3.copyingEmissionSources,
                  href: virtualLinkTransform(
                    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                    [PageInfoTypeName, ':id'],
                    [
                      type === 'edit' ? PageInfoType.edit : PageInfoType.copy,
                      id,
                    ],
                  ),
                },
                {
                  title: I18N.carbonFootprint3.chooseEmissionFactors,
                  key: I18N.carbonFootprint3.chooseEmissionFactors,
                },
              ]
            : [
                {
                  title: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  key: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  href: RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
                },
                {
                  title: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
                  key: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
                  href: `${
                    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionManage
                  }?computationId=${sessionStorage.getItem('computationId')}`,
                },
                {
                  title: I18N.carbonFootprint3.chooseEmissionFactors,
                  key: I18N.carbonFootprint3.chooseEmissionFactors,
                },
              ]
        }
      >
        <div className='product  padd-t-16' style={{ paddingLeft: 6 }}>
          <div style={{ marginBottom: 16 }}>
            <SearchFormUtil
              paddRight={4}
              antdFormProps={searchFormProps}
              formItems={formItems}
              searchSub={searchSupplySub}
              resetBack={resetBack}
            />
          </div>
          <CommonTable
            scroll={{ y: 'calc(100vh - 400px)' }}
            columns={[...indexColumn, ...columns]}
            fetchApi={async params => {
              setPage({ current: params.page, pageSize: params.size });
              const recordData = getFactorRecordData() || {};
              setRecord({ page: params.page, size: params.size });
              return apiSourceQueryFactor({
                ...recordData,
                pageSize: params.size,
                pageNum: params.page,
                name:
                  form.getFieldValue('name') ||
                  decodeURI(
                    new URLSearchParams(window.location.search)?.get('name') ||
                      '',
                  ),
                // productId: 'ecaccounting_model',
                productId: sessionStorage.getItem('productId'),
                computationId: sessionStorage.getItem('computationId'),
                factorType: '3',
                ...searchParamsData,
                factorUnitM: cachedFactorUnitM,
              });
            }}
            searchParams={searchParamsData}
            returnFetchApi={returnFetchApi}
            rowSelection={{
              type: 'radio',
              selectedRowKeys,
              onChange: (
                selectedRowKeys: React.Key[],
                selectRows: SerachCarbonFactorResult[],
              ) => {
                setRecord({ checkedKey: selectedRowKeys[0] });
                setSelectedRowKeys(selectedRowKeys);
                setSelectedRow(selectRows[0]);
              },
            }}
          />

          <FormActions
            place='center'
            buttons={[
              {
                type: 'primary',
                title: I18N.carbonFootprint.confirm2,
                onClick: async () => {
                  const factor = selectedRow;

                  // 添加因子使用记录
                  if (factor?.id && factor?.factorUse) {
                    addFactorUse({
                      factorSource:
                        factor.factorUse === FactorUse.organization
                          ? FactorUse.organization
                          : FactorUse.carbonstop,
                      factorId: factor.id,
                      factorName: factor.name || '',
                      // @ts-ignore  /FIXME - 后端接口变化后同步修改
                      checkIndex: searchRecord.checkedIndex,
                      searchId: getFactorRecordData()?.getFactorDataUid,
                    });
                  }
                  sessionStorage.setItem(
                    'factorId',
                    selectedRowKeys.toString(),
                  );
                  history.goBack();
                },
              },
              {
                type: 'default',
                title: I18N.carbonFootprint.cancel,
                onClick: async () => {
                  history.goBack();
                },
              },
            ]}
          />
        </div>
      </Page>
    </div>
  );
};
export default SupplierDashboardPage;
