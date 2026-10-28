/**
 * @file 控制计划新增，拷贝
 * @author lixingchen
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
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../style.less';

import {
  apiEnterprisePlan,
  apiEnterprisePlanCp,
  apiEnterprisePlanDetail,
} from '../../service';

const ControlPlanAdd = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [pageType, setPageType] = useState('');
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const id = new URLSearchParams(location.search).get('id');
  useEffect(() => {
    if (history.location.pathname.includes('Add')) {
      setPageType('add');
    } else {
      apiEnterprisePlanDetail(id).then((res: any) => {
        form.setFieldsValue({
          ...res.data.data,
          enactTime: moment(),
          versionCode: '',
        });
      });
      setPageType('copy');
    }
  });
  const formItems: any = [
    {
      label: I18N.Certification.versionNumber2,
      name: 'versionCode',
      type: 'input',
      rules: true,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
    },
    {
      label: I18N.enterpriseCarbonAccount2.whenFormulatingRevisions,
      name: 'enactTime',
      placeholder: I18N.carbonFootprint.pleaseSelect,
      type: 'date',
      rules: true,
      col: 12,
    },
    {
      label: I18N.enterpriseCarbonAccount2.withinTheFormulationAndRevision,
      name: 'enactContent',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: true,
      col: 24,
      props: {
        maxLength: 500,
        showCount: true,
        rows: 4,
      },
    },
    {
      label: I18N.carbonFootprint.remarks,
      name: 'remark',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'textArea',
      rules: false,
      col: 24,
      props: {
        maxLength: 500,
        showCount: true,
        rows: 4,
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
            title:
              pageType === 'add'
                ? I18N.enterpriseCarbonAccount2.addControlMeter
                : I18N.enterpriseCarbonAccount2.copyControlMeter,
            key:
              pageType === 'add'
                ? I18N.enterpriseCarbonAccount2.addControlMeter
                : I18N.enterpriseCarbonAccount2.copyControlMeter,
          },
        ]}
      >
        <div className='form-width' style={{ marginTop: 20 }}>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={formItems}
            paddRight={30}
          />
        </div>
        <FormActions
          place='center'
          buttons={[
            {
              type: 'primary',
              title:
                pageType === 'add'
                  ? I18N.carbonFootprint.preserve
                  : I18N.carbonFootprint.copy,
              onClick: async () => {
                form.validateFields().then(values => {
                  const enactTime = moment(values.enactTime).format(
                    'YYYY-MM-DD HH:mm',
                  );
                  if (pageType === 'add') {
                    apiEnterprisePlan({ ...values, enactTime }).then(res => {
                      if (res.data.code === 200) {
                        Toast(
                          'success',
                          I18N.carbonFootprint.operationSuccessful,
                        );
                        history.goBack();
                      }
                    });
                  } else {
                    apiEnterprisePlanCp({
                      ...values,
                      controlPlanId: form.getFieldValue('controlPlanId'),
                      enactTime,
                    }).then(res => {
                      if (res.data.code === 200) {
                        Toast(
                          'success',
                          I18N.carbonFootprint.operationSuccessful,
                        );
                        history.goBack();
                      }
                    });
                  }
                });
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
      </Page>
    </div>
  );
};
export default ControlPlanAdd;
