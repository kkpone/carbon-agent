import { createForm, onFormValuesChange } from '@formily/core';
import I18N from '@src/lang/I18N';
import type { AuditListData } from '@src/views/carbonFootprint3/CarbonLabel/component/AuditList/type';
import { ApplyForAccountStatus } from '@src/views/carbonFootprint3/CarbonLabel/constant';
import { message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  isApplicationEditable,
  loadApplicationInfo,
  loadApplicationAuditRecords,
  loadApplicationCategoryOptions,
  loadApplicationPointCost,
  normalizeApplicationInfo,
  prepareApplicationSource,
  shouldLoadApplicationPointCost,
  toAgentApplicationPayload,
  toApplicationPreview,
  toApplicationValues,
} from './data';
import { postAgentCarbonLabelSubmit } from './service';
import type {
  AgentLabelApplicationPayload,
  ApplicationInfo,
  ApplicationValues,
  ProductCarbonLabelApplyProps,
} from './types';

const {
  PASS,
  NOT_PASS,
  TO_BE_SUB,
  TO_BE_REVIEWED,
  REVIEWED_ING,
  REVIEWED_ERR,
} = ApplyForAccountStatus;

function getApplicationScopeKey(
  accountId: string,
  productId?: string,
  applicationId?: string,
  projectId?: number | string | null,
  sessionId?: string | null,
  messageId?: number | string | null,
) {
  return JSON.stringify([
    accountId,
    productId,
    applicationId,
    projectId,
    sessionId,
    messageId,
  ]);
}

/** 仅管理当前申请实例；不依赖 Agent 对话、页签或其他认证业务。 */
export function useLabelApplication({
  accountId,
  productId,
  applicationId: initialId,
  applicationApplyNum,
  forceNew = false,
  preparedApplication,
  projectId,
  sessionId,
  messageId,
  onSubmitted,
}: ProductCarbonLabelApplyProps) {
  const text = I18N.carbonAgent.labelApplication;
  // 详情请求 ID 只由外部选中的申请或提交结果更新，prepare 回填不触发旧详情覆盖。
  const [detailId, setDetailId] = useState(initialId);
  const [info, setInfo] = useState<ApplicationInfo>();
  const [preview, setPreview] = useState<ApplicationInfo>();
  const [pointCost, setPointCost] = useState<number>();
  const [auditRecords, setAuditRecords] = useState<AuditListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const infoRef = useRef<ApplicationInfo>({});
  const previewInfoRef = useRef<ApplicationInfo>({});
  const pendingPayload = useRef<AgentLabelApplicationPayload>();
  const submitLock = useRef(false);
  const lifecycle = useRef(0);
  const applicationScope = useRef<string>();
  // 提交接口已经返回完整申请快照。记录该申请，避免内部 ID 更新和父级
  // 页签同步再次触发详情请求，把刚返回的状态覆盖掉。
  const submittedSnapshotId = useRef<string>();
  const form = useMemo(
    () =>
      createForm<ApplicationValues>({
        initialValues: toApplicationValues({}),
        effects() {
          onFormValuesChange(current =>
            setPreview(
              toApplicationPreview(
                current.values as ApplicationValues,
                previewInfoRef.current,
              ),
            ),
          );
        },
      }),
    [],
  );

  useEffect(() => {
    setDetailId(initialId);
  }, [initialId]);

  useEffect(() => {
    let cancelled = false;
    loadApplicationCategoryOptions()
      .then(options => {
        if (!cancelled) {
          form.setFieldState('contrastValuesArr', { dataSource: options });
        }
      })
      .catch(() => {
        // 请求错误由统一请求层提示；类别加载不影响其他申请信息。
      });
    return () => {
      cancelled = true;
    };
  }, [form]);

  useEffect(() => {
    lifecycle.current += 1;
    const generation = lifecycle.current;
    const scopeKey = getApplicationScopeKey(
      accountId,
      productId,
      detailId,
      projectId,
      sessionId,
      messageId,
    );
    const scopeChanged = applicationScope.current !== scopeKey;
    applicationScope.current = scopeKey;
    setLoading(true);
    if (scopeChanged) {
      submittedSnapshotId.current = undefined;
      infoRef.current = {};
      previewInfoRef.current = {};
      pendingPayload.current = undefined;
      setInfo(undefined);
      setPreview(undefined);
      setPointCost(undefined);
      setAuditRecords([]);
      form.setValues(toApplicationValues({}), 'overwrite');
      setConfirmOpen(false);
      setSubmitError('');
    }
    if (
      !scopeChanged &&
      detailId &&
      submittedSnapshotId.current === detailId &&
      String(infoRef.current.id) === detailId
    ) {
      setLoading(false);
      return () => {
        lifecycle.current += 1;
      };
    }
    const infoRequest = detailId
      ? loadApplicationInfo(detailId)
      : preparedApplication
      ? Promise.resolve(preparedApplication)
      : prepareApplicationSource(accountId, productId);
    const recordsRequest = applicationApplyNum
      ? loadApplicationAuditRecords(applicationApplyNum)
      : infoRequest.then(result =>
          result.applyNum
            ? loadApplicationAuditRecords(result.applyNum)
            : Promise.resolve([]),
        );

    infoRequest
      .then(result => {
        if (generation !== lifecycle.current) return;
        infoRef.current = result;
        previewInfoRef.current = result;
        setInfo(result);
        form.setValues(toApplicationValues(result), 'overwrite');
        setPreview(result);
        setSubmitError('');
        if (shouldLoadApplicationPointCost(result.status)) {
          setPointCost(undefined);
          loadApplicationPointCost(accountId)
            .then(cost => {
              if (generation === lifecycle.current) setPointCost(cost);
            })
            .catch(() => {
              // 请求错误由统一请求层提示；积分仅用于展示，不阻塞申请提交。
            });
        } else {
          setPointCost(undefined);
        }
      })
      .catch(() => {
        // 请求错误由统一请求层提示；审核记录仍可独立展示。
      })
      .finally(() => {
        if (generation === lifecycle.current) setLoading(false);
      });

    recordsRequest
      .then(records => {
        if (generation === lifecycle.current) setAuditRecords(records);
      })
      .catch(() => {
        // 请求错误由统一请求层提示；不清空已成功取得的申请详情。
      })
      .finally(() => {
        if (generation === lifecycle.current) setLoading(false);
      });
    return () => {
      lifecycle.current += 1;
    };
  }, [
    accountId,
    applicationApplyNum,
    productId,
    detailId,
    projectId,
    sessionId,
    messageId,
    preparedApplication,
    form,
  ]);

  const applicationId = info?.id != null ? String(info.id) : detailId;
  const status = info?.status;
  const rejected = status === NOT_PASS;
  const approved = status === PASS;
  const editable =
    isApplicationEditable(status) && !loading && !info?.errorCode;
  const canSubmit = info?.accountId != null && info?.productId != null;
  const feedback = [...auditRecords]
    .reverse()
    .find(record => record.actType === 3)?.comment;
  const statusHint = info
    ? {
        [TO_BE_SUB]: text.pendingHint,
        [TO_BE_REVIEWED]: text.reviewHint,
        [REVIEWED_ING]: text.reviewHint,
        [NOT_PASS]: text.rejectedHint,
        [PASS]: text.approvedHint,
        [REVIEWED_ERR]: text.failedHint,
      }[status ?? TO_BE_SUB]
    : '';

  const submit = async (payload: AgentLabelApplicationPayload) => {
    if (submitLock.current || !canSubmit) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError('');
    const generation = lifecycle.current;
    try {
      const { data } = await postAgentCarbonLabelSubmit(payload, forceNew);
      if (generation !== lifecycle.current) return;
      if (data.data?.errorCode) {
        setSubmitError(text.sourceDeleted);
        return;
      }
      const id = data.data?.id;
      if (id === undefined || id === null || id === '') {
        setSubmitError(text.missingId);
        return;
      }
      const submittedId = String(id);
      const submittedInfo = normalizeApplicationInfo(data.data);
      infoRef.current = submittedInfo;
      previewInfoRef.current = submittedInfo;
      submittedSnapshotId.current = submittedId;
      setInfo(submittedInfo);
      setPreview(submittedInfo);
      setAuditRecords([]);
      setPointCost(undefined);
      form.setValues(toApplicationValues(submittedInfo), 'overwrite');
      message.success(I18N.carbonFootprint3.newApplicationCompleted);
      // 提交响应已经是完整申请详情，直接同步页签元数据，不再重复请求详情。
      applicationScope.current = getApplicationScopeKey(
        accountId,
        productId,
        submittedId,
        projectId,
        sessionId,
        messageId,
      );
      setDetailId(submittedId);
      onSubmitted?.({
        accountId,
        id: submittedId,
        applyNum: submittedInfo.applyNum,
        status: submittedInfo.status,
      });
      loadApplicationAuditRecords(submittedInfo.applyNum)
        .then(records => {
          if (
            submittedSnapshotId.current === submittedId &&
            String(infoRef.current.id) === submittedId
          )
            setAuditRecords(records);
        })
        .catch(() => {
          // 请求错误由统一请求层提示；不影响 submit 返回的申请状态展示。
        });
    } catch {
      // 请求报错由统一请求层处理，保留表单，不另设错误提示或阻断重试。
    } finally {
      submitLock.current = false;
      if (generation === lifecycle.current) {
        setSubmitting(false);
        setConfirmOpen(false);
      }
    }
  };

  const prepareSubmit = async () => {
    if (!editable || !canSubmit || submitting || confirmOpen) return;
    try {
      await form.validate();
      const payload = toAgentApplicationPayload(form.values, infoRef.current, {
        projectId,
        sessionId,
        messageId,
      });
      if (rejected) {
        await submit(payload);
      } else {
        pendingPayload.current = payload;
        setConfirmOpen(true);
      }
    } catch {
      // Formily 在对应字段显示校验错误，不发送申请请求。
    }
  };

  return {
    applicationId,
    info,
    preview,
    pointCost,
    auditRecords,
    form,
    loading,
    confirmOpen,
    submitting,
    submitError,
    status,
    rejected,
    approved,
    editable,
    canSubmit,
    feedback,
    statusHint,
    prepareSubmit,
    confirmSubmit: () =>
      pendingPayload.current && submit(pendingPayload.current),
    cancelConfirmation: () => {
      if (!submitting) setConfirmOpen(false);
    },
  };
}
