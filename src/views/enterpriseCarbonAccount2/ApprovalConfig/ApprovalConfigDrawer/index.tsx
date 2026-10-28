import { InfoCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Table, TableColumnType, Select, Tooltip, Modal } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

import { apiRoleList } from '@/views/dashborad/role/service';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import styles from './index.module.less';
import { getEmployList, Employ } from './service';
import { getApprovalConfigDetail } from '../service';
import type { ApprovalFlowNode } from '../service';

export type ApprovalNodeType = 'submit' | 'approval' | 'end';
export type ApprovalType = 'person' | 'role' | 'dataApprovalManager';
export type EmptyAction = 'autoPass' | 'assignPerson' | 'none';

export interface ApprovalNode {
  id: string;
  nodeType: ApprovalNodeType;
  nodeName: string;
  approvalType: ApprovalType | undefined;
  approver: string | number | null;
  approverName?: string;
  emptyAction: EmptyAction | undefined;
  assignPerson: string | number | null;
  assignPersonName?: string;
  // 审批级别 1-5
  level?: number;
}

type ApprovalConfigDrawerProps = {
  open: boolean;
  id?: number;
  mode?: 'view' | 'edit'; // 'view': 查看模式, 'edit': 编辑模式
  onClose: () => void;
  onConfirm: (flowId: number, nodes: ApprovalNode[]) => void | Promise<void>;
};

const ApprovalConfigDrawer: FC<ApprovalConfigDrawerProps> = ({
  open,
  id,
  mode = 'edit',
  onClose,
  onConfirm,
}) => {
  const isViewMode = mode === 'view';
  const [nodes, setNodes] = useState<ApprovalNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [flowId, setFlowId] = useState<number | undefined>(undefined);
  const [employeeList, setEmployeeList] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [roleList, setRoleList] = useState<
    Array<{ value: number; label: string }>
  >([]);

  /** 表单项校验错误，用于红框与文案展示 */
  const [fieldErrors, setFieldErrors] = useState<
    Record<
      string,
      { approvalType?: string; approver?: string; assignPerson?: string }
    >
  >({});

  // 初始化默认节点
  const initNodes = (): ApprovalNode[] => [
    {
      id: 'submit',
      nodeType: 'submit',
      nodeName: I18N.enterpriseCarbonAccount2.submissionNode,
      approvalType: 'person',
      approver: null,
      emptyAction: 'none',
      assignPerson: null,
    },
    {
      id: 'end',
      nodeType: 'end',
      nodeName: I18N.enterpriseCarbonAccount2.endNode,
      approvalType: 'person',
      approver: null,
      emptyAction: 'none',
      assignPerson: null,
    },
  ];

  // 获取员工列表
  const fetchEmployeeList = async () => {
    try {
      const { data } = await getEmployList({ searchName: '' });
      setEmployeeList(
        (data.data || []).map((item: Employ) => ({
          value: item.userId || 0,
          label: item.employName || item.employEmail || '',
        })),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.enterpriseCarbonAccount2.getEmployeeColumn, error);
    }
  };

  // 获取角色列表
  const fetchRoleList = async () => {
    try {
      const { data } = await apiRoleList({ size: 1000, page: 1 });
      setRoleList(
        (data.data?.rows || []).map(
          (item: { roleId: number; roleName: string }) => ({
            value: item.roleId,
            label: item.roleName,
          }),
        ),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.enterpriseCarbonAccount2.getRoleColumn, error);
    }
  };

  // 将接口数据转换为组件内部格式
  const convertNodeFromApi = (
    apiNode: ApprovalFlowNode,
    level: number,
  ): ApprovalNode => {
    // approveType: 1-人员, 2-角色, 3-数据审批负责人
    let approvalType: ApprovalType = 'person';
    if (apiNode.approveType === 2) approvalType = 'role';
    if (apiNode.approveType === 3) approvalType = 'dataApprovalManager';

    // onEmptyAction: 1-自动通过, 3-指定人员
    let emptyAction: EmptyAction = 'autoPass';
    if (apiNode.onEmptyAction === 3) emptyAction = 'assignPerson';
    if (approvalType === 'person') emptyAction = 'none';

    // 处理审批人
    let approver: string | number | null = null;
    if (approvalType === 'dataApprovalManager') {
      approver = 'dataApprovalManager';
    } else if (apiNode.approveSource) {
      approver = Number(apiNode.approveSource);
    }

    return {
      id: `approval-${apiNode.id}`,
      nodeType: 'approval',
      nodeName: apiNode.nodeName,
      approvalType,
      approver,
      emptyAction,
      assignPerson: apiNode.assignToPerson
        ? Number(apiNode.assignToPerson)
        : null,
      level,
    };
  };

  // 获取审批流详情
  const fetchFlowDetail = async (detailFlowId: number) => {
    try {
      setLoading(true);
      const { data } = await getApprovalConfigDetail({ id: detailFlowId });
      const flowDetail = data.data;

      // 保存 flowId
      setFlowId(flowDetail.id);

      // 转换节点数据
      const approvalNodes = flowDetail.nodeList.map((node, index) =>
        convertNodeFromApi(node, index + 1),
      );

      // 组合完整的节点列表（提交节点 + 审批节点 + 结束节点）
      const allNodes = [
        {
          id: 'submit',
          nodeType: 'submit' as ApprovalNodeType,
          nodeName: I18N.enterpriseCarbonAccount2.submissionNode,
          approvalType: 'person' as ApprovalType,
          approver: null,
          emptyAction: 'none' as EmptyAction,
          assignPerson: null,
        },
        ...approvalNodes,
        {
          id: 'end',
          nodeType: 'end' as ApprovalNodeType,
          nodeName: I18N.enterpriseCarbonAccount2.endNode,
          approvalType: 'person' as ApprovalType,
          approver: null,
          emptyAction: 'none' as EmptyAction,
          assignPerson: null,
        },
      ];

      setNodes(allNodes);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.enterpriseCarbonAccount2.obtainApprovalProcess, error);
      Toast('error', I18N.enterpriseCarbonAccount2.obtainApprovalProcess);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      // 先获取员工和角色列表
      const loadData = async () => {
        await Promise.all([fetchEmployeeList(), fetchRoleList()]);

        // 如果有 id，获取详情；否则初始化默认节点
        if (id) {
          await fetchFlowDetail(id);
        } else {
          setNodes(initNodes());
        }
      };

      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  // 当员工或角色列表更新时，更新节点中的名称显示
  useEffect(() => {
    if (nodes.length > 0 && (employeeList.length > 0 || roleList.length > 0)) {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const updated = { ...node };

          // 更新审批人名称
          if (node.approver && node.approvalType === 'person') {
            const employee = employeeList.find(e => e.value === node.approver);
            updated.approverName = employee?.label;
          } else if (node.approver && node.approvalType === 'role') {
            const role = roleList.find(r => r.value === node.approver);
            updated.approverName = role?.label;
          } else if (node.approvalType === 'dataApprovalManager') {
            updated.approverName =
              I18N.enterpriseCarbonAccount2.dataApprovalNegative;
          }

          // 更新指定人员名称
          if (node.assignPerson) {
            const employee = employeeList.find(
              e => e.value === node.assignPerson,
            );
            updated.assignPersonName = employee?.label;
          }

          return updated;
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeList, roleList]);

  // 计算当前最高审批级别
  const maxApprovalLevel = useMemo(() => {
    const approvalNodes = nodes.filter(node => node.nodeType === 'approval');
    return approvalNodes.length > 0
      ? Math.max(...approvalNodes.map(node => node.level || 0))
      : 0;
  }, [nodes]);

  // 是否可以新增节点（全局限制：最多5级）
  const canAddNode = maxApprovalLevel < 5;

  // 判断某个节点是否是最高审批层级
  const isMaxLevel = (node: ApprovalNode) => {
    if (node.nodeType !== 'approval') return false;
    return node.level === maxApprovalLevel;
  };

  // 新增审批节点
  const handleAddNode = (afterNodeId: string) => {
    if (!canAddNode) {
      Toast('warn', I18N.enterpriseCarbonAccount2.maximumSupportLevel);
      return;
    }

    const newLevel = maxApprovalLevel + 1;
    const newNode: ApprovalNode = {
      id: `approval-${Date.now()}`,
      nodeType: 'approval',
      nodeName: I18N.template(I18N.enterpriseCarbonAccount2.newLe, {
        val1: newLevel,
      }),
      approvalType: undefined,
      approver: null,
      emptyAction: undefined,
      assignPerson: null,
      level: newLevel,
    };

    const afterIndex = nodes.findIndex(node => node.id === afterNodeId);
    const newNodes = [...nodes];
    newNodes.splice(afterIndex + 1, 0, newNode);

    // 重新计算所有审批节点的级别和名称
    let currentLevel = 0;
    const updatedNodes = newNodes.map(node => {
      if (node.nodeType === 'approval') {
        currentLevel += 1;
        return {
          ...node,
          level: currentLevel,
          nodeName: I18N.template(I18N.enterpriseCarbonAccount2.curre, {
            val1: currentLevel,
          }),
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  // 删除审批节点
  const handleDeleteNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.nodeType !== 'approval') return;

    const approvalNodes = nodes.filter(n => n.nodeType === 'approval');
    const maxLevel = Math.max(...approvalNodes.map(n => n.level || 0));

    if (node.level !== maxLevel) {
      Toast('error', I18N.enterpriseCarbonAccount2.canOnlyBeDeletedWhen);
      return;
    }

    Modal.confirm({
      title: I18N.carbonFootPrintLCA.confirmDeletion,
      content: I18N.template(I18N.enterpriseCarbonAccount2.confirmDeletion2, {
        val1: node.nodeName,
      }),
      onOk: () => {
        const newNodes = nodes.filter(n => n.id !== nodeId);

        // 重新计算所有审批节点的级别和名称
        let currentLevel = 0;
        const updatedNodes = newNodes.map(n => {
          if (n.nodeType === 'approval') {
            currentLevel += 1;
            return {
              ...n,
              level: currentLevel,
              nodeName: I18N.template(I18N.enterpriseCarbonAccount2.curre, {
                val1: currentLevel,
              }),
            };
          }
          return n;
        });

        setNodes(updatedNodes);
      },
    });
  };

  // 更新节点字段时清除该字段的校验错误
  const clearFieldError = (nodeId: string, field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      if (next[nodeId]) {
        next[nodeId] = { ...next[nodeId], [field]: undefined };
        if (Object.values(next[nodeId]).every(v => !v)) delete next[nodeId];
      }
      return next;
    });
  };

  // 更新节点字段
  const updateNode = (
    nodeId: string,
    field: keyof ApprovalNode,
    value: any,
  ) => {
    clearFieldError(nodeId, field);
    setNodes(
      nodes.map(node => {
        if (node.id === nodeId) {
          const updated = { ...node, [field]: value };

          // 当审批类型改变时，重置相关字段
          if (field === 'approvalType') {
            if (value === 'dataApprovalManager') {
              // 选择数据审批负责人时，自动设置审批人
              updated.approver = 'dataApprovalManager';
              updated.approverName =
                I18N.enterpriseCarbonAccount2.dataApprovalNegative;
              updated.emptyAction = 'autoPass';
            } else {
              updated.approver = null;
              updated.approverName = undefined;
              if (value === 'person') {
                updated.emptyAction = 'none';
                updated.assignPerson = null;
                updated.assignPersonName = undefined;
              } else {
                // 角色时，默认设置为自动通过
                updated.emptyAction = 'autoPass';
              }
            }
          }

          // 当审批人为空时改变时
          if (field === 'emptyAction') {
            if (value === 'none' || value === 'autoPass') {
              updated.assignPerson = null;
              updated.assignPersonName = undefined;
            }
          }

          // 更新审批人名称
          if (field === 'approver') {
            if (updated.approvalType === 'person') {
              const employee = employeeList.find(e => e.value === value);
              updated.approverName = employee?.label;
            } else if (updated.approvalType === 'role') {
              const role = roleList.find(r => r.value === value);
              updated.approverName = role?.label;
            } else {
              updated.approverName =
                I18N.enterpriseCarbonAccount2.dataApprovalNegative;
            }
          }

          // 更新指定人员名称
          if (field === 'assignPerson') {
            const employee = employeeList.find(e => e.value === value);
            updated.assignPersonName = employee?.label;
          }

          return updated;
        }
        return node;
      }),
    );
  };

  // 获取审批人选项
  const getApproverOptions = (
    node: ApprovalNode,
  ): Array<{ value: number | string; label: string }> => {
    if (node.approvalType === 'person') {
      return employeeList;
    }
    if (node.approvalType === 'role') {
      return roleList;
    }
    if (node.approvalType === 'dataApprovalManager') {
      return [
        {
          value: 'dataApprovalManager',
          label: I18N.enterpriseCarbonAccount2.dataApprovalNegative,
        },
      ];
    }
    return [];
  };

  // 提交：校验所有审批节点，收集全部错误后一次性展示
  const handleSubmit = async () => {
    const errors: Record<
      string,
      { approvalType?: string; approver?: string; assignPerson?: string }
    > = {};

    nodes.forEach(node => {
      if (node.nodeType === 'submit' || node.nodeType === 'end') return;

      const nodeErrors: {
        approvalType?: string;
        approver?: string;
        assignPerson?: string;
      } = {};

      if (!node.approvalType) {
        nodeErrors.approvalType = I18N.template(
          I18N.enterpriseCarbonAccount2.pleaseSelectIn3,
          { val1: node.nodeName },
        );
      }
      if (!node.approver) {
        nodeErrors.approver = I18N.template(
          I18N.enterpriseCarbonAccount2.pleaseSelectIn2,
          { val1: node.nodeName },
        );
      }
      if (
        node.emptyAction === 'assignPerson' &&
        (node.approvalType === 'role' ||
          node.approvalType === 'dataApprovalManager') &&
        !node.assignPerson
      ) {
        nodeErrors.assignPerson = I18N.template(
          I18N.enterpriseCarbonAccount2.pleaseSelectIn,
          { val1: node.nodeName },
        );
      }

      if (Object.keys(nodeErrors).length > 0) {
        errors[node.id] = nodeErrors;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!flowId) {
      Toast('error', I18N.enterpriseCarbonAccount2.approvalProcessId);
      return;
    }

    setLoading(true);
    try {
      await onConfirm(flowId, nodes);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnType<ApprovalNode>[] = [
    {
      title: (
        <span>
          {I18N.enterpriseCarbonAccount2.approvalNode}
          <Tooltip title={I18N.enterpriseCarbonAccount2.maximumSupportLevel}>
            <InfoCircleOutlined className={styles.infoIcon} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'nodeName',
      width: 150,
      render: (text: string, record: ApprovalNode) => {
        if (record.nodeType === 'submit' || record.nodeType === 'end') {
          return text;
        }
        return text;
      },
    },
    {
      title: (
        <span>
          {I18N.enterpriseCarbonAccount2.approvalType}
          <Tooltip title={I18N.enterpriseCarbonAccount2.roleApprovalByDefault}>
            <InfoCircleOutlined className={styles.infoIcon} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'approvalType',
      width: 150,
      render: (_, record: ApprovalNode) => {
        if (record.nodeType === 'submit' || record.nodeType === 'end') {
          return '/';
        }
        const err = fieldErrors[record.id]?.approvalType;
        return (
          <div>
            <Select
              value={record.approvalType}
              onChange={value => updateNode(record.id, 'approvalType', value)}
              style={{ width: '100%' }}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectApproval2}
              disabled={isViewMode}
              status={err ? 'error' : undefined}
              options={[
                {
                  value: 'person',
                  label: I18N.enterpriseCarbonAccount2.personnel,
                },
                { value: 'role', label: I18N.dashborad.role },
                {
                  value: 'dataApprovalManager',
                  label: I18N.enterpriseCarbonAccount2.dataApprovalNegative,
                },
              ]}
            />
          </div>
        );
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.approver,
      dataIndex: 'approver',
      width: 200,
      render: (_, record: ApprovalNode) => {
        if (record.nodeType === 'submit' || record.nodeType === 'end') {
          return '/';
        }
        const err = fieldErrors[record.id]?.approver;
        return (
          <div>
            <Select
              value={record.approver}
              onChange={value => updateNode(record.id, 'approver', value)}
              style={{ width: '100%' }}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectApproval}
              disabled={
                isViewMode || record.approvalType === 'dataApprovalManager'
              }
              status={err ? 'error' : undefined}
              options={getApproverOptions(record)}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
        );
      },
    },
    {
      title: (
        <span>
          {I18N.enterpriseCarbonAccount2.approverIsEmpty}
          <Tooltip
            title={
              <div>
                <div>
                  {I18N.enterpriseCarbonAccount2.underWhatCircumstances}
                </div>
                <div>{I18N.enterpriseCarbonAccount2.ldHasBeenSetUp2}</div>
                <div>{I18N.enterpriseCarbonAccount2.ldHasBeenSetUp}</div>
              </div>
            }
          >
            <InfoCircleOutlined className={styles.infoIcon} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'emptyAction',
      width: 150,
      render: (_, record: ApprovalNode) => {
        if (record.nodeType === 'submit' || record.nodeType === 'end') {
          return '/';
        }
        if (record.approvalType === 'person') {
          return '/';
        }
        return (
          <Select
            value={record.emptyAction}
            onChange={value => updateNode(record.id, 'emptyAction', value)}
            style={{ width: '100%' }}
            disabled={isViewMode}
            placeholder={I18N.carbonFootprint.pleaseSelect}
            options={[
              {
                value: 'autoPass',
                label: I18N.enterpriseCarbonAccount2.autoPass,
              },
              {
                value: 'assignPerson',
                label: I18N.enterpriseCarbonAccount2.designatedPersonnelReview,
              },
            ]}
          />
        );
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.designatedPersonnel,
      dataIndex: 'assignPerson',
      width: 200,
      render: (_, record: ApprovalNode) => {
        if (record.nodeType === 'submit' || record.nodeType === 'end') {
          return '/';
        }
        if (record.approvalType === 'person') {
          return '/';
        }
        if (record.emptyAction !== 'assignPerson') {
          return '/';
        }
        const err = fieldErrors[record.id]?.assignPerson;
        return (
          <div>
            <Select
              value={record.assignPerson}
              onChange={value => updateNode(record.id, 'assignPerson', value)}
              style={{ width: '100%' }}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseChooseToSpecify}
              disabled={isViewMode}
              status={err ? 'error' : undefined}
              options={employeeList}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
        );
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operation',
      width: 120,
      fixed: 'right',
      render: (_, record: ApprovalNode) => {
        // 查看模式：不显示操作列
        if (isViewMode) {
          return null;
        }

        // 提交节点：没有审批节点时可以新增，有审批节点时禁用
        if (record.nodeType === 'submit') {
          return (
            <div className={styles.operationButtons}>
              <Button
                type='link'
                disabled={maxApprovalLevel > 0 || !canAddNode}
                onClick={() => handleAddNode(record.id)}
                title={
                  maxApprovalLevel > 0
                    ? I18N.enterpriseCarbonAccount2.onlyAtTheHighest
                    : !canAddNode
                    ? I18N.enterpriseCarbonAccount2.maximumSupportLevel
                    : ''
                }
              >
                {I18N.carbonFootprint.newAddition}
              </Button>
            </div>
          );
        }

        // 结束节点：不显示操作
        if (record.nodeType === 'end') {
          return null;
        }

        // 审批节点：只有最高层级可以操作，其他层级显示禁用状态
        const isMax = isMaxLevel(record);

        return (
          <div className={styles.operationButtons}>
            <Button
              type='link'
              disabled={!isMax || !canAddNode}
              onClick={() => handleAddNode(record.id)}
              title={
                !isMax
                  ? I18N.enterpriseCarbonAccount2.onlyAtTheHighest
                  : !canAddNode
                  ? I18N.enterpriseCarbonAccount2.maximumSupportLevel
                  : ''
              }
            >
              {I18N.carbonFootprint.newAddition}
            </Button>
            <Button
              type='link'
              danger
              disabled={!isMax}
              onClick={() => handleDeleteNode(record.id)}
              title={
                !isMax
                  ? I18N.enterpriseCarbonAccount2.onlyTheMostCanBeDeleted
                  : ''
              }
            >
              {I18N.carbonFootprint.delete}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        isViewMode
          ? I18N.enterpriseCarbonAccount2.dataFillingReview2
          : I18N.enterpriseCarbonAccount2.dataFillingReview
      }
      width={1200}
      open={open}
      onCancel={onClose}
      footer={
        isViewMode ? (
          <div className={styles.modalFooter}>
            <Button onClick={onClose}>{I18N.carbonFootprint3.close}</Button>
          </div>
        ) : (
          <div className={styles.modalFooter}>
            <Button onClick={onClose}>{I18N.carbonFootprint.cancel}</Button>
            <Button type='primary' loading={loading} onClick={handleSubmit}>
              {I18N.carbonFootprint.preserve}
            </Button>
          </div>
        )
      }
      destroyOnClose
      centered
    >
      <div className={styles.modalContent}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={nodes}
          pagination={false}
          scroll={{ x: 'max-content' }}
          rowClassName={record =>
            fieldErrors[record.id] ? styles.rowWithError : ''
          }
        />
      </div>
    </Modal>
  );
};

export default ApprovalConfigDrawer;
