import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';

/**
 * 碳足迹核算3.0 - 过程核算 - 查询item
 */
export const carbonFootprintProcessBusinessAccountingSearchForm =
  (): FromItemProps<any>[] => {
    const data: FromItemProps<any>[] = [
      {
        ...formItemInitInput('', 'productName', false),
        props: {
          placeholder: I18N.carbonFootprint.productName,
        },
      },
      {
        ...formItemInitInput('', 'productCode', false),
        props: {
          placeholder: I18N.carbonFootprint.productCode,
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
