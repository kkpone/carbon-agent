/* eslint-disable @typescript-eslint/no-unused-vars */
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import { Org } from '@/sdks/systemV2ApiDocs';

// import { LcaEnumResp } from '../hook/type';

export const searchSchema = (
  orgList: Org[],
  // sourceSystemList: LcaEnumResp[],
): SearchProps<any>['schema'] => ({
  type: 'object',
  properties: {
    nameAndCode: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.productNameOr,
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
    // materialNo: xRenderSeachSchema({
    //   type: 'string',
    //   placeholder: I18N.supplyChainCarbonManagement.materialNumber,
    // }),
    // sourceSystem: xRenderSeachSchema({
    //   type: 'string',
    //   placeholder: I18N.supplyChainCarbonManagement.sourceSystem,
    //   enum: compact(sourceSystemList.map(s => String(s.code))),
    //   enumNames: compact(sourceSystemList.map(s => s.name)),
    //   widget: 'select',
    //   props: {
    //     showSearch: true,
    //     optionFilterProp: 'label',
    //     allowClear: true,
    //   },
    // }),
  },
});
