/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-21 17:08:53
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-23 16:36:09
 */

import {
  MinusOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Node } from '@antv/g6';
import topProcess from '@src/assets/svg/icon_product_fill2.svg';
import { checkPermissions } from '@src/components/Permission/utils';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Modal, Tooltip, Select, Button, InputNumber } from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import { ceil, round } from 'lodash-es';
import { VFC, useEffect, useCallback, useMemo, useState } from 'react';

import styles from './index.module.less';
import { getAccountView } from './service';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '../../BusinessAccountingModel/constant';
import EmissionSourceDrawer from '../../component/EmissionSourceDrawer';
import {
  QUICK_ACCOUNT_EMISSION_ICON_MAP,
  QUICK_ACCOUNT_EMISSION_LABEL,
  QUICK_ACCOUNT_LIFE_CYCLE,
  QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP,
} from '../../constant';
import Graph from '../../graph/graph';
import { GraphTreeNode } from '../../graph/type';
import { QuickAccountLifeCycleStage } from '../../type';
import {
  postQuickBusinessAccountingEmissionDelete,
  postQuickBusinessAccountingEmissionExportExcel,
  postQuickBusinessAccountingEmissionInStore,
  postQuickBusinessAccountingScopeUpdate,
} from '../service';
import { QuickBusinessAccountingInfo } from '../type';

type AccountGraphProps = {
  id: number;
  accountInfo?: QuickBusinessAccountingInfo;
  toggleDisplayType: () => void;
  onImport: () => void;
  onSelectScopeSuccess?: () => void;
};

const graphContainerId = 'account_graph';

const AccountGraph: VFC<AccountGraphProps> = ({
  id,
  accountInfo,
  toggleDisplayType,
  onImport,
  onSelectScopeSuccess,
}) => {
  const [emissionSourceDrawerVisible, setEmissionSourceDrawerVisible] =
    useState(false);

  const [readPretty, setReadPretty] = useState(false);

  const [emissionSourceId, setEmissionSourceId] = useState<number>();

  /** 画布放大倍数 */
  const [zoomNum, setZoomNum] = useState<number>(1);

  const [stage, setStage] = useState<QuickAccountLifeCycleStage>(
    QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL,
  );

  const graphRef: { instance: Graph | null } = useMemo(
    () => ({ instance: null }),
    [],
  );

  const getAccountLifeCycle = useCallback(async (accountId: number) => {
    try {
      const resp = await getAccountView({ id: accountId });
      const { code, name, typeName, total } = resp.data.data;
      const treeNodeList: GraphTreeNode[] = (resp.data.data.children || []).map(
        lifeCycle => {
          const { code, name, total, emissionList, typeName } = lifeCycle;
          return {
            id: code,
            name,
            typeName,
            img: QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP[code],
            extraData: {
              total,
            },
            children: emissionList.map(emission => {
              const {
                type,
                name: emissionName,
                emissionTotal,
                libState,
                typeName,
                matchWay,
                requestState,
                matchObject,
                unitStr,
              } = emission;
              return {
                id: emission.id,
                name: QUICK_ACCOUNT_EMISSION_LABEL[type],
                img: QUICK_ACCOUNT_EMISSION_ICON_MAP[type],
                typeName,
                extraData: {
                  unitStr,
                  name: emissionName,
                  total: emissionTotal,
                  accountLifeCycleStage: code,
                  isCompleted: emissionTotal !== null,
                  isSupplierData:
                    matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER,
                  isWaitSupplierReply:
                    matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
                    requestState === MODEL_EMISSION_REQUEST_STATE.WAITING,
                  status: libState,
                  isSaved: !!libState,
                  matchWay,
                  requestState,
                  matchObject,
                },
              };
            }),
          };
        },
      );
      return [
        {
          id: code,
          name,
          typeName,
          isRoot: true,
          img: topProcess,
          extraData: {
            total,
          },
        },
        ...treeNodeList,
      ];
    } catch {
      return [];
    }
  }, []);

  const updateGraph = () => {
    getAccountLifeCycle(id).then(treeNodeList => {
      graphRef.instance?.changeData(treeNodeList);
    });
  };

  const closeEmissionDrawer = () => {
    setEmissionSourceDrawerVisible(false);
    setReadPretty(false);
    setTimeout(() => {
      setEmissionSourceId(undefined);
    }, 300);
  };

  const deleteEmission = (_, node: Node) => {
    const nodeModel = node.getModel() || {};
    const emissionId = nodeModel.id;
    const emissionName = (nodeModel.extraData as Record<string, any>)?.name;
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis9, {
        val1: emissionName,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        if (!emissionId) {
          return;
        }
        try {
          await postQuickBusinessAccountingEmissionDelete({
            id: emissionId,
          });
          Toast('success', I18N.carbonFootprint.deleteSuccessful);
          updateGraph();
        } catch {}
      },
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

    const { matchWay, requestState, matchObject } = nodeModel.extraData as {
      matchWay: number;
      requestState: number;
      matchObject: Record<string, any>;
    };
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

  const addEmissionSource = (_, node: Node) => {
    const nodeModel = node.getModel();
    setStage(Number(nodeModel.id) as QuickAccountLifeCycleStage);
    setEmissionSourceDrawerVisible(true);
  };

  const selectScope = async (scope: number) => {
    try {
      await postQuickBusinessAccountingScopeUpdate({ id, scope });
      Toast('success', I18N.carbonFootprint3.updateSuccessful);
      updateGraph();
      onSelectScopeSuccess?.();
    } catch {}
  };

  const saveEmissionSourceInStore = async (_, node: Node) => {
    try {
      const nodeModel = node.getModel();
      const extraData = nodeModel.extraData as { status: number };
      if (!extraData.status) {
        await postQuickBusinessAccountingEmissionInStore({
          id: Number(nodeModel.id),
        });
        Toast('success', I18N.carbonFootprint3.successfullySavedTo);
        updateGraph();
      }
    } catch {}
  };

  /**
   * @description: 导出文件
   */
  const exportExcel = async () => {
    Toast('success', I18N.carbonFootprint.startDownloading);
    const back = await postQuickBusinessAccountingEmissionExportExcel({ id });

    if (back.data.code === 200) {
      saveAs(back.data.data);
    } else {
      Toast('error', I18N.carbonFootprint3.downloadFailed);
    }
  };

  const operatePermission = true;

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

  useEffect(() => {
    if (!graphRef.instance) {
      graphRef.instance = new Graph(
        {
          container: graphContainerId,
        },
        {
          graphType: 'quickAccount',
          operatePermission,
          eventMap: {
            [`${Graph.getGraphShapeNameMap().DELETE_IMG}-click`]:
              deleteEmission,
            [`${Graph.getGraphShapeNameMap().ADD_IMG}-click`]:
              addEmissionSource,
            [`${Graph.getGraphShapeNameMap().ADD_TEXT}-click`]:
              addEmissionSource,
            [`${Graph.getGraphNodeNameMap().CHILD_NODE}-click`]:
              editEmissionSource,
            [`${Graph.getGraphShapeNameMap().SAVE_STORE_TEXT}-click`]:
              saveEmissionSourceInStore,
          },
        },
      );
      getAccountLifeCycle(id).then(treeNodeList => {
        graphRef.instance!.setData(treeNodeList);
      });

      graphRef.instance.graph.on('wheel', () => {
        const backZoomNum = graphRef.instance?.graph.getZoom();
        if (backZoomNum) {
          const ratio = ceil(backZoomNum, 2);
          setZoomNum(ratio);
        }
      });
    }
  }, [id]);

  return (
    <div className={styles.accountGraph}>
      <div className={styles.accountGraphHeader}>
        <div className={styles.infoContainer}>
          <span className={styles.infoContainerNameColor}>
            {I18N.carbonFootprint3.functionalUnits2}
          </span>
          {accountInfo?.accountName && accountInfo.accountName.length > 30 ? (
            <Tooltip title={accountInfo?.accountName}>
              <span className={styles.accountName}>
                {accountInfo?.accountName}
              </span>
            </Tooltip>
          ) : (
            <span>{accountInfo?.accountName}</span>
          )}

          <span className={`${styles.infoContainerNameColor} m-l-30`}>
            {I18N.carbonFootprint.accountingCycle2}
          </span>

          <span>
            {accountInfo?.startTime}
            {I18N.carbonFootprint.to}
            {accountInfo?.endTime}
          </span>
          <span className={styles.selectScopeBorder} />

          {checkPermissions(
            <Select
              className={styles.quickGraphScope}
              bordered={false}
              value={accountInfo?.scope}
              onChange={selectScope}
              options={[
                { label: I18N.carbonFootprint3.halfLifeCycle, value: 0 },
                { label: I18N.carbonFootprint3.fullLifecycle, value: 1 },
              ]}
            />,
            'footprint3:account:save:fast',
          )}
        </div>
        <div className={styles.operateContainer}>
          {operatePermission && (
            <>
              <span onClick={onImport} className={styles.importAndOutMain}>
                <IconAlibaba
                  type='icon-icon_daoru'
                  style={{ fontSize: 16, marginRight: 4 }}
                />
                {I18N.carbonFootprint.importEmissionSources}
              </span>
              <span className={styles.selectScopeBorder} />
            </>
          )}

          <span
            onClick={exportExcel}
            className={classNames(styles.importAndOutMain, 'm-l-16')}
          >
            <IconAlibaba
              type='icon-icon_daochu'
              style={{
                fontSize: 16,
                marginRight: 4,
              }}
            />
            {I18N.carbonFootprint3.exportEmissionSources}
          </span>
          <span className={styles.selectScopeBorder} />
          <span
            className={classNames(styles.importAndOutMain, 'm-l-16')}
            onClick={() => toggleDisplayType()}
          >
            <UnorderedListOutlined />
            <span className='m-l-6'>{I18N.carbonFootprint3.switchToList}</span>
          </span>
        </div>
      </div>
      <div className={styles.graphContainer}>
        <div className={styles.graphBox} id={graphContainerId} />
        <div className={styles.graphZoom}>
          <Button
            onClick={() => changeZoom('zoomOut')}
            className={styles.graphZoomBtn}
            icon={<MinusOutlined />}
          />
          <InputNumber
            max={400}
            maxLength={3}
            min={0}
            type='number'
            controls={false}
            className={styles.graphZoomNum}
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
          <span className={styles.graphZoomNumPercent}>%</span>
          <Button
            onClick={() => changeZoom('zoomIn')}
            className={styles.graphZoomBtn}
            icon={<PlusOutlined />}
          />
        </div>
      </div>
      <EmissionSourceDrawer
        visible={emissionSourceDrawerVisible}
        accountId={id}
        readPretty={!operatePermission || readPretty}
        emissionSourceId={emissionSourceId}
        stage={stage}
        onClose={closeEmissionDrawer}
        onSuccess={() => {
          closeEmissionDrawer();
          updateGraph();
        }}
      />
    </div>
  );
};

export default AccountGraph;
