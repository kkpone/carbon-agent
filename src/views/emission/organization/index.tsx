/**
 * @file 组织因子库
 */

import BaseTable from '@components/BaseTable';
import TableEditTsx from '@components/TableEditTsx';
import TableTitle from '@components/TableTitle';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { RootState } from '@src/store';
import style from '@src/styles/global.module.scss';
import { querystringToObject, updateUrl } from '@src/utils';
import { COMPANY_ID } from '@src/utils/consts';
import VerifyUtils from '@utils/verifty';
import {
  Form,
  Input,
  Button,
  Col,
  Row,
  Space,
  Select,
  DatePicker,
  Modal,
  Radio,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classnames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styles from './index.module.less';
import {
  apiCompanyListSaas,
  apiCompanyRemove,
  apiCompanyAddCollect,
  apiFactorManage,
} from './service';
import { apiMnumListALLByDictTypeBatch } from '../Show/service';
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
  factorUse: string;
  auditStatus: number;
  companyFactorId: string;
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
      flag: 'system:company:querySaas',
    },
    // 自有因子和审核结果通过因子可编辑
    Number(record?.factorUse) === 1
      ? {
          btn_title: I18N.carbonFootprint.edit,
          type: 'edit',
          color: style.textGreen,
          is_pop: false,
          flag: 'system:company:editSaas',
        }
      : {},

    Number(record?.factorUse) === 1
      ? {
          btn_title: I18N.carbonFootprint.delete,
          type: 'delete',
          color: style.textError,
          is_pop: true,
          pop_title: I18N.components.thisOperationWillForever,
          flag: 'system:company:remove',
        }
      : {
          btn_title: I18N.carbonFootprint.cancelFavorite,
          type: 'removeCollect',
          color: style.textGreen,
          is_pop: true,
          pop_title: I18N.emission.thisOperationWillRetrieve,
          flag: 'system:collect:addCollect',
        },
    // 提交审核：因子类型为自有因子、因子审核状态为未提报、审核不通过的因子可进行提交审核
    // Number(record?.factorUse) === 1 &&
    // [3, 2].indexOf(Number(record.auditStatus)) >= 0
    //   ? {
    //       btn_title: I18N.emission.submitForReview,
    //       type: 'submit',
    //       color: style.textGreen,
    //       is_pop: true,
    //       flag: 'system:company:audit',
    //     }
    //   : {},
  ];
export const FactorUse = {
  0: I18N.emission.selfOwnedFactor,
  1: I18N.emission.collectionFactor,
};

export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
}[];

const Orgstaff: FC = () => {
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const [isLoading, changeIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [size, setPageSize] = useState<number>(10);
  const [pageCount, setCount] = useState(0); // 设置总条数
  const [staffDataSource, getDataSource] = useState<Column[]>([]); // 列表数据
  const [searchForm] = Form.useForm<SearchStaffsFromType>(); //  搜索from实例
  const [submitForm] = Form.useForm<{
    shared: string;
  }>();
  const [searchParams, setSearchParams] = useState({}); // 搜索穿参数据
  const [formSelects, setFormSelects] = useState<EmissionFactorMenu>({});
  // 控制提交审核弹窗
  const [isModalVisible, changeIsModalVisible] = useState(false);
  const [submitData, getSubmitData] = useState<{
    id: string;
    name: string;
  }>({ id: '', name: '' });
  const history = useHistory();
  sessionStorage.setItem('url', window.location.pathname);
  // 定义 搜索面板 相关搜索项
  const renderSearchFormDate = [
    {
      label: I18N.carbonFootprint.name,
      name: 'name',
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
    {
      label: I18N.emission.factorType,
      name: 'factorUse',
      type: 'select',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      required: true,
      tableType: 'number',
      controls: false,
      option: [
        {
          label: I18N.emission.selfOwnedFactor,
          value: 1,
        },
        {
          label: I18N.emission.collectionFactor,
          value: 2,
        },
      ],
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
    //     {
    //       value: 3,
    //       label: '未提报',
    //     },
    //   ],
    // },
  ];
  const itemRule = (item: { label: string }) => {
    if ([I18N.emission.carbonAccount].indexOf(item.label) >= 0) {
      return [
        {
          pattern: /^1[3456789]\d{9}$/,
          message: I18N.template(I18N.emission.inputCorrectI2, {
            val1: item.label,
          }),
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
          <div className={styles.orgFactorSearchFormItem}>
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
          </div>
        );
      }
      if (item?.type === 'select') {
        return (
          <div className={styles.orgFactorSearchFormItem}>
            <Form.Item
              key={`${item.name}SearchItem`}
              name={item.name}
              label={item.label}
              rules={itemRule(item)}
            >
              <Select
                allowClear
                placeholder={item.placeholder}
                style={{ minWidth: '120px', width: '100%' }}
                options={item?.option?.map(t => ({
                  value: t.dictValue || t.value,
                  label: t.dictLabel || t.label,
                }))}
              />
            </Form.Item>
          </div>
        );
      }
      if (item.type === 'year') {
        return (
          <div className={styles.orgFactorSearchFormItem}>
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
          </div>
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
  const apiQueryByPageTypeFn = async (value: {
    [x: string]: any;
    pageNum: number;
    pageSize: number;
    name?: string;
  }) => {
    if (page !== value.pageNum) {
      setPage(value.pageNum || 1);
    }
    if (page !== value.pageSize) {
      setPageSize(value.pageSize || 10);
    }
    setSearchParams(value);
    changeIsLoading(true);
    const obj = {
      ...value,
      year: value?.year ? value?.year?.format('YYYY') : '',
    };
    const { data } = await apiCompanyListSaas({
      companyId: Number(localStorage.getItem(COMPANY_ID))
        ? Number(localStorage.getItem(COMPANY_ID))
        : 0,
      ...obj,
    });
    if (data.code === 200) {
      getDataSource(data.rows);
      setCount(data.total);
      changeIsLoading(false);
    }
    changeIsLoading(false);
  };

  const orderColumn = useIndexColumn<Column>((page - 1) * size);

  const columns: ColumnsType<Column> = [
    ...orderColumn,
    ...getEmissionFactorColumns<Column>(),
    {
      title: I18N.emission.factorType,
      dataIndex: 'factorUse',
      width: 180,
      render: value => (value === '1' ? FactorUse[0] : FactorUse[1]),
    },
    {
      title: I18N.carbonFootprint3.findingsOfAudit,
      dataIndex: 'auditStatus',
      width: 180,
      render: (text, record) =>
        // 收藏因子没有审核结果
        Number(record.factorUse) === 1 && text
          ? {
              0: I18N.carbonFootprint3.underReview,
              1: I18N.carbonFootprint3.approved,
              2: I18N.carbonFootprint3.reviewFailed2,
              3: I18N.emission.notReported,
            }[Number(text)]
          : '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'action',
      width: '300px',
      fixed: 'right',
      render: (t, record: Column) => (
        <TableEditTsx<Column>
          get_action_data={GetActionContentArray(record)}
          record={record}
          onHandelType={async values => {
            if (selector?.userInfo) {
              if (
                values.btn_title &&
                [I18N.carbonFootprint3.details].indexOf(values.btn_title) >= 0
              ) {
                history.push(
                  `${RouteMaps.emissionOrganizationDetail}?emissionId=${record.id}&facId=${record.companyFactorId}&factorUse=${record.factorUse}&auditStatus=${record.auditStatus}`,
                );
                return;
              }
              if (
                values.btn_title &&
                [I18N.carbonFootprint.edit].indexOf(values.btn_title) >= 0
              ) {
                history.push(
                  `${RouteMaps.emissionOrganizationEdit}?emissionId=${record.id}&facId=${record.companyFactorId}&factorUse=${record.factorUse}`,
                  // : `/emission/organization/edit?${record.id}#0`,
                );
                return;
              }
              if (
                values.btn_title &&
                [I18N.carbonFootprint.delete].indexOf(values.btn_title) >= 0
              ) {
                await apiCompanyRemove({
                  id: `${record.id}`,
                }).then(({ data }) => {
                  if (data.code === 200) {
                    apiQueryByPageTypeFn({ pageNum: page, pageSize: size });
                  }
                  VerifyUtils.Toast(data.code as 200, data.msg);
                });
                return;
              }
              if (
                values.btn_title &&
                values.btn_title.indexOf(I18N.carbonFootprint.collection) >= 0
              ) {
                await apiCompanyAddCollect({
                  factorId: `${record.id}`,
                  companyId: Number(localStorage.getItem(COMPANY_ID)) || 0,
                }).then(({ data }) => {
                  if (data.code === 200) {
                    apiQueryByPageTypeFn({ pageNum: page, pageSize: size });
                  }
                  VerifyUtils.Toast(data.code as 200, data.msg);
                });
              }
            }
          }}
          onSubmit={async values => {
            changeIsModalVisible(true);
            // @ts-ignore
            getSubmitData({ ...values });
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
    apiMnumListALLByDictTypeBatchFn();
    // apiQueryByPageTypeFn({
    //   pageNum: searchObj?.pageNum || 1,
    //   pageSize: searchObj?.pageSize || 10,
    // });
    const searchObj = querystringToObject();
    // eslint-disable-next-line no-restricted-syntax
    for (const key in searchObj) {
      if (key === 'name') {
        searchForm.setFieldsValue({ name: decodeURIComponent(searchObj[key]) });
      }
    }
    setPage(searchObj.pageNum || 1);
    setPageSize(searchObj.pageSize || 10);
    apiQueryByPageTypeFn({
      pageNum: searchObj?.pageNum || 1,
      pageSize: searchObj?.pageSize || 10,
      name: searchObj?.name,
    });
  }, []);
  useEffect(() => {
    Object.keys(searchParams).forEach((key: string) => {
      // @ts-ignore
      updateUrl(key, searchParams[key]);
    });
  }, [searchParams]);
  return (
    <div className='childHeight'>
      <div className={classnames('Dashboard', style.searchBackground)}>
        <TableTitle
          title={I18N.carbonFootprint.organizationalFactorLibrary}
          addNewTitle={I18N.carbonFootprint.factor}
          onClickFn={() => {
            history.push('/emission/organization/add');
          }}
          flag='system:company:addSaas'
        />

        <Form
          className={styles.orgFactorSearchForm}
          form={searchForm}
          validateTrigger='onChange'
          layout='inline'
          onFinish={async (value: SearchStaffsFromType) => {
            // @ts-ignore
            await apiQueryByPageTypeFn({
              ...value,
              pageNum: 1,
              pageSize: size,
            });
          }}
          style={{ width: '100%' }}
        >
          {renderSearchForm()}

          <Space className={styles.orgFactorSearchFormItem}>
            <Button htmlType='submit' type='primary'>
              {I18N.carbonNeutral.query}
            </Button>
            <Button
              onClick={async () => {
                searchForm.resetFields();
                await apiQueryByPageTypeFn({
                  pageNum: 1,
                  pageSize: size,
                });
              }}
            >
              {I18N.carbonFootprint3.reset}
            </Button>
          </Space>
        </Form>
      </div>
      <div className={classnames('Dashboard', style.searchBackground)} />
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
            rowKey='id'
            onChange={async pageParams => {
              setPage(pageParams.current || 1);
              setPageSize(pageParams.pageSize || 10);
              await apiQueryByPageTypeFn({
                ...searchForm.getFieldsValue(true),
                pageNum: pageParams.current ? pageParams.current : 1,
                pageSize: pageParams.pageSize ? pageParams.pageSize : 10,
              });
            }}
          />
        </Col>
      </Row>
      <Modal
        title={I18N.emission.submitForReview}
        width={630}
        open={isModalVisible}
        onOk={() => {
          submitForm.validateFields().then(async value => {
            await apiFactorManage({
              factorId: submitData.id,
              factorName: submitData.name,
              type: '1',
              ...value,
            }).then(({ data }) => {
              if (data.code === 200) {
                changeIsModalVisible(false);
                apiQueryByPageTypeFn({ pageNum: page, pageSize: size });
              }
            });
          });
        }}
        onCancel={() => {
          changeIsModalVisible(false);
        }}
      >
        <Form form={submitForm}>
          <Form.Item
            label={I18N.emission.areYouWillingToGoPublic}
            rules={[
              {
                required: true,
                message: I18N.emission.areYouWillingToGoPublic2,
              },
            ]}
            name='shared'
          >
            <Radio.Group>
              <Radio value='0'> {I18N.emission.willingToMakeItPublic}</Radio>
              <Radio value='1'> {I18N.emission.notWillingToMakeItPublic}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
        <p className='Modal_text'>{I18N.emission.ifFactorReview}</p>
      </Modal>
    </div>
  );
};

export default Orgstaff;
