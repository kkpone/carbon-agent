/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-04 10:29:09
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-06 11:06:28
 */
export type ScopeTree = {
  category: string;
  id: string;
  catId: number;
  pCatId: number;
  disabled: boolean;
  commId: number;
  children?: ScopeTree[];
  pid?: string;
};

export type ISOTreeWithChildren = Omit<ScopeTree, 'pid' | 'children'> & {
  pid?: ScopeTree['pid'];
  label: string;
  value: string;
  children: ISOTreeWithChildren[];
};
