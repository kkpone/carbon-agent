/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file 新增编辑报告
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import '../../style.less';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import { checkEmail, checkSubmit } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import useSyncCallback from '@src/utils/useSyncCallback';
import { SearchFormItem } from '@src/views/components/SearchForm';
import { Button, Form, FormProps } from 'antd';
import { isNil } from 'lodash-es';
import moment, { Moment } from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getFormList } from './formData';
import styles from './index.module.less';
import SelectScene from './selectScene';
import { Org } from '../../AccountingList/type';
import { ACCOUNT_WAY } from '../../AccountingSetting/constant';
import { getAccountingSetting } from '../../AccountingSetting/service';
import { getDataBoardOrg } from '../../AnnualReport/service';
import {
  apiCalculateReport,
  apiEnterpriseComputationList,
  apiCalculateInfo,
  apiCalculateEdit,
  apiEmissionList,
} from '../../service';

const AddEditReport = () => {
  const history = useHistory();
  const [form] = Form.useForm();

  const id = new URLSearchParams(window.location.search).get('id');
  const [page, setPage] = useState<{
    page: number;
    size: number;
    dataTotal: number;
  }>({
    page: 1,
    size: 5,
    dataTotal: 0,
  });
  const [modalSearchParams, setModalSearchParams] = useState({
    sceneName: '',
  });
  const [pageType, setPageType] = useState<'add' | 'edit' | 'detail'>();
  const [visible, setVisible] = useState<boolean>(false);
  const [outLessEmissionList, setoutLessEmissionList] = useState<any>([]);
  const [model, setModel] = useState<'defalut' | 'custem'>('defalut');
  const [computationList, setComputationList] = useState<any>([]);
  const [modalLessEmissionList, setModalLessEmissionList] = useState<any>([]);

  const [calculatePeriod, setCalculatePeriod] = useState(
    () => new URLSearchParams(location.search).get('period') || '',
  );
  const [orgTree, setOrgTree] = useState<Org[]>([]);

  const [accountSetting, setAccountSetting] = useState<{
    accountWay: number;
    yearList: { year: string; yearInfo: string }[];
  }>();

  const { accountWay, yearList = [] } = accountSetting || {};

  const computationId = new URLSearchParams(location.search).get(
    'computationId',
  );

  const orgId = new URLSearchParams(location.search).get('orgId');

  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    initialValues: {
      versionTypeList: [1, 4],
      languageType: 1,
    },
  };
  const [
    baseItemForm,
    reportPeopleItemForm,
    lessInfoItemForm,
    reportVersionItemForm,
  ] = getFormList(pageType, model, setModel, computationList, form);

  const findOrg = (targetId: number, orgs: Org[]) => {
    let orgIds: number[] | undefined;
    let org: Org | undefined;

    const dfsOrg = (orgList: Org[], parentIds: number[] = []) => {
      orgList.forEach(currOrg => {
        if (currOrg.id === targetId) {
          orgIds = [...parentIds, currOrg.id];
          org = currOrg;
        } else {
          dfsOrg(currOrg.children, [...parentIds, currOrg.id]);
        }
      });
    };

    dfsOrg(orgs);

    return { orgIds, org };
  };

  const getDeatil = id => {
    if (isNil(accountWay)) {
      return;
    }

    apiCalculateInfo(id).then((res: any) => {
      const { data } = res.data;
      if (data.timeType === 3) {
        setModel('custem');
      } else {
        setModel('defalut');
      }

      const cYear = data.calculatePeriod?.replace(
        I18N.enterpriseCarbonAccount2.year8,
        '',
      );
      getDataBoardOrg({ cYear }).then(resp => {
        setOrgTree(resp.data.data);
        const { orgIds } = findOrg(Number(data.orgId), resp.data.data);
        form.setFieldsValue({
          ...data,
          timeTypes: data.timeType,
          controlPlanVersion: Number(data.controlPlanVersion) || undefined,
          calculatePeriod:
            accountWay === ACCOUNT_WAY.CALENDAR_YEAR ? moment(cYear) : cYear,
          orgId: orgIds,
        });
      });

      setoutLessEmissionList([...res.data.data.lessenEmissionIdListInfo]);
    });
  };
  useEffect(() => {
    const path = history.location.pathname;
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportAdd
    ) {
      setPageType('add');
    }
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportEdit
    ) {
      setPageType('edit');
    }
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportDetail
    ) {
      setPageType('detail');
    }

    if (id) {
      getDeatil(id);
    } else {
      form.setFieldsValue({ versionTypeList: [2] });
    }
    // 获取核算名称
    apiEnterpriseComputationList({ pageSize: 10000, pageNum: 1 }).then(
      (res: any) => {
        setComputationList(
          res.data.rows.map(item => ({
            value: item.computationId,
            label: item.name,
            period: item.period,
            timeType: item.timeType,
            totalQuantity: item.totalQuantity,
          })),
        );
      },
    );
  }, [accountWay]);
  const getSceneData = async () => {
    await apiEmissionList({
      pageNum: page.page,
      pageSize: page.size,
      ...modalSearchParams,
    }).then((res: any) => {
      setModalLessEmissionList(res.data.rows);

      setPage({ ...page, dataTotal: res.data.total });
    });
  };
  const syncGetSceneData = useSyncCallback(getSceneData);
  const renderSelectScene = () => {
    const formList: SearchFormItem[] = [
      {
        name: 'sceneName',
        label: '',
        type: 'Input',
        placeholder:
          I18N.enterpriseCarbonAccount2.emissionReductionScenarioName,
      },
    ];
    const columns = [
      {
        title: I18N.enterpriseCarbonAccount2.emissionReductionScenarioName,
        dataIndex: 'sceneName',
        width: 200,
      },
      {
        title: I18N.enterpriseCarbonAccount2.emissionSourceId,
        dataIndex: 'lessenEmissionId',
        width: 240,
        render: txt => <div>{txt ?? '--'}</div>,
      },
      {
        title: I18N.enterpriseCarbonAccount2.totalEmissionReduction,
        dataIndex: 'totalQuantity',
        width: 240,
        render: (txt: string, record: any) => (
          <div>
            {(record.totalLessenType && record.totalLessenType === 1
              ? `${record.totalInitValue}-${record.totalEndValue}`
              : record.totalQuantity) || '--'}
          </div>
        ),
      },
      {
        title: I18N.enterpriseCarbonAccount2.unitEmissionReduction,
        width: 240,
        dataIndex: 'unitQuantity',
        render: (txt: string, record: any) => (
          <div>
            {(record.unitLessenType && record.unitLessenType === 1
              ? `${record.unitInitValue}-${record.unitEndValue}`
              : record.unitQuantity) || '--'}
          </div>
        ),
      },
      {
        title:
          I18N.enterpriseCarbonAccount2.descriptionOfEmissionReductionScenarios,
        width: 400,
        dataIndex: 'sceneDesc',
        render: txt => <div>{txt ?? '--'}</div>,
      },
    ];
    const tableOnChange = (page: any) => {
      setPage({
        page: page.current,
        size: page.pageSize,
        dataTotal: page.total,
      });
      syncGetSceneData();
    };
    const onHandleOk = (list: []) => {
      setoutLessEmissionList(list);
    };
    const onSearch = (params: any) => {
      setPage({
        ...page,
        page: 1,
      });
      setModalSearchParams(params);
      syncGetSceneData();
    };
    return (
      <SelectScene
        columsData={columns}
        dataSource={modalLessEmissionList}
        outList={outLessEmissionList}
        page={page}
        closeModel={() => setVisible(false)}
        visible={visible}
        formList={formList}
        onHandleOk={onHandleOk}
        tableOnChange={tableOnChange}
        onSearch={onSearch}
      />
    );
  };
  const renturnBtnArr = () => {
    const cancel = {
      type: 'default',
      title:
        pageType === 'detail'
          ? I18N.carbonFootprint.return
          : I18N.carbonFootprint.cancel,
      onClick: async () => {
        history.push(
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportList,
        );
      },
    };
    const save = {
      type: 'primary',
      title: I18N.carbonFootprint.preserve,
      onClick: async () => {
        await form.validateFields();
        const formData = form.getFieldsValue(true);
        const api = pageType === 'edit' ? apiCalculateEdit : apiCalculateReport;

        if (formData.mainPhone && !checkSubmit(formData.mainPhone)) {
          Toast('warn', I18N.enterpriseCarbonAccount2.incorrectPhoneNumber);
          return;
        }
        if (formData.mainEmail && !checkEmail(formData.mainEmail)) {
          Toast('warn', I18N.enterpriseCarbonAccount2.incorrectEmailAddress);
          return;
        }
        const data = {
          ...formData,
          timeType: formData.timeType ?? 0,
          orgId: [...(formData.orgId || [])].pop(),
          calculatePeriod:
            accountWay === ACCOUNT_WAY.CALENDAR_YEAR
              ? `${moment(formData.calculatePeriod).format('YYYY')}${
                  I18N.enterpriseCarbonAccount2.year8
                }`
              : formData.calculatePeriod,
          controlPlanVersion: formData.controlPlanVersion || null,
          lessenEmissionIdList: outLessEmissionList.map(
            item => item.lessenEmissionId,
          ),
          reportId: id,
        };
        !id && delete data.reportId;

        const res = await api(data);

        Toast('success', I18N.carbonFootprint.operationSuccessful);
        history.push(
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportList,
        );
      },
    };
    if (pageType === 'add' || pageType === 'edit') {
      return [save, cancel];
    }

    if (pageType === 'detail') {
      return [cancel];
    }
    return [cancel];
  };

  useEffect(() => {
    if (calculatePeriod) {
      getDataBoardOrg({ cYear: calculatePeriod }).then(({ data }) => {
        setOrgTree(data.data || []);
      });
    }
  }, [calculatePeriod]);

  useEffect(() => {
    if (orgId && calculatePeriod && !id && !isNil(accountWay)) {
      getDataBoardOrg({ cYear: calculatePeriod }).then(({ data }) => {
        const { orgIds, org } = findOrg(Number(orgId), data.data);
        if (orgIds && org) {
          form.setFieldsValue({
            calculatePeriod:
              accountWay === ACCOUNT_WAY.CALENDAR_YEAR
                ? moment(calculatePeriod)
                : calculatePeriod,
            orgId: orgIds,
            reportName: I18N.template(I18N.enterpriseCarbonAccount2.orgna4, {
              val1: org.name,
              val2: calculatePeriod,
            }),
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountWay]);

  useEffect(() => {
    if (!computationId && !id) {
      form.setFieldsValue({ timeTypes: 0 });
    }
  }, [form, computationId, id]);

  useEffect(() => {
    getAccountingSetting().then(({ data }) => {
      setAccountSetting(data.data);
    });
  }, []);

  return (
    <div className='enterprise-carbon-account2 emission-box'>
      <Page
        breadCrumbs={[
          {
            title: I18N.enterpriseCarbonAccount2.accountingReport,
            key: I18N.enterpriseCarbonAccount2.accountingReport,
            href: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportList,
          },
          {
            title:
              pageType === 'detail'
                ? I18N.carbonFootprint.reportDetails
                : pageType === 'add'
                ? I18N.carbonFootprint.newReportAdded
                : I18N.carbonFootprint.editReport,
            key: 'reportAction',
          },
        ]}
      >
        <div className='form-box'>
          <span className='title'>{I18N.carbonFootprint.basicInformation}</span>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            // formItems={baseItemForm}
            formItems={[
              {
                label: I18N.carbonFootprint.accountingCycle,
                name: 'calculatePeriod',
                type:
                  accountWay === ACCOUNT_WAY.CALENDAR_YEAR ? 'date' : 'select',
                rules: pageType !== 'detail',
                placeholder:
                  I18N.enterpriseCarbonAccount2.pleaseSelectAccounting3,
                props: {
                  picker: 'year',
                  disabled: pageType === 'detail',
                  options: yearList.map(({ year }) => ({
                    value: year,
                    label: year,
                  })),
                  disabledDate: (date: Moment) =>
                    moment(date.format('YYYY')).isAfter(
                      moment(moment().format('YYYY')),
                    ),
                  onChange: (val, year) => {
                    setCalculatePeriod(
                      accountWay === ACCOUNT_WAY.CALENDAR_YEAR ? year : val,
                    );
                    form.setFieldsValue({
                      orgId: undefined,
                      reportName: undefined,
                    });
                  },
                },
              },
              {
                label: I18N.enterpriseCarbonAccount2.accountingOrganization,
                name: 'orgId',
                type: 'cascader',
                rules: pageType !== 'detail',
                placeholder:
                  I18N.enterpriseCarbonAccount2.pleaseSelectAccounting2,
                props: {
                  options: orgTree,
                  changeOnSelect: true,
                  picker: 'year',
                  fieldNames: { label: 'name', value: 'id' },
                  displayRender: labels => [...labels].pop(),
                  expandTrigger: 'hover',
                  disabled: pageType === 'detail',
                  onChange: (_, orgs) => {
                    if (orgs?.length > 0) {
                      const yearFormVal = form.getFieldValue('calculatePeriod');
                      const year =
                        accountWay === ACCOUNT_WAY.CALENDAR_YEAR
                          ? moment(yearFormVal).format('YYYY')
                          : yearFormVal;
                      const org = [...orgs].pop();
                      form.setFieldsValue({
                        reportName: I18N.template(
                          I18N.enterpriseCarbonAccount2.orgna3,
                          { val1: org.name, val2: year },
                        ),
                      });
                    }
                  },
                },
              },
              {
                label: I18N.carbonFootprint.reportName,
                name: 'reportName',
                type: 'input',
                rules: pageType !== 'detail',
                placeholder: I18N.carbonFootprint.pleaseEnter,
                padding: '0',
                props: {
                  disabled: pageType === 'detail',
                },
              },
              {
                label: I18N.enterpriseCarbonAccount2.baseline,
                name: 'timeTypes',
                type: 'select',
                rules: false,
                placeholder: I18N.carbonFootprint.pleaseEnter,
                props: {
                  disabled: true,
                  options: [
                    { value: 0, label: I18N.enterpriseCarbonAccount2.baseYear },
                    {
                      value: 1,
                      label: I18N.enterpriseCarbonAccount2.benchmarkQuarter,
                    },
                    {
                      value: 2,
                      label: I18N.enterpriseCarbonAccount2.baseMonth,
                    },
                    { value: 3, label: I18N.carbonFootprint.custom },
                  ],
                },
              },
              {
                label: I18N.enterpriseCarbonAccount2.reportLanguage,
                name: 'languageType',
                type: 'radio',
                rules: false,
                placeholder: I18N.enterpriseCarbonAccount2.pleaseEnter,
                props: {
                  disabled: pageType === 'detail',
                  options: [
                    { value: 1, label: I18N.components.simplifiedChinese },
                    {
                      value: 2,
                      label: I18N.enterpriseCarbonAccount2.english,
                    },
                  ],
                },
              },
            ]}
            paddRight={30}
          />
        </div>
        <div className='form-box'>
          <span className='title'>
            {I18N.enterpriseCarbonAccount2.reportVersion}
          </span>
          <span className={styles.reportVersionTip}>
            {I18N.enterpriseCarbonAccount2.pleaseSelectAtLeast}
          </span>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={reportVersionItemForm}
            paddRight={30}
          />
        </div>
        <div className='form-box'>
          <span className='title'>
            {I18N.enterpriseCarbonAccount2.reportManager}
          </span>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={reportPeopleItemForm}
            paddRight={30}
          />
        </div>
        {/* <div className='form-box'>
          <span className='title'>
            {I18N.enterpriseCarbonAccount2.emissionReductionInformation}
          </span>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={lessInfoItemForm}
            paddRight={30}
          />
        </div> */}
        {/* 取消合作 */}
      </Page>
      {/* @ts-ignore */}
      <FormActions place='center' buttons={renturnBtnArr()} />
      {renderSelectScene()}
    </div>
  );
};
export default AddEditReport;
