/*
 * @Author: 张明尧
 * @Date: 2022-07-13 14:23:39
 */
/**
 * 碳账户未订阅的表单
 * @returns
 */
import I18N from '@src/lang/I18N';
import { UserInfo } from '@src/api/types';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import store from '@src/store';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps } from 'antd';
import { useState } from 'react';
import './index.less';
import { carbonAccountHomeNoOrder } from './model';
import { apiNoOrderAdd } from './service';
import { CarbonAccountNoOrderSubForm } from './type';

const CarbonAccountNoOrder = () => {
  const [CarbonAccountNoOrderForm] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  /** 本地存储的信息 */
  const storeState: UserInfo = store.getState().companyUserInfo.userInfo;
  const companyInfo =
    storeState.companyVoList &&
    storeState.companyVoList.find(
      list => list.companyId === storeState.companyId,
    );
  /** 基础信息表单 */
  const CarbonAccountNoOrderFormProps: FormProps = {
    ...formPropsInit(),
    form: CarbonAccountNoOrderForm,
    initialValues: {
      orgName: storeState.companyName || companyInfo?.companyName,
      phonenumber: storeState.username,
    },
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
