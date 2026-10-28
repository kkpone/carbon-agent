/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 19:11:57
 * @Date: 2022-09-22 10:14:27
 * @@description:
 */
/**
 * 默认通用的表格组件
 * @returns
 */
import { utilGetUrlParams } from '@src/components/SearchForm/util';
import { PaginationProps, TableProps } from 'antd';
import { FilterValue } from 'antd/es/table/interface';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { memo, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import BaseTable from './BaseTable';
import { variableData } from '../config/variable';
import { CommonProps } from '../types/common';
import { FetchPage } from '../types/util';
import { changeTableColumsNoText, getIndexTableColums } from '../util/index';
/**
 * 通用性表格组件 --- 简介
 * 泛型： RecordType 代表的是tableData中每一项返回的数据，一般定义接口返回类型的泛型, ApiType 代表的是接口返回结果中从哪个字段中取值，默认是从data中取值，暂时还没定下！(后续需要与后端定好格式)
 * props参数：详细参数信息可以查看参数类型 “CommonProps” 中有详细每一项参数的介绍
 */
const CommonTable = memo(
  <
    RecordType extends Record<string, any>,
    ApiType = { data: RecordType[]; count: number },
    SearchParams = Record<string | number, any>,
  >(
    props: CommonProps<RecordType, ApiType, SearchParams> &
      TableProps<RecordType>,
  ) => {
    const {
      columns,
      searchParams,
      pageSize,
      cRef,
      fetchApi,
      returnFetchApi,
      loading,
      pagePosition,
      showPageBar,
      onChangeInsert,
      onSorterChange,
      resetBeforeSearch = false,
      ...otherParams
    } = props;
    /** 区域加载 */
    const [tableLaoding, setTableLaoding] = useState<boolean>(false);
    /** 表格数据 */
    const [tableData, setTableData] = useState<RecordType[]>([]);
    /** 分页信息 */
    const [pageParams, setPageParams] = useState<FetchPage>(() => {
      /** 初始化 -- 获取路径上是否有分页信息 */
      const urlPage = new URLSearchParams(location.search).get('pageData');
      if (urlPage && urlPage !== 'null') {
        const paramsJSON: FetchPage = JSON.parse(urlPage);
        return {
          page: Number(paramsJSON.page),
          size: Number(paramsJSON.size),
        };
      }
      return {
        page: 1,
        size: pageSize || variableData.pageSize,
      };
    });
    /** 分页样式是否固定底部 */
    const userPagePosition = pagePosition || variableData.pagePosition;
    /** 是否显示分页条 */
    const userShowPageBar =
      typeof showPageBar === 'undefined' ? true : showPageBar;

    /** 总条数 */
    const [pageTotal, setPageTotal] = useState<number>(10);

    /**
     * 分页触发事件
     * @param pageParams 分页的参数
     */
    const onTableChange = (
      pageParams: PaginationProps,
      filters: Record<string, FilterValue | null>,
      sorter: {
        field: string;
        order: 'ascend' | 'descend' | undefined;
      },
    ) => {
      if (pageParams) {
        setPageParams({
          page: pageParams.current as number,
          size: pageParams.pageSize as number,
        });
      }

      if (onChangeInsert) {
        onChangeInsert(pageParams, filters);
      }
      if (onSorterChange) {
        onSorterChange(pageParams, filters, sorter);
      }
    };
    /**
     * 过滤接口返回的数据格式
     * @param data 默认接口返回的数据格式
     * @returns 返回处理后的数据格式
     */
    // eslint-disable-next-line consistent-return
    const cleanBackData = (data: AxiosResponse<ApiType>) => {
      if (returnFetchApi) return returnFetchApi(data);
    };
    /**
     * 获取当前页面路径上的参数
     * @returns 当前路径上的参数
     */
    const getUrlSearchParams = () => {
      /** 初始化 -- 获取路径上是否有搜索信息 */
      const urlSearch = utilGetUrlParams('search');
      if (urlSearch && urlSearch !== 'null') {
        const paramsJSON: Record<string | number, any> = JSON.parse(urlSearch);
        return paramsJSON;
      }
      return {};
    };

    /** 根据接口设置表格数据 */
    const initTableData = async () => {
      setTableLaoding(true);
      // fix 接口请求失败后loading 不消失

      try {
        /**
         * 当前路径上的搜索条件，因为当前页面重置后，之前的searchParams还有值，所以如果路径上清空后
         * 清空searchParams中除了分页以外的参数
         */
        const urlParams = getUrlSearchParams();
        let customSearchParams = {
          ...searchParams,
          ...pageParams,
        };
        // 等于0说明当前路径上没有参数了
        if (Object.keys(urlParams).length > 0) {
          customSearchParams = {
            ...customSearchParams,
            ...searchParams,
            ...urlParams,
          };
        }
        // console.log('组合搜索值', customSearchParams);

        if (resetBeforeSearch) {
          setTableData([]);
        }
        // @ts-ignore
        const res = await fetchApi(customSearchParams);
        const back = cleanBackData(res);
        if (back) {
          setTableData(back.data);
          setPageTotal(back.count);
        }
      } finally {
        setTableLaoding(false);
      }
    };
    /**
     * 添加表头的所有序号，规定序号的key或者dataIndex必须得是index
     * 取消使用 state 形式，原形式下column变化后不会重新渲染
     */
    const newColumns = useMemo(() => {
      const backColums = getIndexTableColums<RecordType>(
        columns,
        pageParams.page,
        pageParams.size,
      );
      // 先将下标统一处理带序号递增的
      const changeColums = changeTableColumsNoText(
        backColums,
        variableData.noText,
      );
      // 处理表格数据未返回值，统一处理成 '-'
      return changeColums as ColumnsType<RecordType>;
    }, [columns, pageParams]);
    /**
     * 主动触发子组件表格更新
     */
    useImperativeHandle(cRef, () => ({
      /** 重新加载数据 */
      reset: async (page?: Partial<FetchPage>) => {
        if (page) {
          setPageParams(s => ({ ...s, ...page }));
        } else await init();
      },
      getTableData: () => tableData,
      initTableData,
    }));
    /** 初始化 */
    const init = async () => {
      await initTableData();
    };
    /** 缓存之前的search */
    // const cacheSearch = useRef<SearchParams>();
    /** 返回比较之后的search，防止重复请求 */
    // const memoSearchParams = useMemo(() => {
    //   if (diffSearchKey(searchParams, cacheSearch.current)) {
    //     cacheSearch.current = searchParams;
    //     setPageParams(s => ({ ...s, page: 1 }));
    //   }
    //   return cacheSearch.current;
    // }, [searchParams]);

    useEffect(() => {
      init();
    }, [pageParams, searchParams]);
    return (
      <div className={userPagePosition ? 'commonTableUserPagePosition' : ''}>
        <BaseTable<RecordType>
          // 放在上面可以通过参数 overWrite
          onTableChange={onTableChange}
          loading={loading || tableLaoding}
          columns={newColumns}
          tableData={tableData}
          pageParams={{ ...pageParams, total: pageTotal, userShowPageBar }}
          // scroll={{ x: 1000 }}
          {...otherParams}
        />
      </div>
    );
  },
);

export default CommonTable as <
  RecordType,
  ApiType = { data: RecordType[]; count: number },
  SearchParams = Record<string | number, any>,
>(
  props: CommonProps<RecordType, ApiType, SearchParams> &
    TableProps<RecordType>,
) => JSX.Element;
