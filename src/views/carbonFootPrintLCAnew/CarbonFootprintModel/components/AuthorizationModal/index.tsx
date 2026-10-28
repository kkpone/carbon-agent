/**
 * @description 数据授权弹窗
 */

import {
  Form,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { FC, useEffect, useMemo } from 'react';

import { FormilySelectableTable } from '@/components/formily/SelectableTable';
import { modelFooterBtnStyle } from '@/utils';

import style from './index.module.less';
import { authorizationSchema } from './schema';
import { getImpactAssessmentList } from '../../service';
import { ModelAuthRequest } from '../../type';

export interface AuthorizationModelInfo {
  modelName?: string;
  productName?: string;
  modelCode?: string;
}

interface ModelAuthProps {
  applyType: number;
  assessmentId: number[];
  supplierId: number;
}

type AuthorizationModalProps = {
  /** 模型ID */
  modelId: number;
  /** 列表带过来的信息 */
  modelInfo: AuthorizationModelInfo;
  /** 控制弹窗显隐 */
  open: boolean;
  /** 确认按钮的loading */
  confirmLoading: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: ModelAuthRequest) => void;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormLayout,
    Select,
    FormilySelectableTable,
    Radio,
  },
});

export const AuthorizationModal: FC<AuthorizationModalProps> = ({
  modelId,
  modelInfo,
  open,
  confirmLoading = false,
  onCancel,
  onOk,
}) => {
  /** 数据请求类型枚举值 */
  const applyTypeEnums: any[] = [];

  /** 供应商商户列表-客户&启用 */
  const supplyList: any[] = [];

  const form = useMemo(
    () =>
      createForm({
        initialValues: modelInfo,
      }),
    [open],
  );

  /** 设置枚举值 */
  useEffect(() => {
    if (applyTypeEnums) {
      form.setFieldState('applyType', {
        dataSource: applyTypeEnums.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    }

    if (supplyList) {
      form.setFieldState('supplierId', {
        dataSource: supplyList.map(item => ({
          label: item.supplierName,
          value: item.id,
          uniqueCode: item.uniqueCode,
        })),
      });
    }
  }, [applyTypeEnums, supplyList, open]);

  useEffect(() => {
    if (modelId) {
      getImpactAssessmentList({ modelId }).then(({ data }) => {
        const list = data?.data || [];
        const planList = list?.map(item => ({
          id: item?.id,
          planName: item?.planName,
          assessmentMethod: item?.assessmentMethod,
          assessmentMethodName: item?.assessmentMethodName,
          assessmentTargetList: item?.assessmentTargetList,
          assessmentTargetNames: item?.assessmentTargetNames,
        }));
        form.setFieldState('assessmentId', {
          dataSource: planList,
        });
      });
    }
  }, [modelId]);

  return (
    <Modal
      title={I18N.carbonFootPrintLCA.numberOfProductEnvironments}
      open={open}
      maskClosable={false}
      width={550}
      confirmLoading={confirmLoading}
      onOk={async () => {
        const formValues = await form.submit<ModelAuthProps>();
        const { supplierId, applyType, assessmentId } = formValues;
        const supplyRow = supplyList?.filter(
          supply => supply.id === supplierId,
        );

        const values = {
          applyType,
          assessmentId: assessmentId?.[0],
          modelId,
          supplierId,
          uniqueCode: supplyRow?.[0]?.uniqueCode,
        };

        onOk(values);
      }}
      onCancel={onCancel}
      {...modelFooterBtnStyle}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <div className={style.tip}>
        {I18N.carbonFootPrintLCA.authorizationMes1}
        <span className={style.tipBold}>
          {I18N.carbonFootPrintLCA.authorizationMes2}
        </span>
        {I18N.carbonFootPrintLCA.authorizationMes3}
        <span className={style.tipBold}>
          {I18N.carbonFootPrintLCA.authorizationMes4}
        </span>
        {I18N.carbonFootPrintLCA.authorizationMes5}
      </div>
      <div className={style.authWrapper}>
        <Form form={form} previewTextPlaceholder='-'>
          <SchemaField schema={authorizationSchema()} />
        </Form>
      </div>
    </Modal>
  );
};
