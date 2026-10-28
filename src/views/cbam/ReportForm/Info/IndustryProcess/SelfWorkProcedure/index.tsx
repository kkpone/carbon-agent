/**
 * @description 自厂工序信息表
 */

import { ActionType, DragSortTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { compact } from 'lodash-es';
import { useRef, useState } from 'react';

import { InfoTitle } from '@/components/InfoTitle';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast } from '@/utils';

import { ProcessInfo } from './Info';
import { processColumns } from './columns';
import style from './index.module.less';
import { postOrderProcess } from '../../../service';
import { ProductProcessResp } from '../../../type';
import { ORDER_TYPE } from '../constant';

const { add } = PageTypeInfo;

interface SelfWorkProcedureProps {
  /** cbam报表id */
  cbamId: number;
  /** 是否是详情 */
  isDetail: boolean;
  /** 表格数据 */
  dataSource: ProductProcessResp[];
  /** 更改表格数据 */
  onChangeDataSource: (data: ProductProcessResp[]) => void;
  /** 表格loading */
  loading?: boolean;
  /** 刷新表格 */
  onRefresh?: () => void;
}

const SelfWorkProcedure = ({
  cbamId,
  isDetail,
  dataSource,
  onChangeDataSource,
  loading,
  onRefresh,
}: SelfWorkProcedureProps) => {
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

  /** 初始化抽屉 */
  const onInit = () => {
    setProcessId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
  };

  /** 处理拖拽排序结束 */
  const handleDragSortEnd = async (
    _beforeIndex: number,
    _afterIndex: number,
    newDataSource: ProductProcessResp[],
  ) => {
    if (isDetail) return;

    /** 调接口前先更改数据源 => 视觉优化 */
    onChangeDataSource(newDataSource);

    /** 新的id排序 */
    const ids = compact(newDataSource?.map(item => item.id));

    /* 修改排序 */
    await postOrderProcess({
      type: ORDER_TYPE.PROCESS,
      idList: ids,
    });

    /** 重新加载列表数据 */
    onRefresh?.();
    Toast('success', I18N.cbam.changeSortingTo);
  };

  return (
    <div className={style.emissionWrapper}>
      <InfoTitle
        title={I18N.cbam.selfManufacturedProcessLetter}
        rightRender={
          !isDetail && (
            <Button
              type='primary'
              onClick={() => {
                const total = dataSource?.length || 0;
                /** 工序建立数量上限10个，点击新增时toast提示：“新建失败，自厂工序数量最大为10” */
                if (total >= 10) {
                  Toast('error', I18N.cbam.newCreationFailed);
                  return;
                }
                onActionBtnClick(add);
              }}
            >
              {I18N.cbam.newProcess}
            </Button>
          )
        }
      />

      {/* 自厂工序信息表列表-可拖拽表格 */}
      <DragSortTable<ProductProcessResp>
        loading={loading}
        dataSource={dataSource}
        actionRef={actionRef}
        key={`processTable${cbamId}`}
        columns={processColumns({
          isDetail,
          onActionBtnClick,
          reload: onRefresh,
        })}
        rowKey='id'
        search={false}
        pagination={false}
        toolBarRender={false}
        dragSortKey='id'
        onDragSortEnd={handleDragSortEnd}
      />

      {/* 工序详情抽屉 */}
      <ProcessInfo
        open={open}
        processId={processId}
        cbamId={cbamId}
        actionBtnType={actionBtnType}
        onOk={() => {
          onInit();
          onRefresh?.();
        }}
        onClose={() => onInit()}
      />
    </div>
  );
};

export default SelfWorkProcedure;
