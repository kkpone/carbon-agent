/* eslint-disable @typescript-eslint/no-unused-vars */
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import { Org } from '@/sdks/systemV2ApiDocs';
import { getEnterprisesystemSysCellPageProps as SearchApiProps } from '@/sdks_v2/new/enterprisesystemV2ApiDocs';

export const searchSchema = (
  orgList: Org[],
): SearchProps<SearchApiProps>['schema'] => ({
  type: 'object',
  properties: {
    likeReportName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.reportName,
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
    likeModeName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.modelName,
    }),
    nameAndCode: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.productNameOr,
    }),
  },
});
