/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-27 16:34:40
 */
import I18N from '@src/lang/I18N';
import { listALLByDictTypeBatch } from '@src/api/api';
import {
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import { Tags } from '@src/components/UI/Tags';
import { UserFeedbackDto } from '@src/sdks/java/carbonAccount';
import { Dicts } from '@src/views/emission/Show/type';
import { Image } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

export const useCarbonFootprintProductType = () => {
  const [productType, setProductType] = useState<Dicts[]>([]);
  useEffect(() => {
    listALLByDictTypeBatch({ dictTypes: 'Carbon_Footprint' }).then(
      ({ data }) => {
        setProductType(data?.data?.Carbon_Footprint || []);
      },
    );
  }, []);
  return [productType];
};

/** 优先级  1, 低 2 中 3 高*/
export const levels = () => ({
  1: I18N.carbonAccount.low,
  2: I18N.carbonAccount.in,
  3: I18N.carbonAccount.high,
});

/** 优先级参数 */
const levelsProps = {
  '1': { color: 'orange', tagText: levels()[1] },
  '2': { color: 'green', tagText: levels()[2] },
  '3': { color: 'red', tagText: levels()[3] },
};

/** 状态 */
export const status = () => ({
  0: I18N.carbonAccount.pendingResolution,
  1: I18N.carbonAccount.resolved,
});
/** 优先级参数 */
const statusProps = {
  '0': { color: 'red', tagText: status()[0] },
  '1': { color: 'green', tagText: status()[1] },
};
/** 反馈列表 */
export const feedbackColumns = (): ColumnsType<UserFeedbackDto> => [
  {
    dataIndex: 'index',
    title: I18N.carbonFootprint.number,
    width: 90,
  },
  {
    dataIndex: 'realName',
    title: I18N.carbonAccount.userName,
  },
  {
    dataIndex: 'mobile',
    title: I18N.dashborad.mobilePhoneNumber,
  },
  {
    dataIndex: 'content',
    title: I18N.components.feedbackContent,
  },
  {
    dataIndex: 'createTime',
    width: 200,
    title: I18N.carbonAccount.feedbackTime,
  },
  {
    dataIndex: 'imgUrl',
    title: I18N.carbonAccount.picture,
    render(url) {
      return url ? <Image src={url} height={40} /> : '-';
    },
  },
  {
    dataIndex: 'feedbackLevel',
    title: I18N.carbonAccount.priority,
    render(str) {
      const lev = levelsProps[str];
      return lev ? <Tags {...lev} /> : '-';
    },
  },
  {
    dataIndex: 'feedbackStatus',
    title: I18N.carbonFootprint.state,
    render(str) {
      const lev = statusProps[str];
      return lev ? <Tags {...lev} /> : '-';
    },
  },
];

export enum FeedBackKeys {
  'mobile' = 'mobile',
  'feedbackLevel' = 'feedbackLevel',
  'feedbackStatus' = 'feedbackStatus',
  'dateRange' = 'dateRange',
}

/** 反馈搜索 */
export const feedbackSearch = () => [
  formItemInputSchema({
    name: FeedBackKeys.mobile,
    props: {
      placeholder: I18N.dashborad.mobilePhoneNumber,
      maxLength: 11,
    },
  }),
  formItemInitType('select', '', FeedBackKeys.feedbackLevel, false, {
    props: {
      placeholder: I18N.carbonAccount.priority,
      options: Object.keys(levels()).map(k => ({
        value: k,
        label: levels()[k],
      })),
    },
  }),
  formItemInitType('select', '', FeedBackKeys.feedbackStatus, false, {
    props: {
      placeholder: I18N.carbonFootprint.state,
      options: Object.keys(status()).map(k => ({
        value: k,
        label: status()[k],
      })),
    },
  }),
  formItemInitType('dateRange', '', FeedBackKeys.dateRange, false, {
    props: {
      // format: 'YYYY-MM-DD',
    },
  }),
];

export enum ShowType {
  'show' = 'show',
  'edit' = 'edit',
}
