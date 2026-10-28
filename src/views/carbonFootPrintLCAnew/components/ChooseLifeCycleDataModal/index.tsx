/**
 * @description 选择过程数据弹窗
 */
import I18N from '@src/lang/I18N';
import { Modal, Button } from 'antd';
import { useState } from 'react';
import { withTable } from 'table-render';

import { TableRender } from '@/components/x-render/TableRender';
import { CustomSearchProps } from '@/components/x-render/TableRender/types';

import { columns } from './columns';
import style from './index.module.less';
import { searchSchema } from './schemas';
import { getLifeCycleDataList } from '../../ProductManagement/Management/LifeCycleData/service';
import {
  LifeCycleDataRequest,
  LifeCycleDataResponse,
} from '../../ProductManagement/Management/LifeCycleData/type';
import { useProductList } from '../../hook';

interface ChooseLifeCycleDataModalProps {
  /** 组织id */
  orgId?: number;
  /** 产品id */
  defaultProductId?: number;
  /** 弹窗显隐 */
  open: boolean;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
  /** 点击确定按钮的方法 */
  handleOk: (data?: {
    selectRows?: LifeCycleDataResponse[];
    selectedRowKeys?: React.Key[];
  }) => void;
}
const ChooseLifeCycleDataModal = ({
  orgId,
  defaultProductId,
  open,
  handleCancel,
  handleOk,
}: ChooseLifeCycleDataModalProps) => {
  /** 产品枚举 */
  const productionOptions = useProductList(orgId) || [];

  /** 表格选中项 */
  const [selectRows, setSelectRows] = useState<LifeCycleDataResponse[]>();

  /** 选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 是否禁用 */
  const disabled = selectedRowKeys.length === 0;

  const productId = defaultProductId ? String(defaultProductId) : undefined;

  /** 选中表格 */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: LifeCycleDataResponse[],
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectRows(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const searchApi: CustomSearchProps<
    LifeCycleDataResponse,
    LifeCycleDataRequest
  > = args =>
    getLifeCycleDataList({ productId: defaultProductId, ...args }).then(
      ({ data }) => data?.data,
    );

  return (
    <Modal
      wrapClassName={`${style.wrapper}`}
      centered
      title={I18N.carbonFootPrintLCA.numberOfSelectionProcesses}
      open={open}
      width='70%'
      maskClosable={false}
      destroyOnClose
      onCancel={() => {
        /** 关闭弹窗取消弹窗表格选中 */
        setSelectedRowKeys([]);
        handleCancel();
      }}
      footer={[
        <Button
          onClick={() => {
            /** 关闭弹窗取消弹窗表格选中 */
            setSelectedRowKeys([]);
            handleCancel();
          }}
        >
          {I18N.Factors.cancel}
        </Button>,
        <Button
          disabled={disabled}
          onClick={async () => {
            handleOk({ selectRows, selectedRowKeys });
            /** 关闭弹窗取消弹窗表格选中 */
            setSelectedRowKeys([]);
          }}
          type='primary'
        >
          {I18N.carbonFootPrintLCA.confirm}
        </Button>,
      ]}
    >
      <div className={style.tableModalWrapper}>
        <TableRender<LifeCycleDataResponse, LifeCycleDataRequest>
          searchProps={{
            schema: searchSchema(productionOptions, productId),
            api: searchApi,
            searchOnMount: false,
          }}
          tableProps={{
            columns: columns(),
            rowSelection: {
              type: 'radio',
              columnWidth: 48,
              ...rowSelection,
            },
            scroll: { y: 500 },
          }}
          autoFixNoText
        />
      </div>
    </Modal>
  );
};
export default withTable(ChooseLifeCycleDataModal);
