/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 09:48:09
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 17:15:04
 */
export interface ListALLByDictTypeBatchEnum {
  [k: string]: Dicts[];
}

export interface Dicts {
  enumList?: Dicts[];
  value: string;
  label: string;
  dictLabel: string;
  dictValue: string;
  sourceType: string;
  dictSort: number;
  id: number;
  sourceName: string;
  dictType: string;
  relatedValue?: string;
}

export interface DictsAndChildren extends Dicts {
  children?: Dicts[];
}

export interface ListDictTypeAndDataByType {
  dictLabel: string;
  dictValue: string;
  enumList: EnumList[];
  id: number;
  dictType: string;
}

interface EnumList {
  dictLabel: string;
  dictValue: string;
  relatedValue: null | string;
  dictType: string;
}
