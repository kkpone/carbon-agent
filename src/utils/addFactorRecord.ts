/*
 * @@description: 因子白盒记录
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-20 15:26:21
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-22 18:01:21
 */

import { md5 } from '@src/utils';
import { useState, Key } from 'react';

/** 白盒埋点数据类型 */
type SearchFactorFromData = {
  /** 自动生成的数据id, 唯一值 */
  getFactorDataUid?: string;
  /** 来源地 */
  getFactorDataFrom: string;
  /** 编辑数据的id，新增时没有、部分来源也没有 */
  getFactorDataId?: number;
};

/** 碳足迹 - 搜索因子 - 数据存储时使用的 key */
const SearchFactorFromDataKey = 'SearchFactorFromDataKey';

/** 获取白盒缓存的数据 */
export const getFactorRecordData = () => {
  const strData = sessionStorage.getItem(SearchFactorFromDataKey);
  let resultData: null | SearchFactorFromData = null;
  if (strData?.length) {
    try {
      resultData = JSON.parse(strData) as SearchFactorFromData;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('获取数据失败(碳足迹 - 因子): ');
      // eslint-disable-next-line no-console
      console.error(err);
      resultData = null;
    }
  }
  return resultData;
};

/** 设置白盒缓存数据 */
export const setFactorRecordData = (data?: SearchFactorFromData) => {
  if (!data) {
    sessionStorage.setItem(SearchFactorFromDataKey, '');
    return data;
  }
  const newData: SearchFactorFromData = {
    ...data,
    getFactorDataUid: md5(JSON.stringify(data) + new Date()),
  };
  sessionStorage.setItem(SearchFactorFromDataKey, JSON.stringify(newData));
  return newData;
};

/** 保存产品碳足迹因子页面白盒埋点信息 */
export const useCacheFactorSearchRecord = <
  T extends { id: string | number; [k: string]: any }[],
>() => {
  const [searchRecord, setSearchRecord] = useState({
    page: 1,
    size: 10,
    checkedKey: null as Key | null,
    data: [] as T[],
    /** 当前选中的行数 */
    checkedIndex: 0,
  });
  const setRecord = (data: Partial<typeof searchRecord>) => {
    const newData = { ...searchRecord, ...data };
    if (data?.checkedKey) {
      newData.checkedIndex =
        // @ts-ignore
        (newData?.data?.findIndex(d => d?.id === data?.checkedKey) || 0) +
        (newData.page - 1) * newData.size;
    }
    setSearchRecord(newData);
  };
  return {
    searchRecord,
    setRecord,
  };
};
