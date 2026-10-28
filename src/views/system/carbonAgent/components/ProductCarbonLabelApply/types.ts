import type { CarbonLabelListData } from '@src/views/carbonFootprint3/CarbonLabel/type';
import type { AddFileDataAndUid } from '@src/views/carbonFootprint3/type';

export type ApplicationContext = {
  projectId?: number | string | null;
  sessionId?: string | null;
  messageId?: number | string | null;
};

export type ProductCarbonLabelApplyProps = ApplicationContext & {
  accountId: string;
  productId?: string;
  applicationId?: string;
  applicationApplyNum?: string;
  forceNew?: boolean;
  preparedApplication?: ApplicationInfo;
  onSubmitted?: (application: CarbonLabelSubmission) => void;
};

export type CarbonLabelSubmission = {
  accountId: string;
  id: string;
  applyNum?: string;
  status?: number;
};

export type ApplicationInfo = Partial<CarbonLabelListData> & {
  companyId?: number;
  version?: number;
  labelPic?: string;
  sourceType?: 'CARBON_CLOUD' | 'AGENT_PAID';
  pointCost?: number;
  pointPaid?: 0 | 1;
  projectId?: number | string | null;
  sessionId?: string | null;
  messageId?: number | string | null;
};

type NullableApplicationFields =
  | 'id'
  | 'status'
  | 'applyNum'
  | 'version'
  | 'labelType'
  | 'labelPic'
  | 'pointCost'
  | 'pointPaid'
  | 'updateBy'
  | 'updateTime'
  | 'errorCode';

export type PreparedApplicationInfo = Omit<
  ApplicationInfo,
  NullableApplicationFields
> & {
  [Key in NullableApplicationFields]?: ApplicationInfo[Key] | null;
};

/** Agent 提交请求字段；不携带审核状态、申请编号等只读数据。 */
export type AgentLabelApplicationPayload = {
  accountId: number;
  productId: number;
  productName: string;
  accountName: string;
  brand: string;
  specsShow: number;
  specs: string;
  productPic: string;
  periodShow: number;
  startTime: string;
  endTime: string;
  contrastShow: number;
  contrastValues: string;
  unitCode?: string;
  unitName?: string;
  projectId: number | string | null;
  sessionId: string | null;
  messageId: number | string | null;
};

export type ApplicationValues = {
  productName: string;
  accountName: string;
  period: string[];
  perEmission: string;
  perEmissionUnit: string;
  productUnitName: string;
  brand: string;
  specs: string;
  specsShow: number;
  periodShow: number;
  contrastShow: number;
  contrastValuesArr: number[];
  productPic: AddFileDataAndUid[];
};
