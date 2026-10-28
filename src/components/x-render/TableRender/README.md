# 组件
`<TableRender<recordType, searchType> />` 接受两个范性参数，第一个是表格数据的类型，第二个是搜索接口的类型。


searchProps.api 的类型声明可以使用 
`CustomSearchProps<
  EmissionStandard,
  SearchAPIProps
>`

Props [如下](./index.tsx)：
```ts
interface CustomTableRenderProps<RecordType extends object, S extends object> {
  /** 透传给  table-render Search 组件的参数*/
  searchProps: Omit<SearchProps<RecordType>, 'api'> & {
    api?: CustomSearchProps<RecordType, S>;
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
}
```

基础使用方式可以参考[基准年](/src/views/eca/baseYear/index.tsx)