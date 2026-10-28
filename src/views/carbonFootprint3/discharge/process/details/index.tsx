/*
 * @@description: 编辑过程库
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-03 18:50:48
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 18:19:40
 */

import useUrlState from '@ahooksjs/use-url-state';
import { UnorderedListOutlined } from '@ant-design/icons';
import IconFont, { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { ProcessModelGraph } from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph';
import {
  TagName,
  NodeData,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/types';
import { isFold } from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/utils';
import ProcessBusinessAccountingManagement from '@src/views/carbonFootprint3/ProcessBusinessAccounting/Management';
import { ProcessApiProduct } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/type';
import EmissionDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer';
import { Emission } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/type';
import AccessoryExportDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ExportDrawer';
import AccessoryOutPutDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer';
import { AccessoryOutPutData } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/type';
import ProcessDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer';
import { GRAPH_SHAPE_NAME } from '@src/views/carbonFootprint3/graph/constant';
import { Modal } from 'antd';
import { VFC, useMemo, useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ValueOf } from 'type-fest';

import styles from './index.module.less';
import {
  getEmissionInfo,
  getProcessExports,
  getProcessOutputs,
  getUnitProcessInfo,
  postEmissionAdd,
  postEmissionEdit,
  postProcessExportsEdit,
  postProcessOutputsEdit,
  postProcessViewNodeStatus,
  postUnitProcessAdd,
  postUnitProcessCopy,
  postUnitProcessEdit,
} from '../service';

const DISPLAY_TYPE = {
  TABLE: 'TABLE',
  VISUALIZATION: 'VISUALIZATION',
} as const;

const EditProcessLibrary: VFC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const [urlState, setUrlState] = useUrlState();

  /** 是否是只读 */
  const isDetail = urlState.isEdit === 'false' || !urlState.isEdit;

  const processId = useMemo(() => Number(id), [id]);

  const [displayType, setDisplayType] = useState<ValueOf<typeof DISPLAY_TYPE>>(
    () => {
      if (urlState && urlState.displayType) {
        return urlState.displayType;
      }
      return DISPLAY_TYPE.VISUALIZATION;
    },
  );

  const [currModelValue, setCurrModelValue] = useState<NodeData['value']>();
  const [parentProcessModelValue, setParentProcessModelValue] =
    useState<NodeData['value']>();

  /** 是否是复制的排放源 */
  const [copyStatus, setCopyStatus] = useState<boolean>(false);

  /** 排放源 EmissionDrawer Props */
  const [emissionDrawerVisible, setEmissionDrawerVisible] = useState(false);
  const [emissionDrawerLoading, setEmissionDrawerLoading] = useState(false);
  const [emissionInitialValues, setEmissionInitialValues] =
    useState<Emission>();
  const [currEmissionId, setCurrEmissionId] = useState<number>();

  /** 单元过程 ProcessDrawer Props */
  const [processDrawerVisible, setProcessDrawerVisible] = useState(false);
  const [isProcessLibRoot, setIsProcessLibRoot] = useState(false);

  const [processDrawerLoading, setProcessDrawerLoading] = useState(false);
  const [processInitialValues, setProcessInitialValues] =
    useState<Record<string, any>>();
  const [currProcessId, setCurrProcessId] = useState<number>();

  /** 产出物 OutputDrawer Props */
  const [outPutDrawerVisible, setOutPutDrawerVisible] = useState(false);
  const [outPutDrawerLoading, setOutPutDrawerLoading] = useState(false);
  const [outPutInitValues, setOutPutInitValues] =
    useState<AccessoryOutPutData[]>();

  /** 输出 ExportDrawer Props */
  const [exportDrawerVisible, setExportDrawerVisible] = useState(false);
  const [exportDrawerLoading, setExportDrawerLoading] = useState(false);
  const [exportInitValues, setExportInitValues] =
    useState<ProcessApiProduct[]>();

  const graphRef = useRef<{
    resetGraph: () => Promise<any>;
  }>(null);

  const closeEmissionDrawer = () => {
    setEmissionDrawerVisible(false);
    setEmissionDrawerLoading(false);
    setEmissionInitialValues(undefined);
    setCurrEmissionId(undefined);
    setCurrModelValue(undefined);
    setParentProcessModelValue(undefined);
  };

  const addEmission = (model: NodeData['value']) => {
    setCurrModelValue(model);
    setEmissionDrawerVisible(true);
  };

  const editEmission = async (
    model: NodeData['value'],
    emissionId: number,
    parentProcessModel?: NodeData['value'],
  ) => {
    try {
      setCurrModelValue(model);
      setParentProcessModelValue(parentProcessModel);
      setCurrEmissionId(emissionId);
      setEmissionDrawerLoading(true);
      setEmissionDrawerVisible(true);
      const resp = await getEmissionInfo({ id: emissionId });
      setEmissionInitialValues(resp.data.data);
      setEmissionDrawerLoading(false);
    } catch (e) {
      setEmissionDrawerLoading(false);
      throw e;
    }
  };

  const submitEmission = async (values: Emission) => {
    if (currModelValue === undefined) {
      return;
    }
    if (copyStatus && values.processId) {
      // 复制排放源
      await postEmissionAdd({ ...values, processId: values.processId });

      Toast('success', I18N.carbonFootprint3.copySuccessful);
      closeEmissionDrawer();
      if (!isFold(currModelValue)) {
        graphRef.current?.resetGraph();
      } else {
        postProcessViewNodeStatus({
          id: currModelValue.dataId,
          status: 1,
        }).finally(() => {
          graphRef.current?.resetGraph();
        });
      }
      return;
    }

    if (currEmissionId === undefined) {
      // 新增排放源
      await postEmissionAdd({
        ...values,
        processId: Number(currModelValue.processId),
      });
    } else {
      // 编辑排放源
      await postEmissionEdit({
        ...values,
        processId: Number(currModelValue.processId),
        id: currEmissionId,
      });
    }
    Toast(
      'success',
      currEmissionId === undefined
        ? I18N.carbonFootprint.newSuccessfullyAdded2
        : I18N.carbonFootprint.editSuccessful,
    );
    closeEmissionDrawer();
    if (!isFold(currModelValue)) {
      graphRef.current?.resetGraph();
    } else {
      postProcessViewNodeStatus({
        id: currModelValue.dataId,
        status: 1,
      }).finally(() => {
        graphRef.current?.resetGraph();
      });
    }
  };

  const closeProcessDrawer = () => {
    setProcessDrawerVisible(false);
    setProcessDrawerLoading(false);
    setProcessInitialValues(undefined);
    setCurrModelValue(undefined);
    setParentProcessModelValue(undefined);
    setCurrProcessId(undefined);
  };

  const addProcess = (model: NodeData['value']) => {
    setIsProcessLibRoot(model.parentId === '0');
    setCurrModelValue(model);
    setProcessDrawerVisible(true);
  };

  const editProcess = async (
    model: NodeData['value'],
    editProcessId: number,
    parentProcessModel?: NodeData['value'],
  ) => {
    try {
      setCurrModelValue(model);
      setParentProcessModelValue(parentProcessModel);
      setCurrProcessId(editProcessId);
      setProcessDrawerLoading(true);
      setProcessDrawerVisible(true);
      setIsProcessLibRoot(model.parentId === '0');
      const resp = await getUnitProcessInfo({
        parentId: model.parentId,
        dataId: model.dataId,
      });
      setProcessInitialValues(resp.data.data);
      setProcessDrawerLoading(false);
    } catch (e) {
      setProcessDrawerLoading(false);
      throw e;
    }
  };

  const submitProcess = async values => {
    if (currModelValue === undefined) {
      return;
    }

    // 复制过程
    if (copyStatus) {
      await postUnitProcessCopy({
        ...values,
        dataId: currModelValue.dataId,
        parentId: currModelValue.parentId,
      });

      Toast('success', I18N.carbonFootprint3.copySuccessful);
      closeProcessDrawer();
      if (!isFold(currModelValue)) {
        graphRef.current?.resetGraph();
      } else {
        postProcessViewNodeStatus({
          id: currModelValue.dataId,
          status: 1,
        }).finally(() => {
          graphRef.current?.resetGraph();
        });
      }
      return;
    }

    if (currProcessId === undefined) {
      // 新增单元过程
      await postUnitProcessAdd({
        ...values,
        dataId: currModelValue.dataId,
        parentId: currModelValue.parentId,
      });
    } else {
      // 编辑单元过程
      await postUnitProcessEdit({
        ...values,
        dataId: currModelValue.dataId,
        parentId: currModelValue.parentId,
      });
    }
    Toast(
      'success',
      currProcessId === undefined
        ? I18N.carbonFootprint.newSuccessfullyAdded2
        : I18N.carbonFootprint.editSuccessful,
    );
    closeProcessDrawer();
    if (!isFold(currModelValue)) {
      graphRef.current?.resetGraph();
    } else {
      postProcessViewNodeStatus({
        id: currModelValue.dataId,
        status: 1,
      }).finally(() => {
        graphRef.current?.resetGraph();
      });
    }
  };

  const closeOutPutDrawer = () => {
    setOutPutDrawerVisible(false);
    setOutPutDrawerLoading(false);
    setOutPutInitValues(undefined);
    setCurrModelValue(undefined);
    setParentProcessModelValue(undefined);
  };

  const editOutput = async (
    model: NodeData['value'],
    parentProcessModel?: NodeData['value'],
  ) => {
    try {
      setCurrModelValue(model);
      setParentProcessModelValue(parentProcessModel);
      setOutPutDrawerVisible(true);
      setOutPutDrawerLoading(true);
      const resp = await getProcessOutputs({
        dataId: model.dataId,
        parentId: model.parentId,
      });
      setOutPutInitValues(resp.data.data.processProducts);
      setOutPutDrawerLoading(false);
    } catch (e) {
      setOutPutDrawerLoading(false);
      throw e;
    }
  };

  const submitOutput = async values => {
    if (currModelValue === undefined) {
      return;
    }
    await postProcessOutputsEdit({
      dataId: currModelValue.dataId,
      parentId: currModelValue.parentId,
      processProducts: values,
    });
    Toast('success', I18N.carbonFootprint.editSuccessful);
    closeOutPutDrawer();
    graphRef.current?.resetGraph();
  };

  const closeExportDrawer = () => {
    setExportDrawerVisible(false);
    setExportDrawerLoading(false);
    setExportInitValues(undefined);
    setCurrModelValue(undefined);
  };

  const editExports = async (model: NodeData['value']) => {
    try {
      setCurrModelValue(model);
      setExportDrawerLoading(true);
      setExportDrawerVisible(true);
      const resp = await getProcessExports({
        dataId: model.dataId,
        parentId: model.parentId,
      });
      setExportInitValues(resp.data.data.processOuts);
      setExportDrawerLoading(false);
    } catch (e) {
      setExportDrawerLoading(false);
      throw e;
    }
  };

  const submitExports = async values => {
    if (currModelValue === undefined) {
      return;
    }
    await postProcessExportsEdit({
      dataId: currModelValue.dataId,
      parentId: currModelValue.parentId,
      processOuts: values,
    });
    Toast('success', I18N.carbonFootprint.editSuccessful);
    closeExportDrawer();
    graphRef.current?.resetGraph();
  };

  const onGraphClick = (
    tagName: TagName,
    model: NodeData['value'],
    parentNode: NodeData | undefined,
  ) => {
    setCopyStatus(false);
    if (tagName === GRAPH_SHAPE_NAME.ADD_EMISSION_TEXT) {
      // 添加排放源
      addEmission(model);
    } else if (tagName === GRAPH_SHAPE_NAME.ADD_UNIT_TEXT) {
      // 添加单元过程
      addProcess(model);
    } else if (tagName === GRAPH_SHAPE_NAME.OUTPUT_INFO) {
      // 编辑产出物
      editOutput(model, parentNode?.value);
    } else if (tagName === GRAPH_SHAPE_NAME.EXPORT_INFO) {
      // 编辑输出
      editExports(model);
    } else if (tagName === GRAPH_SHAPE_NAME.INFO_RECT) {
      if (model.matchType === 0) {
        // 点击排放源Card
        editEmission(model, model.dataId, parentNode?.value);
      } else if (model.matchType === 1) {
        // 点击过程Card
        editProcess(model, Number(model.processId), parentNode?.value);
      }
    } else if (tagName === GRAPH_SHAPE_NAME.COPY_TEXT) {
      setCopyStatus(true);
      // 排放源
      if (model.matchType === 0) {
        editEmission(model, model.dataId, parentNode?.value);
      } else if (model.matchType === 1) {
        // 过程
        editProcess(model, Number(model.processId), parentNode?.value);
      }
    }
  };

  /**
   * @description: 切换列表和可视化
   */
  const changeListOrGraph = () => {
    const tabType =
      displayType === DISPLAY_TYPE.TABLE
        ? DISPLAY_TYPE.VISUALIZATION
        : DISPLAY_TYPE.TABLE;

    setUrlState(params => ({
      ...params,
      displayType: tabType,
    }));

    setDisplayType(tabType);
  };

  return (
    <Modal
      destroyOnClose
      open
      className={styles.fullModal}
      width='100%'
      title={undefined}
      footer={null}
      closable={false}
      transitionName=''
    >
      <div className={styles.processLib}>
        <div className={styles.processHeader}>
          <div
            className={styles.backBtn}
            onClick={() => {
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibrary,
              );
            }}
          >
            <IconFont className={styles.backIcon} type='icon-icon-zuojiantou' />
            <span>{I18N.carbonFootprint3.processLibrary}</span>
          </div>
          <div
            className={styles.displayTypeBtn}
            onClick={() => changeListOrGraph()}
          >
            {displayType === DISPLAY_TYPE.VISUALIZATION ? (
              <>
                <UnorderedListOutlined className={styles.displayTypeIcon} />
                <span>{I18N.carbonFootprint3.switchToList}</span>
              </>
            ) : (
              <>
                <IconAlibaba
                  className={styles.displayTypeIcon}
                  type='icon-icon_qiehuanzhikeshihua'
                />
                <span>{I18N.carbonFootprint3.switchToVisual}</span>
              </>
            )}
          </div>
        </div>
        <div className={styles.processBody}>
          {displayType === DISPLAY_TYPE.TABLE ? (
            <div className={styles.processTable}>
              <div className={styles.processTableContent}>
                <ProcessBusinessAccountingManagement
                  isEdit={!isDetail}
                  isProcess
                  isOnlyDetail={isDetail}
                  id={String(processId)}
                  showFactorEvaluationCard={false}
                />
              </div>
            </div>
          ) : (
            <div className={styles.processGraph}>
              <ProcessModelGraph
                isProcess
                isOnlyDetail={isDetail}
                processId={processId}
                cRef={graphRef}
                onClickNode={onGraphClick}
              />
            </div>
          )}
        </div>
      </div>
      {emissionDrawerVisible && (
        <EmissionDrawer
          isProcess
          copyStatus={copyStatus}
          isOnlyDetail={isDetail}
          visible={emissionDrawerVisible}
          initialValues={emissionInitialValues}
          loading={emissionDrawerLoading}
          showFactorEvaluationCard={false}
          processName={
            currEmissionId === undefined
              ? currModelValue?.name
              : parentProcessModelValue?.name
          }
          onOk={submitEmission}
          onCancel={closeEmissionDrawer}
        />
      )}
      {processDrawerVisible && (
        <ProcessDrawer
          isProcess
          copyStatus={copyStatus}
          isOnlyDetail={isDetail}
          visible={processDrawerVisible}
          initialValues={processInitialValues}
          loading={processDrawerLoading}
          rootProcessId={id}
          parentProcess={
            currProcessId === undefined
              ? currModelValue
              : parentProcessModelValue
          }
          onOk={submitProcess}
          onCancel={closeProcessDrawer}
          isProcessLibRoot={isProcessLibRoot}
        />
      )}
      {outPutDrawerVisible && (
        <AccessoryOutPutDrawer
          isEdit
          isProcess
          unitName=''
          // @ts-ignore
          parentProcessNodeInfo={parentProcessModelValue}
          open={outPutDrawerVisible}
          loading={outPutDrawerLoading}
          initValues={outPutInitValues}
          onOk={submitOutput}
          onCancel={closeOutPutDrawer}
        />
      )}
      {exportDrawerVisible && (
        <AccessoryExportDrawer
          isEdit
          isProcess
          visible={exportDrawerVisible}
          loading={exportDrawerLoading}
          unitName=''
          initValues={exportInitValues}
          accountId={0}
          processId={currModelValue?.processId ?? 0}
          onOk={submitExports}
          onCancel={closeExportDrawer}
        />
      )}
    </Modal>
  );
};

export default EditProcessLibrary;
