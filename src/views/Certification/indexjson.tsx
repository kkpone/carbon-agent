import { AxiosPromise } from 'axios';

export interface SaerchFrom {
  label: string;
  name: string;
  hml: JSX.Element;
}

export interface SearchTableListPage {
  page: number;
  size: number;
}

export interface AuthProduct {
  label: string;
  text: string;
  value: string;
}
// 列表单条数据

interface AuthStatus {
  platform: string;
  projectId: string;
  companyId: string | null;
  userName: string;
  type: string;
  operatingFlag: string;
  status: string;
  userId: string;
}
export type AuthData<T> = AxiosPromise<{
  total: number;
  rows: T;
}>;
export interface AuthIndex {
  itemlist: Itemlist;
  recoedList: RecoedList;
  authSubStatus: AuthStatus;
}
interface Itemlist {
  EnterpriseFlag: string;
  flag: string;
  label: string;
  text: string;
  url: boolean;
  value: string;
}

interface RecoedList {
  projectId: number;
  projectIdentify: string;
  organizationName: string;
  createTime: Date;
  projectName: string;
  identifyServe: string;
  principal: string;
  responsibility: string;
  method: string;
  cycleDate: Date;
  coveredArea: string;
  building: string;
  employee: string;
  purpose: string;
  expenses: number;
  actualExpenses: number;
  type: number;
  operatingType: number;
  organizationId: number;
  status: number;
  orderId: number;
  userId: number;
  userName: string;
  companyId: number;
  companyName: string;
  delflag: number;
  industryType: string;
  emission: string;
}
