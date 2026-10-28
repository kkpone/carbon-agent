import { request } from '@src/api/request';

import {
  BatchTaskListPage,
  BatchTaskListParams,
  BatchTaskRecord,
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

type BatchTaskRow = {
  id: number;
  productName?: string;
  updateName?: string;
  status?: number;
  updateTime?: string;
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

const normalizeBatchTaskRecord = (row: BatchTaskRow): BatchTaskRecord => ({
  id: row.id,
  productName: row.productName,
  updateName: row.updateName,
  status: row.status,
  updateTime: row.updateTime,
});

/** 批量建模任务列表 GET /footprint3/batchTask/list */
export const getBatchTaskList = async ({
  pageNum,
  pageSize,
  productName,
  status,
}: BatchTaskListParams): Promise<BatchTaskListPage> => {
  const { data } = await request<ListResponse<BatchTaskRow>>({
    method: 'get',
    url: '/footprint3/batchTask/list',
    params: {
      pageNum,
      pageSize,
      productName: productName?.trim() || undefined,
      status,
    },
  });

  return {
    rows: getListRows(data).map(normalizeBatchTaskRecord),
    total: getListTotal(data),
  };
};

/** 批量建模任务详情 GET /footprint3/batchTask/info */
export const getBatchTaskInfo = async (id: number) => {
  const { data } = await request<{ data: BatchTaskRow }>({
    method: 'get',
    url: '/footprint3/batchTask/info',
    params: { id },
  });

  return normalizeBatchTaskRecord(data.data);
};
