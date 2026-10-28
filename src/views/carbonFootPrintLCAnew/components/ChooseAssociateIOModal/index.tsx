/**
 * @description 选择关联输出/输入
 */
import I18N from '@src/lang/I18N';
import { Modal, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTable, withTable } from 'table-render';

import { TableRender } from '@/components/x-render/TableRender';
import { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { AssociationIo } from '@/views/carbonFootPrintLCAnew/components/ProcessManageDrawer/type';

import { columns } from './columns';
import style from './index.module.less';
import { searchSchema } from './schemas';
import { getChooseIOList } from '../../CarbonFootprintModel/service';
import {
  ChooseIOListRequest,
  OptionsType,
} from '../../CarbonFootprintModel/type';
import { PROCESS_CATEGORY } from '../ProcessManageTable/constant';

interface ChooseAssociateIOModalProps {
  /** 弹窗显隐 */
  open: boolean;
  /** 类别:1 输入; 2 输出; 3 产品 */
  categoryType?: number;
  /** 弹窗类型 */
  iOModalType?: 'process' | 'modal';
  /** 模型id */
  modelId?: number;
  /** 输入输出名称 */
  ioName?: string;
  /** 选中的过程的模型id */
  selectedProcessModelId?: number;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
  /** 点击确定按钮的方法 */
  handleOk: (data?: {
    selectRows?: AssociationIo[];
    selectedRowKeys?: React.Key[];
  }) => void;
  /** 生命周期阶段option */
  lifeCycleList?: OptionsType[];
  /** 研究对象option */
  researchObjectOption?: OptionsType[];
}

const { INPUT, OUTPUT } = PROCESS_CATEGORY;

const ChooseAssociateIOModal = ({
  open,
  categoryType,
  iOModalType,
  modelId = 0,
  selectedProcessModelId = 0,
  ioName,
  handleCancel,
  handleOk,
  lifeCycleList,
  researchObjectOption,
}: ChooseAssociateIOModalProps) => {
  const { form } = useTable();

  /** 类别是否是输入 */
  const isInput = categoryType === INPUT;

  /** 表格选中项 */
  const [selectRows, setSelectRows] = useState<AssociationIo[]>();

  /** 选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 是否禁用 */
  const disabled = selectedRowKeys.length === 0;

  useEffect(() => {
    form.setValues({
      likeIoName: ioName,
    });
  }, [ioName]);

  /** 选中表格 */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: AssociationIo[],
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
    AssociationIo,
    ChooseIOListRequest
  > = args =>
    getChooseIOList({
      ...args,
      modelId: iOModalType === 'process' ? selectedProcessModelId : modelId,
      ioType: isInput ? OUTPUT : INPUT,
    }).then(({ data }) => data?.data);

  return (
    <Modal
      wrapClassName={style.wrapper}
      centered
      title={
        isInput
          ? I18N.carbonFootPrintLCA.selectAssociatedInput2
          : I18N.carbonFootPrintLCA.selectAssociatedInput
      }
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
        <TableRender<AssociationIo, ChooseIOListRequest>
          searchProps={{
            schema: searchSchema({
              categoryType,
              lifeCycleList,
              researchObjectOption,
            }),
            api: searchApi,
            searchOnMount: false,
          }}
          tableProps={{
            columns: columns({ categoryType }),
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
export default withTable(ChooseAssociateIOModal);
