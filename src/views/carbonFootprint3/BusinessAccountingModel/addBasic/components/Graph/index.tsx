/*
 * @@description: 过程核算 图形化模型
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-02-28 18:38:24
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-24 14:20:30
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-11 18:20:30
 */
import I18N from '@src/lang/I18N';
import '@ant-design/charts/dist/index.css';
import { FlowAnalysisGraph, FlowAnalysisGraphConfig } from '@ant-design/charts';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { G6GraphEvent, Graph, IG6GraphEvent, IGroup } from '@antv/g6';
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import {
  GET837525055ab78da4305ce1d9f521bea3,
  GETe649f94769631ecc32c4f927e92f610c,
  POST019458d093852b75a996ddb8bf0570f1,
  POST249768a26aeb65886b842cb4c58c1479,
} from '@src/sdks_v2/footprint3V2ApiDocs';
import { Toast } from '@src/utils/Toast';
import {
  ALL_EMISSION_LABEL,
  PROCESS_ACCOUNT_LIFE_CYCLE_LABEL_MAP,
} from '@src/views/carbonFootprint3/constant';
import {
  getProcessView,
  getProcessNextView,
  postProcessViewNodeStatus,
  postProcessInDelete,
} from '@src/views/carbonFootprint3/discharge/process/service';
import {
  CUSTOME_NODE_STATE,
  GRAPH_NODE_NAME,
  GRAPH_SHAPE_NAME,
  HoverGroupIds,
  PROCESS_ACCOUNT_NODE_INFO,
} from '@src/views/carbonFootprint3/graph/constant';
import { tooltip } from '@src/views/carbonFootprint3/graph/plugin';
import {
  getAllTopNode,
  getNodeByName,
} from '@src/views/carbonFootprint3/graph/utils';
import { graphWheelEvent } from '@src/views/carbonFootprint3/util';
import { CO2E } from '@src/views/carbonInternational/organizationalManagement/utils';
import { Button, InputNumber, Modal } from 'antd';
import { ceil, compact, uniqBy, round } from 'lodash-es';
import { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ValueOf } from 'type-fest';

import { AccountingInfoData } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';

import style from './index.module.less';
import { postProcessBusinessAccountingEmissionInStore } from './service';
import { NodeData, TagName, TreeData, ViewDatas } from './types';
import {
  getRemoveNodeId,
  isFold,
  MatchTypeNameMap,
  transformViewDatas,
} from './utils';
import {
  CustomNodeState,
  registerProcessAccountNode,
  removeHoverState,
  setHoverState,
} from './utils/registNodes';

const { confirm } = Modal;

type Props = {
  accountInfo: AccountingInfoData;
  apiExtraParams?: ApiExtraParams;
  infoId?: number;
  processId?: number;
  isProcess?: boolean;
  onClickNode?: (
    tagName: TagName,
    model: NodeData['value'],
    parentNode?: NodeData,
  ) => any;
  onTaskCreate?: (value: NodeData['value']) => void;
  cRef: Ref<{ resetGraph: () => Promise<any> }>;
  isOnlyDetail?: boolean;
};

export const ProcessModelGraph = ({
  accountInfo,
  infoId,
  processId,
  isProcess,
  onClickNode,
  onTaskCreate,
  cRef,
  isOnlyDetail,
  apiExtraParams,
}: Props) => {
  registerProcessAccountNode({
    isProcess,
    isOnlyDetail,
    showTaskAction: Boolean(onTaskCreate),
  });
  const [viewDatas, setViewDatas] = useState<TreeData>();
  /** 画布放大倍数 */
  const [zoomNum, setZoomNum] = useState<number>(1);

  const graphRef = useRef<Graph>();
  const focusNode = useRef<string>('');

  /** 更新画布数据 */
  const refreshGraph = () => getGraphDatas();
  /** 获取所有子节点 - 点击折叠按钮时调用 */
  const getChildren = (value: NodeData['value']) => {
    (isProcess ? getProcessNextView : GETe649f94769631ecc32c4f927e92f610c)({
      ...apiExtraParams,
      dataId: value.dataId,
    }).then(({ data }) => {
      const result = data?.data as ViewDatas;
      if (result) {
        const newTreeData = transformViewDatas(
          compact(
            (result.children || []).map(child => ({
              ...child,
              processName: result.name,
            })),
          ),
        );

        setViewDatas(s => {
          // 防止改变原有节点顺序
          s?.nodes.forEach(item => {
            if (item.id === value.id) item.value.status = 1;
          });
          return {
            nodes: uniqBy([...(s?.nodes || []), ...newTreeData.nodes], 'id'),
            edges: [...(s?.edges || []), ...newTreeData.edges],
          };
        });
      }
    });
  };

  /**
   * @description: 删除节点
   */
  const deleteNode = async (deleteItem: NodeData['value']) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmWhetherToDelete, {
        val1: deleteItem.name,
      }),
      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        if (isProcess) {
          postProcessInDelete({
            ...apiExtraParams,
            id: deleteItem.dataId,
          }).then(({ data }) => {
            if (data?.code === 200) {
              Toast('success', I18N.carbonFootprint.deleteSuccessful);
              refreshGraph();
            }
          });
        } else {
          POST249768a26aeb65886b842cb4c58c1479({
            ...apiExtraParams,
            record: { id: deleteItem.dataId },
          }).then(({ data }) => {
            if (data?.code === 200) {
              Toast('success', I18N.carbonFootprint.deleteSuccessful);
              refreshGraph();
            }
          });
        }
      },
    });
  };

  /**
   * 保存到库
   * @param nodeValue node节点数据
   */
  const saveEmissionSourceInStore = async (nodeValue: NodeData['value']) => {
    if (nodeValue.libState !== 1) {
      await postProcessBusinessAccountingEmissionInStore({
        ...apiExtraParams,
        id: Number(nodeValue.dataId),
      });
      Toast('success', I18N.carbonFootprint3.successfullySavedTo);
      refreshGraph();
    }
  };

  /**
   * @description: 重置画布
   */
  const getGraphDatas = async () => {
    if (isProcess && processId !== undefined) {
      getProcessView({ ...apiExtraParams, id: processId }).then(({ data }) => {
        if (
          (data?.data as { children: Record<string, unknown>[] })
            ?.children instanceof Array
        ) {
          (
            data?.data as { children: Record<string, unknown>[] }
          )?.children.forEach(child => {
            child.processName = (data?.data as { name: string })?.name;
          });
        }
        setViewDatas(transformViewDatas(compact([data?.data]) as ViewDatas[]));
      });
      return;
    }
    if (!infoId) {
      setViewDatas({ nodes: [], edges: [] });
    } else {
      GET837525055ab78da4305ce1d9f521bea3({
        ...apiExtraParams,
        id: infoId,
      }).then(({ data }) => {
        if (
          (data?.data as { children: Record<string, unknown>[] })
            ?.children instanceof Array
        ) {
          (
            data?.data as { children: Record<string, unknown>[] }
          )?.children.forEach(child => {
            child.processName = (data?.data as { name: string })?.name;
          });
        }
        setViewDatas(transformViewDatas(compact([data?.data]) as ViewDatas[]));
      });
    }
  };
  // 获取节点数据
  useEffect(() => {
    getGraphDatas();
  }, [infoId]);

  /**
   * 主动触发子组件 - 获取文件
   */
  useImperativeHandle(cRef, () => ({
    resetGraph: refreshGraph,
  }));

  useEffect(() => {
    refreshGraph();
  }, [accountInfo]);

  if (!viewDatas) return null;

  /**
   * @description: 是否删除icon的提示
   * @param {IG6GraphEvent} evt 鼠标移入的元素展示
   */
  // const isRemoveTooltipShow = (evt?: IG6GraphEvent) => {
  //   const showName: ValueOf<typeof GRAPH_SHAPE_NAME> =
  //     GRAPH_SHAPE_NAME.ICON_CLOSE;
  //   const currentName = evt?.target?.cfg?.name;
  //   const isShowRemove = showName === currentName;
  //   return isShowRemove;
  // };

  /** 是否展示排放源信息 tooltip */
  const isEmissionTooltipShow = (evt?: IG6GraphEvent) => {
    let showName: ValueOf<typeof GRAPH_SHAPE_NAME> = GRAPH_SHAPE_NAME.INFO_TEXT;
    const isShow =
      !!evt &&
      [GRAPH_SHAPE_NAME.INFO_TEXT, GRAPH_SHAPE_NAME.EMISSION_NAME].some(
        name => {
          // fixme 官方类型缺失
          // @ts-ignore
          const text = evt?.target?.attrs?.text;
          const currentName = evt?.target?.cfg?.name;
          const isShow = currentName === name && text.includes('...');
          if (isShow) {
            showName = name;
          }
          return isShow;
        },
      );
    return [isShow, showName as ValueOf<typeof GRAPH_SHAPE_NAME>] as const;
  };

  const config = {
    layout: {
      type: 'dagre',
      rankdir: 'TB',
      ranksepFunc: (node: { value: ViewDatas }) => {
        const { products } = node.value;
        if (products && products.length > 1) {
          return products.length * 20 + 40;
        }
        return 40;
      },
      preventOverlap: true,
      linkDistance: 150,
      nodeSize: [
        PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
        PROCESS_ACCOUNT_NODE_INFO.ROOT_RECT_HEIGHT,
      ],
    },

    defaultNode: {
      type: GRAPH_NODE_NAME.ROOT_NODE,
    },
    // tooltipCfg: {
    // NOTE 官方自带的tooltip插件 getContent 限制了 override，需要手动添加tooltip插件实现不同元素展示不同tooltip
    //     return `请将${MatchTypeNameMap?.[matchType]}信息写完整`;
    //      fixme 目前 ant-design-charts 不支持这种写法，可能是与react版本有关，待考察
    //      https://github1s.com/ant-design/ant-design-charts/blob/HEAD/packages/graphs/src/plugins/tooltip.ts
    //      或者之后手动实现插件，参考https://github1s.com/antvis/g6/blob/HEAD/packages/plugin/src/tooltip/index.ts
    // },
    // 不能使用，不然修改数据后画布状态会变化
    autoFit: false,
    // Animation
    fitCenter: false,
    // fitView: true,
    // fitViewPadding: 40,
    nodeCfg: {
      type: 'root-node',
      anchorPoints: [
        [0.5, 0],
        [0.5, 1],
      ],
    },
    edgeCfg: {
      type: 'polyline-self',
      style: {
        // 第一个折点到父级节点的距离
        offset: 30,
        // edge 圆角
        radius: 20,
        stroke: '#EBEDF0',
        lineWidth: 2,
      },
      endArrow: false,
      edgeStateStyles: {
        hover: {
          stroke: '#0CBF9F',
        },
      },
    },
    markerCfg: () => ({
      position: 'bottom',
      show: true,
    }),

    style: { background: 'rgb(247,248,250)' },
    behaviors: ['drag-canvas', 'drag-node'],
    onReady(graph: Graph) {
      graphRef.current = graph;
      graph.addPlugin(
        tooltip({
          offsetX: 10,
          offsetY: 10,
          getContent(e) {
            // "matchType": 1, //匹配类型：0因子,1过程,2供应商
            const value = e?.item?.getModel().value as NodeData['value'];
            const matchType = value?.matchType;
            let resultMsg = I18N.template(I18N.carbonFootprint3.pleaseSendMat, {
              val1: MatchTypeNameMap?.[matchType],
            });
            const [isShow, typeName] = isEmissionTooltipShow(e);

            // const isRemoveShow = isRemoveTooltipShow(e);

            // if (isRemoveShow) {
            //   const matchType = value?.matchType;
            //   resultMsg = `删除${MatchTypeNameMap?.[matchType]}`;
            // }

            if (isShow) {
              resultMsg =
                typeName === GRAPH_SHAPE_NAME.TOOLTIP_ICON
                  ? value.name
                  : `${value.emissionTotal || '-'} kg${CO2E}`;
            }

            if (e?.target?.cfg?.name === GRAPH_SHAPE_NAME.TOOLTIP_ICON) {
              resultMsg =
                {
                  ...ALL_EMISSION_LABEL(),
                  ...PROCESS_ACCOUNT_LIFE_CYCLE_LABEL_MAP,
                }[value.type] || '';
            }

            const div = document.createElement('div');
            div.className = style.tooltip;
            const content = document.createElement('span');
            content.innerHTML = resultMsg;
            content.className = style.content;
            const icon = document.createElement('span');
            icon.className = style.icon;
            div.appendChild(content);
            div.appendChild(icon);
            return div;
          },
          shouldBegin(evt) {
            if (!evt) return false;
            const result =
              [GRAPH_SHAPE_NAME.TOOLTIP_ICON].includes(
                evt?.target?.cfg?.name,
              ) || isEmissionTooltipShow(evt)[0];
            return result;
          },
        }),
      );
      // 处理click交互
      graph.on('node:click', ev => {
        // @ts-ignore
        const tag = ev?.target?.cfg?.name;
        ev.preventDefault();
        ev.stopPropagation();
        if (!tag) return;
        const model = ev.item?.getModel();
        const value = model?.value as unknown as NodeData['value'];
        focusNode.current = value.id;
        if (tag === GRAPH_SHAPE_NAME.ACCOUNT_EDIT_ICON) {
          focusNode.current = '';
        }
        // 获取上级的node节点信息，子节点需要展示上级的实际数量
        const { parentId } = value;
        const parentNode = viewDatas.nodes.find(
          viewData => viewData.id === parentId,
        );

        switch (tag) {
          case GRAPH_SHAPE_NAME.PRODUCT_INFO:
          case GRAPH_SHAPE_NAME.OUTPUT_INFO:
          case GRAPH_SHAPE_NAME.EXPORT_INFO:
          case GRAPH_SHAPE_NAME.ADD_EMISSION_TEXT:
          // case GRAPH_SHAPE_NAME.ADD_SUPPLY_TEXT:
          // eslint-disable-next-line
          case GRAPH_SHAPE_NAME.ADD_UNIT_TEXT:
          case GRAPH_SHAPE_NAME.INFO_RECT:
          case GRAPH_SHAPE_NAME.INFO_TEXT:
          case GRAPH_SHAPE_NAME.EMISSION_NAME:
          case GRAPH_SHAPE_NAME.ADD_SUPPLY_TEXT:
          case GRAPH_SHAPE_NAME.COPY_TEXT:
          case GRAPH_SHAPE_NAME.ACCOUNT_EDIT_ICON:
            onClickNode?.(
              [
                // 此3处的点击事件为同一事件，合并为一个输出
                GRAPH_SHAPE_NAME.INFO_RECT,
                GRAPH_SHAPE_NAME.INFO_TEXT,
                GRAPH_SHAPE_NAME.EMISSION_NAME,
              ].includes(tag)
                ? GRAPH_SHAPE_NAME.INFO_RECT
                : tag,
              value,
              parentNode,
            );

            // 隐藏 hover 弹窗
            if (ev.item) {
              graph.updateItem(ev.item, {
                [CUSTOME_NODE_STATE]: {
                  hoverGroup: '',
                  hover: false,
                } as CustomNodeState,
              });
            }
            break;
          // 删除节点
          case GRAPH_SHAPE_NAME.ICON_CLOSE:
            focusNode.current = value?.parentId;
            deleteNode(value);
            break;
          // 保存到库
          case GRAPH_SHAPE_NAME.SAVE_STORE_TEXT:
            saveEmissionSourceInStore(value);
            break;
          case GRAPH_SHAPE_NAME.CREATE_TASK_TEXT:
            onTaskCreate?.(value);
            break;
          case GRAPH_SHAPE_NAME.FOLD_ICON:
            // 暂时不需要向外面透传
            // onClickNode?.(tag, model?.value as unknown as NodeData['value']);
            if (isProcess) {
              postProcessViewNodeStatus({
                id: value.dataId,
                status: isFold(value) ? 1 : 0,
              });
            } else {
              POST019458d093852b75a996ddb8bf0570f1({
                ...apiExtraParams,
                id: value.dataId,
                status: isFold(value) ? 1 : 0,
              });
            }

            if (isFold(value)) {
              getChildren(value);
            } else {
              // remove
              // 这里的函数会被缓存，没法拿到最新的外层state
              setViewDatas(d => {
                if (!d) return undefined;
                // 找到所有要移除的节点
                const { ids: removeIds, edges } = getRemoveNodeId(
                  [value.id],
                  d.edges,
                );
                // 防止改变原有节点顺序
                d?.nodes.forEach(item => {
                  if (item.id === value.id) item.value.status = 0;
                });

                return {
                  edges,
                  nodes: uniqBy(
                    [
                      ...(d?.nodes.filter(n => !removeIds.includes(n.id)) ||
                        []),
                    ],
                    'id',
                  ),
                };
              });
            }
            break;
          default:
            // eslint-disable-next-line no-console
            console.warn('click not match any function');
        }
      });

      // 新增显示
      graph.on('node:mouseenter', (ev: G6GraphEvent) => {
        const targetName = ev.target.cfg.name;
        // 移动到折叠按钮上取消右侧显示
        if (targetName === GRAPH_SHAPE_NAME.FOLD_ICON) return;
        const node1 = getNodeByName(
          'border-group',
          getAllTopNode(ev),
        ) as IGroup;

        const node2 = getNodeByName(
          HoverGroupIds.childSetNode,
          getAllTopNode(ev),
        ) as IGroup;

        node1.show();
        node2.show();
      });
      graph.on('node:mouseleave', (ev: G6GraphEvent) => {
        const node = getNodeByName('border-group', getAllTopNode(ev)) as IGroup;
        removeHoverState(ev, graph);

        const node2 = getNodeByName(
          HoverGroupIds.childSetNode,
          getAllTopNode(ev),
        ) as IGroup;
        node.hide();
        node2.hide();
      });
      // 新增
      graph.on('node:mouseover', ev => {
        setHoverState(ev, graph, true);
      });
      graph.on('node:mouseout', ev => {
        setHoverState(ev, graph, false);
      });

      graph.on('wheel', ev => {
        graphWheelEvent(ev, graph);
        const ratio = ceil(graph.getZoom(), 2);

        setZoomNum(ratio);
      });
      graph.on('afterrender', () => {
        graph.refreshPositions();
        if (focusNode.current) {
          graph.focusItem(focusNode.current, false);
          focusNode.current = '';
        } else {
          // 只有一个的时候会放大太多
          const nodeArr = graph.getNodes();
          if (nodeArr && nodeArr.length > 3) {
            graph.fitView();
            const points = nodeArr[0].getAnchorPoints();
            // const newWidth = PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH;

            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            const modelX = points[0].x || nodeArr[0]._cfg?.model?.x;
            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            const modelY = points[0].y || nodeArr[0]._cfg?.model?.y;
            if ((modelX || modelX === 0) && (modelY || modelY === 0)) {
              const { x, y } = graph.getCanvasByPoint(modelX, modelY);
              graph.zoomTo(0.6, { x, y });
            }
          } else {
            graph.fitCenter();
          }

          const ratio = ceil(graph.getZoom(), 2);
          setZoomNum(ratio);
        }
      });
    },
  } as unknown as FlowAnalysisGraphConfig;
  if (!viewDatas?.nodes?.length) return null;

  /**
   * @description: 改变画布的放大和缩小
   * @param {string} status 放大还是缩小
   */
  const changeZoom = (status: 'zoomIn' | 'zoomOut') => {
    let num = zoomNum;
    const width = graphRef.current?.getWidth() || 1;
    const height = graphRef.current?.getHeight() || 1;

    const mathTruncNum = num;

    if (status === 'zoomIn') {
      num = mathTruncNum === 0 ? 1 : mathTruncNum + 0.2;
    } else {
      num = mathTruncNum === 0 ? 1 : mathTruncNum - 0.2;
    }
    if (num < 0.2) {
      num = 0.2;
    }

    num = round(num, 2);
    setZoomNum(num);
    graphRef.current?.zoomTo(num, { x: width / 2, y: height / 2 }, true, {
      duration: 150,
    });
  };

  /**
   * @description: 手动设置画布的放大缩小比例
   * @param {number} num 比例
   */
  const changeZoomValue = (num: number) => {
    const width = graphRef.current?.getWidth() || 1;
    const height = graphRef.current?.getHeight() || 1;
    const newNum = round(num / 100, 2);
    graphRef.current?.zoomTo(newNum, { x: width / 2, y: height / 2 }, true, {
      duration: 150,
    });

    setZoomNum(newNum);
  };

  return (
    <div className={style.graphWrapper}>
      <FlowAnalysisGraph
        {...config}
        menuCfg={{ show: false }}
        data={viewDatas}
        className={style.main}
        key={JSON.stringify(viewDatas)}
      />
      <div className={style.graphZoom}>
        <Button
          onClick={() => changeZoom('zoomOut')}
          className={style.graphZoomBtn}
          icon={<MinusOutlined />}
        />
        <InputNumber
          max={400}
          maxLength={3}
          min={0}
          type='number'
          controls={false}
          className={style.graphZoomNum}
          value={round(zoomNum * 100)}
          onChange={value => {
            const num = value || 1;
            const newNum = round(num / 100, 2);
            setZoomNum(newNum);
          }}
          onBlur={e => {
            const data = Number(e.target.value);
            changeZoomValue(data);
          }}
        />
        <span className={style.graphZoomNumPercent}>%</span>
        <Button
          onClick={() => changeZoom('zoomIn')}
          className={style.graphZoomBtn}
          icon={<PlusOutlined />}
        />
      </div>
    </div>
  );
};
