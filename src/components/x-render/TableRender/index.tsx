/**
 * @@description: 基础表单组件
 * TODO：增加文档
 */
import classNames from 'classnames';
import type { FormInstance } from 'form-render';
import { ReactNode, useEffect, useRef } from 'react';
import { Search, Table, useTable } from 'table-render';
import type {
  SearchProps,
  TableContext,
  TableRenderProps,
  SearchApi,
} from 'table-render/dist/src/types';

import { usePageNumberInfo } from '@/hooks';
import I18N from '@/lang/I18N';
import { changeTableColumsNoText } from '@/components/TableUtil/util';
import { useIndexColumn } from '@/utils/columns';

import { CustomSearchProps } from './types';
import style from './xrender.module.less';

interface CustomTableRenderProps<RecordType extends object, S extends object> {
  /** 透传给  table-render Search 组件的参数*/
  searchProps: Omit<SearchProps<RecordType>, 'api'> & {
    api?: CustomSearchProps<RecordType, S>;
    onSearch?: (values: TableContext<RecordType>['doSearch']) => void;
  };
  /** 透传给  table-render Table 组件的参数*/
  tableProps: TableRenderProps<RecordType>;
  /** 是否自动将页面和表单搜索信息存储指 url SearchParams */
  autoSaveSearchInfo?: boolean;
  /** 是否自动增加序号 */
  autoAddIndexColumn?: boolean;
  /** 是否自动处理表单空值，默认占位符为 '-' */
  autoFixNoText?: boolean;
  /** 自定义表单空值的占位符 */
  customNoText?: string;
  /** 搜索栏和表格中间的组件 */
  children?: ReactNode;
}

export const TableRender = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends object = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends object = any,
>({
  searchProps,
  tableProps,
  autoSaveSearchInfo = false,
  autoAddIndexColumn = false,
  autoFixNoText = false,
  customNoText = '-',
  children,
}: CustomTableRenderProps<RecordType, S>) => {
  const active = useRef(false);

  const { pageNum, pageSize, getParamsByKeys, setSearchParams } =
    usePageNumberInfo();

  const { doSearch, form } = useTable() as {
    doSearch: TableContext<RecordType>['doSearch'];
    form: FormInstance;
  };

  const indexColumn = useIndexColumn<RecordType>((pageNum - 1) * pageSize);

  let tableColumns = tableProps?.columns || [];
  if (autoAddIndexColumn) {
    tableColumns = [...indexColumn, ...tableColumns];
  }
  if (autoFixNoText) {
    tableColumns = changeTableColumsNoText(tableColumns, customNoText);
  }

  /**
   * form onMount 回调存在多次调用的问题。
   * schema 更新变动后重新调用 onMount，参考：https://github.com/alibaba/x-render/blob/1.x/packages/form-render/src/form-render-core/src/index.js#L136
   * 业务组件有动态更新 schema 的情况。
   * 暂时使用 useEffect 解决。在 schema 有值后，只需调用一次 doSearch。
   */
  const isNeedDoSearch = useRef(true);
  useEffect(() => {
    if (form.schema && isNeedDoSearch.current) {
      isNeedDoSearch.current = false;
      const formKeys = Object.keys(form.formData);
      const customSearch = getParamsByKeys(formKeys);
      const currentFormValue = form.getValues();
      const formValues = { ...currentFormValue, ...customSearch };
      doSearch?.({ current: pageNum, pageSize }, formValues);
      form.setValues(formValues);
    }
  }, [form?.schema]);

  const searchApi = async (args: { current: number; pageSize: number }) => {
    const result = await (searchProps?.api as SearchApi<RecordType>)?.({
      ...args,
      pageNum: args.current,
    });

    if (!active.current) {
      return {
        rows: [],
        total: 0,
      };
    }

    if (autoSaveSearchInfo) {
      const formValues = form.getValues();

      setSearchParams({
        pageNum: String(args.current),
        pageSize: String(args.pageSize),
        ...formValues,
      });
    }
    return {
      ...result,
      dataSource: result?.list,
    };
  };

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  return (
    <>
      <Search
        searchText={I18N.utils.search}
        resetText={I18N.utils.reset}
        {...searchProps}
        searchOnMount={!autoSaveSearchInfo && searchProps.searchOnMount}
        api={
          Array.isArray(searchProps?.api)
            ? searchProps.api.map(item => ({ ...item, api: searchApi }))
            : searchApi
        }
        className={classNames(style.search, searchProps.className)}
      />
      {children}
      <Table
        rowKey='id'
        {...tableProps}
        columns={tableColumns}
        className={classNames(style.table, tableProps.className)}
        pagination={
          tableProps.pagination === false
            ? false
            : {
                locale: {
                  items_per_page: I18N.utils.perPage,
                },
                ...tableProps.pagination,
              }
        }
      />
    </>
  );
};
