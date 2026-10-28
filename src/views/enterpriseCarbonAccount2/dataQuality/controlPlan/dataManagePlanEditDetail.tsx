/**
 * @file 控制计划新增，拷贝
 * @author lxc
 * */

import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { Form } from 'antd';
import { FormProps } from 'antd/lib/form';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../style.less';

import {
  apiClassList,
  apiEnterprisePlanDataAdd,
  apiEnterprisePlanDataDetail,
  apiEnterprisePlanDataEdit,
} from '../../service';

const ControlPlanAdd = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [bringInto, setBringInto] = useState<number>(0);
  const [classList, setClassList] = useState<any>([]);
  // const [pageType, setPageType] = useState<string>('');
  const [isDetail, setIsDetail] = useState<boolean>(false);
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const controlPlanDataId =
    new URLSearchParams(location.search).get('controlPlanDataId') || '';
  const isEdit = new URLSearchParams(location.search).get('isEdit');
  const emissionClassMainId = Number(
    new URLSearchParams(location.search).get('emissionClassMainId'),
  );
  const commId = Number(new URLSearchParams(location.search).get('commId'));
  const controlPlanId = new URLSearchParams(location.search).get(
    'controlPlanId',
  );
  const currentTabValue =
    new URLSearchParams(location.search).get('tabValue') || 'GHG';

  useEffect(() => {
    const { pathname } = history.location;
    setIsDetail(!!pathname.includes('Detail'));
    apiClassList().then((res: any) => {
      const list = res.data;
      setClassList(list);
      const emsiionItem = list?.find(
        item => item.emissionClassMainId === emissionClassMainId,
      );
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        classify: emissionClassMainId,
        categoryDesc: emsiionItem?.categoryDesc,
      });
      if (typeof form.getFieldValue('computataionFlag') === 'undefined') {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          classify: emissionClassMainId,
          categoryDesc: emsiionItem?.categoryDesc,
          computataionFlag: 0,
        });
      }
    });
    if (isEdit === '1') {
      apiEnterprisePlanDataDetail(controlPlanDataId).then((res: any) => {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          ...res.data.data,
          calculateType: res.data.data.calculateType?.split(','),
        });
        setBringInto(res.data.data.computataionFlag);
      });
    }
  }, []);
  const formItems: any = [
    {
      label: I18N.carbonFootprint.emissionClassification,
      name: 'classify',
      type: 'select',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
      props: {
        options: classList?.map(item => ({
          value: item.emissionClassMainId,
          label: item.className,
        })),
        disabled: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.emissionCategories,
      name: 'classify',
      placeholder: I18N.carbonFootprint.pleaseSelect,
      type: 'select',
      rules: false,
      col: 12,
      props: {
        disabled: true,
        options: classList?.map(item => ({
          value: item.emissionClassMainId,
          label: item.categoryName,
        })),
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.categoryDescription2,
      name: 'categoryDesc',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: false,
      col: 24,
      props: {
        disabled: true,
        rows: 4,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.whetherToIncludeCarbon,
      name: 'computataionFlag',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'radio',
      rules: !isDetail,
      col: 24,
      props: {
        disabled: isDetail,
        // defaultValue: bringInto,
        // value: bringInto,
        options: [
          { value: 0, label: I18N.carbonNeutral.yes },
          { value: 1, label: I18N.carbonNeutral.no },
        ],
        onChange: (e: any) => {
          const { value } = e.target;
          setBringInto(value);
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.activityDescriptionIs,
      name: 'activityDesc',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: !isDetail,
      col: 24,
      props: {
        disabled: isDetail,
        rows: 4,
        showCount: true,
        maxLength: 1000,
      },
    },
  ];
  const bringIntoItem: any = [
    {
      label: I18N.enterpriseCarbonAccount2.dataCollectionTheory,
      name: 'collectDesc',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: !isDetail,
      col: 24,
      props: {
        disabled: isDetail,
        rows: 4,
        showCount: true,
        maxLength: 1000,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.computingMethod,
      name: 'calculateType',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'checkbox',
      rules: !isDetail,
      col: 24,
      props: {
        disabled: isDetail,
        options: [
          { label: I18N.carbonFootprint.emissionFactorLibrary, value: '0' },
          {
            label: I18N.enterpriseCarbonAccount2.materialBalanceMethod,
            value: '1',
          },
        ],
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.calculationMethodDescription,
      name: 'calculateDesc',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: !isDetail,
      col: 24,
      props: {
        disabled: isDetail,
        rows: 4,
        showCount: true,
        maxLength: 1000,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.dataStorageTheory,
      name: 'storageDesc',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: !isDetail,
      col: 24,
      props: {
        disabled: isDetail,
        rows: 4,
        showCount: true,
        maxLength: 1000,
      },
    },
  ];
  return (
    <div className='enterprise-carbon-account2'>
      <Page
        styles={{ paddingLeft: 16 }}
        breadCrumbs={[
          {
            title: I18N.enterpriseCarbonAccount2.controlPlan,
            key: I18N.enterpriseCarbonAccount2.controlPlan,
            href: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanList,
          },
          {
            title: I18N.enterpriseCarbonAccount2.editControlMeter,
            key: I18N.enterpriseCarbonAccount2.editControlMeter,
            href: '',
          },
          {
            title: isDetail
              ? I18N.enterpriseCarbonAccount2.dataManagementMeter2
              : I18N.enterpriseCarbonAccount2.editDataTube,
            key: I18N.enterpriseCarbonAccount2.addControlMeter,
          },
        ]}
      >
        <div
          className='info-box'
          style={{ padding: '6px 0 2px 0', height: 'calc(100vh - 158px)' }}
        >
          <div className='form-width'>
            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={
                bringInto === 0 ? [...formItems, ...bringIntoItem] : formItems
              }
              paddRight={30}
            />
          </div>
        </div>
        <FormActions
          place='center'
          buttons={
            isDetail
              ? [
                  {
                    type: 'default',
                    title: I18N.carbonFootprint.cancel,
                    onClick: async () => {
                      const isDetail = new URLSearchParams(location.search).get(
                        'isDetail',
                      );
                      if (isDetail === 'true') {
                        history.replace(
                          `${RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanDetail}?tabName=dataManage&id=${controlPlanId}&tabValue=${currentTabValue}`,
                        );
                      } else {
                        history.replace(
                          `${RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanEdit}?tabName=dataManage&id=${controlPlanId}&tabValue=${currentTabValue}`,
                        );
                      }
                    },
                  },
                ]
              : [
                  {
                    type: 'primary',
                    title: I18N.carbonFootprint.preserve,
                    onClick: async () => {
                      form.validateFields().then(() => {
                        const data = {
                          ...form.getFieldsValue(true),
                          controlPlanId,
                          type: commId,
                          computataionFlag: bringInto,
                          calculateType: form
                            .getFieldValue('calculateType')
                            ?.join(','),
                        };
                        const api =
                          isEdit === '1'
                            ? apiEnterprisePlanDataEdit
                            : apiEnterprisePlanDataAdd;
                        api(data).then(res => {
                          if (res.data.code === 200) {
                            Toast(
                              'success',
                              I18N.carbonFootprint.saveSuccessful,
                            );
                            setTimeout(() => {
                              history.goBack();
                            }, 500);
                          }
                        });
                      });
                    },
                  },
                  {
                    type: 'default',
                    title: I18N.carbonFootprint.cancel,
                    onClick: async () => {
                      history.replace(
                        `${RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanEdit}?tabName=dataManage&id=${controlPlanId}&tabValue=${currentTabValue}`,
                      );
                    },
                  },
                ]
          }
        />
      </Page>
    </div>
  );
};
export default ControlPlanAdd;
