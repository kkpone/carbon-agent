/*
 * @Author: 张明尧
 * @Date: 2022-07-15 17:30:33
 */
/**
 * 欢迎页的未订阅 合作信息
 * @returns
 */
import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';

/** 欢迎页的未订阅 表头  */
export const carbonAccountHomeNoOrder = (): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitInput(I18N.carbonFootprint.corporateStructure, 'orgName', true),
      props: {
        disabled: true,
        style: { border: 'none', background: '#F7F8F9', color: '#343A40' },
      },
    },
    formItemInitInput(I18N.carbonFootprint.contacts, 'clientName', true),
    formItemInitInput(I18N.carbonFootprint.contactPhoneNumber, 'phonenumber', true),
    formItemInitInput(I18N.carbonFootprint.mailbox, 'email', true),
    {
      ...formItemInitType('textArea', I18N.carbonFootprint.leaveAMessage, 'remark', false),
      props: {
        rows: 4,
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.col = 12;
    if (item.name === 'remark') {
      back.col = 24;
    }
    return back;
  });
};
