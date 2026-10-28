/** 供应链图片地址 */
const beseImgurl = `${process.env.REACT_APP_API_URL_OSS}/saas-supplychain/`;
/** 供应链介绍页顶部方块图标  */
export const purchasImg1 = `${beseImgurl}introduce-svg/05.svg`;
/** 供应链介绍页顶部半圆图片  */
export const purchasImg2 = `${beseImgurl}introduce-svg/06.svg`;
/** 供应链介绍页顶部右侧图片  */
export const purchasImg3 = `${beseImgurl}introduce-svg/01.svg`;
/** 供应链介绍页顶部右侧图片-采购商货品管理  */
export const purchasImg4 = `${beseImgurl}introduce-svg/04.svg`;
/** 供应链介绍页顶部右侧图片-采购商多样化填报  */
export const purchasImg5 = `${beseImgurl}introduce-svg/02.svg`;
/** 供应链介绍页顶部右侧图片-供应商  */
export const purchasImg6 = `${beseImgurl}introduce-svg/03.svg`;

/** 存在缓存里的key以及拼接在URL的参数 */
export enum InviteSearch {
  /** 邀请链接id 为了通过id查信息  */
  COMID = 'comation',
}
