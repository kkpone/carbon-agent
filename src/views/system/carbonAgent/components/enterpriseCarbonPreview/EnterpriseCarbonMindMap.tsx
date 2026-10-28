import { ResizeObserver } from '@juggle/resize-observer';
import I18N from '@src/lang/I18N';
import { Graph, GraphEvent } from 'g6-5';
import type { EdgeData, GraphData, NodeData, Point } from 'g6-5';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from 'react';

import addActiveIcon from './assets/canvas-icons/add-active.svg';
import downCircleExpandedIcon from './assets/canvas-icons/down-circle-expanded.svg';
import downCircleExpandedHoverIcon from './assets/canvas-icons/down-circle-expanded-hover.svg';
import excelIcon from './assets/canvas-icons/excel.svg';
import moreIcon from './assets/canvas-icons/more.svg';
import orgIcon from './assets/canvas-icons/org.svg';
import { getCanvasCategoryVisual } from './canvasCategoryVisualMap';
import {
  type EnterpriseCarbonCanvasAction,
  type EnterpriseCarbonCanvasNode,
  type EnterpriseCarbonCanvasTaskContext,
} from './canvasTypes';
import styles from './index.module.less';

export type EnterpriseCarbonMindMapHandle = {
  cancelPendingLayoutPreservation: () => void;
  fitCenter: () => void;
  preserveLayoutOnNextDataUpdate: (anchorNodeId?: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type EnterpriseCarbonMindMapProps = {
  data?: EnterpriseCarbonCanvasNode;
  onAction: (action: EnterpriseCarbonCanvasAction) => void;
  onCollapsedChange?: (id: string, collapsed: boolean) => void;
  onTaskSelectionChange?: (target: EnterpriseCarbonCanvasTaskContext) => void;
  onZoomChange?: (zoom: number) => void;
  resetSignal?: number;
  selectedTaskSourceIds?: ReadonlySet<string>;
  selectedTaskTypeKey?: string;
};

type LayoutNode = EnterpriseCarbonCanvasNode & {
  children?: LayoutNode[];
  subtreeHeight: number;
  x: number;
  y: number;
};

type GraphNodeData = NodeData & {
  data: {
    sourceNode?: EnterpriseCarbonCanvasNode;
  };
};

type LayoutAnchor = {
  nodeId: string;
  x: number;
  y: number;
};

type ViewportAnchorSnapshot = {
  nodeId: string;
  offset: Point;
  position: Point;
  zoom: number;
};

const HORIZONTAL_GAP = 56;
const VERTICAL_GAP = 48;
const GRAPH_ZOOM_RANGE: [number, number] = [0.25, 1.6];
const GRAPH_FIT_PADDING: [number, number, number, number] = [96, 32, 88, 32];
const WHEEL_MOVE_SENSITIVITY = 0.6;
const WHEEL_ZOOM_SENSITIVITY = 0.0025;
const MAX_WHEEL_ZOOM_DELTA = 40;
const ZOOM_BUTTON_STEP = 0.1;
const WHEEL_ZOOM_EASING = 0.24;
const WHEEL_ZOOM_THRESHOLD = 0.001;
const ZOOM_ANIMATION = {
  duration: 180,
  easing: 'ease-out',
};
const getText = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '-' : String(value);

const escapeHTML = (value?: string | number | null) =>
  getText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttr = escapeHTML;

const joinClasses = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(' ');

const getRateText = (rate?: string) => {
  if (rate === undefined || rate === '') {
    return '';
  }

  const rateText = String(rate).trim();
  const rateNumber = Number(rateText.replace('%', ''));

  return Number.isFinite(rateNumber) ? `${rateNumber.toFixed(2)}%` : rateText;
};

const getProgressText = (node: EnterpriseCarbonCanvasNode) => {
  if (node.totalCount === undefined) {
    return '';
  }

  const finishCount = node.finishCount || 0;
  const totalCount = node.totalCount || 0;
  const progressText = `${finishCount}/${totalCount}`;

  if (node.nodeKind !== 'scope') {
    return progressText;
  }

  const rateText = getRateText(node.rate);

  return rateText ? `${progressText} (${rateText})` : progressText;
};

const getScopeVisual = (node: EnterpriseCarbonCanvasNode) =>
  getCanvasCategoryVisual(
    node.categoryVersionType,
    node.categoryCode,
    node.label,
  );

const getNodeIcon = (node: EnterpriseCarbonCanvasNode) => {
  if (node.icon) return node.icon;
  if (node.nodeKind === 'org') return orgIcon;
  if (node.nodeKind === 'scope') return getScopeVisual(node)?.icon;

  return undefined;
};

const getNodeColor = (node: EnterpriseCarbonCanvasNode) => {
  if (node.nodeKind === 'source' && node.incomplete) {
    return '#d93f63';
  }

  if (node.nodeKind !== 'scope') {
    return node.color || '#026961';
  }

  if (node.color) {
    return node.color;
  }

  return getScopeVisual(node)?.color || '#026961';
};

const getMetricUnit = (node: EnterpriseCarbonCanvasNode) =>
  node.nodeKind === 'source' ? node.activityUnitDesc : 'tCO₂e';

const getMetricValue = (node: EnterpriseCarbonCanvasNode) =>
  node.nodeKind === 'source' ? node.activityData : node.emissionQuantity;

const renderIcon = (src: string, className: string) =>
  `<img class="${className}" alt="" src="${escapeAttr(src)}" />`;

const renderCollapseButton = (node: EnterpriseCarbonCanvasNode) => {
  if (!node.hasChildren) {
    return '';
  }

  return `
    <button
      type="button"
      class="${styles.canvasNodeCollapse}"
      data-enterprise-carbon-action="toggle"
      data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
    >
      ${renderIcon(
        downCircleExpandedIcon,
        joinClasses(
          styles.canvasNodeCollapseIcon,
          styles.canvasNodeCollapseIconDefault,
          node.collapsed && styles.canvasNodeCollapseIconCollapsed,
        ),
      )}
      ${renderIcon(
        downCircleExpandedHoverIcon,
        joinClasses(
          styles.canvasNodeCollapseIcon,
          styles.canvasNodeCollapseIconHover,
          node.collapsed && styles.canvasNodeCollapseIconCollapsed,
        ),
      )}
    </button>
  `;
};

const renderSourceMoreMenu = (node: EnterpriseCarbonCanvasNode) => {
  const readPretty = Boolean(node.actionPayload?.readPretty);

  return `
    <div class="${styles.canvasNodeMoreWrap}">
      <button
        type="button"
        class="${styles.canvasNodeMore}"
        aria-label="${escapeAttr(I18N.enterpriseCarbonAccount2.more)}"
      >
        ${renderIcon(moreIcon, styles.canvasNodeMoreIcon)}
      </button>
      <div class="${styles.canvasNodeMoreMenu}">
        ${
          !readPretty
            ? `
              <button
                type="button"
                class="${styles.canvasNodeMoreMenuItem}"
                data-enterprise-carbon-action="sourceAttachment"
                data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
              >
                ${escapeHTML(I18N.components.uploadAttachments)}
              </button>
            `
            : ''
        }
        <button
          type="button"
          class="${styles.canvasNodeMoreMenuItem}"
          data-enterprise-carbon-action="sourceHistory"
          data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
        >
          ${escapeHTML(I18N.enterpriseCarbonAccount2.history)}
        </button>
        ${
          !readPretty
            ? `
              <button
                type="button"
                class="${styles.canvasNodeMoreMenuItem}"
                data-enterprise-carbon-action="sourceDelete"
                data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
              >
                ${escapeHTML(I18N.carbonFootprint.delete)}
              </button>
            `
            : ''
        }
      </div>
    </div>
  `;
};

const renderTaskSelection = (node: EnterpriseCarbonCanvasNode) => {
  if (!node.taskSelectable || !node.taskContext) {
    return '';
  }

  return `
    <input
      type="checkbox"
      ${node.taskSelected ? 'checked' : ''}
      aria-label="${escapeAttr(
        I18N.template(I18N.carbonAgent.enterpriseCanvasTaskSelectSource, {
          val1: node.taskContext.emissionSourceName,
        }),
      )}"
      class="${joinClasses(
        styles.canvasNodeTaskCheckbox,
        node.taskSelected && styles.canvasNodeTaskCheckboxSelected,
      )}"
      data-enterprise-carbon-action="toggleTaskSelection"
      data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
      data-enterprise-carbon-source-id="${escapeAttr(
        node.taskContext.emissionSourceId,
      )}"
      data-enterprise-carbon-task-type-key="${escapeAttr(
        node.taskContext.availableTaskTypes.join('|'),
      )}"
    />
  `;
};

const syncTaskSelection = (
  container: HTMLDivElement | null,
  selectedTaskSourceIds?: ReadonlySet<string>,
  selectedTaskTypeKey?: string,
) => {
  const selectedTaskTypes = new Set(
    selectedTaskTypeKey ? selectedTaskTypeKey.split('|') : [],
  );

  container
    ?.querySelectorAll<HTMLInputElement>(
      'input[data-enterprise-carbon-action="toggleTaskSelection"]',
    )
    .forEach(input => {
      const checkbox = input;
      const sourceId = checkbox.dataset.enterpriseCarbonSourceId;
      const selected = Boolean(
        sourceId && selectedTaskSourceIds?.has(sourceId),
      );
      const taskTypeKey = checkbox.dataset.enterpriseCarbonTaskTypeKey || '';
      const hasCommonTaskType = taskTypeKey
        .split('|')
        .some(taskType => selectedTaskTypes.has(taskType));
      const incompatible = Boolean(
        selectedTaskTypes.size && !hasCommonTaskType,
      );

      checkbox.checked = selected;
      checkbox.disabled = !selected && incompatible;
      checkbox.classList.toggle(
        styles.canvasNodeTaskCheckboxSelected,
        selected,
      );
    });
};

const renderNodeHeader = (node: EnterpriseCarbonCanvasNode) => {
  const icon = getNodeIcon(node);
  const progressText = getProgressText(node);
  const isOrg = node.nodeKind === 'org';
  const hasAttachments = Boolean(node.supportImg?.length);

  if (node.nodeKind === 'source') {
    return `
      <div class="${styles.canvasNodeHeader}">
        ${renderTaskSelection(node)}
        <span
          class="${styles.canvasNodeTitle}"
          title="${escapeAttr(node.label)}"
        >${escapeHTML(node.label)}</span>
        ${
          hasAttachments
            ? `
              <button
                type="button"
                class="${styles.canvasNodeFileButton}"
                data-enterprise-carbon-action="sourceAttachment"
                data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
                aria-label="${escapeAttr(I18N.components.uploadAttachments)}"
              >
                ${renderIcon(excelIcon, styles.canvasNodeHeaderIcon)}
              </button>
            `
            : ''
        }
        ${renderSourceMoreMenu(node)}
      </div>
    `;
  }

  return `
    <div class="${styles.canvasNodeHeader}">
      ${
        icon
          ? renderIcon(
              icon,
              isOrg
                ? styles.canvasNodeOrgIcon
                : joinClasses(
                    styles.canvasNodeHeaderIcon,
                    node.iconFlipX && styles.canvasNodeHeaderIconFlipX,
                  ),
            )
          : ''
      }
      <span class="${joinClasses(
        styles.canvasNodeTitle,
        isOrg && styles.canvasNodeTitleOrg,
      )}" title="${escapeAttr(node.label)}">
        ${escapeHTML(node.label)}
      </span>
      ${
        progressText
          ? `<span class="${styles.canvasNodeProgress}">${escapeHTML(
              progressText,
            )}</span>`
          : ''
      }
    </div>
  `;
};

const renderMetric = (node: EnterpriseCarbonCanvasNode) => {
  if (node.nodeKind === 'org') {
    return `
      <div class="${joinClasses(
        styles.canvasNodeMetric,
        styles.canvasNodeMetricOrg,
      )}">
        <span class="${styles.canvasNodeMetricLabel}">${escapeHTML(
      I18N.carbonAgent.enterpriseCarbonTotalEmissions,
    )}</span>
        <span class="${styles.canvasNodeUnit}">(tCO₂e)</span>
        <span
          class="${styles.canvasNodeValueOrg}"
          title="${escapeAttr(node.emissionQuantity)}"
        >${escapeHTML(node.emissionQuantity)}</span>
      </div>
    `;
  }

  return `
    <div class="${styles.canvasNodeMetric}">
      <span
        class="${styles.canvasNodeValue}"
        title="${escapeAttr(getMetricValue(node))}"
      >${escapeHTML(getMetricValue(node))}</span>
      <span class="${styles.canvasNodeUnit}">${escapeHTML(
    getMetricUnit(node),
  )}</span>
      ${
        node.isProductCarbon
          ? `<span class="${styles.canvasNodeProductFootprintTag}">${escapeHTML(
              I18N.enterpriseCarbonAccount2.productCarbon,
            )}</span>`
          : ''
      }
    </div>
  `;
};

const canAddSource = (node?: EnterpriseCarbonCanvasNode) =>
  Boolean(
    node &&
      (node.nodeKind === 'classify' || node.nodeKind === 'group') &&
      !node.actionPayload?.readPretty &&
      !node.actionPayload?.isShare,
  );

const renderAddSourceAction = (node: EnterpriseCarbonCanvasNode) => {
  if (!canAddSource(node)) {
    return '';
  }

  const hasProductFootprintMenu =
    node.productFootprintAssociationEnabled === true;
  const addButton = `
    <button
      type="button"
      class="${styles.canvasNodeAdd}"
      data-enterprise-carbon-action="${
        hasProductFootprintMenu ? 'showAddSourceMenu' : 'addSource'
      }"
      data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
      ${hasProductFootprintMenu ? 'aria-haspopup="menu"' : ''}
      aria-label="${escapeAttr(
        I18N.carbonAgent.enterpriseCarbonAddEmissionSource,
      )}"
    >
      ${renderIcon(addActiveIcon, styles.canvasNodeAddIcon)}
    </button>
  `;

  if (!hasProductFootprintMenu) {
    return addButton;
  }

  return `
    <div class="${styles.canvasNodeAddWrap}">
      ${addButton}
      <div class="${styles.canvasNodeAddMenu}" role="menu">
        <button
          type="button"
          class="${styles.canvasNodeAddMenuItem}"
          role="menuitem"
          data-enterprise-carbon-action="addSource"
          data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
        >
          ${escapeHTML(I18N.enterpriseCarbonAccount2.addCustomEmissionSource)}
        </button>
        <button
          type="button"
          class="${styles.canvasNodeAddMenuItem}"
          role="menuitem"
          data-enterprise-carbon-action="associateProductFootprint"
          data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
        >
          ${escapeHTML(I18N.enterpriseCarbonAccount2.associateProductFootprint)}
        </button>
      </div>
    </div>
  `;
};

const renderNodeHTML = (node: EnterpriseCarbonCanvasNode) => {
  const color = getNodeColor(node);
  const isSource = node.nodeKind === 'source';
  const isErrorSource = isSource && node.incomplete;
  const className = joinClasses(
    styles.canvasNodeCard,
    node.nodeKind === 'org' && styles.canvasNodeCardOrg,
    isSource && styles.canvasNodeCardSource,
    isErrorSource && styles.canvasNodeCardError,
    canAddSource(node) && styles.canvasNodeCardAddable,
  );

  return `
    <div
      class="${className}"
      style="--enterprise-carbon-node-color: ${escapeAttr(color)};"
      data-enterprise-carbon-node-id="${escapeAttr(node.id)}"
    >
      <div class="${styles.canvasNodeInner}">
        ${renderNodeHeader(node)}
        ${renderMetric(node)}
        ${renderAddSourceAction(node)}
      </div>
      ${renderCollapseButton(node)}
    </div>
  `;
};

const measureLayoutNode = (node: EnterpriseCarbonCanvasNode): LayoutNode => {
  const children = node.children?.map(measureLayoutNode) || [];
  const childrenHeight = children.length
    ? children.reduce((total, child) => total + child.subtreeHeight, 0) +
      (children.length - 1) * VERTICAL_GAP
    : 0;

  return {
    ...node,
    children,
    subtreeHeight: Math.max(node.nodeHeight, childrenHeight),
    x: 0,
    y: 0,
  };
};

const assignLayoutPosition = (
  node: LayoutNode,
  left: number,
  top: number,
): LayoutNode => {
  const nextNode: LayoutNode = {
    ...node,
    x: left + node.nodeWidth / 2,
    y: top + node.subtreeHeight / 2,
  };

  const layoutChildren = node.children;

  if (!layoutChildren?.length) {
    return nextNode;
  }

  const childrenHeight =
    layoutChildren.reduce((total, child) => total + child.subtreeHeight, 0) +
    (layoutChildren.length - 1) * VERTICAL_GAP;
  const childLeft = left + node.nodeWidth + HORIZONTAL_GAP;
  let childTop = nextNode.y - childrenHeight / 2;
  const visibleChildren = new Set(node.children?.map(child => child.id));

  const positionedChildren = layoutChildren.map(child => {
    const positionedChild = assignLayoutPosition(child, childLeft, childTop);
    childTop += child.subtreeHeight + VERTICAL_GAP;

    return positionedChild;
  });
  nextNode.children = positionedChildren.filter(child =>
    visibleChildren.has(child.id),
  );

  return nextNode;
};

const buildLayoutTree = (data: EnterpriseCarbonCanvasNode) =>
  assignLayoutPosition(measureLayoutNode(data), 0, 0);

const findLayoutNode = (
  node: LayoutNode,
  nodeId: string,
): LayoutNode | undefined => {
  if (String(node.id) === nodeId) {
    return node;
  }

  return node.children
    ?.map(child => findLayoutNode(child, nodeId))
    .find(Boolean);
};

const getLayoutAnchor = (
  node?: EnterpriseCarbonCanvasNode,
): LayoutAnchor | null => {
  const layoutNode = node as
    | (EnterpriseCarbonCanvasNode & { x?: number; y?: number })
    | undefined;

  return layoutNode &&
    typeof layoutNode.x === 'number' &&
    typeof layoutNode.y === 'number'
    ? {
        nodeId: String(layoutNode.id),
        x: layoutNode.x,
        y: layoutNode.y,
      }
    : null;
};

const getViewportAnchorOffset = (
  container: HTMLDivElement | null,
  nodeId: string,
): Point | null => {
  if (!container) {
    return null;
  }

  const anchorElement = Array.from(
    container.querySelectorAll<HTMLElement>(
      `.${styles.canvasNodeCard}[data-enterprise-carbon-node-id]`,
    ),
  ).find(element => element.dataset.enterpriseCarbonNodeId === String(nodeId));

  if (!anchorElement) {
    return null;
  }

  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchorElement.getBoundingClientRect();

  return [
    anchorRect.left - containerRect.left,
    anchorRect.top - containerRect.top,
  ];
};

const offsetLayoutTree = (
  node: LayoutNode,
  offsetX: number,
  offsetY: number,
): LayoutNode => ({
  ...node,
  children: node.children?.map(child =>
    offsetLayoutTree(child, offsetX, offsetY),
  ),
  x: node.x + offsetX,
  y: node.y + offsetY,
});

const toGraphData = (
  data: EnterpriseCarbonCanvasNode,
  nodeLookup: Map<string, EnterpriseCarbonCanvasNode>,
  layoutAnchor?: LayoutAnchor | null,
): GraphData => {
  let root = buildLayoutTree(data);
  const nextAnchorNode = layoutAnchor
    ? findLayoutNode(root, layoutAnchor.nodeId)
    : undefined;

  if (nextAnchorNode && layoutAnchor) {
    root = offsetLayoutTree(
      root,
      layoutAnchor.x - nextAnchorNode.x,
      layoutAnchor.y - nextAnchorNode.y,
    );
  }

  const nodes: GraphNodeData[] = [];
  const edges: EdgeData[] = [];

  const walk = (node: LayoutNode, parent?: LayoutNode) => {
    nodeLookup.set(String(node.id), node);

    nodes.push({
      data: {
        sourceNode: node,
      },
      id: String(node.id),
      style: {
        innerHTML: renderNodeHTML(node),
        port: true,
        ports: [
          { key: 'left', placement: [0, 0.5], r: 0 },
          { key: 'right', placement: [1, 0.5], r: 0 },
        ],
        size: [node.nodeWidth, node.nodeHeight],
        x: node.x - node.nodeWidth / 2,
        y: node.y - node.nodeHeight / 2,
      },
      type: 'html',
    });

    if (parent) {
      const sourceRightX = parent.x + parent.nodeWidth / 2;
      const targetLeftX = node.x - node.nodeWidth / 2;
      const midX = sourceRightX + (targetLeftX - sourceRightX) / 2;

      edges.push({
        id: `${parent.id}-${node.id}`,
        source: String(parent.id),
        style: {
          controlPoints: [
            [midX, parent.y],
            [midX, node.y],
          ] as Point[],
          endArrow: false,
          lineWidth: 1,
          radius: 12,
          sourcePort: 'right',
          stroke: '#d2d6da',
          targetPort: 'left',
        },
        target: String(node.id),
        type: 'polyline',
      });
    }

    node.children?.forEach(child => walk(child, node));
  };

  walk(root);

  return { edges, nodes };
};

const getContainerSize = (container: HTMLDivElement) => ({
  height: Math.max(container.offsetHeight, 320),
  width: Math.max(container.offsetWidth, 480),
});

const fitGraphView = async (graph?: Graph | null) => {
  if (!graph || graph.destroyed) {
    return;
  }

  await graph.fitView(
    { direction: 'both', when: 'always' },
    {
      duration: 120,
    },
  );
};

const runAsync = (task: Promise<unknown>) => {
  task.catch(() => undefined);
};

const clampZoom = (zoom: number) =>
  Math.min(Math.max(zoom, GRAPH_ZOOM_RANGE[0]), GRAPH_ZOOM_RANGE[1]);

const getWheelZoomDelta = (event: WheelEvent, containerHeight: number) => {
  const delta = event.deltaY || event.deltaX;

  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return delta * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return delta * containerHeight;
  }

  return delta;
};

const EnterpriseCarbonMindMap = (
  {
    data,
    onAction,
    onCollapsedChange,
    onTaskSelectionChange,
    onZoomChange,
    resetSignal,
    selectedTaskSourceIds,
    selectedTaskTypeKey,
  }: EnterpriseCarbonMindMapProps,
  ref: Ref<EnterpriseCarbonMindMapHandle>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const nodeLookupRef = useRef<Map<string, EnterpriseCarbonCanvasNode>>(
    new Map(),
  );
  const hasInitialFitRef = useRef(false);
  const onZoomChangeRef = useRef(onZoomChange);
  const actionRef = useRef({
    onAction,
    onCollapsedChange,
    onTaskSelectionChange,
  });
  const pendingLayoutAnchorRef = useRef<LayoutAnchor | null>(null);
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const renderVersionRef = useRef(0);
  const activeMenuLayerRef = useRef<HTMLElement | null>(null);
  const selectedTaskSourceIdsRef = useRef(selectedTaskSourceIds);
  const selectedTaskTypeKeyRef = useRef(selectedTaskTypeKey);
  const targetZoomRef = useRef(1);
  const wheelZoomFrameRef = useRef<number>();
  const wheelZoomOriginRef = useRef<Point>();

  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  useEffect(() => {
    actionRef.current = {
      onAction,
      onCollapsedChange,
      onTaskSelectionChange,
    };
  }, [onAction, onCollapsedChange, onTaskSelectionChange]);

  useEffect(() => {
    selectedTaskSourceIdsRef.current = selectedTaskSourceIds;
    selectedTaskTypeKeyRef.current = selectedTaskTypeKey;
    syncTaskSelection(
      containerRef.current,
      selectedTaskSourceIds,
      selectedTaskTypeKey,
    );
  }, [selectedTaskSourceIds, selectedTaskTypeKey]);

  useImperativeHandle(ref, () => ({
    cancelPendingLayoutPreservation: () => {
      pendingLayoutAnchorRef.current = null;
    },
    fitCenter: () => {
      if (wheelZoomFrameRef.current !== undefined) {
        window.cancelAnimationFrame(wheelZoomFrameRef.current);
        wheelZoomFrameRef.current = undefined;
      }

      runAsync(
        fitGraphView(graphRef.current).then(() => {
          if (graphRef.current && !graphRef.current.destroyed) {
            const currentZoom = graphRef.current.getZoom();
            targetZoomRef.current = currentZoom;
            onZoomChangeRef.current?.(currentZoom);
          }
        }),
      );
    },
    preserveLayoutOnNextDataUpdate: anchorNodeId => {
      pendingLayoutAnchorRef.current = getLayoutAnchor(
        anchorNodeId ? nodeLookupRef.current.get(anchorNodeId) : undefined,
      );
    },
    zoomIn: () => {
      const graph = graphRef.current;

      if (!graph || graph.destroyed) {
        return;
      }

      if (wheelZoomFrameRef.current !== undefined) {
        window.cancelAnimationFrame(wheelZoomFrameRef.current);
        wheelZoomFrameRef.current = undefined;
      }

      const targetZoom = clampZoom(targetZoomRef.current + ZOOM_BUTTON_STEP);
      targetZoomRef.current = targetZoom;

      runAsync(
        graph.zoomTo(targetZoom, ZOOM_ANIMATION).then(() => {
          if (graphRef.current === graph && !graph.destroyed) {
            onZoomChangeRef.current?.(graph.getZoom());
          }
        }),
      );
    },
    zoomOut: () => {
      const graph = graphRef.current;

      if (!graph || graph.destroyed) {
        return;
      }

      if (wheelZoomFrameRef.current !== undefined) {
        window.cancelAnimationFrame(wheelZoomFrameRef.current);
        wheelZoomFrameRef.current = undefined;
      }

      const targetZoom = clampZoom(targetZoomRef.current - ZOOM_BUTTON_STEP);
      targetZoomRef.current = targetZoom;

      runAsync(
        graph.zoomTo(targetZoom, ZOOM_ANIMATION).then(() => {
          if (graphRef.current === graph && !graph.destroyed) {
            onZoomChangeRef.current?.(graph.getZoom());
          }
        }),
      );
    },
  }));

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const getCardLayerElement = (cardElement: HTMLElement) => {
      let element = cardElement.parentElement;

      while (element && element !== container) {
        const { position } = window.getComputedStyle(element);

        if (position !== 'static') {
          return element;
        }

        element = element.parentElement;
      }

      return cardElement;
    };

    const liftMenuLayer = (cardElement?: HTMLElement | null) => {
      const nextLayer = cardElement ? getCardLayerElement(cardElement) : null;

      if (activeMenuLayerRef.current === nextLayer) {
        return;
      }

      if (activeMenuLayerRef.current) {
        activeMenuLayerRef.current.style.zIndex = '';
      }

      activeMenuLayerRef.current = nextLayer;

      if (activeMenuLayerRef.current) {
        activeMenuLayerRef.current.style.zIndex = '10000';
      }
    };

    const handleMenuPointerOver = (event: PointerEvent) => {
      const { target } = event;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const menuWrap = target.closest<HTMLElement>(
        `.${styles.canvasNodeMoreWrap}, .${styles.canvasNodeAddWrap}`,
      );

      if (!menuWrap) {
        return;
      }

      liftMenuLayer(
        menuWrap.closest<HTMLElement>('[data-enterprise-carbon-node-id]'),
      );
    };

    const handleMenuPointerOut = (event: PointerEvent) => {
      const { relatedTarget, target } = event;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const menuWrap = target.closest<HTMLElement>(
        `.${styles.canvasNodeMoreWrap}, .${styles.canvasNodeAddWrap}`,
      );

      if (
        !menuWrap ||
        (relatedTarget instanceof HTMLElement &&
          menuWrap.contains(relatedTarget))
      ) {
        return;
      }

      liftMenuLayer(null);
    };

    const handleClick = (event: MouseEvent) => {
      const { target } = event;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const actionElement = target.closest<HTMLElement>(
        '[data-enterprise-carbon-action]',
      );

      if (!actionElement) {
        return;
      }

      const action = actionElement.dataset.enterpriseCarbonAction;
      const nodeId = actionElement.dataset.enterpriseCarbonNodeId;
      const node = nodeId ? nodeLookupRef.current.get(nodeId) : undefined;

      if (!node) {
        return;
      }

      event.stopPropagation();

      if (action === 'toggleTaskSelection' && node.taskContext) {
        actionRef.current.onTaskSelectionChange?.(node.taskContext);
        return;
      }

      event.preventDefault();

      if (action === 'toggle') {
        pendingLayoutAnchorRef.current = getLayoutAnchor(node);
        actionRef.current.onCollapsedChange?.(String(node.id), !node.collapsed);
        return;
      }

      if (action === 'showAddSourceMenu') {
        actionElement.focus({ preventScroll: true });
        return;
      }

      if (action === 'addSource' && node.actionPayload) {
        actionRef.current.onAction({
          nodeId: String(node.id),
          payload: node.actionPayload,
          type: 'addSource',
        });
        return;
      }

      if (action === 'associateProductFootprint' && node.actionPayload) {
        actionRef.current.onAction({
          payload: node.actionPayload,
          type: 'associateProductFootprint',
        });
        return;
      }

      if (action === 'sourceHistory' && node.actionPayload) {
        actionRef.current.onAction({
          payload: node.actionPayload,
          type: 'sourceHistory',
        });
        return;
      }

      if (action === 'sourceDelete' && node.actionPayload) {
        actionRef.current.onAction({
          payload: node.actionPayload,
          type: 'sourceDelete',
        });
        return;
      }

      if (action === 'sourceAttachment' && node.actionPayload) {
        actionRef.current.onAction({
          payload: node.actionPayload,
          type: 'sourceAttachment',
        });
        return;
      }

      if (action === 'detail' && node.actionPayload) {
        actionRef.current.onAction({
          nodeId: String(node.id),
          payload: node.actionPayload,
          type: 'sourceDetail',
        });
      }
    };

    const handleCardClick = (event: MouseEvent) => {
      const { target } = event;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest(`.${styles.canvasNodeMoreWrap}`)) {
        return;
      }

      const cardElement = target.closest<HTMLElement>(
        `[data-enterprise-carbon-node-id]`,
      );
      const nodeId = cardElement?.dataset.enterpriseCarbonNodeId;
      const node = nodeId ? nodeLookupRef.current.get(nodeId) : undefined;

      if (node?.nodeKind !== 'source' || !node.actionPayload) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      actionRef.current.onAction({
        nodeId: String(node.id),
        payload: node.actionPayload,
        type: 'sourceDetail',
      });
    };

    container.addEventListener('click', handleClick, true);
    container.addEventListener('click', handleCardClick);
    container.addEventListener('pointerover', handleMenuPointerOver);
    container.addEventListener('pointerout', handleMenuPointerOut);

    return () => {
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('click', handleCardClick);
      container.removeEventListener('pointerover', handleMenuPointerOver);
      container.removeEventListener('pointerout', handleMenuPointerOut);
      liftMenuLayer(null);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const { height, width } = getContainerSize(container);
    const graph = new Graph({
      animation: false,
      background: 'transparent',
      behaviors: [],
      container,
      data: { edges: [], nodes: [] },
      edge: {
        type: 'polyline',
      },
      height,
      node: {
        type: 'html',
      },
      padding: GRAPH_FIT_PADDING,
      width,
      zoomRange: GRAPH_ZOOM_RANGE,
    });

    graph.on(GraphEvent.AFTER_TRANSFORM, () => {
      if (!graph.rendered || graph.destroyed || graphRef.current !== graph) {
        return;
      }

      const currentZoom = graph.getZoom();
      container.style.setProperty(
        '--enterprise-carbon-menu-scale',
        String(1 / currentZoom),
      );
      onZoomChangeRef.current?.(currentZoom);
    });

    const animateWheelZoom = () => {
      if (graph.destroyed || graphRef.current !== graph) {
        wheelZoomFrameRef.current = undefined;
        return;
      }

      const currentZoom = graph.getZoom();
      const zoomDifference = targetZoomRef.current - currentZoom;

      if (Math.abs(zoomDifference) <= WHEEL_ZOOM_THRESHOLD) {
        wheelZoomFrameRef.current = undefined;
        runAsync(
          graph.zoomTo(
            targetZoomRef.current,
            false,
            wheelZoomOriginRef.current,
          ),
        );
        return;
      }

      runAsync(
        graph.zoomTo(
          currentZoom + zoomDifference * WHEEL_ZOOM_EASING,
          false,
          wheelZoomOriginRef.current,
        ),
      );
      wheelZoomFrameRef.current =
        window.requestAnimationFrame(animateWheelZoom);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (graph.destroyed || graphRef.current !== graph) {
        return;
      }

      if (event.ctrlKey) {
        const zoomDelta = getWheelZoomDelta(event, container.clientHeight);

        if (!zoomDelta) {
          return;
        }

        const limitedDelta = Math.min(
          Math.max(zoomDelta, -MAX_WHEEL_ZOOM_DELTA),
          MAX_WHEEL_ZOOM_DELTA,
        );
        const ratio = Math.exp(-limitedDelta * WHEEL_ZOOM_SENSITIVITY);
        const bounds = container.getBoundingClientRect();
        wheelZoomOriginRef.current = [
          event.clientX - bounds.left,
          event.clientY - bounds.top,
        ];
        targetZoomRef.current = clampZoom(targetZoomRef.current * ratio);

        if (wheelZoomFrameRef.current === undefined) {
          wheelZoomFrameRef.current =
            window.requestAnimationFrame(animateWheelZoom);
        }
        return;
      }

      if (wheelZoomFrameRef.current !== undefined) {
        window.cancelAnimationFrame(wheelZoomFrameRef.current);
        wheelZoomFrameRef.current = undefined;
        targetZoomRef.current = graph.getZoom();
      }

      runAsync(
        graph.translateBy(
          [
            -event.deltaX * WHEEL_MOVE_SENSITIVITY,
            -event.deltaY * WHEEL_MOVE_SENSITIVITY,
          ],
          false,
        ),
      );
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    graphRef.current = graph;

    const resizeGraph = () => {
      if (
        !containerRef.current ||
        graph.destroyed ||
        graphRef.current !== graph
      ) {
        return;
      }

      if (wheelZoomFrameRef.current !== undefined) {
        window.cancelAnimationFrame(wheelZoomFrameRef.current);
        wheelZoomFrameRef.current = undefined;
      }

      const size = getContainerSize(containerRef.current);
      graph.resize(size.width, size.height);
    };

    const observer = new ResizeObserver(resizeGraph);
    observer.observe(container);

    return () => {
      if (wheelZoomFrameRef.current !== undefined) {
        window.cancelAnimationFrame(wheelZoomFrameRef.current);
        wheelZoomFrameRef.current = undefined;
      }
      observer.disconnect();
      container.removeEventListener('wheel', handleWheel);
      container.style.removeProperty('--enterprise-carbon-menu-scale');
      graphRef.current = null;
      renderVersionRef.current += 1;
      graph.destroy();
      nodeLookupRef.current = new Map();
      pendingLayoutAnchorRef.current = null;
      activeMenuLayerRef.current = null;
      hasInitialFitRef.current = false;
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;

    if (!graph || graph.destroyed || !data) {
      return;
    }

    const layoutAnchor = pendingLayoutAnchorRef.current;
    const viewportAnchorOffset = layoutAnchor
      ? getViewportAnchorOffset(containerRef.current, layoutAnchor.nodeId)
      : null;
    let viewportSnapshot: ViewportAnchorSnapshot | null = null;

    if (graph.rendered && layoutAnchor && viewportAnchorOffset) {
      const position = graph.getPosition();
      viewportSnapshot = {
        nodeId: layoutAnchor.nodeId,
        offset: viewportAnchorOffset,
        position: [position[0], position[1]],
        zoom: graph.getZoom(),
      };
    }
    const nextNodeLookup = new Map<string, EnterpriseCarbonCanvasNode>();
    const nextGraphData = toGraphData(data, nextNodeLookup, layoutAnchor);
    const renderVersion = renderVersionRef.current + 1;
    renderVersionRef.current = renderVersion;
    pendingLayoutAnchorRef.current = null;

    const renderGraphData = async () => {
      if (
        graph.destroyed ||
        graphRef.current !== graph ||
        renderVersion !== renderVersionRef.current
      ) {
        return;
      }

      nodeLookupRef.current = nextNodeLookup;
      graph.setData(nextGraphData);
      await graph.render();

      if (
        graph.destroyed ||
        graphRef.current !== graph ||
        renderVersion !== renderVersionRef.current
      ) {
        return;
      }

      if (viewportSnapshot) {
        await graph.zoomTo(viewportSnapshot.zoom, false, [0, 0]);

        if (
          graph.destroyed ||
          graphRef.current !== graph ||
          renderVersion !== renderVersionRef.current
        ) {
          return;
        }

        const nextAnchorOffset = getViewportAnchorOffset(
          containerRef.current,
          viewportSnapshot.nodeId,
        );

        if (nextAnchorOffset) {
          await graph.translateBy(
            [
              viewportSnapshot.offset[0] - nextAnchorOffset[0],
              viewportSnapshot.offset[1] - nextAnchorOffset[1],
            ],
            false,
          );
        } else {
          await graph.translateTo(viewportSnapshot.position, false);
        }

        targetZoomRef.current = viewportSnapshot.zoom;
        onZoomChangeRef.current?.(viewportSnapshot.zoom);
      }

      syncTaskSelection(
        containerRef.current,
        selectedTaskSourceIdsRef.current,
        selectedTaskTypeKeyRef.current,
      );

      if (hasInitialFitRef.current) {
        return;
      }

      hasInitialFitRef.current = true;

      await fitGraphView(graph);

      if (
        !graph.destroyed &&
        graphRef.current === graph &&
        renderVersion === renderVersionRef.current
      ) {
        const currentZoom = graph.getZoom();
        targetZoomRef.current = currentZoom;
        onZoomChangeRef.current?.(currentZoom);
      }
    };

    renderQueueRef.current = renderQueueRef.current
      .catch(() => undefined)
      .then(renderGraphData);
    runAsync(renderQueueRef.current);
  }, [data]);

  useEffect(() => {
    if (!resetSignal) {
      return;
    }

    runAsync(
      fitGraphView(graphRef.current).then(() => {
        if (graphRef.current && !graphRef.current.destroyed) {
          const currentZoom = graphRef.current.getZoom();
          targetZoomRef.current = currentZoom;
          onZoomChangeRef.current?.(currentZoom);
        }
      }),
    );
  }, [resetSignal]);

  return <div ref={containerRef} className={styles.canvasGraphContainer} />;
};

export default forwardRef(EnterpriseCarbonMindMap);
