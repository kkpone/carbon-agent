import { request } from '@src/api/request';

import {
  FactorDatabaseSourceOption,
  GlobalFactorPreferenceFormValues,
  GlobalFactorPreferencePlan,
} from './type';

type ListResponse<Row> = {
  code: number;
  msg: string;
  data?: {
    rows?: Row[];
    list?: Row[];
    records?: Row[];
    total?: number;
  };
  rows?: Row[];
  list?: Row[];
  records?: Row[];
  total?: number;
};

type FactorDatabaseSourceRow = {
  id: number | string;
  institution?: string;
};

type GlobalFactorPreferencePlanRow = {
  id: number;
  name: string;
  sourceIds?: Array<number | string>;
  sourceNames?: string;
  isDefault?: number;
  remark?: string;
  status?: number;
};

type GlobalFactorPreferencePlanListParams = {
  pageSize?: number;
  pageNum?: number;
  status?: number;
};

type GlobalFactorPreferencePlanPage = {
  rows: GlobalFactorPreferencePlan[];
  total: number;
};

const getListRows = <Row>(response: ListResponse<Row>) =>
  response.data?.rows ||
  response.data?.list ||
  response.data?.records ||
  response.rows ||
  response.list ||
  response.records ||
  [];

const getListTotal = <Row>(response: ListResponse<Row>) =>
  response.data?.total ?? response.total ?? getListRows(response).length;

const normalizeFactorPreferencePlan = (
  plan: GlobalFactorPreferencePlanRow,
): GlobalFactorPreferencePlan => ({
  id: plan.id,
  name: plan.name,
  sourceIds: plan.sourceIds || [],
  sourceNames: plan.sourceNames || '',
  remark: plan.remark,
  published: plan.status === 1,
  isDefault: plan.isDefault === 1,
});

const normalizeFactorDatabaseSource = (
  source: FactorDatabaseSourceRow,
): FactorDatabaseSourceOption => ({
  id: source.id,
  name: source.institution || String(source.id),
});

export const getFactorDatabaseSourceOptions = async () => {
  const { data } = await request<ListResponse<FactorDatabaseSourceRow>>({
    method: 'get',
    url: '/management/system/source/sourceMainList',
    params: {
      pageSize: 10000000,
      pageNum: 1,
      pref: 1,
    },
  });

  return getListRows(data).map(normalizeFactorDatabaseSource);
};

export const getGlobalFactorPreferencePlanPage = async ({
  pageSize = 10,
  pageNum = 1,
  status,
}: GlobalFactorPreferencePlanListParams = {}): Promise<GlobalFactorPreferencePlanPage> => {
  const { data } = await request<ListResponse<GlobalFactorPreferencePlanRow>>({
    method: 'get',
    url: '/footprint3/factorPref/list',
    params: {
      pageSize,
      pageNum,
      ...(status === undefined ? {} : { status }),
    },
  });

  return {
    rows: getListRows(data).map(normalizeFactorPreferencePlan),
    total: getListTotal(data),
  };
};

export const getGlobalFactorPreferencePlans = async (
  params: GlobalFactorPreferencePlanListParams = {},
) => {
  const { rows } = await getGlobalFactorPreferencePlanPage(params);
  return rows;
};

export const getPublishedGlobalFactorPreferencePlans = () =>
  getGlobalFactorPreferencePlans({
    pageSize: 10000000,
    pageNum: 1,
    status: 1,
  });

export const getGlobalFactorPreferencePlanInfo = async (id: number) => {
  const { data } = await request<{ data: GlobalFactorPreferencePlanRow }>({
    method: 'get',
    url: '/footprint3/factorPref/info',
    params: { id },
  });

  return normalizeFactorPreferencePlan(data.data);
};

export const addGlobalFactorPreferencePlan = (
  values: GlobalFactorPreferenceFormValues,
) =>
  request({
    method: 'post',
    url: '/footprint3/factorPref/add',
    data: values,
  });

export const editGlobalFactorPreferencePlan = (
  id: number,
  values: GlobalFactorPreferenceFormValues,
) =>
  request({
    method: 'post',
    url: '/footprint3/factorPref/edit',
    data: {
      id,
      ...values,
    },
  });

export const setGlobalFactorPreferencePublished = (id: number) =>
  request({
    method: 'post',
    url: '/footprint3/factorPref/enable',
    params: { id },
  });

export const setDefaultGlobalFactorPreferencePlan = (id: number) =>
  request({
    method: 'post',
    url: '/footprint3/factorPref/setDefault',
    params: { id },
  });

export const deleteGlobalFactorPreferencePlan = (id: number) =>
  request({
    method: 'post',
    url: '/footprint3/factorPref/delete',
    params: { id },
  });
