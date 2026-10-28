import useUrlState from '@ahooksjs/use-url-state';
import { CloseOutlined } from '@ant-design/icons';
import { LocaleContext } from '@src/components/LocaleProvider';
import I18N, { LocaleType, serviceLangMap } from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { PageInfoType } from '@src/router/type';
import { Toast } from '@src/utils/Toast';
import { copyToClipboard, encrypt } from '@src/utils';
import { MODEL_EMISSION_MATCH_WAY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { STEP_OPTION_VALUE } from '@src/views/carbonFootprint3/util/constant';
import { useMount } from 'ahooks';
import { Modal, Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { flatMap, uniqueId } from 'lodash-es';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import aiCarbonImg from '@/assets/svg/aiCarbon.svg';
import { useAICarbonFloating } from '@/components/AICarbonFloating/AICarbonContext';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { useGlobalLoginModal } from '@/components/GlobalLoginModal';
import { LoadingProgressModal } from '@/components/LoadingProgressModal';
import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { useTrialUpgradeModal } from '@/components/TrialUpgradeModal';
import { sleep } from '@/utils';
import { getToken } from '@/utils/cookie';
import { useAccountIdBindWithUpgrade } from '@/utils/useAccountIdBindWithUpgrade';
import {
  CompanyType,
  ProductSource,
} from '@/views/system/login/component/Login';

import styles from './index.module.less';
import {
  getAccountViewEveryList,
  getAccountingInfo,
  postAccountUpadteScope,
  postProcessAccountFinish,
  revokeAccount,
  postAiModelAndWebsite,
  postAiModelThird,
  getAiProcess,
  postAiModelFinish,
} from './service';
import {
  AccountingInfoData,
  AccountingUpadteScopeParams,
  ProcessAccountEveryList,
  UrlStateProps,
  UserStatus,
} from './type';
import { AccountInfoAIChat } from '../../component/AccountInfoAIChat';
import type { AccountInfoAIChatRef } from '../../component/AccountInfoAIChat/type';
import { AccountInfoBuildModel } from '../../component/AccountInfoBuildModel';
import { BuildModelDescribeSet } from '../../component/AccountInfoBuildModel/constant';
import { AccountInfoResult } from '../../component/AccountInfoResult';
import { AccountInfoStep } from '../../component/AccountInfoStep';
import LinkShareModal from '../../component/LinkShareModal';
import { LinkShareContent } from '../../component/LinkShareModal/type';
import ModelShareModal from '../../component/ModelShareModal';
import SysShareRecordModal from '../../component/SysShareRecordModal';
import { ProductAccountingList } from '../../component/ProductSelectAccount/type';
import {
  FootprintAccountInfoUrlStatus,
  FootprintAccountStatusType,
} from '../../constant';
import type { AccountEmissionTaskTarget } from '../../component/AccountInfoResult/type';
import {
  getAccountProductInfo,
  getShareInit,
  postShareAdd,
} from '../../service';
import { isShareModelThirdReadOnlyAccount } from '../../../share';

const { MODEL, RESULT } = STEP_OPTION_VALUE;
const { ADD, EDIT, DETAIL } = FootprintAccountInfoUrlStatus;
const { PROCESS } = FootprintAccountStatusType;
const { SHARE, SAASSHARE } = API_EXTRA_PARAMS_SNAPFLAG;

type FootprintAccountAddProps = {
  embedded?: boolean;
  hideStepNavigation?: boolean;
  onAISuggestionReferenceSelect?: (content: string) => void;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
  previewMode?: 'agent';
  readonly?: boolean;
  showBusinessForesight?: boolean;
  showResultOverview?: boolean;
};

/** 分享默认链接 */
const shareInitUrl = `${window.location.origin}/carbonFootprint3/footprintAccount/shareAccountLogin`;

/**
 * @description 新增、编辑和详情 快速、过程核算
 */
const FootprintAccountAdd = ({
  embedded = false,
  hideStepNavigation = false,
  onAISuggestionReferenceSelect,
  onEmissionTaskCreate,
  previewMode,
  readonly = false,
  showBusinessForesight = true,
  showResultOverview = false,
}: FootprintAccountAddProps) => {
  const history = useHistory();
  const location = useLocation();
  const { changeLocale, locale } = useContext(LocaleContext);

  /** 页面存储参数 */
  const [urlState, setUrlState] = useUrlState<UrlStateProps>();

  /** 左上角回退 - 返回的文案 */
  const [backText, setBackText] = useState<string>();

  /** 主要区域内容加载loading */
  const [mainLoading, setMainLoading] = useState(false);

  /** AI 模型流程加载loading */
  const [aiModelLoading, setAiModelLoading] = useState(false);

  /** AI 模型轮询定时器引用 */
  const aiProcessPollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [aiChatRemountKey, setAiChatRemountKey] = useState(() => uniqueId());

  /** 三个点动画的状态 */
  // const [dotsCount, setDotsCount] = useState(1);
  /** 三个点动画定时器引用 */
  // const dotsAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  /** 更新构建模型内容的Keyƒ */
  const [buildModelKey, setBuildModel] = useState(uniqueId());

  /** 设置当前选中的步骤  - 默认基本信息*/
  const [stepValue, setStepValue] = useState<number>(
    Number(urlState.stepValue),
  );

  /** 顶部小碳入口控制 AI Agent 对话抽屉 */
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const aiChatAutoOpenedRef = useRef(false);
  const aiChatRef = useRef<AccountInfoAIChatRef>(null);

  /** 核算的信息 */
  const [accountInfo, setAccountInfo] = useState<AccountingInfoData>();

  /** 模型共享弹窗 */
  const [modelShareModalOpen, setModelShareModalOpen] = useState(false);

  /** 链接分享弹窗 */
  const [shareModal, setShareModal] = useState(false);
  const [shareModalContent, setShareModalContent] = useState<LinkShareContent>({
    url: shareInitUrl,
    type: 1,
    locale,
    password: '',
    expireValue: -1,
    editType: 0,
  });
  const [errorSharePassword, setErrorSharePassword] = useState(false);
  const [sysShareRecordAccount, setSysShareRecordAccount] =
    useState<ProductAccountingList | null>(null);
  const [sysShareRecordRefreshKey, setSysShareRecordRefreshKey] = useState(0);
  /** 链接分享复制中，防止接口返回前连续点击重复创建分享记录 */
  const [shareCopying, setShareCopying] = useState(false);
  const shareCopyingRef = useRef(false);

  /** 当前步骤允许点击的 */
  const [stepStatus, setStepStatus] = useState<number>(MODEL);

  /** URL 是否为查看态 */
  const isDetailFromUrl = Number(urlState.status) === DETAIL;

  /**
   * shareFlag=4/5 且数据库 thirdId 有值时，仅「核算详情」弹框只读
   */
  const isShareModelThirdReadOnly = useMemo(
    () => isShareModelThirdReadOnlyAccount(accountInfo),
    [accountInfo],
  );

  /** 顶部步骤条 / 建模区是否只读（仅 URL 详情态） */
  const isDetail = isDetailFromUrl;

  /** 分享上下文（与建模页 BuildModelDescribe / AccountInfoBuildModel 判定一致） */
  const isShareContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const shareId = params.get('shareId');
    if (shareId) return true;
    if (location.pathname.includes('footprintAccount/share')) return true;
    const snapRaw = params.get('snapFlag');
    const snapFlag =
      snapRaw !== null && snapRaw !== ''
        ? Number.isNaN(Number(snapRaw))
          ? snapRaw
          : Number(snapRaw)
        : undefined;
    return [SAASSHARE, SHARE, '6', '7', 6, 7].includes(snapFlag as never);
  }, [location.pathname, location.search]);

  const { openLoginModal } = useGlobalLoginModal();
  const { openSubscriptionModal } = useSubscriptionServiceModal();
  const { openTrialUpgradeModal } = useTrialUpgradeModal();
  const handleAccountIdBindWithUpgrade = useAccountIdBindWithUpgrade();
  const { setInputMenuItems, setActiveMenuKey } = useAICarbonFloating();
  /**
   * 获取产品详情
   * @returns 产品信息
   */
  const getProductInfo = useCallback(async () => {
    if (!urlState.productId) return;

    const { data } = await getAccountProductInfo({ id: urlState.productId });
    setBackText(data.data.productName);
  }, [urlState.productId]);

  /**
   * 获取核算信息
   */
  const getAccountInfo = useCallback(async () => {
    if (!urlState.accountId) return;
    setMainLoading(true);
    const { data } = await getAccountingInfo({
      id: urlState.accountId,
      lang: serviceLangMap[locale],
    });

    setStepStatus(data.data.accountStatus);

    setBackText(data.data.productName);
    setAccountInfo(data.data);
    setMainLoading(false);
  }, [urlState.accountId, locale]);

  /**
   * 更改当前步骤
   * @param step 选中步骤
   */
  const changeSetp = (step: number) => {
    setUrlState({
      ...urlState,
      stepValue: step,
    });
    setStepValue(step);
  };

  /**
   * 切换生命周期
   * @param data 更改生命周期的参数
   */
  const changeScope = async (data: AccountingUpadteScopeParams) => {
    await postAccountUpadteScope(data);
    await getAccountInfo();
    setBuildModel(uniqueId());
  };

  /**
   * 切换列表模式
   * @param listOrGraph 切换的列表模式
   */
  const changeListOrGraph = (listOrGraph: BuildModelDescribeSet) => {
    setUrlState({
      ...urlState,
      listOrGraph,
    });
  };

  const getProcessAccountListCheck = (data: ProcessAccountEveryList) => {
    let backArr: ProcessAccountEveryList[] = [];
    const arrChildren =
      data.children && data.children.length > 0 ? data.children : false;
    const arrEmissionList =
      data.emissionList && data.emissionList.length > 0
        ? data.emissionList
        : false;
    const arr = arrChildren || arrEmissionList;
    if (arr) {
      arr.forEach(child => {
        backArr = [...backArr, ...getProcessAccountListCheck(child)];
      });
    } else {
      backArr.push(data);
    }

    return backArr;
  };

  /**
   * @description 校验所有的排放源是否信息完整
   */
  const checkEmissions: () => Promise<boolean> = async () => {
    try {
      if (accountInfo) {
        const resp = await getAccountViewEveryList({ id: accountInfo.id });
        const emissionList = getProcessAccountListCheck(resp.data.data);
        const emissionListFlatMap = flatMap(emissionList);

        return emissionListFlatMap
          .filter(emission => {
            const matchTypeOrMatchWay = emission.matchWay || emission.matchType;
            return matchTypeOrMatchWay !== MODEL_EMISSION_MATCH_WAY.SUPPLIER;
          })
          .every(emission => emission.emissionTotal !== null);
      }
      return false;
    } catch {
      return false;
    }
  };

  /**
   * @description: 生成碳足迹结果
   */
  const createFinishReport = async () => {
    if (stepStatus === RESULT) {
      setStepValue(RESULT);
      return;
    }
    if (accountInfo) {
      const checkEmissionsStatus = await checkEmissions();
      if (checkEmissionsStatus) {
        await postProcessAccountFinish({ id: accountInfo.id });
        updateAccountInfo();
        setInputMenuItems(undefined);
        setActiveMenuKey(undefined);
        setStepValue(RESULT);
        setUrlState({
          ...urlState,
          stepValue: RESULT,
        });
        Toast('success', I18N.carbonFootprint3.successfullyGeneratedCarbon);
      } else {
        Toast('warn', I18N.carbonFootprint3.pleaseFillInTheInformation);
      }
    }
  };

  /**
   * 碳足迹结果页面 - 申请碳标签
   */
  const goCarbonLabel = () => {
    if (urlState?.accountId && urlState?.productId) {
      history.push(
        `${RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabelAdd}?productId=${urlState.productId}&accountId=${urlState.accountId}`,
      );
    }
  };

  /** 清除链接分享参数 */
  const clearShare = () => {
    setShareModal(false);
    shareCopyingRef.current = false;
    setShareCopying(false);
    setShareModalContent({
      url: shareInitUrl,
      type: 1,
      locale,
      password: '',
      expireValue: -1,
      editType: 0,
    });
  };

  /**
   * 链接分享（与核算列表一致，供模型共享弹窗「链接收数」使用）
   */
  const shareAccount = async (
    shareInfo: ProductAccountingList,
    options?: { editType?: number; editPermit?: number },
  ) => {
    const shareData = await getShareInit();
    const isProcessAccount = shareInfo.type === PROCESS;
    setShareModal(true);
    const urlParams = encrypt(
      `shareId=${shareData.data.data.id}&productId=${shareInfo.productId}&status=${DETAIL}&accountId=${shareInfo.id}&stepValue=0&listOrGraph=1&lang=${locale}`,
    );
    setShareModalContent(prev => ({
      ...prev,
      accountId: shareInfo.id,
      id: shareData.data.data.id,
      url: `${shareInitUrl}?${urlParams}`,
      editType: isProcessAccount ? 0 : options?.editType || 0,
      editPermit: isProcessAccount ? undefined : options?.editPermit,
    }));
  };

  /** 添加链接分享并复制 */
  const shareAdd = async () => {
    if (shareCopyingRef.current) return;
    if (errorSharePassword && shareModalContent.type === 1) {
      Toast('warn', I18N.carbonFootprint3.pleaseFollowTheFormat);
      return;
    }
    if (!shareModalContent.id || !shareModalContent.accountId) return;

    const textToCopy =
      shareModalContent.type === 1
        ? I18N.template(I18N.carbonFootprint3.carbonCloudLinkCarbon2, {
            val1: shareModalContent.url,
            val2: shareModalContent.password,
          })
        : I18N.template(I18N.carbonFootprint3.carbonCloudLinkCarbon, {
            val1: shareModalContent.url,
          });

    shareCopyingRef.current = true;
    setShareCopying(true);
    try {
      const copyPromise = postShareAdd({
        type: shareModalContent.type,
        password: shareModalContent.password,
        id: shareModalContent.id,
        url: shareModalContent.url,
        accountId: shareModalContent.accountId,
        expireValue: shareModalContent.expireValue,
        editType: shareModalContent.editType,
        editPermit:
          shareModalContent.editType === 1
            ? shareModalContent.editPermit ?? 0
            : undefined,
      }).then(() => textToCopy);

      await copyToClipboard(copyPromise);

      setSysShareRecordRefreshKey(key => key + 1);
      clearShare();
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } finally {
      shareCopyingRef.current = false;
      setShareCopying(false);
    }
  };

  /**
   * @description: 生成报告
   */
  const goAddReport = () => {
    if (accountInfo) {
      history.push(
        virtualLinkTransform(
          RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
          [':pageInfoType', ':id', ':comparisonId'],
          [PageInfoType.add, accountInfo.id, 'null'],
        ),
      );
    }
  };

  /** 重新编辑模型 */
  const goEditModel = async (changeStep: boolean = true) => {
    await revokeAccount({ id: urlState.accountId });
    updateAccountInfo();
    if (changeStep) {
      setStepValue(MODEL);
    }
    setStepStatus(MODEL);
    // getAccountInfo();
  };

  /**
   * 更新核算信息
   */
  const updateAccountInfo = async () => {
    const { data } = await getAccountingInfo({
      id: urlState.accountId,
      lang: serviceLangMap[locale],
    });
    setAccountInfo(data.data);
  };

  /**
   * 左侧 AI「更新建模」完成：与初次进入页一致——重新拉核算详情，并重挂载建模区与 AI（接口全流程重来）。
   * 当前 Step、列表/流程图由 urlState 与本地 stepValue 维持，不因 remount 改变。
   */
  const afterAiChatModelUpdated = async () => {
    await getAccountInfo();
    setBuildModel(uniqueId());
    setAiChatRemountKey(uniqueId());
  };

  /**
   * 返回产品详情页面
   */
  const backClick = () => {
    if (!getToken()) {
      openLoginModal({
        companyType: CompanyType.company,
        showWechatLogin: true,
        onSuccess: async () => {
          await handleAccountIdBindWithUpgrade();
        },
      });
      return;
    }
    history.push(
      `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail}?productId=${urlState.productId}`,
    );
  };

  /**
   * 从 URL 中提取 signKeys 参数
   * @param url 完整的 URL 字符串
   * @returns signKeys 值
   */
  const extractSignKeysFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('signKeys');
    } catch {
      return null;
    }
  };

  /**
   * 处理 AI 模型流程
   * 当只有 userKeys 和 userContent 参数时，调用 AI 相关接口
   */
  /**
   * 继续执行 AI 模型流程的核心逻辑
   * @param accountId 账户ID
   * @param productId 产品ID
   * @param modelUrl 模型URL
   */
  const continueAiModelFlow = useCallback(
    async (
      accountId: string | number,
      productId: number,
      modelUrl: string,
      userStatus: UserStatus,
    ) => {
      if (!accountId) {
        return;
      }
      // 从 modelUrl 中提取 signKeys
      const signKeys = extractSignKeysFromUrl(modelUrl);

      if (!signKeys) {
        Toast('error', I18N.carbonFootprint3.unableToReturnFrom);
        setAiModelLoading(false);
        return;
      }

      const accountIdNum = Number(accountId);
      const accountIdStr = String(accountId);

      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');

      // 更新 URL 状态，添加 accountId 和 productId
      // 设置为编辑状态
      setUrlState({
        ...urlState,
        accountId: accountIdStr,
        productId: String(productId),
        status: EDIT,
      });

      // 第二步：调用 aiModelThird 接口（保持 loading 状态）
      postAiModelThird({
        accountId: accountIdNum,
        productId,
        userKeys: urlState.userKeys,
        userContent: urlState.userContent,
        signKeys,
        referId: urlState.referId || undefined,
        scope: urlState.scope ? Number(urlState.scope) : undefined,
        scopeValue: urlState.scopeValue || '',
        factorPrefId: urlState.factorPrefId
          ? Number(urlState.factorPrefId)
          : undefined,
        lang: langParam || undefined,
      });

      // 第三步：开始轮询 aiProcess 接口，直到 data 为 1
      // 先清除之前的定时器（如果存在）
      if (aiProcessPollingTimerRef.current) {
        clearInterval(aiProcessPollingTimerRef.current);
        aiProcessPollingTimerRef.current = null;
      }

      await sleep(1000);

      const pollAiProcess = (): Promise<void> =>
        new Promise((resolve, reject) => {
          const checkProcess = async () => {
            try {
              const processRes = await getAiProcess({
                accountId: accountIdNum,
              });
              if (processRes.data.code === 200) {
                if (processRes.data.data === 0) {
                  // 处理完成，停止轮询
                  if (aiProcessPollingTimerRef.current) {
                    clearInterval(aiProcessPollingTimerRef.current);
                    aiProcessPollingTimerRef.current = null;
                  }
                  resolve();
                  return;
                }
                // 继续轮询
                if (!aiProcessPollingTimerRef.current) {
                  aiProcessPollingTimerRef.current = setInterval(
                    checkProcess,
                    2000,
                  );
                }
              } else {
                // 接口返回错误，停止轮询
                if (aiProcessPollingTimerRef.current) {
                  clearInterval(aiProcessPollingTimerRef.current);
                  aiProcessPollingTimerRef.current = null;
                }
                reject(
                  new Error(
                    processRes.data.msg ||
                      I18N.carbonFootprint3.queryProcessingIn,
                  ),
                );
              }
            } catch (error) {
              // 请求失败，停止轮询
              if (aiProcessPollingTimerRef.current) {
                clearInterval(aiProcessPollingTimerRef.current);
                aiProcessPollingTimerRef.current = null;
              }
              reject(error);
            }
          };

          // 立即执行一次
          checkProcess();
        });

      // 等待轮询完成
      await pollAiProcess();

      // 完成后移除 userKeys 和 userContent
      const {
        userKeys: removedUserKeys,
        userContent: removedUserContent,
        ...restUrlState
      } = urlState;
      setUrlState({
        ...restUrlState,
        accountId: accountIdStr,
        productId: String(productId),
        status: userStatus === UserStatus.NORMAL ? EDIT : DETAIL,
        stepValue: MODEL,
        listOrGraph: 1,
        userKeys: undefined,
        userContent: undefined,
        // &listOrGraph=1&productId=3072&status=2&stepValue=1
      });
      window.location.reload();
      // 获取核算信息
      await getAccountInfo();
    },
    [urlState, setUrlState, getAccountInfo],
  );

  /**
   * 列表页 AI 入口跳转后的流程：调用 aiModelFinish 后轮询 aiProcess，完成后更新 URL 并刷新
   */
  const aiModelFinishFlow = useCallback(async () => {
    const { accountId, productId, userContent } = urlState;
    if (!accountId || !productId) {
      return;
    }
    const accountIdNum = Number(accountId);
    const productIdNum = Number(productId);
    try {
      setAiModelLoading(true);
      const res = await postAiModelFinish({
        accountId: accountIdNum,
        productId: productIdNum,
        userContent,
        scope: urlState.scope ? Number(urlState.scope) : undefined,
        scopeValue: urlState.scopeValue || '',
        factorPrefId: urlState.factorPrefId
          ? Number(urlState.factorPrefId)
          : undefined,
      });
      if (res.data?.code !== 200) {
        return;
      }

      // 轮询 aiProcess 接口，直到 data 为 0（处理完成）
      if (aiProcessPollingTimerRef.current) {
        clearInterval(aiProcessPollingTimerRef.current);
        aiProcessPollingTimerRef.current = null;
      }
      await sleep(1000);

      const pollAiProcess = (): Promise<void> =>
        new Promise((resolve, reject) => {
          const checkProcess = async () => {
            try {
              const processRes = await getAiProcess({
                accountId: accountIdNum,
              });
              if (processRes.data.code === 200) {
                if (processRes.data.data === 0) {
                  if (aiProcessPollingTimerRef.current) {
                    clearInterval(aiProcessPollingTimerRef.current);
                    aiProcessPollingTimerRef.current = null;
                  }
                  resolve();
                  return;
                }
                if (!aiProcessPollingTimerRef.current) {
                  aiProcessPollingTimerRef.current = setInterval(
                    checkProcess,
                    2000,
                  );
                }
              } else {
                if (aiProcessPollingTimerRef.current) {
                  clearInterval(aiProcessPollingTimerRef.current);
                  aiProcessPollingTimerRef.current = null;
                }
                reject(
                  new Error(
                    processRes.data.msg ||
                      I18N.carbonFootprint3.queryProcessingIn,
                  ),
                );
              }
            } catch (error) {
              if (aiProcessPollingTimerRef.current) {
                clearInterval(aiProcessPollingTimerRef.current);
                aiProcessPollingTimerRef.current = null;
              }
              reject(error);
            }
          };
          checkProcess();
        });

      await pollAiProcess();

      const { useContent: _u, source: _s, userContent: _c, ...rest } = urlState;
      setUrlState({
        ...rest,
        accountId: accountIdNum,
        productId: String(productIdNum),
        status: EDIT,
        stepValue: MODEL,
        listOrGraph: 1,
        useContent: undefined,
        source: undefined,
        userContent: undefined,
      });
      window.location.reload();
    } catch (error: any) {
      Toast(
        'error',
        error?.data?.msg || I18N.carbonFootprint3.queryProcessingIn,
      );
    } finally {
      setAiModelLoading(false);
    }
  }, [urlState, setUrlState]);

  useEffect(() => {
    const { useContent, source, productId, accountId } = urlState;
    if (
      useContent &&
      source === 'PRODUCT_FOOTPRINT_LIST_AI' &&
      productId &&
      accountId
    ) {
      aiModelFinishFlow();
    }
  }, [urlState]);

  // 根据 URL 参数切换语言（未登录时）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    // 如果 URL 中有 lang 参数且用户未登录，则切换语言
    if (langParam && !getToken()) {
      const langMap: Record<string, LocaleType> = {
        zh: LocaleType.zhCN,
        en: LocaleType.enUS,
        'zh-CN': LocaleType.zhCN,
        'en-US': LocaleType.enUS,
      };

      const targetLocale = langMap[langParam.toLowerCase()];
      // 只有当目标语言与当前语言不同时才切换
      if (targetLocale && targetLocale !== locale) {
        changeLocale({
          currentLocale: targetLocale,
          onlyFeSwitch: true, // 未登录时只切换前端语言
        });
      }
    }
  }, [changeLocale, locale]);

  const handleAiModelFlow = useCallback(async () => {
    if (!urlState.userKeys || !urlState.userContent) {
      return;
    }

    try {
      setAiModelLoading(true);
      // 第一步：调用 aiModelAndWebsite 接口

      const urlParams = new URLSearchParams(window.location.search);
      const lang = urlParams.get('lang') || undefined;

      const { data } = await postAiModelAndWebsite({
        userKeys: urlState.userKeys,
        userContent: urlState.userContent,
        productName: urlState.productName,
        productDesc: urlState.productDesc,
        accountUnitName: urlState.accountUnitName,
        amount: urlState.amount,
        referId: urlState.referId || undefined,
        scope: urlState.scope ? Number(urlState.scope) : undefined,
        scopeValue: urlState.scopeValue || '',
        factorPrefId: urlState.factorPrefId
          ? Number(urlState.factorPrefId)
          : undefined,
        lang,
      });

      if (data.code === 200 && data.data) {
        const { accountId, productId, modelUrl, userStatus } = data.data;

        if (userStatus === UserStatus.SKU_INSUFFICIENT) {
          Toast('error', I18N.carbonFootprint3.noSkuLeft);
          setAiModelLoading(false);
          openTrialUpgradeModal({
            onUpgrade: () => {
              openSubscriptionModal({
                onSuccess: async () => {
                  // 升级成功后，继续执行 AI 模型流程
                  window.location.reload();
                },
                onCancel: () => {
                  history.push(
                    RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
                  );
                  window.location.reload();
                },
                productSource: ProductSource.product,
              });
            },
            onCancel: () => {
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
              );
              window.location.reload();
            },
          });
          return;
        }
        if (userStatus === UserStatus.TRIAL_MODELED) {
          Toast('error', I18N.carbonFootprint3.youHaveModeledItPlease);
          setAiModelLoading(false);
          openTrialUpgradeModal({
            onUpgrade: () => {
              openSubscriptionModal({
                onSuccess: async () => {
                  // 升级成功后，继续执行 AI 模型流程
                  window.location.reload();
                },
                onCancel: () => {
                  history.push(
                    RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
                  );
                  window.location.reload();
                },
                productSource: ProductSource.product,
              });
            },
            onCancel: () => {
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
              );
              window.location.reload();
            },
          });
          return;
        }
        if (userStatus === UserStatus.SAAS) {
          history.push(RouteMaps.workIndex);
          window.location.reload();
          return;
        }
        if (userStatus === UserStatus.NO_PERMISSION) {
          history.push(
            RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
          );
          window.location.reload();
          return;
        }
        if (userStatus === UserStatus.TRIAL_EXPIRED) {
          history.push(
            RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
          );
          window.location.reload();
          return;
        }
        // 正常流程，继续执行 AI 模型流程
        await continueAiModelFlow(accountId, productId, modelUrl, userStatus);
      }
    } catch {
      Toast('error', I18N.carbonFootprint3.aiModelFlow);
    } finally {
      // 确保在函数结束时清除定时器
      if (aiProcessPollingTimerRef.current) {
        clearInterval(aiProcessPollingTimerRef.current);
        aiProcessPollingTimerRef.current = null;
      }
      setAiModelLoading(false);
    }
  }, [
    urlState,
    openSubscriptionModal,
    openTrialUpgradeModal,
    continueAiModelFlow,
    history,
  ]);

  /** 初始化 - 基础信息 */
  const initBasic = useCallback(() => {
    getProductInfo();
  }, [getProductInfo]);

  /** 初始化 - 核算信息 */
  const initAccountInfo = useCallback(() => {
    getAccountInfo();
  }, [getAccountInfo]);

  // 组件卸载时清理轮询定时器
  useEffect(
    () => () => {
      if (aiProcessPollingTimerRef.current) {
        clearInterval(aiProcessPollingTimerRef.current);
        aiProcessPollingTimerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    // 如果只有 userKeys 和 userContent，走 AI 模型流程
    if (urlState.userKeys && urlState.userContent && !urlState.accountId) {
      handleAiModelFlow();
      return;
    }

    if (Number(urlState.status) === ADD) {
      initBasic();
    }

    if ([EDIT, DETAIL].includes(Number(urlState.status))) {
      initAccountInfo();
    }
  }, [
    stepValue,
    urlState.userKeys,
    urlState.userContent,
    urlState.accountId,
    urlState.status,
    handleAiModelFlow,
    initBasic,
    initAccountInfo,
  ]);

  // 三个点动画效果
  // useEffect(() => {
  //   if (aiModelLoading) {
  //     // 启动时重置为 1 个点
  //     setDotsCount(1);
  //     // 每 500ms 更新一次点数（1 -> 2 -> 3 -> 1）
  //     dotsAnimationTimerRef.current = setInterval(() => {
  //       setDotsCount(prev => (prev >= 3 ? 1 : prev + 1));
  //     }, 500);
  //   } else {
  //     // loading 结束时清除定时器
  //     if (dotsAnimationTimerRef.current) {
  //       clearInterval(dotsAnimationTimerRef.current);
  //       dotsAnimationTimerRef.current = null;
  //     }
  //     // 重置点数
  //     setDotsCount(1);
  //   }

  //   // 组件卸载时清除定时器
  //   return () => {
  //     if (dotsAnimationTimerRef.current) {
  //       clearInterval(dotsAnimationTimerRef.current);
  //       dotsAnimationTimerRef.current = null;
  //     }
  //   };
  // }, [aiModelLoading]);

  // 初次进来页面都要删除掉本次展开收起的元素
  useMount(() => {
    sessionStorage.removeItem('QuickGraphCollapseIds');
  });

  const isAgentPreview = embedded && previewMode === 'agent';
  const isReadonlyPreview = embedded && readonly;
  const canShowAiChat = Boolean(
    accountInfo && getToken() && !isShareContext && !embedded,
  );

  useEffect(() => {
    if (canShowAiChat && !aiChatAutoOpenedRef.current) {
      aiChatAutoOpenedRef.current = true;
      setAiChatOpen(true);
      return;
    }
    if (!canShowAiChat) {
      aiChatAutoOpenedRef.current = false;
      setAiChatOpen(false);
    }
  }, [canShowAiChat]);

  const aiAgentSlot = canShowAiChat ? (
    <Tooltip
      placement='bottom'
      title={aiChatOpen ? undefined : I18N.components.openAiAgent}
    >
      <button
        type='button'
        className={styles.aiAgentButton}
        aria-label={I18N.components.openAiAgent}
        onClick={() => setAiChatOpen(true)}
      >
        <img src={aiCarbonImg} alt={I18N.components.aiSmallCarbon} />
      </button>
    </Tooltip>
  ) : undefined;

  const handleQuestionGuideClick = useCallback(
    (question: string) => {
      if (!canShowAiChat) return;
      setAiChatOpen(true);
      if (aiChatRef.current) {
        aiChatRef.current.sendQuestionGuide(question);
        return;
      }
      requestAnimationFrame(() => {
        aiChatRef.current?.sendQuestionGuide(question);
      });
    },
    [canShowAiChat],
  );

  const handleSuggestionReferenceAdd = useCallback(
    (referenceText: string) => {
      if (!canShowAiChat) return;
      setAiChatOpen(true);
      if (aiChatRef.current) {
        aiChatRef.current.addReferenceContent(referenceText);
        return;
      }
      requestAnimationFrame(() => {
        aiChatRef.current?.addReferenceContent(referenceText);
      });
    },
    [canShowAiChat],
  );

  const accountInfoContent = (
    <div
      className={classNames(styles.wrapper, {
        [styles.embeddedWrapper]: embedded,
      })}
      style={{ marginBottom: 0 }}
    >
      <Spin spinning={mainLoading}>
        <div
          className={classNames(styles.pageLayout, {
            [styles.embeddedPageLayout]: embedded,
          })}
        >
          <div className={styles.mainSide}>
            {!hideStepNavigation ? (
              <AccountInfoStep
                agentPreviewLayout={isAgentPreview}
                isDetail={isDetail || isReadonlyPreview}
                stepStatus={stepStatus}
                stepValue={stepValue}
                backText={I18N.template(I18N.carbonFootprint3.backT, {
                  val1: backText || '-',
                })}
                backClick={backClick}
                changeSetp={changeSetp}
                createFinishReport={createFinishReport}
                goEditModel={goEditModel}
                goAddReport={goAddReport}
                goCarbonLabel={goCarbonLabel}
                onModelShare={() => setModelShareModalOpen(true)}
                shareFlag={accountInfo?.shareFlag}
                accountShareStatus={accountInfo?.shareStatus}
                accountId={accountInfo?.id}
                accountStatus={accountInfo?.accountStatus}
                accountType={accountInfo?.type}
                onShareModelSubmitSuccess={updateAccountInfo}
                hideBackHeader={isAgentPreview}
                hideResultOutputActions={isAgentPreview}
                aiAgentSlot={isAgentPreview ? undefined : aiAgentSlot}
              />
            ) : null}
            <div
              className={classNames(styles.contentArea, {
                [styles.contentAreaAiChatOpen]: aiChatOpen,
              })}
            >
              {accountInfo && (
                <div className={styles.buildModelPanel}>
                  {stepValue === MODEL && (
                    <AccountInfoBuildModel
                      agentPreviewLayout={isAgentPreview}
                      key={buildModelKey}
                      isDetail={
                        isReadonlyPreview || isDetail || stepStatus === RESULT
                      }
                      accountInfoModalReadonly={isShareModelThirdReadOnly}
                      listOrGraph={Number(urlState.listOrGraph)}
                      buildLoading={mainLoading}
                      accountInfo={accountInfo}
                      changeScope={changeScope}
                      changeListOrGraph={changeListOrGraph}
                      hideListGraphSwitch={isAgentPreview}
                      noSaveStoreBtn={isAgentPreview}
                      updateAccountInfo={updateAccountInfo}
                      onEmissionTaskCreate={
                        isAgentPreview ? onEmissionTaskCreate : undefined
                      }
                    />
                  )}
                  {stepValue === RESULT && (
                    <AccountInfoResult
                      showAISuggestion
                      showBusinessForesight={showBusinessForesight}
                      hideOverviewPanel={isAgentPreview && !showResultOverview}
                      accountInfo={accountInfo}
                      onEmissionTaskCreate={
                        isAgentPreview ? onEmissionTaskCreate : undefined
                      }
                      onAISuggestionReferenceSelect={
                        isAgentPreview && !isReadonlyPreview
                          ? onAISuggestionReferenceSelect
                          : undefined
                      }
                      onQuestionGuideClick={
                        isAgentPreview ? undefined : handleQuestionGuideClick
                      }
                      onSuggestionReferenceAdd={
                        isAgentPreview
                          ? undefined
                          : handleSuggestionReferenceAdd
                      }
                    />
                  )}
                </div>
              )}
              {accountInfo && canShowAiChat && (
                <aside
                  className={classNames(styles.aiChatDrawer, {
                    [styles.aiChatDrawerOpen]: aiChatOpen,
                  })}
                >
                  <div className={styles.aiChatDrawerInner}>
                    <button
                      type='button'
                      className={styles.aiChatClose}
                      aria-label={I18N.components.collapseAiAgent}
                      onClick={() => setAiChatOpen(false)}
                    >
                      <CloseOutlined />
                    </button>
                    <AccountInfoAIChat
                      ref={aiChatRef}
                      key={aiChatRemountKey}
                      accountId={accountInfo.id}
                      productId={accountInfo.productId}
                      aiCheck={accountInfo.aiCheck}
                      onAfterProvideDetail={updateAccountInfo}
                      onUpdateModel={afterAiChatModelUpdated}
                    />
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );

  if (embedded) {
    return accountInfoContent;
  }

  return (
    <div>
      <Modal
        destroyOnClose
        visible
        wrapClassName='FoorprintAccountingAddModal'
        width='100%'
        title={undefined}
        footer={null}
        closable={false}
        transitionName=''
      >
        {accountInfoContent}
      </Modal>
      {accountInfo && (
        <>
          <ModelShareModal
            open={modelShareModalOpen}
            account={accountInfo as unknown as ProductAccountingList}
            onClose={() => setModelShareModalOpen(false)}
            onSuccess={updateAccountInfo}
            onOpenLinkShare={account => {
              shareAccount(account, {
                editType: 1,
                editPermit: 0,
              });
            }}
          />
          <LinkShareModal
            open={shareModal}
            content={shareModalContent}
            errorSharePassword={errorSharePassword}
            copying={shareCopying}
            editTypeReadonly={accountInfo.type === PROCESS}
            onClose={clearShare}
            onContentChange={setShareModalContent}
            onPasswordErrorChange={setErrorSharePassword}
            onOpenShareRecord={() => {
              if (!shareModalContent.accountId) return;
              setSysShareRecordAccount(
                accountInfo.id === shareModalContent.accountId
                  ? (accountInfo as unknown as ProductAccountingList)
                  : ({
                      id: shareModalContent.accountId,
                    } as ProductAccountingList),
              );
            }}
            onCopy={shareAdd}
          />
          <SysShareRecordModal
            open={!!sysShareRecordAccount}
            account={sysShareRecordAccount}
            refreshKey={sysShareRecordRefreshKey}
            onClose={() => setSysShareRecordAccount(null)}
          />
        </>
      )}
      {/* AI建模中全屏蒙层 */}
      <LoadingProgressModal
        open={aiModelLoading}
        onClose={() => {}}
        // progressPercent={progressPercent}
        text={I18N.carbonFootprint3.modelCreationInProgress}
      />
    </div>
  );
};
export default FootprintAccountAdd;
