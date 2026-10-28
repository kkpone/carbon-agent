import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';

import { IOFactorRequest } from './type';
import { OptionsType } from '../../type';

export const searchSchema = ({
  lifeCycleList,
}: {
  /** 生命周期阶段option */
  lifeCycleList?: OptionsType[];
}): SearchProps<IOFactorRequest>['schema'] => ({
  type: 'object',
  properties: {
    lifeCycleId: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.lifeCycleStage,
      widget: 'select',
      enum: compact(lifeCycleList?.map(option => String(option.value))),
      enumNames: compact(lifeCycleList?.map(option => option.label)),
      props: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: true,
      },
      width: 300,
    }),
    likeProcessName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.carbonFootPrintLCA.processName,
    }),
    likeIoName: xRenderSeachSchema({
      type: 'string',
      placeholder: I18N.eca.name,
    }),
  },
});
