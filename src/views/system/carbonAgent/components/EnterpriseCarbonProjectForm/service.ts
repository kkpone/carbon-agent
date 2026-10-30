import { request } from '@api/request';

export type EnterpriseAccountingPreset = {
  accountingExists: boolean;
  accountingYear: number;
  computationId: number;
  existingProjectId: number | string | null;
  gwp: string;
  gwpName: string;
  locked: boolean;
  timeType: number;
  timeTypeName: string;
};

type EnterpriseAccountingPresetResponse = {
  code: number;
  data: EnterpriseAccountingPreset;
  lang: string | null;
  msg: string;
};

/** 获取企业碳项目年度核算预设 */
export const fetchEnterpriseAccountingPreset = (
  year: number,
  signal?: AbortSignal,
) =>
  request<EnterpriseAccountingPresetResponse>({
    method: 'GET',
    params: { year },
    silentResponseError: true,
    signal,
    url: '/ai/agent/projects/enterprise/accountingPreset',
  })
    .then(response => response.data.data)
    .catch(() => ({
      accountingExists: false,
      accountingYear: year,
      computationId: 0,
      existingProjectId: null,
      gwp: '2',
      gwpName: 'IPCC AR6',
      locked: false,
      timeType: 0,
      timeTypeName: '',
    }));
