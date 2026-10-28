import { FetchPage } from '@src/components/TableUtil/types/util';

/** 获取列表的接口返回 */
export interface ApiGetConversionRecord {
  code: number;
  msg: string;
  data: {
    rows: CarbonAccountConversionRecordTable[];
    total: number;
  };
}

/** 获取列表详情的接口返回 */
export interface ApiGetConversionRecordInfo {
  code: number;
  msg: string;
  data: CarbonAccountConversionRecordTable;
}

/** 碳账户-奖励兑换-兑换记录-表格列表默认显示数据 */
export interface CarbonAccountConversionRecordTable {
  id: number;
  orderNo: string;
  companyId: number;
  type: string;
  payScore: number;
  orderFrom: string;
  userId: number;
  realName: string;
  mobile: string;
  goodsCount: number;
  orderStatus: number;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  remark: string;
  delFlag: number;
  pn: string;
  ordersDetails?: CarbonAccountConversionRecordTableInfo[];
}

/** 兑换记录列表接口的参数 */
export interface CarbonAccountConversionRecordTableGetParams extends FetchPage {
  realName?: string; // 兑换用户名称
  orderStatus?: 0 | 1; // 0 未兑换 1 已兑换
  begTime: string;
  endTime: string;
}

/** 兑换的详情 */
interface CarbonAccountConversionRecordTableInfo {
  id: number;
  orderNo: string; // 订单号
  goodsId: number; // 商品id
  goodsName: string; // 商品名称
  payScore: number; // 消耗碳币
  createBy: number; // 变更人
  createTime: string; // 变更时间
  buyCount: number; // 数量
}
