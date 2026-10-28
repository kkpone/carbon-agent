/*
 * @Author: 张明尧
 * @Date: 2022-10-16 17:43:55
 */
/**
 * 发票管理 - 申请发票 - 填写发票
 * @returns
 */
import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { FromItemProps, FromItemTypeBack } from '@src/components/FormUtil/type';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Button, Form, FormProps, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { writeInvoiceAdd } from './module';
import '../../defaultAntd.less';
import { InvoiceWriteInvoiceAdd, InvoiceWriteInvoiceProps } from '../type';

const InvoiceApplyForInvoiceWriteInvoice = (
  props: InvoiceWriteInvoiceProps,
) => {
  const { orderIds, totalMoney, subInvoiceAdd } = props;
  const [addForm] = Form.useForm();
  const [formItem, setFormItem] = useState<
    FromItemProps<keyof FromItemTypeBack>[]
  >(writeInvoiceAdd(false));
  /** 填写发票 - 区分个人还是企业 */
  const [invoiceChange, setinvoiceChange] = useState<number>(0);
  /** 提交发票的loading */
  const [subLoading, setSubLoading] = useState<boolean>(false);
  /** 新增的form初始化参数 */
  const addFormProps: FormProps = {
    ...formPropsInit(),
    form: addForm,
    initialValues: { content: I18N.system.informationAndTechnology },
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  /** 发票提交 */
  const subWriteInvoice = () => {
    addForm.validateFields().then(async (formVal: InvoiceWriteInvoiceAdd) => {
      const subData = formVal;
      // 增值税电子普通发票
      subData.invoiceType = 0;
      subData.type = invoiceChange;
      subData.orderList = orderIds.map(order => ({
        orderId: `${order}`,
      }));
      try {
        setSubLoading(true);
        subInvoiceAdd(subData);
        // 提交成功后将本次的发票信息缓存到本地
        localStorage.setItem('WriteInvoice', JSON.stringify(subData));
      } catch {
        setSubLoading(false);
      }
      setSubLoading(false);
    });
  };
  /** 初始化 - 查看是否有缓存发票 */
  const initWriteInvoice = () => {
    const cacheLocal = localStorage.getItem('WriteInvoice');
    if (cacheLocal) {
      const cacheData: InvoiceWriteInvoiceAdd = JSON.parse(cacheLocal);
      setinvoiceChange(cacheData.type);
      setFormItem(
        cacheData.type === 1 ? writeInvoiceAdd(true) : writeInvoiceAdd(false),
      );
      setTimeout(() => {
        addForm.setFieldsValue(cacheData);
      }, 200);
    }
  };
  useEffect(() => {
    initWriteInvoice();
  }, []);

  return (
    <>
      <div className='invoiceApplyForInvoiceMain invoiceManagementModal invoiceManagementMain'>
        <div className='writeInvoiceMain'>
          <div>
            <div className='writeInvoiceMainTitle'>{I18N.system.invoiceType}</div>
            <div
              style={{ marginBottom: 24 }}
              className='m-t-10 detailInput m-r-40'
            >
              {I18N.system.valueAddedTaxElectronic}</div>
            <div>{I18N.system.headingType}</div>
            <div style={{ marginBottom: 24 }} className='m-t-10'>
              <Radio.Group
                onChange={val => {
                  const radioVal = Number(val.target.value);
                  setinvoiceChange(radioVal);
                  setFormItem(
                    radioVal === 1
                      ? writeInvoiceAdd(true)
                      : writeInvoiceAdd(false),
                  );
                  addForm.resetFields();
                }}
                value={invoiceChange}
              >
                <Radio value={0}>{I18N.system.enterprise}</Radio>
                <Radio value={1}>{I18N.system.personal}</Radio>
              </Radio.Group>
            </div>
            {/* <Row className='customItem'>
            <Col style={{ textAlign: 'right' }} span={3}>
              发票内容：
            </Col>
            <Col span={16}>软件-碳云碳管理系统（税率6%）</Col>
          </Row> */}
            <FormItemUtil antdFormProps={addFormProps} formItems={formItem} />
          </div>
        </div>
      </div>
      <div className='invoiceApplyForInvoiceMainFooter'>
        <div className='footerMain'>
          <div>
            <span>{I18N.system.invoiceAmount}</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: '#0CBF9F' }}>
              ¥{totalMoney}
            </span>
          </div>
          <div>
            <Button
              loading={subLoading}
              onClick={() => subWriteInvoice()}
              style={{ height: 40, width: 140 }}
              type='primary'
            >
              {I18N.components.submit}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceApplyForInvoiceWriteInvoice;
