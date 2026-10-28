import I18N from '@src/lang/I18N';
import { Button, Table, TableColumnType, Switch, Modal } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';
import { useTableScrollHeight } from '@/hooks/useTableScrollHeight';
import { Toast } from '@/utils';

import ApprovalConfigDrawer from './ApprovalConfigDrawer';
import type { ApprovalNode } from './ApprovalConfigDrawer/index';
import styles from './index.module.less';
import {
  ApprovalFlowItem,
  getApprovalConfigList,
  toggleApprovalConfigStatus,
  saveApprovalFlow,
  SaveApprovalNodeParams,
  getApprovalConfigDetail,
} from './service';

type SearchParams = {
  pageNum: number;
  pageSize: number;
};

const ApprovalConfig = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    pageNum: 1,
    pageSize: 10,
  });

  const [tableData, setTableData] = useState<ApprovalFlowItem[]>([]);

  const [total, setTotal] = useState(0);

  const [tableLoading, setTableLoading] = useState(false);

  const [switchLoading, setSwitchLoading] = useState<Record<number, boolean>>(
    {},
  );

  const [drawerProps, setDrawerProps] = useState<{
    open: boolean;
    id?: number;
    mode?: 'view' | 'edit';
  }>({
    open: false,
  });

  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const tableScrollHeight = useTableScrollHeight({
    containerRef: tableWrapperRef,
    deps: [],
  });

  const getTableData = async (params: SearchParams) => {
    setTableLoading(true);
    try {
      const { data } = await getApprovalConfigList(params);
      setTableData(data.data.list);
      setTotal(data.data.total);
    } finally {
      setTableLoading(false);
    }
  };

  const onStatusChange = async (id: number, currentStatus: number) => {
    // 如果是启用操作（currentStatus 为 0 表示当前是禁用状态，要启用）
    if (currentStatus === 0) {
      // 设置加载状态
      setSwitchLoading(prev => ({ ...prev, [id]: true }));

      try {
        // 先获取审批流详情，检查审批节点数量
        const { data: detail } = await getApprovalConfigDetail({ id });
        const approvalNodesCount = detail.data.nodeList?.length || 0;

        // 清除加载状态
        setSwitchLoading(prev => ({ ...prev, [id]: false }));

        // 如果审批节点数量小于1，提示错误并返回
        if (approvalNodesCount < 1) {
          Modal.error({
            title: I18N.enterpriseCarbonAccount2.unableToActivate,
            content: I18N.enterpriseCarbonAccount2.currentApprovalProcess,
          });
          return;
        }

        // 节点数量满足要求，执行启用操作
        setSwitchLoading(prev => ({ ...prev, [id]: true }));
        await toggleApprovalConfigStatus(id);
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        // 刷新列表以获取最新状态
        await getTableData(searchParams);
      } catch (error) {
        Toast('error', I18N.enterpriseCarbonAccount2.operationFailedPlease);
      } finally {
        setSwitchLoading(prev => ({ ...prev, [id]: false }));
      }
      return;
    }

    // 如果是禁用操作（currentStatus 为 1 表示当前是启用状态，要禁用）
    if (currentStatus === 1) {
      Modal.confirm({
        title: I18N.enterpriseCarbonAccount2.confirmToDisable,
        content: (
          <span>
            {' '}
            <IconAlibabaNew type='icon-Warning' />{' '}
            {I18N.enterpriseCarbonAccount2.alreadyDisabled}
          </span>
        ),
        okText: I18N.enterpriseCarbonAccount2.confirmToDisable,
        cancelText: I18N.carbonFootprint.cancel,
        icon: null,
        centered: true,
        onOk: async () => {
          setSwitchLoading(prev => ({ ...prev, [id]: true }));

          try {
            await toggleApprovalConfigStatus(id);
            Toast('success', I18N.carbonFootprint.operationSuccessful);
            // 刷新列表以获取最新状态
            await getTableData(searchParams);
          } catch (error) {
            Toast('error', I18N.enterpriseCarbonAccount2.operationFailedPlease);
          } finally {
            setSwitchLoading(prev => ({ ...prev, [id]: false }));
          }
        },
      });
    }
  };

  const handleEdit = (record: ApprovalFlowItem) => {
    setDrawerProps({
      open: true,
      id: record.id,
      mode: 'edit',
    });
  };

  const handleView = (record: ApprovalFlowItem) => {
    setDrawerProps({
      open: true,
      id: record.id,
      mode: 'view',
    });
  };

  const handleDrawerConfirm = async (flowId: number, nodes: ApprovalNode[]) => {
    // 过滤出审批节点
    const approvalNodes = nodes.filter(node => node.nodeType === 'approval');

    // 转换为接口所需格式
    const nodeList: SaveApprovalNodeParams[] = approvalNodes.map(
      (node, index) => {
        // approvalType: 'person'→1, 'role'→2, 'dataApprovalManager'→3
        let approveType = '1';
        if (node.approvalType === 'role') approveType = '2';
        if (node.approvalType === 'dataApprovalManager') approveType = '3';

        // emptyAction: 'autoPass'→1, 'assignPerson'→3
        let onEmptyAction = '1';
        if (node.emptyAction === 'assignPerson') onEmptyAction = '3';

        // approver 转换为 approveSource
        let approveSource = '';
        if (node.approver && node.approver !== 'dataApprovalManager') {
          approveSource = String(node.approver);
        }

        // assignPerson 转换为字符串
        const assignToPerson = node.assignPerson
          ? String(node.assignPerson)
          : '';

        return {
          nodeOrder: index + 1,
          nodeName: node.nodeName,
          approveType,
          approveSource,
          onEmptyAction,
          assignToPerson,
        };
      },
    );

    try {
      await saveApprovalFlow({
        flowId: String(flowId),
        nodeList,
      });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      setDrawerProps({ ...drawerProps, open: false });
      // 刷新列表
      getTableData(searchParams);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.enterpriseCarbonAccount2.saveFailed, error);
    }
  };

  const columns: TableColumnType<ApprovalFlowItem>[] = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 68,
      fixed: 'left',
      render: (_, record, index) =>
        (searchParams.pageNum - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: I18N.enterpriseCarbonAccount2.approvalProcessName,
      dataIndex: 'flowName',
      width: 200,
      ellipsis: true,
    },
    // {
    //   title: '审批流标识',
    //   dataIndex: 'flowKey',
    //   width: 200,
    //   ellipsis: true,
    // },
    {
      title: I18N.carbonFootprint.updatedBy,
      dataIndex: 'updateByName',
      width: 250,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 180,
      ellipsis: true,
      render: (updateTime: string) =>
        updateTime ? moment(updateTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: I18N.supplyChain.isItEnabled,
      dataIndex: 'status',
      width: 120,
      render: (status: number, record) => (
        <Switch
          size='small'
          checked={status === 1}
          loading={switchLoading[record.id]}
          onChange={() => onStatusChange(record.id, status)}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.operateColumn}>
          <Button type='link' onClick={() => handleEdit(record)}>
            {I18N.carbonFootprint.edit}
          </Button>
          <Button type='link' onClick={() => handleView(record)}>
            {I18N.carbonFootprint.check}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getTableData(searchParams);
  }, [searchParams]);

  return (
    <div className={styles.approvalConfig}>
      <ApprovalConfigDrawer
        {...drawerProps}
        onClose={() => setDrawerProps({ ...drawerProps, open: false })}
        onConfirm={handleDrawerConfirm}
      />
      <div className={styles.title}>
        {I18N.enterpriseCarbonAccount2.approvalConfiguration}
      </div>

      <div className={styles.tableWrapper} ref={tableWrapperRef}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={tableData}
          loading={tableLoading}
          scroll={{ x: 'max-content', y: tableScrollHeight }}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total,
            onChange: (page, pageSize) =>
              setSearchParams({
                ...searchParams,
                pageNum: page,
                pageSize,
              }),
          }}
        />
      </div>
    </div>
  );
};

export default ApprovalConfig;
