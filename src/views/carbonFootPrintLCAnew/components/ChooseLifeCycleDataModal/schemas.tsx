import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';

import { Product } from '../../ProductManagement/type';

export const searchSchema = (
  productionOptions: Product[],
  productId?: string,
): SearchProps<any>['schema'] => ({
  type: 'object',
  properties: {
    likeProcessName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.processName,
    }),
    productId: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.Factors.productInformation,
      enum: compact(productionOptions.map(u => String(u.id))),
      enumNames: compact(
        productionOptions.map(u => `${u.productName},${u.productCode}`),
      ),
      widget: 'select',
      disabled: !!productId,
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
        defaultValue: productId,
      },
    }),
  },
});
