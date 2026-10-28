/**
 * @file 企业碳核算卡和报告卡的复核、第三方认证操作区；专家复核状态与申请由每张卡独立维护。
 */
import I18N from '@src/lang/I18N';
import { message as antdMessage } from 'antd';
import { useEffect, useRef, useState } from 'react';

import style from './index.module.less';
import type { EnterpriseCarbonReviewCertificationActionsProps } from './types';
import EnterpriseCarbonCertificationModal from '../../enterpriseCarbonCertification/EnterpriseCarbonCertificationModal';
import { ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE } from '../../enterpriseCarbonCertification/constants';
import { fetchEnterpriseCarbonCertificationList } from '../../enterpriseCarbonCertification/service';
import { getEnterpriseCarbonCertificationPageType } from '../../enterpriseCarbonCertification/utils';
import EnterpriseCarbonExpertReviewModal from '../../enterpriseCarbonExpertReview/EnterpriseCarbonExpertReviewModal';
import { DEFAULT_ENTERPRISE_CARBON_EXPERT_REVIEW_FOCUS } from '../../enterpriseCarbonExpertReview/constants';
import { fetchEnterpriseCarbonExpertReviewDetails } from '../../enterpriseCarbonExpertReview/list';
import { fetchEnterpriseCarbonExpertReviewPrepareInfo } from '../../enterpriseCarbonExpertReview/prepare';
import {
  applyEnterpriseCarbonExpertReview,
  fetchEnterpriseCarbonExpertReviewStatus,
} from '../../enterpriseCarbonExpertReview/service';
import type {
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewDetail,
  EnterpriseCarbonExpertReviewPrepareInfo,
} from '../../enterpriseCarbonExpertReview/types';
import {
  canOpenEnterpriseCarbonExpertReviewDetail,
  createEnterpriseCarbonExpertReviewApplyParams,
  createEnterpriseCarbonExpertReviewListParams,
  createEnterpriseCarbonExpertReviewPrepareParams,
  createEnterpriseCarbonExpertReviewStatusParams,
  createEnterpriseCarbonExpertReviewTarget,
  createSubmittedEnterpriseCarbonExpertReviewDetail,
  getEnterpriseCarbonExpertReviewButtonLabel,
  getEnterpriseCarbonExpertReviewObjectType,
  getEnterpriseCarbonExpertReviewPrepareDetail,
  getEnterpriseCarbonExpertReviewResponseErrorMessage,
  getPreparedEnterpriseCarbonExpertReviewObjectType,
  isEnterpriseCarbonExpertReviewRequestCancelled,
} from '../../enterpriseCarbonExpertReview/utils';

const getReviewContext = (
  context: EnterpriseCarbonExpertReviewContext,
  year: string,
): EnterpriseCarbonExpertReviewContext => ({
  ...context,
  year,
});

const EnterpriseCarbonReviewCertificationActions = ({
  context,
  interactionDisabled = false,
  onOpenCertification,
  onOpenExpertReview,
  showExpertReview = true,
  showThirdPartyCertification = true,
}: EnterpriseCarbonReviewCertificationActionsProps) => {
  const [certificationListLoading, setCertificationListLoading] =
    useState(false);
  const [certificationModalOpen, setCertificationModalOpen] = useState(false);
  const [reviewStatusDetail, setReviewStatusDetail] =
    useState<EnterpriseCarbonExpertReviewDetail | null>(null);
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);
  const [reviewPrepareInfo, setReviewPrepareInfo] =
    useState<EnterpriseCarbonExpertReviewPrepareInfo | null>();
  const [reviewPurpose, setReviewPurpose] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const operationAbortRef = useRef<AbortController>();
  const operationRequestIdRef = useRef(0);
  const { enterpriseCarbonBizId, enterpriseCarbonBizType, reportId } = context;
  const year = context.year?.trim() || '';

  useEffect(() => {
    if (!showExpertReview || interactionDisabled || !year) {
      setReviewStatusDetail(null);
      setReviewPrepareInfo(null);
      return undefined;
    }

    const abortController = new AbortController();
    const requestContext: EnterpriseCarbonExpertReviewContext = {
      enterpriseCarbonBizType,
      reportId,
      year,
    };
    // 卡片初始化只查询企业状态，用于决定按钮文案，不触发申请流程。
    const statusParams =
      createEnterpriseCarbonExpertReviewStatusParams(requestContext);

    fetchEnterpriseCarbonExpertReviewStatus(
      statusParams,
      abortController.signal,
      { silentResponseError: true },
    )
      .then(response => {
        if (abortController.signal.aborted) {
          return;
        }

        const detail = response.data.data || null;

        if (canOpenEnterpriseCarbonExpertReviewDetail(detail)) {
          setReviewStatusDetail(detail);
          return;
        }

        setReviewStatusDetail(null);
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setReviewStatusDetail(null);
        }
      });

    return () => abortController.abort();
  }, [
    enterpriseCarbonBizId,
    enterpriseCarbonBizType,
    interactionDisabled,
    reportId,
    showExpertReview,
    year,
  ]);

  useEffect(() => {
    operationAbortRef.current?.abort();
    operationRequestIdRef.current += 1;
    setReviewStatusLoading(false);
    setReviewSubmitting(false);

    return () => {
      operationAbortRef.current?.abort();
      operationRequestIdRef.current += 1;
    };
  }, [
    enterpriseCarbonBizId,
    enterpriseCarbonBizType,
    reportId,
    showExpertReview,
    year,
  ]);

  const reviewDisabled =
    !showExpertReview || interactionDisabled || reviewStatusLoading;
  const certificationDisabled = interactionDisabled || certificationListLoading;

  let reviewButtonLabel =
    getEnterpriseCarbonExpertReviewButtonLabel(reviewStatusDetail);

  if (reviewStatusLoading) {
    reviewButtonLabel = I18N.carbonAgent.expertReviewChecking;
  }

  const handleExpertReviewOpen = async () => {
    if (reviewDisabled) {
      return;
    }

    if (!year) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonExpertReviewMissingContext,
      );
      return;
    }

    operationAbortRef.current?.abort();
    const abortController = new AbortController();
    const requestId = operationRequestIdRef.current + 1;
    const requestContext = getReviewContext(context, year);
    const listRequestContext = getReviewContext(context, year);

    operationAbortRef.current = abortController;
    operationRequestIdRef.current = requestId;
    setReviewStatusLoading(true);
    setReviewPrepareInfo(null);

    try {
      /*
       * 卡片点击第一步：先查当前年度全部记录。
       * 有记录直接打开详情，只有空列表才进入 prepare。
       */
      const listParams =
        createEnterpriseCarbonExpertReviewListParams(listRequestContext);
      const reviewDetails = await fetchEnterpriseCarbonExpertReviewDetails(
        listParams,
        abortController.signal,
        { silentResponseError: true },
      );

      if (
        abortController.signal.aborted ||
        operationRequestIdRef.current !== requestId
      ) {
        return;
      }

      const reviewDetail = reviewDetails[0] || null;

      if (
        reviewDetail &&
        canOpenEnterpriseCarbonExpertReviewDetail(reviewDetail)
      ) {
        setReviewStatusDetail(reviewDetail);
      } else {
        setReviewStatusDetail(null);
      }

      if (reviewDetails.length && onOpenExpertReview) {
        onOpenExpertReview(
          createEnterpriseCarbonExpertReviewTarget(
            requestContext,
            reviewDetails,
          ),
        );
        return;
      }

      // 卡片点击第二步：列表为空时获取申请弹窗所需数据。
      const prepareParams =
        createEnterpriseCarbonExpertReviewPrepareParams(requestContext);
      const prepareInfo = await fetchEnterpriseCarbonExpertReviewPrepareInfo(
        prepareParams,
        abortController.signal,
        { silentResponseError: true },
      );

      if (
        abortController.signal.aborted ||
        operationRequestIdRef.current !== requestId
      ) {
        return;
      }

      const prepareDetail = getEnterpriseCarbonExpertReviewPrepareDetail(
        prepareInfo,
        requestContext,
      );

      setReviewPrepareInfo(prepareInfo);

      if (canOpenEnterpriseCarbonExpertReviewDetail(prepareDetail)) {
        setReviewStatusDetail(prepareDetail);
      } else {
        setReviewStatusDetail(null);
      }

      setReviewPurpose('');
      setReviewModalOpen(true);
    } catch (error) {
      if (
        !isEnterpriseCarbonExpertReviewRequestCancelled(
          error,
          abortController.signal,
        )
      ) {
        const responseErrorMessage =
          getEnterpriseCarbonExpertReviewResponseErrorMessage(error);

        if (responseErrorMessage) {
          antdMessage.warning(responseErrorMessage);
        } else {
          antdMessage.error(
            I18N.carbonAgent.enterpriseCarbonExpertReviewLoadFailed,
          );
        }
      }
    } finally {
      if (operationRequestIdRef.current === requestId) {
        setReviewStatusLoading(false);
      }
    }
  };

  const handleCloseExpertReview = () => {
    if (reviewSubmitting) {
      return;
    }

    setReviewModalOpen(false);
  };

  const handleExpertReviewSubmit = async () => {
    if (interactionDisabled || reviewSubmitting) {
      return;
    }

    if (!year) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonExpertReviewMissingContext,
      );
      return;
    }

    if (reviewPrepareInfo?.canApply === false) {
      if (reviewPrepareInfo.disabledReason?.trim()) {
        antdMessage.warning(reviewPrepareInfo.disabledReason.trim());
      }
      return;
    }

    operationAbortRef.current?.abort();
    const abortController = new AbortController();
    const requestId = operationRequestIdRef.current + 1;
    const requestContext = getReviewContext(context, year);
    const listRequestContext = getReviewContext(context, year);
    const fallbackObjectType =
      getEnterpriseCarbonExpertReviewObjectType(requestContext);
    const objectType = getPreparedEnterpriseCarbonExpertReviewObjectType(
      reviewPrepareInfo,
      fallbackObjectType,
    );

    operationAbortRef.current = abortController;
    operationRequestIdRef.current = requestId;
    setReviewSubmitting(true);

    try {
      let submittedPurpose = reviewPurpose.trim();

      if (!submittedPurpose) {
        submittedPurpose =
          I18N.carbonAgent.enterpriseCarbonExpertReviewDefaultPurpose;
      }

      const applyParams = createEnterpriseCarbonExpertReviewApplyParams({
        context: requestContext,
        objectType,
        reviewFocus: DEFAULT_ENTERPRISE_CARBON_EXPERT_REVIEW_FOCUS,
        reviewPurpose: submittedPurpose,
      });

      // 提交申请只使用企业 apply 入参，不传递任何产品碳字段。
      await applyEnterpriseCarbonExpertReview(
        applyParams,
        abortController.signal,
      );

      if (abortController.signal.aborted) {
        return;
      }

      antdMessage.success(
        I18N.carbonAgent.enterpriseCarbonExpertReviewApplySuccess,
      );
      const fallbackDetail = createSubmittedEnterpriseCarbonExpertReviewDetail(
        requestContext,
        reviewPrepareInfo,
        objectType,
      );
      let refreshedReviewDetails: EnterpriseCarbonExpertReviewDetail[] = [];

      try {
        const listParams =
          createEnterpriseCarbonExpertReviewListParams(listRequestContext);
        refreshedReviewDetails = await fetchEnterpriseCarbonExpertReviewDetails(
          listParams,
          abortController.signal,
        );
      } catch {
        refreshedReviewDetails = [];
      }

      if (
        abortController.signal.aborted ||
        operationRequestIdRef.current !== requestId
      ) {
        return;
      }

      let nextReviewDetails = refreshedReviewDetails;

      // list 暂无记录时保留 apply 已成功的待复核详情。
      if (!nextReviewDetails.length) {
        nextReviewDetails = [fallbackDetail];
      }

      const nextReviewDetail = nextReviewDetails[0];

      if (canOpenEnterpriseCarbonExpertReviewDetail(nextReviewDetail)) {
        setReviewStatusDetail(nextReviewDetail);
      } else {
        setReviewStatusDetail(fallbackDetail);
      }

      setReviewPrepareInfo(null);
      setReviewModalOpen(false);
      setReviewPurpose('');
      if (onOpenExpertReview) {
        onOpenExpertReview(
          createEnterpriseCarbonExpertReviewTarget(
            requestContext,
            nextReviewDetails,
          ),
        );
      }
    } catch (error) {
      if (
        !isEnterpriseCarbonExpertReviewRequestCancelled(
          error,
          abortController.signal,
        )
      ) {
        const responseErrorMessage =
          getEnterpriseCarbonExpertReviewResponseErrorMessage(error);

        if (responseErrorMessage) {
          antdMessage.warning(responseErrorMessage);
        } else {
          antdMessage.error(
            I18N.carbonAgent.enterpriseCarbonExpertReviewApplyFailed,
          );
        }
      }
    } finally {
      if (operationRequestIdRef.current === requestId) {
        setReviewSubmitting(false);
      }
    }
  };

  const handleCertificationOpen = async () => {
    if (certificationDisabled) {
      return;
    }

    if (!year) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonCertificationMissingYear,
      );
      return;
    }

    setCertificationListLoading(true);

    try {
      const certificationDetails = await fetchEnterpriseCarbonCertificationList(
        { year },
      );
      const certificationDetail = certificationDetails[0];

      if (certificationDetail && onOpenCertification) {
        onOpenCertification({
          ...context,
          enterpriseCarbonCertificationDetails: certificationDetails,
          enterpriseCarbonCertificationPageType:
            getEnterpriseCarbonCertificationPageType(certificationDetail),
          type: 'enterpriseCarbonCertification',
          year,
        });
        return;
      }

      setCertificationModalOpen(true);
    } catch {
      antdMessage.error(
        I18N.carbonAgent.thirdPartyCertificationStatusLoadFailed,
      );
    } finally {
      setCertificationListLoading(false);
    }
  };

  const handleCertificationModalCancel = () => {
    setCertificationModalOpen(false);
  };

  const handleCertificationModalConfirm = () => {
    setCertificationModalOpen(false);

    if (!onOpenCertification || !year) {
      return;
    }

    onOpenCertification({
      ...context,
      enterpriseCarbonCertificationDraft: true,
      enterpriseCarbonCertificationPageType:
        ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD,
      type: 'enterpriseCarbonCertification',
      year,
    });
  };

  let certificationButtonLabel = I18N.carbonAgent.thirdPartyCertification;

  if (certificationListLoading) {
    certificationButtonLabel = I18N.carbonAgent.thirdPartyCertificationChecking;
  }

  if (!showExpertReview && !showThirdPartyCertification) {
    return null;
  }

  return (
    <>
      <div className={style.actions} onClick={event => event.stopPropagation()}>
        <div className={style.copy}>
          <strong>{I18N.carbonAgent.reviewAndCertification}</strong>
          <span>{I18N.carbonAgent.reviewAndCertificationHint}</span>
        </div>
        <div className={style.buttons}>
          {showExpertReview && (
            <button
              className={style.primaryButton}
              disabled={reviewDisabled}
              type='button'
              onClick={handleExpertReviewOpen}
            >
              {reviewButtonLabel}
            </button>
          )}
          {showThirdPartyCertification && (
            <button
              className={style.secondaryButton}
              disabled={certificationDisabled}
              type='button'
              onClick={handleCertificationOpen}
            >
              {certificationButtonLabel}
            </button>
          )}
        </div>
      </div>
      {showExpertReview && (
        <EnterpriseCarbonExpertReviewModal
          context={context}
          open={reviewModalOpen}
          prepareInfo={reviewPrepareInfo}
          purpose={reviewPurpose}
          submitting={reviewSubmitting}
          onCancel={handleCloseExpertReview}
          onPurposeChange={setReviewPurpose}
          onSubmit={handleExpertReviewSubmit}
        />
      )}
      <EnterpriseCarbonCertificationModal
        open={certificationModalOpen}
        onCancel={handleCertificationModalCancel}
        onConfirm={handleCertificationModalConfirm}
      />
    </>
  );
};

export default EnterpriseCarbonReviewCertificationActions;
