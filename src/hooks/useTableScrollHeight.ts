import { debounce } from 'lodash-es';
import { RefObject, useLayoutEffect, useState } from 'react';

interface UseTableScrollHeightOptions {
  /** 容器 ref */
  containerRef: RefObject<HTMLElement>;
  /** 头部元素 ref（可选，使用 flex 布局时不需要） */
  headerRef?: RefObject<HTMLElement>;
  /** 表格表头高度（默认 0，如果 Table 有固定表头需要设置此值） */
  tableHeaderHeight?: number;
  /** 额外的 padding 值（默认 0，使用 flex 布局时通常为 0） */
  padding?: number;
  /** 最小高度（默认 200） */
  minHeight?: number;
  /** 防抖延迟时间，单位毫秒（默认 100） */
  debounceDelay?: number;
  /** 依赖项数组，当这些值变化时会重新计算 */
  deps?: any[];
}

/**
 * 自定义 Hook：计算表格滚动高度
 * 自动监听容器大小变化，计算合适的表格滚动高度
 *
 * 推荐使用 flex 布局（更简洁）：
 * - 父容器：display: flex; flex-direction: column; height: 100%
 * - 表格容器：flex: 1; min-height: 0; overflow: hidden
 * - 此时 containerRef 指向表格容器，直接使用其高度即可
 * - padding 和 headerRef 都不需要（使用默认值即可）
 * - 如果 Table 有固定表头，需要设置 tableHeaderHeight（通常为 40-50px）
 *
 * @param options 配置选项
 * @returns 计算出的滚动高度
 *
 * @example
 * ```tsx
 * // 使用 flex 布局（推荐）
 * const tableWrapperRef = useRef<HTMLDivElement>(null);
 * const scrollHeight = useTableScrollHeight({
 *   containerRef: tableWrapperRef,
 *   minHeight: 200,
 *   deps: [dataList, expandedRowKeys]
 * });
 *
 * // 使用 flex 布局且 Table 有固定表头
 * const tableWrapperRef = useRef<HTMLDivElement>(null);
 * const scrollHeight = useTableScrollHeight({
 *   containerRef: tableWrapperRef,
 *   tableHeaderHeight: 48, // Ant Design Table 默认表头高度约 48px
 *   minHeight: 200,
 *   deps: [dataList, expandedRowKeys]
 * });
 *
 * // 不使用 flex 布局（需要手动计算高度）
 * const containerRef = useRef<HTMLDivElement>(null);
 * const headerRef = useRef<HTMLDivElement>(null);
 * const scrollHeight = useTableScrollHeight({
 *   containerRef,
 *   headerRef,
 *   padding: 16, // 需要手动指定
 *   minHeight: 200,
 *   deps: [dataList, expandedRowKeys]
 * });
 *
 * <Table scroll={{ x: 1400, y: scrollHeight }} />
 * ```
 */
export function useTableScrollHeight(
  options: UseTableScrollHeightOptions,
): number | undefined {
  const {
    containerRef,
    headerRef,
    tableHeaderHeight = 48,
    padding = 0,
    minHeight = 200,
    debounceDelay = 100,
    deps = [],
  } = options;

  const [scrollHeight, setScrollHeight] = useState<number>();

  const antdScrollBarHeight = 10;

  useLayoutEffect(() => {
    const calculateScrollHeight = () => {
      if (!containerRef.current) {
        return;
      }

      // 获取容器高度
      const containerHeight = containerRef.current.clientHeight;

      // 计算可用高度
      // 如果提供了 headerRef，需要减去头部高度（非 flex 布局场景）
      // 如果使用 flex 布局，containerHeight 已经是可用高度

      const headerHeight = headerRef?.current?.offsetHeight || 0;
      const calculatedHeight =
        containerHeight -
        headerHeight -
        tableHeaderHeight -
        padding -
        antdScrollBarHeight;

      // 设置最小高度限制
      setScrollHeight(Math.max(calculatedHeight, minHeight));
    };

    // 使用 lodash 的 debounce，避免频繁计算
    const debouncedCalculate = debounce(calculateScrollHeight, debounceDelay);

    // 立即计算一次
    calculateScrollHeight();

    // 使用 ResizeObserver 监听容器大小变化
    // 如果提供了 headerRef，也监听头部大小变化（非 flex 布局场景）
    const resizeObserver = new ResizeObserver(debouncedCalculate);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    // 非 flex 布局时，需要监听头部高度变化
    if (headerRef?.current) {
      resizeObserver.observe(headerRef.current);
    }

    // 监听窗口大小变化（ResizeObserver 已经能覆盖大部分情况，这个作为补充）
    window.addEventListener('resize', debouncedCalculate);

    return () => {
      // 取消 debounce 的待执行任务
      debouncedCalculate.cancel();
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedCalculate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scrollHeight;
}
