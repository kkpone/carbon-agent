/*
 * @Author: 张明尧
 * @Date: 2022-10-17 19:13:55
 */
/**
 * 发票管理 - 申请发票 - 开具发票
 * @returns
 */
import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import IconFont from '@src/components/iconfont';
import VerifyUtils from '@src/utils/verifty';
import { Button, Checkbox, Form, FormProps, Modal, Radio } from 'antd';
import { RouteMaps } from '@src/router/route-paths';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../index.less';
import { InvoiceConfirmInvoiceProps } from '../type';
import { writeInvoiceAdd } from '../writeInvoice/module';
import { postWriteInvoiceAdd } from '../writeInvoice/service';

const InvoiceApplyForConfirmInvoice = (props: InvoiceConfirmInvoiceProps) => {
  const history = useHistory();
  const { addData, totalMoney, invoiceBack } = props;
  /** 提交发票的loading */
  const [subLoading, setSubLoading] = useState<boolean>(false);
  /** 弹框 */
  const [showModal, setShowModal] = useState<boolean>(false);
  /** 是否勾选服务协议 */
  const [checkAgreement, setCheckAgreement] = useState<boolean>(false);
  const [addForm] = Form.useForm();
  /** 新增的form初始化参数 */
  const addFormProps: FormProps = {
    ...formPropsInit(),
    form: addForm,
    initialValues: addData,
    disabled: true,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  /** 确认开具发票 */
  const subInvoice = async () => {
    if (!checkAgreement) {
      VerifyUtils.Toast(400, I18N.system.pleaseCheckOkFirst);
    } else {
      setSubLoading(true);
      try {
        const back = await postWriteInvoiceAdd(addData);
        if (back.data.code === 200) {
          setShowModal(true);
          invoiceBack();
        }
      } catch {
        setSubLoading(false);
      }
      setSubLoading(false);
    }
  };
  return (
    <>
      <div className='invoiceApplyForInvoiceMain invoiceManagementModal invoiceManagementMain'>
        <div className='writeInvoiceMain'>
          <div>
            <div className='writeInvoiceMainTitle'>
              {I18N.system.invoiceType}
            </div>
            <div
              style={{ marginBottom: 24 }}
              className='m-t-10 detailInput m-r-40'
            >
              {I18N.system.valueAddedTaxElectronic}
            </div>
            <div>{I18N.system.headingType}</div>
            <div style={{ marginBottom: 24 }} className='m-t-10'>
              <Radio.Group value={addData.type}>
                <Radio value={0}>{I18N.system.enterprise}</Radio>
                <Radio value={1}>{I18N.system.personal}</Radio>
              </Radio.Group>
            </div>
            <FormItemUtil
              antdFormProps={addFormProps}
              formItems={writeInvoiceAdd(addData.type === 1)}
            />
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
          <div style={{ height: 60, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              value={checkAgreement}
              onChange={checkedValue => {
                setCheckAgreement(checkedValue.target.checked);
              }}
            >
              {I18N.system.iHaveInvoicingInformation}
            </Checkbox>
            <Button
              loading={subLoading}
              onClick={() => subInvoice()}
              style={{ height: 40, minWidth: 140, marginLeft: 12 }}
              type='primary'
            >
              {I18N.system.confirmIssuanceAndIssuance}
            </Button>
          </div>
        </div>
      </div>
      <Modal
        title=''
        width={400}
        wrapClassName='orderServiceInvoiceModal'
        maskClosable={false}
        open={showModal}
        getContainer={false}
        footer={null}
        onOk={() => {}}
        closable={false}
        onCancel={() => {
          setShowModal(false);
        }}
      >
        <div className='orderServiceCenterModalBody'>
          <span className='cursorPointerFont closeIcon'>
            <IconFont
              style={{ fontSize: 18, fontWeight: 500 }}
              onClick={() => {
                setShowModal(false);
              }}
              type='icon-icon-shanshu'
            />
          </span>
          <div className='modalTitle'>{I18N.system.inInvoicing}</div>
          <div className='modalMain'>
            <IconFont style={{ fontSize: 90 }} type='icon-icon-chenggong-3' />
            <div style={{ fontSize: 16 }} className='m-t-16'>
              {I18N.system.submittedSuccessfully}
            </div>
            <div className='m-t-10'>{I18N.system.invoicesWillBeIssuedOn}</div>
            <div style={{ marginTop: 24 }}>
              <Button
                style={{ width: 70 }}
                onClick={() => {
                  RouteMaps;
                  setShowModal(false);
                  history.push(RouteMaps.homeInvoiceManagement);
                }}
                type='primary'
              >
                {I18N.carbonFootprint.confirm}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InvoiceApplyForConfirmInvoice;
