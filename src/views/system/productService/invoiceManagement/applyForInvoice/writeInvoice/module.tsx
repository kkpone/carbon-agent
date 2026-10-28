/*
 * @Author: 张明尧
 * @Date: 2022-10-17 09:43:44
 */
import I18N from '@src/lang/I18N';
import { FromItemProps, FromItemTypeBack } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';

/**
 * 填写发票信息 - 企业或者个人
 * @param showTax 是否显示税号
 * @returns
 */
export const writeInvoiceAdd = (
  showTax: boolean,
): FromItemProps<keyof FromItemTypeBack>[] => {
  const data: FromItemProps<keyof FromItemTypeBack>[] = [
    {
      ...formItemInitInput(I18N.system.invoiceHeader, 'invoiceTitile', true),
      props: {
        maxLength: 100,
      },
    },
    {
      ...formItemInitInput(I18N.system.taxId, 'taxCode', true),
      noShow: showTax,
    },
    {
      ...formItemInitInput(I18N.system.invoiceContent, 'content', false),
      col: 12,
      placeholder: '',
      props: {
        disabled: true,
        // defaultValue: '信息和技术服务-技术服务费 （税率 6%）',
        style: { border: 'none', background: '#F7F8F9', color: '#343A40' },
      },
    },
    {
      ...formItemInitInput(I18N.system.companyRegisteredAddress, 'registeredAddress', false),
      props: {
        maxLength: 200,
      },
    },
    {
      ...formItemInitInput(I18N.system.registrationPhoneNumber, 'registeredPhone', false),
      props: {
        maxLength: 20,
      },
    },
    {
      ...formItemInitInput(I18N.system.openingBank, 'bank', false),
      props: {
        maxLength: 100,
      },
    },
    {
      ...formItemInitInput(I18N.system.bankAccountNumber, 'bankAccount', false),
      props: {
        maxLength: 50,
      },
    },
    {
      ...formItemInitInput(I18N.carbonFootprint.contactPhoneNumber, 'phone', true),
      props: {
        maxLength: 20,
      },
      col: 12,
    },
  ];
  return data
    .map(item => {
      const back = item;
      if (!back.col) {
        back.col = 24;
      }
      return back;
    })
    .filter(item => {
      if (!item.noShow) {
        return true;
      }
      return false;
    });
};
