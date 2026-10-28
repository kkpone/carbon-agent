import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import { Org } from '@/sdks/systemV2ApiDocs';
// import { getYear } from '@/utils';

import { CbamRequest } from './type';

export const searchSchema = (
  orgList: Org[],
): SearchProps<CbamRequest>['schema'] => ({
  type: 'object',
  properties: {
    cbamName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.cbam.reportName,
    }),
    orgId: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonData.affiliatedOrganization,
      enum: compact(orgList.map(u => String(u.id))),
      enumNames: compact(orgList.map(u => u.orgName)),
      widget: 'select',
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
    }),
    factoryName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.cbam.factoryName,
    }),
    // year: xRenderSeachSchema({
    //   type: 'string',
    //   placeholder: '报告年度',
    //   enum: getYear().map(item => `${item}`),
    //   widget: 'select',
    //   props: {
    //     allowClear: true,
    //   },
    // }),
  },
});
