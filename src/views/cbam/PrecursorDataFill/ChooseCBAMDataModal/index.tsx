/**
 * @description 选择CBAM数据弹窗
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
import { getChooseSupplyCbamList } from './service';
import { CbamProductInfo, ChooseCbamRequest } from './type';

interface ChooseCBAMDataModalProps {
  /** 弹窗显隐 */
  open: boolean;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
  /** 点击确定按钮的方法 */
  handleOk: (data?: {
    selectRows?: CbamProductInfo[];
    selectedRowKeys?: React.Key[];
  }) => void;
}

const ChooseCBAMDataModal = ({
  open,
  handleCancel,
  handleOk,
}: ChooseCBAMDataModalProps) => {
  /** 表格选中项 */
  const [selectRows, setSelectRows] = useState<CbamProductInfo[]>();

  /** 选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 是否禁用 */
  const disabled = selectedRowKeys.length === 0;

  /** 选中表格 */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: CbamProductInfo[],
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
    CbamProductInfo,
    ChooseCbamRequest
  > = args => getChooseSupplyCbamList(args).then(({ data }) => data?.data);

  return (
    <Modal
      wrapClassName={`${style.wrapper}`}
      centered
      title={I18N.cbam.chooseCba}
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
        <TableRender<CbamProductInfo, ChooseCbamRequest>
          searchProps={{
            schema: searchSchema(),
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
export default withTable(ChooseCBAMDataModal);
