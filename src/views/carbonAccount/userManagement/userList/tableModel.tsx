/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-22 18:13:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-01 20:52:20
 */
import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import { Tags } from '@src/components/UI/Tags';
import { User } from '@src/sdks/java/carbonAccount';
import { checkSubmit } from '@src/utils';
import { ColumnsType } from 'antd/es/table';

import { organizationFormItems } from '../../awardConversion/awardList/model';
import { Organizations } from '../../baseSetting/utils/types';

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
const status = {
  '0': () => (
    <Tags tagText={I18N.carbonAccount.normal} color='blue' kind='raduis' />
  ),
  '-1': () => (
    <Tags tagText={I18N.carbonAccount.blacklist} color='red' kind='raduis' />
  ),
  '1': () => (
    <Tags
      tagText={I18N.carbonFootprint3.pendingReview}
      color='orange'
      kind='raduis'
    />
  ),
  '2': () => (
    <Tags
      tagText={I18N.carbonFootprint3.reviewFailed2}
      color='red'
      kind='raduis'
    />
  ),
  '3': () => (
    <Tags
      tagText={I18N.carbonAccount.toBeAdded}
      color='default'
      kind='raduis'
    />
  ),
};
export const carbonAccountUserLitsTableCol = (): ColumnsType<User> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
    width: 70,
    fixed: 'left',
  },
  {
    title: I18N.carbonAccount.userId,
    dataIndex: 'thirdId',
    width: 150,
  },
  {
    title: I18N.carbonAccount.userName,
    dataIndex: 'realName',
    width: 150,
  },
  {
    title: I18N.carbonAccount.groupToWhichItBelongs,
    dataIndex: 'orgName',
    width: 120,
  },
  {
    title: I18N.dashborad.mobilePhoneNumber,
    dataIndex: 'mobile',
    width: 130,
  },
  {
    title: I18N.carbonAccount.employeeId,
    dataIndex: 'jobNumber',
    width: 130,
  },
  {
    title: I18N.carbonAccount.existingCarbonCoins,
    dataIndex: 'currScore',
    width: 120,
    sorter: true,
  },
  {
    title: I18N.carbonAccount.accumulatedCarbonCoins,
    dataIndex: 'totalScore',
    width: 120,
    sorter: true,
  },
  {
    title: I18N.carbonAccount.accumulatedCarbonReduction,
    dataIndex: 'totalReduction',
    render: (val: number) => backNumber(Number(val)),
    width: 200,
    sorter: true,
  },
  {
    title: I18N.carbonAccount.accountStatus,
    dataIndex: 'userStatus',
    render: (val: number) => <div>{status[val]() || '-'}</div>,
    width: 120,
  },
];
/**
 * 用户相关表单筛选项
 */
const userFormItems = ({
  organizations,
}: {
  organizations: Organizations[];
}) => [
  organizationFormItems({
    organizations,
    placeholder: I18N.carbonAccount.groupToWhichItBelongs,
  }),
  {
    ...formItemInitType('select', '', 'userStatus', false),
    props: {
      placeholder: I18N.carbonAccount.userStatus,
      options: [
        { label: I18N.carbonAccount.normal, value: 0 },
        { label: I18N.carbonAccount.blacklist, value: -1 },
        // { label: '待审核', value: 1 },
        // { label: '审核不通过', value: 2 },
        // { label: '待加入', value: 3 },
      ],
    },
  },
];
/**
 * 用户列表的搜索
 */
export const carbonAccountUserListSearchForm = ({
  organizations,
}: {
  organizations: Organizations[];
}): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    formItemInputSchema({
      placeholder: I18N.carbonAccount.userName,
      name: 'realName',
    }),
    formItemInputSchema({
      name: 'mobile',
      placeholder: I18N.dashborad.mobilePhoneNumber,
      props: { maxLength: 11 },
    }),
    formItemInputSchema({
      name: 'jobNumber',
      placeholder: I18N.carbonAccount.employeeId,
    }),
    ...userFormItems({ organizations }),
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

/**
 * 新增用户
 * @returns
 */
export const carbonAccountUserListAddUser = (
  isEdit: boolean,
  organizations: Organizations[],
): FromItemProps<any>[] => {
  const userId = {
    ...formItemInitInput(I18N.carbonAccount.userId, 'thirdId', !isEdit),
    rulesCustom: [
      () => ({
        validator(_: any, validatorVal: string) {
          if (!validatorVal) {
            return Promise.reject(new Error(I18N.carbonAccount.userIdRequired));
          }
          const regTel = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
          // const value = checkSubmit(validatorVal);

          if (validatorVal && regTel.test(validatorVal)) {
            return Promise.reject(
              new Error(I18N.carbonAccount.chineseCharactersAreNotSupported),
            );
          }
          if (validatorVal && validatorVal.length > 50) {
            return Promise.reject(
              new Error(I18N.carbonAccount.atMostYouCanOnlyInput),
            );
          }
          return Promise.resolve();
        },
      }),
    ],
    props: {
      disabled: isEdit,
      maxLength: 50,
    },
  };
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitInput(I18N.carbonAccount.userName, 'realName', true),
      props: {
        maxLength: 15,
      },
    },

    {
      ...formItemInitInput(I18N.dashborad.mobilePhoneNumber, 'mobile', false),
      rulesCustom: [
        () => ({
          validator(_: any, validatorVal: string) {
            const value = checkSubmit(validatorVal);

            if (validatorVal && !value) {
              return Promise.reject(
                new Error(I18N.carbonAccount.enterPhoneNumber),
              );
            }
            return Promise.resolve();
          },
        }),
      ],
    },

    {
      ...formItemInitInput(I18N.carbonAccount.employeeId, 'jobNumber', false),
    },

    {
      ...organizationFormItems({
        organizations,
        placeholder: I18N.carbonAccount.groupToWhichItBelongs,
        label: I18N.carbonAccount.groupToWhichItBelongs,
        name: 'orgId',
        props: {
          treeCheckable: false,
        },
      }),
      rules: true,
      // rulesCustom: [
      //   () => ({
      //     validator(_, value: string) {
      //       if (!value) {
      //         return Promise.reject(new Error('请选择所属分组'));
      //       }
      //       return Promise.resolve();
      //     },
      //   }),
      // ],
    },
  ];
  isEdit && data?.unshift(userId);

  return data.map(item => {
    const back = item;
    back.col = 24;
    return back;
  });
};
