import { request } from '@src/api/request';
import {
  CarbonAccountAwardListInOrOut,
  CarbonAccountAwardListTable,
} from './type';

// 奖励兑换的列表

// 奖励兑换的上架、下架
export function ApicarbonAwardListListGoodsUpdateStatus(
  data: Pick<CarbonAccountAwardListTable, 'id' | 'goodsStatus'>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/goods/updateStatus`,
    data,
  });
}

// 奖励兑换的上入库
export function ApicarbonAwardListListInStock(
  data: CarbonAccountAwardListInOrOut,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/goods/inStock`,
    data,
  });
}
// 奖励兑换出库
export function ApicarbonAwardListListOutStock(
  data: CarbonAccountAwardListInOrOut,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/goods/outStock`,
    data,
  });
}
