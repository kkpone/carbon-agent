---
name: react-fetch-pure-functions
description: Prefer module-level pure functions for API/data fetching in React; avoid useCallback-wrapped fetchers as useEffect dependencies. Use when writing or reviewing useEffect + request code, list/infinite scroll loading, or refetch-on-props-change patterns.
metadata:
  author: project
  version: "1.0.0"
---

# React：请求用纯函数，不要 useCallback 塞进 useEffect 依赖

## 规则

1. **HTTP / 数据请求封装成模块级（或文件内）纯函数**  
   入参显式传入（如 `searchParams`、`pageNum`），只返回 `Promise`（例如直接 `return getList({ ... })`），**不闭包捕获 `setState`、不依赖组件实例**。

2. **`useEffect` 依赖里不要放 `useCallback` 包一层再包一层的 fetch 函数**  
   首屏/筛选变化：`useEffect(() => { ... void fetchPure(params); ... }, [searchParams])`，在 effect 内用 `searchParams`（或 `props`）调用纯函数即可。  
   这样依赖清晰，也避免「稳定空依赖的 callback + ref 同步参数」的绕法。

3. **滚动/订阅与 state 同步**  
   优先让 **`useEffect` 依赖真实的 `loading` / `loadingMore` / `list.length` / `total` / `searchParams`**，在 effect 内定义 `tryLoadMore` 并挂到 `IntersectionObserver`，这样闭包里就是最新 state，**不必**再为它们各建一个 ref。  
   代价是列表变长时会重绑 Observer（通常可接受）。若必须稳定订阅、极少重绑，再考虑 `fnRef` 模式。  
   **仍建议保留**：DOM 的 `ref`；分页游标 `pageRef`；以及 **`searchParamsRef`（仅最新筛选）**——用于异步返回后判断「请求发出时的筛选」是否仍等于当前筛选，避免丢弃错结果。

4. **竞态**  
   首屏：effect cleanup 里 `cancelled = true`，在 `then` 里若已取消则不再 `setState`。  
   加载更多：可用「请求发出时的 `params` 序列化」与当前的 `searchParamsRef.current` 比较，不一致则丢弃结果。

## 反例

```tsx
const fetchList = useCallback(async () => {
  await getModelList({ ...searchParamsRef.current, ... });
}, []);
useEffect(() => { void fetchList(); }, [searchParams, fetchList]);
```

## 正例（摘要）

```tsx
function fetchPage(params: Params, page: number) {
  return getModelList({ ...params, pageNum: page });
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

## 何时触发本 Skill

编写或重构：列表请求、`useEffect` + `fetch`、`useCallback` + `useEffect` 组合、无限滚动加载时，按上述规则检查并改为纯函数 + 明确依赖。
