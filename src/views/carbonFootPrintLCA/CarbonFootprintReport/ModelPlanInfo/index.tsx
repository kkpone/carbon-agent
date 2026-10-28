/**
 * @description 选择评价方法弹窗
 */
import { Button, Modal } from 'antd';
import { FC, useState } from 'react';
import { withTable } from 'table-render';

import { TableRender } from '@/components/x-render/TableRender';
import { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { useOrgs, useAllEnumsBatch } from '@/hooks';
import I18N from '@/lang/I18N';
import { handleAssessmentProposalOptions } from '@/utils';

import { modelPlanColumns } from './columns';
import { modelPlanSearchSchema } from './searchSchema';
import { getReportSchemeAssessmentListApi } from '../service';
import { AssessmentRequest, AssessmentResp } from '../type';

type ModelPlanInfoProps = {
  /** 弹窗显隐 */
  open: boolean;
  /** 确定按钮loading */
  confirmLoading: boolean;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
  /** 点击确定按钮的方法 */
  handleOk: (data?: {
    selectRows?: AssessmentResp[];
    selectedRowKeys?: React.Key[];
  }) => void;
};

const ModelPlanInfo: FC<ModelPlanInfoProps> = ({
  open,
  confirmLoading,
  handleCancel,
  handleOk,
}) => {
  const enumOptions = useAllEnumsBatch('AssessmentProposal');

  /** lca评价方法 */
  const assessmentMethodOptions = handleAssessmentProposalOptions(
    enumOptions?.AssessmentProposal || [],
  );

  /** 所属组织枚举 */
  const orgList = useOrgs();

  /** 设置选择的数据 */
  const [selectRows, setSelectRows] = useState<AssessmentResp[]>([]);

  /** 选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 是否禁用 */
  const disabled = selectedRowKeys.length === 0;

  /** 选中表格 */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: AssessmentResp[],
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
    AssessmentResp,
    AssessmentRequest
  > = args =>
    getReportSchemeAssessmentListApi(args).then(({ data }) => data?.data);

  return (
    <Modal
      title={I18N.certificationReviewCenter.selectEvaluator}
      open={open}
      width='70%'
      centered
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
          loading={confirmLoading}
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
      <TableRender<AssessmentResp, AssessmentRequest>
        searchProps={{
          schema: modelPlanSearchSchema({
            orgList,
            assessmentMethodOptions,
          }),
          api: searchApi,
        }}
        tableProps={{
          columns: modelPlanColumns(),
          scroll: { x: 1600, y: 300 },
          rowSelection: {
            type: 'radio',
            columnWidth: 48,
            ...rowSelection,
          },
          rowKey: 'id',
        }}
        autoAddIndexColumn
        autoFixNoText
      />
    </Modal>
  );
};

export default withTable(ModelPlanInfo);
