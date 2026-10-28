import I18N from '@src/lang/I18N';
import { request } from '@api/request';

// 新增活动

// 新增活动
// 活动详情

// 新增碳核算

// 编辑碳核算

// 碳核算数据管理详情

// 模型列表-新增碳核算时

// 编辑初始化
// 保存碳核算数据

// 数据统计
// 地址树

// 新增碳核算报告

// 编辑碳核算报告

// 碳核算报告详情
// 生成碳核算报告
// 建筑行业相关接口

/**
 * 缺省值
 *
 */
export function apiComputationDefaultValue(params: { key: string }) {
  return request<{
    code: number;
    msg: string;
    data: string;
    total: number;
  }>({
    method: 'get',
    url: `/architectureComputation/computation/default/value`,
    params,
  });
}

/**
 *获取商品列表
 *
 * @export
 * @param {*} data
 * @return {*}
 */
const goodObj = {
  amount: 1000,
  createBy: 'admin',
  createTime: '2022-04-19 15:31:25',
  delFlag: '0',
  detailImgs: null,
  goodsId: 19,
  goodsImgs: null,
  goodsName: I18N.carbonNeutral.testEditing,
  imgPath:
    '[{"name":"893749283.jpg","uid":"__AUTO__1650352727568_0__","url":"http://factor-file-dev.carbonstop.net/factor/893749283.jpg"}]',
  info: '100',
  itemAmount: 12,
  itemInfo: '12',
  itemName: '1212',
  itemPrice: 98989,
  itemRemark: '8585',
  orderNum: 0,
  price: 0.01,
  remark: '5656',
  status: '1',
  type: 'CCER',
  updateBy: 'admin',
  updateTime: '2022-04-19 15:31:25',
  realAmount: '',
};
export type GoogType = typeof goodObj;
/**
 *获取商品列表
 * @export
 * @param {{ page: string; size: string }} params
 * @return {*}
 */
export function apiGoodList(params: { page: string; size: string }) {
  return request<{
    code: number;
    msg: string;
    data: { rows: GoogType[]; total: string };
    total: number;
  }>({
    method: 'get',
    url: `/neutral/goods/goodsList`,
    params,
  });
}
/**
 *获取购买金额
 * @export
 * @param {{ goodsId: number; buyAmount: number }} data
 * @return {*}
 */
export function apiGetTotalMoney(data: { goodsId: number; buyAmount: number }) {
  return request<{
    code: number;
    msg: string;
    data: string;
    total: number;
  }>({
    method: 'post',
    url: `/neutral/orders/getTotalMoney`,
    data,
  });
}
const payObj = {
  payMoney: 0.01,

  orderId: 'TZH20220420225666',

  code_url: 'weixin://wxpay/bizpayurl?pr=DiXKv8uzz',
};
export type PayObjType = typeof payObj;
/**
 * 生成支付接口
 * @param data
 */
export function apiOderSubmit(data: {
  goodsId: number;
  buyAmount: number;
  channel: string;
}) {
  return request<{
    code: number;
    msg: string;
    data: PayObjType;
    total: number;
  }>({
    method: 'post',
    url: `/neutral/orders/submit`,
    data,
  });
}
/**
 * 完成支付查询
 * @param params oriderId
 */
const payResultObj = {
  trade_state: 'SUCCESS',

  orderId: 'TZH20220421757850',

  status: '1',

  desc: I18N.carbonNeutral.paymentSuccessful2,
};
export type PayResultObjType = typeof payResultObj;
export function apiOrdersPayQuery(params: { orderId: string }) {
  return request<{
    code: number;
    msg: string;
    data: PayResultObjType;
    total: number;
  }>({
    method: 'get',
    url: `/neutral/orders/payQuery`,
    params,
  });
}

const recordObj = {
  id: 10,

  orderId: 'TZH20220419330296',

  companyId: 1000000719543740,

  companyName: 'jerry.rodriguez',

  companyNum: '99999',

  goodsId: 1,

  goodsName: I18N.carbonNeutral.productCce,

  payMoney: 1,

  buyAmount: 1,

  payWay: '1',

  payTime: null,

  channel: '4i1ms4',

  orderFrom: 'rgrssl',

  proofFlag: '0',

  testFlag: '0',

  userName: '18510103631',

  payImgPath: 'http://factor-file-dev.carbonstop.net/factor/893749283.jpg',

  certNum: 'hoe6ya',

  certImgPath: '5evlju',

  orderNum: 0,

  status: '1',

  createBy: '',

  createTime: '2022-04-19 16:58:06',

  updateBy: 'admin',

  updateTime: '2022-04-19 17:54:45',

  remark: '',

  delFlag: '0',

  payImgs: null,

  proofImgs: null,
  type: '',
};
export type RrecordObj = typeof recordObj;
export function apiOrdersRecords(params: { page: number; size: number }) {
  return request<{
    code: number;
    msg: string;
    data: { rows: RrecordObj[]; total: string };
    total: number;
  }>({
    method: 'get',
    url: `/neutral/orders/records`,
    params,
  });
}

interface OrderType {
  page: number;
  size: number;
}

/** 订单管理列表 */
export function ApiOrdersRecords(params: OrderType) {
  return request({
    method: 'GET',
    url: `/neutral/orders/buyRecords`,
    params,
  });
}
/** 订单管理详情 */
export function ApiOrdersInfo(params: { id: string | number }) {
  return request({
    method: 'GET',
    url: `/neutral/orders/orderInfo`,
    params,
  });
}
