/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 搭建模型
 */
import useUrlState from '@ahooksjs/use-url-state';
import { GwpScopeContext } from '@/components/EmissionGwp/context';
import AIIcon from '@src/assets/images/carbonFootprint3.6.4/AIIcon.png';
import I18N from '@src/lang/I18N';
import { useMount, useUnmount } from 'ahooks';
import { Timeout } from 'ahooks/lib/useRequest/src/types';
import { Progress, Spin } from 'antd';
import classNames from 'classnames';
import { FC, memo, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAICarbonFloating } from '@/components/AICarbonFloating/AICarbonContext';
import {
  AI_INPUT_MENU_ITEMS,
  AI_INPUT_MENU_ITEMS_LABEL,
} from '@/components/AICarbonFloating/constant';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@/components/CarbonFootprintAccount/BuildModelMainData/constant';
import {
  AGENT_CERTIFICATION_PREVIEW_SOURCE,
  AGENT_MEASUREMENT_PRECISION,
  DEFAULT_MEASUREMENT_PRECISION,
  MeasurementPrecisionContext,
  ModelCheckEmissionFieldsContext,
} from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { isShareLinkEditableContext } from '@/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import {
  CustomFactorReuseContext,
  ShowFactorTypeContext,
} from '@/components/FormilyUtil/FormilyFactor/context';
import { useGlobalLoginModal } from '@/components/GlobalLoginModal';
import { checkPermissions } from '@/components/Permission/utils';
import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { useTrialUpgradeModal } from '@/components/TrialUpgradeModal';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { Toast } from '@/utils';
import { getToken } from '@/utils/cookie';
import { handleAccountIdBind } from '@/utils/handleAccountIdBind';
import { useAccountIdBindWithUpgrade } from '@/utils/useAccountIdBindWithUpgrade';
import { CompanyType } from '@/views/system/login/component/Login';

import { BuildModelDescribe } from './BuildModelDescribe';
import { getAiProcessStatus } from './BuildModelDescribe/service';
import { AiProcessStatus, BuildModelDescribeSet } from './constant';
import style from './index.module.less';
import { AccountInfoBuildModelProps } from './type';
import { BuildModelMainData } from '../../../../../components/CarbonFootprintAccount/BuildModelMainData';
import {
  BuildModelListQuickTableRef,
  BuildModelVisualRef,
} from '../../../../../components/CarbonFootprintAccount/BuildModelMainData/BuildModelList/Quick/QuickTable/type';
import { postAccountingBasicSaveAndView } from '../../AccountDetail/AccountInfo/service';
import { EAiType } from '../../AccountDetail/AccountInfo/type';
import {
  addSourceByAI,
  genAITopicRecord,
  reBuildByAI,
  reGenAITopicRecord,
  reModelByAI,
} from '../../ProductDetail/AddAccount/service';
import { FootprintAccountStatusType } from '../../constant';
import AccountInfoModal from '../AccountInfoModal';
import { ACCOUNT_STATUS } from '@/views/carbonFootprint3/QuickBusinessAccounting/constant';

const { SHARE, SAASSHARE, ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;

export const AccountInfoBuildModel: FC<AccountInfoBuildModelProps> = memo(
  ({
    agentPreviewLayout,
    isDetail,
    accountInfoModalReadonly,
    isShareEmissionEditable,
    accountInfo,
    buildLoading,
    listOrGraph,
    changeScope,
    changeListOrGraph,
    updateAccountInfo,
    apiExtraParams,
    reportSnapCode,
    authType,
    hideListGraphSwitch,
    noSaveStoreBtn,
    onEmissionTaskCreate,
  }) => {
    const { openLoginModal } = useGlobalLoginModal();
    const handleAccountIdBindWithUpgrade = useAccountIdBindWithUpgrade();

    const history = useHistory();
    const [urlState, setUrlState] = useUrlState<{
      openChat?: boolean;
      topicId?: number;
      source?:
        | 'PRODUCT_FOOTPRINT_LIST_AI'
        | typeof AGENT_CERTIFICATION_PREVIEW_SOURCE;
      snapFlag?: number | string;
    }>(
      { openChat: false },
      { parseOptions: { parseBooleans: true, parseNumbers: true } },
    );
    const isShare = [
      SAASSHARE,
      SHARE,
      ACCOUNT_SHARE_EDIT,
      '6',
      '7',
      6,
      7,
    ].includes(apiExtraParams?.snapFlag ?? urlState?.snapFlag);
    /** 共享编辑 snapFlag=8 + shareAuth：画布「编辑核算」可打开只读详情弹窗 */
    const isShareLinkEditable = isShareLinkEditableContext(apiExtraParams);
    /** Agent 分享页通过 iframe 打开核算详情，使用 snapFlag=7 标识 */
    const isAgentShare =
      Number(apiExtraParams?.snapFlag ?? urlState?.snapFlag) === 7;
    /** 认证预览的 URL 标记与接口使用的 snapFlag=2 不同，不能用接口参数覆盖它。 */
    const isAgentCertificationPreview =
      Number(urlState.snapFlag) === 4 &&
      urlState.source === AGENT_CERTIFICATION_PREVIEW_SOURCE;
    const enableAgentEmissionFields =
      !!agentPreviewLayout || isAgentShare || isAgentCertificationPreview;
    /** 基础信息区只读；分享可编辑时排放源区可编辑 */
    const basicInfoReadOnly = !!isDetail || !!isShareEmissionEditable;
    const emissionReadOnly = !!isDetail && !isShareEmissionEditable;

    /** 自动更新时间的定时器 */
    const timerRef = useRef<Timeout>();
    /** ai建模过程定时器 */
    const aiProcessTimerRef = useRef<Timeout>();

    const childRef = useRef<BuildModelListQuickTableRef>();
    const cRefVisual = useRef<BuildModelVisualRef>();
    const cRefDescribe = useRef<{
      updateTempList: () => void;
    }>();

    const listRef = useRef<{
      updateByAIProcess: () => void;
    }>();

    /** 页面目前展示的是可视化还是列表 - 默认可视化 */
    const [describeSetStatus, setDescribeSetStatus] =
      useState<BuildModelDescribeSet>(listOrGraph);

    /** AI建模进度条显示 */
    const [aiProgress, setAiProgress] = useState(false);

    /** AI建模进度条进度 */
    const [progressNum, setProgressNum] = useState(0);

    /** AI建模的loading状态 */
    const [aiLoading, setAiLoading] = useState(false);

    /** AI建模成功，准备展示排放源列表 */
    const [aiBuildSuccess, setAiBuildSuccess] = useState(false);

    const changeBuildMain = (mainStatus: BuildModelDescribeSet) => {
      setDescribeSetStatus(mainStatus);
      updateAccountInfo();
    };

    const [accountInfoOpen, setAccountInfoOpen] = useState(false);

    const {
      setTopicId,
      setAccountId,
      setFromId,
      setExtraFunc,
      setExpanded,
      setInputMenuItems,
      setActiveMenuKey,
      isExpanded,
    } = useAICarbonFloating();

    /**
     * 自动更新进度条
     * @param times 每次更新间隔
     * @param maxNum 到达最大值关闭进度条
     */
    // const autoProgress = (times: number, maxNum: number) => {
    //   timerRef.current = setInterval(() => {
    //     setProgressNum(num => {
    //       if (num === 100) {
    //         setAiProgress(false);
    //         setAiLoading(false);
    //         setAiBuildSuccess(true);
    //         childRef.current?.reset();
    //         updateAccountInfo();
    //         // 通知后台动画执行完毕
    //         postAiFinish({ accountId: accountInfo?.id });
    //         Toast('success', I18N.carbonFootprint3.modelingCompleted);
    //       }

    //       if (num >= maxNum) {
    //         clearInterval(timerRef.current);
    //         clearInterval(aiProcessTimerRef.current);
    //         timerRef.current = undefined;
    //         return num;
    //       }
    //       return num + 1;
    //     });
    //   }, times * 1000);
    // };

    const goModelingBack = async (status: boolean) => {
      if (status) {
        await cRefVisual?.current?.updateGraph();
      }
    };

    // /**
    //  * 开始建模
    //  * @param status 状态码 false 接口未响应完毕 true接口响应完毕
    //  * @param closeStatus 异常提示
    //  */
    // const goModelingBack = async (status: boolean, closeStatus?: boolean) => {
    //   // 函数：处理异常情况
    //   const handleException = () => {
    //     setAiProgress(false);
    //     setAiLoading(false);
    //     setProgressNum(0);
    //     clearInterval(timerRef.current);
    //     timerRef.current = undefined;
    //   };

    //   // 视图切换函数
    //   const switchToOriginalView = () =>
    //     cRefVisual.current?.aiChangeType(DEFAULT);

    //   // 处理异常情况，直接关闭弹框
    //   if (closeStatus) {
    //     handleException();
    //     return;
    //   }

    //   // 将可视化切换到原视图模式
    //   switchToOriginalView();

    //   // debugger
    //   // 正常执行流程
    //   setAiProgress(true);

    //   setAiLoading(true);
    //   if (status) {
    //     if (listOrGraph === LIST) {
    //       clearInterval(timerRef.current);
    //       autoProgress(0.2, 100);
    //     } else {
    //       // 获取到最大的长度  也就是动画要执行的次数
    //       const maxNum = await cRefVisual?.current?.updateAiGraph();

    //       if (maxNum) {
    //         clearInterval(timerRef.current);

    //         // 剩余进度条需要多长执行一次
    //         const maxTimes = Number(((maxNum * 2.5) / 80).toFixed(2));
    //         // 每1s更新下进度
    //         autoProgress(maxTimes, 100);
    //       }
    //     }
    //   } else {
    //     // 每1s更新下进度
    //     autoProgress(2, 19);
    //   }
    // };

    /** 导入排放源后收到的回调 */
    const onOkImport = () => {
      setProgressNum(0);
      setAiProgress(false);
      setAiBuildSuccess(false);
      setAiLoading(false);

      // 关闭进度条的循环执行
      clearInterval(timerRef.current);

      childRef.current?.reset();
      cRefVisual?.current?.updateGraph();
      updateAccountInfo();
    };

    /**
     * 当编辑排放源后 获取到数量以及单位 主动更新画布数值
     */
    const updateGaphByAi = () => {
      childRef.current?.reset();
      cRefVisual?.current?.updateGraph();
      updateAccountInfo();
    };

    /**
     * 主动取消建模
     */
    const closeAiBuilding = () => {
      setProgressNum(0);
      setAiProgress(false);
      setAiBuildSuccess(false);
      setAiLoading(false);

      // 关闭进度条的循环执行
      clearInterval(timerRef.current);
      // 通知可视化停止自动建模
      cRefVisual.current?.closeUpdateAiGraph();

      childRef.current?.reset();
      updateAccountInfo();
    };

    /** 操作排放源后的回调  */
    const changeEmission = () => {
      cRefDescribe?.current?.updateTempList();
    };

    /**
     * 判断当前动画执行情况 - 主要是为了兼容建模中刷新页面
     */
    const initAiProcess = async () => {
      if (isDetail) return;

      if (urlState.source === 'PRODUCT_FOOTPRINT_LIST_AI') {
        return;
      }

      if (accountInfo.aiType === EAiType.AI_CREATE) {
        return;
      }

      // 初次加载先清空
      clearInterval(aiProcessTimerRef.current);
      const { data } = await getAiProcessStatus({ accountId: accountInfo?.id });
      // 建模临时数据列表
      if (data.data === AiProcessStatus.FAIL && accountInfo?.aiStatus === 1) {
        setAiBuildSuccess(true);
      }

      // 接口还没给响应
      if (data.data === AiProcessStatus.PENDING) {
        setAiLoading(true);
        await goModelingBack(false);
        // setAiLoading(true);
        // 开启定时器进行循环访问接口状态
        aiProcessTimerRef.current = setInterval(() => {
          getAiProcessStatus({ accountId: accountInfo?.id }).then(res => {
            // 只有执行完毕才会关闭
            if (res.data.data === AiProcessStatus.SUCCESS) {
              clearInterval(aiProcessTimerRef.current);
              goModelingBack(true);
              setAiBuildSuccess(true);
            }
          });
        }, 3000);
      }

      // 接口已经返回结果 但是动画没执行完毕
      if (data.data === AiProcessStatus.SUCCESS) {
        await goModelingBack(true);
        setAiBuildSuccess(true);
      }
    };

    useMount(() => {
      initAiProcess();
      if (urlState.openChat) {
        setExpanded(true);
        setUrlState({ openChat: undefined });
      }
    });

    useUnmount(() => {
      clearInterval(aiProcessTimerRef.current);
    });

    useEffect(() => {
      if (isExpanded) {
        const { topicId } = urlState;
        const { type, id, accountStatus } = accountInfo;

        if (topicId) {
          setTopicId(topicId);
        }
        setFromId(id);
        setAccountId(id);

        if (type !== FootprintAccountStatusType.QUICK) {
          return;
        }

        setExtraFunc({
          onHistoryFailed: async data => {
            await reGenAITopicRecord(data);
            reBuildByAI(data);
            Toast('success', I18N.carbonFootprint.operationSuccessful);
            setTimeout(() => {
              cRefVisual.current?.renderGraphByAiProcess?.();
              listRef.current?.updateByAIProcess?.();
            }, 1000);
          },
        });

        if (accountStatus !== ACCOUNT_STATUS.FINISHED) {
          setInputMenuItems([
            {
              key: AI_INPUT_MENU_ITEMS.ADD_EMISSION_SOURCE,
              label: AI_INPUT_MENU_ITEMS_LABEL(
                AI_INPUT_MENU_ITEMS.ADD_EMISSION_SOURCE,
              ),
              templateDictType: 'footprint3_export_template',
              templateDictValue: 'accountEmission',
              onExecute: async data => {
                await genAITopicRecord(data);
                addSourceByAI(data);
                setTimeout(() => {
                  cRefVisual.current?.renderGraphByAiProcess?.();
                  listRef.current?.updateByAIProcess?.();
                }, 1000);
              },
            },
            {
              key: AI_INPUT_MENU_ITEMS.REMODEL,
              label: AI_INPUT_MENU_ITEMS_LABEL(AI_INPUT_MENU_ITEMS.REMODEL),
              templateDictType: 'footprint3_export_template',
              templateDictValue: 'accountEmission',
              onExecute: async data => {
                await genAITopicRecord(data);
                reModelByAI(data);
                setTimeout(() => {
                  cRefVisual.current?.renderGraphByAiProcess?.();
                  listRef.current?.updateByAIProcess?.();
                }, 1000);
              },
            },
          ]);
        } else {
          setInputMenuItems(undefined);
          setActiveMenuKey(undefined);
        }
      }
    }, [isExpanded, accountInfo]);

    return (
      <GwpScopeContext.Provider
        value={
          enableAgentEmissionFields &&
          accountInfo.type === FootprintAccountStatusType.QUICK
        }
      >
        <CustomFactorReuseContext.Provider
          value={
            !!agentPreviewLayout &&
            !emissionReadOnly &&
            accountInfo.type === FootprintAccountStatusType.QUICK
          }
        >
          <div className={classNames(style.accountInfoBuildModel)}>
            {aiProgress && (
              <div className={style.progressDiv}>
                <div className={style.progressMain}>
                  <img className={style.progressIcon} src={AIIcon} alt='ai' />
                  <span className={style.progressTitle}>
                    {I18N.carbonFootprint3.inAiModeling}
                  </span>
                  <Progress
                    className={style.progress}
                    percent={progressNum}
                    strokeColor='#0CBF9F'
                  />
                </div>
              </div>
            )}
            <AccountInfoModal
              accountId={accountInfo.id}
              open={accountInfoOpen}
              apiExtraParams={apiExtraParams}
              readonly={
                isShareLinkEditable ||
                !checkPermissions(true, 'footprint3:account:edit') ||
                basicInfoReadOnly ||
                !!accountInfoModalReadonly
              }
              formDisabled={!!accountInfoModalReadonly}
              onClose={() => setAccountInfoOpen(false)}
              onConfirm={async data => {
                await postAccountingBasicSaveAndView(data as unknown as any);
                Toast('success', I18N.carbonFootprint.operationSuccessful);
                updateAccountInfo();
                cRefVisual?.current?.updateGraph();
              }}
            />
            <ModelCheckEmissionFieldsContext.Provider
              value={enableAgentEmissionFields}
            >
              <BuildModelDescribe
                cRefDescribe={cRefDescribe}
                isDetail={basicInfoReadOnly}
                aiLoading={aiLoading}
                closeAiBuilding={closeAiBuilding}
                aiBuildSuccess={aiBuildSuccess}
                updateGaphByAi={updateGaphByAi}
                apiExtraParams={apiExtraParams}
                accountInfo={accountInfo}
                switchMain={describeSetStatus}
                changeBuildMain={changeBuildMain}
                changeScope={changeScope}
                changeListOrGraph={changeListOrGraph}
                hideListGraphSwitch={hideListGraphSwitch}
                onOkImport={onOkImport}
                goModelingBack={goModelingBack}
                updateAccountInfo={updateAccountInfo}
              />
            </ModelCheckEmissionFieldsContext.Provider>
            <Spin spinning={buildLoading}>
              <MeasurementPrecisionContext.Provider
                value={
                  enableAgentEmissionFields
                    ? AGENT_MEASUREMENT_PRECISION
                    : DEFAULT_MEASUREMENT_PRECISION
                }
              >
                <ShowFactorTypeContext.Provider
                  value={enableAgentEmissionFields}
                >
                  <BuildModelMainData
                    enableTransportReuse={
                      !!agentPreviewLayout &&
                      !emissionReadOnly &&
                      accountInfo.type === FootprintAccountStatusType.QUICK
                    }
                    agentPreviewLayout={agentPreviewLayout}
                    authType={authType}
                    isDetail={emissionReadOnly}
                    editAccount={() => {
                      if (!getToken() && !isShare && !isShareLinkEditable) {
                        openLoginModal({
                          companyType: CompanyType.company,
                          showWechatLogin: true,
                          onSuccess: async () => {
                            await handleAccountIdBindWithUpgrade();
                          },
                        });
                        return;
                      }
                      // 非共享编辑的分享链接仍禁止编辑核算详情
                      if (isShare && !isShareLinkEditable) {
                        return;
                      }
                      setAccountInfoOpen(true);
                    }}
                    cRefVisual={cRefVisual}
                    cRef={childRef}
                    listRef={listRef}
                    accountInfo={accountInfo}
                    switchMain={describeSetStatus}
                    updateAccountInfo={updateAccountInfo}
                    apiExtraParams={apiExtraParams}
                    noSaveStoreBtn={noSaveStoreBtn}
                    onEmissionTaskCreate={onEmissionTaskCreate}
                    changeEmission={changeEmission}
                    reportSnapCode={reportSnapCode}
                    enableFactorSourceRange={
                      !emissionReadOnly &&
                      (!isShare || !!isShareEmissionEditable)
                    }
                  />
                </ShowFactorTypeContext.Provider>
              </MeasurementPrecisionContext.Provider>
            </Spin>
          </div>
        </CustomFactorReuseContext.Provider>
      </GwpScopeContext.Provider>
    );
  },
);
