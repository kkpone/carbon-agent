/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-12-12 11:54:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-26 15:59:26
 */
import { FetchPage } from '@src/components/TableUtil/types/util';

/** 获取列表的接口返回 */
export interface ApiGetInventoryRecord {
  code: number;
  msg: string;
  data: {
    rows: CarbonAccountInventoryRecordTable[];
    total: number;
  };
}

/** 碳账户-用户列表-表格列表默认显示数据 */
export interface CarbonAccountInventoryRecordTable {
  id: number; // 场景id
  companyId: number; // 组织id
  goodsId: number; // 商品id
  goodsName: string; // 商品名称
  changeType: 1 | 2 | 3; // 变更类型：1入库，2出库，3商品兑换
  changeCount: number; // 变更数量
  amount: number; // 库存数量
  orderNo: string;
  createBy: string; // 变更人
  createTime: string; // 变更时间
  updateTime: string;
}

/** 兑换记录列表接口的参数 */
export interface CarbonAccountInventoryRecordTableGetParams extends FetchPage {
  goodsName?: string; // 奖品名称
  createBy?: string; // 变更人
  changeType?: 1 | 2 | 3; // 变更类型
  likeRealName?: string;
  likeSceneName?: string;
  // begTime?: string;
  // endTime?: string;
}
