/**
 * @file 带搜索的 table
 */
import SearchForm, { SearchFormProps } from '@src/views/components/SearchForm';
import { useIndexColumn } from '@src/views/emission/utils';
import Table, { TableProps } from 'antd/es/table';
import classNames from 'classnames';
import {
  Dispatch,
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import style from './index.module.scss';

type Page = {
  current: number;
  pageSize: number;
  total: number;
};
export type SearchTableProps<
  T extends Record<any, any>,
  S extends Record<string, any>,
> = {
  /**
   * 搜索参数
   */
  search?: Omit<SearchFormProps<S>, 'onSearch'>;
  /**
   * table 顶部按钮
   */
  tableTopNode?: ReactNode;
  tableProps: Omit<TableProps<T>, 'dataSource'> & {
    /**
     * 是否使用序号字段
     */
    isUseIndex?: boolean;
    getDateSource: (props: {
      page: Page;
      search: S | undefined;
      /**
       * 设置table数据，由于table数据可能会进行二次修改，所以将设置数据接口暴露出去
       */
      setDataSource: Dispatch<SetStateAction<any[]>>;
      /**
       * 设置table数据总数，不知道后端的总量是否返回结构一致，目前需要外置这个函数
       */
      setTotal: (total: number) => void;
    }) => Promise<any>;
    onPageChange?: (page: Page) => any;
  };
};

export type SearchTableRef<S> =
  | {
      getPage: () => Page;
      setPage: (page: Page) => void;
      getSearchParams: () => S | undefined;
      /**
       * 重新加载table数据
       */
      reload: (p?: any) => void;
    }
  | undefined;

const SearchTableFC = <
  T extends Record<any, any>,
  S extends Record<string, any>,
>(
  { search, tableTopNode, tableProps }: SearchTableProps<T, S>,
  ref: ForwardedRef<SearchTableRef<S>>,
) => {
  const {
    isUseIndex,
    columns,
    pagination,
    onPageChange,
    getDateSource,
    ...antTableProps
  } = tableProps;
  const [searchParams, setSearchParams] = useState<S>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [page, setPage] = useState<Page>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // 设置数据总量
  const setTotal = (total: number) => setPage(p => ({ ...p, total }));
  useImperativeHandle(
    ref,
    () => ({
      getPage: () => page,
      setPage: p => setPage(p),
      getSearchParams: () => searchParams,
      reload: (params?: Record<any, any>) => {
        getDateSource({
          page,
          search: searchParams,
          setDataSource,
          setTotal,
          ...params,
        });
      },
    }),
    [searchParams, page],
  );

  const indexColumn = useIndexColumn<T>((page.current - 1) * page.pageSize);
  // 重写 column
  const newColumns = useMemo(() => {
    if (isUseIndex) {
      return [...indexColumn, ...(columns || [])];
    }
    return columns;
  }, [isUseIndex, page, columns]);

  useEffect(() => {
    getDateSource({ page, search: searchParams, setDataSource, setTotal });
  }, []);

  return (
    <div className={style.wrapper}>
      {search && (
        <SearchForm
          {...search}
          onSearch={p => {
            setSearchParams(p);
            const newPage: Page = {
              ...page,
              current: 1,
              total: 0,
            };
            setPage(newPage);
            getDateSource({
              page: newPage,
              search: p,
              setDataSource,
              setTotal,
            });
          }}
          className={classNames(search?.className, style.searchForm)}
        />
      )}
      {tableTopNode}
      <Table
        {...antTableProps}
        columns={newColumns}
        dataSource={dataSource}
        className={style.table}
        pagination={
          !!pagination && {
            ...pagination,
            ...page,
            onChange: (current, pageSize) => {
              setPage(p => ({
                ...p,
                current,
                pageSize,
              }));
              getDateSource({
                page: { ...page, current, pageSize },
                search: searchParams,
                setDataSource,
                setTotal,
              });
            },
          }
        }
      />
    </div>
  );
};

export const SearchTable = memo(forwardRef(SearchTableFC)) as <
  T extends Record<any, any>,
  S extends Record<string, any>,
>(
  props: SearchTableProps<T, S> & { ref: ForwardedRef<SearchTableRef<S>> },
) => JSX.Element;
