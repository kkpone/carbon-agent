import I18N from '@src/lang/I18N';

import { dataRequirementsSchema, filledDataSchema } from './schema';

export const TABS_TYPE = {
  /** 数据请求 */
  DATA_REQUIREMENT: 'dataRequirements',
  /** 数据填报 */
  FILLED_DATA: 'filledData',
};
const { DATA_REQUIREMENT, FILLED_DATA } = TABS_TYPE;

export const TAB_LIST = [
  {
    label: I18N.supplyChainCarbonManagement.dataRequest,
    key: DATA_REQUIREMENT,
  },
  {
    label: I18N.supplyChainCarbonManagement.dataReporting,
    key: FILLED_DATA,
  },
];

export const getSchemas = (
  currentTab: string,
  isDetail: boolean,
  unit: string,
) => {
  const schemaMap = {
    [DATA_REQUIREMENT]: { schema: dataRequirementsSchema(), readPretty: true },
    [FILLED_DATA]: { schema: filledDataSchema(unit), readPretty: isDetail },
  };
  return schemaMap[currentTab as keyof typeof schemaMap];
};
