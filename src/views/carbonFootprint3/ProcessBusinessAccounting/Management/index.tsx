/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 18:06:07
 * @Date: 2023-02-22 09:59:55
 * @@description: 过程核算 - 核算管理
 */

import { createForm, FormPath } from '@formily/core';
import { Button } from '@src/components/Button';
import CustResizable from '@src/components/Resizable';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Spin } from 'antd';
import Tree from 'antd/lib/tree';
import classNames from 'classnames';
import { cloneDeep } from 'lodash-es';
import { Key, memo, useCallback, useEffect, useMemo, useState } from 'react';

import ProcessAccountInOutTab from './ProcessAccountInOutTab';
import ProcessAccountSelectFactor from './ProcessAccountSelectFactor';
import processManagement from './index.module.less';
import { ProcessBusinessAccountingManagementProps } from './type';
import {
  changeParentChildren,
  getTreeApiInfo,
  transformMenuInitInfo,
} from './util';
import businessAccount from '../../businessAccount.module.less';
import TextOverflowTable from '../../component/TextOverflowTable';
import ProcessLibBasicForm from '../../discharge/process/components/ProcessLibBasicForm';
import { ProcessLibData } from '../../discharge/process/type';
import styleCarbonFootprint3 from '../../index.module.less';
import { PROCESS_URL_PARAMS_KEY } from '../../util/constant';
import { UrlListTreeData } from '../AddOrDetail/type';
import {
  getAccountProcess,
  getProcess,
  getProcessBusinessmenu,
  getProcessMenu,
  postProcessAccountEdit,
  postProcessBusinessNextMenu,
  postProcessEdit,
  postProcessNextMenu,
} from '../service';
import { ProcessBusinessAccountingMenu } from '../type';

const { LIST_TREE_DATA } = PROCESS_URL_PARAMS_KEY;

const ProcessBusinessAccountingManagement = ({
  isOnlyDetail,
  isEdit,
  id,
  isProcess,
  scope,
  showFactorEvaluationCard,
}: ProcessBusinessAccountingManagementProps) => {
  const paramsQuery = new URLSearchParams(location.search);

  const listTreeData = paramsQuery.get(LIST_TREE_DATA) || undefined;

  const processLibId = useMemo(() => Number(id), [id]);

  /** 是否显示基本信息可编辑 */
  const [showProcessInfo, setShowProcessInfo] = useState(false);

  const form = useMemo(
    () => createForm<ProcessLibData>({ readPretty: !isEdit }),
    [isEdit],
  );

  /** 树的loading */
  const [treeLoading, setTreeLoading] = useState<boolean>(false);

  /** 左侧菜单树 */
  const [treeMenus, setTreeMenus] = useState<ProcessBusinessAccountingMenu[]>(
    [],
  );
  /** 展开节点 */
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  /** 当前选中的key */
  const [selectKey, setSelectKey] = useState<Key[]>();

  const [treeDataInfo, setTreeDataInfo] =
    useState<ProcessBusinessAccountingMenu>();

  /** 父级菜单信息 */
  const [parentProcessNodeInfo, setParentProcessNodeInfo] =
    useState<ProcessBusinessAccountingMenu>();

  /** 功能单位名称 */
  const [processAccountName, setProcessAccountName] = useState<string>();

  const [infoId, setInfoId] = useState<string | number>();

  /** 左侧tree拖拽 */
  const [currentWidth, setCurrentWidth] = useState(220);

  const getProcessLibInfo = useCallback(
    async (id: string) => {
      try {
        const {
          data: {
            data: {
              id: numberId,
              name,
              type,
              boundary,
              accountYear,
              productErea,
              processEquipment,
              productScale,
              mainMaterial,
              mainEnergy,
            },
          },
        } = await (isProcess ? getProcess : getAccountProcess)({ id });
        setInfoId(numberId);

        form.setValues({
          name,
          type,
          boundary,
          accountYear,
          productErea,
          processEquipment,
          productScale,
          mainMaterial,
          mainEnergy,
        });

        // 过程核算必填项重新修改
        form.setFieldState('boundary', {
          required: true,
        });

        // 根节点不展示类别
        if (treeDataInfo?.parentId === '0') {
          form.setFieldState('type', {
            visible: false,
          });
        } else {
          form.setFieldState('type', {
            visible: true,
          });
        }

        // eslint-disable-next-line no-empty
      } catch {}
    },
    [treeDataInfo, form],
  );

  /**
   * @description: 菜单初始化
   */
  const menusInitInfo = async (
    rootMenuParentData?: ProcessBusinessAccountingMenu,
  ) => {
    setTreeLoading(true);
    const data = await (isProcess ? getProcessMenu : getProcessBusinessmenu)(
      id,
    );

    setTreeDataInfo(rootMenuParentData || data.data.data);
    setProcessAccountName(data.data.data.name);

    // 如果是从导入页面切换回来
    if (listTreeData) {
      const urlTreeData: UrlListTreeData = JSON.parse(listTreeData);
      const storageTreeMenus = sessionStorage.getItem('processAccountTree');
      const dataMenus: ProcessBusinessAccountingMenu[] = storageTreeMenus
        ? JSON.parse(storageTreeMenus)
        : [];

      const treeInfo = getTreeApiInfo(
        urlTreeData.selectKey[0] as string,
        dataMenus,
      );

      setTreeMenus(dataMenus);
      setSelectKey(
        rootMenuParentData ? [rootMenuParentData.id] : urlTreeData.selectKey,
      );
      setExpandedKeys(urlTreeData.expandedKeys);
      setTreeDataInfo(rootMenuParentData || treeInfo[0]);
    } else {
      const menusData = transformMenuInitInfo(data.data.data, isProcess);
      // 将接口的完整树形信息存储到缓存中，每次都需要完善最新的
      sessionStorage.setItem('processAccountTree', JSON.stringify(menusData));
      const parentKey = menusData[0];

      setTreeMenus(menusData);
      setSelectKey(
        rootMenuParentData ? [rootMenuParentData.id] : [parentKey.key],
      );

      setExpandedKeys(isProcess ? [menusData[0].key] : []);
    }
    setTreeLoading(false);
  };

  /**
   * @description: 需要前往更新最新的父级树形节点
   */
  const updateTreeNode = useCallback(
    async (
      info: ProcessBusinessAccountingMenu,
      rootMenuParentData?: ProcessBusinessAccountingMenu,
    ) => {
      // 临时需求
      if (info.parentId === '0') {
        await menusInitInfo(rootMenuParentData);
        return;
      }

      setTreeLoading(true);
      try {
        const data = await (isProcess
          ? postProcessNextMenu
          : postProcessBusinessNextMenu)(info);
        const menusData = changeParentChildren(
          info.id,
          data.data.data,
          treeMenus,
        );
        // 将接口的完整树形信息存储到缓存中，每次都需要完善最新的
        sessionStorage.setItem('processAccountTree', JSON.stringify(menusData));

        const menusDataClone = cloneDeep(menusData);
        setTreeMenus(menusDataClone);
        setTreeLoading(false);
      } catch (error) {
        setTreeLoading(false);
      }
    },
    [treeMenus],
  );

  const onUpdateClickBack = useCallback(async () => {
    if (treeDataInfo) {
      setTreeLoading(true);

      // 因为过程库的根节点可以编辑
      const getParnet =
        isProcess && treeDataInfo.parentId === '0'
          ? [treeDataInfo]
          : getTreeApiInfo(treeDataInfo.parentId, treeMenus);

      // 过程核算功能单位不需要更新树形
      if (treeDataInfo.parentId !== '0' || isProcess) {
        const parentMenuData = getParnet[0];
        const rootMenuParentData =
          parentMenuData.parentId === '0' ? treeDataInfo : undefined;
        /** 更新左侧树形菜单 */
        await updateTreeNode(getParnet[0], rootMenuParentData);
        setTreeLoading(false);
      } else {
        setTreeLoading(false);
      }
    }
  }, [treeDataInfo]);

  /**
   * @description: 过程描述保存
   */
  const editProcessLib = async () => {
    if (infoId) {
      try {
        const processLibData = await form.submit<ProcessLibData>();
        const resp = await (isProcess
          ? postProcessEdit
          : postProcessAccountEdit)({
          ...processLibData,
          id: infoId,
        });
        Toast('success', resp.data.msg);
        treeDataInfo && getProcessLibInfo(treeDataInfo.id);
        form.setFieldState(
          FormPath.parse(
            '*(type,name,boundary, accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
          ),
          {
            disabled: true,
          },
        );
        onUpdateClickBack();
        setShowProcessInfo(false);
        // eslint-disable-next-line no-empty
      } catch {}
    }
  };

  /**
   * 递归处理菜单展开的子级
   * @param keys 被展开的树形key
   * @param info 被收起的key
   * @returns 过滤被收起的所有子级
   */
  const recursionExpandedKeysChilds = (
    keys: Key[],
    info: ProcessBusinessAccountingMenu,
  ) => {
    let letKeys: Key[] = keys;
    if (info.children) {
      info.children.forEach(infoChild => {
        if (keys.includes(infoChild.id)) {
          letKeys = letKeys.filter(menuKey => menuKey !== infoChild.id);
        }

        if (infoChild.children && infoChild.children.length > 0) {
          letKeys = recursionExpandedKeysChilds(letKeys, infoChild);
        }
      });
    }

    return letKeys;
  };

  /**
   * @description: 选中菜单
   */
  const selectTreeNode = useCallback(
    (node: ProcessBusinessAccountingMenu) => {
      const treeInfo = getTreeApiInfo(node.id, treeMenus);
      setSelectKey([node.id]);

      if (node.parentId !== '0') {
        const parentTreeInfo = getTreeApiInfo(node.parentId, treeMenus);

        if (parentTreeInfo) {
          setParentProcessNodeInfo(parentTreeInfo[0]);
        }
      } else {
        setParentProcessNodeInfo(undefined);
      }

      setTreeDataInfo(treeInfo[0]);
    },
    [treeMenus],
  );

  useEffect(() => {
    menusInitInfo();
  }, [scope]);

  useEffect(() => {
    if (treeDataInfo && treeDataInfo.matchType === 1) {
      getProcessLibInfo(treeDataInfo.id);
    }

    form.setFieldState(
      FormPath.parse(
        '*(type,boundary, name, accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
      ),
      {
        disabled: true,
        required: false,
      },
    );
    setShowProcessInfo(false);
  }, [treeDataInfo]);

  const titleRender = useCallback(
    (nodeData: ProcessBusinessAccountingMenu) => (
      <TextOverflowTable
        maxWidth={currentWidth - 100}
        value={nodeData.name}
        maxLength={Math.round(currentWidth / 20)}
      />
    ),
    [currentWidth],
  );

  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain} ${processManagement.businessAccountManagementMain}`}
    >
      <div
        className={classNames(
          styleCarbonFootprint3.main,
          businessAccount.businessAccountMain,
        )}
        // style={{ height: `calc(100% - 50px)` }}
      >
        <div
          className={processManagement.businessAccountExpandAdd}
          style={{ marginBottom: 0 }}
        >
          <div
            className={classNames('left-box', processManagement.treeUtilMain)}
          >
            <CustResizable
              // eslint-disable-next-line react/no-unstable-nested-components
              childRender={() => (
                <Spin spinning={treeLoading}>
                  <div className={processManagement.businessAccountTreeMain}>
                    <Tree<ProcessBusinessAccountingMenu>
                      selectedKeys={selectKey}
                      treeData={treeMenus}
                      expandedKeys={expandedKeys}
                      onExpand={async (keys, info) => {
                        const { expanded } = info;

                        // 收起
                        if (expanded === false) {
                          const expandRSKey = recursionExpandedKeysChilds(
                            keys,
                            info.node,
                          );
                          setExpandedKeys(expandRSKey);
                          return;
                        }

                        // 展开
                        setExpandedKeys(keys);
                        if (keys.length > 0) {
                          await updateTreeNode(info.node);
                        }
                      }}
                      onSelect={(keys, info) => {
                        if (!keys || keys.length === 0) return;
                        selectTreeNode(info.selectedNodes[0]);
                      }}
                      fieldNames={{
                        title: 'name',
                        key: 'id',
                      }}
                      titleRender={titleRender}
                    />
                  </div>
                </Spin>
              )}
              resizableCurrentSize={({ width }) => {
                setCurrentWidth(width);
              }}
            />
          </div>
        </div>
        <div
          className={businessAccount.businessAccountRight}
          style={{
            width: `calc(100% - ${currentWidth}px)`,
            padding: ' 12px 0 0 0 ',
          }}
        >
          {treeDataInfo && treeDataInfo.matchType === 0 ? (
            <ProcessAccountSelectFactor
              isOnlyDetail={isOnlyDetail}
              key={treeDataInfo.dataId}
              isProcess={isProcess}
              processAccountId={id}
              isEdit={false}
              treeNode={treeDataInfo}
              currentWidth={currentWidth}
              onUpdateClick={onUpdateClickBack}
            />
          ) : (
            <div className={processManagement.tabMain} style={{ marginTop: 0 }}>
              <div className={processManagement.tabMainContent}>
                <ProcessLibBasicForm
                  isProcessBusinessAccount
                  isProcess
                  form={form}
                  isEdit={showProcessInfo}
                  processTreeInfo={treeDataInfo}
                  operateNode={
                    <div>
                      {showProcessInfo ? (
                        <>
                          <Button
                            onClick={async () => {
                              setShowProcessInfo(false);
                              form.setFormState({
                                readPretty: true,
                              });
                              form.setFieldState(
                                FormPath.parse(
                                  '*(type,name,boundary, accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
                                ),
                                {
                                  disabled: true,
                                },
                              );
                              if (
                                treeDataInfo &&
                                treeDataInfo.matchType === 1
                              ) {
                                getProcessLibInfo(treeDataInfo.id);
                              }
                            }}
                          >
                            {I18N.carbonFootprint.cancel}
                          </Button>
                          <Button
                            type='primary'
                            className='m-l-10'
                            onClick={editProcessLib}
                          >
                            {I18N.carbonFootprint.preserve}
                          </Button>
                        </>
                      ) : (
                        !isOnlyDetail && (
                          <Button
                            type='primary'
                            onClick={async () => {
                              setShowProcessInfo(true);
                              form.setFormState({
                                readPretty: false,
                              });

                              if (
                                treeDataInfo?.parentId === '0' &&
                                !isProcess
                              ) {
                                form.setFieldState('name', {
                                  disabled: true,
                                });
                              } else {
                                form.setFieldState('name', {
                                  disabled: false,
                                });
                              }
                              form.setFieldState(
                                FormPath.parse(
                                  '*(type,boundary,accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
                                ),
                                {
                                  disabled: false,
                                },
                              );
                              form.setFieldState(
                                FormPath.parse(
                                  '*(type,boundary, name,accountYear)',
                                ),
                                {
                                  required: true,
                                },
                              );
                            }}
                          >
                            {I18N.carbonFootprint.edit}
                          </Button>
                        )
                      )}
                    </div>
                  }
                />
                {treeDataInfo && (
                  <ProcessAccountInOutTab
                    isOnlyDetail={isOnlyDetail}
                    isEdit={isEdit}
                    id={processLibId}
                    isProcess={isProcess}
                    name={processAccountName || ''}
                    processTreeInfo={treeDataInfo}
                    parentProcessNodeInfo={parentProcessNodeInfo}
                    updateTreeNode={updateTreeNode}
                    expandedKeys={expandedKeys}
                    selectKey={selectKey}
                    showFactorEvaluationCard={showFactorEvaluationCard}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProcessBusinessAccountingManagement);
