import I18N from '@src/lang/I18N';

export enum AccountShareFlag {
  None = 0,
  SharedSource = 1,
  SharedModel = 3,
  Collecting = 4,
  Collected = 5,
}

export enum AccountShareType {
  ModelOnly = 1,
  CreateCollectionTask = 2,
  BindSupplier = 3,
}

const sharedAccountFlags = new Set<number>([
  AccountShareFlag.SharedModel,
  AccountShareFlag.Collecting,
  AccountShareFlag.Collected,
]);

export const isSharedAccount = (shareFlag?: number | null) =>
  sharedAccountFlags.has(Number(shareFlag));

export const isCollectingSharedAccount = (shareFlag?: number | null) =>
  Number(shareFlag) === AccountShareFlag.Collecting;

export const getAccountShareFlagText = (shareFlag?: number | null) => {
  switch (Number(shareFlag)) {
    case AccountShareFlag.SharedSource:
      return I18N.carbonFootprint3.shared;
    case AccountShareFlag.SharedModel:
      return I18N.carbonFootprint3.sharedModel;
    case AccountShareFlag.Collecting:
      return I18N.carbonFootprint3.sharedModelCollecting;
    case AccountShareFlag.Collected:
      return I18N.carbonFootprint3.sharedModelCollected;
    default:
      return '';
  }
};

export const canShowModelShareAction = (params: {
  accountStatus?: number;
  finishStatus: number;
  shareFlag?: number | null;
}) =>
  params.accountStatus === params.finishStatus &&
  !isSharedAccount(params.shareFlag);

export const canShowShareAction = (shareFlag?: number | null) =>
  !isSharedAccount(shareFlag);

/** 源核算已执行过模型共享（shareFlag=1）时可查看共享记录 */
export const canShowShareRecordAction = (shareFlag?: number | null) =>
  Number(shareFlag) === AccountShareFlag.SharedSource;

/** 共享记录 - 共享方式文案 */
export const getAccountShareTypeText = (shareType?: number | null) => {
  switch (Number(shareType)) {
    case AccountShareType.ModelOnly:
      return I18N.carbonFootprint3.onlyShareModel;
    case AccountShareType.CreateCollectionTask:
      return I18N.carbonFootprint3.createCollectionTask;
    case AccountShareType.BindSupplier:
      return I18N.carbonFootprint3.supplierBinding;
    default:
      return '-';
  }
};

/**
 * 受共享方是否展示「提交」：account/info shareStatus=1 或 4 时展示
 */
export const canShowShareModelSubmitAction = (params: {
  shareStatus?: number | null;
}) => {
  const shareStatus = Number(params.shareStatus);
  return shareStatus === 1 || shareStatus === 4;
};

/** shareFlag=5 共享模型-已收数 */
export const isShareModelCollected = (shareFlag?: number | null) =>
  Number(shareFlag) === AccountShareFlag.Collected;

/** thirdId 是否有值（关联第三方/共享源核算） */
export const hasAccountThirdId = (thirdId?: string | number | null) =>
  thirdId != null && String(thirdId).trim() !== '';

/**
 * 共享模型收数中/已收数且绑定 thirdId 时，核算详情只读
 * （shareFlag=4 或 5，且数据库 thirdId 有值）
 */
export const isShareModelThirdReadOnlyAccount = (params?: {
  shareFlag?: number | null;
  thirdId?: string | number | null;
}) => {
  if (!params || !hasAccountThirdId(params.thirdId)) {
    return false;
  }
  const shareFlag = Number(params.shareFlag);
  return (
    shareFlag === AccountShareFlag.Collecting ||
    shareFlag === AccountShareFlag.Collected
  );
};

/** 模型共享弹窗 - 共享类型选项 */
export const getModelShareTypeOptions = () => [
  {
    value: AccountShareType.ModelOnly,
    label: I18N.carbonFootprint3.onlyShareModel,
  },
  {
    value: AccountShareType.CreateCollectionTask,
    label: I18N.carbonFootprint3.createCollectionTask,
  },
  {
    value: AccountShareType.BindSupplier,
    label: I18N.carbonFootprint3.supplierBinding,
  },
];

/** 共享记录 status：0 空白 / 1 待填报 / 2 待审核 / 3 完成收数 / 4 已驳回 */
export const MODEL_SHARE_RECORD_STATUS = {
  EMPTY: 0,
  PENDING_FILL: 1,
  PENDING_REVIEW: 2,
  COMPLETED: 3,
  REJECTED: 4,
} as const;

export type ModelShareRecordStatusMeta = {
  label: string;
  /** 是否展示状态标签，0 或空时不展示 */
  showTag: boolean;
  className?: 'pendingFill' | 'pendingReview' | 'done' | 'rejected';
};

/** 共享记录 - 状态文案与样式类型 */
export const getModelShareRecordStatusMeta = (
  status?: number | null,
): ModelShareRecordStatusMeta => {
  switch (Number(status)) {
    case MODEL_SHARE_RECORD_STATUS.PENDING_FILL:
      return {
        label: I18N.carbonFootprint3.shareRecordStatusPendingFill,
        showTag: true,
        className: 'pendingFill',
      };
    case MODEL_SHARE_RECORD_STATUS.PENDING_REVIEW:
      return {
        label: I18N.carbonFootprint3.pendingReview,
        showTag: true,
        className: 'pendingReview',
      };
    case MODEL_SHARE_RECORD_STATUS.COMPLETED:
      return {
        label: I18N.carbonFootprint3.shareStatusCompleted,
        showTag: true,
        className: 'done',
      };
    case MODEL_SHARE_RECORD_STATUS.REJECTED:
      return {
        label: I18N.carbonFootprint3.shareRecordStatusRejected,
        showTag: true,
        className: 'rejected',
      };
    default:
      return { label: '', showTag: false };
  }
};

/** @deprecated 请使用 getModelShareRecordStatusMeta */
export const getAccountShareRecordStatusText = (status?: number | null) =>
  getModelShareRecordStatusMeta(status).label;
