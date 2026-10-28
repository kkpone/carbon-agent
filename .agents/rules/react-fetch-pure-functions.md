# React：请求与 `useEffect`（项目约定）

编写或修改「列表 / 首屏请求 / 筛选刷新 / 无限滚动」相关代码时遵守下列约定。细则与示例见：`.agents/skills/react-fetch-pure-functions/SKILL.md`。

## 必须遵守

1. **请求封装成纯函数**（模块级或同文件顶层）：入参显式传入（如 `searchParams`、`pageNum`），`return` 接口的 `Promise`，函数内不写 `setState`、不依赖组件实例。
2. **`useEffect` 的依赖数组里不要放 `useCallback` 包一层的 fetch 函数**。在 effect 里直接调用纯函数，依赖写 `searchParams` / 相关 props 等真实数据即可。
3. **竞态**：首屏请求在 effect cleanup 里置 `cancelled`（或等价），`then` 里若已取消则不要 `setState`。加载更多若需丢弃过期响应，可用「请求时的参数快照」与当前筛选比较。
4. **优先用库**：无限滚动可优先使用项目已有 **`ahooks` 的 `useInfiniteScroll`**（与 `FootprintAccount` 等现有用法一致），减少手写滚动与分页合并逻辑。

## 避免

```tsx
const fetchList = useCallback(async () => {
  await api({ ...searchParamsRef.current });
}, []);
useEffect(() => { void fetchList(); }, [searchParams, fetchList]);
```

## 简要正例

```tsx
function fetchPage(params: Params, page: number) {
  return getList({ ...params, pageNum: page });
}

useEffect(() => {
  let cancelled = false;
  void fetchPage(searchParams, 1).then((res) => {
    if (cancelled) return;
    setRows(res.rows);
  });
  return () => { cancelled = true; };
}, [searchParams]);
```
