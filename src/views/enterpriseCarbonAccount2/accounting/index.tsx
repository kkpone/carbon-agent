import useUrlState from '@ahooksjs/use-url-state';
import { FullscreenModal } from '@src/components/FullscreenModal';
import { IconAlibaba, IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { Drawer, Modal, Select } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { FormActions } from '@/components/FormActions';
import { GetComponentProps } from '@/utils/utilTypes';

import { Result } from './Result';
import {
  apiComputationInfo,
  DataComputationBackData,
} from './baseInfo/service';
import { FillData } from './fillData';
import { EVersionType } from './fillData/service';
import styles from './index.module.less';
import {
  getEnterpriseAccountingSubmitIssues,
  hasEnterpriseAccountingSubmitIssues,
  submitEnterpriseAccounting,
} from './submitAccounting';
import { StepType } from './type';
import { computationRevokeSubmit } from '../AccountingList/service';
import { COMPUTATION_STATUS, COMPUTATION_STATUS_LABEL } from '../constant';

const getQueryDisplayText = (value?: string | string[]) => {
  const text = (Array.isArray(value) ? value.find(Boolean) : value) || '';
  const halfLength = text.length / 2;

  if (
    Number.isInteger(halfLength) &&
    text.slice(0, halfLength) === text.slice(halfLength)
  ) {
    return text.slice(0, halfLength);
  }

  return text;
};

type AccountingProps = {
  agentVersionType?: EVersionType;
  embedded?: boolean;
  forceReadonly?: boolean;
  isShare?: boolean;
  previewMode?: 'agent';
  projectId?: string;
  sessionId?: string;
  shareId?: string;
  useShareApis?: boolean;
};

const Accounting = (props: AccountingProps) => {
  const {
    agentVersionType,
    embedded = false,
    forceReadonly = false,
    isShare = false,
    previewMode,
    projectId,
    sessionId,
    shareId,
    useShareApis,
  } = props;
  const shouldUseShareApis = useShareApis ?? isShare;
  const [searchParams, setSearchParams] = useUrlState<{
    computationId?: string;
    computationPeriod?: string;
    periodName?: string;
    orgName?: string;
    computationStatus?: string;
    orgId: string;
    orgType?: string;
    period: string;
    step: StepType;
    companyId?: string;
    reportId?: string;
    year?: string;
    preOrgId?: string;
  }>({
    orgId: '',
    period: '',
    step: StepType.baseInfo,
  });

  const history = useHistory();

  const [versionType, setVersionType] = useState<EVersionType>(
    EVersionType.ghg,
  );
  const [emptySourceIds, setEmptySourceIds] = useState<number[]>([]);
  const [lostFactorSourceIds, setLostFactorSourceIds] = useState<number[]>([]);
  const {
    computationId,
    computationPeriod,
    orgId,
    orgName,
    orgType,
    periodName,
    period,
    companyId,
    reportId,
    year,
    preOrgId,
  } = searchParams;
  const displayOrgName = getQueryDisplayText(orgName);
  const isAgentPreview = embedded && previewMode === 'agent';
  const accountingContentId = embedded
    ? 'enterpriseAccountingAgentPreviewContent'
    : 'accountingContent';

  const [computationInfo, setComputationInfo] =
    useState<DataComputationBackData | null>(null);

  const [emissionCount, setEmissionCount] = useState({
    totalCount: 0,
    finishCount: 0,
  });

  const isMainPart = !isNil(computationId);
  const [showResult, setShowResult] = useState(() => !isMainPart);

  const [resultRefreshFlag, setResultRefreshFlag] = useState(true);
  const updateComputationInfo = async (params: {
    computationId: string;
    computationPeriod?: string;
  }) => {
    const { data } = await apiComputationInfo(params);
    setComputationInfo(data.data);
    return data.data;
  };

  const { computationStatus } = computationInfo || {};

  const backToListPage = () => {
    if (embedded) {
      return;
    }

    history.push({
      pathname: isShare
        ? RouteMaps.enterpriseCarbonAccountingcarbonDischargeShare
        : RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
      search: isShare
        ? `?companyId=${companyId}&reportId=${reportId}&orgId=${preOrgId}&year=${year}`
        : '',
    });
  };

  useEffect(() => {
    if (shouldUseShareApis) {
      return;
    }
    if (!isNil(computationId)) {
      updateComputationInfo({ computationId, computationPeriod });
    }
  }, [computationId, computationPeriod, shouldUseShareApis]);

  useEffect(() => {
    if (!isAgentPreview || !agentVersionType) {
      return;
    }

    setVersionType(agentVersionType);
  }, [agentVersionType, isAgentPreview]);

  const revokeSubmit = async () => {
    Modal.confirm({
      className: styles.confirmModal,
      width: 480,
      icon: null,
      title: I18N.enterpriseCarbonAccount2.confirmWithdrawalOfWithdrawal2,
      content: (
        <div className={styles.confirmModalContent}>
          <span>
            {I18N.enterpriseCarbonAccount2.confirmWithdrawalOfWithdrawal}
          </span>
          <span className={styles.confirmModalWarnText}>
            {I18N.enterpriseCarbonAccount2.theResultDataWill}
          </span>
        </div>
      ),
      maskClosable: true,
      onOk: async () => {
        await computationRevokeSubmit({
          computationId,
          computationPeriod,
        });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        updateComputationInfo({ computationId, computationPeriod });
      },
    });
  };

  const changeStep = async (currentStep: StepType) => {
    if (currentStep === 2) {
      const issues = await getEnterpriseAccountingSubmitIssues({
        computationId,
        computationPeriod,
      });

      if (hasEnterpriseAccountingSubmitIssues(issues)) {
        changeStep(StepType.fillData);
        setEmptySourceIds(issues.emptySourceIds);
        setLostFactorSourceIds(issues.lostFactorSourceIds);
        return;
      }
    }
    setSearchParams({
      ...searchParams,
      step: currentStep,
    });
  };

  const submit = async () => {
    await submitEnterpriseAccounting({
      computationId,
      computationPeriod,
      refreshComputationInfo: () =>
        updateComputationInfo({ computationId, computationPeriod }),
      onValidationFailed: issues => {
        changeStep(StepType.fillData);
        setEmptySourceIds(issues.emptySourceIds);
        setLostFactorSourceIds(issues.lostFactorSourceIds);
      },
    });
  };

  const generateReport = () => {
    const periodVal =
      computationInfo?.period?.replace(I18N.DomesticVersion.year, '') ??
      (period as string)?.replace(I18N.DomesticVersion.year, '');
    history.push({
      pathname:
        RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportAdd,
      search: `orgId=${computationInfo?.orgId ?? orgId}&period=${periodVal}`,
    });
  };

  const content = (
    <>
      <div className={styles.accounting}>
        {!isAgentPreview && (
          <div className={styles.header}>
            <div className={styles.computationInfo}>
              <div className={styles.backBtn} onClick={backToListPage}>
                <IconAlibaba
                  className={styles.backIcon}
                  type='icon-a-icon_return'
                />
              </div>
              <div className={styles.orgName} title={displayOrgName}>
                {displayOrgName}
              </div>
              <div className={styles.periodName}>{periodName}</div>
              <div className={styles.split} />
              <Select
                className={styles.ghgTypeSelect}
                variant='borderless'
                value={versionType}
                popupMatchSelectWidth={false}
                onChange={value => {
                  setVersionType?.(value);
                }}
                suffixIcon={
                  <IconAlibabaNew
                    className={styles.ghgTypeSelectArrow}
                    type='icon-chevron-down'
                  />
                }
                options={[
                  {
                    value: EVersionType.ghg,
                    label: I18N.enterpriseCarbonAccount2.ghgPr2,
                  },
                  {
                    value: EVersionType.iso,
                    label: I18N.enterpriseCarbonAccount2.isoStandard3,
                  },
                ]}
              />
            </div>
            {!isShare && computationInfo && (
              <div className={styles.computationInfo}>
                <div
                  className={classNames(styles.statusTag, {
                    [styles.fillingStatusTag]:
                      computationStatus === COMPUTATION_STATUS.FILLING,
                    [styles.beFilledStatusTag]:
                      computationStatus === COMPUTATION_STATUS.BE_FILLED,
                    [styles.completedStatusTag]:
                      computationStatus === COMPUTATION_STATUS.COMPLETE,
                  })}
                >
                  {COMPUTATION_STATUS_LABEL[computationStatus]}
                </div>
                <div>
                  <div className={styles.fillPercent}>
                    <span className={styles.fillCount}>
                      {emissionCount.finishCount}
                    </span>
                    <span className={styles.totalCount}>
                      /{emissionCount.totalCount}
                    </span>
                  </div>
                  <div className={styles.progress}>
                    <div
                      className={styles.fillProgress}
                      style={{
                        width: `${
                          (emissionCount.finishCount /
                            emissionCount.totalCount) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className={styles.accountingContent} id={accountingContentId}>
          {isMainPart && (
            <FillData
              forceReadonly={forceReadonly}
              isShare={isShare}
              agentPreviewLayout={isAgentPreview}
              projectId={projectId}
              orgId={orgId}
              companyId={companyId}
              computationId={computationId}
              computationPeriod={computationPeriod}
              computationStatus={computationStatus}
              versionType={versionType}
              emptySourceIds={emptySourceIds}
              lostFactorSourceIds={lostFactorSourceIds}
              setEmptySourceIds={setEmptySourceIds}
              setLostFactorSourceIds={setLostFactorSourceIds}
              refreshResult={() => setResultRefreshFlag(!resultRefreshFlag)}
              sessionId={sessionId}
              shareId={shareId}
              useShareApis={shouldUseShareApis}
              updateComputationInfo={() => {
                if (!isNil(computationId)) {
                  updateComputationInfo({ computationId, computationPeriod });
                }
              }}
              setEmissionCount={setEmissionCount}
            />
          )}
          <Drawer
            className={styles.accountingResultDrawer}
            rootClassName={styles.accountingResultDrawerRoot}
            height={embedded ? '100%' : 'calc(100% - 124px)'}
            closeIcon={null}
            footer={null}
            placement='bottom'
            open={showResult}
            mask={false}
            destroyOnClose
            getContainer={() =>
              document.getElementById(accountingContentId) || document.body
            }
          >
            {isMainPart ? (
              <Result
                refreshFlag={resultRefreshFlag}
                computationInfo={computationInfo}
                computationPeriod={computationPeriod}
                orgId={computationInfo?.orgId ?? orgId}
                orgType={orgType}
                versionType={versionType}
              />
            ) : (
              <Result
                refreshFlag={resultRefreshFlag}
                orgId={orgId}
                orgType={orgType}
                period={period}
                computationPeriod={computationPeriod}
                versionType={versionType}
              />
            )}
          </Drawer>
        </div>
      </div>
      {!isAgentPreview && !isShare && (
        <FormActions
          width='100%'
          place='center'
          buttons={(() => {
            if (!isMainPart) {
              // 核算分组
              return [
                {
                  type: 'primary' as const,
                  title: I18N.carbonFootprint.generateReport,
                  permission: 'enterprise:report:add',
                  onClick: generateReport,
                },
                {
                  type: 'default' as const,
                  title: I18N.enterpriseCarbonAccount2.quit,
                  onClick: backToListPage,
                },
              ];
            }

            // 核算主体
            const btnList: GetComponentProps<typeof FormActions>['buttons'] =
              [];

            if (computationStatus === COMPUTATION_STATUS.COMPLETE) {
              btnList.push(
                ...[
                  {
                    type: 'default' as const,
                    title: showResult
                      ? I18N.enterpriseCarbonAccount2.closePreview
                      : I18N.enterpriseCarbonAccount2.previewResults,
                    onClick: () => setShowResult(!showResult),
                  },
                  {
                    type: 'primary' as const,
                    title: I18N.enterpriseCarbonAccount2.withdrawSubmission,
                    permission: 'computation:status:revocation',
                    onClick: revokeSubmit,
                  },
                  {
                    type: 'default' as const,
                    title: I18N.carbonFootprint.generateReport,
                    permission: 'enterprise:report:add',
                    onClick: generateReport,
                  },
                ],
              );
            } else {
              btnList.push({
                type: 'primary' as const,
                title: I18N.components.submit,
                permission: 'computation:status:submit',
                onClick: () => submit(),
              });
            }

            btnList.push({
              type: 'default' as const,
              title:
                computationStatus === COMPUTATION_STATUS.FILLING
                  ? I18N.enterpriseCarbonAccount2.saveAndExit
                  : I18N.enterpriseCarbonAccount2.quit,
              onClick: backToListPage,
            });
            return btnList;
          })()}
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <div
        className={classNames(styles.accountingEmbeddedRoot, {
          [styles.accountingEmbeddedRootAgentPreview]: isAgentPreview,
        })}
      >
        {content}
      </div>
    );
  }

  return <FullscreenModal>{content}</FullscreenModal>;
};

export default Accounting;
