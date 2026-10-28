import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { SearchProps } from 'table-render/dist/src/types';

import { xRenderSeachSchema } from '@/components/x-render/TableRender/utils/xRender';

import { OptionsType } from '../../CarbonFootprintModel/type';
import { PROCESS_CATEGORY } from '../ProcessManageTable/constant';

export const searchSchema = ({
  categoryType,
  lifeCycleList,
  researchObjectOption,
}: {
  /** 类别:1 输入; 2 输出; 3 产品 */
  categoryType?: number;
  /** 生命周期阶段option */
  lifeCycleList?: OptionsType[];
  /** 研究对象类型 */
  researchObjectOption?: OptionsType[];
}): SearchProps<any>['schema'] => {
  const ioNamePlaceholder =
    categoryType === PROCESS_CATEGORY.INPUT
      ? I18N.carbonFootPrintLCA.outputName
      : I18N.carbonFootPrintLCA.enterName;
  return {
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
      likeIoName: xRenderSeachSchema({
        type: 'string',
        placeholder: ioNamePlaceholder,
      }),
      researchObject: xRenderSeachSchema({
        type: 'string',
        placeholder: I18N.carbonFootPrintLCA.researchObject2,
        widget: 'select',
        enum: compact(
          researchObjectOption?.map(option => String(option.value)),
        ),
        enumNames: compact(researchObjectOption?.map(option => option.label)),
        props: {
          showSearch: true,
          optionFilterProp: 'label',
          allowClear: true,
        },
        width: 300,
      }),
    },
  };
};
