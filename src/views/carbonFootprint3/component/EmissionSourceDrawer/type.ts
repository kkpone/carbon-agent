import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import { QuickAccountLifeCycleStage } from '../../type';

export type CheckModelProps = {
  // 当前编辑的排放源索引
  current: number;
  // 需要修改的排放源总数
  total: number;
  onChangeCheck: (current: number) => void;
};

export type EmissionSourceDrawerProps = {
  apiExtraParams?: ApiExtraParams;
  // 是否是模型检查状态
  checkModelData?: CheckModelProps;
  // 是否复制状态
  copyStatus?: boolean;
  // 是否是AI模式
  emissionAiFlag?: number;
  // 是否显示发起收数按钮
  showSupplier?: boolean;
  // 是否不显示选择排放源
  noSelectEmissionBtn?: boolean;
  // 携带初始值
  initValues?: Record<string, any>;
  /** 因子信息只能手动填写，不能匹配 */
  onlyCreateFactor?: boolean;
  visible: boolean;
  accountId: number;
  stage: QuickAccountLifeCycleStage;
  quickDrawerMatchWayBtns?: { label: string; value: any }[];
  quickDrawerMatchWayBtnValue?: number;
  emissionSourceId?: number | undefined;
  readPretty?: boolean;
  /** 为 true 时走模型库排放源接口（modelEmission/info|add|edit），否则走核算 accountEmission */
  useModelEmissionApi?: boolean;
  /** 因子选用评价卡片；默认展示，核算抽屉可由上层改为 false */
  showFactorEvaluationCard?: boolean;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
  onTransportReuseSuccess?: () => void | Promise<void>;
  onSuccess: () => void;
  onClose: () => void;
};
