import { request } from '@/api/request';

export const getTaskProgressData = params =>
  request<{
    data: {
      auditWarnTime: string;
      auditTotal: number;
      auditFinishCount: number;
      taskFinishCount: number;
      taskTotal: number;
      taskWarnTime: string;
    };
  }>({
    url: '/enterprise/source/task/taskProcess',
    params,
  });

export const noticeTask = params =>
  request<{ data: string }>({
    url: '/enterprise/source/task/taskNotice',
    params,
  });

export const getTaskList = params =>
  request<{ data: Record<string, any>[] }>({
    url: '/enterprise/source/task/taskDetail',
    params,
  });

export const exportTaskList = params =>
  request<Blob>({
    url: '/enterprise/source/task/taskDetailExport',
    params,
    responseType: 'blob',
  });
