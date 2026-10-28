/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-28 16:05:58
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-06 18:24:35
 */

import I18N from '@src/lang/I18N';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import '../style.less';
import { ReactNode } from 'react';

import styles from './index.module.less';

/** 活动数据类别 字典项 */
export const activityCategorys = [
  {
    value: '6',
    label: I18N.enterpriseCarbonAccount2.automaticContinuousMeasurement,
  },
  { value: '3', label: I18N.enterpriseCarbonAccount2.regularMeasurement },
  { value: '1', label: I18N.enterpriseCarbonAccount2.selfEstimation },
];

/** 搜索因子时 存储在sessionStorage 中的 因子单位 的key */
export const searchKeyInSessionStorage = 'SearchFactor-factorUnitM';

export const titleTip = (
  title: string,
  tip?: string,
  tipIcon?: ReactNode,
  subTitle?: string,
) => (
  <div className='display-in-block'>
    <div className='flex-a-c'>
      <span> {title}</span>
      <span className={styles.subTitle}> {subTitle}</span>
      {tip ? (
        <div className='margin-l-4'>
          <Tooltip placement='top' title={tip}>
            {tipIcon || <InfoCircleOutlined className='cur-p color-B5B8BB' />}
          </Tooltip>
        </div>
      ) : (
        ''
      )}
    </div>
  </div>
);
