/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-12 14:21:36
 * @Date: 2023-02-22 16:15:46
 * @@description: 过程核算 - 产品、输入、输出
 */
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import ProcessLibInOutTab from '@src/views/carbonFootprint3/discharge/process/details/ProcessLibInOutTab';
import { Key, VFC } from 'react';

import { ProcessBusinessAccountingMenu } from '../../type';

type ProcessLibInOutProps = {
  id: number;
  name: string;
  isEdit: boolean;
  apiExtraParams?: ApiExtraParams;
  selectKey?: Key[];
  expandedKeys?: Key[];
  isProcessBusinessAccount?: boolean;
  isProcess?: boolean;
  processTreeInfo?: ProcessBusinessAccountingMenu;
  parentProcessNodeInfo?: ProcessBusinessAccountingMenu;
  updateTreeNode?: (info: ProcessBusinessAccountingMenu) => void;
  isOnlyDetail?: boolean;
  // 产看详情页面 - 包含有操作的查看
  isHaveSetDetil?: boolean;
  /** 因子选用评价卡片；默认展示，可由上层关闭 */
  showFactorEvaluationCard?: boolean;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
};

const ProcessAccountInOutTab: VFC<ProcessLibInOutProps> = props => (
  <div>
    <ProcessLibInOutTab {...props} isProcessBusinessAccount />
  </div>
);

export default ProcessAccountInOutTab;
