import { request } from '@/api/request';
import { AppendixItem } from '@/components/Appendix/ShowList';

/**
 * 描述单个参考文件的类型
 * 包含文件名称和对应的URL地址
 */
type ESGReportReferFile = {
  name: string;
  url: string;
};

/**
 * 描述ESG报告相关数据的类型
 * 涵盖报告的各种属性、用户内容、AI生成内容、参考资源等信息
 */
export type ESGReportData = {
  id: number;
  /**
   * 用户输入的公司名称和要生成报告的年份等内容，格式为：
   * 用户公司名称：碳阻迹公司
   * 用户要生成的报告年份：2020
   * 用户要参考的ESG指标库数据：
   * 以下是报告对应的指标数据：
   * 指标名称：定量 - 单体单位
   * 数据项名称：百分比单位
   * 数据内容：2020年 1%
   * 指标名称：定量 - 单体单位
   * 数据项名称：单体单位
   * 数据内容：2020年 1英里
   * 指标名称：定量 - 单体单位
   * 数据项名称：复合单位
   * 数据内容：2020年 1t/km
   * 指标名称：社会指标一
   * 数据项名称：数值
   */
  userContent: string;
  /**
   * AI根据用户提供的信息和参考文件生成的对“ESG战略与管理体系”部分润色后的内容
   */
  aiContent: string;
  topicId: number;
  likeStatus: number;
  createTime: string;
  jsonList: null;
  referFiles: ESGReportReferFile[];
  referLink: string[];
  referText: string[];
  referContent: string;
};

/** 文件类型 1 图片 2 文件 3 链接 4 文字 */
export enum DataType {
  picture = '1',
  file = '2',
  link = '3',
  text = '4',
}

export const getDatabaseList = (params: { reportId: string; type: DataType }) =>
  request<{
    data: {
      url: string;
      name: string;
      createBy: string;
      createTime: string;
      label: string;
      id: number;
    }[];
  }>({
    method: 'get',
    url: '/esg/frameReport/databaseList',
    params,
  });

export const delDataItem = (params: { id: number }) =>
  request<{
    data: {
      url: string;
      name: string;
      createBy: string;
      createTime: string;
      label: string;
      id: number;
    }[];
  }>({
    method: 'delete',
    url: `/esg/frameReport/esgDataDel/${params.id}`,
  });

export const PostEsgDataUploadImages = (data: {
  reportId: number;
  imgUrl: string;
  imgName: string;
}) =>
  request<{
    data: {
      url: string;
      name: string;
      createBy: string;
      createTime: string;
      label: string;
      id: number;
    }[];
  }>({
    method: 'post',
    url: `/esg/frameReport/esgDataUploadImages`,
    data,
  });
