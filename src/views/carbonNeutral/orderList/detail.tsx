/* eslint-disable */
/**
 * @file 创建、编辑 报告主体、详情
 * @author qifeng
 */
import I18N from '@src/lang/I18N';
import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Form } from 'antd';
import classNames from 'classnames';
import '@src/views/carbonInternational/carbonManagement/operationManagement.less';
import style from '@src/views/carbonInternational/carbonManagement/operationManagement.module.less';
import { Page } from '@src/components/Page';
import { FormActions } from '@src/components/FormActions';
import { Selector } from '@src/views/carbonInternational/carbonManagement/Selector';
import { ApiOrdersInfo } from '../service';

const OrderDetail = () => {
  const [formInitialValues, setFormInitialValues] = useState({
    userNick: '',
    orderId: '',
    thirdCode: '',
    goodsName: '',
    goodsPrice: '',
    buyAmount: '',
    payTime: '',
    payMoney: '',
    status: '',
    proofCode: '',
  });
  const history = useHistory();

  const [form] = Form.useForm();
  // 编辑状态 获取初始化数据 从接口

  // 修改，查询数据
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id') || '';
    ApiOrdersInfo({ id }).then((res: any) => {
      const datas = res.data?.data;
      if (datas) {
        setFormInitialValues(datas);
        form.setFieldsValue({
          ...datas,
          status:
            datas.status === '0'
              ? I18N.carbonNeutral.inPayment
              : datas.status === '1'
              ? I18N.carbonNeutral.paymentSuccessful2
              : I18N.carbonNeutral.paymentFailed2,
        });
      }
    });
  }, []);

  // form base item
  const orderInfo = useMemo(() => {
    return [
      {
        name: I18N.carbonNeutral.userNickname,
        id: 'userNick',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },
      {
        name: I18N.carbonNeutral.orderNumber,
        id: 'orderId',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },
      {
        name: I18N.carbonNeutral.businessDataI,
        id: 'thirdCode',
        className: 'w_50',
        val: '',
        render: <Selector aria-label='department' readonly />,
      },
      {
        name: I18N.carbonNeutral.productName,
        id: 'goodsName',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='boundaries' readonly />,
      },
      {
        name: I18N.carbonNeutral.itemPricing,
        id: 'goodsPrice',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },

      {
        name: I18N.carbonNeutral.carbonEmissionsT,
        id: 'buyAmount',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },

      {
        name: I18N.carbonNeutral.paymentTime,
        id: 'payTime',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },

      {
        name: I18N.carbonNeutral.paymentAmount,
        id: 'payMoney',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },

      {
        name: I18N.carbonNeutral.orderStatus,
        id: 'status',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },
      {
        name: I18N.carbonNeutral.cancellationVoucherForm,
        id: 'proofCode',
        val: '',
        className: 'w_50',
        render: <Selector aria-label='industry' readonly />,
      },
    ];
  }, [formInitialValues]);

  return (
    <Page
      wrapperClassName={style.wrapper}
      breadCrumbs={[
        {
          title: I18N.carbonNeutral.carbonNeutralityOrders,
          key: I18N.carbonNeutral.carbonNeutralityOrders,
          href: '/carbonNeutral/orderList',
        },
        {
          title: I18N.carbonNeutral.viewOrderDetails,
          key: I18N.carbonNeutral.addReportMaster,
        },
      ]}
    >
      {/* {JSON.stringify(formInitialValues)} */}
      <div className={classNames('operation-management-wrapper')}>
        {/* 表单 */}
        <div className={style.mainFormContent}>
          <Form className='addlist_content_From' form={form} layout='vertical'>
            {orderInfo.map(item => {
              return (
                <Form.Item
                  className={classNames('acf_Item', item?.className)}
                  name={item.id}
                  label={item.name}
                >
                  {item.render}
                </Form.Item>
              );
            })}
            <FormActions
              className={style.formActionsWrapper}
              place='center'
              buttons={[
                {
                  title: I18N.carbonFootprint.return,
                  onClick: async () => {
                    history.goBack();
                  },
                },
              ]}
            ></FormActions>
          </Form>
        </div>
      </div>
    </Page>
  );
};

export default OrderDetail;
