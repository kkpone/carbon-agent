/**
 * @description 外购前体产品数据
 */
import { ActionType, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { InfoTitle } from '@/components/InfoTitle';
import { toNavigate } from '../../../../router';
import { Toast } from '@/utils';

import { PrecursorInfo } from './Info';
import { precursorColumns } from './columns';
import style from './index.module.less';
import {
  getOutsourcedPrecursorListApi,
  postOutsourcedPrecursorSupplyCollection,
} from '../../../service';
import { OutsourcedPrecursorResp } from '../../../type';
import SupplyCollectionModal from '../../components/SupplyCollectionModal';

interface OutsourcedPrecursorProps {
  /** cbam报表id */
  cbamId: number;
  /** 是否是详情 */
  isDetail: boolean;
}

const OutsourcedPrecursor = ({
  cbamId,
  isDetail,
}: OutsourcedPrecursorProps) => {
  const actionRef = useRef<ActionType>();
  const navigate = toNavigate(useHistory());

  /** 控制前体详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 控制供应商收数弹窗 */
  const [supplyCollectionOpen, setSupplyCollectionOpen] = useState(false);

  /** 弹窗确认按钮loading */
  const [collectionModalConfirmLoading, setCollectionModalConfirmLoading] =
    useState(false);

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

  /** 刷新表格 */
  const reload = () => {
    onInit();
    actionRef.current?.reload();
  };

  return (
    <div className={style.emissionWrapper}>
      <InfoTitle title={I18N.cbam.outsourcedPrecursorProducts2} />

      <ProTable
        actionRef={actionRef}
        key={`processProTable${cbamId}`}
        rowKey='id'
        search={false}
        pagination={false}
        toolBarRender={false}
        columns={precursorColumns({
          navigate,
          isDetail,
          onActionBtnClick,
          onSupplyCollection,
        })}
        params={{
          cbamId,
        }}
        request={async params => {
          if (params?.cbamId) {
            return getOutsourcedPrecursorListApi({
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
