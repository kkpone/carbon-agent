import { Form } from '@formily/core';
import { FormConsumer, FormProvider } from '@formily/react';
import I18N from '@src/lang/I18N';
import { POST019458d093852b75a996ddb8bf0570f1 } from '@src/sdks_v2/footprint3V2ApiDocs';
import { Toast } from '@src/utils/Toast';
import { ProcessModelGraph } from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph';
import {
  NodeData,
  TagName,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/types';
import { isFold } from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/utils';
import {
  MODEL_EMISSION_MATCH_WAY_ICON,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { PROCESS_MATCH_TYPE } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/constant';
import { postProcessVisualizationInEdit } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/service';
import EmissionDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer';
import {
  getProcessAccountEmissionInfo,
  getProcessAccountInDetail,
  postProcessAccountEmissionInAdd,
  postProcessAccountInAddAndRequest,
  postProcessAccountInEditAndRequest,
  postProcessAccountInEmissionEdit,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';
import { Emission } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/type';
import AccessoryOutPutDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer';
import { postProcessVisualizationOutPutsList } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/service';
import { AccessoryOutPutData } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/type';
import ProcessDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer';
import {
  postProcessVisualizationInAdd,
  postProcessVisualizationInCopy,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer/service';
import { postProcessVisualizationProductsAdd } from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProductDrawer/service';
import DrawerProductFooter from '@src/views/carbonFootprint3/discharge/process/components/DrawerProductFooter';
import {
  MATCH_WAY,
  MATCH_WAY_LABEL,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import { GRAPH_SHAPE_NAME } from '@src/views/carbonFootprint3/graph/constant';
import { isBuySupplier } from '@src/views/carbonFootprint3/service';
import { useMount } from 'ahooks';
import { Button } from 'antd';
import { has } from 'lodash-es';
import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';

import { getToken } from '@/utils/cookie';

import style from './index.module.less';
import { ProcessBuildVisualProps } from './type';
import { API_EXTRA_PARAMS_SNAPFLAG } from '../../constant';

const { FACTOR, PROCESS, SUPPLIER } = PROCESS_MATCH_TYPE;
const { FACTOR_ICON, SUPPLIER_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;
const { NOT_SUBMIT, WAITING } = MODEL_EMISSION_REQUEST_STATE;

type MatchWayBtns = { value: number; label: string; icon?: string };

export const ProcessBuildVisual: FC<ProcessBuildVisualProps> = memo(
  ({
    accountInfo,
    isDetail,
    apiExtraParams,
    editAccount,
    enableFactorSourceRange,
    onEmissionTaskCreate,
  }) => {
    const { id } = accountInfo;
    // 是购买供应链相关产品
    const showSupplierRef = useRef<boolean>(false);
    const childGrapRef = useRef<{
      resetGraph: () => Promise<any>;
    }>(null);

    const emissionDrawerRef = useRef<{
      form: Form<Record<string, any>>;
      getFormatterFormValues: () => Promise<Emission>;
    }>(null);

    const [processId, setProcessId] = useState<number | null>(null);

    /** 当前点击节点父节点的信息 */
    const [parentNodeInfo, setParentNodeInfo] = useState<NodeData>();

    const [clickModelValue, setClickModelValue] = useState<NodeData['value']>();

    /** 排放源 EmissionDrawer Props */
    const [emissionDrawerVisible, setEmissionDrawerVisible] = useState(false);
    const [emissionDrawerTitle, setEmissionDrawerTitle] = useState<string>();
    const [emissionDrawerLoading, setEmissionDrawerLoading] = useState(false);
    /** 是否是复制状态 */
    const [copyEmissionStatus, setCopyEmissionStatus] = useState(false);

    const [emissionInitialValues, setEmissionInitialValues] =
      useState<Emission>();
    const [stage] = useState<number>();
    const [emissionId, setEmissionId] = useState<number>();
    const [defaultMatchWay, setDefaultMatchWay] = useState<number>();
    const [matchWayOptions, setMatchWayOptions] = useState<MatchWayBtns[]>();
    const [, setEmissionDrawerFormMounted] = useState(false);

    /** 单元过程Drawer Props */
    /** 是否是根节点 */
    const [isRootProcessNode, setIsRootProcessNode] = useState(false);
    const [processDrawerVisible, setProcessDrawerVisible] = useState(false);
    const [processDrawerEdit, setProcessDrawerEdit] = useState(false);
    const [processDrawerLoading, setProcessDrawerLoading] = useState(false);
    const [processInitialValues, setProcessInitialValues] =
      useState<Record<string, any>>();

    /** 产出物的侧滑抽屉 */
    const [outPutVisible, setOutPutVisible] = useState(false);
    const [outPutDrawerLoading, setOutPutDrawerLoading] = useState(false);
    const [outPutInitValues, setOutPutInitValues] =
      useState<AccessoryOutPutData[]>();

    const [, setEmissionDrawerFooter] = useState<React.ReactNode>();
    /**
     * @description: 提交或者关闭抽屉后的回调
     */
    const closeDrawerBackCall = () => {
      setClickModelValue(undefined);
      if (clickModelValue) {
        // NOTE 后端不好实现添加因子后展开节点，所以改为前端添加数据后展开该节点
        // 顶级节点不调用折叠接口
        if (!isFold(clickModelValue)) {
          childGrapRef.current?.resetGraph();
          return;
        }
        // 展开当前节点
        POST019458d093852b75a996ddb8bf0570f1({
          ...apiExtraParams,
          id: clickModelValue.dataId,
          status: 1,
        }).finally(() => {
          childGrapRef.current?.resetGraph();
        });
      }
    };

    /**
     * @description: 关闭或者提交排放源
     * @param {boolean} restGraph 是否刷新画布
     */
    const closeEmissionDrawer = (restGraph?: boolean) => {
      setEmissionDrawerVisible(false);
      setEmissionDrawerTitle(undefined);
      setEmissionDrawerLoading(false);
      setEmissionInitialValues(undefined);
      setEmissionId(undefined);
      setMatchWayOptions(undefined);
      setDefaultMatchWay(undefined);

      // 更新画布
      if (restGraph) {
        closeDrawerBackCall();
      }
    };

    /**
     * @description:关闭单元过程
     * @param {boolean} restGraph 是否刷新画布
     * @return {*}
     */
    const closeProcessDrawer = (restGraph?: boolean) => {
      setProcessDrawerVisible(false);
      setProcessInitialValues(undefined);
      setProcessId(null);
      setParentNodeInfo(undefined);

      if (restGraph) {
        closeDrawerBackCall();
      }
      setProcessDrawerLoading(false);
    };

    /**
     * @description: 编辑排放源
     * @param {NodeData} nodeInfo 编辑的节点信息
     */
    const editEmissionClick = async (
      nodeInfo: NodeData['value'],
      copyStatus?: boolean,
    ) => {
      setEmissionDrawerLoading(true);
      setEmissionDrawerVisible(true);
      const { dataId } = nodeInfo;
      const emissionInfo = await getProcessAccountEmissionInfo({
        ...apiExtraParams,
        id: dataId,
      });

      setEmissionInitialValues(emissionInfo.data.data);
      setEmissionId(dataId);

      // 复制，并且是供应商的情况下单独处理
      if (copyStatus && emissionInfo.data.data.matchWay === SUPPLIER) {
        const btnOptions: MatchWayBtns[] = [
          {
            value: MATCH_WAY.FACTOR,
            label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR],
            icon: FACTOR_ICON,
          },
        ];
        // 显示发起收数按钮
        if (showSupplierRef.current) {
          btnOptions.push({
            value: MATCH_WAY.SUPPLIER,
            label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
            icon: SUPPLIER_ICON,
          });
        }

        setMatchWayOptions(btnOptions);
        setEmissionDrawerLoading(false);
        return;
      }

      if (emissionInfo.data.data.requestState !== WAITING) {
        const btnOptions: MatchWayBtns[] = [
          {
            value: MATCH_WAY.FACTOR,
            label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR],
            icon: FACTOR_ICON,
          },
        ];
        // 显示发起收数按钮
        if (showSupplierRef.current) {
          btnOptions.push({
            value: MATCH_WAY.SUPPLIER,
            label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
            icon: SUPPLIER_ICON,
          });
        }

        setMatchWayOptions(btnOptions);
      } else if (showSupplierRef.current) {
        setMatchWayOptions([
          {
            value: MATCH_WAY.SUPPLIER,
            label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
            icon: SUPPLIER_ICON,
          },
        ]);
      }
      setEmissionDrawerLoading(false);
    };

    /**
     * @description: 编辑单元过程
     * @param {NodeData} nodeInfo 编辑的节点信息
     */
    const editProcessInClick = async (nodeInfo: NodeData['value']) => {
      const { data } = await getProcessAccountInDetail({
        ...apiExtraParams,
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

        const { data } = await postProcessVisualizationOutPutsList({
          ...apiExtraParams,
          dataId,
          parentId,
        });

        return data.data.processProducts;
      }

      return undefined;
    };
    /**
     * @description: 编辑产出物
     */
    const editOutPut = async (nodeInfo: NodeData['value']) => {
      setOutPutDrawerLoading(true);
      setOutPutVisible(true);

      const data = await getOutPutInitValues(nodeInfo);
      setOutPutInitValues(data);
      setOutPutDrawerLoading(false);
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
      setCopyEmissionStatus(false);

      if (tagName === GRAPH_SHAPE_NAME.ACCOUNT_EDIT_ICON) {
        editAccount();
      }
      // 新增排放源
      if (tagName === GRAPH_SHAPE_NAME.ADD_EMISSION_TEXT) {
        setEmissionDrawerVisible(true);

        const btnOptions: MatchWayBtns[] = [
          {
            value: MATCH_WAY.FACTOR,
            label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR],
            icon: FACTOR_ICON,
          },
        ];

        // 显示发起收数按钮
        if (showSupplierRef.current) {
          btnOptions.push({
            value: MATCH_WAY.SUPPLIER,
            label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
            icon: SUPPLIER_ICON,
          });
        }
        setMatchWayOptions(btnOptions);
        setEmissionDrawerFooter(undefined);
      }

      // 新增过程
      if (tagName === GRAPH_SHAPE_NAME.ADD_UNIT_TEXT) {
        setProcessId(null);
        setProcessDrawerEdit(false);
        setIsRootProcessNode(model.parentId === '0');
        setProcessDrawerVisible(true);
      }

      // 产出物
      if (tagName === GRAPH_SHAPE_NAME.OUTPUT_INFO) {
        await editOutPut(model);
      }

      // 供应商收数
      if (tagName === GRAPH_SHAPE_NAME.ADD_SUPPLY_TEXT) {
        setEmissionDrawerVisible(true);
        setDefaultMatchWay(MATCH_WAY.SUPPLIER);
        setMatchWayOptions([
          {
            value: MATCH_WAY.SUPPLIER,
            label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
            icon: SUPPLIER_ICON,
          },
        ]);
      }

      /** 这个是点击节点 要展开的编辑 */
      if (tagName === GRAPH_SHAPE_NAME.INFO_RECT) {
        setCopyEmissionStatus(false);
        // 供应商收数
        if (matchType === SUPPLIER) {
          setEmissionId(dataId);
          await editEmissionClick(model);
        }
        // 排放源
        if (matchType === FACTOR) {
          setEmissionId(dataId);
          await editEmissionClick(model);
        }
        // 过程
        if (matchType === PROCESS) {
          setProcessDrawerEdit(true);
          editProcessInClick(model);
        }
      }

      /** 复制 */
      if (tagName === GRAPH_SHAPE_NAME.COPY_TEXT) {
        setCopyEmissionStatus(true);
        // 排放源
        if (matchType === FACTOR) {
          setEmissionId(dataId);
          await editEmissionClick(model);
        }

        // 过程
        if (matchType === PROCESS) {
          setProcessDrawerEdit(true);
          editProcessInClick(model);
        }
        // 供应商收数
        if (matchType === SUPPLIER) {
          setEmissionId(dataId);
          await editEmissionClick(model, true);
        }
      }
    };

    /**
     * @description: 提交排放源
     */
    const submitEmission = async (
      values: Emission,
      requestSupplier?: boolean,
    ) => {
      if (clickModelValue) {
        setEmissionDrawerLoading(true);
        try {
          const { dataId, processId: nodeProcessId } = clickModelValue;

          // 复制
          if (copyEmissionStatus) {
            const reqFunc = requestSupplier
              ? postProcessAccountInAddAndRequest
              : postProcessAccountEmissionInAdd;
            await reqFunc({
              ...apiExtraParams,
              ...values,
              accountId: id,
            });
            Toast('success', I18N.carbonFootprint3.copySuccessful);
            closeEmissionDrawer(true);

            return;
          }

          if (emissionId === undefined) {
            const reqFunc = requestSupplier
              ? postProcessAccountInAddAndRequest
              : postProcessAccountEmissionInAdd;
            await reqFunc({
              ...apiExtraParams,
              ...values,
              processId: nodeProcessId as number,
              accountId: id,
            });
          } else {
            const reqFunc = requestSupplier
              ? postProcessAccountInEditAndRequest
              : postProcessAccountInEmissionEdit;
            await reqFunc({
              ...apiExtraParams,
              ...values,
              accountId: id,
              id: dataId,
            });
          }
          Toast(
            'success',
            emissionId === undefined
              ? I18N.carbonFootprint.newSuccessfullyAdded2
              : I18N.carbonFootprint.editSuccessful,
          );

          closeEmissionDrawer(true);
        } finally {
          setEmissionDrawerLoading(false);
        }
      }
    };

    /**
     * @description: 新增或者编辑过程核算和过程库
     */
    const submitProcess = async values => {
      setProcessDrawerLoading(true);
      try {
        if (copyEmissionStatus) {
          await postProcessVisualizationInCopy({
            ...apiExtraParams,
            ...values,
            dataId: clickModelValue?.dataId,
            parentId: isRootProcessNode ? 0 : 1,
          });

          Toast('success', I18N.carbonFootprint3.copySuccessful);
          closeProcessDrawer(true);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        processDrawerEdit
          ? await postProcessVisualizationInEdit({
              ...apiExtraParams,
              ...values,
              dataId: clickModelValue?.dataId,
              parentId: isRootProcessNode ? 0 : 1,
            })
          : await postProcessVisualizationInAdd({
              ...apiExtraParams,
              ...values,
              dataId: clickModelValue?.dataId,
              parentId: isRootProcessNode ? 0 : 1,
            });
        Toast(
          'success',
          processId === undefined
            ? I18N.carbonFootprint.newSuccessfullyAdded2
            : I18N.carbonFootprint.editSuccessful,
        );
        closeProcessDrawer(true);
      } finally {
        setProcessDrawerLoading(false);
      }
    };

    /**
     * @description: 提交产出物
     * @param {Record} outPutArr 产出物数据
     */
    const subOutPut = async (outPutArr: Record<string, any>[]) => {
      if (clickModelValue) {
        setOutPutDrawerLoading(true);

        const { dataId, parentId } = clickModelValue;

        try {
          const { data } = await postProcessVisualizationProductsAdd({
            ...apiExtraParams,
            dataId,
            parentId,
            processProducts: outPutArr,
          });

          if (data.code === 200) {
            setOutPutVisible(false);
            setOutPutDrawerLoading(false);
            closeDrawerBackCall();
          }
        } catch (e) {
          setOutPutDrawerLoading(false);
        }
      }
    };

    const [isSupplierMatchWay, requestedSupplier, supplierDataId] =
      useMemo(() => {
        const selectedSupplierMatchWay =
          emissionInitialValues?.matchWay === MATCH_WAY.SUPPLIER;

        return [
          selectedSupplierMatchWay || defaultMatchWay === MATCH_WAY.SUPPLIER,
          selectedSupplierMatchWay &&
            emissionInitialValues.requestState !== NOT_SUBMIT,
          emissionInitialValues?.supplierObj?.id,
        ];
      }, [defaultMatchWay, emissionInitialValues]);

    const initFooterNode = () => {
      if (!emissionDrawerRef.current?.form) return;

      const emissionDrawerFooterNode = (
        <FormProvider form={emissionDrawerRef.current.form}>
          <FormConsumer>
            {form => {
              const supplierCarbonDataId = (
                form.values as { supplierObj: Record<string, any> }
              )?.supplierObj?.id;

              // 是否为选择的供应商碳数据
              const isSelectedData =
                supplierCarbonDataId !== undefined &&
                supplierCarbonDataId !== null;

              return (
                <DrawerProductFooter
                  okText={
                    isSelectedData
                      ? I18N.carbonFootprint.preserve
                      : I18N.carbonFootprint3.saveOnly
                  }
                  isEdit={
                    (!requestedSupplier ||
                      (supplierDataId !== undefined &&
                        supplierDataId !== null)) &&
                    !isDetail
                  }
                  extraBtn={
                    isSelectedData ? undefined : (
                      <Button
                        type='primary'
                        onClick={async () => {
                          if (emissionDrawerRef.current) {
                            const values =
                              await emissionDrawerRef.current.getFormatterFormValues();
                            submitEmission(values, true);
                          }
                        }}
                      >
                        {I18N.carbonFootprint3.saveAndGet}
                      </Button>
                    )
                  }
                  onCancelClick={closeEmissionDrawer}
                  onSubClick={async () => {
                    if (emissionDrawerRef.current) {
                      const values =
                        await emissionDrawerRef.current.getFormatterFormValues();
                      submitEmission(values);
                    }
                  }}
                />
              );
            }}
          </FormConsumer>
        </FormProvider>
      );
      setEmissionDrawerFooter(emissionDrawerFooterNode);
    };

    const selectSupplierCallback = () => {
      initFooterNode();
    };

    /**
     * 排放源 - 切换排放数据的按钮tab - 主要是处理发起收数
     * @param way
     */
    const onChangeMatchWayBack = (way: number) => {
      if (way === MATCH_WAY.SUPPLIER) {
        setDefaultMatchWay(way);
      } else {
        setDefaultMatchWay(way);
        setEmissionDrawerFooter(undefined);
      }
    };

    /**
     * 是否有购买供应链产品
     */
    const isShowSupplier = async () => {
      if (
        [
          API_EXTRA_PARAMS_SNAPFLAG.SHARE,
          API_EXTRA_PARAMS_SNAPFLAG.SAASSHARE,
        ].includes(apiExtraParams?.snapFlag)
      ) {
        showSupplierRef.current = true;
        return;
      }

      if (has(apiExtraParams, 'snapFlag')) {
        showSupplierRef.current = true;
        return;
      }
      if (!getToken()) {
        return;
      }
      const supplierBtn = await isBuySupplier();
      showSupplierRef.current = supplierBtn.data.data || false;
    };

    useEffect(() => {
      if (isSupplierMatchWay) {
        initFooterNode();
      }
    }, [isSupplierMatchWay]);

    useMount(isShowSupplier);

    return (
      <>
        <div className={style.processGraph}>
          <ProcessModelGraph
            accountInfo={accountInfo}
            apiExtraParams={apiExtraParams}
            cRef={childGrapRef}
            infoId={id}
            isOnlyDetail={isDetail}
            onClickNode={(tagName, model, parentNode) => {
              graphNodeClick(tagName, model, parentNode);
            }}
            onTaskCreate={value =>
              onEmissionTaskCreate?.({
                emissionSourceId: value.dataId,
                emissionSourceName: value.name || '-',
              })
            }
          />
        </div>
        {emissionDrawerVisible && (
          <EmissionDrawer
            copyStatus={copyEmissionStatus}
            apiExtraParams={apiExtraParams}
            isOnlyDetail={isDetail}
            visible={emissionDrawerVisible}
            title={emissionDrawerTitle}
            ref={emissionDrawerRef}
            readPretty={
              requestedSupplier &&
              (supplierDataId === null || supplierDataId === undefined) &&
              !copyEmissionStatus
            }
            matchWayOptions={matchWayOptions}
            defaultMatchWay={defaultMatchWay}
            onChangeMatchWayBack={onChangeMatchWayBack}
            initialValues={emissionInitialValues}
            loading={emissionDrawerLoading}
            stage={stage}
            processName={
              clickModelValue?.processId
                ? clickModelValue?.name
                : parentNodeInfo?.value.name
            }
            enableFactorSourceRange={
              enableFactorSourceRange &&
              !isDetail &&
              !(
                requestedSupplier &&
                (supplierDataId === null || supplierDataId === undefined) &&
                !copyEmissionStatus
              )
            }
            factorPrefId={accountInfo.factorPrefId}
            selectSupplierCallback={selectSupplierCallback}
            setFormMounted={setEmissionDrawerFormMounted}
            onOk={submitEmission}
            onCancel={closeEmissionDrawer}
          />
        )}
        {processDrawerVisible && (
          <ProcessDrawer
            copyStatus={copyEmissionStatus}
            isOnlyDetail={isDetail}
            visible={processDrawerVisible}
            initialValues={processInitialValues}
            loading={processDrawerLoading}
            onOk={submitProcess}
            onCancel={closeProcessDrawer}
            parentProcessNodeInfoName={parentNodeInfo?.value.name}
            enableFactorSourceRange={enableFactorSourceRange && !isDetail}
            factorPrefId={accountInfo.factorPrefId}
            isProcessAccountRoot={isRootProcessNode}
          />
        )}

        {outPutVisible && (
          <AccessoryOutPutDrawer
            isProcess={false}
            isEdit
            parentProcessNodeInfoName={parentNodeInfo?.value.name}
            visible={outPutVisible}
            loading={outPutDrawerLoading}
            initValues={outPutInitValues}
            onOk={subOutPut}
            onCancel={() => {
              setOutPutVisible(false);
            }}
            enableFactorSourceRange={enableFactorSourceRange && !isDetail}
            factorPrefId={accountInfo.factorPrefId}
          />
        )}
      </>
    );
  },
);
