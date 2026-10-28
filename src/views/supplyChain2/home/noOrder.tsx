/**
 * 碳账户未订阅的表单
 * @returns
 */
import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Toast } from '@src/utils/Toast';
import { apiQueryByCompanyId } from '@src/views/dashborad/organization/services';
import { apiQueryByPageType } from '@src/views/dashborad/orgstaff/service';
import { Button, Form, FormProps } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';
import { RootState } from '@src/store';
import { useSelector } from 'react-redux';

import { carbonAccountHomeNoOrder } from './model';
import { apiNoOrderAdd } from './service';
import { CarbonAccountNoOrderSubForm } from './type';

const CarbonAccountNoOrder = () => {
  const [CarbonAccountNoOrderForm] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  /** 基础信息表单 */
  const CarbonAccountNoOrderFormProps: FormProps = {
    ...formPropsInit(),
    form: CarbonAccountNoOrderForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const subNoOrderForm = () => {
    CarbonAccountNoOrderForm.validateFields().then(
      async (val: CarbonAccountNoOrderSubForm) => {
        setBtnLoading(true);
        try {
          const res = await apiNoOrderAdd(val);
          if (res.data.code === 200) {
            Toast('success', I18N.carbonFootprint.submittedSuccessfully);
            CarbonAccountNoOrderForm.resetFields();
          } else {
            Toast('error', I18N.carbonFootprint.submissionFailed);
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
        setBtnLoading(false);
      },
    );
  };
  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  )?.userInfo;
  useEffect(() => {
    const COMPANY_ID = localStorage.getItem('COMPANY_ID');
    apiQueryByCompanyId({ id: Number(COMPANY_ID) })
      .then(
        ({ data }) => {
          CarbonAccountNoOrderForm.setFieldsValue({
            ...CarbonAccountNoOrderForm.getFieldsValue(true),
            orgName: data.data.companyName,
          });
          const userName = userInfo?.username;
          CarbonAccountNoOrderForm.setFieldsValue({ phonenumber: userName });
          return apiQueryByPageType({
            userName,
            page: 1,
            size: 1,
          });
        },
        () => {},
      )
      .then(
        (res: any) => {
          CarbonAccountNoOrderForm.setFieldsValue({
            ...CarbonAccountNoOrderForm.getFieldsValue(true),
            clientName: res.data.data.rows[0]?.employName,
            email: '',
            remark: '',
          });
        },
        () => {},
      );
  }, []);
  return (
    <div className='carbonAccount'>
      <div className='home noOrderHome'>
        <div className='noOrderHomeTitle'>{I18N.carbonFootprint.welcomeToCooperate}</div>
        <div className='noOrderHomeTitleDetail'>
          {I18N.carbonFootprint.youHaveNotSubscribedYet}</div>
        <div style={{ marginTop: 40 }}>
          <FormItemUtil
            antdFormProps={CarbonAccountNoOrderFormProps}
            formItems={carbonAccountHomeNoOrder()}
          />
        </div>
        <div style={{ margin: '30px 0 60px 0' }}>
          <Button
            onClick={subNoOrderForm}
            loading={btnLoading}
            style={{ width: 200 }}
            type='primary'
          >
            {I18N.carbonFootprint.submitNow}</Button>
        </div>
      </div>
    </div>
  );
};

export default CarbonAccountNoOrder;
