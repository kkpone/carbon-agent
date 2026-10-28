export type FactorUsageRecor = {
  //	是	组织ID
  companyId: string;
  //	是	组织名称
  companyName: string;
  //	是	因子id
  factorId: string | number;
  //	是	因子名称
  factorName: string | number;
  //	是	1 因子库因子 2 组织因子
  factorSource: string | number;
};
