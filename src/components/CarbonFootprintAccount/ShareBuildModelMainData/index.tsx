/**
 * 碳足迹核算 - 分享功能组件
 */
import useUrlState from '@ahooksjs/use-url-state';
import I18N from '@src/lang/I18N';
import {
  getAccountingInfo,
  postAccountFinishWithShare,
  postAccountRevokeWithShare,
} from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/service';
import {
  AccountingInfoData,
  UrlStateProps,
} from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { AccountInfoBuildModel } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel';
import { BuildModelDescribeSet } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/constant';
import { AccountInfoResult } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult';
import { AccountInfoStep } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoStep';
import { postShareSub } from '@src/views/carbonFootprint3/FootprintAccount/service';
import {
  getShareCanEdit,
  hasShareCanEditField,
  isShareNotEditResponse,
  SHARE_EDIT_NOT_EDIT_EVENT,
} from '@src/views/carbonFootprint3/shareEditPermission';
import { STEP_OPTION_VALUE } from '@src/views/carbonFootprint3/util/constant';
import { Toast } from '@src/utils/Toast';
import { useUnmount } from 'ahooks';
import { Modal } from 'antd';
import { uniqueId } from 'lodash-es';
import { FC, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { CustomFactorReuseExcludedContext } from '@/components/FormilyUtil/FormilyFactor/context';

import styles from './index.module.less';
import { API_EXTRA_PARAMS_SNAPFLAG } from '../BuildModelMainData/constant';
import {
  clearShareEditFactorUsageCompanyId,
  syncShareEditFactorUsageCompanyId,
} from '../BuildModelMainData/shareSnapFlag';
import { ApiExtraParams } from '../BuildModelMainData/type';

const { ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;

export type ShareSession = {
  shareId?: number;
  password?: string;
  editType?: number;
  editPermit?: number;
};

type Props = {
  apiExtraParams: ApiExtraParams;
  expireTime?: string;
  /** 初始是否可编辑（checkPermit 返回） */
  initialCanEdit?: boolean;
  shareSession?: ShareSession;
};

const { MODEL, RESULT } = STEP_OPTION_VALUE;

export const ShareBuildModelMainData: FC<Props> = ({
  apiExtraParams,
  expireTime,
  initialCanEdit = false,
  shareSession,
}) => {
  const history = useHistory();

  /** 页面存储参数 */
  const [urlState, setUrlState] = useUrlState<UrlStateProps>();

  /**
   * 分享编辑态由 checkPermit/getShareInfo 的 initialCanEdit 直接驱动。
   * 本地 override 只处理 NOT_EDIT 或首次完成建模后的降级，避免首次输密码进入时
   * 先用默认 false 挂载子组件，导致部分内部状态缓存成只读。
   */
  const [canEditOverride, setCanEditOverride] = useState<boolean>();
  const canEditShare = canEditOverride ?? initialCanEdit;

  /** 当前步骤允许点击的 */
  const [stepStatus, setStepStatus] = useState<number>(MODEL);

  /** 更新构建模型内容的Key */
  const [buildModelKey] = useState(uniqueId());

  /** 核算的信息 */
  const [accountInfo, setAccountInfo] = useState<AccountingInfoData>();

  /** 设置当前选中的步骤  - 默认基本信息*/
  const [stepValue, setStepValue] = useState<number>(
    Number(urlState.stepValue),
  );

  /** 主要区域内容加载loading */
  const [mainLoading, setMainLoading] = useState(false);

  const shareReadOnly = !canEditShare;
  /** 分享编辑态下，已完成建模的快照模型只能查看排放源，需先撤回/编辑模型后才允许改排放源 */
  const isAccountFinished = Number(accountInfo?.accountStatus) === RESULT;
  const canEditShareEmission = canEditShare && !isAccountFinished;

  const switchShareReadonly = useCallback(() => {
    setCanEditOverride(false);
  }, []);

  /**
   * 返回事件
   */
  const backClick = () => {
    history.push('/');
  };

  /**
   * 切换列表模式
   */
  const changeListOrGraph = (listOrGraph: BuildModelDescribeSet) => {
    setUrlState({
      ...urlState,
      listOrGraph,
    });
  };

  /**
   * 更新核算信息（同步 account/info 的 accountStatus）
   */
  const updateAccountInfo = async () => {
    const { data } = await getAccountingInfo({
      id: urlState.accountId,
      ...apiExtraParams,
    });
    setAccountInfo(data.data);
    setStepStatus(data.data.accountStatus);
  };

  /**
   * 更改当前步骤
   */
  const changeSetp = (step: number) => {
    setUrlState({
      ...urlState,
      stepValue: step,
    });
    setStepValue(step);
  };

  /**
   * 获取核算信息（account/info），同步 accountStatus 供步骤条按钮使用
   */
  const getAccountInfo = async () => {
    if (!urlState.accountId) return;
    setMainLoading(true);
    try {
      const { data } = await getAccountingInfo({
        id: urlState.accountId,
        ...apiExtraParams,
      });
      setStepStatus(data.data.accountStatus);
      setAccountInfo(data.data);
    } finally {
      setMainLoading(false);
    }
  };

  /** 完成建模后刷新 share 编辑权限（editPermit=0 时切只读） */
  const refreshSharePermit = useCallback(async () => {
    if (!shareSession?.shareId || shareSession.editType !== 1) return;
    try {
      const { data } = await postShareSub({
        id: shareSession.shareId,
        password: shareSession.password,
      });
      if (data.data.code === 3 && hasShareCanEditField(data.data)) {
        setCanEditOverride(getShareCanEdit(data.data) === 1);
      }
    } catch {
      // 刷新分享权限失败时保持当前 canEditShare，不影响主流程
    }
  }, [shareSession]);

  /**
   * 分享链接侧完成建模（accountStatus !== 2 时生成结果）
   */
  const createFinishReport = async () => {
    if (!accountInfo || !canEditShare) return;
    if (Number(accountInfo.accountStatus) === RESULT) {
      setStepValue(RESULT);
      setUrlState({
        ...urlState,
        stepValue: RESULT,
      });
      return;
    }
    try {
      await postAccountFinishWithShare(
        { id: accountInfo.id },
        apiExtraParams as Record<string, unknown>,
      );
      if (shareSession?.editPermit === 0) {
        switchShareReadonly();
      }
      await getAccountInfo();
      await refreshSharePermit();
      setStepValue(RESULT);
      setUrlState({
        ...urlState,
        stepValue: RESULT,
      });
      Toast('success', I18N.carbonFootprint3.successfullyGeneratedCarbon);
    } catch (error) {
      if (isShareNotEditResponse(error)) {
        switchShareReadonly();
      }
      // 其它后端错误信息由 request 拦截器 toast 展示
    }
  };

  /** 共享编辑：accountStatus=2 时退回建模态 */
  const goEditModel = async (changeStep = true) => {
    if (!accountInfo || !canEditShare) return;
    try {
      await postAccountRevokeWithShare(
        { id: accountInfo.id },
        apiExtraParams as Record<string, unknown>,
      );
      await getAccountInfo();
      if (changeStep) {
        setStepValue(MODEL);
        setUrlState({
          ...urlState,
          stepValue: MODEL,
        });
      }
    } catch (error) {
      if (isShareNotEditResponse(error)) {
        switchShareReadonly();
      }
      // 其它后端错误信息由 request 拦截器 toast 展示
    }
  };

  useEffect(() => {
    const handleShareNotEdit = () => {
      switchShareReadonly();
    };
    window.addEventListener(SHARE_EDIT_NOT_EDIT_EVENT, handleShareNotEdit);
    return () => {
      window.removeEventListener(SHARE_EDIT_NOT_EDIT_EVENT, handleShareNotEdit);
    };
  }, [switchShareReadonly]);

  /** 进入页面或切换步骤时拉 account/info，保证 accountStatus 与按钮文案一致 */
  useEffect(() => {
    if (!urlState.accountId) return;
    getAccountInfo();
    if (
      stepValue === MODEL &&
      Number(apiExtraParams.snapFlag) === ACCOUNT_SHARE_EDIT
    ) {
      refreshSharePermit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accountId/step 变化时刷新即可
  }, [urlState.accountId, stepValue]);

  useEffect(() => {
    setCanEditOverride(undefined);
  }, [apiExtraParams.shareAuth]);

  /** 共享编辑选因子时 useRecord/add 需要核算上的 companyId */
  useEffect(() => {
    if (
      accountInfo?.companyId &&
      Number(apiExtraParams.snapFlag) === ACCOUNT_SHARE_EDIT
    ) {
      syncShareEditFactorUsageCompanyId(accountInfo);
    }
  }, [accountInfo, apiExtraParams.snapFlag]);

  useUnmount(() => {
    localStorage.removeItem('shareAuth');
    clearShareEditFactorUsageCompanyId();
  });

  return (
    <CustomFactorReuseExcludedContext.Provider value>
      <Modal
        destroyOnClose
        visible
        wrapClassName='FoorprintAccountingAddModal'
        width='100%'
        style={{
          top: 0,
          maxWidth: '100%',
          padding: 0,
        }}
        styles={{
          content: {
            padding: 0,
          },
        }}
        title={undefined}
        footer={null}
        closable={false}
        transitionName=''
      >
        <div className={styles.wrapper} style={{ marginBottom: 0 }}>
          <div className={styles.container}>
            <AccountInfoStep
              shareStatus
              isDetail={shareReadOnly}
              snapFlag={Number(apiExtraParams.snapFlag)}
              shareCanAction={canEditShare}
              stepStatus={accountInfo?.accountStatus ?? stepStatus}
              stepValue={stepValue}
              expireTime={expireTime}
              backText={I18N.carbonFootprint3.carbonCloud}
              backClick={backClick}
              changeSetp={changeSetp}
              createFinishReport={createFinishReport}
              goEditModel={goEditModel}
              accountStatus={accountInfo?.accountStatus}
              goAddReport={() => {}}
              goCarbonLabel={() => {}}
            />
            <div className={styles.contentArea}>
              <div className={styles.buildModelPanel}>
                {stepValue === MODEL && accountInfo && (
                  <AccountInfoBuildModel
                    authType={urlState.authType}
                    key={`${buildModelKey}-${canEditShare ? 'edit' : 'read'}`}
                    apiExtraParams={apiExtraParams}
                    reportSnapCode={urlState.reportSnapCode}
                    isDetail={shareReadOnly || isAccountFinished}
                    isShareEmissionEditable={canEditShareEmission}
                    listOrGraph={Number(urlState.listOrGraph)}
                    buildLoading={mainLoading}
                    accountInfo={accountInfo}
                    changeScope={() => {}}
                    changeListOrGraph={changeListOrGraph}
                    updateAccountInfo={updateAccountInfo}
                  />
                )}
                {stepValue === RESULT && accountInfo && (
                  <AccountInfoResult
                    apiExtraParams={apiExtraParams}
                    isDetail
                    accountInfo={accountInfo}
                    showAISuggestion
                    showBusinessForesight={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </CustomFactorReuseExcludedContext.Provider>
  );
};
