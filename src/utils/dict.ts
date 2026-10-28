/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-27 20:36:02
 * @Date: 2023-03-27 20:13:16
 * @@description:
 */
import { Dicts } from '@src/hooks/useFieldUnitDictSource';

/**
 * @description: 根据字典值，递归找到字典详情
 * @param {string} dictValue 字典值value
 * @param {Dicts} dicts 字典的数组
 */
export const getDictInfoByDictValue = (
  dictValue: string,
  dicts: Dicts[],
  parentValue?: string,
) => {
  let dictInfo: Dicts[] = [];

  if (parentValue) {
    const getParentData = dicts.find(
      parent => parent.dictValue === parentValue,
    );

    if (getParentData) {
      const dicBackInfo = getParentData.children?.find(
        child => child.dictValue === dictValue,
      );

      if (dicBackInfo) {
        dictInfo = [dicBackInfo];
      }
    }
  } else {
    dicts.forEach(dict => {
      if (dict.dictValue === dictValue) {
        dictInfo = [dict];
      }

      if (dictInfo.length === 0 && dict.children && dict.children.length > 0) {
        dictInfo = [getDictInfoByDictValue(dictValue, dict.children)];
      }
    });
  }

  return dictInfo[0];
};
