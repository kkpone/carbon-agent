/*
 * @@description:
 */
/**
 * @file 因子库
 */

import I18N from '@src/lang/I18N';
import BaseTable from '@components/BaseTable';
import TableEditTsx from '@components/TableEditTsx';
import TableTitle from '@components/TableTitle';
import { RouteMaps } from '@src/router/route-paths';
import { RootState } from '@src/store';
import style from '@src/styles/global.module.scss';
import { querystringToObject, updateUrl } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { COMPANY_ID } from '@src/utils/consts';
import VerifyUtils from '@utils/verifty';
import { Form, Input, Button, Col, Row, Space, Select, DatePicker } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classnames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  apiListCarbonstopFactor,
  AddUserType,
  apiCompanyAddCollect,
} from './service';
import { apiMnumListALLByDictTypeBatch } from '../Show/service';
import {
  apiQueryActivityTimes,
  ApiQueryActivityTimesDataType,
} from '../organization/service';
import { getEmissionFactorColumns, useIndexColumn } from '../utils';
import { EmissionFactorMenu } from '../utils/index-type';

export type SearchStaffsFromType = {
  search?: string;
  page: number;
  page_size: number;
  pk?: null | string;
  user_name?: null | string;
  name?: null | string;
  userName?: null | string;
  employPhone?: null | string;
  roles_list?: null | string;
  ucType?: null | string;
};
export interface Column {
  companyId: null | string | number;
  delflag: number;
  depId: null | number;
  departmentId: number;
  departmentName: string;
  id: number;
  page: number;
  password: string;
  permissionSet: null | number;
  permissions: null | number;
  roleId: null | number;
  roleIds: null | number;
  roleName: null | number;
  roles: {
    id: null | string;
    roleId: number;
    roleName: string;
    roleInfo: null | string;
  }[];
  salt: null;
  sex: null;
  size: number;
  sort: null;
  status: number;
  ucStatus: number;
  userId: number;
  userName: string;
  ucType: number | string;
  employPhone?: null | string | number;
  employName?: null | string | number;
  udId: null | string;
  isCollectFactor: number;
  type: string;
  factorPattern: string;
}
/** *
 * 操作
 */
const GetActionContentArray = (record: Column) =>
  // 编辑暂时放掉注释掉
  [
    {
      btn_title: I18N.carbonFootprint3.details,
      type: 'edit',
      color: style.textGreen,
      is_pop: false,
      flag: 'system:factor:query',
    },
    Number(record.isCollectFactor) === 0
      ? {
          btn_title: I18N.carbonFootprint.collection,
          color: style.textGreen,
          is_pop: false,
          is_switch: true,
          type: 'addCollect',
          flag: 'system:collect:addCollect',
        }
      : {
          btn_title: I18N.carbonFootprint.cancelFavorite,
          color: style.textGreen,
          is_pop: false,
          is_switch: true,
          type: 'addCollect',
          flag: 'system:collect:addCollect',
        },
  ];
export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
}[];

export interface QueryByPage {
  [key: string]: any;

  keywords: string;
  pageNum: number;
  pageSize: number;
}

const Orgstaff: FC = () => {
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const [staffsFrom] = Form.useForm<AddUserType>(); // 新增员工 表单
  const [isLoading, changeIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [size, setPageSize] = useState<number>(10);
  const [pageCount, setCount] = useState(0); // 设置总条数
  const [staffDataSource, getDataSource] = useState<Column[]>([]); // 列表数据
  const [searchForm] = Form.useForm<{ keywords: string }>(); //  搜索from实例
  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
    keywords: '',
  });
  const [formSelects, setFormSelects] = useState<EmissionFactorMenu>({});
  // 获取剩余次数
  const [queryDegreeData, getQueryDegreeData] =
    useState<ApiQueryActivityTimesDataType>({
      companyId: null,
      queryDegree: null,
      countsType: 1,
    });
  // const [isSearch, getIsSearch] = useState(false);
  const history = useHistory();
  sessionStorage.setItem('url', window.location.pathname);
  // 定义 搜索面板 相关搜索项
  const renderSearchFormDate = [
    {
      label: I18N.carbonFootprint.name,
      name: 'keywords',
      type: 'input',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      required: true,
      tableType: 'number',
      controls: false,
    },
    {
      label: I18N.components.applicableScenarios,
      name: 'description',
      type: 'input',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      required: true,
      controls: false,
    },
    {
      label: I18N.carbonFootprint.publishingInstitution,
      name: 'institution',
      type: 'input',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      required: true,
      tableType: 'number',
      controls: false,
    },
    {
      label: I18N.carbonFootprint.publishingCountryGroups,
      name: 'countries',
      type: 'select',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      required: true,
      tableType: 'number',
      controls: false,
      option: [...(formSelects.reportCountries || [])],
    },
    {
      label: I18N.carbonFootprint.yearOfPublication,
      name: 'year',
      type: 'year',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      required: true,
      tableType: 'number',
      controls: false,
    },
    // {
    //   label: '审核状态',
    //   name: 'auditStatus',
    //   type: 'select',
    //   placeholder: '请输入',
    //   required: true,
    //   tableType: 'number',
    //   controls: false,
    //   option: [
    //     {
    //       value: 0,
    //       label: '待审核',
    //     },
    //     {
    //       value: 1,
    //       label: '审核通过',
    //     },
    //     {
    //       value: 2,
    //       label: '审核不通过',
    //     },
    //   ],
    // },
  ];
  const itemRule = (item: { label: string }) => {
    if ([I18N.emission.carbonAccount].indexOf(item.label) >= 0) {
      return [
        {
          pattern: /^1[3456789]\d{9}$/,
          message: I18N.template(I18N.emission.inputCorrectI, { val1: item.label }),
        },
      ];
    }
    if ([I18N.carbonFootprint3.contactInformation].indexOf(item.label) >= 0) {
      return [
        {
          pattern: /^((0\d{2,3}-\d{7,8})|(1[3679584]\d{9}))$/,
          message: I18N.dashborad.enterTheCorrectHand,
        },
      ];
    }
    return [];
  };
  const renderSearchForm = () => {
    const arr = renderSearchFormDate?.map(item => {
      if (item?.type === 'input') {
        return (
          <Col
            xxl={4}
            md={6}
            xl={6}
            key={`${item.name}Search`}
            aria-label={item.name}
            style={{
              paddingRight: '0',
              paddingBottom: '20px',
            }}
          >
            <Form.Item
              key={`${item.name}SearchItem`}
              aria-label={item.name}
              name={item.name}
              label={item.label}
              rules={itemRule(item)}
            >
              <Input
                placeholder={item.placeholder}
                style={{ minWidth: '120px' }}
              />
            </Form.Item>
          </Col>
        );
      }
      if (item?.type === 'select') {
        return (
          <Col
            xxl={4}
            md={6}
            xl={6}
            key={`${item.name}Search`}
            style={{
              paddingRight: '0',
              paddingBottom: '20px',
            }}
          >
            <Form.Item
              key={`${item.name}SearchItem`}
              name={item.name}
              label={item.label}
              rules={itemRule(item)}
            >
              <Select
                placeholder={item.placeholder}
                style={{ minWidth: '120px', width: '100%' }}
                options={item?.option?.map(t => ({
                  value: t.dictValue || t.value,
                  label: t.dictLabel || t.label,
                }))}
              />
            </Form.Item>
          </Col>
        );
      }
      if (item.type === 'year') {
        return (
          <Col
            xxl={4}
            md={6}
            xl={6}
            key={`${item.name}Search`}
            aria-label={item.name}
            style={{
              paddingRight: '0',
              paddingBottom: '20px',
            }}
          >
            <Form.Item
              name={item.name}
              aria-label={item.name}
              label={item.label}
              labelAlign='right'
            >
              <DatePicker
                style={{ width: '100%' }}
                picker='year'
                disabledDate={current => current.isAfter(Date.now())}
              />
            </Form.Item>
          </Col>
        );
      }
      return [];
    });
    return arr;
  };
  /** *
   * 清空 抽屉表单 数据
   *
   */
  const clearStaffsFrom = () => {
    staffsFrom.setFieldsValue({
      userName: null,
      employPhone: null,
      roleIds: [],
      employName: null,
      departmentId: null,
    });
  };
  // 获取剩余次数
  const apiQueryActivityTimesFn = async () => {
    await apiQueryActivityTimes().then(({ data }) => {
      getQueryDegreeData({ ...data.data });
    });
  };
  const apiQueryByPageTypeFn = async (value: QueryByPage) => {
    setPage(value.pageNum);
    setPageSize(value.pageSize);
    changeIsLoading(true);
    const obj = {
      ...value,
      year: value?.year ? value?.year?.format('YYYY') : '',
    };
    try {
      const { data } = await apiListCarbonstopFactor({
        ...obj,
      });

      if (data?.code === 601) {
        Toast('error', data?.msg);
      }
      if (data.code === 200) {
        getDataSource(data.rows);
        setCount(data.total);
      }
      changeIsLoading(false);
      apiQueryActivityTimesFn();
    } catch (error) {
      changeIsLoading(false);
      apiQueryActivityTimesFn();
    }
  };

  const orderColumn = useIndexColumn<Column>((page - 1) * size);
  const columns: ColumnsType<Column> = [
    ...orderColumn,
    ...getEmissionFactorColumns<Column>(),
    {
      title: I18N.carbonFootprint.operation,
      key: 'action',
      width: '160px',
      fixed: 'right',
      render: (record: Column) => (
        <TableEditTsx<Column>
          get_action_data={GetActionContentArray(record)}
          record={record}
          onHandelType={async values => {
            if (selector?.userInfo?.username) {
              if (values.btn_title && [I18N.carbonFootprint3.details].indexOf(values.btn_title) >= 0) {
                history.push(
                  `${RouteMaps.emissionCarbonStopDetail}?emissionId=${record.id}&factorUse=2`,
                );
              }
              if (values.btn_title && [I18N.carbonFootprint.edit].indexOf(values.btn_title) >= 0) {
                history.push(
                  `${RouteMaps.emissionOrganizationEdit}?emissionId=${record.id}`,
                );
              }
              if (values.btn_title && values.btn_title.indexOf(I18N.carbonFootprint.collection) >= 0) {
                await apiCompanyAddCollect({
                  factorId: `${record.id}`,
                  companyId: Number(localStorage.getItem(COMPANY_ID))
                    ? Number(localStorage.getItem(COMPANY_ID))
                    : 0,
                }).then(({ data }) => {
                  if (data.code === 200) {
                    apiQueryByPageTypeFn({
                      keywords: searchForm.getFieldValue('keywords'),
                      pageNum: 1,
                      pageSize: searchParams.pageSize || 10,
                    });
                  }
                  VerifyUtils.Toast(data.code as 200, data.msg);
                });
              }
            }
          }}
        />
      ),
    },
  ];
  // 获取下拉框字典项
  const apiMnumListALLByDictTypeBatchFn = async () => {
    await apiMnumListALLByDictTypeBatch({
      dictTypes: `reportCountries`,
    }).then(({ data }) => {
      setFormSelects({ ...data.data });
    });
  };

  useEffect(() => {
    const searchObj = querystringToObject();
    if (Object.keys(searchObj).length) {
      setSearchParams(searchObj);
      if ('pageNum' in searchObj && 'pageSize' in searchObj) {
        searchForm.setFieldsValue(searchObj);
        apiQueryByPageTypeFn(searchObj);
      }
    }
    apiMnumListALLByDictTypeBatchFn();
    // 获取剩余次数
    apiQueryActivityTimesFn();
  }, []);
  useEffect(() => {
    Object.keys(searchParams).forEach((key: string) => {
      // @ts-ignore
      updateUrl(key, searchParams[key]);
    });
  }, [searchParams]);
  const returnPermistion = () =>
    Number(queryDegreeData.countsType) === 2
      ? Number(queryDegreeData.queryDegree) <= 0
      : false;
  return (
    <div className='childHeight'>
      <div className={classnames('Dashboard', style.searchBackground)}>
        <TableTitle
          title={I18N.carbonFootprint.emissionFactorLibrary}
          onClickFn={() => {
            clearStaffsFrom();
          }}
          queryDegreeData={queryDegreeData}
        />
        <Row
          // className={style.padding}
          gutter={{ xs: 8, sm: 16, md: 24 }}
          style={{ width: '100%', paddingBottom: '0' }}
        >
          <Form
            form={searchForm}
            validateTrigger='onChange'
            layout='inline'
            onFinish={async value => {
              setSearchParams({ ...searchParams, keywords: value.keywords });

              await apiQueryByPageTypeFn({
                ...value,
                keywords: value.keywords,
                pageNum: 1,
                pageSize: searchParams.pageSize || 10,
              });
            }}
            style={{ width: '100%' }}
          >
            {renderSearchForm()}
            <Col
              style={{
                paddingLeft: '30px',
                paddingRight: '0',
              }}
            >
              <Space>
                <Button
                  htmlType='submit'
                  disabled={returnPermistion()}
                  type='primary'
                >
                  {I18N.carbonNeutral.query}</Button>
                <Button
                  disabled={returnPermistion()}
                  onClick={async () => {
                    searchForm.resetFields();
                    await apiQueryByPageTypeFn({
                      pageNum: 1,
                      pageSize: searchParams.pageSize || 10,
                      keywords: '',
                    });
                  }}
                >
                  {I18N.carbonFootprint3.reset}</Button>
              </Space>
            </Col>
          </Form>
        </Row>
      </div>
      <div
        className={classnames(
          'Dashboard',
          // style.marginTop,
          style.searchBackground,
        )}
      />
      <Row>
        <Col span={24}>
          <BaseTable<Column>
            columns={columns}
            loading={isLoading}
            scroll={{ x: '1400px' }}
            data={{
              list: staffDataSource,
              page: {
                page,
                size,
                dataTotal: pageCount,
              },
            }}
            rowKey='pk'
            onChange={async pageParams => {
              await apiQueryByPageTypeFn({
                ...searchForm.getFieldsValue(true),
                pageNum: pageParams.current ? pageParams.current : 1,
                pageSize: pageParams.pageSize ? pageParams.pageSize : 10,
              });
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Orgstaff;
