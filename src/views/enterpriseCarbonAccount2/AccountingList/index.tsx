import useUrlState from '@ahooksjs/use-url-state';
import {
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import emptyImg from '@src/assets/svg/enterprise_empty.svg';
import moreFillImg from '@src/assets/svg/more_filled.svg';
import OrgTree, { attachOrgLevel } from '@src/components/OrgTree';
import { checkPermissions } from '@src/components/Permission/utils';
import PurchaseModal from '@src/components/PurchaseModal';
import SkuCountLabel from '@src/components/SkuCountLabel';
import { SKU_STATUS } from '@src/components/SkuCountLabel/constant';
import { SkuCount } from '@src/components/SkuCountLabel/type';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import {
  Button,
  DatePicker,
  Dropdown,
  Menu,
  Modal,
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
} from 'antd';
import axios, { CancelTokenSource } from 'axios';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import moment from 'moment';
import React, { Key, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { useUserOrgType, ORG_TYPE } from '@/hooks/useOrgType';
import { RootState } from '@/store';
import { ENTERPRISE_USER_STATUS } from '@/views/system/ScanLogin/constant';
import { getEnterpriseUserStatus } from '@/views/system/ScanLogin/service';
import {
  CompanyType,
  ProductSource,
} from '@/views/system/login/component/Login';

import { AddDrawerContent } from './components/AddAcount';
import DetailsButton from './components/DetailsButton';
import { AddDrawer } from './components/Drawer';
import SaveModal from './components/SaveModal';
import styles from './index.module.less';
import {
  computationRevokeSubmit,
  computationSubmit,
  deleteAccountTask,
  getAccountSkuCount,
  getDisclosureReportList,
  getIntensityData,
  getOrgAccountData,
  getOrgAccountDataByShare,
  getOrgTree,
  getRecentBrowseYear,
  saveAccountToModel,
  updateAccount,
} from './service';
import {
  Org,
  AccountSetting,
  OrgPeriod,
  OrgAccountData,
  OrgAccount,
  DisclosureReportListItem,
  DISCLOSURE_CONFIG_TYPE,
  DISCLOSURE_REPORT_STATUS,
} from './type';
import { ACCOUNT_WAY } from '../AccountingSetting/constant';
import { getAccountingSetting } from '../AccountingSetting/service';
import { getOperateIndicatorList } from '../Pom/service';
import { OperateIndicator } from '../Pom/type';
import { StepType } from '../accounting/type';
import { COMPUTATION_STATUS, COMPUTATION_STATUS_LABEL } from '../constant';

const OrgIconMap = {
  [ORG_TYPE.ENTERPRISE]: 'icon-a-icon-qiyebeijing',
  [ORG_TYPE.ORG]: 'icon-icon_hesuanfenzu',
  [ORG_TYPE.MAIN_PART]: 'icon-icon_hesuanzhuti',
};

const ACCOUNTING_LIST_TAB = {
  ACCOUNTING_TASK: 'accountingTask',
  DISCLOSURE_REPORT: 'disclosureReport',
} as const;

type AccountingListTab =
  (typeof ACCOUNTING_LIST_TAB)[keyof typeof ACCOUNTING_LIST_TAB];

type List = {
  id: number;
  name: string;
  children?: List[];
};

const getDeepIds = (orgList: List[]) => {
  const ids: (number | string)[] = [];
  const getIds = (list?: List[]) => {
    list?.forEach(item => {
      ids.push(item.id);
      getIds(item.children);
    });
  };
  getIds(orgList);
  return ids;
};

const AccountingList: React.FC<{ isShare?: boolean }> = props => {
  const { isShare = false } = props;
  const userOrgType = useUserOrgType({
    isShare,
  });

  const [accountSetting, setAccountSetting] = useState<{
    accountWay: number;
    yearList: { year: string; yearInfo: string }[];
  }>({ accountWay: ACCOUNT_WAY.CALENDAR_YEAR, yearList: [] });

  const [orgTreeCollapse, setOrgTreeCollapse] = useState(false);

  const [org, setOrg] = useState<Org | null>(null);

  const [orgData, setOrgData] = useState<Org[]>([]);

  const [orgTreeLoading, setOrgTreeLoading] = useState(false);

  const [currPeriod, setCurrPeriod] = useState<OrgPeriod | null>(null);

  const [indicatorList, setIndicatorList] = useState<OperateIndicator[]>([]);

  const [indicator, setIndicator] = useState<OperateIndicator | null>(null);

  const [{ companyId, reportId, year, orgId, tab }, setUrlState] = useUrlState<{
    companyId?: string;
    reportId?: string;
    year?: string;
    orgId?: string;
    tab?: AccountingListTab;
  }>({});

  const [intensityData, setIntensityData] = useState<{
    currMoneyRate: string;
    currMoney: string;
    compareValue: number;
  } | null>(null);

  const [orgAccountData, setOrgAccountData] = useState<OrgAccountData | null>(
    null,
  );

  const [orgAccountDataLoading, setOrgAccountDataLoading] = useState(false);

  const [tableExpandedKeys, setTableExpandedKeys] = useState<Key[][]>([]);

  const [expandedOrgIds, setExpandedOrgIds] = useState<Key[]>([]);

  const [cYear, setCYear] = useState<string>();

  const [skuCount, setSkuCount] = useState<SkuCount>({
    useCount: 0,
    total: 0,
    status: SKU_STATUS.UN_LIMIT,
  });

  const [selectedOrgCount, setSelectedOrgCount] = useState(0);

  const [currOrgAccount, setCurrOrgAccount] = useState<OrgAccount | null>();

  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<AccountingListTab>(
    tab === ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT
      ? ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT
      : ACCOUNTING_LIST_TAB.ACCOUNTING_TASK,
  );

  const [disclosureReportList, setDisclosureReportList] = useState<
    DisclosureReportListItem[]
  >([]);

  const [disclosureReportLoading, setDisclosureReportLoading] = useState(false);

  const [disclosureExpandedRowKeys, setDisclosureExpandedRowKeys] = useState<
    Key[]
  >([]);

  const history = useHistory();

  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const updateTableExpandedKeysRef = useRef(true);

  const yearChangedRef = useRef(false);

  const { accountWay, yearList } = accountSetting;

  const yearIndex = yearList.findIndex(({ year }) => year === cYear);

  const [enterpriseUserStatus, setEnterpriseUserStatus] = useState<string>('');

  const companyUserInfo = useSelector(
    (state: RootState) => state.companyUserInfo,
  );

  const {
    userInfo: { companyType },
  } = companyUserInfo;

  const isLightUser = companyType === CompanyType.person;

  const { openSubscriptionModal } = useSubscriptionServiceModal();

  const openSubscription = () => {
    openSubscriptionModal({
      productSource: ProductSource.enterprise,
      onSuccess: () => {
        window.location.reload();
      },
    });
  };

  const getSkuCount = async (params: { year: string | undefined }) => {
    const { year } = params;
    if (year) {
      const { data } = await getAccountSkuCount({ year });
      setSkuCount(data.data);
    }
  };

  const getAccountData = async (
    params: {
      year: string | undefined;
      orgId?: number | string;
      period?: number;
    },
    setting?: { updateExpandedKeys?: boolean },
  ) => {
    try {
      const { year, orgId } = params;

      if (!year) {
        return;
      }

      if (!orgId) {
        return;
      }

      cancelTokenSourceRef.current?.cancel();

      const { updateExpandedKeys } = setting || {};
      const cancelTokenSource = axios.CancelToken.source();
      cancelTokenSourceRef.current = cancelTokenSource;

      setOrgAccountDataLoading(true);
      const { data } = isShare
        ? await getOrgAccountDataByShare(
            { ...params, year, companyId, reportId },
            cancelTokenSource.token,
          )
        : await getOrgAccountData({ ...params, year }, cancelTokenSource.token);

      const transformOrgList = (
        list: OrgAccount[],
        parents: OrgAccount[] = [],
      ) => {
        list.forEach(item => {
          Object.assign(item, { parents });

          if (item.children && item.children?.length > 0) {
            transformOrgList(item.children, [...parents, item]);
          } else {
            Object.assign(item, { children: undefined });
          }
        });
      };
      data.data.orgInfoList.forEach(orgInfoItem => {
        transformOrgList(orgInfoItem.orgList);
      });

      if (updateExpandedKeys) {
        const ids = data.data.orgInfoList.map(({ orgList }) =>
          getDeepIds(orgList),
        );
        setTableExpandedKeys(ids);
      }
      setOrgAccountData(data.data);
      setOrgAccountDataLoading(false);
    } catch (err: any) {
      if ((err as { code: string }).code !== 'ERR_CANCELED') {
        setOrgAccountDataLoading(false);
        throw err;
      }
    }
  };

  useEffect(() => {
    if (orgAccountData && isShare) {
      setOrg(orgAccountData.orgInfoList[0].orgList[0]);
      // setOrgData(orgAccountData.orgInfoList[0].orgList);
    }
  }, [orgAccountData]);

  const getOrgTreeData = async (
    year: string | undefined,
    setting?: {
      updateOrg?: boolean;
      updateOrgId?: number;
      expandAll?: boolean;
    },
  ) => {
    if (!year) {
      return;
    }

    setOrgTreeLoading(true);
    const { updateOrg, updateOrgId, expandAll } = setting || {};

    try {
      const { data } = await getOrgTree({ cYear: year });
      setOrgData(data.data);

      const rootOrg = data.data[0];

      if (updateOrg) {
        setOrg(rootOrg);
        setCurrPeriod(rootOrg?.periodList?.[0]);
        setExpandedOrgIds(rootOrg ? getDeepIds([rootOrg]) : []);
      } else if (expandAll) {
        setExpandedOrgIds(rootOrg ? getDeepIds([rootOrg]) : []);
      }

      if (!isNil(updateOrgId)) {
        updateTableExpandedKeysRef.current = false;
        let newOrg: Org | null = null;

        const findOrg = (orgList: Org[]) => {
          orgList.forEach(orgItem => {
            if (orgItem.id === updateOrgId) {
              newOrg = orgItem;
            } else {
              findOrg(orgItem.children);
            }
          });
        };

        findOrg(data.data);

        if (newOrg) {
          setOrg(newOrg);
        }
      }
    } finally {
      setOrgTreeLoading(false);
    }
  };

  const updateAccountTask = async (accountData: AccountSetting) => {
    await updateAccount(accountData);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    getOrgTreeData(cYear, { updateOrg: true });
  };

  const submit = (
    params: Pick<OrgAccount, 'computationId' | 'computationPeriod'>,
  ) => {
    Modal.confirm({
      width: 480,
      className: styles.confirmModal,
      title: (
        <div className={styles.confirmModalTitle}>
          {I18N.enterpriseCarbonAccount2.confirmSubmission}
        </div>
      ),
      content: (
        <div className={styles.confirmModalContent}>
          <span>
            {I18N.enterpriseCarbonAccount2.confirmSubmissionAndSubmission}
          </span>
          <span className={styles.confirmModalWarnText}>
            {I18N.enterpriseCarbonAccount2.cannotBeRepairedArbitrarily}
          </span>
          <span>
            {
              I18N.enterpriseCarbonAccount2
                .ifModificationsAreNeededTheyCanBeMade
            }
          </span>
        </div>
      ),
      maskClosable: true,
      okButtonProps: {
        className: styles.confirmModalBtn,
      },
      onOk: async () => {
        await computationSubmit(params);
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        getAccountData(
          { orgId: org?.id, year: cYear },
          { updateExpandedKeys: updateTableExpandedKeysRef.current },
        );
        getOrgTreeData(cYear, { updateOrgId: org?.id });
      },
    });
  };

  const revokeSubmit = (
    params: Pick<OrgAccount, 'computationId' | 'computationPeriod'>,
  ) => {
    Modal.confirm({
      width: 480,
      className: styles.confirmModal,
      title: (
        <div className={styles.confirmModalTitle}>
          {I18N.enterpriseCarbonAccount2.confirmWithdrawalOfWithdrawal2}
        </div>
      ),
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
      okButtonProps: {
        className: styles.confirmModalBtn,
      },
      onOk: async () => {
        await computationRevokeSubmit(params);
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        getAccountData(
          { orgId: org?.id, year: cYear },
          { updateExpandedKeys: updateTableExpandedKeysRef.current },
        );
        getOrgTreeData(cYear, { updateOrgId: org?.id });
      },
    });
  };

  const deleteAccount = (orgAccount: OrgAccount) => {
    Modal.confirm({
      width: 480,
      className: styles.confirmModal,
      title: (
        <div className={styles.confirmModalTitle}>
          {I18N.carbonFootprint.delete}
        </div>
      ),
      content: (
        <div className={styles.confirmModalContent}>
          {I18N.enterpriseCarbonAccount2.confirmDeletionOfThis}
        </div>
      ),
      okButtonProps: {
        className: styles.confirmModalBtn,
      },
      onOk: async () => {
        await deleteAccountTask({ computationId: orgAccount.computationId });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        getSkuCount({ year: cYear });
        getAccountData(
          { orgId: org?.id, year: cYear },
          { updateExpandedKeys: updateTableExpandedKeysRef.current },
        );
        if (
          orgAccount.id === org?.id ||
          orgAccount.parents.every(
            ({ children }) => (children || []).length === 1,
          )
        ) {
          getOrgTreeData(cYear, { updateOrg: true });
        } else {
          getOrgTreeData(cYear, { updateOrgId: org?.id });
        }
      },
    });
  };

  const onPurchaseModalClose = async () => {
    setPurchaseModalVisible(false);
    getSkuCount({ year: cYear });
  };

  const goToDetails = (orgAccount: OrgAccount, periodName: string) => {
    if (orgAccount.orgType !== ORG_TYPE.MAIN_PART) {
      history.push({
        pathname: isShare
          ? RouteMaps.enterpriseCarbonAccountingAccountingShare
          : RouteMaps.enterpriseCarbonAccountingAccounting,
        search: `orgId=${orgAccount.id ?? ''}&computationPeriod=${
          orgAccount.computationPeriod || ''
        }&orgName=${orgAccount.name ?? ''}&orgType=${
          orgAccount.orgType ?? ''
        }&computationStatus=${
          orgAccount.status
        }&period=${cYear}&periodName=${periodName}&companyId=${companyId}&reportId=${reportId}&year=${year}&preOrgId=${orgId}`,
      });
    } else {
      let step = StepType.baseInfo;

      switch (orgAccount.status) {
        case COMPUTATION_STATUS.FILLING:
          step = StepType.fillData;
          break;
        case COMPUTATION_STATUS.COMPLETE:
          step = StepType.result;
          break;
        case COMPUTATION_STATUS.BE_SUBMITTED:
          step =
            userOrgType === ORG_TYPE.ENTERPRISE
              ? StepType.fillData
              : StepType.result;
          break;
        default:
          break;
      }
      history.push({
        pathname: isShare
          ? RouteMaps.enterpriseCarbonAccountingAccountingShare
          : RouteMaps.enterpriseCarbonAccountingAccounting,
        search: `computationId=${orgAccount.computationId}&computationPeriod=${
          orgAccount.computationPeriod || ''
        }&orgId=${
          orgAccount.id ?? ''
        }&step=${step}&periodName=${periodName}&companyId=${companyId}&reportId=${reportId}&year=${year}&orgName=${
          orgAccount.name
        }&preOrgId=${orgId}`,
      });
    }
  };

  const getDisclosureReportData = async (params: {
    year?: string;
    orgId?: number | string;
  }) => {
    if (!params.year || !params.orgId) {
      setDisclosureReportList([]);
      setDisclosureExpandedRowKeys([]);
      return;
    }

    setDisclosureReportLoading(true);
    try {
      const { data } = await getDisclosureReportList({
        year: params.year,
        orgId: `${params.orgId}`,
      });
      setDisclosureReportList(data.data);
      setDisclosureExpandedRowKeys(getDeepIds(data.data));
    } finally {
      setDisclosureReportLoading(false);
    }
  };

  const goToGenerateReport = (record: DisclosureReportListItem) => {
    history.push({
      pathname:
        RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportAdd,
      search: `orgId=${record.id}&period=${cYear}`,
    });
  };

  const updateAccountingListTab = (nextTab: AccountingListTab) => {
    setActiveTab(nextTab);
    setUrlState({
      tab: nextTab,
    });
  };

  const goToDisclosureReportDetail = (record: DisclosureReportListItem) => {
    const listSearchParams = new URLSearchParams(history.location.search);
    listSearchParams.set('tab', ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT);

    const searchParams = new URLSearchParams();
    searchParams.set('orgId', `${record.id}`);

    if (org?.id) {
      searchParams.set('configOrgId', `${org.id}`);
    }

    if (cYear) {
      searchParams.set('year', cYear);
    }

    history.replace({
      pathname: history.location.pathname,
      search: `?${listSearchParams.toString()}`,
    });
    history.push({
      pathname: RouteMaps.enterpriseCarbonAccountingDisclosureReportEdit,
      search: `?${searchParams.toString()}`,
    });
  };

  const getDisclosureConfigText = (
    configType: DisclosureReportListItem['reportBoundaryConfigType'],
  ) =>
    configType === DISCLOSURE_CONFIG_TYPE.CUSTOM
      ? I18N.enterpriseCarbonAccount2.customConfig
      : I18N.enterpriseCarbonAccount2.systemTemplate;

  const renderDisclosureConfigTag = (
    configType: DisclosureReportListItem['reportBoundaryConfigType'],
  ) => (
    <span
      className={classNames(styles.configTag, {
        [styles.customConfigTag]: configType === DISCLOSURE_CONFIG_TYPE.CUSTOM,
      })}
    >
      {getDisclosureConfigText(configType)}
    </span>
  );

  const disclosureColumns: TableColumnsType<DisclosureReportListItem> = [
    {
      title: I18N.enterpriseCarbonAccount2.accountingOrganization,
      dataIndex: 'name',
      width: 320,
      render: (_, record) => (
        <div className={styles.disclosureOrgCell}>
          <div
            className={classNames(styles.orgIcon, {
              [styles.companyOrgIcon]: record.orgType === ORG_TYPE.ENTERPRISE,
            })}
          >
            <IconAlibaba
              className={styles.companyOrgImg}
              type={OrgIconMap[record.orgType]}
            />
          </div>
          <span className={styles.disclosureOrgName} title={record.name}>
            {record.name}
          </span>
        </div>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.reportBoundaries,
      dataIndex: 'reportBoundaryConfig',
      width: 240,
      render: (_, record) =>
        renderDisclosureConfigTag(record.reportBoundaryConfigType),
    },
    {
      title:
        I18N.enterpriseCarbonAccount2.majorGhgIndirectEmissionIdentification,
      dataIndex: 'majorGhgConfig',
      width: 280,
      render: (_, record) =>
        renderDisclosureConfigTag(record.majorGhgConfigType),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operate',
      fixed: 'right',
      width: 220,
      render: (_, record) => {
        const canGenerateReport =
          record.status === DISCLOSURE_REPORT_STATUS.HAS_COMPLETED_ACCOUNTING;

        return (
          <div className={styles.disclosureOperate}>
            <Button
              type='link'
              onClick={() => goToDisclosureReportDetail(record)}
            >
              {I18N.carbonFootprint.edit}
            </Button>
            {checkPermissions(
              <Button
                type='link'
                disabled={!canGenerateReport}
                onClick={() => goToGenerateReport(record)}
              >
                {I18N.carbonFootprint.generateReport}
              </Button>,
              'enterprise:report:add',
            )}
          </div>
        );
      },
    },
  ];

  const columns: (
    periodName: string,
    isShare: boolean,
  ) => TableColumnsType<OrgAccount> = periodName => [
    {
      title: I18N.enterpriseCarbonAccount2.accountingOrganization,
      dataIndex: 'name',
      fixed: 'left',
      className: styles.tableOrgCell,
      width: 304,
      render: (_, tableOrg) => (
        <div className={styles.tableOrgColumn}>
          <div
            className={classNames(styles.orgIcon, {
              [styles.companyOrgIcon]: tableOrg.orgType === ORG_TYPE.ENTERPRISE,
            })}
          >
            <IconAlibaba
              className={styles.companyOrgImg}
              type={OrgIconMap[tableOrg.orgType]}
            />
          </div>
          <div
            className={styles.tableOrgName}
            style={{
              width: `calc(214px - ${8 * (tableOrg.level - 1)}px)`,
            }}
            title={tableOrg.name}
            onClick={() => {
              if (tableOrg.status === COMPUTATION_STATUS.NOT_START) {
                return;
              }
              if (checkPermissions(true, 'enterprise:computation:info')) {
                goToDetails(tableOrg, periodName);
              }
            }}
          >
            <span>{tableOrg.name}</span>
            <div className={styles.process}>
              <div className={styles.processBar}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${
                      Number.isNaN(Number(tableOrg.totalEmissionRatio))
                        ? 0
                        : tableOrg.totalEmissionRatio
                    }%`,
                  }}
                />
              </div>
              <span className={styles.tableEmissionRatio}>
                {tableOrg.totalEmissionRatio}%
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      width: 122,
      render: (text, record) => {
        if (record.orgType === ORG_TYPE.MAIN_PART) {
          return (
            <div
              className={classNames(styles.statusTag, {
                [styles.fillingStatusTag]:
                  record.status === COMPUTATION_STATUS.FILLING,
                [styles.completedStatusTag]:
                  record.status === COMPUTATION_STATUS.COMPLETE,
              })}
              style={{ marginLeft: 0 }}
            >
              {COMPUTATION_STATUS_LABEL[record.status]}
            </div>
          );
        }
        return record.statusDesc || '-';
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.totalCarbonEmissions2,
      dataIndex: 'totalEmission',
      className: styles.tableEmissionValue,
      width: 144,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.scopeOne,
      dataIndex: 'scopeOne',
      className: styles.tableEmissionValue,
      width: 144,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.scope2,
      dataIndex: 'scopeTwo',
      className: styles.tableEmissionValue,
      width: 144,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.fanWeisan,
      dataIndex: 'scopeThree',
      className: styles.tableEmissionValue,
      width: 144,
      ellipsis: true,
    },
    isShare
      ? {}
      : {
          title: I18N.enterpriseCarbonAccount2.responsiblePerson,
          dataIndex: isShare ? 'null' : 'principal',
          width: 160,
          render: text => text || '-',
        },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operate',
      align: 'right',
      fixed: 'right',
      width: 122,
      render: (_, record) => {
        if (record.status === COMPUTATION_STATUS.NOT_START) {
          return '--';
        }

        const isEnterprise = userOrgType === ORG_TYPE.ENTERPRISE;

        const infoPermission = !!checkPermissions(
          true,
          'enterprise:computation:info',
        );

        const modelPermission = !!checkPermissions(
          true,
          'enterprise:computation:model',
        );

        const deletePermission = !!checkPermissions(
          true,
          'enterprise:computation:deleted',
        );

        const submitPermission = !!checkPermissions(
          true,
          'computation:status:submit',
        );

        const revokeSubmitPermission = !!checkPermissions(
          true,
          'computation:status:revocation',
        );

        if (record.orgType !== ORG_TYPE.MAIN_PART) {
          if (isShare) {
            return null;
          }
          return (
            <div className={styles.operateBtnContent}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu rootClassName={styles.operateMenu}>
                    {infoPermission && (
                      <Menu.Item
                        onClick={() => goToDetails(record, periodName)}
                      >
                        {I18N.carbonFootprint3.details}
                      </Menu.Item>
                    )}
                  </Menu>
                }
              >
                <Button
                  className={styles.operateBtn}
                  icon={<img alt='' src={moreFillImg} />}
                />
              </Dropdown>
            </div>
          );
        }
        return (
          <div className={styles.operateBtnContent}>
            {(infoPermission || isShare) && (
              <Button
                className={classNames(
                  styles.operateBtn,
                  styles.operatePrimaryBtn,
                  {
                    [styles.isShare]: isShare,
                  },
                )}
                type='primary'
                icon={
                  isShare ? undefined : <IconAlibaba type='icon-a-icon_edit' />
                }
                onClick={() => goToDetails(record, periodName)}
              >
                {isShare ? I18N.carbonFootprint3.details : undefined}
              </Button>
            )}
            {!isShare && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu rootClassName={styles.operateMenu}>
                    {infoPermission && (
                      <Menu.Item
                        onClick={() => goToDetails(record, periodName)}
                      >
                        {I18N.carbonFootprint3.details}
                      </Menu.Item>
                    )}
                    {submitPermission &&
                      record.status === COMPUTATION_STATUS.FILLING && (
                        <Menu.Item
                          onClick={() => {
                            submit({
                              computationId: record.computationId,
                              computationPeriod: record.computationPeriod,
                            });
                          }}
                        >
                          {I18N.components.submit}
                        </Menu.Item>
                      )}
                    {revokeSubmitPermission &&
                      record.status === COMPUTATION_STATUS.COMPLETE && (
                        <Menu.Item
                          onClick={() =>
                            revokeSubmit({
                              computationId: record.computationId,
                              computationPeriod: record.computationPeriod,
                            })
                          }
                        >
                          {I18N.enterpriseCarbonAccount2.withdrawSubmission}
                        </Menu.Item>
                      )}
                    {isEnterprise &&
                      modelPermission &&
                      record.status === COMPUTATION_STATUS.COMPLETE && (
                        <Menu.Item
                          onClick={() => {
                            setCurrOrgAccount(record);
                          }}
                        >
                          {I18N.enterpriseCarbonAccount2.saveAsModel}
                        </Menu.Item>
                      )}
                    {isEnterprise && deletePermission && (
                      <Menu.Item
                        onClick={() => {
                          deleteAccount(record);
                        }}
                      >
                        {I18N.carbonFootprint.delete}
                      </Menu.Item>
                    )}
                  </Menu>
                }
              >
                <Button
                  className={styles.operateBtn}
                  icon={<img alt='' src={moreFillImg} />}
                />
              </Dropdown>
            )}
          </div>
        );
      },
    },
  ];

  const beforeYearChange = () => {
    setOrg(null);
    setOrgAccountData(null);
    setIntensityData(null);
  };

  useEffect(() => {
    if (isShare) {
      return;
    }

    getAccountingSetting().then(({ data }) => {
      setAccountSetting({
        accountWay: data.data.accountWay,
        yearList: data.data.yearList,
      });

      getRecentBrowseYear().then(resp => {
        const { year, period, orgInfo } = resp.data.data;

        setCYear(`${year}`);
        setOrg(orgInfo);

        if (!isNil(period)) {
          setCurrPeriod({
            value: period,
          } as unknown as OrgPeriod);
        }
      });
    });

    getOperateIndicatorList().then(({ data }) => {
      setIndicatorList(data.data || []);
      setIndicator(data.data?.[0]);
    });
  }, []);

  useEffect(() => {
    if (
      tab !== ACCOUNTING_LIST_TAB.ACCOUNTING_TASK &&
      tab !== ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT
    ) {
      return;
    }

    setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    if (org && indicator && cYear) {
      getIntensityData({
        year: cYear,
        orgId: org.id,
        indicatorId: indicator.id,
        period: currPeriod?.value,
      }).then(({ data }) => {
        setIntensityData(data.data);
      });
    }
  }, [org, indicator, cYear, currPeriod]);

  useEffect(() => {
    if (!cYear || isShare) {
      return;
    }

    updateTableExpandedKeysRef.current = true;

    getOrgTreeData(cYear, {
      expandAll: true,
      updateOrg: yearChangedRef.current,
    });
    getSkuCount({ year: cYear });
    yearChangedRef.current = true;
  }, [cYear]);

  useEffect(() => {
    if (org && !isShare) {
      getAccountData(
        { orgId: org.id, year: cYear, period: currPeriod?.value },
        { updateExpandedKeys: updateTableExpandedKeysRef.current },
      );
    }
  }, [org?.id, cYear, currPeriod]);

  useEffect(() => {
    if (isShare || activeTab !== ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT) {
      return;
    }

    if (!cYear || !org?.id) {
      setDisclosureReportList([]);
      setDisclosureExpandedRowKeys([]);
      return;
    }

    getDisclosureReportData({ year: cYear, orgId: org.id });
  }, [activeTab, cYear, isShare, org?.id]);

  useEffect(() => {
    if (isShare) {
      getAccountData(
        { orgId, year },
        { updateExpandedKeys: updateTableExpandedKeysRef.current },
      );
      setCYear(year);
    }
  }, [isShare]);

  useEffect(() => {
    if (!isShare) {
      getEnterpriseUserStatus().then(resp => {
        setEnterpriseUserStatus(resp.data.data.userStatus);
      });
    }
  }, [isShare]);
  return (
    <div className={styles.account}>
      <SaveModal
        visible={!!currOrgAccount}
        accountTask={currOrgAccount}
        onCancel={() => setCurrOrgAccount(null)}
        onConfirm={async (data: Record<string, any>) => {
          const resp = await saveAccountToModel(data);
          if (resp.data.code === 200) {
            Toast('success', I18N.carbonFootprint.operationSuccessful);
            setCurrOrgAccount(null);
          }
        }}
      />
      <PurchaseModal
        visible={purchaseModalVisible}
        onCancel={onPurchaseModalClose}
      />
      {!isShare && (
        <div
          className={classNames(styles.accountTree, {
            [styles.collapseAccountTree]: orgTreeCollapse,
          })}
        >
          <div className={styles.treeContent}>
            <Spin spinning={orgTreeLoading}>
              <div className={styles.orgTreeTip}>
                {I18N.enterpriseCarbonAccount2.accountingOrganizationColumn}
              </div>
              <OrgTree
                width={224}
                treeData={orgData}
                fieldNames={{ key: 'id', title: 'name' }}
                expandedKeys={expandedOrgIds}
                emptyText={I18N.enterpriseCarbonAccount2.notYetForThisYear}
                blockNode
                selectedKeys={[Number(org?.id)]}
                onExpand={setExpandedOrgIds}
                onSearch={matchKeys => {
                  setExpandedOrgIds([
                    ...new Set([...matchKeys, ...expandedOrgIds]),
                  ]);
                }}
                onSelect={(_, { node }) => {
                  const selectOrg = node as unknown as Org;
                  if (selectOrg.id !== org?.id) {
                    updateTableExpandedKeysRef.current = true;
                    setOrg(selectOrg);
                  }
                }}
              />
            </Spin>
          </div>
        </div>
      )}
      {!isShare && (
        <div className={styles.accountTreeExpand}>
          <div
            className={styles.accountTreeExpandBtn}
            onClick={() => setOrgTreeCollapse(!orgTreeCollapse)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='64'
              viewBox='0 0 20 64'
              fill='none'
            >
              <path
                d='M20 15.8046C20 9.62521 14.298 4.92053 8.26061 3.60334C5.44382 2.9888 2.52299 1.89224 0 0C0 8 0 56 0 64C2.52298 62.1078 5.44381 61.0112 8.2606 60.3967C14.298 59.0795 20 54.3748 20 48.1954V15.8046Z'
                fill='white'
              />
            </svg>
            {orgTreeCollapse ? (
              <RightOutlined className={styles.expandIcon} />
            ) : (
              <LeftOutlined className={styles.expandIcon} />
            )}
          </div>
        </div>
      )}
      <div className={styles.accountContent}>
        <div className={styles.accountContentHeader}>
          <div className={styles.accountContentHeaderItem}>
            <div className={styles.title}>
              {I18N.enterpriseCarbonAccount2.carbonEmissionAccounting}
            </div>
            <div className={styles.yearPickerContent}>
              <Button
                className={styles.yearChangeBtn}
                disabled={
                  isShare ||
                  (accountWay === ACCOUNT_WAY.FINANCIAL_YEAR &&
                    yearIndex >= yearList.length - 1)
                }
                icon={<LeftOutlined className={styles.yearChangeIcon} />}
                onClick={() => {
                  beforeYearChange();

                  if (accountWay === ACCOUNT_WAY.CALENDAR_YEAR) {
                    setCYear(moment(cYear).subtract(1, 'year').format('YYYY'));
                  } else {
                    setCYear(yearList[yearIndex + 1].year);
                  }
                }}
              />
              {accountWay === ACCOUNT_WAY.CALENDAR_YEAR ? (
                <div className={styles.yearPicker}>
                  <DatePicker
                    className={styles.yearPickerInput}
                    allowClear={false}
                    value={moment(cYear)}
                    picker='year'
                    disabled={isShare}
                    disabledDate={date =>
                      moment(date.format('YYYY')).isAfter(
                        moment(moment().format('YYYY')),
                      )
                    }
                    onChange={(_, year) => {
                      beforeYearChange();
                      setCYear(year as string);
                    }}
                  />
                  <span>
                    {cYear
                      ? I18N.template(I18N.enterpriseCarbonAccount2.cYear, {
                          val1: cYear,
                        })
                      : ''}
                  </span>
                </div>
              ) : (
                <Select
                  className={styles.yearSelect}
                  value={cYear}
                  suffixIcon={null}
                  options={yearList.map(({ year }) => ({
                    value: year,
                    label: year,
                  }))}
                  disabled={isShare}
                  onChange={year => {
                    beforeYearChange();
                    setCYear(year);
                  }}
                />
              )}
              <Button
                className={styles.yearChangeBtn}
                disabled={
                  isShare ||
                  (accountWay === ACCOUNT_WAY.CALENDAR_YEAR
                    ? moment(moment(cYear).format('YYYY')).isSameOrAfter(
                        moment(moment().format('YYYY')),
                      )
                    : yearIndex <= 0)
                }
                icon={<RightOutlined className={styles.yearChangeIcon} />}
                onClick={() => {
                  beforeYearChange();

                  if (accountWay === ACCOUNT_WAY.CALENDAR_YEAR) {
                    setCYear(moment(cYear).add(1, 'year').format('YYYY'));
                  } else {
                    setCYear(yearList[yearIndex - 1].year);
                  }
                }}
              />
            </div>
          </div>
          {!isShare &&
            enterpriseUserStatus ===
              ENTERPRISE_USER_STATUS.LIGHT_TRIAL_EXPIRED_USER && (
              <Button
                className={styles.upgradeSubscriptionBtn}
                type='link'
                onClick={openSubscription}
              >
                {I18N.components.upgradeSubscription}
              </Button>
            )}
          {userOrgType === ORG_TYPE.ENTERPRISE &&
            !isShare &&
            cYear &&
            checkPermissions(
              <div className={styles.accountContentHeaderItem}>
                <SkuCountLabel
                  productName={I18N.enterpriseCarbonAccount2.subject}
                  skuCount={skuCount}
                  onBuyBtnClick={() => {
                    if (isLightUser) {
                      openSubscription();
                    } else {
                      setPurchaseModalVisible(true);
                    }
                  }}
                />
                <AddDrawer
                  title={
                    <div className={styles.addDrawerTitle}>
                      <span>{I18N.carbonFootprint.accountingManagement2}</span>
                      <SkuCountLabel
                        productName={I18N.enterpriseCarbonAccount2.subject}
                        skuCount={{
                          ...skuCount,
                          useCount: skuCount.useCount + selectedOrgCount,
                          status:
                            skuCount.status !== SKU_STATUS.UN_LIMIT &&
                            skuCount.useCount + selectedOrgCount >=
                              skuCount.total
                              ? SKU_STATUS.FULL
                              : skuCount.status,
                        }}
                        onBuyBtnClick={() => {
                          if (isLightUser) {
                            openSubscription();
                          } else {
                            setPurchaseModalVisible(true);
                          }
                        }}
                      />
                    </div>
                  }
                  cYear={cYear}
                  accountWay={accountWay}
                  skuCount={skuCount}
                  Content={AddDrawerContent}
                  onInnerOrgListChange={setSelectedOrgCount}
                  onConfirm={updateAccountTask}
                  onClose={() => {
                    getSkuCount({ year: cYear });
                    setSelectedOrgCount(0);
                  }}
                >
                  <Button>
                    <SettingOutlined />
                    <span>{I18N.carbonFootprint.accountingManagement2}</span>
                  </Button>
                </AddDrawer>
              </div>,
              'enterprise:computation:add',
            )}
        </div>
        {!isShare && (
          <Tabs
            className={styles.accountTabs}
            activeKey={activeTab}
            items={[
              {
                key: ACCOUNTING_LIST_TAB.ACCOUNTING_TASK,
                label: I18N.enterpriseCarbonAccount2.accountingTask,
              },
              {
                key: ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT,
                label: I18N.enterpriseCarbonAccount2.disclosureAndReport,
              },
            ]}
            onChange={key => updateAccountingListTab(key as AccountingListTab)}
          />
        )}
        {!isShare && activeTab === ACCOUNTING_LIST_TAB.DISCLOSURE_REPORT ? (
          <Spin spinning={disclosureReportLoading}>
            <div className={styles.disclosureTableContainer}>
              <Table
                className={styles.disclosureTable}
                rowKey='id'
                pagination={false}
                dataSource={disclosureReportList}
                columns={disclosureColumns}
                expandable={{
                  expandedRowKeys: disclosureExpandedRowKeys,
                  onExpandedRowsChange: setDisclosureExpandedRowKeys,
                }}
              />
            </div>
          </Spin>
        ) : (
          <Spin spinning={orgTreeLoading || orgAccountDataLoading}>
            {(org || isShare) && orgAccountData ? (
              <>
                <div className={styles.accountOverview}>
                  <div className={styles.overviewHeader}>
                    <div className={styles.overviewHeaderLeft}>
                      <div
                        className={classNames(styles.orgIcon, {
                          [styles.companyOrgIcon]:
                            org?.orgType === ORG_TYPE.ENTERPRISE,
                        })}
                      >
                        <IconAlibaba
                          className={styles.companyOrgImg}
                          type={OrgIconMap[org?.orgType]}
                        />
                      </div>
                      <div className={styles.orgName} title={org?.name || '--'}>
                        {org?.name || '--'}
                      </div>
                      <div className={styles.orgTip}>
                        <span className={styles.orgYear}>{cYear}</span>
                        <span>
                          {
                            I18N.enterpriseCarbonAccount2
                              .carbonEmissionAccounting6
                          }
                        </span>
                      </div>
                      {currPeriod?.value !== 0 && (
                        <div
                          className={classNames(styles.statusTag, {
                            [styles.fillingStatusTag]:
                              orgAccountData.status ===
                              COMPUTATION_STATUS.FILLING,
                            [styles.completedStatusTag]:
                              orgAccountData.status ===
                              COMPUTATION_STATUS.COMPLETE,
                          })}
                        >
                          {COMPUTATION_STATUS_LABEL[orgAccountData.status]}
                        </div>
                      )}
                    </div>
                    {checkPermissions(
                      <DetailsButton
                        orgAccountData={orgAccountData}
                        goToDetails={goToDetails}
                      />,
                      'enterprise:computation:info',
                    )}
                  </div>
                  {(org?.periodList || []).length > 0 && (
                    <div className={styles.periodList}>
                      {org?.periodList.map(period => {
                        const { value, name, status } = period;

                        return (
                          <div
                            className={classNames(styles.period, {
                              [styles.curPeriod]: currPeriod?.value === value,
                              [styles.disabledPeriod]:
                                status === COMPUTATION_STATUS.NOT_START,
                            })}
                            key={value}
                            onClick={() => {
                              if (status !== COMPUTATION_STATUS.NOT_START) {
                                setCurrPeriod(period);
                              }
                            }}
                          >
                            <div className={styles.periodName}>{name}</div>
                            {value !== 0 && (
                              <div className={styles.periodStatus}>
                                {COMPUTATION_STATUS_LABEL[status]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className={styles.split} />
                  <div className={styles.emissionOverview}>
                    <div className={styles.emissionContent}>
                      <div className={styles.emissionTitle}>
                        {I18N.enterpriseCarbonAccount2.totalCarbonEmissions2}
                        <span className={styles['caption-s']}>/tCO₂e</span>
                      </div>
                      <div className={styles.totalEmission}>
                        <div className={styles.totalEmissionValue}>
                          {orgAccountData.totalEmission}
                        </div>
                        <div>
                          <span className={styles['caption-s']}>
                            {
                              I18N.enterpriseCarbonAccount2
                                .comparedToThePreviousYear
                            }
                          </span>
                          <span
                            className={classNames(styles.compareValue, {
                              [styles.moreRatio]:
                                orgAccountData.totalEmissionRatioStatus === 1,
                              [styles.lessRatio]:
                                orgAccountData.totalEmissionRatioStatus === 2,
                            })}
                          >
                            {orgAccountData.totalEmissionRatio}%
                          </span>
                          {orgAccountData.totalEmissionRatioStatus === 1 && (
                            <IconAlibaba
                              className={styles.moreRatio}
                              type='icon-icon_shangjiantou'
                            />
                          )}
                          {orgAccountData.totalEmissionRatioStatus === 2 && (
                            <IconAlibaba
                              className={styles.lessRatio}
                              type='icon-icon_xiajiantou'
                            />
                          )}
                        </div>
                      </div>
                      <div className={styles.scope}>
                        <div className={styles.scopeItem}>
                          <div className={styles.scopeOneBar} />
                          <div className={styles.scopeName}>
                            {I18N.enterpriseCarbonAccount2.scopeOne}
                          </div>
                          <div className={styles.scopeValue}>
                            {orgAccountData.scopeOne}
                          </div>
                        </div>
                        <div className={styles.scopeItem}>
                          <div className={styles.scopeTwoBar} />
                          <div className={styles.scopeName}>
                            {I18N.enterpriseCarbonAccount2.scope2}
                          </div>
                          <div className={styles.scopeValue}>
                            {orgAccountData.scopeTwo}
                          </div>
                        </div>
                        <div className={styles.scopeItem}>
                          <div className={styles.scopeThreeBar} />
                          <div className={styles.scopeName}>
                            {I18N.enterpriseCarbonAccount2.fanWeisan}
                          </div>
                          <div className={styles.scopeValue}>
                            {orgAccountData.scopeThree}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!isShare && (
                      <div className={styles.indicator}>
                        <Dropdown
                          className={styles.indicatorDropdown}
                          trigger={['click']}
                          menu={{
                            items: indicatorList.map(indicatorItem => ({
                              key: indicatorItem.id,
                              label: `${indicatorItem.name}（${indicatorItem.unitName}）`,
                              onClick: () => {
                                if (indicator?.id !== indicatorItem.id) {
                                  setIndicator(indicatorItem);
                                }
                              },
                            })),
                          }}
                        >
                          <div className={styles.indicatorName}>
                            <div
                              className={styles.indicatorNameText}
                              title={(() => {
                                let title =
                                  I18N.carbonFootprint.emissionIntensity;

                                if (indicator) {
                                  title += `-${indicator.name}（${indicator.unitName}）`;
                                }
                                return title;
                              })()}
                            >
                              {(() => {
                                let title =
                                  I18N.carbonFootprint.emissionIntensity;

                                if (indicator) {
                                  title += `-${indicator.name}（${indicator.unitName}）`;
                                }
                                return title;
                              })()}
                            </div>
                            <IconAlibaba
                              className={styles.indicatorIcon}
                              type='icon-icon_arrow_rioght'
                            />
                          </div>
                        </Dropdown>
                        <div className={styles.indicatorInfo}>
                          <div className={styles.indicatorValue}>
                            {intensityData?.currMoney || '-'}
                          </div>
                          <div>
                            <span className={styles['caption-s']}>
                              {I18N.DomesticVersion.yoY}
                            </span>
                            <span
                              className={classNames(styles.compareValue, {
                                [styles.moreRatio]:
                                  intensityData?.compareValue === 1,
                                [styles.lessRatio]:
                                  intensityData?.compareValue === 2,
                              })}
                            >
                              {intensityData?.currMoneyRate || '-'}%
                            </span>
                            {intensityData?.compareValue === 1 && (
                              <IconAlibaba
                                className={styles.moreRatio}
                                type='icon-icon_shangjiantou'
                              />
                            )}
                            {intensityData?.compareValue === 2 && (
                              <IconAlibaba
                                className={styles.lessRatio}
                                type='icon-icon_xiajiantou'
                              />
                            )}
                          </div>
                        </div>
                        {!isShare &&
                          checkPermissions(
                            <div
                              className={styles.redirectIndicatorBtn}
                              onClick={() =>
                                history.push(
                                  RouteMaps.enterpriseCarbonAccountingPom,
                                )
                              }
                            >
                              {I18N.enterpriseCarbonAccount2.goSetItUp}
                              <IconAlibaba type='icon-icon_arrow_rioght' />
                            </div>,
                            'enterprise:operate:v2:edit',
                          )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.accountTableContent}>
                  {(orgAccountData.orgInfoList || []).map((item, index) => {
                    const { title, orgList } = item;
                    return (
                      <div key={`${org?.id}-${title || index}`}>
                        <div className={styles.accountTableTitle}>{title}</div>
                        <div className={styles.accountTableContainer}>
                          <Table
                            className={styles.accountTable}
                            rowKey='id'
                            scroll={{ x: 1200 }}
                            pagination={false}
                            dataSource={attachOrgLevel(orgList)}
                            expandable={{
                              defaultExpandAllRows: true,
                              expandedRowKeys: tableExpandedKeys[index],
                              indentSize: 8,
                              onExpandedRowsChange(expandedKeys) {
                                setTableExpandedKeys(
                                  tableExpandedKeys.map((keys, tIndex) =>
                                    tIndex === index
                                      ? (expandedKeys as unknown as number[])
                                      : keys,
                                  ),
                                );
                              },
                            }}
                            columns={columns(title, isShare)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={styles.emptyOrgAccountData}>
                <div className={styles.empty}>
                  <img alt='' src={emptyImg} />
                  <div className={styles.emptyText}>
                    {I18N.enterpriseCarbonAccount2.notYetForThisYear}
                  </div>
                  {userOrgType === ORG_TYPE.ENTERPRISE &&
                    cYear &&
                    checkPermissions(
                      <AddDrawer
                        title={
                          <div className={styles.addDrawerTitle}>
                            <span>
                              {I18N.carbonFootprint.accountingManagement2}
                            </span>
                            <SkuCountLabel
                              productName={
                                I18N.enterpriseCarbonAccount2.subject
                              }
                              skuCount={{
                                ...skuCount,
                                useCount: skuCount.useCount + selectedOrgCount,
                                status:
                                  skuCount.status !== SKU_STATUS.UN_LIMIT &&
                                  skuCount.useCount + selectedOrgCount >=
                                    skuCount.total
                                    ? SKU_STATUS.FULL
                                    : skuCount.status,
                              }}
                              onBuyBtnClick={() =>
                                setPurchaseModalVisible(true)
                              }
                            />
                          </div>
                        }
                        accountWay={accountWay}
                        cYear={cYear}
                        skuCount={skuCount}
                        Content={AddDrawerContent}
                        onInnerOrgListChange={setSelectedOrgCount}
                        onConfirm={updateAccountTask}
                        onClose={() => {
                          getSkuCount({ year: cYear });
                          setSelectedOrgCount(0);
                        }}
                      >
                        <Button type='primary'>
                          <IconAlibaba type='icon-icon-gonggongshezhi' />
                          <span>
                            {I18N.carbonFootprint.accountingManagement2}
                          </span>
                        </Button>
                      </AddDrawer>,
                      'enterprise:computation:add',
                    )}
                </div>
              </div>
            )}
          </Spin>
        )}
      </div>
    </div>
  );
};
export default AccountingList;
