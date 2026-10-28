/*
 * @Author: 张明尧
 * @Date: 2022-10-19 17:48:57
 */
/**
 * 发票管理 - 开票须知
 * @returns
 */
import I18N from '@src/lang/I18N';
import { FormActions } from '@src/components/FormActions';
import './index.less';

const OrderServiceCenterInvoiceNotice = () => (
  <div style={{ marginBottom: 60 }} className='invoiceNoticeMain'>
    <div className='mainTitle text-24 font-weight600'>{I18N.system.invoicingNotice}</div>
    <div className='m-t-20'>
      <span className='font-weight600'>{I18N.system.invoicingTime}</span>
      <span>
        {I18N.system.afterInvoicingApplication}</span>
    </div>
    <div className='m-t-20'>
      <span className='font-weight600'>{I18N.system.billingType}</span>
      <span>
        {I18N.system.ourCompanyDefaultsToOpening}<span className='font-weight600'>{I18N.system.valueAddedTaxElectronic}</span>
        {I18N.system.electronicInvoicesAnd}</span>
    </div>
    <div className='m-t-20'>
      <span className='font-weight600'>{I18N.system.serviceName}</span>
      <span>
        {I18N.system.ourCompanyIssued2}<span className='font-weight600'>{I18N.system.informationAndTechnology2}</span> 。
      </span>
    </div>
    <div className='m-t-20'>
      <span className='font-weight600'>{I18N.system.invoiceTaxRate}</span>
      <span>{I18N.system.ourCompanyIssued}</span>
    </div>
    <div className='font-weight600 m-t-20'>{I18N.system.applyingForValueAddedTax2}</div>
    <div className='m-t-10' style={{ lineHeight: 2 }}>
      {I18N.system.canBeFoundIn}<span className='font-weight600'>{I18N.system.homepageProductService}</span>{' '}
      {I18N.system.viewOrdersInTheMiddle}<span>{I18N.system.controlOverInvoices2}</span>{' '}
      {I18N.system.viewDownloadsInTheMiddle}<br />
      {I18N.system.issuingValueAddedTax2}</div>
    <div className='font-weight600 m-t-20'>{I18N.system.applyingForValueAddedTax}</div>
    <div className='m-t-10 m-b-20' style={{ lineHeight: 2 }}>
      {I18N.system.valueAddedTaxExclusive3}<br />
      {I18N.system.issuingValueAddedTax}<br />
      {I18N.system.valueAddedTaxExclusive2}<span className='font-weight600'>{I18N.system.informationAndTechnology2}</span>{' '}
      {I18N.system.unableToIssueIt}<br /> {I18N.system.paymentInstructions}<br />
      {I18N.system.invoiceDeliveryRequires}{' '}
      <span className='font-weight600'>{I18N.system.valueAddedTaxExclusive}</span>
      {I18N.system.mustUndertakeThisPart}<br />
      {I18N.system.youNeedToGoThrough}<br />
      {I18N.system.corporateAccountLetter}<br />
      {I18N.system.openingBank2}<br /> {I18N.system.accountOpening}<br /> {I18N.system.applyForInvoice}<br />
      {I18N.system.recipientEmailS}<br />
      {I18N.system.completeInvoicing}<br />
      {I18N.system.expressDeliveryReceivingLetter}<br />
      {I18N.system.carbonCloudRelatedAccounts}<br />
      {I18N.system.invoiceAmountAnd}<br />
      {I18N.system.paymentOfExpressDeliveryFees}</div>
    <FormActions
      place='center'
      buttons={[
        {
          title: I18N.carbonFootprint.return,
          onClick: async () => {
            history.back();
          },
        },
      ]}
    />
  </div>
);

export default OrderServiceCenterInvoiceNotice;
