import { ValueOf } from 'type-fest';

import { PAY_STATUS, SKU_LIMIT } from './constant';

type Price = {
  goodsId: string;
  id: number;
  priceId: number;
  priceType: string;
  realPrice: number;
  standPrice: number;
  value: number;
};

type Sku = {
  id: number;
  goodsId: string;
  skuCount: null | number;
  skuLabel: string;
  skuLimit: ValueOf<typeof SKU_LIMIT>;
  skuType: string;
};

export type Goods = {
  id: number;
  goodsId: string;
  goodsName: string;
  goodsInfo: string;
  priceList: Price[];
};

export type GoodsDetails = Goods & {
  skuList: Sku[];
};

export type OrderDetails = {
  id: number;
  companyName: string;
  orderId: string;
  createTime: string;
  payTime: string;
  codeUrl: string;
  status: ValueOf<typeof PAY_STATUS>;
  orderGoods: {
    goodsId: string;
    goodsName: string;
    goodsInfo: string;
    priceObj: Price;
    skuList: Sku[];
  }[];
};

export type OrderPayStatus = {
  desc: string;
  orderId: string;
  status: ValueOf<typeof PAY_STATUS>;
  trade_state: string;
};
