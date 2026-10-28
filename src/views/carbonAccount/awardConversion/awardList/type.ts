import { FetchPage } from '@src/components/TableUtil/types/util';

/** 获取列表的接口返回 */
export interface ApiGetAwardList {
  code: number;
  msg: string;
  data: {
    rows: CarbonAccountAwardListTable[];
    total: number;
  };
}

/** 碳账户-奖励兑换-表格列表默认显示数据 */
export interface CarbonAccountAwardListTable {
  id: number; // 场景id
  goodsName: string; // 商品名称
  companyId: number; // 组织id
  saleAmount: null; // 已兑数量
  amount: number; // 剩余库存
  score: string; // 消耗积分
  limitFlag: 0 | 1; // 兑换数量：0不限 1限制
  countLimit: number; // 数量限制
  imgPath: string; // 商品缩略图地址
  orderNum: number; // 排序
  goodsStatus: 0 | 1; // 0未上架 1上架
  createTime: string; // 时间
}

/** 跳转场景详情的路由携带参数 */
export interface AwardListDetailLoaction {
  status: 'add' | 'edit'; // 只有新增或者编辑两种场景
  id?: number; // 列表id
}

/** 奖励兑换接口 -- 参数*/
interface CarbonAccountAwardListTableGetParams extends FetchPage {
  goodsName?: string; // 奖励兑换
  goodsStatus?: 0 | 1; // 状态
}

/** 商品的出库入库 */
export interface CarbonAccountAwardListInOrOut {
  goodsId: number; // 商品id
  amount: number; // 数量
}

export type GoodsSearchParams = Pick<
  CarbonAccountAwardListTableGetParams,
  'goodsName' | 'goodsStatus'
> & { orgIds?: string[] };
