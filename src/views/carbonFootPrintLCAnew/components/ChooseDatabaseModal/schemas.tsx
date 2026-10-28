import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';
import { getYear } from '@/utils';

import { LcaDb } from '../../hook/type';

export const searchSchema = ({
  databaseOption,
}: {
  databaseOption?: LcaDb[];
}): SearchProps<any>['schema'] => ({
  type: 'object',
  properties: {
    likeFactorName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.activityName,
    }),
    likeProductName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.associatedProductName,
    }),
    year: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.Factors.yearOfPublication,
      enum: getYear().map(item => `${item}`),
      widget: 'select',
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
    }),
    likeAreaRepresent: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.Factors.geographicalRepresentativeness,
    }),
    lcaDbId: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.databaseName,
      widget: 'select',
      enum: compact(databaseOption?.map(option => String(option?.id))),
      enumNames: compact(databaseOption?.map(option => option?.dbName)),
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
    }),
  },
});
