import { request } from '@src/api/request';
import {
  SupplierDetails,
  CarbonData,
  CarbonDataSubmit,
  AccountInfo,
  FootprintSnap,
  EnterpriseSnap,
} from '@src/views/supplyChain/type';
import { CancelToken } from 'axios';

export const getInitialSupplierNumber = () =>
  request<{ data: { companyNumber: string } }>({
    method: 'GET',
    url: '/chain/supplier/create/number',
  });

export const getSupplierDetails = (params: { supplierId: number }) =>
  request<{ data: SupplierDetails }>({
    method: 'GET',
    url: '/chain/supplier/info',
    params,
  });

export const editSupplier = (
  data: SupplierDetails & { inviteFlag?: boolean },
) =>
  request<{ data: number }>({
    method: 'POST',
    url: '/chain/supplier/edit',
    data,
  });

export const editPurchaseProductSupplier = (data: SupplierDetails) =>
  request<{ data: number }>({
    method: 'POST',
    url: '/chain/supplier/edit/purchase',
    data,
  });

export const downloadTemplate = (params: { dictTypes: string }) =>
  request<{
    data: {
      [TempType: string]: {
        relatedValue: string;
        dictLabel: string;
      }[];
    };
  }>({
    method: 'get',
    url: '/management/system/enum/listALLByDictTypeBatch',
    params,
  });

export const getCarbonData = (params: { id: number | string }) =>
  request<{ data: CarbonData }>({
    method: 'get',
    url: '/chain/data/info/req',
    params,
  });

export const getSupplierCarbonData = (params: { id: number | string }) =>
  request<{ data: CarbonData }>({
    method: 'get',
    url: '/chain/data/info/req/v1',
    params,
  });

export const submitCarbonData = (data: CarbonDataSubmit) =>
  request<{ data: { code: number; msg: string } }>({
    method: 'post',
    url: '/chain/data/submit/add',
    data,
  });

export const getAccountInfoData = (params: {
  id: number | string;
  fillType?: number;
  snapFlag?: number;
}) =>
  request<{ data: AccountInfo }>({
    method: 'get',
    url: '/footprint3/account/info',
    params,
  });

export const footprintAddReportSupply = data =>
  request<{ data: { snapCode: string } }>({
    method: 'post',
    url: '/footprint3/report/addReportSupply',
    data,
  });

export const footprintGetReport = (
  params: { snapCode: string | number },
  cancelToken?: CancelToken,
) =>
  request<{
    data: FootprintSnap;
  }>({
    url: '/footprint3/reportSnap/detailSupply',
    params,
    cancelToken,
  });

export const enterpriseAddReportSupply = data =>
  request<{ data: { snapCode: string } }>({
    method: 'post',
    url: '/enterprise/calculate/report/addReportSupply',
    data,
  });

export const enterpriseGetReport = (
  params: {
    snapCode: string | number;
    companyId?: number;
  },
  cancelToken?: CancelToken,
) =>
  request<{
    data: EnterpriseSnap;
  }>({
    url: '/enterprise/carbonAuthSnap/detailSupply',
    params,
    cancelToken,
  });

export const getAuditRecordList = (params: {
  pageNum: number;
  pageSize: number;
  id: number;
}) =>
  request<{ rows: Record<string, any>[]; total: number }>({
    method: 'get',
    url: '/chain/data/audit/list',
    params,
  });
