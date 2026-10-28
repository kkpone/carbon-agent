import I18N from '@src/lang/I18N';

import {
  dataOverviewSchema,
  dataRequirementsSchema,
  filledDataSchema,
} from './schema';

export const TABS_TYPE = {
  /** 数据概览 */
  DATA_OVERVIEW: 'dataOverview',
  /** 数据要求 */
  DATA_REQUIREMENT: 'dataRequirements',
  /** 填报数据 */
  FILLED_DATA: 'filledData',
  /** 审批详情 */
  APPROVAL_DETAIL: 'approvalDetail',
};

const { DATA_OVERVIEW, DATA_REQUIREMENT, FILLED_DATA, APPROVAL_DETAIL } =
  TABS_TYPE;

export const TAB_LIST = [
  {
    label: I18N.supplyChainCarbonManagement.dataOverview,
    key: DATA_OVERVIEW,
  },
  {
    label: I18N.supplyChainCarbonManagement.dataRequirements,
    key: DATA_REQUIREMENT,
  },
  {
    label: I18N.carbonFootprint3.fillingInData,
    key: FILLED_DATA,
  },
  {
    label: I18N.eca.reviewDetails,
    key: APPROVAL_DETAIL,
  },
];

/** 审核状态 */
export const AUDIT_STATUS = {
  /** 待审核 */
  PENDING: 0,
  /** 审核通过 */
  APPROVED: 1,
  /** 审核不通过 */
  REJECTED: 2,
};

export const getSchemas = (currentTab: string, unit: string) => {
  const schemaMap = {
    [DATA_OVERVIEW]: dataOverviewSchema(),
    [DATA_REQUIREMENT]: dataRequirementsSchema(),
    [FILLED_DATA]: filledDataSchema(unit),
    [APPROVAL_DETAIL]: undefined,
  };

  return schemaMap[currentTab as keyof typeof schemaMap];
};
