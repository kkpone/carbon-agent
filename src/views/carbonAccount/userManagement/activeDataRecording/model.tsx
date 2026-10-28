/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-12 16:07:55
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { Image } from 'antd';
import { ColumnsType } from 'antd/es/table';

// import moment from 'moment';
import { CarbonAccountActiveDataTable } from './type';
import { organizationFormItems } from '../../awardConversion/awardList/model';
import { Organizations } from '../../baseSetting/utils/types';

/** 活动数据状态 */
const behaviorStatus = {
  0: I18N.carbonAccount.unremoved,
  1: I18N.carbonAccount.rescinded,
};
/**
 * 表格的表头  活动数据记录
 * @returns
 */
export const carbonAccountActiveDataTableCol = (
  activeSceneUnit?: { label: string; value: string }[],
  activePeriodType?: { label: string; value: number }[],
  organizations?: Organizations[],
): ColumnsType<CarbonAccountActiveDataTable> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
    fixed: 'left',
  },
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
    title: I18N.carbonAccount.sceneType,
    dataIndex: 'sceneType',
    render: (val: number) => {
      const arr = [
        I18N.carbonAccount.default,
        I18N.carbonAccount.smallTasks,
        I18N.carbonFootprint.custom,
      ];
      return arr[val];
    },
  },
  {
    title: I18N.carbonAccount.activityCycle,
    dataIndex: 'periodType',
    render: (val: number) => {
      const find = activePeriodType?.find(back => back.value === val);
      return find
        ? find.label
        : I18N.template(I18N.carbonAccount.unknownNumberV, { val1: val });
    },
  },
  {
    title: I18N.carbonAccount.activityUnit,
    dataIndex: 'sceneUnit',
    render: (val: string) => {
      const find = activeSceneUnit?.find(back => back.value === val);
      return find
        ? find.label
        : I18N.template(I18N.carbonAccount.unknownNumberV, { val1: val });
    },
  },
  {
    title: I18N.carbonAccount.groupToWhichItBelongs,
    dataIndex: 'orgId',
    render(id) {
      return organizations?.find(org => org.id === +id)?.orgName || '-';
    },
  },
  {
    title: I18N.carbonAccount.picture,
    dataIndex: 'checkUrl',
    render(txt) {
      return txt?.length ? <Image src={txt[0]} height='100px' /> : '-';
    },
  },
  {
    title: I18N.carbonFootprint3.activityData,
    dataIndex: 'changeValue',
  },

  {
    title: I18N.carbonAccount.completionTime,
    dataIndex: 'createTime',
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'behaviorStatus',
    render: (val: number) => (
      <span style={{ color: val === 1 ? '#ED5555' : '' }}>
        {behaviorStatus[val]}
      </span>
    ),
  },
];

/**
 * 活动数据的搜索
 */
export const carbonAccountActiveDataSearchForm = ({
  organizations,
}: {
  organizations: Organizations[];
}): FromItemProps<any>[] => {
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
    organizationFormItems({
      organizations,
      placeholder: I18N.carbonAccount.groupToWhichItBelongs,
    }),
    formItemInitType('select', '', 'behaviorStatus', false, {
      props: {
        options: Object.keys(behaviorStatus).map(value => ({
          value,
          label: behaviorStatus[value],
        })),
        placeholder: I18N.carbonFootprint.state,
      },
    }),
    formItemInitType('dateRange', '', 'time', false, {
      props: {
        className: 'dateRange-box',
        showTime: true,
        allowClear: false,
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
