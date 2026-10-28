import I18N from '@src/lang/I18N';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';

export const searchSchema = (): SearchProps<any>['schema'] => ({
  type: 'object',
  properties: {
    likeName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.Factors.factorName,
    }),
    likeProductName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.Factors.productName,
    }),
  },
});
