import { ActionType, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button, Modal, Popover } from 'antd';
import { keyBy } from 'lodash-es';
import { ReactNode, useMemo, useRef } from 'react';

import { columns } from './columns';
import style from './index.module.less';
import { getPrecursorAuditUserList } from '../service';
import { AuditUserListResq } from '../type';

/** 待审核人的列表 */
export const ApproverList = ({ auditDataId }: { auditDataId?: number }) => {
  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  return (
    <ProTable<AuditUserListResq>
      columns={columns()}
      actionRef={tableRef}
      pagination={{
        pageSize: 10,
        showTotal: undefined,
      }}
      search={false}
      columnsState={{
        persistenceKey: 'ApproverListTable',
        persistenceType: 'localStorage',
        defaultValue: columnsStateDefault,
      }}
      params={{
        auditDataId,
      }}
      toolBarRender={false}
      request={async params => {
        const { current = 1, pageSize = 10 } = params || {};
        if (params?.auditDataId) {
          return getPrecursorAuditUserList({
            auditDataId: params?.auditDataId,
            pageNum: current,
            pageSize,
          }).then(({ data }) => ({
            data: data?.data?.list || [],
            success: true,
            total: data?.data?.total || 0,
          }));
        }
        return { data: [], success: true };
      }}
    />
  );
};

/** 待审核人的弹窗 */
export const ApproverModal = ({
  open,
  handleCancel,
}: {
  /** 弹窗的显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  handleCancel: () => void;
}) => (
  <Modal
    centered
    title={I18N.eca.pendingReviewer}
    open={open}
    maskClosable={false}
    onCancel={handleCancel}
    footer={[
      <Button
        onClick={() => {
          handleCancel();
        }}
      >
        {I18N.carbonFootPrintLCA.close}
      </Button>,
    ]}
  >
    <ApproverList />
  </Modal>
);

/** 待审核人的气泡卡片 */
export const ApproverPopover = ({
  auditDataId,
  children,
}: {
  /** 审核数据的id */
  auditDataId?: number;
  children: ReactNode;
}) => (
  <Popover
    placement='left'
    title={I18N.eca.pendingReviewer}
    content={
      <div className={style.approverPopover}>
        <ApproverList auditDataId={auditDataId} />
      </div>
    }
    trigger='click'
  >
    {children && <p className={style.childrenContent}>{children}</p>}
  </Popover>
);
