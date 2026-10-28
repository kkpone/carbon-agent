/** 碳足迹详情 - 右侧card - 核算列表 */
import { SearchOutlined } from '@ant-design/icons';
import AiImgBg from '@assets/svg/ai_btn_bg.svg';
import AiImg from '@assets/svg/ai_white.svg';
import distributionIcon from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_distribution.svg';
import material from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_material.svg';
import productIcon from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_product.svg';
import useIcon from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_use.svg';
import wasteDisposalIcon from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_wasteDisposal.svg';
import processAccountingIcon from '@src/assets/svg/carbonFootprint/processAccounting.svg';
import quickAccountingIcon from '@src/assets/svg/carbonFootprint/quickAccounting.svg';
import noData from '@src/assets/svg/icon-zanmoneiyong.svg';
import referIcon from '@src/assets/svg/refer.svg';
// import { checkPermissions } from '@src/components/Permission/utils';
import IconFont from '@src/components/iconfont';
import config from '@src/config';
import I18N, { LocaleType } from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { copyToClipboard, encrypt } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import {
  haveAccountCopyPermissions,
  haveAccountEditPermissions,
  haveAccountInfoPermissions,
  haveAccountShareAddPermissions,
} from '@src/views/carbonFootprint3/permissions';
import { STEP_OPTION_VALUE } from '@src/views/carbonFootprint3/util/constant';
import { useInfiniteScroll, useRequest } from 'ahooks';
import {
  Dropdown,
  Input,
  MenuProps,
  Modal,
  Pagination,
  Spin,
  Tabs,
  Table,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import { memo, MouseEvent, useContext, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ValueOf } from 'type-fest';

import {
  AccountListCardScrollData,
  AccountReferListData,
  AccountReferListParams,
} from './type';
import {
  postAccountingCopyBasic,
  postAccountingDelete,
} from '../../AccountDetail/AccountInfo/service';
import { BuildModelDescribeSet } from '../../component/AccountInfoBuildModel/constant';
import { ProductAccountingList } from '../../component/ProductSelectAccount/type';
import LinkShareModal from '../../component/LinkShareModal';
import { LinkShareContent } from '../../component/LinkShareModal/type';
import ModelShareModal from '../../component/ModelShareModal';
import ModelShareRecordModal from '../../component/ModelShareRecordModal';
import SysShareRecordModal from '../../component/SysShareRecordModal';
import {
  AccountLifeCycle,
  FOOTPRINT_ACCOUNT_LIST_TYPE_LABEL,
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
  FootprintAccountInfoUrlStatus,
  FootprintAccountListTypeValue,
  FootprintAccountStatusType,
} from '../../constant';
import ShareStatusTag from '../../../component/ShareStatusTag';
import {
  canShowModelShareAction,
  canShowShareAction,
  canShowShareModelSubmitAction,
  canShowShareRecordAction,
  getAccountShareFlagText,
  isCollectingSharedAccount,
} from '../../../share';
import { confirmSubmitSharedModel } from '../../../shareSubmit';
import {
  getAccountListData,
  getAccountReferList,
  getShareInit,
  postShareAdd,
} from '../../service';
import { ProductAccountingListParams } from '../../type';
import style from '../index.module.less';
import moreSvg from './img/more.svg';
import SaveAsCustomModelModal from './SaveAsCustomModelModal';

import { LocaleContext } from '@/components/LocaleProvider';

import AddAccount from '../AddAccount';
import AccountInfoModal from '../../component/AccountInfoModal';

import { checkPermissions } from '@/components/Permission/utils';

const { ALL, CREATE, COMPLETE, MODELING } = FootprintAccountListTypeValue;
const { QUICK, PROCESS } = FootprintAccountStatusType;
const { RESULT } = STEP_OPTION_VALUE;
const { VISUAL } = BuildModelDescribeSet;
const { EDIT, DETAIL } = FootprintAccountInfoUrlStatus;
const { MATERIAL, PRODUCT, DISTRIBUTION, USE, WASTE_DISPOSAL } =
  AccountLifeCycle;
const ACCOUNT_REFER_FLAG_IN_USE = 1;
const REFER_LIST_PAGE_SIZE = 8;
const REFER_LIST_TEXT = {
  [LocaleType.zhCN]: {
    inReference: '引用中',
    downstreamProductList: '下游产品列表',
    downstreamProductDetailMissing: '下游产品详情信息缺失，请稍后重试',
    records: '条记录',
  },
  [LocaleType.zhTW]: {
    inReference: '引用中',
    downstreamProductList: '下游產品列表',
    downstreamProductDetailMissing: '下游產品詳情信息缺失，請稍後重試',
    records: '條記錄',
  },
  [LocaleType.enUS]: {
    inReference: 'Referenced',
    downstreamProductList: 'Downstream product list',
    downstreamProductDetailMissing:
      'Downstream product detail information is missing. Please try again later.',
    records: 'records',
  },
};

const SearchTypeTabs = Object.values(FootprintAccountListTypeValue).filter(
  val => val !== FootprintAccountListTypeValue.CREATE,
);

type Props = {
  id: string;
};

const StageImgs = {
  [MATERIAL]: material,
  [PRODUCT]: productIcon,
  [DISTRIBUTION]: distributionIcon,
  [USE]: useIcon,
  [WASTE_DISPOSAL]: wasteDisposalIcon,
};

const AccountTypeImgs = {
  [QUICK]: quickAccountingIcon,
  [PROCESS]: processAccountingIcon,
};

const { confirm } = Modal;

/** 分享默认链接 */
const shareInitUrl = `${window.location.origin}/carbonFootprint3/footprintAccount/shareAccountLogin`;

export const AccountListCard = memo(({ id }: Props) => {
  const history = useHistory();

  const ref = useRef<HTMLDivElement>(null);

  const { locale } = useContext(LocaleContext);
  const referListText =
    REFER_LIST_TEXT[locale] || REFER_LIST_TEXT[LocaleType.zhCN];

  const [showAddAccount, setShowAddAccount] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get('openAdd');
  });

  /** 分享的弹框 */
  const [shareModal, setShareModal] = useState(false);
  /** 弹框内容 */
  const [shareModalContent, setShareModalContent] = useState<LinkShareContent>({
    url: shareInitUrl,
    type: 1,
    locale,
    password: '',
    expireValue: -1,
    editType: 0,
  });

  /** 错误提示 */
  const [errorSharePassword, setErrorSharePassword] = useState(false);
  /** 链接分享复制中，防止接口返回前连续点击重复创建分享记录 */
  const [shareCopying, setShareCopying] = useState(false);
  const shareCopyingRef = useRef(false);

  /** 查询收入框的内容 */
  const [inputValue, setInputValue] = useState<string>();

  /** 查询参数 */
  const [listParams, setListParams] = useState<ProductAccountingListParams>({
    pageNum: 1,
    pageSize: 10,
    productId: id,
    accountStatus: undefined,
  });

  /** 全部 创建核算 建模中 核算完成 */
  const [accountStatus, setAccountStatus] = useState<number>(ALL);

  const [accountInfoModalProps, setAccountInfoModalProps] = useState<{
    open: boolean;
    accountId?: string;
    isCopy?: boolean;
  }>({ open: false });

  /** 保存为自定义模型 */
  const [saveAsModelAccount, setSaveAsModelAccount] =
    useState<ProductAccountingList | null>(null);

  /** 模型共享弹窗 */
  const [modelShareAccount, setModelShareAccount] =
    useState<ProductAccountingList | null>(null);

  /** 共享记录弹窗 */
  const [modelShareRecordAccount, setModelShareRecordAccount] =
    useState<ProductAccountingList | null>(null);

  /** 分享记录弹窗（sysShare） */
  const [sysShareRecordAccount, setSysShareRecordAccount] =
    useState<ProductAccountingList | null>(null);
  const [sysShareRecordRefreshKey, setSysShareRecordRefreshKey] = useState(0);

  /** 被当前核算引用的下游产品列表弹窗 */
  const [referListModal, setReferListModal] = useState<{
    open: boolean;
    byAccountId?: number;
  }>({ open: false });
  /** 下游产品列表分页参数 */
  const [referListParams, setReferListParams] =
    useState<AccountReferListParams>();
  const [referList, setReferList] = useState<AccountReferListData[]>([]);
  const [referListTotal, setReferListTotal] = useState(0);
  const [referListLoading, setReferListLoading] = useState(false);

  /** 获取核算列表 */
  const getList = async (scrollParams?: AccountListCardScrollData) => {
    const newPage = scrollParams
      ? scrollParams.currentPage + 1
      : listParams.pageNum;
    const newParams = {
      ...listParams,
      productId: id,
      accountStatus,
      pageNum: newPage,
      accountName: inputValue,
    };

    /** 存在异步情况 - 如果不一致说明切换tabs了  需要将分页重新设置为初始 */
    if (accountStatus !== listParams.accountStatus) {
      newParams.pageNum = 1;
      newParams.pageSize = 10;
    }

    setListParams(newParams);

    const { data } = await getAccountListData(newParams);

    const isNoMore = newPage * listParams.pageSize >= data.data.total;

    return {
      list: data.data.rows,
      currentPage: newPage,
      isNoMore,
    };
  };

  /** 列表数据请求 */
  const { data, loading, loadingMore, noMore, reload, mutate } =
    useInfiniteScroll<AccountListCardScrollData>(
      scrollData => getList(scrollData),
      {
        target: ref,
        isNoMore: d => d?.isNoMore || false,
        reloadDeps: [id, accountStatus],
      },
    );

  /**
   * @description: 防抖 - 输入后 500毫秒后执行该方法
   * @param {string} val 输入框 输入的值
   */
  const debounceInputValue = async (val?: string) => {
    setInputValue(val);
    setListParams({
      ...listParams,
      pageNum: 1,
      pageSize: 10,
      accountName: val,
    });
    setTimeout(() => {
      reload();
    }, 32);
  };

  /**
   * @description: ahooks 防抖方法
   */
  const { run: runDebounce } = useRequest(debounceInputValue, {
    debounceWait: 500,
    manual: true,
  });

  /**
   * 获取核算tab元素
   * @param type 类型
   * @returns dom
   */
  const getTypeTag = (type: ValueOf<typeof FootprintAccountListTypeValue>) => {
    /** 核算节点 */
    const TypeTagConst = {
      [CREATE]: {
        className: style.listTagCreate,
        text: I18N.carbonFootprint3.createAccounting,
      },
      [MODELING]: {
        className: style.listTagBuild,
        text: I18N.carbonFootprint3.inModeling,
      },
      [COMPLETE]: {
        className: style.listTagComplete,
        text: I18N.carbonFootprint3.accountingCompleted,
      },
      [ALL]: {
        className: style.listTagCreate,
        text: I18N.carbonFootprint3.whole,
      },
    };

    return (
      <div className={classNames(style.listTag, TypeTagConst[type].className)}>
        {TypeTagConst[type].text}
      </div>
    );
  };

  /**
   * 动态设置移入状态的类名
   * @param type 类型
   * @returns 类名
   */
  const getTypeListClassName = (type: number) => {
    const classNameStyle = {
      [CREATE]: style.listCreate,
      [MODELING]: style.listBuild,
      [COMPLETE]: style.listComplete,
    };

    return classNameStyle[type];
  };

  /**
   * 切换tabs
   * @param val
   */
  const changeTabs = (val: number) => {
    setAccountStatus(val);
  };

  /**
   * 是否有更多核算
   * @returns ReactNode
   */
  const noMoreNode = () => {
    if (noMore && data?.list && data.list.length > 0) {
      return (
        <div className={style.noMore}>
          {I18N.carbonFootprint3.noMoreCoresAvailableAtTheMoment}
        </div>
      );
    }
    return undefined;
  };

  /**
   * 暂无数据展示
   * @returns ReactNdoe
   */
  const noDataNode = () => {
    if (!data || data.list.length === 0) {
      return (
        <div className={style.noData}>
          <div>
            <img
              className={style.noDataImg}
              src={noData}
              alt={I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
            />
            <div className={style.noDataText}>
              {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
            </div>
          </div>
        </div>
      );
    }
    return undefined;
  };

  /** 点击前往详情页面 */
  const goAccountListInfo = (list: ProductAccountingList) => {
    // 没有进入核算详情的权限
    if (!haveAccountInfoPermissions()) {
      Toast('warn', I18N.carbonFootprint3.sorryIDontHaveTheAuthority);
      return;
    }

    /** 编辑权限还是查看权限 */
    const Permissions = haveAccountEditPermissions() ? EDIT : DETAIL;

    history.push(
      `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail}?productId=${id}&status=${Permissions}&accountId=${list.id}&stepValue=${list.accountStatus}&listOrGraph=${VISUAL}`,
    );
  };

  /**
   * @description: 删除核算
   * @param {ProductAccountingList} deleteItem 被删除的核算信息
   */
  const deleteAccount = async (deleteItem: ProductAccountingList) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis4, {
        val1: deleteItem.accountName,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postAccountingDelete({
            id: deleteItem.id,
          });
          if (back.data.code === 200) {
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
            if (data) {
              const index = data.list.findIndex(i => i.id === deleteItem.id);
              data?.list.splice(index, 1);
              mutate({ ...data });
            }
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /**
   * 复制核算
   * @param {ProductAccountingList} copyVal 被复制的信息
   */
  const copyList = (copyVal: ProductAccountingList) => {
    setAccountInfoModalProps({
      open: true,
      accountId: `${copyVal.id}`,
      isCopy: true,
    });
  };

  const onCopy = async info => {
    const resp = await postAccountingCopyBasic(info);
    Toast('success', I18N.carbonFootprint3.copySuccessful);
    history.push({
      pathname:
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
      search: `?productId=${id}&accountId=${resp.data.data}&status=${FootprintAccountInfoUrlStatus.EDIT}&stepValue=${STEP_OPTION_VALUE.MODEL}&listOrGraph=${BuildModelDescribeSet.VISUAL}`,
    });
  };

  /** 清除分享参数 */
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
   * 分享
   * @param shareInfo 被分享的核算信息
   */
  const shareAccount = async (
    shareInfo: ProductAccountingList,
    options?: { editType?: number; editPermit?: number },
  ) => {
    const shareData = await getShareInit();
    const isProcessAccount = shareInfo.type === PROCESS;
    setShareModal(true);
    // 加密关键参数
    const urlParams = encrypt(
      `shareId=${shareData.data.data.id}&productId=${shareInfo.productId}&status=${DETAIL}&accountId=${shareInfo.id}&stepValue=0&listOrGraph=1&lang=${locale}`,
    );
    setShareModalContent({
      ...shareModalContent,
      accountId: shareInfo.id,
      id: shareData.data.data.id,
      url: `${shareInitUrl}?${urlParams}`,
      editType: isProcessAccount ? 0 : options?.editType || 0,
      editPermit: isProcessAccount ? undefined : options?.editPermit,
    });
  };

  /**
   * 添加分享
   */
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
      // 同步发起 copyToClipboard，传入 Promise 保证 Safari 用户手势上下文不丢失
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

  const items: (val: ProductAccountingList) => MenuProps['items'] = val =>
    [
      {
        key: '1',
        label: (
          <div className={style.setIcon}>{I18N.carbonFootprint3.share}</div>
        ),
        permission:
          haveAccountShareAddPermissions() &&
          val.accountStatus === RESULT &&
          canShowShareAction(val.shareFlag),
        onClick: e => {
          e.domEvent.stopPropagation();
          shareAccount(val);
        },
      },
      {
        key: '2',
        label: (
          <div className={style.setIcon}>
            {I18N.carbonFootprint3.modelShare}
          </div>
        ),
        permission:
          haveAccountShareAddPermissions() &&
          val.type !== PROCESS &&
          canShowModelShareAction({
            accountStatus: val.accountStatus,
            finishStatus: RESULT,
            shareFlag: val.shareFlag,
          }),
        onClick: e => {
          e.domEvent.stopPropagation();
          setModelShareAccount(val);
        },
      },
      {
        key: 'submitSharedModel',
        label: <div className={style.setIcon}>{I18N.components.submit}</div>,
        permission: canShowShareModelSubmitAction({
          shareStatus: val.shareStatus,
        }),
        onClick: e => {
          e.domEvent.stopPropagation();
          confirmSubmitSharedModel({
            accountId: val.id,
            onSuccess: reload,
          });
        },
      },
      {
        key: '3',
        label: <div className={style.setIcon}>{I18N.carbonFootprint.copy}</div>,
        permission: haveAccountCopyPermissions(),
        onClick: e => {
          e.domEvent.stopPropagation();
          copyList(val);
        },
      },
      {
        key: '4',
        label: (
          <div className={style.setIcon}>
            {I18N.carbonFootprint3.saveAsModelMenu}
          </div>
        ),
        permission: haveAccountCopyPermissions(),
        onClick: e => {
          e.domEvent.stopPropagation();
          setSaveAsModelAccount(val);
        },
      },
      {
        key: '5',
        label: isCollectingSharedAccount(val.shareFlag) ? (
          <Tooltip title={I18N.carbonFootprint3.sharedAccountDeleteDisabledTip}>
            <span style={{ display: 'block', width: '100%' }}>
              <div className={style.setIcon}>{I18N.carbonFootprint.delete}</div>
            </span>
          </Tooltip>
        ) : (
          <div className={style.setIcon}>{I18N.carbonFootprint.delete}</div>
        ),
        disabled: isCollectingSharedAccount(val.shareFlag),
        permission: checkPermissions(true, 'footprint3:account:delete'),
        onClick: e => {
          if (isCollectingSharedAccount(val.shareFlag)) return;
          e.domEvent.stopPropagation();
          deleteAccount(val);
        },
      },
    ].filter(item => item.permission);

  const renderAccountShareStatus = (account: ProductAccountingList) => {
    if (
      !getAccountShareFlagText(account.shareFlag) &&
      !canShowShareRecordAction(account.shareFlag)
    ) {
      return null;
    }

    return (
      <div className={style.shareStatusMain}>
        <ShareStatusTag
          shareFlag={account.shareFlag}
          sourceCompanyName={account.sourceCompanyName}
        />
        {canShowShareRecordAction(account.shareFlag) ? (
          <div
            className={style.shareRecordBtn}
            onClick={event => {
              event.stopPropagation();
              setModelShareRecordAccount(account);
            }}
          >
            {I18N.carbonFootprint3.sharedRecord}
          </div>
        ) : null}
      </div>
    );
  };

  /** 获取引用当前核算的下游产品列表 */
  const getReferList = async (params: AccountReferListParams) => {
    setReferListLoading(true);
    try {
      const { data } = await getAccountReferList(params);
      setReferList(data.data.rows || []);
      setReferListTotal(data.data.total || 0);
    } catch {
      setReferList([]);
      setReferListTotal(0);
    } finally {
      setReferListLoading(false);
    }
  };

  /** 打开下游产品列表弹窗，并按当前行核算 id 查询 */
  const openReferListModal = (
    event: MouseEvent<HTMLDivElement>,
    accountInfo: ProductAccountingList,
  ) => {
    event.stopPropagation();
    const nextParams = {
      pageNum: 1,
      pageSize: REFER_LIST_PAGE_SIZE,
      byAccountId: accountInfo.id,
    };
    setReferListModal({
      open: true,
      byAccountId: accountInfo.id,
    });
    setReferListParams(nextParams);
    getReferList(nextParams);
  };

  const closeReferListModal = () => {
    setReferListModal({ open: false });
    setReferListParams(undefined);
    setReferList([]);
    setReferListTotal(0);
  };

  /** 在新浏览器标签页打开项目内路由 */
  const openRouteInNewTab = (route: string) => {
    window.open(
      `${window.location.origin}${config.BASENAME || ''}${route}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  /** 跳转下游产品引用核算详情 */
  const goReferAccountInfo = (record: AccountReferListData) => {
    if (!haveAccountInfoPermissions()) {
      Toast('warn', I18N.carbonFootprint3.sorryIDontHaveTheAuthority);
      return;
    }

    if (!record.productId || !record.id) {
      Toast('warn', referListText.downstreamProductDetailMissing);
      return;
    }

    const Permissions = haveAccountEditPermissions() ? EDIT : DETAIL;
    openRouteInNewTab(
      `${
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail
      }?productId=${record.productId}&status=${Permissions}&accountId=${
        record.id
      }&stepValue=${record.accountStatus || RESULT}&listOrGraph=${VISUAL}`,
    );
  };

  const referListColumns: ColumnsType<AccountReferListData> = [
    {
      title: I18N.carbonFootprint.productName,
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (productName?: string) => productName || '-',
    },
    {
      title: I18N.carbonFootprint3.functionalUnits,
      dataIndex: 'accountName',
      key: 'accountName',
      ellipsis: true,
      render: (accountName: string | undefined, record) =>
        accountName || record.unitName || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      key: 'operation',
      width: 160,
      render: (_, record) => (
        <span
          className={style.referDetailBtn}
          onClick={() => goReferAccountInfo(record)}
        >
          {I18N.carbonFootprint3.details}
        </span>
      ),
    },
  ];

  return (
    <div className={style.AccountListCard}>
      <AccountInfoModal
        {...accountInfoModalProps}
        onClose={() => setAccountInfoModalProps({ open: false })}
        onConfirm={onCopy}
      />
      <SaveAsCustomModelModal
        open={!!saveAsModelAccount}
        account={saveAsModelAccount}
        onClose={() => setSaveAsModelAccount(null)}
        onSuccess={reload}
      />
      <ModelShareModal
        open={!!modelShareAccount}
        account={modelShareAccount}
        onClose={() => setModelShareAccount(null)}
        onSuccess={reload}
        onOpenLinkShare={account => {
          shareAccount(account, {
            editType: 1,
            editPermit: 0,
          });
        }}
      />
      <ModelShareRecordModal
        open={!!modelShareRecordAccount}
        account={modelShareRecordAccount}
        onClose={() => setModelShareRecordAccount(null)}
      />
      <SysShareRecordModal
        open={!!sysShareRecordAccount}
        account={sysShareRecordAccount}
        refreshKey={sysShareRecordRefreshKey}
        onClose={() => setSysShareRecordAccount(null)}
      />
      {showAddAccount && (
        <AddAccount productId={id} onClose={() => setShowAddAccount(false)} />
      )}
      <div className={style.searchMain}>
        <div className={style.typeSearchMain}>
          <Tabs
            className={style.typeTabs}
            items={SearchTypeTabs.map(val => ({
              key: `${val}`,
              label: FOOTPRINT_ACCOUNT_LIST_TYPE_LABEL[val],
            }))}
            activeKey={`${accountStatus}`}
            onChange={val => {
              changeTabs(Number(val));
            }}
          />
        </div>
        <div className={style.searchRight}>
          <Input
            className={style.inputSearch}
            allowClear
            suffix={<SearchOutlined className={style.searchIcon} />}
            placeholder={I18N.carbonFootprint3.functionalUnitName}
            onChange={e => {
              runDebounce(e.target.value);
            }}
          />

          {haveAccountEditPermissions() && (
            <div
              className={style.addAccountBtn}
              onClick={() => setShowAddAccount(true)}
            >
              <div className={style.addAccountBtnPrefix}>
                <img alt='' src={AiImgBg} />
                <img className={style.addAccountBtnAiIcon} alt='' src={AiImg} />
              </div>
              {I18N.carbonFootprint3.addAccounting}
            </div>
          )}
        </div>
      </div>
      <div ref={ref} className={style.contentMain}>
        {loading ? (
          <div className={style.bottomLoading}>
            <Spin />
          </div>
        ) : (
          data?.list.map(val => (
            <div
              key={val.id}
              className={classNames(
                style.contentList,
                getTypeListClassName(val.accountStatus),
              )}
              onClick={() => {
                goAccountListInfo(val);
              }}
            >
              <div className={style.listTitle}>
                <div className={style.listTitleLeft}>
                  {getTypeTag(
                    val.accountStatus as ValueOf<
                      typeof FootprintAccountListTypeValue
                    >,
                  )}
                  <div className={style.tagText} title={val.accountName}>
                    {val.accountName}
                  </div>
                </div>

                <div className={style.listTitleRight}>
                  <div className={style.rightDetail}>
                    <IconFont
                      className={style.rightDetailIcon}
                      type='icon-icon-riji-3'
                    />
                    <span className={style.rightDetailText}>
                      {val.startTime}
                      {I18N.carbonFootprint.to}
                      {val.endTime}
                    </span>
                  </div>
                  <div className={style.rightDetail}>
                    <IconFont
                      className={style.rightDetailIcon}
                      type='icon-icon-shijian'
                    />
                    <span className={style.rightDetailText}>
                      {val.updateByName} {val.updateTime}
                    </span>
                  </div>
                  <div className={style.rightDetail}>
                    <img
                      className={style.rightDetailImg}
                      src={AccountTypeImgs[val.type]}
                      alt={I18N.carbonFootprint3.accountingMethod}
                    />
                    <span className={style.rightDetailText}>
                      {FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[val.type]}
                    </span>
                  </div>
                  <Dropdown
                    menu={{ items: items(val) }}
                    placement='bottomRight'
                  >
                    <div
                      className={style.dropdown}
                      onClick={e => e.stopPropagation()}
                    >
                      <img src={moreSvg} alt='' />
                    </div>
                  </Dropdown>
                </div>
              </div>

              <div className={style.content}>
                <div className={style.contentTop}>
                  <div className={style.contentLeft}>
                    <div className={style.contentName}>
                      {I18N.carbonFootprint3.totalEmissions}
                    </div>
                    <div className={style.contentTotal}>
                      <div className={style.emissionVal}>
                        {val.emissionTotal || '-'}
                      </div>
                      <div className={style.emissionUnit}>kgCO₂e</div>
                    </div>
                  </div>

                  <div className={style.contentStatusMain}>
                    {renderAccountShareStatus(val)}
                    {val.referFlag === ACCOUNT_REFER_FLAG_IN_USE ? (
                      <div className={style.referStatusMain}>
                        <div
                          className={style.referStatus}
                          onClick={event => openReferListModal(event, val)}
                        >
                          <span className={style.referStatusIcon}>
                            <img src={referIcon} alt='' />
                          </span>
                          <span>{referListText.inReference}</span>
                        </div>
                        <div
                          className={style.referListBtn}
                          onClick={event => openReferListModal(event, val)}
                        >
                          {referListText.downstreamProductList}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className={style.cycleMain}>
                  {val.stageObjs.map(stageObj => (
                    <div key={stageObj.stage} className={style.cycleEvery}>
                      <div className={style.cycleTitle}>
                        <img
                          className={style.cycleImg}
                          src={StageImgs[stageObj.stage]}
                          alt={I18N.carbonFootprint3.lifeCycle}
                        />
                        <span className={style.cycleText}>
                          {stageObj.stageName}
                        </span>
                      </div>
                      <div className={style.cycleNumMain}>
                        <div
                          className={style.cycleNumVal}
                          title={`${stageObj.stageTotal}`}
                        >
                          {stageObj.stageTotal}
                        </div>
                        <div className={style.cycleNumUnit}>kgCO₂e</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}

        {loadingMore && <Spin />}
        {noMoreNode()}
        {noDataNode()}

        <Modal
          className={style.referListModal}
          open={referListModal.open}
          width={664}
          footer={null}
          title={null}
          destroyOnClose
          onCancel={closeReferListModal}
        >
          <div className={style.referListModalContent}>
            <div className={style.referListModalTitle}>
              {referListText.downstreamProductList}
            </div>

            <Spin spinning={referListLoading}>
              <Table<AccountReferListData>
                className={style.referListTable}
                rowKey={record =>
                  `${record.productId || 'product'}-${record.id}`
                }
                columns={referListColumns}
                dataSource={referList}
                pagination={false}
              />
            </Spin>
          </div>

          <div className={style.referListFooter}>
            <div className={style.referListTotal}>
              <span>{I18N.carbonFootprint3.totalPrefix}</span>
              <span className={style.referListTotalNum}>{referListTotal}</span>
              <span>{referListText.records}</span>
            </div>
            <Pagination
              size='small'
              current={referListParams?.pageNum || 1}
              pageSize={referListParams?.pageSize || REFER_LIST_PAGE_SIZE}
              total={referListTotal}
              showSizeChanger={false}
              onChange={pageNum => {
                if (!referListModal.byAccountId) return;
                const nextParams = {
                  pageNum,
                  pageSize: referListParams?.pageSize || REFER_LIST_PAGE_SIZE,
                  byAccountId: referListModal.byAccountId,
                };
                setReferListParams(nextParams);
                getReferList(nextParams);
              }}
            />
          </div>
        </Modal>

        <LinkShareModal
          open={shareModal}
          content={shareModalContent}
          errorSharePassword={errorSharePassword}
          copying={shareCopying}
          editTypeReadonly={
            data?.list.find(item => item.id === shareModalContent.accountId)
              ?.type === PROCESS
          }
          onClose={clearShare}
          onContentChange={setShareModalContent}
          onPasswordErrorChange={setErrorSharePassword}
          onOpenShareRecord={() => {
            if (!shareModalContent.accountId) return;
            const matched = data?.list.find(
              item => item.id === shareModalContent.accountId,
            );
            setSysShareRecordAccount(
              matched ??
                ({
                  id: shareModalContent.accountId,
                } as ProductAccountingList),
            );
          }}
          onCopy={shareAdd}
        />
      </div>
    </div>
  );
});
