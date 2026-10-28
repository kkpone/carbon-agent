import { ProductAccountingList } from '@/views/carbonFootprint3/FootprintAccount/component/ProductSelectAccount/type';

/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-15 10:05:22
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-15 11:00:40
 */
export interface Options {
  regionType: DataType[];
  dataType: DataType[];
  technologyType: DataType[];
  timeType: DataType[];
  reportStage: DataType[];
  methodologyType: DataType[];
  activityType: DataType[];
}

export interface DataType {
  code: number;
  name: string;
}

export type FormSubReportAccountList = {
  productName: number;
  accountName: number;
  accountInfoList: ProductAccountingList[];
  specification: string;
  periodTime: string;
};
