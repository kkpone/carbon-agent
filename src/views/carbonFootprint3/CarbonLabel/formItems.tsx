import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitType } from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';

import { ApplyForAccountStatusLabel } from './constant';

export const searchTableFormItem = (): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitType('input', '', 'productName', true),
      props: {
        placeholder: I18N.carbonFootprint.productName,
      },
    },
    {
      ...formItemInitType('select', '', 'status', true),
      props: {
        placeholder: I18N.carbonFootprint3.applicationStatus,
        options: Object.keys(ApplyForAccountStatusLabel).map(statusData => ({
          label: ApplyForAccountStatusLabel[statusData],
          value: statusData,
        })),
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      style: { width: '200px' },
      ...back.props,
    };
    return back;
  });
};
