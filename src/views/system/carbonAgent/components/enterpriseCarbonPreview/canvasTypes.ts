import type { PageInfoType } from '@/router/type';
import type { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';

import type {
  EnterpriseCarbonTaskAvailabilities,
  EnterpriseCarbonTaskType,
} from '../EnterpriseCarbonProjectTasks/type';

export type EnterpriseCarbonCanvasNodeKind =
  | 'org'
  | 'scope'
  | 'classify'
  | 'group'
  | 'source';

export type EnterpriseCarbonCanvasActionType =
  | 'addSource'
  | 'associateProductFootprint'
  | 'sourceDelete'
  | 'sourceDetail'
  | 'sourceHistory'
  | 'sourceAttachment';

export type EnterpriseCarbonCanvasAttachment = {
  id: number | string;
  name: string;
  url: string;
};

export type EnterpriseCarbonCanvasActionPayload = {
  computationId: string;
  computationPeriod?: string;
  groupId?: number;
  id?: string;
  initGhgCategory?: string;
  initGhgClassify?: string;
  isShare?: boolean;
  pageInfoType: PageInfoType;
  readPretty?: boolean;
  supportImg?: EnterpriseCarbonCanvasAttachment[];
  title?: string;
  versionType?: EVersionType;
};

export type EnterpriseCarbonCanvasAction = {
  nodeId?: string;
  payload: EnterpriseCarbonCanvasActionPayload;
  type: EnterpriseCarbonCanvasActionType;
};

export type EnterpriseCarbonCanvasTaskContext = {
  accountingSubjectId: string;
  availableTaskTypes: EnterpriseCarbonTaskType[];
  categoryId: string;
  emissionSourceId: number | string;
  emissionSourceName: string;
  scopeCode: string;
  taskAvailabilities?: EnterpriseCarbonTaskAvailabilities;
  versionType?: EVersionType;
};

export type EnterpriseCarbonCanvasNode = {
  actionPayload?: EnterpriseCarbonCanvasActionPayload;
  activityData?: string | number | null;
  activityUnitDesc?: string;
  categoryCode?: string;
  categoryVersionType?: EVersionType;
  children?: EnterpriseCarbonCanvasNode[];
  classifyCode?: string;
  classifyVersionType?: EVersionType;
  color?: string;
  collapsed?: boolean;
  emissionQuantity?: string | number | null;
  facility?: string;
  finishCount?: number;
  hasChildren?: boolean;
  hasSourceChildren?: boolean;
  icon?: string;
  iconFlipX?: boolean;
  id: string;
  incomplete?: boolean;
  label?: string | number | null;
  nodeHeight: number;
  nodeKind: EnterpriseCarbonCanvasNodeKind;
  nodeWidth: number;
  productFootprintAssociationEnabled?: boolean;
  isProductCarbon?: boolean;
  rate?: string;
  supportImg?: EnterpriseCarbonCanvasAttachment[];
  subtitle?: string;
  taskContext?: EnterpriseCarbonCanvasTaskContext;
  taskSelectable?: boolean;
  taskSelected?: boolean;
  totalCount?: number;
};
