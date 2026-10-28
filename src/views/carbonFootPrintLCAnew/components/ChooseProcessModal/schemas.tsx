import I18N from '@src/lang/I18N';
// import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import { Org } from '@/sdks/systemV2ApiDocs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const searchSchema = (_orgList: Org[]): SearchProps<any>['schema'] => ({
  type: 'object',
  properties: {
    likeProcessLibName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.processName,
    }),
    // orgId: xRenderSeachSchema({
    //   type: 'string',
    //   placeholder: I18N.carbonData.affiliatedOrganization,
    //   enum: compact(orgList.map(u => String(u.id))),
    //   enumNames: compact(orgList.map(u => u.orgName)),
    //   widget: 'select',
    //   props: {
    //     showSearch: true,
    //     optionFilterProp: 'label',
    //     allowClear: true,
    //   },
    // }),
  },
});
