import I18N from '@src/lang/I18N';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';

import { ChooseCbamRequest } from './type';

export const searchSchema = (): SearchProps<ChooseCbamRequest>['schema'] => ({
  type: 'object',
  properties: {
    productName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.Factors.productName,
    }),
    cbamName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.cbam.reportName,
    }),
  },
});
