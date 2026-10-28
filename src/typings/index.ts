import { PermissionSet } from '@src/api/types';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface PageResponseData {
  dataTotal?: number;
  pageTotal?: number;
  page?: number;
  size?: number;
}

export interface Dictionary<T> {
  [index: string]: T;
}

export interface PermissionTree extends PermissionSet {
  children: PermissionTree[];
}
