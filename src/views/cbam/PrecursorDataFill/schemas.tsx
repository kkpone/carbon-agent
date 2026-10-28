import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import type { CbamEnumResp } from '@/views/cbam/hook/type';

import { PrecursorDataFillListRequest } from './type';

export const searchSchema = ({
  applyStatusOptions,
}: {
  applyStatusOptions?: CbamEnumResp[];
}): SearchProps<PrecursorDataFillListRequest>['schema'] => ({
  type: 'object',
  properties: {
    companyName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.supplyChainCarbonManagement.customerName,
    }),
    preName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.cbam.nameOfPrecursor,
    }),
    applyStatus: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.supplyChainCarbonManagement.fillInTheApprovalForm,
      enum: compact(applyStatusOptions?.map(v => String(v.code))),
      enumNames: compact(applyStatusOptions?.map(v => v?.name)),
      widget: 'select',
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
    }),
  },
});
