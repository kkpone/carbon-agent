/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-02 13:02:27
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-13 11:50:23
 */

export type EmissionSource = {
  id: number;
  accountId: number;
  name: string;
  typeName: string;
  stage: number;
  type: number;
  emissionTotal: string;
  status: number;
  libState: number;
  matchWay: number;
  requestState: number;
  matchObject: Record<string, any>;
};

export type AccountLifeCycle = {
  code: number;
  name: string;
  total: string;
  typeName: string;
  emissionList: EmissionSource[];
  children?: AccountLifeCycle[];
};

export type ProcessEveryList = {
  matchType: number;
  id: string;
  dataId: number;
  processId: number;
  name: string;
  type: number;
  typeName: string;
  emissionTotal: string;
  parentId: string;
  processType: null;
  status: number;
  orderNum: number;
  hasChild: number;
  children: ProcessEveryList[];
};
