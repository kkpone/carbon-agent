import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export interface NodeHoverMenuOptions {
  hoverDelay?: number;
  showOnEmpty?: boolean;
}

export interface NodeHoverState {
  pos: number | null;
  node: ProseMirrorNode | null;
  nodeStart: number;
  nodeEnd: number;
  rect: DOMRect | null;
  shouldHighlight: boolean;
}

export const nodeHoverMenuPluginKey = new PluginKey<NodeHoverState>(
  'nodeHoverMenu',
);

export const NodeHoverMenu = Extension.create<NodeHoverMenuOptions>({
  name: 'nodeHoverMenu',

  addOptions() {
    return {
      hoverDelay: 200,
      showOnEmpty: true,
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    const hoverDelay = this.options.hoverDelay || 200;
    let hoverTimeout: NodeJS.Timeout | null = null;
    let currentState: NodeHoverState = {
      pos: null,
      node: null,
      nodeStart: 0,
      nodeEnd: 0,
      rect: null,
      shouldHighlight: false,
    };

    return [
      new Plugin({
        key: nodeHoverMenuPluginKey,

        state: {
          init() {
            return currentState;
          },
          apply(tr, oldState) {
            const meta = tr.getMeta(nodeHoverMenuPluginKey);
            if (meta) {
              return meta;
            }
            return oldState;
          },
        },

        props: {
          decorations(state) {
            const pluginState = nodeHoverMenuPluginKey.getState(state);

            // 只在 shouldHighlight 为 true 时才显示高亮
            if (
              !pluginState ||
              pluginState.pos === null ||
              !pluginState.shouldHighlight
            ) {
              return DecorationSet.empty;
            }

            const { nodeStart, nodeEnd } = pluginState;

            // 为当前 hover 的节点添加高亮装饰
            const decoration = Decoration.node(nodeStart, nodeEnd, {
              class: 'node-hover-highlight',
            });

            return DecorationSet.create(state.doc, [decoration]);
          },

          handleDOMEvents: {
            mousemove(view, event) {
              if (hoverTimeout) {
                clearTimeout(hoverTimeout);
              }

              hoverTimeout = setTimeout(() => {
                const pos = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });

                if (!pos) {
                  // 鼠标不在编辑器内容上
                  const tr = view.state.tr.setMeta(nodeHoverMenuPluginKey, {
                    pos: null,
                    node: null,
                    nodeStart: 0,
                    nodeEnd: 0,
                    rect: null,
                    shouldHighlight: false,
                  });
                  view.dispatch(tr);
                  return;
                }

                const $pos = view.state.doc.resolve(pos.pos);

                // 获取当前块级节点（深度最大的块级节点）
                let depth = $pos.depth;
                let node: ProseMirrorNode | null = null;
                let nodeStart = 0;
                let nodeEnd = 0;

                // 向上查找块级节点
                while (depth > 0) {
                  const currentNode = $pos.node(depth);

                  // 检查是否是块级节点
                  if (currentNode.isBlock && currentNode.type.name !== 'doc') {
                    node = currentNode;
                    nodeStart = $pos.before(depth);
                    nodeEnd = $pos.after(depth);
                    break;
                  }
                  depth--;
                }

                if (!node) {
                  return;
                }

                // 获取 DOM 节点的位置信息
                const domNode = view.nodeDOM(nodeStart);
                let rect: DOMRect | null = null;

                if (domNode instanceof HTMLElement) {
                  rect = domNode.getBoundingClientRect();
                }

                // 保留当前的 shouldHighlight 状态，除非节点改变
                const isSameNode =
                  currentState.nodeStart === nodeStart &&
                  currentState.nodeEnd === nodeEnd;

                const newState: NodeHoverState = {
                  pos: pos.pos,
                  node,
                  nodeStart,
                  nodeEnd,
                  rect,
                  // 如果是同一个节点，保留 shouldHighlight；否则重置为 false
                  shouldHighlight: isSameNode
                    ? currentState.shouldHighlight
                    : false,
                };

                currentState = newState;

                const tr = view.state.tr.setMeta(
                  nodeHoverMenuPluginKey,
                  newState,
                );
                view.dispatch(tr);
              }, hoverDelay);

              return false;
            },

            mouseleave(view) {
              if (hoverTimeout) {
                clearTimeout(hoverTimeout);
              }

              // 不在这里清空状态，完全由 React 组件控制
              // 这样可以确保鼠标在按钮上时状态不会被清空

              return false;
            },
          },
        },

        view() {
          // View will be created in node-hover-menu-view.tsx
          return {
            destroy() {
              // Cleanup handled by React component
            },
          };
        },
      }),
    ];
  },
});

export default NodeHoverMenu;
