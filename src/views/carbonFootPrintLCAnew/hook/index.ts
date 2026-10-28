import { isUndefined } from 'lodash-es';
import { useEffect, useState } from 'react';

import {
  getCcdbUnitList,
  getDataCategoryList,
  getLcaDbList,
  getLcaEnums,
  getLcaUnitList,
  getLiftCycleList,
  getSysLiftCycleList,
} from './service';
import { DictTree, LcaDb, LcaEnumResp, LifeCycle, Unit } from './type';
import { getProductionList } from '../ProductManagement/service';
import { Product } from '../ProductManagement/type';

/**
 * @description 获取lca枚举
 */
export const useLcaEnums = (enumName: string) => {
  const [enums, setEnums] = useState<LcaEnumResp[]>([]);
  useEffect(() => {
    getLcaEnums({ enumName }).then(({ data }) => setEnums(data?.data || []));
  }, []);
  return enums;
};

/**
 * @description 获取生命周期枚举
 */
export const useLifeCycleList = (ids?: string, deps?: string) => {
  const [enums, setEnums] = useState<LifeCycle[]>([]);
  useEffect(() => {
    getLiftCycleList({ ids }).then(({ data }) => setEnums(data?.data || []));
  }, [deps]);
  return enums;
};

/**
 * @description 获取系统边界生命周期类型
 */
export const useSysLifeCycleList = (systemBoundaryType: number) => {
  const [enums, setEnums] = useState<LifeCycle[]>([]);
  useEffect(() => {
    getSysLiftCycleList({ systemBoundaryType }).then(({ data }) =>
      setEnums(data?.data || []),
    );
  }, []);
  return enums;
};

/**
 * @description 获取数据分类枚举
 */
export const useDataCategoryEnums = () => {
  const [enums, setEnums] = useState<DictTree[]>([]);
  useEffect(() => {
    getDataCategoryList().then(({ data }) => setEnums(data?.data || []));
  }, []);
  return enums;
};

/**
 * @description 获取lca数据库列表
 */
export const useLcaDbList = () => {
  const [enums, setEnums] = useState<LcaDb[]>([]);
  useEffect(() => {
    getLcaDbList().then(({ data }) => setEnums(data?.data || []));
  }, []);
  return enums;
};

/**
 * @description 获取当前组织下的产品列表
 */
export const useProductList = (orgId?: number) => {
  const [productionOptions, setProductionOptions] = useState<Product[]>();
  useEffect(() => {
    if (isUndefined(orgId)) {
      setProductionOptions(undefined);
      return;
    }
    getProductionList({
      pageNum: 1,
      pageSize: 100000,
      orgId: orgId === 0 ? undefined : orgId,
    }).then(({ data }) => {
      setProductionOptions(data?.data?.list);
    });
  }, [orgId]);
  return productionOptions;
};

/**
 * @description 获取lca数据库列表
 */
export const useLcaUnitList = () => {
  const [enums, setEnums] = useState<Unit[]>([]);
  useEffect(() => {
    getLcaUnitList().then(({ data }) => setEnums(data?.data || []));
  }, []);
  return enums;
};

/**
 * @description 获取ccdb单位数据列表
 */
export const useCcdbUnitList = () => {
  const [enums, setEnums] = useState<string[]>([]);
  useEffect(() => {
    getCcdbUnitList().then(({ data }) => setEnums(data?.data || []));
  }, []);
  return enums;
};
