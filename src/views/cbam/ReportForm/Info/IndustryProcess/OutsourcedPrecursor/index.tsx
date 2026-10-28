/**
 * @description 外购前体信息表
 */
import { ActionType, DragSortTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { compact } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { InfoTitle } from '@/components/InfoTitle';
import { toNavigate } from '../../../../router';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast } from '@/utils';

import { PrecursorInfo } from './Info';
import { precursorColumns } from './columns';
import style from './index.module.less';
import {
  getOutsourcedPrecursorListApi,
  postOrderProcess,
  postOutsourcedPrecursorSupplyCollection,
} from '../../../service';
import { OutsourcedPrecursorResp } from '../../../type';
import SupplyCollectionModal from '../../components/SupplyCollectionModal';
import { ORDER_TYPE } from '../constant';

const { add } = PageTypeInfo;

interface OutsourcedPrecursorProps {
  /** cbam报表id */
  cbamId: number;
  /** 是否是详情 */
  isDetail: boolean;
  /** 刷新流程图方法 */
  onRefreshFlowDiagram?: () => void;
}

const OutsourcedPrecursor = ({
  cbamId,
  isDetail,
  onRefreshFlowDiagram,
}: OutsourcedPrecursorProps) => {
  const actionRef = useRef<ActionType>();
  const navigate = toNavigate(useHistory());

  /** 控制前体详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 控制供应商收数弹窗 */
  const [supplyCollectionOpen, setSupplyCollectionOpen] = useState(false);

  /** 数据授权弹窗确认按钮loading */
  const [collectionModalConfirmLoading, setCollectionModalConfirmLoading] =
    useState(false);

  /** 前体表格loading */
  const [loadingPrecursor, setLoadingPrecursor] = useState(false);

  /** 前体表格数据 */
  const [dataSourcePrecursor, setDataSourcePrecursor] = useState<
    OutsourcedPrecursorResp[]
  >([]);

  /** 当前行的信息 */
  const [rowPrecursorInfo, setRowPrecursorInfo] =
    useState<OutsourcedPrecursorResp>({});

  /** 前体ID(过程) */
  const [precursorId, setProcessId] = useState<number>();

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 前体ID */
    setProcessId(id);
    /* 打开详情抽屉 */
    setOpen(true);
  };

  /** 供应商收数 */
  const onSupplyCollection = (row: OutsourcedPrecursorResp) => {
    /** 当前行信息 */
    setRowPrecursorInfo(row);
    /** 前体ID */
    setProcessId(row?.id);

    setSupplyCollectionOpen(true);
  };

  /** 初始化抽屉 */
  const onInit = () => {
    setProcessId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
    setSupplyCollectionOpen(false);
  };

  /** 获取前体信息 */
  const getDataSourceProcess = async () => {
    setLoadingPrecursor(true);
    try {
      const { data } = await getOutsourcedPrecursorListApi({
        cbamId,
      });
      setDataSourcePrecursor(data?.data || []);
      setLoadingPrecursor(false);
    } catch (error) {
      setDataSourcePrecursor([]);
      setLoadingPrecursor(false);
    }
  };

  /** 刷新表格 */
  const reload = () => {
    onInit();
    /** 获取工序信息 */
    if (cbamId) {
      getDataSourceProcess();
      /** 刷新流程图 */
      onRefreshFlowDiagram?.();
    }
  };

  /** 处理拖拽排序结束 */
  const handleDragSortEnd = async (
    _beforeIndex: number,
    _afterIndex: number,
    newDataSource: OutsourcedPrecursorResp[],
  ) => {
    if (isDetail) return;

    /** 调接口前先更改数据源 => 视觉优化 */
    setDataSourcePrecursor(newDataSource);

    const ids = compact(newDataSource?.map(item => item.id));
    /* 修改排序 */
    await postOrderProcess({
      type: ORDER_TYPE.PROCEDURE,
      idList: ids,
    });
    /** 重新加载列表数据 */
    reload();
    Toast('success', I18N.cbam.changeSortingTo);
  };

  useEffect(() => {
    /** 获取工序信息 */
    if (cbamId) {
      getDataSourceProcess();
    }
  }, [cbamId]);

  return (
    <div className={style.emissionWrapper}>
      <InfoTitle
        title={I18N.cbam.purchasePrecursorLetterFromExternalSources}
        rightRender={
          !isDetail && (
            <Button
              type='primary'
              onClick={() => {
                const total = dataSourcePrecursor?.length || 0;
                /** 前体建立数量上限20个，点击新增时toast提示：“新建失败，外购前体数量最大为20” */
                if (total >= 20) {
                  Toast('error', I18N.cbam.newCreationFailed2);
                  return;
                }

                onActionBtnClick(add);
              }}
            >
              {I18N.cbam.addPrecursor}
            </Button>
          )
        }
      />

      {/* 外购前体信息表列表-可拖拽表格 */}
      <DragSortTable<OutsourcedPrecursorResp>
        loading={loadingPrecursor}
        dataSource={dataSourcePrecursor}
        actionRef={actionRef}
        key={`precursorTable${cbamId}`}
        columns={precursorColumns({
          navigate,
          isDetail,
          onActionBtnClick,
          onSupplyCollection,
          reload,
        })}
        rowKey='id'
        search={false}
        pagination={false}
        toolBarRender={false}
        dragSortKey='id'
        onDragSortEnd={handleDragSortEnd}
      />

      {/* 前体详情抽屉 */}
      <PrecursorInfo
        open={open}
        precursorId={precursorId}
        cbamId={cbamId}
        actionBtnType={actionBtnType}
        onOk={() => {
          reload();
        }}
        onClose={() => onInit()}
      />

      {/* 供应商收数弹窗 */}
      <SupplyCollectionModal
        precursorInfo={rowPrecursorInfo}
        open={supplyCollectionOpen}
        handleCancel={() => onInit()}
        handleOk={async values => {
          if (precursorId) {
            setCollectionModalConfirmLoading(true);
            try {
              await postOutsourcedPrecursorSupplyCollection({
                ...values,
                productPrecursorId: precursorId,
              });
              Toast('success', I18N.cbam.publishedSuccessfully);
              setSupplyCollectionOpen(false);
              reload();
            } finally {
              setSupplyCollectionOpen(false);
              setCollectionModalConfirmLoading(false);
            }
          }
        }}
        confirmLoading={collectionModalConfirmLoading}
      />
    </div>
  );
};

export default OutsourcedPrecursor;
