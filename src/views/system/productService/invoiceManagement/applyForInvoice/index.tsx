/*
 * @Author: 张明尧
 * @Date: 2022-10-16 11:02:53
 */
/**
 * 发票管理 - 申请发票
 * @returns
 */
import I18N from '@src/lang/I18N';
import { CheckOutlined, RightOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { useState } from 'react';
import style from '../../index.module.less';
import InvoiceApplyForConfirmInvoice from './confirmInvoice';
import './index.less';
import InvoiceApplyForInvoiceSelectOrder from './selectOrder';
import { InvoiceWriteInvoiceAdd } from './type';
import InvoiceApplyForInvoiceWriteInvoice from './writeInvoice';

const OrderServiceCenterInvoiceApplyForInvoice = () => {
  /** 申请发票的步骤条 - 1 选择开票订单 2 填写发票信息 3 开具发票  */
  const [currentStep, setCurrentStep] = useState<number>(1);
  /** 选择订单后的回显 */
  const [selectOrderData, setSelectOrderData] = useState<{
    orderIds: React.Key[];
    totalMoney: number;
  }>();
  /** 填写发票的信息 */
  const [invoiceAddData, setInvoiceAddData] =
    useState<InvoiceWriteInvoiceAdd>();

  /**
   * 点击当前的步骤条
   * @param step 当前点击的是哪个步骤条
   */
  const selectStep = (step: number) => {
    setCurrentStep(step);
  };
  /**
   * 申请开票的订单选择
   * @param totalMoney 开票订单总额
   * @param keys 选中的订单号 orderId
   */
  const subSelectOrder = (totalMoney: number, keys: React.Key[]) => {
    setSelectOrderData({
      totalMoney,
      orderIds: keys,
    });
    setCurrentStep(2);
  };

  /**
   * 提交发票的数据回调
   * @param data 被提交的表单
   */
  const subInvoiceAdd = (data: InvoiceWriteInvoiceAdd) => {
    if (data) {
      setInvoiceAddData(data);
      setCurrentStep(3);
    }
  };
  /**
   * 发票开具成功
   */
  const invoiceBack = () => {};

  return (
    <div className={`${style.homeProductOrder}`}>
      <div className={style.main}>
        <div className='invoiceApplyForInvoiceMain'>
          <div className='mainTitle'>
            <Row>
              <Col span={8}>
                <div
                  style={currentStep <= 1 ? { cursor: 'default' } : {}}
                  className={`mainTitleSteps ${
                    currentStep === 1 && 'mainTitleStepsActive'
                  } ${currentStep > 1 && 'mainTitleStepsClose'}`}
                  onClick={() => {
                    if (currentStep > 1) {
                      selectStep(1);
                    }
                  }}
                >
                  <div className='selectSteps'>
                    {currentStep > 1 ? (
                      <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />
                    ) : (
                      1
                    )}
                  </div>
                  <div className='selectStepsText'>{I18N.system.selectInvoicingBooking}</div>
                  <RightOutlined
                    style={{
                      position: 'absolute',
                      fontSize: 100,
                      color: '#fff',
                      right: -20,
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={currentStep <= 2 ? { cursor: 'default' } : {}}
                  className={`mainTitleSteps ${
                    currentStep === 2 && 'mainTitleStepsActive'
                  } ${currentStep > 2 && 'mainTitleStepsClose'}`}
                  onClick={() => {
                    if (currentStep > 2) {
                      selectStep(2);
                    }
                  }}
                >
                  <div className='selectSteps'>
                    {currentStep > 2 ? (
                      <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />
                    ) : (
                      2
                    )}
                  </div>
                  <div className='selectStepsText'>{I18N.system.fillOutInvoiceLetter}</div>
                  <RightOutlined
                    style={{
                      position: 'absolute',
                      fontSize: 100,
                      color: '#fff',
                      right: -20,
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{ cursor: 'default' }}
                  className={`mainTitleSteps ${
                    currentStep === 3 && 'mainTitleStepsActive'
                  }`}
                >
                  <div className='selectSteps'>3</div>
                  <div className='selectStepsText'>{I18N.system.issuingInvoices}</div>
                </div>
              </Col>
            </Row>
          </div>
          <div className='mainBody'>
            {currentStep === 1 ? (
              <InvoiceApplyForInvoiceSelectOrder
                subSelectOrder={subSelectOrder}
              />
            ) : (
              ''
            )}
            {currentStep === 2 && selectOrderData ? (
              <InvoiceApplyForInvoiceWriteInvoice
                orderIds={selectOrderData.orderIds}
                subInvoiceAdd={subInvoiceAdd}
                totalMoney={selectOrderData.totalMoney}
              />
            ) : (
              ''
            )}
            {currentStep === 3 && selectOrderData && invoiceAddData ? (
              <InvoiceApplyForConfirmInvoice
                addData={invoiceAddData}
                invoiceBack={invoiceBack}
                totalMoney={selectOrderData.totalMoney}
              />
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderServiceCenterInvoiceApplyForInvoice;
