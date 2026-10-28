import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import I18N from '@/lang/I18N';
import { Org } from '@/sdks/systemV2ApiDocs';
import { AssessmentMapOptions } from '@/utils';

import { AssessmentRequest } from '../type';

/** 模型方案表格搜索区域  */
export const modelPlanSearchSchema = ({
  assessmentMethodOptions,
}: // orgList,
{
  assessmentMethodOptions?: AssessmentMapOptions[];
  orgList?: Org[];
}): SearchProps<AssessmentRequest>['schema'] => ({
  type: 'object',
  properties: {
    likeModelName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.modelName,
    }),
    modelCode: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.certificationReviewCenter.modelCoding,
    }),
    // orgId: xRenderSeachSchema({
    //   type: 'string',
    //   placeholder: I18N.carbonData.affiliatedOrganization,
    //   enum: compact(orgList?.map(u => String(u.id))),
    //   enumNames: compact(orgList?.map(u => u.orgName)),
    //   widget: 'select',
    //   props: {
    //     showSearch: true,
    //     optionFilterProp: 'label',
    //     allowClear: true,
    //   },
    // }),
    likePlanName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.certificationReviewCenter.planName,
    }),
    assessmentMethod: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.certificationReviewCenter.evaluationMethods,
      widget: 'select',
      enum: compact(assessmentMethodOptions?.map(v => v.value)),
      enumNames: compact(assessmentMethodOptions?.map(v => v.label)),
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
    }),
  },
});
