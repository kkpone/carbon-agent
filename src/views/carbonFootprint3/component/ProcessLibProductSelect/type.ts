/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-10 11:06:20
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-17 18:03:44
 */

export type ProcessProduct = {
  id: number;
  processId: number;
  processName: string;
  productName: string;
  type: number;
  accountYear: string;
  boundary: string;
  unitCode: number | string;
  unitName: string;
};

export type ProcessProductParams = Partial<
  Pick<ProcessProduct, 'processId' | 'processName' | 'productName' | 'type'>
>;

/**
 * @description: 弹框选择过程库
 */
export type ProcessLibSelectModalProps = {
  processLibId: number;
  processProductParams: ProcessProductParams;
  onCancel: () => void;
  onConfirm: (product: ProcessProduct) => void;
  isProcess?: boolean;
};
