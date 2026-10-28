/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-12 16:09:22
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import { Tags } from '@src/components/UI/Tags';
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';

// import moment from 'moment';
import { CarbonAccountConversionRecordTable } from './type';

/**
 * 兑换记录表格的表头
 * @returns
 */
export const carbonAccountConversionRecordTableCol =
  (): ColumnsType<CarbonAccountConversionRecordTable> => [
    {
      title: I18N.carbonNeutral.orderNumber,
      dataIndex: 'orderNo',
    },
    {
      title: I18N.carbonAccount.exchangePerson2,
      dataIndex: 'realName',
    },
    {
      title: I18N.dashborad.mobilePhoneNumber,
      dataIndex: 'mobile',
    },
    {
      title: I18N.carbonAccount.consumptionOfCarbonCoins2,
      dataIndex: 'payScore',
    },
    {
      title: I18N.carbonNeutral.productName,
      dataIndex: 'goodsName',
    },
    {
      title: I18N.carbonAccount.redemptionTime2,
      dataIndex: 'createTime',
    },
    {
      title: I18N.carbonAccount.redemptionStatus2,
      dataIndex: 'orderStatus',
      render: (val: number) => (
        <div>
          {val === 0 ? (
            <Tags
              tagText={I18N.carbonAccount.notRedeemed}
              color='default'
              kind='raduis'
            />
          ) : (
            <Tags
              tagText={I18N.carbonAccount.redeemed}
              color='blue'
              kind='raduis'
            />
          )}
        </div>
      ),
    },
  ];

/**
 * 兑换记录
 */
export const carbonAccountConversionRecordSearchForm =
  (): FromItemProps<any>[] => {
    // const endTime = moment();
    const data: FromItemProps<any>[] = [
      formItemInputSchema({
        placeholder: I18N.carbonAccount.exchangePerson2,
        name: 'realName',
      }),
      {
        ...formItemInitType('select', '', 'orderStatus', true),
        props: {
          placeholder: I18N.carbonAccount.redemptionStatus2,
          options: [
            {
              label: I18N.carbonAccount.notRedeemed,
              value: 0,
            },
            {
              label: I18N.carbonAccount.redeemed,
              value: 1,
            },
          ],
        },
      },
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
