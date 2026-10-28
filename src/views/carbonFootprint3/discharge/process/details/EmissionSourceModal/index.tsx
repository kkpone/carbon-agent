/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-06 17:23:12
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 11:06:03
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-19 12:15:22
 */
import { UnorderedListOutlined } from '@ant-design/icons';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { ProcessModelGraph } from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph';
import {
  NodeData,
  TagName,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/types';
import ProcessBusinessAccountingManagement from '@src/views/carbonFootprint3/ProcessBusinessAccounting/Management';
import { ProcessApiProduct } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/type';
import { PROCESS_MATCH_TYPE } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/constant';
import EmissionDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer';
import {
  getProcessAccountEmissionInfo,
  getProcessAccountInDetail,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';
import {
  Emission,
  ProcessProduct,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/type';
import AccessoryExportDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ExportDrawer';
import { postProcessVisualizationOutsList } from '@src/views/carbonFootprint3/component/AccessoryDrawer/ExportDrawer/service';
import AccessoryOutPutDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer';
import { postProcessVisualizationOutPutsList } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/service';
import { AccessoryOutPutData } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/type';
import ProcessDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer';
import { GRAPH_SHAPE_NAME } from '@src/views/carbonFootprint3/graph/constant';
import { Modal } from 'antd';
import { useRef, useState, VFC } from 'react';

import styles from './index.module.less';
import { MATCH_WAY, MATCH_WAY_LABEL } from '../../constant';
import {
  getEmissionInfo,
  getProcessExports,
  getProcessOutputs,
  getUnitProcessInfo,
} from '../../service';

type EmissionSourceModalProps = {
  visible: boolean;
  viewedProduct: ProcessProduct;
  onCancel: () => void;
  isProcess?: boolean;
  accountId?: number;
};

const { FACTOR, PROCESS } = PROCESS_MATCH_TYPE;

const EmissionSourceModal: VFC<EmissionSourceModalProps> = ({
  visible,
  viewedProduct,
  onCancel,
  isProcess,
  accountId,
}) => {
  const { id } = viewedProduct;

  const childGrapRef = useRef<{
    resetGraph: () => Promise<any>;
  }>(null);
  /** 是否显示可视化 */
  const [isVisualState, setIsVisualState] = useState(true);

  const [, setProcessId] = useState<number | null>(null);

  const [matchWayOptions, setMatchWayOptions] =
    useState<{ value: number; label: string }[]>();

  /** 当前点击节点父节点的信息 */
  const [parentNodeInfo, setParentNodeInfo] = useState<NodeData>();

  /** 是否是根节点 */
  const [isRootProcessNode, setIsRootProcessNode] = useState(false);

  const [clickModelValue, setClickModelValue] = useState<NodeData['value']>();

  /** 排放源相关 */
  const [emissionDrawerVisible, setEmissionDrawerVisible] = useState(false);
  const [emissionDrawerLoading, setEmissionDrawerLoading] = useState(false);
  const [emissionInitialValues, setEmissionInitialValues] =
    useState<Emission>();
  const [, setEmissionId] = useState<number>();

  /** 单元过程Drawer Props */
  const [processDrawerVisible, setProcessDrawerVisible] = useState(false);
  const [processDrawerLoading, setProcessDrawerLoading] = useState(false);
  const [processInitialValues, setProcessInitialValues] =
    useState<Record<string, any>>();

  /** 产出物的侧滑抽屉 */
  const [outPutVisible, setOutPutVisible] = useState(false);
  const [outPutDrawerLoading, setOutPutDrawerLoading] = useState(false);
  const [outPutInitValues, setOutPutInitValues] =
    useState<AccessoryOutPutData[]>();

  /** 输出的侧滑抽屉 */
  const [exportVisible, setExportVisible] = useState(false);
  const [exportDrawerLoading, setExportDrawerLoading] = useState(false);
  const [exportInitValues, setExportInitValues] =
    useState<ProcessApiProduct[]>();

  /**
   * @description: 查看排放源
   * @param {NodeData} nodeInfo 编辑的节点信息
   */
  const detailEmissionClick = async (nodeInfo: NodeData['value']) => {
    setEmissionDrawerLoading(true);
    setEmissionDrawerVisible(true);
    const { dataId } = nodeInfo;
    const emissionInfo = await (isProcess
      ? getEmissionInfo
      : getProcessAccountEmissionInfo)({
      id: dataId,
    });
    setEmissionInitialValues(emissionInfo.data.data);
    setEmissionId(dataId);
    if (
      emissionInfo.data.data.matchWay !== MATCH_WAY.FACTOR &&
      emissionInfo.data.data.matchWay !== MATCH_WAY.FACTOR_CREATE
    ) {
      setMatchWayOptions([
        {
          value: emissionInfo.data.data.matchWay,
          label: MATCH_WAY_LABEL[emissionInfo.data.data.matchWay],
        },
      ]);
    }
    setEmissionDrawerLoading(false);
  };

  /**
   * @description: 单元过程详情
   * @param {NodeData} nodeInfo 编辑的节点信息
   */
  const detailProcessInClick = async (nodeInfo: NodeData['value']) => {
    const { data } = await (isProcess
      ? getUnitProcessInfo
      : getProcessAccountInDetail)({
      dataId: nodeInfo.dataId,
      parentId: nodeInfo.parentId,
    });
    setIsRootProcessNode(nodeInfo.parentId === '0');
    setProcessInitialValues(data.data);
    setProcessId(nodeInfo.id ? Number(nodeInfo.id) : null);
    setProcessDrawerVisible(true);
  };

  /**
   * @description: 从接口获取产品的回显信息
   */
  const getOutPutInitValues = async (nodeInfo: NodeData['value']) => {
    if (nodeInfo) {
      const { dataId, parentId } = nodeInfo;

      const { data } = await (isProcess
        ? getProcessOutputs
        : postProcessVisualizationOutPutsList)({
        dataId,
        parentId,
      });

      return data.data.processProducts;
    }

    return undefined;
  };

  /**
   * @description: 产出物详情
   * @param {NodeData} nodeInfo 编辑的节点信息
   */
  const detailOutPutClick = async (nodeInfo: NodeData['value']) => {
    setOutPutDrawerLoading(true);
    setOutPutVisible(true);

    const data = await getOutPutInitValues(nodeInfo);
    setOutPutInitValues(data);
    setOutPutDrawerLoading(false);
  };

  /**
   * @description: 输出详情
   */
  const detailExport = async (nodeInfo: NodeData['value']) => {
    setExportDrawerLoading(true);
    setExportVisible(true);

    const { dataId, parentId } = nodeInfo;

    const data = await (isProcess
      ? getProcessExports
      : postProcessVisualizationOutsList)({ dataId, parentId });
    setExportInitValues(data.data.data.processOuts);
    setExportDrawerLoading(false);
  };

  /**
   * @description: 关闭或者提交排放源
   */
  const closeEmissionDrawer = () => {
    setEmissionDrawerVisible(false);
    setEmissionDrawerLoading(false);
    setEmissionInitialValues(undefined);
    setEmissionId(undefined);
    setMatchWayOptions(undefined);
  };

  /**
   * @description: 关闭过程详情
   */
  const closeProcessDrawer = () => {
    setProcessDrawerVisible(false);
    setProcessInitialValues(undefined);
    setProcessId(null);
    setParentNodeInfo(undefined);

    setProcessDrawerLoading(false);
  };

  /**
   * @description: 根据点击的画布节点 展示不同的Drawer
   * @param {TagName} tagName 点击节点的编码
   * @param {NodeData} model 点击节点的info
   */
  const graphNodeClick = async (
    tagName: TagName,
    model: NodeData['value'],
    parentNode?: NodeData,
  ) => {
    // 0因子,1过程,5供应商
    const { processId: nodeProcessId, matchType, dataId } = model;

    setProcessId(nodeProcessId);
    setParentNodeInfo(parentNode);
    setClickModelValue(model);

    // 新增排放源
    if (tagName === GRAPH_SHAPE_NAME.ADD_EMISSION_TEXT) {
      setEmissionDrawerVisible(true);
    }

    if (tagName === GRAPH_SHAPE_NAME.INFO_RECT) {
      // 排放源
      if (matchType === FACTOR) {
        setEmissionId(dataId);
        await detailEmissionClick(model);
      }
    }

    if (tagName === GRAPH_SHAPE_NAME.INFO_RECT) {
      // 过程
      if (matchType === PROCESS) {
        detailProcessInClick(model);
      }
    }

    // 如果是点击的产出物
    if (tagName === GRAPH_SHAPE_NAME.OUTPUT_INFO) {
      await detailOutPutClick(model);
    }

    // 如果是点击的输出
    if (tagName === GRAPH_SHAPE_NAME.EXPORT_INFO) {
      await detailExport(model);
    }
  };

  return (
    <Modal
      centered
      className={styles.emissionSourceModal}
      open={visible}
      width='90%'
      maskClosable={false}
      closable={false}
      title={undefined}
      cancelText={I18N.carbonFootprint3.close}
      okButtonProps={{ className: styles.okButton }}
      onCancel={onCancel}
    >
      <div className={styles.main}>
        {emissionDrawerVisible && (
          <EmissionDrawer
            isOnlyDetail
            readPretty
            isProcess={isProcess}
            visible={emissionDrawerVisible}
            title={I18N.carbonFootprint3.emissionSourceDetails}
            matchWayOptions={matchWayOptions}
            initialValues={emissionInitialValues}
            loading={emissionDrawerLoading}
            processName={
              clickModelValue?.processId
                ? clickModelValue?.name
                : parentNodeInfo?.value.name
            }
            onCancel={closeEmissionDrawer}
          />
        )}
        {processDrawerVisible && (
          <ProcessDrawer
            isOnlyDetail
            readPretty
            isProcess={isProcess}
            visible={processDrawerVisible}
            initialValues={processInitialValues}
            loading={processDrawerLoading}
            onCancel={closeProcessDrawer}
            parentProcessNodeInfoName={parentNodeInfo?.value.name}
            isProcessAccountRoot={isRootProcessNode}
          />
        )}
        {outPutVisible && (
          <AccessoryOutPutDrawer
            isOnlyDetail
            isEdit={false}
            isProcess={isProcess}
            parentProcessNodeInfoName={parentNodeInfo?.value.name}
            visible={outPutVisible}
            loading={outPutDrawerLoading}
            initValues={outPutInitValues}
            onCancel={() => {
              setOutPutVisible(false);
            }}
          />
        )}
        {exportVisible && (
          <AccessoryExportDrawer
            isOnlyDetail
            isProcess={isProcess}
            isEdit={false}
            visible={exportVisible}
            loading={exportDrawerLoading}
            initValues={exportInitValues}
            accountId={accountId ? Number(accountId) : 0}
            processId={
              clickModelValue?.processId
                ? Number(clickModelValue?.processId)
                : 0
            }
            onCancel={() => {
              setExportVisible(false);
            }}
          />
        )}
        <div className={styles.mainHeader}>
          <div onClick={() => setIsVisualState(s => !s)}>
            {isVisualState ? (
              <span className={styles.changeListOrGraph}>
                <UnorderedListOutlined />
                <span className='m-l-6'>
                  {I18N.carbonFootprint3.switchToList}
                </span>
              </span>
            ) : (
              <span className={styles.changeListOrGraph}>
                <IconAlibaba
                  type='icon-icon_qiehuanzhikeshihua'
                  style={{
                    fontSize: 16,
                  }}
                />
                <span className='m-l-6'>
                  {I18N.carbonFootprint3.switchToVisual}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className={styles.mainContainer}>
          {!isVisualState && (
            <div className={styles.buildListMainStep}>
              <div className={styles.buildListStep}>
                <ProcessBusinessAccountingManagement
                  isOnlyDetail
                  isProcess={isProcess}
                  isEdit={false}
                  id={`${id}`}
                />
              </div>
            </div>
          )}
          {isVisualState && (
            <ProcessModelGraph
              isOnlyDetail
              isProcess={isProcess}
              processId={id}
              cRef={childGrapRef}
              infoId={id || undefined}
              onClickNode={(tagName, model, parentNode) => {
                graphNodeClick(tagName, model, parentNode);
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EmissionSourceModal;
