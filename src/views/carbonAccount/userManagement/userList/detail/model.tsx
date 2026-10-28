/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-11-24 20:55:15
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';

import { CarbonAccountUserListFindUserTable, FindUserDetail } from './type';
import { ApiGetUserListItem } from '../type';

/**
 * 表格的表头
 * @returns
 */
export const findUserTableItem =
  (): ColumnsType<CarbonAccountUserListFindUserTable> => [
    {
      title: I18N.carbonAccount.sceneName,
      dataIndex: 'sceneName',
    },
    {
      title: I18N.carbonAccount.changeType,
      dataIndex: 'scoreType',
      render: (val: 1 | 2) => (val === 1 ? I18N.carbonAccount.activityAcquisition : I18N.carbonAccount.exchangeConsumption),
    },
    {
      title: I18N.carbonAccount.changeTime,
      dataIndex: 'changeTime',
    },
    {
      title: I18N.carbonAccount.changeCarbonCoin,
      dataIndex: 'changeScore',
      render: (val: number, item: CarbonAccountUserListFindUserTable) =>
        (item.scoreType === 1 ? '+' : '') + val,
    },
    {
      title: I18N.carbonAccount.carbonReductionAmountGC,
      dataIndex: 'changeCers',
    },
  ];
const status = {
  '0': I18N.carbonAccount.normal,
  '-1': I18N.carbonAccount.blacklist,
  '1': I18N.carbonFootprint3.pendingReview,
  '2': I18N.carbonFootprint3.reviewFailed2,
  '3': I18N.carbonAccount.toBeAdded,
};
export const findUserDeatilData = (
  data?: ApiGetUserListItem,
): FindUserDetail[] => [
  {
    label: I18N.carbonAccount.userId,
    value: data?.thirdId || I18N.DomesticVersion.nothing,
  },
  {
    label: I18N.carbonAccount.userName,
    value: data?.realName || I18N.DomesticVersion.nothing,
  },
  {
    label: I18N.dashborad.mobilePhoneNumber,
    value: data?.mobile || I18N.DomesticVersion.nothing,
  },
  {
    label: I18N.carbonAccount.employeeId,
    value: data?.jobNumber || I18N.DomesticVersion.nothing,
  },
  {
    label: I18N.carbonAccount.groupToWhichItBelongs,
    value: data?.orgName || I18N.DomesticVersion.nothing,
  },
  {
    label: I18N.carbonAccount.userAccountStatus,
    value: status[data?.userStatus || '0'],
  },
  {
    label: I18N.carbonAccount.accumulatedCarbonCoins,
    value: data?.totalScore || I18N.DomesticVersion.nothing,
  },
  {
    label: I18N.carbonAccount.existingCarbonCoins,
    value: data?.currScore || I18N.DomesticVersion.nothing,
  },
];
