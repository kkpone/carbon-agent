/**
 * @description 自厂工序产品数据
 */

import { ActionType, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { useRef, useState } from 'react';

import { InfoTitle } from '@/components/InfoTitle';

import { ProcessInfo } from './Info';
import { processColumns } from './columns';
import style from './index.module.less';
import { getProductProcessListApi } from '../../../service';
import { ProductProcessResp } from '../../../type';

interface SelfWorkProcedureProps {
  /** cbam报表id */
  cbamId: number;
  /** 是否是详情 */
  isDetail: boolean;
}

const SelfWorkProcedure = ({ cbamId, isDetail }: SelfWorkProcedureProps) => {
  const actionRef = useRef<ActionType>();

  /** 控制工序详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 工序ID(过程) */
  const [processId, setProcessId] = useState<number>();

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 工序ID */
    setProcessId(id);
    /* 打开详情抽屉 */
    setOpen(true);
  };

  /** 刷新表格 */
  const reload = () => {
    actionRef.current?.reload();
  };

  /** 初始化抽屉 */
  const onInit = () => {
    setProcessId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
  };

  return (
    <div className={style.emissionWrapper}>
      <InfoTitle title={I18N.cbam.selfProducedProcessProduction2} />

      <ProTable<ProductProcessResp>
        actionRef={actionRef}
        key={`processProTable${cbamId}`}
        rowKey='id'
        search={false}
        pagination={false}
        toolBarRender={false}
        columns={processColumns({ isDetail, onActionBtnClick })}
        params={{
          cbamId,
        }}
        request={async params => {
          if (params?.cbamId) {
            return getProductProcessListApi({
              cbamId: params?.cbamId,
            }).then(({ data }) => ({
              data: data?.data || [],
              success: true,
              total: data?.data?.length || 0,
            }));
          }
          return { data: [], success: true };
        }}
      />

      {/* 工序详情抽屉 */}
      <ProcessInfo
        open={open}
        processId={processId}
        cbamId={cbamId}
        actionBtnType={actionBtnType}
        onOk={() => {
          onInit();
          reload();
        }}
        onClose={() => onInit()}
      />
    </div>
  );
};

export default SelfWorkProcedure;
