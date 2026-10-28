/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-15 11:13:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-15 14:16:01
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';

import { radios } from './datas';

export const activityDataColumns = (): ColumnsType<any> => [
  {
    dataIndex: 'quality',
    title: I18N.carbonFootprint3.qualityLevel,
    width: 100,
  },
  {
    dataIndex: 'discirbe',
    title: I18N.carbonFootprint.describe,
  },
  {
    dataIndex: 'num',
    width: 72,
    title: I18N.carbonFootprint3.score,
  },
];

export const factorColumns = (type?: keyof typeof radios): ColumnsType<any> => {
  let data: ColumnsType<any> = [];
  if (type === 'time')
    data = [
      {
        dataIndex: 'time',
        title: I18N.carbonFootprint3.timeCorrelation,
      },
    ];
  if (type === 'position')
    data = [
      {
        dataIndex: 'time',
        title: I18N.carbonFootprint3.regionalRelevance,
      },
    ];
  if (type === 'tech')
    data = [
      {
        dataIndex: 'time',
        title: I18N.carbonFootprint3.technicalRelevance,
      },
    ];
  if (type === 'data')
    data = [
      {
        dataIndex: 'time',
        title: I18N.carbonFootprint3.dataAccuracy,
      },
    ];
  if (type === 'method')
    data = [
      {
        dataIndex: 'time',
        title: I18N.carbonFootprint3.methodologySuitability,
      },
    ];
  return [
    ...data,
    {
      dataIndex: 'num',
      width: 72,
      title: I18N.carbonFootprint3.score,
    },
  ];
};
