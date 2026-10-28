import I18N from '@src/lang/I18N';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';

import { ChooseSupplyCbamRequest } from './type';

export const searchSchema =
  (): SearchProps<ChooseSupplyCbamRequest>['schema'] => ({
    type: 'object',
    properties: {
      supplyName: xRenderSeachSchema({
        type: 'string',
        placeholder: I18N.carbonFootprint3.supplierName,
      }),
      preName: xRenderSeachSchema({
        type: 'string',
        placeholder: I18N.cbam.nameOfPrecursor,
      }),
      productCategoryName: xRenderSeachSchema({
        type: 'string',
        placeholder: I18N.cbam.productCategory,
      }),
    },
  });
