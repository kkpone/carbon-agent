import I18N from '@src/lang/I18N';
// import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
// import { Org } from '@/sdks/systemV2ApiDocs';
import { getEnterprisesystemSysCellPageProps as SearchApiProps } from '@/sdks_v2/new/enterprisesystemV2ApiDocs';
// import { SearchSchemaSelectUtils } from '@/utils/schema';

export const searchSchema = (): // orgsList: Org[],
SearchProps<SearchApiProps>['schema'] => ({
  type: 'object',
  properties: {
    likeProcessLibName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.processSetName,
    }),
    /** 暂时去掉 */
    // orgId: xRenderSeachSchema({
    //   type: 'string',
    //   placeholder: I18N.carbonData.affiliatedOrganization,
    //   enum: compact(orgsList?.map(u => String(u.id))),
    //   enumNames: compact(orgsList?.map(u => u.orgName)),
    //   widget: 'select',
    //   props: {
    //     ...SearchSchemaSelectUtils,
    //   },
    // }),
  },
});
