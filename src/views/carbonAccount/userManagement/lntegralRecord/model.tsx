/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-12 16:09:02
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';

// import moment from 'moment';
import { CarbonAccountLntegralRecordTable } from './type';
import '../../index.less';

/** 判断数据精度问题 */
const backNumber = (number?: number) => {
  if (!number || number === 0) return 0;
  const newNumber = number / 1000;
  if (!`${newNumber}`.includes('.')) return newNumber;
  const backNum = Math.round(number * 10 ** 3) / 10 ** 6;
  return Number(backNum).toFixed(1);
};
/**
 * 表格的表头
 * @returns
 */
export const CarbonAccountLntegralRecordTableCol =
  (): ColumnsType<CarbonAccountLntegralRecordTable> => [
    {
      title: I18N.carbonAccount.userName,
      dataIndex: 'realName',
    },
    {
      title: I18N.carbonAccount.userId,
      dataIndex: 'thirdId',
    },
    {
      title: I18N.carbonAccount.sceneName,
      dataIndex: 'sceneName',
    },
    {
      title: I18N.carbonAccount.changeType,
      dataIndex: 'scoreType_name',
    },
    {
      title: I18N.carbonAccount.changeTime,
      dataIndex: 'changeTime',
    },
    {
      title: I18N.carbonAccount.changeTheNumberOfCarbonCoins,
      dataIndex: 'changeScore',
      render: (val: number, item: CarbonAccountLntegralRecordTable) =>
        (item.scoreType === 1 ? '+' : '') + val,
    },
    {
      title: I18N.carbonAccount.remainingCarbonCoins,
      dataIndex: 'score',
    },
    {
      title: I18N.carbonAccount.changeCarbonReductionAmount,
      dataIndex: 'changeCers',
    },
    {
      title: I18N.carbonAccount.remainingCarbonReduction,
      dataIndex: 'cers',
      render: (val: number) => (val ? backNumber(Number(val)) : '--'),
    },
  ];

/**
 * 用户列表的搜索
 */
export const carbonAccountLntegralRecordSearchForm =
  (): FromItemProps<any>[] => {
    // const endTime = moment();
    const data: FromItemProps<any>[] = [
      formItemInputSchema({
        placeholder: I18N.carbonAccount.userName,
        name: 'likeRealName',
      }),
      formItemInputSchema({
        placeholder: I18N.carbonAccount.userId,
        name: 'thirdId',
      }),
      formItemInputSchema({
        placeholder: I18N.carbonAccount.sceneName,
        name: 'likeSceneName',
      }),
      formItemInitType('dateRange', '', 'time', false, {
        props: {
          className: 'dateRange-box',
          showTime: true,
          // onCalendarChange(momentTime, time, target) {
          //   if (target.range === 'end') {
          //     // eslint-disable-next-line prefer-destructuring
          //     endTime = momentTime[1];
          //   }
          // },
          // disabledDate(current: any) {
          //   const startTime =
          //     new Date(moment(endTime).format('YYYY-MM-DD')).getTime() -
          //     365 * 24 * 60 * 60 * 1000;
          //   const curTimestamp = new Date(current).getTime();
          //   return (
          //     curTimestamp >=
          //       new Date(moment(endTime).format('YYYY-MM-DD')).getTime() +
          //         1 * 24 * 60 * 60 * 1000 || curTimestamp <= startTime
          //   );
          // },
        },
      }),
    ];
    return data.map(item => {
      const back = item;
      back.props = {
        ...back.props,
        style: { width: '200px' },
      };
      return back;
    });
  };
