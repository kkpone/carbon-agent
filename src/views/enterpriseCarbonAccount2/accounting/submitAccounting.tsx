import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Modal } from 'antd';
import { isNull } from 'lodash-es';

import { getSourceList } from './fillData/service';
import styles from './index.module.less';
import { computationSubmit } from '../AccountingList/service';

export type EnterpriseAccountingSubmitIssues = {
  emptySourceIds: number[];
  lostFactorSourceIds: number[];
};

type SubmitEnterpriseAccountingParams = {
  computationId?: string | number;
  computationPeriod?: string | number;
  onSuccess?: () => void | Promise<void>;
  onValidationFailed?: (issues: EnterpriseAccountingSubmitIssues) => void;
  refreshComputationInfo?: () => void | Promise<void>;
  showSuccessToast?: boolean;
  skipConfirm?: boolean;
};

export const hasEnterpriseAccountingSubmitIssues = ({
  emptySourceIds,
  lostFactorSourceIds,
}: EnterpriseAccountingSubmitIssues) =>
  emptySourceIds.length > 0 || lostFactorSourceIds.length > 0;

export const getEnterpriseAccountingSubmitIssues = async ({
  computationId,
  computationPeriod,
}: Pick<
  SubmitEnterpriseAccountingParams,
  'computationId' | 'computationPeriod'
>): Promise<EnterpriseAccountingSubmitIssues> => {
  const emptySourceIds: number[] = [];
  const lostFactorSourceIds: number[] = [];
  const sourceList = await getSourceList({
    computationId: computationId?.toString() || '',
    computationPeriod: computationPeriod?.toString(),
  });

  sourceList.rootNodes.forEach(item => ({
    children: item.nodes.forEach(childrenItem => ({
      dataSource: childrenItem.sourceList.forEach(source => {
        const isEmptySource = isNull(source.activityData);

        if (isEmptySource) {
          emptySourceIds.push(source.id);
        }

        if (source.lostFactor) {
          lostFactorSourceIds.push(source.id);
        }
      }),
    })),
  }));

  return {
    emptySourceIds,
    lostFactorSourceIds,
  };
};

export const submitEnterpriseAccounting = async ({
  computationId,
  computationPeriod,
  onSuccess,
  onValidationFailed,
  refreshComputationInfo,
  showSuccessToast = true,
  skipConfirm = false,
}: SubmitEnterpriseAccountingParams) => {
  const issues = await getEnterpriseAccountingSubmitIssues({
    computationId,
    computationPeriod,
  });

  if (hasEnterpriseAccountingSubmitIssues(issues)) {
    onValidationFailed?.(issues);
    return;
  }

  const submit = async () => {
    await computationSubmit({
      computationId: computationId as number,
      computationPeriod: computationPeriod as number,
    });
    if (showSuccessToast) {
      Toast('success', I18N.carbonFootprint.operationSuccessful);
    }
    await refreshComputationInfo?.();
    await onSuccess?.();
  };

  if (skipConfirm) {
    await submit();
    return;
  }

  Modal.confirm({
    className: styles.confirmModal,
    width: 480,
    icon: null,
    title: I18N.enterpriseCarbonAccount2.confirmSubmission,
    content: (
      <div className={styles.confirmModalContent}>
        <span>{I18N.enterpriseCarbonAccount2.accountingAfterSubmission}</span>
        <span className={styles.confirmModalWarnText}>
          {I18N.enterpriseCarbonAccount2.cannotBeRepairedArbitrarily}
        </span>
        <span>
          {I18N.enterpriseCarbonAccount2.ifModificationsAreNeededTheyCanBeMade}
        </span>
      </div>
    ),
    maskClosable: true,
    onOk: submit,
  });
};
