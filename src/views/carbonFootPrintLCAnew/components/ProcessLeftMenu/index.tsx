/**
 * @description 过程左侧菜单树
 */

import { InfoCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Spin, Switch, Tooltip, Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import classNames from 'classnames';
import { compact, includes, startsWith, uniq } from 'lodash-es';
import React, { useEffect, useState } from 'react';

import CustResizable from '@/components/Resizable';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';

import style from './index.module.less';
import { IoNode, NodeAllProps, ProcessNode, SideBarNode } from './type';
import { LIST_OUTPUT_TYPE } from '../../CarbonFootprintModel/Info/constant';
import { Process } from '../../CarbonFootprintModel/type';
import { NODE_TYPE, SELECT_BUTTON_TYPE } from '../ProcessManageDrawer/constant';

const { add } = PageTypeInfo;

/** 过程-质量是否配平 */
// const BalanceProcess = ({
//   balanceFlag,
//   processName,
// }: {
//   balanceFlag?: boolean;
//   processName?: string;
// }) => {
//   if (balanceFlag) {
//     return <div className={style.ellipsisText}>{processName}</div>;
//   }
//   return <div className={style.ellipsisText}>{processName}</div>;
//   // return (
//   //   <Tooltip
//   //     title={I18N.carbonFootPrintLCA.qualityNotBalanced}
//   //     placement='topLeft'
//   //   >
//   //     <div className={style.ellipsisText}>
//   //       <span className={classNames('warnRed', style.imbalance)}>
//   //         <InfoCircleOutlined />
//   //       </span>
//   //       {processName}
//   //     </div>
//   //   </Tooltip>
//   // );
// };

/** 过程title */
const ProcessTitle = ({
  errorMsgList,
  processName,
}: {
  errorMsgList?: string[];
  processName?: string;
}) => {
  if (!errorMsgList || !errorMsgList.length) {
    return <div className={style.ellipsisText}>{processName}</div>;
  }
  return (
    <Tooltip
      title={
        <div>
          <div>{I18N.carbonFootPrintLCA.thisProcessExists}</div>
          <ul>
            {errorMsgList?.map((errMsg, index) => (
              <li key={`${processName}err${index + 1}`}>{errMsg}</li>
            ))}
          </ul>
        </div>
      }
      placement='topLeft'
    >
      <div className={style.ellipsisText}>
        <span className={classNames('warnRed', style.imbalance)}>
          <InfoCircleOutlined />
        </span>
        {processName}
      </div>
    </Tooltip>
  );
};

interface ProcessLeftMenuProps {
  /** 过程删除标识 */
  processDeletedFlag: boolean;
  /** 当前菜单展示的宽度 */
  currentWidth?: number;
  /** 当前菜单的选中项 */
  currentSelectedKeys?: React.Key[];
  /** 当前点击的过程列表的上下游数据/上下游关联对应的左侧key */
  processColumnKey?: string;
  /** 菜单树数据 */
  treeData: SideBarNode[];
  /** 全部菜单树数据 */
  allTreeData: SideBarNode[];
  /** 隐藏其他模型过程按钮开关 */
  hiddenOtherModalBtnChecked?: boolean;
  /** 隐藏其他模型过程按钮切换方法 */
  onChangeHiddenOtherModalBtn?: (isChecked: boolean) => void;
  /** 拖拽改变宽度 */
  changeCurrentWidth: (changeWidth: number) => void;
  /** 选中菜单的方法 */
  onSelect: (treeNode: DataNode & SideBarNode) => void;
  /** loading */
  loading?: boolean;
  isDetail?: boolean;
  /** 操作按钮的方法 */
  onActionBtnClick?: (type: string, defaultData?: Process) => void;
}

/** 过程库数据、模型库数据 */
const { PROCESS_DATA, MODEL_REFERENCE } = SELECT_BUTTON_TYPE;

/** 节点类型 */
const { PROCESS_NODE, IO_NODE } = NODE_TYPE;

const ProcessLeftMenu = ({
  currentWidth = 300,
  currentSelectedKeys,
  processColumnKey,
  treeData,
  allTreeData,
  hiddenOtherModalBtnChecked = true,
  onChangeHiddenOtherModalBtn,
  changeCurrentWidth,
  onSelect,
  loading = false,
  processDeletedFlag = false,
  isDetail = false,
  onActionBtnClick,
}: ProcessLeftMenuProps) => {
  /** 菜单数据 */
  const [treeDataBack, setTreeDataBack] = useState<DataNode[]>();
  /** 全部菜单数据 */
  const [allTreeDataBack, setAllTreeDataBack] = useState<DataNode[]>();
  /** 展开指定的树节点 */
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>();

  /** 获取无层级的菜单列表 */
  const onGetList = (data: NodeAllProps[]) => {
    const result: NodeAllProps[] = [];

    const helper = (node: NodeAllProps) => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        node.children.forEach(children => {
          helper(children);
        });
      }
    };

    data.forEach(item => {
      helper(item);
    });

    return result;
  };

  const onHandleParentIds = (
    dataSource: NodeAllProps[],
    newArr: string[],
    id?: string,
  ) => {
    dataSource.forEach(item => {
      let str = `${id}`;
      if (!id) {
        str = `${item.key}`;
      } else {
        str += `-${item.key}`;
      }
      if (item.children && item.children.length) {
        onHandleParentIds(item.children, newArr, str);
      } else {
        newArr.push(str);
      }
    });
    return newArr || [];
  };

  /** 获取制定id的全部父节点 */
  const findParentIds = (tree: NodeAllProps[], targetIds: string) => {
    const arr = onHandleParentIds(tree, []) || [];

    const newArr = arr.map(item => item.split('-'));

    const newFilterArr: string[] = [];
    newArr.forEach(item => {
      if (item.includes(String(targetIds))) {
        for (let index = 0; index < item.length; index++) {
          const child = item[index];
          newFilterArr.push(child);
          if (child === targetIds) {
            break;
          }
        }
      }
    });
    return newFilterArr;
  };

  /** 点击上下游数据，菜单定位到对应的节点 */
  useEffect(() => {
    if (processColumnKey) {
      const list = onGetList(treeDataBack || []);
      const treeNode = list.find(node => node.key === processColumnKey);

      if (!treeNode) {
        const allList = onGetList(allTreeDataBack || []);
        const allTreeNode = allList.find(node => node.key === processColumnKey);

        if (allTreeNode) {
          onSelect({
            ...(allTreeNode as DataNode & SideBarNode),
          });
        }
        return;
      }

      /** 获取点击的节点的父级id的集合 */
      const parentIds = findParentIds(
        treeDataBack as NodeAllProps[],
        processColumnKey,
      )
        ?.map(v => v)
        ?.filter(v => v !== processColumnKey);

      /** 当点击上下游数据时，需要展开它的全部父级 */
      setExpandedKeys(uniq([...(expandedKeys || []), ...parentIds]));

      onSelect({
        ...(treeNode as DataNode & SideBarNode),
      });
    }
  }, [processColumnKey]);

  /** 处理第四层菜单数据-多重引用 */
  const onHandleSubIOChildrenTreeData = (ioList: IoNode[]) => {
    if (ioList && ioList.length) {
      return ioList.map(item => {
        const { ioName, ioCode, forbidEdit } = item || {};
        return {
          ...item,
          title: <div className={style.ellipsisText}>{ioName}</div>,
          key: ioCode,
          nodeType: IO_NODE,
          isProcessPage: includes(
            [PROCESS_DATA, MODEL_REFERENCE],
            item.linkType,
          ),
          disabled: forbidEdit,
        };
      });
    }
    return [];
  };

  /** 处理第三层菜单数据-输入输出 */
  const onHandleSubChildrenTreeData = (ioList: IoNode[]) => {
    if (ioList && ioList.length) {
      return ioList.map(item => {
        const { ioName, ioCode, forbidEdit, outputType } = item || {};
        /** 是多重引用的主输出 */
        const isMultipleRef = outputType === LIST_OUTPUT_TYPE.MULTI_MAIN;
        if (isMultipleRef && item.subIoList && item.subIoList?.length) {
          item.children = onHandleSubIOChildrenTreeData(item.subIoList);
        }
        return {
          ...item,
          title: <div className={style.ellipsisText}>{ioName}</div>,
          key: ioCode,
          nodeType: IO_NODE,
          isProcessPage: includes(
            [PROCESS_DATA, MODEL_REFERENCE],
            item.linkType,
          ),
          disabled: forbidEdit,
          isMultipleRef,
        };
      });
    }
    return [];
  };

  /** 处理第二层菜单数据-过程 */
  const onHandleChildrenTreeData = (processList: ProcessNode[]) => {
    if (processList && processList.length) {
      return processList.map(item => {
        const { processName, processCode, errorMsgList } = item || {};
        if (item.ioList && item.ioList.length) {
          item.children = onHandleSubChildrenTreeData(item.ioList);
        }
        return {
          ...item,
          title: (
            <ProcessTitle
              errorMsgList={errorMsgList}
              processName={processName}
            />
          ),
          key: processCode,
          nodeType: PROCESS_NODE,
          isProcessPage: true,
          linkType: undefined,
        };
      });
    }
    return [];
  };

  /** 菜单数据处理(一共三层) 处理第一层菜单数据-阶段 */
  const getTreeData = (arr: SideBarNode[]) => {
    const treeNodeData = arr.map(node => {
      const { stageName, stageId, processList, errorMsg } = node || {};
      if (processList && processList.length) {
        node.children = onHandleChildrenTreeData(processList);
      }
      return {
        ...node,
        title: (
          <div className={style.processBox}>
            {errorMsg && (
              <Tooltip title={errorMsg} placement='topLeft'>
                <span className={classNames('warnRed', style.imbalance)}>
                  <InfoCircleOutlined />
                </span>
              </Tooltip>
            )}
            <div className={style.ellipsisTextLevelTop}>{stageName}</div>
            {!isDetail && (
              <div
                className={style.processIconBox}
                onClick={e => {
                  e.stopPropagation();
                  onActionBtnClick?.(add, { lifeCycleId: stageId });
                }}
              >
                <PlusCircleOutlined className={style.processIcon} />
              </div>
            )}
          </div>
        ),
        key: `stageId${stageId}`,
        isProcessPage: false,
      };
    });

    return treeNodeData;
  };

  /** 默认 选中第一个过程 展开所有阶段 */
  const handleDefaultSelectedOrExpand = () => {
    /** 所有的节点 */
    const allTreeNode = getTreeData(treeData);

    /** 所有的过程 */
    const allProcess: ProcessNode[][] = [];

    /** 默认展开的节点 */
    const defaultExpandNode = compact(
      allTreeNode?.map(node => {
        if (node?.children && node?.children?.length) {
          allProcess.push(node?.children);
        }
        return node.key;
      }),
    );
    setExpandedKeys(uniq([...(expandedKeys || []), ...defaultExpandNode]));

    /** 默认选中第一个过程 */
    const firstProcessNode = allProcess?.[0]?.[0] as DataNode & SideBarNode;
    onSelect({
      ...firstProcessNode,
    });
  };

  /** 获取菜单栏的数据 */
  useEffect(() => {
    if (treeData && treeData.length) {
      setTreeDataBack(getTreeData(treeData) as unknown as DataNode[]);

      /** 当前菜单已经选中或者过程被删除 就不需要走默认值 */
      if (
        (currentSelectedKeys && currentSelectedKeys.length) ||
        processDeletedFlag
      ) {
        return;
      }

      /** 默认 选中第一个过程 展开所有阶段 */
      handleDefaultSelectedOrExpand();
    }
  }, [treeData, currentSelectedKeys]);

  /** 获取全部菜单数据 */
  useEffect(() => {
    if (allTreeData && allTreeData?.length) {
      setAllTreeDataBack(getTreeData(allTreeData) as unknown as DataNode[]);
    }
  }, [allTreeData]);

  return (
    <div className={style.lifeCycleMenuWrapper}>
      <div className={style.lifeCycleMenuMain}>
        <CustResizable
          defaultPropsWidth={currentWidth}
          // eslint-disable-next-line react/no-unstable-nested-components
          childRender={() => (
            <div className={style.lifeCycleMenuTreeWrapper}>
              {checkAuth(
                '/carbonFootPrintLCAnew/model/hidden',
                <div className={style.hiddenOtherModal}>
                  <span>{I18N.carbonFootPrintLCA.hideOtherModels}</span>
                  <Switch
                    checked={hiddenOtherModalBtnChecked}
                    onChange={isChecked => {
                      onChangeHiddenOtherModalBtn?.(isChecked);
                    }}
                  />
                </div>,
              )}
              <Spin spinning={loading}>
                <Tree
                  treeData={treeDataBack}
                  selectedKeys={currentSelectedKeys}
                  expandedKeys={expandedKeys}
                  onSelect={(
                    selectedKeys,
                    info: {
                      node: NodeAllProps;
                      selectedNodes: DataNode[];
                    },
                  ) => {
                    if (!selectedKeys || selectedKeys.length === 0) return;
                    const isMultipleRef = info?.node?.isMultipleRef;

                    if (
                      startsWith(`${selectedKeys[0]}`, 'stageId') ||
                      isMultipleRef
                    ) {
                      /** 一级菜单和多重引用主输出不能选中 点击时关闭/展开当前菜单*/
                      if (includes(expandedKeys, selectedKeys[0])) {
                        const newExpand =
                          expandedKeys?.filter(
                            expandKey => expandKey !== selectedKeys[0],
                          ) || [];
                        setExpandedKeys(uniq(newExpand));
                      } else {
                        setExpandedKeys(
                          uniq([...(expandedKeys || []), selectedKeys[0]]),
                        );
                      }
                    } else {
                      /** 选中菜单节点 */
                      onSelect(info.selectedNodes[0]);
                    }
                  }}
                  onExpand={expandedKeysValue => {
                    setExpandedKeys(expandedKeysValue);
                  }}
                />
              </Spin>
            </div>
          )}
          resizableCurrentSize={({ width }) => {
            changeCurrentWidth(width);
          }}
        />
      </div>
    </div>
  );
};
export default ProcessLeftMenu;
