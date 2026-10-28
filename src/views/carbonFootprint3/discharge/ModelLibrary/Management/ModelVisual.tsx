import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Node } from '@antv/g6';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import EmissionSourceDrawer from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import {
  ALL_EMISSION,
  ALL_EMISSION_LABEL,
  QUICK_ACCOUNT_EMISSION_ICON_MAP,
  QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP,
  QUICK_ACCOUNT_LIFE_CYCLE,
} from '@src/views/carbonFootprint3/constant';
import Graph from '@src/views/carbonFootprint3/graph/graph';
import TreeGraph from '@src/views/carbonFootprint3/graph/treeGraph';
import {
  GraphTreeClassNode,
  GraphTreeNode,
} from '@src/views/carbonFootprint3/graph/type';
import { QuickAccountLifeCycleStage } from '@src/views/carbonFootprint3/type';
import { Button, InputNumber, Modal } from 'antd';
import classNames from 'classnames';
import { ceil, cloneDeep, round } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import {
  BUILD_MODEL_VISUAL_CHANGE_TYPE,
  BuildModelVisualChangeType,
} from '@/components/CarbonFootprintAccount/BuildModelMainData/BuildModelVisual/constant';

import style from './index.module.less';
import {
  getModelGraphView,
  deleteModelEmission,
  type ModelGraphViewLifeCycleNode,
} from './service';
import ModelInfoModal from '../components/ModelInfoModal';
import { editModel } from '../service';
import { ModelItem, ModelSourceEnum } from '../type';

const { DEFAULT, CLASS } = BuildModelVisualChangeType;
const ChangeTypeBtn = Object.keys(BUILD_MODEL_VISUAL_CHANGE_TYPE());

/** 模型库可视化：生命周期阶段下排放源条数（与接口 emissionList 结构一致，不影响核算字段） */
const countStageEmissionSources = (
  emissionList: ModelGraphViewLifeCycleNode['emissionList'],
) =>
  (emissionList || []).reduce(
    (sum, group) => sum + (Array.isArray(group) ? group.length : 0),
    0,
  );

/** 模型库图节点：仅隐藏「数据不完整」黄条，保留运输排放等底部信息（字段与核算可视化对齐） */
const buildModelGraphChildExtra = (
  emission: Record<string, any>,
  stageCode: number,
  totalForGraph: string | null | undefined,
  transConsumptionTpl: typeof I18N.components.typeE3,
) => {
  const {
    id,
    type,
    name: emissionName,
    emissionRate,
    amount,
    unitName,
    matchWay,
    matchObject,
    needTrans,
    transTotal,
    unitStr,
    typeExtra,
    accountEmissionTransportList,
  } = emission;

  let consumptionText = amount ? `${amount}${unitName}` : '-';
  if (type === ALL_EMISSION.TRANS && typeExtra && typeExtra.way !== 3) {
    consumptionText = I18N.template(transConsumptionTpl, {
      val1: typeExtra.amount || '-',
      val2: typeExtra.unitName || '-',
      val3: typeExtra.distance || '-',
    });
  }

  return {
    emissionId: id,
    name: emissionName,
    consumption: consumptionText,
    total: totalForGraph,
    rate: emissionRate ?? 0,
    accountLifeCycleStage: stageCode,
    isCompleted:
      emission.emissionTotal !== null && emission.emissionTotal !== '',
    hideIncompleteEmissionWarn: true,
    hideSaveStore: true,
    hideCardEmissionTotal: true,
    /** 模型库：保留「含运输排放」提示，不展示运输排放量数值 */
    hideTransportEmissionAmount: true,
    factorDisplayName: matchObject?.name ?? '-',
    matchWay,
    type,
    typeExtra,
    unitStr,
    needTrans,
    transTotal,
    accountEmissionTransportList,
  };
};

interface ModelVisualProps {
  modelInfo: ModelItem;
  refreshModelInfo: () => void;
}

const ModelVisual: FC<ModelVisualProps> = ({ modelInfo, refreshModelInfo }) => {
  const isSystemModel = modelInfo.source === ModelSourceEnum.SYSTEM;
  const graphContainerId = 'modelGraphContainer';
  const graphTreeContainerId = 'modelGraphTreeContainer';

  const [zoomNum, setZoomNum] = useState<number>(1);
  const [emissionSourceId, setEmissionSourceId] = useState<number>();
  const [emissionCopyStatus, setEmissionCopyStatus] = useState(false);
  const [emissionSourceDrawerVisible, setEmissionSourceDrawerVisible] =
    useState(false);
  const [stage, setStage] = useState<QuickAccountLifeCycleStage>(
    QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL,
  );
  const [graphType, setGraphType] =
    useState<BuildModelVisualChangeType>(DEFAULT);
  const [modelInfoModalOpen, setModelInfoModalOpen] = useState(false);

  const graphRef: { instance: Graph | null } = useMemo(
    () => ({ instance: null }),
    [],
  );

  const transferDefaultData = (data: Record<string, any>[]) => {
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
          showLifecycleEmissionSourceCount: true,
          emissionSourceCount: countStageEmissionSources(emissionList),
        },
        children: (emissionList?.[0] || []).map(
          (emission: Record<string, any>) => ({
            id: emission.id,
            name: ALL_EMISSION_LABEL()[emission.type],
            img: QUICK_ACCOUNT_EMISSION_ICON_MAP[emission.type],
            typeName: emission.typeName,
            type: emission.type,
            extraData: buildModelGraphChildExtra(
              emission,
              code,
              emission.emissionTotal ?? '-',
              I18N.components.typeE3,
            ),
          }),
        ),
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

  const setEmissionsChild = (
    emissions: Record<string, any>[],
    code: number,
  ) => {
    let emissionsChild: GraphTreeClassNode | undefined;
    emissions.forEach(emission => {
      const setEmissionData: GraphTreeClassNode = {
        id: emission.id,
        name: ALL_EMISSION_LABEL()[emission.type],
        img: QUICK_ACCOUNT_EMISSION_ICON_MAP[emission.type],
        typeName: emission.typeName,
        extraData: buildModelGraphChildExtra(
          emission,
          code,
          emission.emissionTotal,
          I18N.components.typeE2,
        ),
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

  const transferClassData = (data: Record<string, any>[]) => {
    const sessionIds = sessionStorage.getItem('ModelGraphCollapseIds');
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
          showLifecycleEmissionSourceCount: true,
          emissionSourceCount: countStageEmissionSources(emissionList),
        },
        children: idsArr.includes(String(code))
          ? []
          : (emissionList || []).map(
              (emissions: Record<string, any>[]) =>
                setEmissionsChild(emissions, code) as GraphTreeClassNode,
            ),
      };
    });
    return treeNodeList;
  };

  const getModelLifeCycle = async (
    modelId: number | string,
    groupTypeData: BuildModelVisualChangeType,
  ) => {
    try {
      const resp = await getModelGraphView({
        id: modelId,
        groupType: groupTypeData,
      });
      const { code, name, typeName, total, type, scope } = resp.data.data;
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
              img: defaultImg,
              extraData: {
                total: total ?? '-',
                type,
                scope,
                hidePeriod: true,
                hideEmissionTotal: true,
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
              img: defaultImg,
              extraData: {
                total: total ?? '-',
                type,
                scope,
                hidePeriod: true,
                hideEmissionTotal: true,
              },
              children: treeNodeList,
            },
          ] as GraphTreeNode[] | GraphTreeClassNode[]);
    } catch {
      return [];
    }
  };

  const updateGraph = async () => {
    getModelLifeCycle(modelInfo.id, graphType).then(treeNodeList => {
      graphRef.instance?.changeData(treeNodeList);
    });
  };

  const deleteEmission = (_: any, node: Node) => {
    const nodeModel = node.getModel() || {};
    const ids = nodeModel.id?.split('_');
    if (!ids || ids.length <= 0) return;
    const emissionName = (nodeModel.extraData as Record<string, any>)?.name;
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(
        I18N.carbonFootprint3.confirmDeletionArrangement2,
        { val1: emissionName },
      ),
      okButtonProps: { danger: true },
      icon: null,
      onOk: async () => {
        await deleteModelEmission({ id: ids[0] });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        updateGraph();
      },
    });
  };

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

  const changeZoomValue = (num: number) => {
    const width = graphRef.instance?.graph.getWidth() || 1;
    const height = graphRef.instance?.graph.getHeight() || 1;
    const newNum = round(num / 100, 2);
    graphRef.instance?.graph.zoomTo(
      newNum,
      { x: width / 2, y: height / 2 },
      true,
      { duration: 150 },
    );
    setZoomNum(newNum);
  };

  const closeEmissionDrawer = () => {
    setEmissionSourceDrawerVisible(false);
    setEmissionCopyStatus(false);
    setTimeout(() => setEmissionSourceId(undefined), 300);
  };

  const addEmissionSource = (_: any, node: Node) => {
    const nodeModel = node.getModel();
    setStage(Number(nodeModel.id) as QuickAccountLifeCycleStage);
    setEmissionCopyStatus(false);
    setEmissionSourceDrawerVisible(true);
  };

  const copyEmissionSource = (_: any, node: Node) => {
    const nodeModel = node.getModel();
    const { emissionId, accountLifeCycleStage } = nodeModel.extraData as {
      emissionId: number;
      accountLifeCycleStage: QuickAccountLifeCycleStage;
    };
    setStage(accountLifeCycleStage);
    setEmissionCopyStatus(true);
    Promise.resolve().then(() => {
      setEmissionSourceDrawerVisible(true);
      setEmissionSourceId(emissionId);
    });
  };

  const editEmissionSource = (_: any, node: Node) => {
    const nodeModel = node.getModel();
    const emissionId = Number(nodeModel.id);
    setStage(
      (
        nodeModel.extraData as {
          accountLifeCycleStage: QuickAccountLifeCycleStage;
        }
      )?.accountLifeCycleStage,
    );
    Promise.resolve().then(() => {
      setEmissionSourceDrawerVisible(true);
      setEmissionSourceId(emissionId);
    });
  };

  const collapseChange = (_: any, node: Node) => {
    const nodeModel = node.getModel();
    const nodeId = nodeModel.id as string;
    const sessionIds = sessionStorage.getItem('ModelGraphCollapseIds');
    let idsArr: string[] = sessionIds ? JSON.parse(sessionIds) : [];
    if ((nodeModel.extraData as { status: boolean }).status === false) {
      idsArr.push(nodeId);
    } else {
      idsArr = idsArr.filter(id => id !== nodeId);
    }
    sessionStorage.setItem('ModelGraphCollapseIds', JSON.stringify(idsArr));
    updateGraph();
  };

  const changeType = (data: BuildModelVisualChangeType) => {
    setGraphType(data);
  };

  const openModelInfoFromRootEditIcon = () => setModelInfoModalOpen(true);

  useEffect(() => {
    if (!graphRef.instance || graphType === DEFAULT) {
      graphRef.instance = new Graph(
        { container: graphContainerId, animate: false },
        {
          graphType: 'quickAccount',
          operatePermission: !isSystemModel,
          eventMap: {
            [`${Graph.getGraphShapeNameMap().DELETE_IMG}-click`]:
              deleteEmission,
            [`${Graph.getGraphShapeNameMap().ADD_IMG}-click`]:
              addEmissionSource,
            [`${Graph.getGraphNodeNameMap().CHILD_NODE}-click`]:
              editEmissionSource,
            [`${Graph.getGraphShapeNameMap().ADD_TEXT}-click`]:
              addEmissionSource,
            [`${Graph.getGraphShapeNameMap().COPY_TEXT}-click`]:
              copyEmissionSource,
            [`${Graph.getGraphShapeNameMap().ACCOUNT_EDIT_ICON}-click`]:
              openModelInfoFromRootEditIcon,
          },
        },
      );
    }

    if (graphType === CLASS) {
      graphRef.instance = new TreeGraph(
        { container: graphTreeContainerId },
        {
          graphType: 'quickAccount',
          operatePermission: !isSystemModel,
          eventMap: {
            [`${Graph.getGraphShapeNameMap().DELETE_IMG}-click`]:
              deleteEmission,
            [`${Graph.getGraphShapeNameMap().ADD_IMG}-click`]:
              addEmissionSource,
            [`${Graph.getGraphNodeNameMap().CHILD_NODE}-click`]:
              editEmissionSource,
            [`${Graph.getGraphShapeNameMap().ADD_TEXT}-click`]:
              addEmissionSource,
            [`${Graph.getGraphShapeNameMap().COPY_TEXT}-click`]:
              copyEmissionSource,
            [`${Graph.getGraphShapeNameMap().COLLAPSE_ICON_IMG}-click`]:
              collapseChange,
            [`${Graph.getGraphShapeNameMap().ACCOUNT_EDIT_ICON}-click`]:
              openModelInfoFromRootEditIcon,
          },
        },
      );
    }

    graphRef.instance.graph.on('wheel', () => {
      const backZoomNum = graphRef.instance?.graph.getZoom();
      if (backZoomNum) {
        setZoomNum(ceil(backZoomNum, 2));
      }
    });

    getModelLifeCycle(modelInfo.id, graphType).then(treeNodeList => {
      graphRef.instance!.setData(treeNodeList);
      const backZoomNum = graphRef.instance?.graph.getZoom();
      if (backZoomNum) {
        setZoomNum(ceil(backZoomNum, 2));
      }
    });
  }, [modelInfo.id, graphType, isSystemModel]);

  return (
    <div className={style.graphBoxMain}>
      {graphType === DEFAULT && (
        <div className={style.graphBox} id={graphContainerId} />
      )}
      {graphType === CLASS && (
        <div className={style.graphBox} id={graphTreeContainerId} />
      )}
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
          {ChangeTypeBtn.map(val => (
            <div
              key={val}
              className={classNames(style.typeBtn, {
                [style.typeBtnActive]: Number(val) === graphType,
              })}
              onClick={() => changeType(Number(val))}
            >
              {BUILD_MODEL_VISUAL_CHANGE_TYPE()[val]}
            </div>
          ))}
        </div>
      </div>

      <EmissionSourceDrawer
        copyStatus={emissionCopyStatus}
        visible={emissionSourceDrawerVisible}
        showSupplier={false}
        accountId={modelInfo.id}
        useModelEmissionApi
        readPretty={isSystemModel}
        emissionSourceId={emissionSourceId}
        stage={stage}
        onClose={closeEmissionDrawer}
        onSuccess={() => {
          closeEmissionDrawer();
          updateGraph();
        }}
      />
      <ModelInfoModal
        open={modelInfoModalOpen}
        model={modelInfo}
        onOk={async values => {
          await editModel({ ...values, id: modelInfo.id });
          Toast('success', I18N.carbonFootprint3.editTheModelInto);
          refreshModelInfo();
          setModelInfoModalOpen(false);
          updateGraph();
        }}
        onCancel={() => setModelInfoModalOpen(false)}
      />
    </div>
  );
};

export default ModelVisual;
