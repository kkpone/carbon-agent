import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import { AssessmentMapOptions } from '@/utils';

import { SupplyRequest } from './type';

export const searchSchema = ({
  assessmentMethodOptions,
}: {
  assessmentMethodOptions?: AssessmentMapOptions[];
}): SearchProps<SupplyRequest>['schema'] => ({
  type: 'object',
  properties: {
    dataCode: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.supplyChainCarbonManagement.supplierData,
    }),
    assessmentMethod: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.certificationReviewCenter.evaluationMethods,
      widget: 'select',
      enum: compact(
        assessmentMethodOptions?.map(option => String(option.value)),
      ),
      enumNames: compact(assessmentMethodOptions?.map(option => option.label)),
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
      width: 300,
    }),
  },
});
