import useUrlState from '@ahooksjs/use-url-state';
import { createForm, onFieldChange, onFieldValueChange } from '@formily/core';
import { request } from '@src/api/request';
import I18N from '@src/lang/I18N';
import { Drawer, Tooltip } from 'antd';
import type { AxiosResponse } from 'axios';
import classNames from 'classnames';
import {
  FC,
  memo,
  type ComponentProps,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { ValueOf } from 'type-fest';

import { AddReportModal } from '@/components/AddReportModal';
import { postReportAddAuth } from '@/components/AddReportModal/service';
import { AGENT_CERTIFICATION_PREVIEW_SOURCE } from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { checkPermissions } from '@/components/Permission/utils';
import { RouteMaps } from '@/router/route-paths';
import {
  getAccountListData,
  getAccountProductData,
} from '@/views/carbonFootprint3/FootprintAccount/service';
import type {
  AccountProductDataParams,
  ProductAccountingListParams,
} from '@/views/carbonFootprint3/FootprintAccount/type';
import {
  getCarbonLabelProductType,
  getReportScope,
  getStageEmissions,
} from '@/views/carbonFootprint3/Report/Info/service';
import { getOrgTree } from '@/views/dashborad/organization/services';
import { Org } from '@/views/enterpriseCarbonAccount2/AccountingList/type';
import { ACCOUNT_WAY } from '@/views/enterpriseCarbonAccount2/AccountingSetting/constant';
import { getAccountingSetting } from '@/views/enterpriseCarbonAccount2/AccountingSetting/service';
import { getDataBoardOrgAuth } from '@/views/enterpriseCarbonAccount2/AnnualReport/service';
import { CertificationForm } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm';
import CarbonLabelCertFile from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/CarbonLabelCertFile';
import AuditRecordDrawer, {
  CarbonAuthAuditRecordsReturn,
} from '@/views/subModules/CarbonFootprintModel/components/AuditRecordDrawer';
import { CertificationStep } from '@/views/subModules/CarbonFootprintModel/components/CertificationStep';
import { ComfirmFiles } from '@/views/subModules/CarbonFootprintModel/components/ComfirmFiles';
import { Page } from '@/views/subModules/CarbonFootprintModel/components/Page';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';
import { CERTIFYPROJECTSTATUS } from '@/views/subModules/CarbonFootprintModel/constant';

import style from './index.module.less';
import {
  getCarbonLabelReportInfo,
  getCarbonLabelReportList,
  getCertInstitutionList,
  getCompanySnapInfoByCode,
  getSnapInfoByCode,
  getSnapInfoByReportId,
  postCancelAuth,
  postSubmitAuth,
  postSubmitAuthByTable,
  postSubmitDraft,
} from './service';
import {
  apiGETCarbonAuthAuditRecords,
  apiGETCarbonAuthFiles,
  apiGETCarbonAuthInfo,
} from '../../../service';
import { CarbonAuthInfoReturn, FileListType } from '../../../type';
import { CERTIFYPROJECTTYPE, PAGETAYPE } from '../../const';

const DETAIL_ANCHOR_IDS = {
  certificate: 'certification-certificate',
  confirmFile: 'certification-confirm-file',
  internalFile: 'certification-internal-file',
  certInfo: 'certification-info',
  report: 'certification-report',
  material: 'certification-material',
} as const;

type DetailAnchorId =
  (typeof DETAIL_ANCHOR_IDS)[keyof typeof DETAIL_ANCHOR_IDS];

type DetailAnchorItem = {
  id: DetailAnchorId;
  label: string;
};

type AgentAccountProductItem = {
  accountId?: number | string;
  accountName?: string;
  accountStatus?: number | string;
  endTime?: string;
  functionalUnit?: string;
  id?: number | string;
  name?: string;
  productId?: number | string;
  productName?: string;
  startTime?: string;
  [key: string]: unknown;
};

type AgentAccountProductListResponse = {
  code: number;
  data?: AgentAccountProductItem[];
  lang?: string | null;
  msg?: string;
};

type AgentAccountInfoResponse = {
  code: number;
  data?: AgentAccountProductItem;
  msg?: string;
};

const COMPLETED_ACCOUNT_STATUS = 2;

const getAgentAccountProducts = ({
  accountId,
  sessionId,
}: {
  accountId?: string;
  sessionId: string;
}) =>
  request<AgentAccountProductListResponse>({
    method: 'get',
    params: {
      accountId: accountId || '',
    },
    url: `/ai/agent/sessions/${encodeURIComponent(sessionId)}/accountProducts`,
  });

const getAgentAccountInfo = (id: number | string) =>
  request<AgentAccountInfoResponse>({
    method: 'get',
    params: { id },
    url: '/footprint3/account/info',
  });

const getAgentAccountProductData = (params: {
  accountId?: string;
  sessionId: string;
}): Promise<AxiosResponse<unknown>> =>
  getAgentAccountProducts(params).then(response => ({
    ...response,
    data: {
      ...response.data,
      data: {
        rows: (response.data?.data || []).map(product => ({
          ...product,
          id: product.productId ?? product.id,
          productName: product.productName || product.name,
        })),
      },
    },
  }));

const toAgentProductAccountRow = (
  product: AgentAccountProductItem,
  accountInfo?: AgentAccountProductItem,
) => {
  const accountStatus = accountInfo?.accountStatus ?? product.accountStatus;
  const completed = Number(accountStatus) === COMPLETED_ACCOUNT_STATUS;
  const id = accountInfo?.id ?? product.accountId;
  const accountName =
    accountInfo?.accountName || product.accountName || product.functionalUnit;

  return {
    ...product,
    ...accountInfo,
    accountName: completed
      ? accountName || ''
      : accountName
      ? `${accountName}（${I18N.carbonFootprint3.accountingIncomplete}）`
      : I18N.carbonFootprint3.accountingIncomplete,
    accountStatus,
    disabled: !completed,
    id,
    value: id,
  };
};

const getAgentProductAccountData = ({
  accountId,
  productId,
  sessionId,
}: {
  accountId?: string;
  productId?: number | string;
  sessionId: string;
}): Promise<AxiosResponse<unknown>> =>
  getAgentAccountProducts({ accountId, sessionId }).then(async response => {
    const accountProducts = response.data?.data || [];
    const matchedProducts = accountProducts.filter(
      product => String(product.productId ?? product.id) === String(productId),
    );
    const rows = await Promise.all(
      matchedProducts.map(async product => {
        if (!product.accountId) {
          return toAgentProductAccountRow(product);
        }

        try {
          const accountInfoResponse = await getAgentAccountInfo(
            product.accountId,
          );

          return toAgentProductAccountRow(
            product,
            accountInfoResponse.data?.data,
          );
        } catch {
          return toAgentProductAccountRow(product);
        }
      }),
    );

    return {
      ...response,
      data: {
        ...response.data,
        data: {
          rows,
        },
      },
    };
  });

const getPageTitle = (authType?: string | CERTIFYPROJECTTYPE) => {
  const currentAuthType = String(authType ?? '');
  if (currentAuthType === `${CERTIFYPROJECTTYPE.CARBONPRINT_REPORT}`) {
    return I18N.Certification.carbonFootprintVerification4;
  }
  if (currentAuthType === `${CERTIFYPROJECTTYPE.CARBON_LABEL}`) {
    return I18N.Certification.carbonLabelingCertification;
  }
  return I18N.Certification.corporateCarbonAccounting;
};

const getReportAnchorTitle = (authType?: string | CERTIFYPROJECTTYPE) => {
  const currentAuthType = String(authType ?? '');
  if (currentAuthType === `${CERTIFYPROJECTTYPE.CARBON_LABEL}`) {
    return I18N.subModules.productCarbonFootprint4;
  }
  if (currentAuthType === `${CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT}`) {
    return I18N.supplyChain2.enterpriseCarbonAccounting2;
  }
  return I18N.subModules.productCarbonFootprintQuantificationReport;
};

const ChangeRecordIcon = () => (
  <svg
    className={style.historyIcon}
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
  >
    <path
      d='M3.415 15.095C2.615 15.095 1.945 14.365 1.905 13.435V2.645C1.905 1.715 2.535 0.945 3.335 0.895H12.585C13.395 0.895 14.055 1.625 14.095 2.555V8.455C14.095 8.575 14.055 8.685 13.975 8.765C13.895 8.855 13.785 8.905 13.675 8.915C13.545 8.915 13.445 8.875 13.365 8.805C13.275 8.735 13.225 8.625 13.205 8.505V2.645C13.205 2.265 12.955 1.955 12.645 1.925H3.415C3.105 1.925 2.835 2.215 2.815 2.585V13.345C2.815 13.725 3.055 14.035 3.375 14.065H8.665C8.795 14.065 8.915 14.115 9.005 14.205C9.095 14.295 9.155 14.415 9.155 14.545C9.155 14.675 9.125 14.805 9.045 14.905C8.965 15.005 8.845 15.065 8.725 15.085H8.665H3.415V15.095ZM12.835 15.085C12.735 15.075 12.645 15.015 12.585 14.935C12.525 14.855 12.495 14.755 12.515 14.645L12.535 14.465C12.345 14.545 12.135 14.615 11.925 14.645C11.775 14.675 11.625 14.685 11.475 14.685C10.205 14.685 9.155 13.805 8.955 12.585C8.945 12.495 8.955 12.405 8.985 12.325C9.015 12.245 9.075 12.175 9.135 12.125C9.205 12.065 9.285 12.035 9.375 12.015C9.405 12.015 9.435 12.015 9.465 12.015C9.545 12.015 9.595 12.015 9.635 12.035C9.805 12.095 9.925 12.235 9.955 12.415C10.075 13.165 10.725 13.705 11.495 13.705C11.585 13.705 11.675 13.705 11.765 13.685C11.925 13.655 12.075 13.605 12.225 13.535L11.635 13.455C11.635 13.455 11.535 13.435 11.495 13.405C11.455 13.375 11.415 13.345 11.385 13.305C11.355 13.265 11.335 13.215 11.325 13.165C11.315 13.115 11.315 13.065 11.325 13.015C11.325 12.965 11.345 12.915 11.375 12.875C11.395 12.835 11.435 12.795 11.475 12.765C11.515 12.735 11.555 12.715 11.615 12.695C11.615 12.695 11.655 12.685 11.695 12.685C11.735 12.685 11.765 12.685 11.765 12.685L13.155 12.885C13.365 12.915 13.505 13.115 13.475 13.325L13.285 14.765C13.275 14.865 13.215 14.955 13.135 15.025C13.065 15.075 12.985 15.105 12.905 15.105H12.855L12.835 15.085ZM13.565 11.825C13.315 11.825 13.105 11.645 13.065 11.405C12.945 10.625 12.275 10.065 11.485 10.065C11.395 10.065 11.305 10.065 11.205 10.085C11.095 10.105 10.995 10.135 10.885 10.175L11.155 10.355C11.215 10.395 11.265 10.455 11.295 10.525C11.325 10.595 11.335 10.675 11.325 10.745C11.315 10.825 11.275 10.895 11.225 10.945C11.175 11.005 11.105 11.045 11.035 11.065C11.035 11.065 11.005 11.065 10.955 11.075C10.905 11.085 10.885 11.075 10.885 11.075C10.835 11.075 10.785 11.045 10.745 11.025L9.555 10.255C9.475 10.195 9.405 10.115 9.385 10.015C9.365 9.915 9.385 9.815 9.435 9.725L10.175 8.485C10.175 8.485 10.235 8.405 10.275 8.375C10.315 8.345 10.365 8.325 10.415 8.315H10.565C10.565 8.315 10.665 8.335 10.705 8.365C10.785 8.415 10.855 8.505 10.875 8.605C10.895 8.705 10.875 8.815 10.825 8.895L10.635 9.205C10.765 9.165 10.895 9.125 11.035 9.105C11.185 9.075 11.345 9.065 11.495 9.065C12.795 9.065 13.885 9.985 14.085 11.245C14.125 11.515 13.935 11.785 13.655 11.825H13.565ZM4.065 10.035C4.005 10.035 3.945 10.025 3.885 9.995C3.825 9.975 3.775 9.935 3.735 9.885C3.695 9.835 3.655 9.785 3.635 9.725C3.615 9.665 3.595 9.605 3.595 9.535C3.595 9.265 3.805 9.045 4.065 9.045H6.505C6.765 9.045 6.985 9.265 6.985 9.535C6.985 9.665 6.935 9.785 6.845 9.875C6.755 9.965 6.635 10.015 6.505 10.025H4.065V10.035ZM4.065 7.705C4.005 7.705 3.935 7.695 3.885 7.665C3.825 7.645 3.775 7.605 3.735 7.555C3.695 7.505 3.655 7.455 3.635 7.395C3.615 7.335 3.595 7.275 3.595 7.205C3.595 6.955 3.775 6.745 4.015 6.725H7.635C7.775 6.725 7.885 6.765 7.975 6.845C8.065 6.935 8.125 7.055 8.135 7.185C8.135 7.315 8.105 7.435 8.015 7.535C7.935 7.635 7.815 7.695 7.685 7.695H7.635H4.075L4.065 7.705ZM4.065 5.175C4.005 5.175 3.935 5.165 3.885 5.135C3.825 5.115 3.775 5.075 3.735 5.025C3.695 4.975 3.655 4.925 3.635 4.865C3.615 4.805 3.595 4.745 3.595 4.675C3.595 4.425 3.775 4.215 4.015 4.195H11.385C11.645 4.195 11.855 4.415 11.855 4.685C11.855 4.935 11.675 5.145 11.435 5.165H11.375H4.065V5.175Z'
      fill='currentColor'
    />
  </svg>
);

const findOrg = (targetId: number, orgs: Org[]) => {
  let orgIds: number[] | undefined;
  let org: Org | undefined;

  const dfsOrg = (orgList: Org[], parentIds: number[] = []) => {
    orgList.forEach(currOrg => {
      if (currOrg.id === targetId) {
        orgIds = [...parentIds, currOrg.id];
        org = currOrg;
      } else {
        dfsOrg(currOrg.children, [...parentIds, currOrg.id]);
      }
    });
  };

  dfsOrg(orgs);

  return { orgIds, org };
};

const findOrgByAll = (targetId: number, orgs: Org[], keyName = 'id') => {
  let orgIds: number[] | undefined;
  let org: Org | undefined;

  const dfsOrg = (
    orgList: Org[],
    parentIds: number[] = [],
    innerKeyName = 'id',
  ) => {
    if (!orgList) return;
    orgList.forEach(currOrg => {
      if (currOrg[keyName] === targetId) {
        orgIds = [...parentIds, currOrg[keyName]];
        org = currOrg;
      } else {
        dfsOrg(
          currOrg.children,
          [...parentIds, currOrg[keyName]],
          innerKeyName,
        );
      }
    });
  };

  dfsOrg(orgs, [], keyName);

  return { orgIds, org };
};

interface ApplayCertificationProps {
  readonly: boolean;
  /** 内嵌预览（如碳代理预览面板）时隐藏底部「返回」按钮 */
  embedded?: boolean;
  onSubmitted?: (certificationId?: number | string) => void;
  // initValues?: CarbonAuthInfoReturn;
  // editSubmit?: boolean;
  // auditData?: CarbonAuthAuditRecordsReturn[];
}

const ApplayCertification: FC<ApplayCertificationProps> = props => {
  const { readonly, embedded, onSubmitted } = props;

  const [
    {
      pageType,
      authType,
      period,
      orgId,
      id,
      applyNo,
      productId,
      accountId,
      agentSessionId,
    },
    setUrlState,
  ] = useUrlState<{
    pageType: PAGETAYPE;
    id?: string;
    applyNo?: string;
    authType?: CERTIFYPROJECTTYPE;
    period?: string;
    orgId?: string;
    source?: string;
    productId?: string;
    accountId?: string;
    agentSessionId?: string;
  }>();

  const isAdd = !pageType || pageType === PAGETAYPE.ADD;
  const isEdit = pageType === PAGETAYPE.EDIT;
  const isShow = pageType === PAGETAYPE.SHOW;
  const getCertificationProductList = useCallback(
    (params: AccountProductDataParams): Promise<AxiosResponse<unknown>> => {
      if (embedded && agentSessionId) {
        return getAgentAccountProductData({
          accountId,
          sessionId: agentSessionId,
        });
      }

      return getAccountProductData(params) as Promise<AxiosResponse<unknown>>;
    },
    [accountId, agentSessionId, embedded],
  );
  const getCertificationProductAccountList = useCallback(
    (params: ProductAccountingListParams): Promise<AxiosResponse<unknown>> => {
      if (embedded && agentSessionId) {
        return getAgentProductAccountData({
          accountId,
          productId: params.productId,
          sessionId: agentSessionId,
        });
      }

      return getAccountListData(params) as Promise<AxiosResponse<unknown>>;
    },
    [accountId, agentSessionId, embedded],
  );

  // const initData = useMemo(() => initValues, [initValues]);

  const [initData, setInitData] = useState<CarbonAuthInfoReturn>();

  const [auditData, setAuditData] = useState<CarbonAuthAuditRecordsReturn[]>(
    [],
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!initData) return;
    if (
      initData?.status === CERTIFYPROJECTSTATUS.IN_AUDIT ||
      initData?.status === CERTIFYPROJECTSTATUS.NOT_ACCEPT
    ) {
      setStep(1);
    }
    if (initData?.status === CERTIFYPROJECTSTATUS.WAIT_ON_SITE_AUDIT) {
      setStep(2);
    }
    if (
      [
        CERTIFYPROJECTSTATUS.WAIT_UPLOAD_CONFIRM_FILE,
        CERTIFYPROJECTSTATUS.CONFIRM_FILE_WAIT_MODIFY,
        CERTIFYPROJECTSTATUS.WAIT_CONFIRM,
      ].includes(initData?.status)
    ) {
      setStep(3);
    }
    if (initData?.status === CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE) {
      setStep(4);
    }
    if (initData?.status === CERTIFYPROJECTSTATUS.SUCCESS) {
      setStep(5);
    }
  }, [initData?.status]);

  const [loading, setLoading] = useState<boolean>(false);

  const getApplyInfo = async () => {
    try {
      if (loading) return;
      if (!id) return;
      setLoading(true);
      const { data } = await apiGETCarbonAuthInfo({
        id: Number(id),
      });
      setInitData(data.data);
      return data.data;
    } finally {
      setLoading(false);
    }
  };

  const getAuditInfo = async () => {
    try {
      if (loading) return;
      if (!applyNo) return;
      setLoading(true);

      const { data } = await apiGETCarbonAuthAuditRecords({
        applyNo,
      });
      setAuditData(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    const [latestValues] = await Promise.all([getApplyInfo(), getAuditInfo()]);
    return latestValues;
  };

  useEffect(() => {
    refresh();
  }, [id, applyNo]);

  useEffect(() => {}, [initData?.status]);

  const { state } = useLocation<{
    id: number;
    type: number;
  }>();

  const [reportId, setReportId] = useState<number>();

  const [accountSetting, setAccountSetting] = useState<{
    accountWay: ValueOf<typeof ACCOUNT_WAY>;
    yearList: { year: string; yearInfo: string }[];
  }>();

  const form = useMemo(
    () =>
      createForm({
        readPretty: readonly,
        initialValues: {
          authType: initData?.authType || CERTIFYPROJECTTYPE.CARBONPRINT_REPORT,
          reportId,
        },
        effects: () => {
          onFieldChange('period', ['value'], async (filed, backForm) => {
            const cYear = backForm.getValuesIn('period');
            if (cYear && !isShow) {
              form.setFieldState('orgId', {
                loading: true,
              });
              const optionData = await getDataBoardOrgAuth({ cYear });
              let value: number[] = [];
              if (isAdd) {
                const orgInfo = findOrg(Number(orgId), optionData.data.data);
                value = orgInfo.orgIds || [];
              } else if (isEdit) {
                const orgInfo = findOrg(
                  Number(initData?.orgId),
                  optionData.data.data,
                );
                value = orgInfo.orgIds || [];
              }
              form.setFieldState('orgId', {
                loading: false,
                dataSource: optionData.data.data,
                value,
              });
            }
          });
          onFieldChange('authType', ['value'], async (filed, backForm) => {
            backForm.setValuesIn('orgId', []);
            backForm.setValuesIn('period', '');
            setTimeout(() => {
              backForm.clearErrors();
            }, 0);
            backForm.setFieldState('orgId', {
              errors: [],
            });
            backForm.setFieldState('period', {
              errors: [],
            });
          });
        },
      }),
    [accountSetting?.accountWay],
  );

  useEffect(() => {
    if (accountSetting?.accountWay === ACCOUNT_WAY.FINANCIAL_YEAR) {
      form.setFieldState('period', {
        dataSource: accountSetting?.yearList.map(list => ({
          value: list.year,
          label: list.year,
        })),
      });
    }
  }, [form, accountSetting]);

  useEffect(() => {
    if (!pageType || pageType === PAGETAYPE.ADD) {
      form.setInitialValues({
        authType: Number(authType) || CERTIFYPROJECTTYPE.CARBONPRINT_REPORT,
      });
      form.setInitialValues({
        period,
      });
    }
  }, [form, pageType, authType, period, orgId]);

  const setOrgDataSourceFromAll = async () => {
    if (!initData) return;
    const optionData = await getOrgTree();
    const orgInfo = findOrgByAll(
      Number(initData.orgId),
      optionData.data.data.tree as any,
      'code',
    );
    const value: number[] = orgInfo.orgIds || [];
    form.setInitialValues({
      period: initData?.period,
      orgId: value,
    });
    form.setFieldState('orgId', {
      loading: false,
      dataSource: optionData.data.data.tree,
      value,
    });
    const field = form.query('orgId').take(); // 获取字段

    field?.setComponentProps({
      fieldNames: { value: 'code', label: 'name' },
    });
    // form.setf
    form.setValuesIn('orgId', value);
    setTimeout(() => {
      form.setValuesIn('orgId', value);
    }, 300);
  };

  useEffect(() => {
    const getInfo = async () => {
      if (
        initData &&
        initData.authType === CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT
      ) {
        if (isShow) {
          setOrgDataSourceFromAll();
          return;
        }
        const optionData = await getDataBoardOrgAuth({
          cYear: initData?.period,
        });
        const orgInfo = findOrg(Number(initData.orgId), optionData.data.data);
        const value: number[] = orgInfo.orgIds || [];
        form.setInitialValues({
          period: initData?.period,
          orgId: value,
        });
        form.setFieldState('orgId', {
          loading: false,
          dataSource: optionData.data.data,
          value,
        });
        form.setValuesIn('orgId', value);
        setTimeout(() => {
          form.setValuesIn('orgId', value);
        }, 300);
      }
    };
    getInfo();
  }, [initData, form]);

  // const onSubmit = async () => {
  //   const values = (await form.submit()) as AddSubmitParam;

  //   if (values.authType !== CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT) {
  //     validReport();
  //   }

  //   const isAccounting =
  //     values.authType === CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT;
  //   const formOrgIds = values.orgId as number[];
  //   let accountingData = {};

  //   if (isAccounting) {
  //     accountingData = {
  //       orgId: formOrgIds?.[formOrgIds.length - 1],
  //       period: values.period,
  //     };
  //   }

  //   try {
  //     if (loading) return;
  //     setLoading(true);
  //     if (editSubmit) {
  //       await apiEditSubmit({
  //         ...omit(values, ['orgId', 'period']),
  //         ...accountingData,
  //         reportId,
  //         id: initData?.id,
  //       });
  //     } else {
  //       await apiAddSubmit({
  //         ...omit(values, ['orgId', 'period']),
  //         ...accountingData,
  //         reportId,
  //       });
  //     }
  //   } finally {
  //     setLoading(false);
  //   }

  //   Toast('success', I18N.carbonFootprint.submittedSuccessfully);
  //   back();
  // };
  // const onSave = async () => {
  //   const values = (await form.submit()) as AddSubmitParam;

  //   const isAccounting =
  //     values.authType === CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT;
  //   const formOrgIds = values.orgId as number[];
  //   let accountingData = {};

  //   if (isAccounting) {
  //     accountingData = {
  //       orgId: formOrgIds?.[formOrgIds.length - 1],
  //       period: values.period,
  //     };
  //   }

  //   if (values.authType !== CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT) {
  //     validReport();
  //   }

  //   try {
  //     if (loading) return;
  //     setLoading(true);
  //     await apiAddDraft({
  //       ...omit(values, ['orgId', 'period']),
  //       ...accountingData,
  //       reportId,
  //       id: initData?.id,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }

  //   Toast('success', I18N.carbonFootprint.saveSuccessful);
  //   back();
  // };

  // useEffect(() => {
  //   setMainCounts(initData?.reportInfo?.productCount || 0);
  // }, [initData]);

  useEffect(() => {
    if (state && form) {
      form.setFieldState('authType', {
        disabled: Boolean(state),
        value: Number(state?.type),
      });

      setReportId(state.id);
    }

    if (initData && form) {
      form.setValues({
        authType: initData?.authType,
        projectName: initData?.projectName,
        projectNo: initData?.projectNo,
        fileList:
          initData?.fileList?.map(fl => ({
            name: fl.name,
            url: fl.url,
            id: fl.id,
          })) || [],
      });

      setReportId(initData?.reportId);
    }
  }, [initData, state, form, readonly]);

  // // 详情和一键认证时
  // const chooseReportReadOnly = useMemo(
  //   () => Boolean(state) || readonly,
  //   [readonly, state],
  // );

  // 审核中,审核通过,审核不通过的详情使用快照详情
  // const isSnapInfo = useMemo(
  //   () =>
  //     [
  //       CERTIFYPROJECTSTATUS.IN_AUDIT,
  //       CERTIFYPROJECTSTATUS.SUCCESS,
  //       CERTIFYPROJECTSTATUS.FAIL,
  //     ].includes(Number(initValues?.status)) &&
  //     readonly &&
  //     initValues,
  //   [initValues, readonly],
  // );

  // // 审核不通过的编辑是实时数据
  // const showTip = useMemo(
  //   () =>
  //     [CERTIFYPROJECTSTATUS.FAIL].includes(Number(initValues?.status)) &&
  //     !readonly &&
  //     initValues,
  //   [initValues, readonly],
  // );

  useEffect(() => {
    if (!form) return;
    form.addEffects('authType', () => {
      onFieldValueChange('authType', () => {
        // @ts-ignore
        setReportId(null);
      });
    });
  }, [form]);

  useEffect(() => {
    getAccountingSetting().then(({ data }) => {
      setAccountSetting(data.data as any);
    });
  }, []);

  const [showHistory, setShowHistory] = useState(false);

  const { status } = initData || ({} as CarbonAuthInfoReturn);

  // const showComfirmFiles = [
  //   CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE,
  //   CERTIFYPROJECTSTATUS.SUCCESS,
  //   CERTIFYPROJECTSTATUS.WAIT_CONFIRM,
  // ].includes(status);

  const showDownloadCer = [CERTIFYPROJECTSTATUS.SUCCESS].includes(status);

  const [cerFiles, setCerFiles] = useState<FileListType[]>([]);
  // const [comfirmFiles, setComfirmFiles] = useState<FileListType[]>([]);

  const getCerFiles = async () => {
    const result = await apiGETCarbonAuthFiles({
      type: 7,
      sourceId: initData?.id || 0,
    });
    setCerFiles(result.data.data || []);
  };

  useEffect(() => {
    if (showDownloadCer) {
      getCerFiles();
    }
  }, [showDownloadCer]);

  // const getComfirmFiles = async () => {
  //   const result = await apiGETCarbonAuthFiles({
  //     type: status === CERTIFYPROJECTSTATUS.WAIT_CONFIRM ? 8 : 9,
  //     sourceId: initData?.id || 0,
  //   });
  //   setComfirmFiles(result.data.data || []);
  // };

  // useEffect(() => {
  //   if (showComfirmFiles) {
  //     getComfirmFiles();
  //   }
  // }, [showComfirmFiles]);

  const getReportSnapInfo = async (snapCode: string) => {
    const { data } = await getSnapInfoByCode({ snapCode });
    return data.data;
  };
  const submitDraft = async (
    value: any,
    submit?: boolean,
    options?: { silent?: boolean },
  ) => {
    const normalizeValue = (submitValue: any) => ({
      ...submitValue,
      id: submitValue.id ?? initData?.id,
      payStatus: submitValue.payStatus ?? initData?.payStatus,
      authType,
    });

    const saveDraft = async () => {
      const result = await postSubmitDraft(normalizeValue(value));
      setUrlState(pre => ({
        ...pre,
        id: result.data.data.id,
      }));
      return result.data.data.id;
    };

    if (submit) {
      const currentId = value.id ?? initData?.id;
      const draftId = currentId ? await saveDraft() : undefined;
      const submitValue = normalizeValue({
        ...value,
        id: draftId ?? currentId,
      });
      const result = submitValue.id
        ? await postSubmitAuth(submitValue)
        : await postSubmitAuthByTable(submitValue);
      const submittedId = result.data.data.id;
      setUrlState(pre => ({
        ...pre,
        id: submittedId,
      }));
      refresh();
      Toast('success', I18N.carbonFootprint.submittedSuccessfully);
      if (!options?.silent) {
        onSubmitted?.(submittedId);
      }
      return submittedId;
    }
    const draftId = await saveDraft();
    refresh();
    if (!options?.silent) {
      Toast('success', I18N.carbonFootprint.saveSuccessful);
      onSubmitted?.(draftId);
    }
    return draftId;
  };

  const canDownload = checkPermissions(
    true,
    'CertificationCarbonFootprintProject:Download',
  );

  const cancelAuth = async (id?: number) => {
    if (!id) {
      return;
    }
    await postCancelAuth({
      id,
    });
    refresh();
    Toast('success', I18N.carbonFootprint3.revokeSuccessful);
  };

  const readPrettyStatus = [
    CERTIFYPROJECTSTATUS.CONFIRM_FILE_WAIT_MODIFY,
    CERTIFYPROJECTSTATUS.IN_AUDIT,
    CERTIFYPROJECTSTATUS.SUCCESS,
    CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE,
    CERTIFYPROJECTSTATUS.WAIT_CONFIRM,
    CERTIFYPROJECTSTATUS.WAIT_ON_SITE_AUDIT,
    CERTIFYPROJECTSTATUS.WAIT_UPLOAD_CONFIRM_FILE,
  ];

  const pageTitle = getPageTitle(authType);
  const reportAnchorTitle = getReportAnchorTitle(authType);
  const confirmFiles = (
    initData as
      | (CarbonAuthInfoReturn & { confirmFile?: Record<string, any>[] })
      | undefined
  )?.confirmFile;
  const showConfirmFile = Boolean(confirmFiles?.length);
  const showHistoryEntry = pageType !== PAGETAYPE.ADD;
  const anchorItems = useMemo(
    () =>
      [
        showDownloadCer && {
          id: DETAIL_ANCHOR_IDS.certificate,
          label: I18N.Certification.authenticationCertificate,
        },
        showConfirmFile && {
          id: DETAIL_ANCHOR_IDS.confirmFile,
          label: I18N.subModules.confirmFile,
        },
        {
          id: DETAIL_ANCHOR_IDS.certInfo,
          label: I18N.certificationReviewCenter.certificationInformation,
        },
        {
          id: DETAIL_ANCHOR_IDS.report,
          label: reportAnchorTitle,
        },
        {
          id: DETAIL_ANCHOR_IDS.material,
          label: I18N.subModules.certificationMaterials,
        },
      ].filter(Boolean) as DetailAnchorItem[],
    [reportAnchorTitle, showConfirmFile, showDownloadCer],
  );
  const [activeAnchorId, setActiveAnchorId] = useState<
    DetailAnchorId | undefined
  >();
  const [anchorCollapsed, setAnchorCollapsed] = useState(false);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveAnchorId(preActiveAnchorId =>
      preActiveAnchorId &&
      anchorItems.some(item => item.id === preActiveAnchorId)
        ? preActiveAnchorId
        : anchorItems[0]?.id,
    );
  }, [anchorItems]);

  const updateActiveAnchor = useCallback(() => {
    const container = contentWrapperRef.current;
    if (!container || anchorItems.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const activationLine = containerRect.top + 80;
    let nextActiveAnchorId = anchorItems[0].id;

    anchorItems.forEach(item => {
      const section = document.getElementById(item.id);
      if (!section) return;
      if (section.getBoundingClientRect().top <= activationLine) {
        nextActiveAnchorId = item.id;
      }
    });

    const isScrollable = container.scrollHeight > container.clientHeight + 4;
    if (
      isScrollable &&
      container.scrollTop + container.clientHeight >= container.scrollHeight - 4
    ) {
      nextActiveAnchorId = anchorItems[anchorItems.length - 1].id;
    }

    setActiveAnchorId(nextActiveAnchorId);
  }, [anchorItems]);

  useEffect(() => {
    const container = contentWrapperRef.current;
    if (!container) return undefined;

    let frameId = window.requestAnimationFrame(updateActiveAnchor);
    const handleScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveAnchor);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [updateActiveAnchor]);

  const scrollToAnchor = (
    event: MouseEvent<HTMLAnchorElement>,
    anchorId: DetailAnchorId,
  ) => {
    event.preventDefault();
    setActiveAnchorId(anchorId);
    document.getElementById(anchorId)?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  };

  const renderAnchorLink = (item: DetailAnchorItem) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      className={classNames(style.anchorLink, {
        [style.anchorLinkActive]: activeAnchorId === item.id,
      })}
      title={item.label}
      onClick={event => scrollToAnchor(event, item.id)}
    >
      <span className={style.anchorText}>{item.label}</span>
    </a>
  );

  const enterpriseAgentEmbedded = Boolean(embedded && authType === '2');
  let breadcrumbTitle = I18N.Certification.carbonLabelingCertification;

  if (authType === '0') {
    breadcrumbTitle = I18N.Certification.carbonFootprintVerification4;
  } else if (authType === '2') {
    breadcrumbTitle = I18N.Certification.corporateCarbonAccounting;
  }

  let breadcrumb: ComponentProps<typeof Page>['breadcrumb'] = {
    items: [
      {
        title: I18N.router.verificationAndCertificationServices,
        href: RouteMaps.CertificationProductIndex,
      },
      {
        title: breadcrumbTitle,
      },
    ],
  };
  let certificationStep = <CertificationStep step={step} />;
  let footerClassName: string | undefined;
  let enterpriseCarbonDefaultPeriod: string | undefined;
  if (embedded) {
    footerClassName = style.embeddedFooter;
  }
  if (enterpriseAgentEmbedded) {
    breadcrumb = undefined;
    certificationStep = (
      <div className={style.embeddedStep}>
        <CertificationStep step={step} />
      </div>
    );
    footerClassName = classNames(
      style.embeddedFooter,
      style.enterpriseEmbeddedFooter,
    );
    enterpriseCarbonDefaultPeriod = period;
  }

  const pageContent = (
    <Page
      title={
        <div className={style.pageTitleRow}>
          <span className={style.pageTitleText}>{pageTitle}</span>
          {showHistoryEntry && (
            <button
              type='button'
              className={style.historyButton}
              onClick={() => setShowHistory(true)}
            >
              <ChangeRecordIcon />
              {I18N.Certification.changeRecord}
            </button>
          )}
        </div>
      }
      breadcrumb={breadcrumb}
    >
      <div className={style.Wrapper}>
        {certificationStep}
        <div className={style.applayCertification}>
          <aside
            className={classNames(style.anchorPane, {
              [style.anchorPaneCollapsed]: anchorCollapsed,
            })}
          >
            <Tooltip
              title={
                anchorCollapsed
                  ? I18N.subModules.expandNavigationPane
                  : I18N.subModules.collapseNavigationPane
              }
              placement='right'
            >
              <button
                type='button'
                className={style.anchorToggle}
                onClick={() => setAnchorCollapsed(pre => !pre)}
              >
                <span
                  className={classNames(style.anchorToggleIcon, {
                    [style.anchorToggleIconCollapsed]: anchorCollapsed,
                  })}
                />
              </button>
            </Tooltip>
            {!anchorCollapsed && (
              <nav className={style.anchorList}>
                {anchorItems.map(item => renderAnchorLink(item))}
              </nav>
            )}
          </aside>
          <div className={style.contentWrapper} ref={contentWrapperRef}>
            <div className={style.content}>
              {showDownloadCer && (
                <section
                  id={DETAIL_ANCHOR_IDS.certificate}
                  className={style.sectionAnchor}
                >
                  <ComfirmFiles
                    title={I18N.Certification.authenticationCertificate}
                    canDownload={canDownload}
                    className={
                      enterpriseAgentEmbedded
                        ? style.enterpriseCertificateFiles
                        : undefined
                    }
                    files={cerFiles.map(item => ({
                      name: item.name || '',
                      url: item.url || '',
                    }))}
                  />
                </section>
              )}
              {/* {showComfirmFiles && !isCarbonLabel && (
                <ComfirmFiles
                  title={I18N.subModules.confirmFile}
                  canDownload={canDownload}
                  subTitle={I18N.subModules.signatureDocument}
                  files={comfirmFiles.map(item => ({
                    name: item.name || '',
                    url: item.url || '',
                  }))}
                />
              )} */}
              <section
                id={showConfirmFile ? DETAIL_ANCHOR_IDS.confirmFile : undefined}
                className={style.sectionAnchor}
              >
                <CarbonLabelCertFile
                  id={initData?.id}
                  authType={Number(authType)}
                  confirmFile={initData?.confirmFile}
                  step={step}
                  status={initData?.status}
                  refresh={refresh}
                />
              </section>
              <CertificationForm
                isBoss={false}
                embedded={embedded}
                accountPreviewSource={
                  embedded && agentSessionId
                    ? AGENT_CERTIFICATION_PREVIEW_SOURCE
                    : undefined
                }
                initialValues={initData}
                addReportModal={AddReportModal}
                authType={authType}
                step={step}
                refresh={refresh}
                submitDraft={submitDraft}
                getReportSnapInfo={getReportSnapInfo}
                canSubmit={
                  !!checkPermissions(
                    true,
                    'CertificationCarbonFootprintProject:Submit',
                  )
                }
                editPermission={
                  !!checkPermissions(
                    true,
                    'CertificationCarbonFootprintProject:Edit',
                  )
                }
                readPretty={
                  isShow || readPrettyStatus.includes(initData?.status)
                }
                cancelAuth={cancelAuth}
                getSnapInfoByReportId={async (snapCode: string) =>
                  getSnapInfoByReportId({ snapCode })
                }
                getDataBoardOrg={getDataBoardOrgAuth}
                getCompanySnapInfoRequest={async (snapCode: string) =>
                  getCompanySnapInfoByCode({ snapCode })
                }
                getCarbonLabelProductType={getCarbonLabelProductType}
                getReportScope={getReportScope}
                getProductList={getCertificationProductList}
                getProductAccountList={getCertificationProductAccountList}
                getStageEmissions={getStageEmissions}
                reportAddAuth={postReportAddAuth}
                getCertInstitutionList={getCertInstitutionList}
                getCarbonLabelReportList={getCarbonLabelReportList}
                getCarbonLabelReportInfo={getCarbonLabelReportInfo}
                footerClassName={footerClassName}
                addReportDefaultValues={
                  embedded
                    ? {
                        productId,
                        accountId,
                      }
                    : undefined
                }
                enterpriseCarbonDefaultPeriod={enterpriseCarbonDefaultPeriod}
                sectionAnchorIds={{
                  certInfo: DETAIL_ANCHOR_IDS.certInfo,
                  report: DETAIL_ANCHOR_IDS.report,
                  material: DETAIL_ANCHOR_IDS.material,
                }}
                onPayModalApplyInvoice={() =>
                  window.open(
                    RouteMaps.homeInvoiceManagementApplyForInvoice,
                    '_blank',
                    'noopener noreferrer',
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
      {showHistoryEntry && (
        <Drawer
          open={showHistory}
          title={I18N.Certification.changeRecord}
          width={320}
          className={style.historyDrawer}
          onClose={() => setShowHistory(false)}
        >
          <AuditRecordDrawer auditData={auditData || []} />
        </Drawer>
      )}
    </Page>
  );

  if (enterpriseAgentEmbedded) {
    return <div className={style.enterpriseEmbeddedPage}>{pageContent}</div>;
  }
  return pageContent;
};

export default memo(ApplayCertification);
