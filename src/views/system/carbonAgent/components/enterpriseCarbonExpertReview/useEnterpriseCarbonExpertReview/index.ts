/**
 * @file 企业碳专家复核顶部入口、提交刷新及两路只增不聚焦的自动恢复。
 */
import I18N from '@src/lang/I18N';
import { message as antdMessage } from 'antd';
import { useEffect, useRef, useState } from 'react';

import type {
  UseEnterpriseCarbonExpertReviewOptions,
  UseEnterpriseCarbonExpertReviewResult,
} from './types';
import { DEFAULT_ENTERPRISE_CARBON_EXPERT_REVIEW_FOCUS } from '../constants';
import { fetchEnterpriseCarbonExpertReviewDetails } from '../list';
import { fetchEnterpriseCarbonExpertReviewPrepareInfo } from '../prepare';
import { applyEnterpriseCarbonExpertReview } from '../service';
import type {
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewDetail,
  EnterpriseCarbonExpertReviewPrepareInfo,
  EnterpriseCarbonExpertReviewTarget,
} from '../types';
import {
  createEnterpriseCarbonExpertReviewApplyParams,
  createEnterpriseCarbonExpertReviewListParams,
  createEnterpriseCarbonExpertReviewPrepareParams,
  createEnterpriseCarbonExpertReviewTarget,
  createSubmittedEnterpriseCarbonExpertReviewDetail,
  getEnterpriseCarbonExpertReviewContextKey,
  getEnterpriseCarbonExpertReviewObjectType,
  getEnterpriseCarbonExpertReviewResponseErrorMessage,
  getEnterpriseCarbonExpertReviewYear,
  getPreparedEnterpriseCarbonExpertReviewObjectType,
  getValidEnterpriseCarbonExpertReviewDetails,
  isEnterpriseCarbonExpertReviewRequestCancelled,
} from '../utils';

const EMPTY_RESTORE_CONTEXTS: EnterpriseCarbonExpertReviewContext[] = [];

const getRestoreContextKey = (context?: EnterpriseCarbonExpertReviewContext) =>
  getEnterpriseCarbonExpertReviewContextKey(context);

export const useEnterpriseCarbonExpertReview = ({
  autoRestoreAccountContexts = EMPTY_RESTORE_CONTEXTS,
  autoRestoreEnabled = true,
  autoRestoreSourceContext,
  readonly = false,
  onOpenDetail,
}: UseEnterpriseCarbonExpertReviewOptions): UseEnterpriseCarbonExpertReviewResult => {
  const [checking, setChecking] = useState(false);
  const [context, setContext] = useState<EnterpriseCarbonExpertReviewContext>();
  const [modalOpen, setModalOpen] = useState(false);
  const [prepareInfo, setPrepareInfo] =
    useState<EnterpriseCarbonExpertReviewPrepareInfo | null>();
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const operationAbortRef = useRef<AbortController>();
  const operationRequestIdRef = useRef(0);
  const refreshRequestIdRef = useRef(0);
  const restoredAccountKeysRef = useRef(new Set<string>());
  const restoredSourceKeyRef = useRef('');
  const onOpenDetailRef = useRef(onOpenDetail);
  const autoRestoreAccountContextsRef = useRef(autoRestoreAccountContexts);
  const autoRestoreSourceContextRef = useRef(autoRestoreSourceContext);

  onOpenDetailRef.current = onOpenDetail;
  autoRestoreAccountContextsRef.current = autoRestoreAccountContexts;
  autoRestoreSourceContextRef.current = autoRestoreSourceContext;

  const autoRestoreAccountContextsKey = autoRestoreAccountContexts
    .map(getRestoreContextKey)
    .filter(Boolean)
    .sort()
    .join('|');

  useEffect(
    () => () => {
      operationAbortRef.current?.abort();
      operationRequestIdRef.current += 1;
      refreshRequestIdRef.current += 1;
    },
    [],
  );

  useEffect(() => {
    if (readonly || !autoRestoreEnabled || !autoRestoreAccountContextsKey) {
      restoredAccountKeysRef.current.clear();
      return undefined;
    }

    const abortController = new AbortController();
    autoRestoreAccountContextsRef.current.forEach(restoreContext => {
      const restoreKey = getRestoreContextKey(restoreContext);

      if (!restoreKey || restoredAccountKeysRef.current.has(restoreKey)) {
        return;
      }

      restoredAccountKeysRef.current.add(restoreKey);
      const listParams =
        createEnterpriseCarbonExpertReviewListParams(restoreContext);

      fetchEnterpriseCarbonExpertReviewDetails(
        listParams,
        abortController.signal,
        { silentResponseError: true },
      )
        .then(details => {
          if (abortController.signal.aborted) {
            return;
          }

          const validDetails =
            getValidEnterpriseCarbonExpertReviewDetails(details);

          if (!validDetails.length) {
            return;
          }

          onOpenDetailRef.current(
            createEnterpriseCarbonExpertReviewTarget(
              restoreContext,
              validDetails,
            ),
            { focus: false },
          );
        })
        .catch(error => {
          if (
            !isEnterpriseCarbonExpertReviewRequestCancelled(
              error,
              abortController.signal,
            )
          ) {
            restoredAccountKeysRef.current.delete(restoreKey);
          }
        });
    });

    return () => {
      abortController.abort();
    };
  }, [autoRestoreAccountContextsKey, autoRestoreEnabled, readonly]);

  const autoRestoreSourceKey = getRestoreContextKey(autoRestoreSourceContext);

  useEffect(() => {
    if (
      readonly ||
      !autoRestoreEnabled ||
      !autoRestoreSourceContextRef.current ||
      !autoRestoreSourceKey
    ) {
      restoredSourceKeyRef.current = '';
      return undefined;
    }

    if (restoredSourceKeyRef.current === autoRestoreSourceKey) {
      return undefined;
    }

    restoredSourceKeyRef.current = autoRestoreSourceKey;
    const abortController = new AbortController();
    const restoreContext = autoRestoreSourceContextRef.current;

    if (!restoreContext) {
      return undefined;
    }

    const listParams =
      createEnterpriseCarbonExpertReviewListParams(restoreContext);

    fetchEnterpriseCarbonExpertReviewDetails(
      listParams,
      abortController.signal,
      { silentResponseError: true },
    )
      .then(details => {
        if (abortController.signal.aborted) {
          return;
        }

        const validDetails =
          getValidEnterpriseCarbonExpertReviewDetails(details);

        if (!validDetails.length) {
          return;
        }

        onOpenDetailRef.current(
          createEnterpriseCarbonExpertReviewTarget(
            restoreContext,
            validDetails,
          ),
          { focus: false },
        );
      })
      .catch(() => undefined);

    return () => {
      abortController.abort();
    };
  }, [autoRestoreEnabled, autoRestoreSourceKey, readonly]);

  const close = () => {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  };

  const open = async (target: EnterpriseCarbonExpertReviewTarget) => {
    if (readonly) {
      return;
    }

    const year = getEnterpriseCarbonExpertReviewYear(target);

    if (!year) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonExpertReviewMissingContext,
      );
      return;
    }

    operationAbortRef.current?.abort();
    const abortController = new AbortController();
    const requestId = operationRequestIdRef.current + 1;
    const requestContext: EnterpriseCarbonExpertReviewContext = {
      ...target,
      messageId: undefined,
      projectId: undefined,
      year,
    };

    operationAbortRef.current = abortController;
    operationRequestIdRef.current = requestId;
    setChecking(true);
    setPrepareInfo(null);

    try {
      // 顶部入口与产品交互顺序一致：直接 prepare，不先查询 list。
      const prepareParams =
        createEnterpriseCarbonExpertReviewPrepareParams(requestContext);
      const nextPrepareInfo =
        await fetchEnterpriseCarbonExpertReviewPrepareInfo(
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

      setContext(requestContext);
      setPrepareInfo(nextPrepareInfo);
      setPurpose('');
      setModalOpen(true);
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
        setChecking(false);
      }
    }
  };

  const submit = async () => {
    if (readonly || !context || submitting) {
      return;
    }

    const year = getEnterpriseCarbonExpertReviewYear(context);

    if (!year) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonExpertReviewMissingContext,
      );
      return;
    }

    if (prepareInfo?.canApply === false) {
      if (prepareInfo.disabledReason?.trim()) {
        antdMessage.warning(prepareInfo.disabledReason.trim());
      }
      return;
    }

    operationAbortRef.current?.abort();
    const abortController = new AbortController();
    const fallbackObjectType =
      getEnterpriseCarbonExpertReviewObjectType(context);
    const objectType = getPreparedEnterpriseCarbonExpertReviewObjectType(
      prepareInfo,
      fallbackObjectType,
    );
    const requestContext: EnterpriseCarbonExpertReviewContext = {
      ...context,
      messageId: undefined,
      projectId: undefined,
      year,
    };
    const operationRequestId = operationRequestIdRef.current + 1;
    const refreshRequestId = refreshRequestIdRef.current + 1;

    operationAbortRef.current = abortController;
    operationRequestIdRef.current = operationRequestId;
    refreshRequestIdRef.current = refreshRequestId;
    setSubmitting(true);

    try {
      let reviewPurpose = purpose.trim();

      if (!reviewPurpose) {
        reviewPurpose =
          I18N.carbonAgent.enterpriseCarbonExpertReviewDefaultPurpose;
      }

      const applyParams = createEnterpriseCarbonExpertReviewApplyParams({
        context: requestContext,
        objectType,
        reviewFocus: DEFAULT_ENTERPRISE_CARBON_EXPERT_REVIEW_FOCUS,
        reviewPurpose,
      });

      // apply 成功后再查询 list，确保详情标签使用后端最新记录。
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
        prepareInfo,
        objectType,
      );

      setModalOpen(false);
      setPrepareInfo(null);
      setPurpose('');
      setContext(undefined);

      let refreshedDetails: EnterpriseCarbonExpertReviewDetail[] = [];

      try {
        const listParams =
          createEnterpriseCarbonExpertReviewListParams(requestContext);
        refreshedDetails = await fetchEnterpriseCarbonExpertReviewDetails(
          listParams,
          abortController.signal,
        );
      } catch {
        refreshedDetails = [];
      }

      if (
        abortController.signal.aborted ||
        refreshRequestIdRef.current !== refreshRequestId
      ) {
        return;
      }

      let nextDetails = refreshedDetails;

      if (!nextDetails.length) {
        nextDetails = [fallbackDetail];
      }

      onOpenDetailRef.current(
        createEnterpriseCarbonExpertReviewTarget(requestContext, nextDetails),
        { focus: true },
      );
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
      if (operationRequestIdRef.current === operationRequestId) {
        setSubmitting(false);
      }
    }
  };

  return {
    checking,
    close,
    context,
    modalOpen,
    open,
    prepareInfo,
    purpose,
    setPurpose,
    submit,
    submitting,
  };
};
