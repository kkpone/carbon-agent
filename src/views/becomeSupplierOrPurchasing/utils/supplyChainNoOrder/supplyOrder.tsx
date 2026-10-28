/**
 *  @file 欢迎合作
 *  @author wangjiahui
 */

import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { combineClassName, getUserInfo } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { carbonAccountHomeNoOrder } from '@src/views/carbonAccount/home/model';
import { apiNoOrderAdd } from '@src/views/carbonAccount/home/service';
import {
  CarbonAccountHomeTabs,
  CarbonAccountNoOrderSubForm,
} from '@src/views/carbonAccount/home/type';
import style from '@views/becomeSupplierOrPurchasing/purchasingManagement/index.module.less';
import { Button, Tabs, Image, FormProps, Form } from 'antd';
import { useState } from 'react';

interface OrderProps {
  tabInfoList: CarbonAccountHomeTabs[];
  noOrder: boolean;
}

/** 没有订单时的欢迎合作页面 */
export const OrderView = ({ tabInfoList, noOrder }: OrderProps) => {
  const [NoOrderForm] = Form.useForm<CarbonAccountNoOrderSubForm>();
  const storages = getUserInfo();
  /** 基础信息表单 */
  const CarbonAccountNoOrderFormProps: FormProps = {
    form: NoOrderForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    initialValues: {
      orgName: storages?.userInfo?.companyVoList?.filter(
        ({ companyId }) => storages?.userInfo?.companyId === companyId,
      )?.[0]?.companyName,
    },
  };
  /** 默认选中第一个tab */
  const [tabActive, setTabActive] = useState<string>('1');

  /** 切换 */
  const changeTabActive = (activeKey: string) => {
    setTabActive(activeKey);
  };
  /** 立即提交 */
  const handleCooperationInfo = () => {
    NoOrderForm.validateFields()
      .then(async val => {
        apiNoOrderAdd(val)
          .then(({ data }) => {
            if (data.code === 200) {
              Toast('success', I18N.carbonFootprint.submittedSuccessfully);
            }
          })
          .finally(() => {
            NoOrderForm.resetFields();
          });
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };
  return (
    <div className={style.no_order_content} aria-label='no_order_content'>
      {/* 欢迎合作表单 */}
      {noOrder && (
        <div className={style.noOrder} aria-label='no_order_main'>
          <div
            className={style.noOrder_title}
            aria-label='no_order_main_noOrder_title'
          >
            {I18N.carbonFootprint.welcomeToCooperate}
          </div>
          <div
            className={style.noOrder_info}
            aria-label='no_order_main_noOrder_info'
          >
            {I18N.carbonFootprint.youHaveNotSubscribedYet}
          </div>
          <FormItemUtil
            antdFormProps={CarbonAccountNoOrderFormProps}
            formItems={carbonAccountHomeNoOrder()}
          />
          <Button
            aria-label='no_order_main_submit'
            type='primary'
            onClick={handleCooperationInfo}
            className={style.noOrder_submit}
          >
            {I18N.carbonFootprint.submitNow}
          </Button>
        </div>
      )}

      {/* 功能介绍 */}
      <div className={style.noOrder} aria-label='no_order_main_feature'>
        <div
          className={style.noOrder_title}
          aria-label='no_order_main_feature_title'
        >
          {I18N.carbonFootprint.functionIntroduction}
        </div>
        <div
          className={style.tabmain}
          aria-label='no_order_main_feature_tabmain'
        >
          <Tabs
            aria-label='no_order_main_feature_tabmain_tab'
            activeKey={tabActive}
            onChange={changeTabActive}
          >
            {tabInfoList?.map((item: CarbonAccountHomeTabs) => (
              <Tabs.TabPane
                tab={item.label}
                key={item.value}
                aria-label={`no_order_main_feature_tabmain_tab_${item.label}`}
              >
                <div
                  className='tabMainItem'
                  aria-label='no_order_main_feature_tabmain_tab_tabMainItem'
                >
                  <div
                    aria-label='no_order_main_feature_tabmain_tab_des'
                    className={style.des}
                  >
                    {item.cont}
                  </div>
                  <Image
                    aria-label='no_order_main_feature_tabmain_tab_des_img'
                    height={380}
                    preview={false}
                    src={item.imgPath}
                  />
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </div>
      {/* 底部内容 */}
      <div
        aria-label='no_order_main_feature_footer'
        className={combineClassName(style.homeFooter, style.footerbtn)}
      >
        <span aria-label='no_order_main_feature_footer_phone'>
          {I18N.becomeSupplierOrPurchasing.customerConsultantConsultation}
          <IconFont type='icon-icon-dianhua' className={style.phone} />
          010-50973498
        </span>
        <span aria-label='no_order_main_feature_footer_email'>
          <IconFont type='icon-icon-youxiang' className={style.email} />
          mail@carbonstop.com
        </span>
      </div>
    </div>
  );
};
