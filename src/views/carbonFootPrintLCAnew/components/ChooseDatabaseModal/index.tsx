/**
 * @description 选择数据库数据
 */
import I18N from '@src/lang/I18N';
import { Modal, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTable, withTable } from 'table-render';

import { TableRender } from '@/components/x-render/TableRender';
import { CustomSearchProps } from '@/components/x-render/TableRender/types';

import { columns } from './columns';
import style from './index.module.less';
import { searchSchema } from './schemas';
import { getChooseDatabaseList } from './service';
import { DatabaseRequest, LcaFactor } from './type';
import { useLcaDbList } from '../../hook';

interface ChooseDatabaseModalProps {
  /** 弹窗显隐 */
  open: boolean;
  /** 目标与范围里选中的数据库 */
  selectedDb?: string;
  /** 输入输出名称 */
  ioName?: string;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
  /** 点击确定按钮的方法 */
  handleOk: (data?: {
    selectRows?: LcaFactor[];
    selectedRowKeys?: React.Key[];
  }) => void;
}

const ChooseDatabaseModal = ({
  open,
  selectedDb = '',
  ioName,
  handleCancel,
  handleOk,
}: ChooseDatabaseModalProps) => {
  const { form } = useTable();

  /** 数据库列表 */
  const lcaDbList = useLcaDbList();

  /** 表格选中项 */
  const [selectRows, setSelectRows] = useState<LcaFactor[]>();

  /** 选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 是否禁用 */
  const disabled = selectedRowKeys.length === 0;

  useEffect(() => {
    form.setValues({
      likeFactorName: ioName,
    });
  }, [ioName]);

  /** 选中表格 */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: LcaFactor[],
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectRows(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const searchApi: CustomSearchProps<LcaFactor, DatabaseRequest> = args =>
    getChooseDatabaseList({
      ...args,
      selectedDb,
    }).then(({ data }) => data?.data || []);

  return (
    <Modal
      wrapClassName={style.wrapper}
      centered
      title={I18N.carbonFootPrintLCA.selectDatabase}
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
        <TableRender<LcaFactor, DatabaseRequest>
          searchProps={{
            schema: searchSchema({ databaseOption: lcaDbList }),
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
            scroll: { x: 1400, y: 500 },
          }}
          autoFixNoText
        />
      </div>
    </Modal>
  );
};
export default withTable(ChooseDatabaseModal);
