/* eslint-disable @typescript-eslint/no-unused-vars */
import I18N from '@src/lang/I18N';
import CustResizable from '@src/components/Resizable';
import { Spin, Tooltip, Tree } from 'antd';
import classNames from 'classnames';
import { throttle } from 'lodash-es';
import { VFC, useEffect, useMemo, useState } from 'react';

import ProcessAccountingNodeInfo from './ProcessAccountingNodeInfo';
import styles from './index.module.less';
import {
  getProcessAccounting,
  getProcessAccountingInfo,
  getProcessAccountingNext,
} from './service';
import { ProcessAccountInfo, ProcessAccounting } from './type';
import TextOverflowTable from './TextOverflowTable';

type ProcessAccountingInfoProps = {
  id: string;
  flag?: boolean;
};

const ProcessAccountingInfo: VFC<ProcessAccountingInfoProps> = ({
  id,
  flag,
}) => {
  const [treeLoading, setTreeLoading] = useState(false);

  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);

  const [processAccountInfo, setProcessAccountInfo] =
    useState<ProcessAccountInfo | null>(null);

  const [processAccountingTreeData, setProcessAccountingTreeData] = useState<
    ProcessAccounting[]
  >([]);

  const [selectedProcessAccountingNode, setSelectedProcessAccountingNode] =
    useState<ProcessAccounting | null>(null);

  const [parentProcessAccountingNode, setParentProcessAccountingNode] =
    useState<ProcessAccounting | null>(null);

  const [treeContentWidth, setTreeContentWidth] = useState(220);

  const throttleSetWidth = useMemo(() => throttle(setTreeContentWidth, 50), []);

  const transferTreeData: (
    originData: Omit<ProcessAccounting, 'key'>[],
  ) => ProcessAccounting[] = originData =>
    originData.map(({ children, ...rest }) => ({
      ...rest,
      key: rest.id,
      children:
        children instanceof Array ? transferTreeData(children) : children,
    }));

  const findTreeNode: (
    tree: ProcessAccounting[],
    id: string,
  ) => ProcessAccounting | null = (tree, nodeId) => {
    let childrenNodeList: ProcessAccounting[] = [];
    for (let i = 0; i < tree.length; i += 1) {
      if (tree[i].id === nodeId) {
        return tree[i];
      }
      childrenNodeList = [...childrenNodeList, ...(tree[i].children || [])];
    }
    return childrenNodeList.length > 0
      ? findTreeNode(childrenNodeList, nodeId)
      : null;
  };

  const onTreeNodeExpand = async (
    keys: (number | string)[],
    options: { node: ProcessAccounting; expanded: boolean },
  ) => {
    const { node, expanded } = options;
    if (expanded) {
      try {
        setTreeLoading(true);
        const resp = await getProcessAccountingNext({
          id: node.id,
          matchType: node.matchType,
          flag,
        });

        const nodeInProcessAccountingTree = findTreeNode(
          processAccountingTreeData,
          node.id,
        );

        if (nodeInProcessAccountingTree) {
          nodeInProcessAccountingTree.children = transferTreeData(
            resp.data.data || [],
          );
        }
        setExpandedKeys(keys);
        setProcessAccountingTreeData([...processAccountingTreeData]);
        setTreeLoading(false);
      } catch (e) {
        setTreeLoading(false);
        throw e;
      }
    } else {
      let childrenNodeList = [...(node.children || [])];
      const childrenNodeKeys: (number | string)[] = [];

      while (childrenNodeList.length) {
        const childNode = childrenNodeList.pop();
        if (childNode) {
          childrenNodeKeys.push(childNode.key);
          childrenNodeList = [
            ...childrenNodeList,
            ...(childNode.children || []),
          ];
        }
      }

      setExpandedKeys(keys.filter(key => !childrenNodeKeys.includes(key)));
    }
  };

  useEffect(() => {
    setTreeLoading(true);

    getProcessAccounting({ id, flag })
      .then(({ data }) => {
        const treeData = transferTreeData([data.data]);
        setProcessAccountingTreeData(treeData);
        setExpandedKeys(treeData.map(({ key }) => key));
        setSelectedProcessAccountingNode(treeData[0]);
      })
      .finally(() => setTreeLoading(false));

    getProcessAccountingInfo({ id, flag }).then(({ data }) =>
      setProcessAccountInfo(data.data),
    );
  }, [id, flag]);

  const treeTitleRender = ({ name }: { name: string }) =>
    name.length > Math.round(treeContentWidth / 20) ? (
      <Tooltip title={name}>
        <div
          className={styles.treeTitle}
          style={{ width: treeContentWidth - 100 }}
        >
          {name}
        </div>
      </Tooltip>
    ) : (
      <div>{name}</div>
    );

  const treeRender = () => (
    <Spin spinning={treeLoading}>
      <div className={styles.treeContent}>
        <Tree<ProcessAccounting>
          treeData={processAccountingTreeData}
          selectedKeys={
            selectedProcessAccountingNode
              ? [selectedProcessAccountingNode.key]
              : undefined
          }
          expandedKeys={expandedKeys}
          fieldNames={{
            title: 'name',
            key: 'id',
          }}
          titleRender={treeTitleRender}
          onExpand={onTreeNodeExpand}
          onSelect={(_, { node }) => {
            const parentNode = findTreeNode(
              processAccountingTreeData,
              node.parentId,
            );
            setSelectedProcessAccountingNode(node);
            setParentProcessAccountingNode(parentNode);
          }}
        />
      </div>
    </Spin>
  );

  return (
    <div className={styles.processAccountingInfo}>
      <div className={styles.processAccountingInfoHeader}>
        <span className={styles.infoLabel}>{I18N.carbonFootprint3.functionalUnits2}</span>

        <div className={styles.accountName}>
          <TextOverflowTable
            value={processAccountInfo?.accountName || '-'}
            maxLength={15}
          />
        </div>
        <span className={classNames('m-l-30', styles.infoLabel)}>
          {I18N.carbonFootprint.accountingCycle2}</span>
        <span>
          {processAccountInfo?.startTime || '-'}{I18N.carbonFootprint.to}{processAccountInfo?.endTime || '-'}
        </span>
      </div>
      <div className={styles.processAccountingInfoContent}>
        <CustResizable
          childRender={treeRender}
          resizableCurrentSize={({ width }) => throttleSetWidth(width)}
        />
        <div style={{ width: `calc(100% - ${treeContentWidth}px)` }}>
          {selectedProcessAccountingNode && (
            <ProcessAccountingNodeInfo
              processAccountingNode={selectedProcessAccountingNode}
              parentProcessAccountingNode={parentProcessAccountingNode}
              flag={flag}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessAccountingInfo;
