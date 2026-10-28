type SearchApi<T, S> = (
  params: Record<string, unknown> & {
    current: number;
    pageSize: number;
    pageNum: number;
    tab?: number;
  } & S,
  sorter?: unknown,
) => Promise<{
  rows?: Array<T>;
  total?: number;
  pageSize?: number;
}>;

export type CustomSearchProps<T, S> =
  | SearchApi<T, S>
  | Array<{
      api: SearchApi<T, S>;
      name: string;
    }>;
