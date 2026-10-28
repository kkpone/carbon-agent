import I18N from '@src/lang/I18N';
import { message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  isProductCarbonCertificateRejected,
  loadProductCarbonCertificateDetail,
  loadProductCarbonCertificatePointCost,
  normalizeProductCarbonCertificateApplication,
  toProductCarbonCertificateFormValues,
  toProductCarbonCertificateSubmitPayload,
} from './data';
import { postProductCarbonCertificateSubmit } from './service';
import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateApplyProps,
  ProductCarbonCertificateFormValues,
} from './types';

/** 只管理当前证书申请；入口判断、页签归属和历史列表由外层负责。 */
export function useProductCarbonCertificateApplication({
  accountId,
  applicationId: initialApplicationId,
  initializing = false,
  preparedApplication,
  temporaryKey,
  messageId,
  projectId,
  sessionId,
  onDetailLoaded,
  onSubmitted,
}: ProductCarbonCertificateApplyProps) {
  const text = I18N.carbonAgent.certificateApplication;
  const [detailId, setDetailId] = useState(initialApplicationId);
  const [info, setInfo] = useState<
    ProductCarbonCertificateApplication | undefined
  >(() =>
    preparedApplication
      ? normalizeProductCarbonCertificateApplication(preparedApplication)
      : undefined,
  );
  const [loading, setLoading] = useState(
    initializing || Boolean(initialApplicationId),
  );
  const [pointCost, setPointCost] = useState<number>();
  const [detailReload, setDetailReload] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submissionLocked, setSubmissionLocked] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const detailGenerationRef = useRef(0);
  const pointCostGenerationRef = useRef(0);
  const onDetailLoadedRef = useRef(onDetailLoaded);
  const pendingValuesRef = useRef<ProductCarbonCertificateFormValues>();
  const preparedApplicationRef = useRef(preparedApplication);
  const submitLockRef = useRef(false);
  onDetailLoadedRef.current = onDetailLoaded;
  preparedApplicationRef.current = preparedApplication;

  useEffect(() => {
    setDetailId(initialApplicationId);
  }, [initialApplicationId]);

  useEffect(() => {
    if (!preparedApplication) {
      return;
    }

    // list/prepare 数据只作为失败回退，不覆盖已经成功加载的 detail。
    setInfo(
      current =>
        current ||
        normalizeProductCarbonCertificateApplication(preparedApplication),
    );
  }, [preparedApplication]);

  useEffect(() => {
    detailGenerationRef.current += 1;
    const generation = detailGenerationRef.current;

    if (!detailId) {
      setLoading(initializing);

      if (preparedApplicationRef.current) {
        setInfo(
          normalizeProductCarbonCertificateApplication(
            preparedApplicationRef.current,
          ),
        );
        setSubmitError('');
      } else if (!initializing) {
        // prepare 失败时仍展示空白申请页；接口错误由统一请求层提示。
        setInfo(undefined);
      }

      return () => {
        detailGenerationRef.current += 1;
      };
    }

    setLoading(true);
    const controller = new AbortController();

    loadProductCarbonCertificateDetail(accountId, detailId, controller.signal)
      .then(detail => {
        if (generation !== detailGenerationRef.current) {
          return;
        }

        setInfo(detail);
        setSubmissionLocked(false);
        setSubmitError('');
        onDetailLoadedRef.current?.(detail);
      })
      .catch(() => {
        // 请求层统一处理错误；保留现有页面和数据，不创建局部重试入口。
      })
      .finally(() => {
        if (generation === detailGenerationRef.current) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
      detailGenerationRef.current += 1;
    };
  }, [accountId, detailId, detailReload, initializing]);

  const status = info?.status ? String(info.status) : undefined;
  const notSubmitted =
    status === 'not_submitted' || (!detailId && !status && !initializing);
  const rejected = isProductCarbonCertificateRejected(status);
  const approved = status === 'approved';

  useEffect(() => {
    pointCostGenerationRef.current += 1;
    const generation = pointCostGenerationRef.current;

    if (initializing || !notSubmitted) {
      setPointCost(undefined);
      return () => {
        pointCostGenerationRef.current += 1;
      };
    }

    const controller = new AbortController();
    loadProductCarbonCertificatePointCost(accountId, controller.signal)
      .then(cost => {
        if (generation === pointCostGenerationRef.current) {
          setPointCost(cost);
        }
      })
      .catch(() => {
        // 积分仅用于展示；请求错误由统一请求层处理，不阻断页面和提交。
      });

    return () => {
      controller.abort();
      pointCostGenerationRef.current += 1;
    };
  }, [accountId, initializing, notSubmitted]);

  const submit = async (
    values: ProductCarbonCertificateFormValues,
    resubmission: boolean,
  ) => {
    if (submitLockRef.current || submissionLocked) {
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    const payload = toProductCarbonCertificateSubmitPayload(
      values,
      accountId,
      { messageId, projectId, sessionId },
      resubmission ? detailId : undefined,
    );

    try {
      const { data } = await postProductCarbonCertificateSubmit(payload);
      setSubmissionLocked(true);

      if (resubmission && detailId) {
        setDetailReload(value => value + 1);
        message.success(text.submitSuccess);
        return;
      }

      const submittedId = data.data?.id;

      if (
        submittedId === undefined ||
        submittedId === null ||
        submittedId === ''
      ) {
        setSubmitError(text.missingId);
        return;
      }

      const nextId = String(submittedId);
      setDetailId(nextId);
      if (temporaryKey) {
        onSubmitted?.(temporaryKey, nextId);
      }
      message.success(text.submitSuccess);
    } catch {
      // 未收到成功响应时允许再次提交；接口错误由统一请求层提示。
      setSubmissionLocked(false);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const editable =
    (notSubmitted || rejected) &&
    !initializing &&
    !loading &&
    !submissionLocked;
  const initialValues = useMemo(
    () => toProductCarbonCertificateFormValues(info),
    [info],
  );

  return {
    approved,
    cancelConfirmation: () => {
      if (!submitting) {
        setConfirmOpen(false);
      }
    },
    confirmOpen,
    confirmSubmit: () => {
      if (pendingValuesRef.current) {
        submit(pendingValuesRef.current, false);
      }
    },
    editable,
    info,
    initialValues,
    loading,
    notSubmitted,
    pointCost,
    prepareSubmit: (
      values: ProductCarbonCertificateFormValues,
      resubmission: boolean,
    ) => {
      if (!editable || submitting) {
        return;
      }

      if (resubmission) {
        submit(values, true);
        return;
      }

      pendingValuesRef.current = values;
      setConfirmOpen(true);
    },
    rejected,
    status,
    statusName: info?.statusName || undefined,
    submissionLocked,
    submitError,
    submitting,
  };
}
