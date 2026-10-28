import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Node } from '@antv/g6';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import EmissionSourceDrawer from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import {
  ALL_EMISSION,
  ALL_EMISSION_LABEL,
  QUICK_ACCOUNT_EMISSION_ICON_MAP,
  QUICK_ACCOUNT_LIFE_CYCLE,
  QUICK_ACCOUNT_LIFE_CYCLE_LABEL,
  QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP,
} from '@src/views/carbonFootprint3/constant';
import Graph from '@src/views/carbonFootprint3/graph/graph';
import TreeGraph from '@src/views/carbonFootprint3/graph/treeGraph';
import {
  GraphTreeClassNode,
  GraphTreeNode,
} from '@src/views/carbonFootprint3/graph/type';
import { haveAccountAiPermissions } from '@src/views/carbonFootprint3/permissions';
import { isBuySupplier } from '@src/views/carbonFootprint3/service';
import { QuickAccountLifeCycleStage } from '@src/views/carbonFootprint3/type';
import { Timeout } from 'ahooks/lib/useRequest/src/types';
import { Button, InputNumber, Modal } from 'antd';
import classNames from 'classnames';
import { ceil, cloneDeep, has, round } from 'lodash-es';
import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useGlobalLoginModal } from '@/components/GlobalLoginModal';
import { LocaleContext } from '@/components/LocaleProvider';
import { getToken } from '@/utils/cookie';
import { useAccountIdBindWithUpgrade } from '@/utils/useAccountIdBindWithUpgrade';
import { getAccountingInfo } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/service';
import {
  getAiProcessStatus,
  postInitAccountExcel,
} from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/BuildModelDescribe/service';
import { AiProcessStatus } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/constant';
import { CompanyType } from '@/views/system/login/component/Login';

import EmissionDetailSheetDrawerDefault from './components/EmissionDetailSheetDrawer';
import {
  getGraphAccountView,
  postAIQuickAccountEmissionDelete,
  postQuickAccounEmissionInStore,
  postQuickAccountEmissionDelete,
} from './service';
import {
  GraphAccountLifeCycleData,
  GraphEmissionSource,
  QuickBuildVisualProps,
} from './type';
import { API_EXTRA_PARAMS_SNAPFLAG } from '../../constant';
import {
  BUILD_MODEL_VISUAL_CHANGE_TYPE,
  BuildModelVisualChangeType,
} from '../constant';
import style from '../index.module.less';

/** 接口常返回 null：与 undefined 一样视为无值，不能用 ?? 链直接接到 null */
function firstNonEmptySheetId(...vals: unknown[]): string | number | undefined {
  const found = vals.find(
    v => v !== undefined && v !== null && `${v}`.trim() !== '',
  );
  return found !== undefined ? (found as string | number) : undefined;
}

function firstNumericSheetIndex(...vals: unknown[]): number | undefined {
  const found = vals.find(
    v =>
      v !== undefined &&
      v !== null &&
      `${v}` !== '' &&
      !Number.isNaN(Number(v)),
  );
  return found !== undefined ? Number(found) : undefined;
}

function normalizeEmissionSheetFields(emission: GraphEmissionSource) {
  const wpsSheetId = firstNonEmptySheetId(emission.wpsSheetId);
  const sheetId = firstNonEmptySheetId(emission.sheetId);
  const sheetIndex = firstNumericSheetIndex(emission.sheetIndex);
  return {
    matchObject: { ...(emission.matchObject ?? {}) },
    wpsSheetId,
    sheetId,
    sheetIndex,
  };
}

const { DEFAULT, CLASS } = BuildModelVisualChangeType;
const ChangeTypeBtn = Object.keys(BUILD_MODEL_VISUAL_CHANGE_TYPE());

export const QuickBuildVisual: FC<QuickBuildVisualProps> = memo(
  ({
    accountInfo,
    cRef,
    isDetail,
    apiExtraParams,
    changeEmission,
    editAccount,
    noSaveStoreBtn,
    noSelectEmissionBtn,
    quickDrawerMatchWayBtns,
    quickDrawerMatchWayBtnValue,
    updateAccountInfo,
    enableFactorSourceRange,
    onEmissionTaskCreate,
  }) => {
    const { locale } = useContext(LocaleContext);
    const { openLoginModal } = useGlobalLoginModal();
    const handleAccountIdBindWithUpgrade = useAccountIdBindWithUpgrade();
    const { id, productPic, excelUrl, accountName } = accountInfo;
    const excelUrlRef = useRef(excelUrl);
    const accountIdRef = useRef(id);
    const updateAccountInfoRef = useRef(updateAccountInfo);
    const localeRef = useRef(locale);
    const apiExtraParamsRef = useRef(apiExtraParams);
    excelUrlRef.current = excelUrl;
    accountIdRef.current = id;
    updateAccountInfoRef.current = updateAccountInfo;
    localeRef.current = locale;
    apiExtraParamsRef.current = apiExtraParams;
    const operatePermission = !isDetail;
    const isShare =
      [
        API_EXTRA_PARAMS_SNAPFLAG.SHARE,
        API_EXTRA_PARAMS_SNAPFLAG.SAASSHARE,
      ].includes(apiExtraParams?.snapFlag) || has(apiExtraParams, 'snapFlag');

    const graphContainerId = 'footprintAccountGraph';
    const graphTreeContainerId = 'footprintAccountTreeGraph';

    /** 是否展示发起收数按钮 */
    const [showSupplier, setShowSupplier] = useState(false);

    const [detailDataDrawerOpen, setDetailDataDrawerOpen] = useState(false);
    const [detailDataDrawerWpsSheetId, setDetailDataDrawerWpsSheetId] =
      useState<string | number | undefined>();
    const [detailDataDrawerSheetIndex, setDetailDataDrawerSheetIndex] =
      useState<number | undefined>();
    /** 仅接口原始 wpsSheetId，用于抽屉内判断是否调 syncWpsSheetMap（不含 sheetId 兜底） */
    const [detailDrawerApiWpsSheetId, setDetailDrawerApiWpsSheetId] = useState<
      string | number | undefined
    >();
    const [detailDrawerEmissionName, setDetailDrawerEmissionName] =
      useState<string>('');
    const [detailDrawerCategoryName, setDetailDrawerCategoryName] =
      useState<string>('');
    const [detailDrawerStageName, setDetailDrawerStageName] =
      useState<string>('');
    const [detailDrawerEmissionId, setDetailDrawerEmissionId] = useState<
      number | undefined
    >();

    /** 明细抽屉对应画布节点 id，syncWpsSheetMap 成功后用于从刷新后的图更新 wpsSheetId */
    const detailDrawerGraphNodeIdRef = useRef<string | undefined>(undefined);

    /** init 后立刻打开抽屉：父级 excelUrl 可能尚未更新，用核算详情接口返回值覆盖 */
    const [detailDrawerExcelUrlOverride, setDetailDrawerExcelUrlOverride] =
      useState<string | undefined>();

    /** 画布放大倍数 */
    const [zoomNum, setZoomNum] = useState<number>(1);

    const [readPretty, setReadPretty] = useState(false);

    /** 排放源的id */
    const [emissionSourceId, setEmissionSourceId] = useState<number>();

    /** 是否是复制的排放源 */
    const [emissionCopyStatus, setEmissionCopyStatus] =
      useState<boolean>(false);

    /** ai临时排放源标识 */
    const [emissionSourceAiFlag, setEmissionSourceAiFlag] = useState<number>();

    const [emissionSourceDrawerVisible, setEmissionSourceDrawerVisible] =
      useState(false);

    const [stage, setStage] = useState<QuickAccountLifeCycleStage>(
      QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL,
    );

    const graphRef: { instance: Graph | null } = useMemo(
      () => ({ instance: null }),
      [],
    );
    const graphContainerRef = useRef<HTMLDivElement>(null);
    const graphTreeContainerRef = useRef<HTMLDivElement>(null);

    /** 是否中断自动建模过程 */
    const aiStopBuildStatus = useRef(false);

    // 自动建模的定时器
    const aiStopBuildSetTime = useRef<Timeout>();

    /** 切换原视图、按分类 */
    const [graphType, setGraphType] =
      useState<BuildModelVisualChangeType>(DEFAULT);

    const aiProcessTimerRef = useRef<Timeout>();
    const resizeGraphCanvas = useCallback(() => {
      const graph = graphRef.instance?.graph;
      const container =
        graphType === CLASS
          ? graphTreeContainerRef.current
          : graphContainerRef.current;

      if (!graph || !container) {
        return;
      }

      const { width, height } = container.getBoundingClientRect();
      const nextWidth = Math.round(width);
      const nextHeight = Math.round(height);

      if (nextWidth <= 0 || nextHeight <= 0) {
        return;
      }

      graph.changeSize(nextWidth, nextHeight);
    }, [graphRef, graphType]);
    /**
     * 处理默认原视图数据
     * @param data 接口返回可视化数据
     */
    const transferDefaultData = (data: GraphAccountLifeCycleData[]) => {
      const treeNodeList: GraphTreeNode[] = data.map(lifeCycle => {
        const { code, name, total, emissionList, typeName, rate } = lifeCycle;
        return {
          id: code,
          name,
          typeName,
          img: QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP[code],
          extraData: {
            total,
            rate,
          },
          children: emissionList[0].map(emission => {
            const {
              amount,
              unitName,
              type,
              name: emissionName,
              emissionTotal,
              typeName,
              matchWay,
              requestState,
              emissionRate,
              libState,
              typeExtra,
              aiFlag,
              transTotal,
              unitStr,
              accountEmissionTransportList,
              needTrans,
              accountRefer,
            } = emission;

            const sheetFields = normalizeEmissionSheetFields(emission);
            const accountReferenceName =
              sheetFields.matchObject?.accountName || accountRefer?.accountName;

            let emissionTotalText = amount ? `${amount}${unitName}` : '-';
            if (
              type === ALL_EMISSION.TRANS &&
              typeExtra &&
              typeExtra.way !== 3
            ) {
              emissionTotalText = I18N.template(I18N.components.typeE3, {
                val1: typeExtra.amount || '-',
                val2: typeExtra.unitName || '-',
                val3: typeExtra.distance || '-',
              });
            }
            return {
              id: emission.id,
              name: ALL_EMISSION_LABEL()[type],
              img: QUICK_ACCOUNT_EMISSION_ICON_MAP[type],
              typeName,
              type,
              extraData: {
                accountExcelUrl: excelUrl,
                unitStr,
                emissionId: emission.id,
                aiFlag,
                transTotal,
                accountEmissionTransportList,
                needTrans,
                isShare,
                hideSaveStore: noSaveStoreBtn,
                aiStatus: undefined,
                name: emissionName,
                consumption: emissionTotalText,
                total: emissionTotal ?? '-',
                rate: emissionRate ?? 0,
                accountLifeCycleStage: code,
                isCompleted: emissionTotal !== null && emissionTotal !== '',
                isSupplierData: matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER,
                isAccountReferenceData:
                  matchWay === MODEL_EMISSION_MATCH_WAY.MODEL_REFER,
                isWaitSupplierReply:
                  matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
                  requestState === MODEL_EMISSION_REQUEST_STATE.WAITING,
                status: libState,
                isSaved: !!libState,
                showTaskAction: Boolean(onEmissionTaskCreate),
                matchWay,
                requestState,
                matchObject: sheetFields.matchObject,
                accountRefer,
                accountReferenceName,
                wpsSheetId: sheetFields.wpsSheetId,
                sheetId: sheetFields.sheetId,
                sheetIndex: sheetFields.sheetIndex,
                type,
              },
            };
          }),
        };
      });
      return treeNodeList;
    };

    const setEmissionsChildren = (
      emissionsChildNew: GraphTreeClassNode,
      emissionData: GraphTreeClassNode,
    ) => {
      if (emissionsChildNew.children?.length === 0) {
        emissionsChildNew.children = [emissionData];
      } else {
        const child = emissionsChildNew?.children || [];
        child[0] = setEmissionsChildren(child[0], emissionData);
      }
      return emissionsChildNew;
    };

    /**
     * 递归设置排放源children
     * @param emissions 排放源list
     */
    const setEmissionsChild = (
      emissions: GraphEmissionSource[],
      code: number,
    ) => {
      let emissionsChild: GraphTreeClassNode | undefined;
      emissions.forEach(emissionData => {
        const {
          type,
          amount,
          name: emissionName,
          emissionTotal,
          libState,
          typeName,
          matchWay,
          requestState,
          emissionRate,
          unitName,
          typeExtra,
          aiFlag,
          transTotal,
          unitStr,
          accountEmissionTransportList,
          needTrans,
          accountRefer,
        } = emissionData;

        const sheetFields = normalizeEmissionSheetFields(emissionData);
        const accountReferenceName =
          sheetFields.matchObject?.accountName || accountRefer?.accountName;

        let emissionTotalText = amount ? `${amount}${unitName}` : '-';
        if (type === ALL_EMISSION.TRANS && typeExtra && typeExtra.way !== 3) {
          emissionTotalText = I18N.template(I18N.components.typeE2, {
            val1: typeExtra.amount || '-',
            val2: typeExtra.unitName || '-',
            val3: typeExtra.distance || '-',
          });
        }

        const setEmissionData = {
          id: emissionData.id,
          name: ALL_EMISSION_LABEL()[type],
          img: QUICK_ACCOUNT_EMISSION_ICON_MAP[type],
          typeName,
          extraData: {
            accountExcelUrl: excelUrl,
            aiFlag,
            transTotal,
            unitStr,
            accountEmissionTransportList,
            needTrans,
            hideSaveStore: noSaveStoreBtn,
            emissionId: emissionData.id,
            name: emissionName,
            consumption: emissionTotalText,
            total: emissionTotal,
            isShare,
            accountLifeCycleStage: code,
            isCompleted: emissionTotal !== null && emissionTotal !== '',
            isSupplierData: matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER,
            isAccountReferenceData:
              matchWay === MODEL_EMISSION_MATCH_WAY.MODEL_REFER,
            rate: emissionRate ?? 0,
            isWaitSupplierReply:
              matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
              requestState === MODEL_EMISSION_REQUEST_STATE.WAITING,
            status: libState,
            isSaved: !!libState,
            showTaskAction: Boolean(onEmissionTaskCreate),
            matchWay,
            requestState,
            matchObject: sheetFields.matchObject,
            accountRefer,
            accountReferenceName,
            wpsSheetId: sheetFields.wpsSheetId,
            sheetId: sheetFields.sheetId,
            sheetIndex: sheetFields.sheetIndex,
            type,
            typeExtra,
          },
          children: [],
        };

        if (!emissionsChild) {
          emissionsChild = cloneDeep(setEmissionData);
        } else {
          emissionsChild = setEmissionsChildren(
            emissionsChild,
            cloneDeep(setEmissionData),
          );
        }
      });
      return emissionsChild;
    };

    /**
     * 处理按分类数据
     * @param data 接口返回可视化数据
     */
    const transferClassData = (data: GraphAccountLifeCycleData[]) => {
      // 被收起的id
      const sessionIds = sessionStorage.getItem('QuickGraphCollapseIds');
      const idsArr: string[] = sessionIds ? JSON.parse(sessionIds) : [];
      const treeNodeList: GraphTreeClassNode[] = data.map(lifeCycle => {
        const { code, name, total, emissionList, typeName, rate } = lifeCycle;

        return {
          id: code,
          name,
          typeName,
          img: QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP[code],
          extraData: {
            total,
            status: idsArr.includes(String(code)),
            hasChild: emissionList && emissionList.length > 0,
            rate,
          },
          children: idsArr.includes(String(code))
            ? []
            : emissionList.map(
                emissions =>
                  setEmissionsChild(emissions, code) as GraphTreeClassNode,
              ),
        };
      });
      return treeNodeList;
    };

    /**
     * 获取核算的数据
     */
    const getAccountLifeCycle = useCallback(
      async (accountId: number, groupTypeData: BuildModelVisualChangeType) => {
        try {
          const resp = await getGraphAccountView({
            ...apiExtraParams,
            id: accountId,
            groupType: groupTypeData,
            lang: serviceLangMap[locale],
          });
          const {
            code,
            name,
            typeName,
            total,
            type,
            scope,
            startTime,
            endTime,
          } = resp.data.data;
          const apiData = resp.data.data.children || [];
          const treeNodeList =
            groupTypeData === DEFAULT
              ? transferDefaultData(apiData)
              : transferClassData(apiData);
          return groupTypeData === DEFAULT
            ? ([
                {
                  id: code,
                  name,
                  typeName,
                  isRoot: true,
                  img: productPic || defaultImg,
                  extraData: {
                    total: total ?? '-',
                    type,
                    scope,
                    startTime,
                    endTime,
                  },
                },
                ...treeNodeList,
              ] as GraphTreeNode[] | GraphTreeClassNode[])
            : ([
                {
                  id: code,
                  name,
                  typeName,
                  isRoot: true,
                  img: productPic || defaultImg,
                  extraData: {
                    total: total ?? '-',
                    type,
                    scope,
                    startTime,
                    endTime,
                  },
                  children: treeNodeList,
                },
              ] as GraphTreeNode[] | GraphTreeClassNode[]);
        } catch {
          return [];
        }
      },
      [
        apiExtraParams,
        excelUrl,
        graphType,
        isDetail,
        locale,
        noSaveStoreBtn,
        onEmissionTaskCreate,
        productPic,
      ],
    );

    const updateGraph = async () => {
      getAccountLifeCycle(id, graphType).then(treeNodeList => {
        graphRef.instance?.changeData(treeNodeList);
      });
    };

    useEffect(() => {
      if (!graphRef.instance || !excelUrl) {
        return;
      }
      updateGraph();
    }, [excelUrl]);

    const refreshDrawerSheetPropsFromGraph = useCallback(
      (nodeIdStr: string) => {
        window.setTimeout(() => {
          try {
            const graphItem = graphRef.instance?.graph?.findById(nodeIdStr);
            if (!graphItem) return;
            const nodeModel = graphItem.getModel?.();
            const extra =
              (nodeModel?.extraData as Record<string, unknown>) || {};
            const mo = extra.matchObject as Record<string, unknown> | undefined;
            const w = firstNonEmptySheetId(
              extra.wpsSheetId,
              mo?.wpsSheetId,
              extra.sheetId,
              mo?.sheetId,
            );
            const apiWpsOnly = firstNonEmptySheetId(
              extra.wpsSheetId,
              extra.wps_sheet_id,
              mo?.wpsSheetId,
              mo?.wps_sheet_id,
            );
            const si = firstNumericSheetIndex(extra.sheetIndex, mo?.sheetIndex);
            setDetailDataDrawerWpsSheetId(w ?? undefined);
            setDetailDrawerApiWpsSheetId(apiWpsOnly ?? undefined);
            setDetailDataDrawerSheetIndex(si);
          } catch {
            /* ignore */
          }
        }, 150);
      },
      [],
    );

    /**
     * 明细抽屉内完成 syncWpsSheetMap 绑定后的回调：重新拉取核算详情并重绘画布，
     * 以便排放源带上 wpsSheetId；并同步更新抽屉上的 sheet 定位 props。
     */
    const refreshAccountAfterSheetBind = useCallback(async () => {
      updateAccountInfo();
      const treeNodeList = await getAccountLifeCycle(id, graphType);
      graphRef.instance?.changeData(treeNodeList);
      const nid = detailDrawerGraphNodeIdRef.current;
      if (nid) {
        refreshDrawerSheetPropsFromGraph(nid);
      }
    }, [
      updateAccountInfo,
      getAccountLifeCycle,
      id,
      graphType,
      refreshDrawerSheetPropsFromGraph,
    ]);

    /**
     * ai建模 更新可视化
     */
    const updateAiGraph = async () => {
      // 开启自动建模
      aiStopBuildStatus.current = false;

      const treeNodeList = await getAccountLifeCycle(id, graphType);
      // 处理数据结构，准备动态渲染数据结构，首先找出最大层级，判断需要渲染多少遍

      // 最大的子级集合
      let maxChildren = 0;
      treeNodeList.forEach(list => {
        if (list?.children?.length && list?.children?.length > maxChildren) {
          maxChildren = list?.children?.length;
        }
      });

      // 复制出层级数据，准备倒叙渲染，从上开始展示动画, 先清空子级的
      const cloneTreeNodeList = cloneDeep(treeNodeList).map(list => {
        if (!list.isRoot) {
          list.children = [];
        }
        return list;
      });
      const maxChildrenArr = new Array(maxChildren).fill(0);

      setTimeout(() => {
        for (
          let childIndex = 0;
          childIndex <= maxChildrenArr.length;
          childIndex++
        ) {
          // 如果主动关闭建模，停止解析自动建模的动画
          if (aiStopBuildStatus.current === true) {
            break;
          }

          // 遍历非根节点数据，将aiFlag进行设置
          const changeTreeData = cloneTreeNodeList.map(cloneList => {
            const returnCloneList = cloneList;

            // 找到需要增加的数据
            const treeList = treeNodeList.find(
              list => list.id === cloneList.id,
            );

            // 数据长度一致时候，清除所有的aiFlag
            if (
              !returnCloneList.isRoot &&
              returnCloneList.children &&
              treeList?.children &&
              returnCloneList.children.length === treeList.children.length
            ) {
              returnCloneList.children = returnCloneList.children.map(child => {
                child.extraData = { ...child.extraData, aiStatus: undefined };
                return child;
              });
            }

            // 非根节点
            if (
              !returnCloneList.isRoot &&
              returnCloneList.children &&
              treeList?.children &&
              returnCloneList.children.length < treeList.children.length
            ) {
              // 反转旧版数据
              const reverseChildrenArr = cloneDeep(treeList.children).reverse();

              // 即将添加进去的数据
              const childReverseInfo = {
                ...reverseChildrenArr[childIndex],
                extraData: {
                  ...reverseChildrenArr[childIndex].extraData,
                  aiStatus: 1,
                },
              };

              // 关闭其他数据的ai动画
              returnCloneList.children = returnCloneList.children.map(list => ({
                ...list,
                extraData: {
                  ...list.extraData,
                  aiStatus: undefined,
                },
              }));

              returnCloneList.children.unshift(childReverseInfo);
            }

            return returnCloneList;
          });

          (function (i, treeData) {
            aiStopBuildSetTime.current = setTimeout(() => {
              // 如果主动关闭建模，停止解析自动建模的动画
              if (!aiStopBuildStatus.current) {
                graphRef.instance?.changeData(treeData);
              }
            }, i * 2500);
          })(childIndex, cloneDeep(changeTreeData));
        }
      }, 1000);

      return maxChildren;
    };
    /**
     * 根据id更新画布的指定节点名称
     * @param id 节点id
     * @param name 新修改名字
     */
    const updateAiGraphName = (updateId: string, nameText: string) => {
      const graphById = graphRef.instance?.graph?.findById(updateId);
      if (graphById) {
        const model = graphById.getModel();

        graphRef.instance?.graph?.focusItem(graphById, true, {
          easing: 'easeCubic',
          duration: 300,
        });
        // graphRef.instance?.graph?.translate(-200, 0, true, {
        //   easing: 'easeCubic',
        //   duration: 200,
        // });
        graphRef.instance?.graph?.updateItem(graphById, {
          extraData: {
            // @ts-ignore
            ...model?.extraData,
            name: nameText,
          },
        });
      }
    };

    /**
     * ai建模 关闭可视化 自动构建过程
     */
    const closeUpdateAiGraph = () => {
      aiStopBuildStatus.current = true;
      aiStopBuildSetTime.current = undefined;
      updateGraph();
    };

    /** 切换 原视图-按分类 */
    const changeType = (data: BuildModelVisualChangeType) => {
      setGraphType(data);
    };

    /**
     * ai建模 切换原视图或者按分类展示
     */
    const aiChangeType = (data: BuildModelVisualChangeType) => {
      changeType(data);
    };

    const renderGraphByAiProcess = async (opt?: { moveGraph?: boolean }) => {
      const graph = graphRef.instance?.graph;
      if (!graph) {
        return;
      }

      const { data } = await getAiProcessStatus({ accountId: id });
      if (data.data !== AiProcessStatus.PENDING) {
        // 原有逻辑
        getAccountLifeCycle(id, graphType).then(treeNodeList => {
          graphRef.instance!.setData(treeNodeList);
          const backZoomNum = graphRef.instance?.graph.getZoom();
          if (backZoomNum) {
            const ratio = ceil(backZoomNum, 2);

            setZoomNum(ratio);
          }
        });
      } else {
        const loopAiProcessStatus = () => {
          aiProcessTimerRef.current = setTimeout(async () => {
            const resp = await getAiProcessStatus({ accountId: id });
            if (resp.data.data === AiProcessStatus.PENDING) {
              loopAiProcessStatus();
            } else {
              updateAccountInfo();
              const treeNodeList = await getAccountLifeCycle(id, graphType);
              graphRef.instance!.changeData(treeNodeList);
            }
          }, 1000);
        };

        getAccountLifeCycle(id, graphType).then(treeNodeList => {
          if (opt?.moveGraph) {
            setZoomNum(0.6);
            graph.zoomTo(0.6);
            graph.translate(80, 120);
          }
          graphRef.instance!.changeData(treeNodeList);
        });

        loopAiProcessStatus();
      }
    };
    /**
     * 主动触发子组件 - 获取文件
     */
    useImperativeHandle(cRef, () => ({
      updateGraph,
      updateAiGraph,
      updateAiGraphName,
      closeUpdateAiGraph,
      aiChangeType,
      renderGraphByAiProcess,
    }));
    /**
     * 可视化删除排放源
     * @param _
     * @param node 被选择的节点
     */
    const deleteEmission = (_, node: Node) => {
      const nodeModel = node.getModel() || {};
      const ids = nodeModel.id?.split('_');
      const isAINode =
        (nodeModel.extraData as Record<string, any>)?.aiFlag === 1;

      if (isAINode && !haveAccountAiPermissions()) {
        Toast('warn', I18N.components.sorryYouDidnt);
        return;
      }

      if (!ids || ids.length <= 0) return;
      const emissionName = (nodeModel.extraData as Record<string, any>)?.name;
      Modal.confirm({
        title: I18N.carbonFootprint.prompt,
        content: I18N.template(I18N.components.confirmDeletionOfThis2, {
          val1: emissionName,
        }),
        bodyStyle: {
          padding: '20px 24px',
        },
        okButtonProps: {
          danger: true,
        },
        icon: null,
        onOk: async () => {
          isAINode
            ? await postAIQuickAccountEmissionDelete({
                ...apiExtraParams,
                id: ids[0],
              })
            : await postQuickAccountEmissionDelete({
                ...apiExtraParams,
                id: ids[0],
              });
          Toast('success', I18N.carbonFootprint.deleteSuccessful);
          updateGraph();
          if (changeEmission) {
            changeEmission();
          }
        },
      });
    };

    /**
     * @description: 改变画布的放大和缩小
     * @param {string} status 放大还是缩小
     */
    const changeZoom = (status: 'zoomIn' | 'zoomOut') => {
      let num = zoomNum;
      if (status === 'zoomIn') {
        num += 0.2;
      } else {
        num -= 0.2;
      }
      if (num < 0.2) {
        num = 0.2;
      }
      num = round(num, 2);
      setZoomNum(num);
      graphRef.instance?.changeZoom(num);
    };

    /**
     * @description: 手动设置画布的放大缩小比例
     * @param {number} num 比例
     */
    const changeZoomValue = (num: number) => {
      const width = graphRef.instance?.graph.getWidth() || 1;
      const height = graphRef.instance?.graph.getHeight() || 1;
      const newNum = round(num / 100, 2);
      graphRef.instance?.graph.zoomTo(
        newNum,
        { x: width / 2, y: height / 2 },
        true,
        {
          duration: 150,
        },
      );

      setZoomNum(newNum);
    };

    /**
     * 保存到库
     * @param _
     * @param node 节点信息
     */
    const saveEmissionSourceInStore = async (_, node: Node) => {
      const nodeModel = node.getModel();
      const extraData = nodeModel.extraData as {
        status: number;
        aiFlag: number | undefined;
      };

      if (extraData?.aiFlag === 1) {
        Toast('warn', I18N.components.pleaseConfirmTheEstablishmentFirst);
        return;
      }

      const ids = nodeModel.id?.split('_');
      if (!extraData.status && ids && ids.length > 0) {
        await postQuickAccounEmissionInStore({
          ...apiExtraParams,
          id: Number(ids[0]),
        });
        Toast('success', I18N.carbonFootprint3.successfullySavedTo);
        updateGraph();
      }
    };

    /**
     * 关闭排放源
     */
    const closeEmissionDrawer = () => {
      setEmissionSourceDrawerVisible(false);
      setReadPretty(false);
      setTimeout(() => {
        setEmissionSourceId(undefined);
        setEmissionSourceAiFlag(undefined);
      }, 300);
    };

    /**
     * 新增排放源
     * @param node 节点信息
     */
    const addEmissionSource = (_, node: Node) => {
      const nodeModel = node.getModel();
      setStage(Number(nodeModel.id) as QuickAccountLifeCycleStage);
      setEmissionSourceDrawerVisible(true);
      setEmissionCopyStatus(false);
    };

    /**
     * 编辑排放源
     */
    const editEmissionSource = (_: any, node: Node) => {
      if (!getToken() && !isShare) {
        openLoginModal({
          companyType: CompanyType.company,
          showWechatLogin: true,
          onSuccess: async () => {
            await handleAccountIdBindWithUpgrade();
          },
        });
        return;
      }
      setEmissionCopyStatus(false);
      const nodeModel = node.getModel();

      const emissionId = Number(nodeModel.id);
      setStage(
        (
          nodeModel.extraData as {
            accountLifeCycleStage: QuickAccountLifeCycleStage;
          }
        )?.accountLifeCycleStage,
      );

      const { matchWay, requestState, matchObject, aiFlag } =
        nodeModel.extraData as {
          matchWay: number;
          requestState: number;
          matchObject: Record<string, any>;
          aiFlag?: number;
        };

      setEmissionSourceAiFlag(aiFlag);

      const isSupplierMatchWay = matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER;
      const isSelectedData =
        matchObject?.id !== null && matchObject?.id !== undefined;
      if (
        isSupplierMatchWay &&
        !isSelectedData &&
        requestState !== MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT
      ) {
        setReadPretty(true);
      }

      Promise.resolve().then(() => {
        setEmissionSourceDrawerVisible(true);
        setEmissionSourceId(emissionId);
      });
    };

    /**
     * 复制排放源
     * @param node 节点信息
     */
    const copyEmissionSource = (_: any, node: Node) => {
      const nodeModel = node.getModel();

      const extraData = nodeModel.extraData as {
        status: number;
        aiFlag: number | undefined;
      };

      if (extraData?.aiFlag === 1) {
        Toast('warn', I18N.components.pleaseConfirmTheEstablishmentFirst2);
        return;
      }

      const {
        emissionId,
        accountLifeCycleStage,
        aiFlag,
        matchWay,
        matchObject,
        requestState,
      } = nodeModel.extraData as {
        emissionId: number;
        matchWay: number;
        matchObject: Record<string, any>;
        accountLifeCycleStage: QuickAccountLifeCycleStage;
        aiFlag?: number;
        requestState: number;
      };

      setStage(accountLifeCycleStage);
      setEmissionSourceAiFlag(aiFlag);
      const isSupplierMatchWay = matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER;

      const isSelectedData =
        matchObject?.id !== null && matchObject?.id !== undefined;
      if (
        isSupplierMatchWay &&
        !isSelectedData &&
        requestState !== MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT
      ) {
        setReadPretty(true);
      }

      setEmissionCopyStatus(true);

      Promise.resolve().then(() => {
        setEmissionSourceDrawerVisible(true);
        setEmissionSourceId(emissionId);
      });
    };

    /** Agent 项目预览：从可视化排放源节点发起任务 */
    const createEmissionTask = (_: unknown, node: Node) => {
      const nodeModel = node.getModel();
      const extraData = (nodeModel.extraData as Record<string, unknown>) || {};
      const emissionSourceId = extraData.emissionId ?? nodeModel.id;

      onEmissionTaskCreate?.({
        emissionSourceId:
          emissionSourceId === null || emissionSourceId === undefined
            ? undefined
            : String(emissionSourceId),
        emissionSourceName: String(extraData.name || nodeModel.label || '-'),
      });
    };

    /**
     * 展开收起
     * @param node 节点信息
     */
    const collapseChange = (_, node: Node) => {
      const nodeModel = node.getModel();
      const nodeId = nodeModel.id as string;
      const sessionIds = sessionStorage.getItem('QuickGraphCollapseIds');
      let idsArr: string[] = sessionIds ? JSON.parse(sessionIds) : [];
      // 当前状态是展开，点击要收起
      if ((nodeModel.extraData as { status: boolean }).status === false) {
        idsArr.push(nodeId);
      } else {
        // 当前是收起状态，点击要展开
        idsArr = idsArr.filter(id => id !== nodeId);
      }
      sessionStorage.setItem('QuickGraphCollapseIds', JSON.stringify(idsArr));
      updateGraph();
    };

    /**
     * 是否有购买供应链产品
     */
    const isShowSupplier = async () => {
      if (isShare) {
        setShowSupplier(true);
        return;
      }
      if (!getToken() && !isShare) {
        return;
      }
      const supplierBtn = await isBuySupplier();
      setShowSupplier(supplierBtn.data.data || false);
    };

    /**
     * 只读方法通用判断
     */
    const readPrettyFunc = () => {
      // AI临时排放源 并且 没有ai权限
      if (emissionSourceAiFlag && !haveAccountAiPermissions()) {
        return true;
      }
      return (!operatePermission || readPretty) && !emissionCopyStatus;
    };

    const handleEmissionDetailExcelIconClick = useCallback(
      async (_: unknown, node: Node) => {
        const nodeModel = node.getModel();
        const extra = (nodeModel?.extraData as any) || {};
        const emissionName =
          extra?.name ??
          extra?.emissionName ??
          extra?.matchObject?.name ??
          extra?.matchObject?.emissionName ??
          '';
        const stageName =
          extra?.stageName ??
          extra?.lifeCycleStageName ??
          extra?.stage?.stageName ??
          extra?.lifeCycleStage?.stageName ??
          extra?.matchObject?.stageName;
        const stageCode = Number(
          extra?.accountLifeCycleStage ??
            extra?.matchObject?.accountLifeCycleStage,
        );
        const lifeCycleLabelMap = QUICK_ACCOUNT_LIFE_CYCLE_LABEL() as
          | Record<number, string>
          | undefined;
        const resolvedStageName =
          stageName ??
          (Number.isFinite(stageCode)
            ? lifeCycleLabelMap?.[stageCode]
            : undefined) ??
          '';
        const categoryName =
          extra?.typeName ??
          extra?.categoryName ??
          extra?.matchObject?.typeName ??
          extra?.matchObject?.categoryName ??
          nodeModel?.label ??
          nodeModel?.name ??
          '';
        const wpsSheetId = firstNonEmptySheetId(
          extra?.wpsSheetId,
          extra?.matchObject?.wpsSheetId,
          extra?.sheetId,
          extra?.matchObject?.sheetId,
        );
        const apiWpsSheetId = firstNonEmptySheetId(
          extra?.wpsSheetId,
          extra?.wps_sheet_id,
          extra?.matchObject?.wpsSheetId,
          extra?.matchObject?.wps_sheet_id,
        );
        const sheetIndex = firstNumericSheetIndex(
          extra?.sheetIndex,
          extra?.matchObject?.sheetIndex,
        );
        const emissionIdNum = Number(extra?.emissionId ?? nodeModel.id);
        detailDrawerGraphNodeIdRef.current = String(nodeModel.id);
        setDetailDrawerEmissionName(`${emissionName}`);
        setDetailDrawerCategoryName(`${categoryName}`);
        setDetailDrawerStageName(`${resolvedStageName}`);
        setDetailDrawerEmissionId(
          Number.isFinite(emissionIdNum) ? emissionIdNum : undefined,
        );
        setDetailDataDrawerWpsSheetId(wpsSheetId ?? undefined);
        setDetailDrawerApiWpsSheetId(apiWpsSheetId ?? undefined);
        setDetailDataDrawerSheetIndex(sheetIndex);

        if (excelUrlRef.current) {
          setDetailDrawerExcelUrlOverride(undefined);
          setDetailDataDrawerOpen(true);
          return;
        }

        const accountId = accountIdRef.current;
        if (
          accountId === undefined ||
          accountId === null ||
          Number.isNaN(Number(accountId))
        ) {
          return;
        }

        try {
          const { data } = await postInitAccountExcel({
            accountId: Number(accountId),
          });
          if (data.code !== 200) {
            Toast('warn', data.msg || I18N.carbonFootprint.submissionFailed);
            return;
          }
          try {
            await Promise.resolve(updateAccountInfoRef.current?.());
            const { data: infoBody } = await getAccountingInfo({
              id: String(accountId),
              lang: serviceLangMap[localeRef.current],
              ...(apiExtraParamsRef.current || {}),
            });
            const freshUrl = infoBody?.data?.excelUrl;
            if (freshUrl) {
              setDetailDrawerExcelUrlOverride(freshUrl);
              setDetailDataDrawerOpen(true);
            } else {
              Toast(
                'warn',
                I18N.carbonFootprint3.noDetailedInformationAvailableAtTheMoment,
              );
            }
          } catch {
            Toast('error', I18N.carbonFootprint.submissionFailed);
          }
        } catch {
          Toast('error', I18N.carbonFootprint.submissionFailed);
        }
      },
      [],
    );

    useEffect(() => {
      isShowSupplier();

      if (!graphRef.instance || graphType === DEFAULT) {
        graphRef.instance = new Graph(
          {
            container: graphContainerId,
            animate: false,
          },
          {
            graphType: 'quickAccount',
            operatePermission,
            eventMap: {
              [`${Graph.getGraphShapeNameMap().DELETE_IMG}-click`]:
                deleteEmission,
              [`${Graph.getGraphShapeNameMap().SAVE_STORE_TEXT}-click`]:
                saveEmissionSourceInStore,
              [`${Graph.getGraphShapeNameMap().ADD_IMG}-click`]:
                addEmissionSource,
              [`${Graph.getGraphNodeNameMap().CHILD_NODE}-click`]:
                editEmissionSource,
              [`${Graph.getGraphShapeNameMap().ADD_TEXT}-click`]:
                addEmissionSource,
              [`${Graph.getGraphShapeNameMap().COPY_TEXT}-click`]:
                copyEmissionSource,
              [`${Graph.getGraphShapeNameMap().CREATE_TASK_TEXT}-click`]:
                createEmissionTask,
              [`${Graph.getGraphShapeNameMap().ACCOUNT_EDIT_ICON}-click`]:
                editAccount,
              [`${
                Graph.getGraphShapeNameMap().EMISSION_DETAIL_EXCEL_ICON
              }-click`]: handleEmissionDetailExcelIconClick,
            },
          },
        );
        // 只有ai动画执行完毕后才可以主动获取接口数据，防止ai动画那边重复执行接口，导致页面闪烁
      }

      if (graphType === CLASS) {
        graphRef.instance = new TreeGraph(
          {
            container: graphTreeContainerId,
          },
          {
            graphType: 'quickAccount',
            operatePermission,
            eventMap: {
              [`${Graph.getGraphShapeNameMap().DELETE_IMG}-click`]:
                deleteEmission,
              [`${Graph.getGraphShapeNameMap().SAVE_STORE_TEXT}-click`]:
                saveEmissionSourceInStore,
              [`${Graph.getGraphShapeNameMap().ADD_IMG}-click`]:
                addEmissionSource,
              [`${Graph.getGraphNodeNameMap().CHILD_NODE}-click`]:
                editEmissionSource,
              [`${Graph.getGraphShapeNameMap().ADD_TEXT}-click`]:
                addEmissionSource,
              [`${Graph.getGraphShapeNameMap().COPY_TEXT}-click`]:
                copyEmissionSource,
              [`${Graph.getGraphShapeNameMap().CREATE_TASK_TEXT}-click`]:
                createEmissionTask,
              [`${Graph.getGraphShapeNameMap().COLLAPSE_ICON_IMG}-click`]:
                collapseChange,
              [`${
                Graph.getGraphShapeNameMap().EMISSION_DETAIL_EXCEL_ICON
              }-click`]: handleEmissionDetailExcelIconClick,
            },
          },
        );
      }

      graphRef.instance.graph.on('wheel', () => {
        const backZoomNum = graphRef.instance?.graph.getZoom();
        if (backZoomNum) {
          const ratio = ceil(backZoomNum, 2);

          setZoomNum(ratio);
        }
      });

      if (isDetail) {
        getAccountLifeCycle(id, graphType).then(treeNodeList => {
          graphRef.instance!.setData(treeNodeList);
          const backZoomNum = graphRef.instance?.graph.getZoom();
          if (backZoomNum) {
            const ratio = ceil(backZoomNum, 2);

            setZoomNum(ratio);
          }
        });
      } else {
        renderGraphByAiProcess({ moveGraph: true });
      }

      return () => clearInterval(aiProcessTimerRef.current);
    }, [id, graphType, operatePermission, isDetail]);

    useEffect(() => {
      const container =
        graphType === CLASS
          ? graphTreeContainerRef.current
          : graphContainerRef.current;

      if (!container) {
        return undefined;
      }

      let animationFrame = 0;
      const scheduleResize = () => {
        if (animationFrame) {
          return;
        }

        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          resizeGraphCanvas();
        });
      };
      const resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(scheduleResize)
          : undefined;

      scheduleResize();
      resizeObserver?.observe(container);
      window.addEventListener('resize', scheduleResize);

      return () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }

        resizeObserver?.disconnect();
        window.removeEventListener('resize', scheduleResize);
      };
    }, [graphType, resizeGraphCanvas]);

    return (
      <div className={style.graphBoxMain}>
        {graphType === DEFAULT && (
          <div
            className={style.graphBox}
            id={graphContainerId}
            ref={graphContainerRef}
          />
        )}
        {graphType === CLASS && (
          <div
            className={style.graphBox}
            id={graphTreeContainerId}
            ref={graphTreeContainerRef}
          />
        )}

        <EmissionDetailSheetDrawerDefault
          open={detailDataDrawerOpen}
          onClose={() => {
            setDetailDataDrawerOpen(false);
            setDetailDrawerEmissionId(undefined);
            setDetailDrawerExcelUrlOverride(undefined);
          }}
          isShare={isShare}
          excelUrl={detailDrawerExcelUrlOverride ?? excelUrl}
          accountName={accountName}
          wpsSheetId={detailDataDrawerWpsSheetId}
          apiWpsSheetId={detailDrawerApiWpsSheetId}
          activeSheetIndex={detailDataDrawerSheetIndex}
          emissionName={detailDrawerEmissionName}
          categoryName={detailDrawerCategoryName}
          stageName={detailDrawerStageName}
          emissionId={detailDrawerEmissionId}
          accountId={
            id !== undefined && id !== null && !Number.isNaN(Number(id))
              ? Number(id)
              : undefined
          }
          onRefreshAccount={refreshAccountAfterSheetBind}
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
        <div className={style.graphFixedSet}>
          <div className={style.changeTypMain}>
            {ChangeTypeBtn.map(ChangeTypeBtnVal => (
              <div
                key={ChangeTypeBtnVal}
                className={classNames(style.typeBtn, {
                  [style.typeBtnActive]: Number(ChangeTypeBtnVal) === graphType,
                })}
                onClick={() => {
                  changeType(Number(ChangeTypeBtnVal));
                }}
              >
                {BUILD_MODEL_VISUAL_CHANGE_TYPE()[ChangeTypeBtnVal]}
              </div>
            ))}
          </div>
        </div>

        <EmissionSourceDrawer
          apiExtraParams={apiExtraParams}
          copyStatus={emissionCopyStatus}
          emissionAiFlag={emissionSourceAiFlag}
          visible={emissionSourceDrawerVisible}
          showSupplier={showSupplier}
          noSelectEmissionBtn={noSelectEmissionBtn}
          quickDrawerMatchWayBtnValue={quickDrawerMatchWayBtnValue}
          quickDrawerMatchWayBtns={quickDrawerMatchWayBtns}
          accountId={id}
          readPretty={readPrettyFunc()}
          emissionSourceId={emissionSourceId}
          stage={stage}
          enableFactorSourceRange={enableFactorSourceRange && !readPrettyFunc()}
          factorPrefId={accountInfo.factorPrefId}
          onClose={closeEmissionDrawer}
          onTransportReuseSuccess={() => {
            changeEmission?.();
            return updateGraph();
          }}
          onSuccess={() => {
            if (changeEmission) {
              changeEmission();
            }

            closeEmissionDrawer();
            updateGraph();
          }}
        />
      </div>
    );
  },
);
